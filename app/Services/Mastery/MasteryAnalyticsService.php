<?php

namespace App\Services\Mastery;

use App\Models\Concept;
use App\Models\StudentConceptMastery;
use App\Models\StudentProfile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Read-only reporting over the ability model.
 *
 * Separate from ConceptMasteryService, which owns writes: this class never
 * mutates an estimate, so it can be called freely from dashboards without any
 * risk of a page view changing a student's mastery.
 *
 * Every figure here is aggregate-first. A class dashboard reads hundreds of
 * students' rows, so the queries group in SQL rather than pulling rows into PHP
 * and folding them there.
 */
class MasteryAnalyticsService
{
    public function __construct(private readonly ConceptMasteryService $mastery) {}

    /**
     * One student's full picture, shaped for the student-facing report.
     *
     * @return array{
     *     concepts: Collection,
     *     overall: ?float,
     *     gain: ?float,
     *     strengths: Collection,
     *     weaknesses: Collection,
     *     has_baseline: bool,
     *     evidence_count: int
     * }
     */
    public function studentReport(StudentProfile $student): array
    {
        $rows = $this->mastery->getProfile($student);

        $concepts = $rows->map(fn (StudentConceptMastery $row) => [
            'concept_id' => $row->concept_id,
            'slug' => $row->concept?->slug,
            'name' => $row->concept?->name ?? 'Unknown concept',
            'description' => $row->concept?->description,
            'mastery' => round((float) $row->mastery, 4),
            'baseline' => $row->initial_mastery !== null
                ? round((float) $row->initial_mastery, 4)
                : null,
            'gain' => $row->gain,
            'confidence' => round((float) $row->confidence, 4),
            'attempts' => (int) $row->attempts,
            'correct' => (int) $row->correct,
            // Reportable drives the UI's "not enough data yet" state. Without
            // it a single unlucky answer reads as a diagnosed weakness.
            'reportable' => $row->isReportable(),
            'status' => $this->statusFor($row),
        ]);

        $reportable = $concepts->where('reportable', true);

        return [
            'concepts' => $concepts->values(),
            'overall' => $this->mastery->getOverallMastery($student),
            'gain' => $this->mastery->getLearningGain($student),
            'strengths' => $reportable
                ->where('status', 'mastered')
                ->sortByDesc('mastery')
                ->take(3)
                ->values(),
            'weaknesses' => $reportable
                ->where('status', 'weak')
                ->sortBy('mastery')
                ->take(3)
                ->values(),
            'has_baseline' => $concepts->contains(fn ($c) => $c['baseline'] !== null),
            'evidence_count' => (int) $concepts->sum('attempts'),
        ];
    }

    /**
     * Cohort view: average mastery per concept across all students who have
     * practised it.
     *
     * Concepts nobody has attempted are reported with a null average rather than
     * 0.0 — "no data" and "everyone is failing" must not look the same on a
     * teacher's dashboard, since they call for opposite responses.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function cohortByConcept(): Collection
    {
        $stats = StudentConceptMastery::query()
            ->where('attempts', '>', 0)
            ->groupBy('concept_id')
            ->select(
                'concept_id',
                DB::raw('AVG(mastery) as avg_mastery'),
                DB::raw('COUNT(*) as learners'),
                DB::raw('SUM(attempts) as total_attempts'),
                DB::raw('SUM(correct) as total_correct'),
                DB::raw('SUM(CASE WHEN mastery < '.$this->weakThreshold().' THEN 1 ELSE 0 END) as struggling')
            )
            ->get()
            ->keyBy('concept_id');

        return Concept::ordered()->get()->map(function (Concept $concept) use ($stats) {
            $row = $stats->get($concept->concept_id);

            return [
                'concept_id' => $concept->concept_id,
                'slug' => $concept->slug,
                'name' => $concept->name,
                'avg_mastery' => $row ? round((float) $row->avg_mastery, 4) : null,
                'learners' => $row ? (int) $row->learners : 0,
                'struggling' => $row ? (int) $row->struggling : 0,
                'total_attempts' => $row ? (int) $row->total_attempts : 0,
                'accuracy' => $row && $row->total_attempts > 0
                    ? round($row->total_correct / $row->total_attempts, 4)
                    : null,
            ];
        })->values();
    }

    /**
     * Students who need attention, worst first.
     *
     * Ranked by how many concepts they are weak in rather than by average
     * mastery: a student failing four topics needs help more urgently than one
     * sitting slightly below average everywhere.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function studentsNeedingAttention(int $limit = 10): Collection
    {
        $weak = StudentConceptMastery::query()
            ->where('confidence', '>=', $this->minConfidence())
            ->where('mastery', '<', $this->weakThreshold())
            ->groupBy('student_id')
            ->select(
                'student_id',
                DB::raw('COUNT(*) as weak_count'),
                DB::raw('AVG(mastery) as avg_weak_mastery')
            )
            ->orderByDesc('weak_count')
            ->orderBy('avg_weak_mastery')
            ->limit($limit)
            ->get();

        if ($weak->isEmpty()) {
            return collect();
        }

        $profiles = StudentProfile::query()
            ->with('user:user_Id,name')
            ->whereIn('student_id', $weak->pluck('student_id'))
            ->get()
            ->keyBy('student_id');

        return $weak->map(function ($row) use ($profiles) {
            $profile = $profiles->get($row->student_id);

            return [
                'student_id' => (int) $row->student_id,
                'name' => $profile?->user?->name ?? 'Unknown learner',
                'weak_concepts' => (int) $row->weak_count,
                'avg_weak_mastery' => round((float) $row->avg_weak_mastery, 4),
            ];
        })->values();
    }

    /**
     * Platform-level effectiveness summary.
     *
     * The headline is `avg_gain`: mean improvement over each student's own
     * placement baseline, across concepts they actually practised. It is the
     * one number that answers "is this platform working", so the caveats it
     * carries — practised-only, baseline-relative — are baked into the query
     * rather than left to the caller.
     *
     * @return array<string, mixed>
     */
    public function effectivenessSummary(): array
    {
        $tracked = StudentConceptMastery::query()
            ->distinct('student_id')
            ->count('student_id');

        $withEvidence = StudentConceptMastery::query()
            ->where('attempts', '>', 0)
            ->distinct('student_id')
            ->count('student_id');

        // Per-student gain first, then averaged, so a student with many
        // practised concepts does not outweigh one with few.
        //
        // Queried through the query builder rather than Eloquent, and aliased
        // `avg_gain` rather than `gain`: StudentConceptMastery has a getGainAttribute()
        // accessor, and on a hydrated model that accessor shadows a same-named
        // SQL alias — returning null here because initial_mastery is not selected.
        $perStudent = DB::table('student_concept_mastery')
            ->whereNotNull('initial_mastery')
            ->where('attempts', '>', 0)
            ->groupBy('student_id')
            ->select(
                'student_id',
                DB::raw('AVG(mastery) - AVG(initial_mastery) as avg_gain')
            )
            ->get();

        $improved = $perStudent->filter(fn ($r) => (float) $r->avg_gain > 0)->count();

        return [
            'students_tracked' => $tracked,
            'students_with_evidence' => $withEvidence,
            'students_measured' => $perStudent->count(),
            'students_improved' => $improved,
            'avg_gain' => $perStudent->isNotEmpty()
                ? round((float) $perStudent->avg('avg_gain'), 4)
                : null,
            'total_evidence' => (int) StudentConceptMastery::sum('attempts'),
        ];
    }

    /**
     * Classify a concept for display.
     *
     * Returns 'insufficient' when the evidence is too thin to judge, which the
     * UI must render differently from a genuine weakness.
     */
    private function statusFor(StudentConceptMastery $row): string
    {
        if (! $row->isReportable()) {
            return 'insufficient';
        }

        if ($row->mastery >= $this->masteredThreshold()) {
            return 'mastered';
        }

        if ($row->mastery < $this->weakThreshold()) {
            return 'weak';
        }

        return 'developing';
    }

    private function weakThreshold(): float
    {
        return (float) config('mastery.weak_concept_threshold');
    }

    private function masteredThreshold(): float
    {
        return (float) config('mastery.mastered_threshold');
    }

    private function minConfidence(): float
    {
        return (float) config('mastery.min_confidence_to_report');
    }
}
