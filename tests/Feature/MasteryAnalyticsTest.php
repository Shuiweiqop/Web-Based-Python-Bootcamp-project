<?php

namespace Tests\Feature;

use App\Models\Concept;
use App\Models\StudentConceptMastery;
use App\Models\StudentProfile;
use App\Models\User;
use App\Services\Mastery\MasteryAnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tests the reporting layer over the ability model.
 *
 * The recurring theme: "no data" must never be presented as "bad". A concept
 * nobody has practised and a concept everyone is failing call for opposite
 * responses from a teacher, so they must not render the same way.
 */
class MasteryAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private MasteryAnalyticsService $analytics;

    protected function setUp(): void
    {
        parent::setUp();
        $this->analytics = app(MasteryAnalyticsService::class);
    }

    private function makeStudent(): StudentProfile
    {
        return User::factory()->student()->create()->studentProfile;
    }

    private function makeConcept(string $slug, int $order = 10): Concept
    {
        return Concept::create(['slug' => $slug, 'name' => ucfirst($slug), 'display_order' => $order]);
    }

    private function mastery(StudentProfile $student, Concept $concept, array $attrs = []): StudentConceptMastery
    {
        return StudentConceptMastery::create(array_merge([
            'student_id' => $student->student_id,
            'concept_id' => $concept->concept_id,
            'mastery' => 0.50,
            'confidence' => 0.80,
            'attempts' => 10,
            'correct' => 5,
        ], $attrs));
    }

    // ==================== Student report ====================

    public function test_student_report_classifies_concepts_by_status(): void
    {
        $student = $this->makeStudent();

        $this->mastery($student, $this->makeConcept('strong', 10), ['mastery' => 0.92]);
        $this->mastery($student, $this->makeConcept('middling', 20), ['mastery' => 0.70]);
        $this->mastery($student, $this->makeConcept('poor', 30), ['mastery' => 0.30]);

        $report = $this->analytics->studentReport($student);
        $byName = $report['concepts']->keyBy('slug');

        $this->assertSame('mastered', $byName['strong']['status']);
        $this->assertSame('developing', $byName['middling']['status']);
        $this->assertSame('weak', $byName['poor']['status']);
    }

    /**
     * The guard that stops the UI telling a student they are bad at something
     * measured once.
     */
    public function test_thin_evidence_is_reported_as_insufficient_not_weak(): void
    {
        $student = $this->makeStudent();
        $this->mastery($student, $this->makeConcept('barely_tried'), [
            'mastery' => 0.20,
            'confidence' => 0.10,
            'attempts' => 1,
            'correct' => 0,
        ]);

        $report = $this->analytics->studentReport($student);

        $this->assertSame('insufficient', $report['concepts']->first()['status']);
        $this->assertCount(0, $report['weaknesses'], 'Thin evidence must not become a diagnosed weakness.');
    }

    public function test_student_report_surfaces_top_strengths_and_weaknesses(): void
    {
        $student = $this->makeStudent();

        foreach ([['a', 0.95], ['b', 0.90], ['c', 0.20], ['d', 0.35]] as $i => [$slug, $m]) {
            $this->mastery($student, $this->makeConcept($slug, ($i + 1) * 10), ['mastery' => $m]);
        }

        $report = $this->analytics->studentReport($student);

        $this->assertSame(['a', 'b'], $report['strengths']->pluck('slug')->all());
        $this->assertSame(['c', 'd'], $report['weaknesses']->pluck('slug')->all());
    }

    public function test_student_report_is_empty_but_valid_without_evidence(): void
    {
        $student = $this->makeStudent();
        $this->makeConcept('untouched');

        $report = $this->analytics->studentReport($student);

        $this->assertSame(0, $report['evidence_count']);
        $this->assertNull($report['overall']);
        $this->assertNull($report['gain']);
        $this->assertFalse($report['has_baseline']);
    }

    public function test_student_report_exposes_gain_against_the_baseline(): void
    {
        $student = $this->makeStudent();
        $this->mastery($student, $this->makeConcept('loops'), [
            'mastery' => 0.85,
            'initial_mastery' => 0.30,
        ]);

        $report = $this->analytics->studentReport($student);

        $this->assertTrue($report['has_baseline']);
        $this->assertEqualsWithDelta(0.55, $report['concepts']->first()['gain'], 0.0001);
        $this->assertEqualsWithDelta(0.55, $report['gain'], 0.0001);
    }

    // ==================== Cohort view ====================

    public function test_cohort_averages_mastery_per_concept(): void
    {
        $concept = $this->makeConcept('loops');

        foreach ([0.20, 0.60, 1.00] as $m) {
            $this->mastery($this->makeStudent(), $concept, ['mastery' => $m]);
        }

        $row = $this->analytics->cohortByConcept()->firstWhere('slug', 'loops');

        $this->assertEqualsWithDelta(0.60, $row['avg_mastery'], 0.0001);
        $this->assertSame(3, $row['learners']);
        $this->assertSame(1, $row['struggling'], 'Only the 0.20 learner is below the weak threshold.');
    }

    /**
     * A concept nobody has practised must report null, not 0.0 — otherwise a
     * teacher reads "everyone is failing this" when the truth is "nobody has
     * reached it yet".
     */
    public function test_unpractised_concept_reports_null_average_not_zero(): void
    {
        $this->makeConcept('file_io');

        $row = $this->analytics->cohortByConcept()->firstWhere('slug', 'file_io');

        $this->assertNull($row['avg_mastery']);
        $this->assertNull($row['accuracy']);
        $this->assertSame(0, $row['learners']);
    }

    public function test_cohort_excludes_rows_with_no_attempts_from_the_average(): void
    {
        $concept = $this->makeConcept('loops');

        $this->mastery($this->makeStudent(), $concept, ['mastery' => 0.90]);
        // Tracked but never practised: sits at the prior and would drag the
        // cohort average down toward it if counted.
        $this->mastery($this->makeStudent(), $concept, [
            'mastery' => 0.30,
            'attempts' => 0,
            'correct' => 0,
            'confidence' => 0.0,
        ]);

        $row = $this->analytics->cohortByConcept()->firstWhere('slug', 'loops');

        $this->assertEqualsWithDelta(0.90, $row['avg_mastery'], 0.0001);
        $this->assertSame(1, $row['learners']);
    }

    public function test_cohort_lists_every_concept_in_taxonomy_order(): void
    {
        $this->makeConcept('third', 30);
        $this->makeConcept('first', 10);
        $this->makeConcept('second', 20);

        $slugs = $this->analytics->cohortByConcept()->pluck('slug')->all();

        $this->assertSame(['first', 'second', 'third'], $slugs);
    }

    // ==================== At-risk students ====================

    public function test_at_risk_ranks_by_number_of_weak_concepts(): void
    {
        $manyWeak = $this->makeStudent();
        $oneWeak = $this->makeStudent();

        foreach ([['a', 10], ['b', 20], ['c', 30]] as [$slug, $order]) {
            $concept = $this->makeConcept($slug, $order);
            $this->mastery($manyWeak, $concept, ['mastery' => 0.40]);
        }

        $this->mastery($oneWeak, $this->makeConcept('d', 40), ['mastery' => 0.20]);

        $atRisk = $this->analytics->studentsNeedingAttention();

        // Three weak topics outranks one lower score: breadth of struggle is
        // the more urgent signal.
        $this->assertSame($manyWeak->student_id, $atRisk->first()['student_id']);
        $this->assertSame(3, $atRisk->first()['weak_concepts']);
    }

    public function test_at_risk_ignores_low_confidence_rows(): void
    {
        $student = $this->makeStudent();
        $this->mastery($student, $this->makeConcept('barely_tried'), [
            'mastery' => 0.10,
            'confidence' => 0.10,
            'attempts' => 1,
        ]);

        $this->assertCount(0, $this->analytics->studentsNeedingAttention());
    }

    public function test_at_risk_is_empty_without_data(): void
    {
        $this->assertCount(0, $this->analytics->studentsNeedingAttention());
    }

    // ==================== Effectiveness summary ====================

    public function test_effectiveness_summary_averages_gain_per_student(): void
    {
        $concept = $this->makeConcept('loops');
        $other = $this->makeConcept('lists', 20);

        $improver = $this->makeStudent();
        $this->mastery($improver, $concept, ['mastery' => 0.80, 'initial_mastery' => 0.30]);
        $this->mastery($improver, $other, ['mastery' => 0.70, 'initial_mastery' => 0.30]);

        $flat = $this->makeStudent();
        $this->mastery($flat, $concept, ['mastery' => 0.30, 'initial_mastery' => 0.30]);

        $summary = $this->analytics->effectivenessSummary();

        $this->assertSame(2, $summary['students_measured']);
        $this->assertSame(1, $summary['students_improved']);
        // (0.45 + 0.00) / 2 — per-student first, so the two-concept student
        // does not outweigh the one-concept student.
        $this->assertEqualsWithDelta(0.225, $summary['avg_gain'], 0.0001);
    }

    public function test_effectiveness_summary_is_null_safe_when_empty(): void
    {
        $summary = $this->analytics->effectivenessSummary();

        $this->assertSame(0, $summary['students_tracked']);
        $this->assertNull($summary['avg_gain']);
    }
}
