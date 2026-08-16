<?php

namespace App\Services\Mastery;

use App\Models\Concept;
use App\Models\ExerciseSubmission;
use App\Models\MasteryProcessedSubmission;
use App\Models\StudentConceptMastery;
use App\Models\StudentProfile;
use App\Models\TestSubmission;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Owns the student ability model: reads submissions, runs them through BKT, and
 * persists the result.
 *
 * Writes follow the same discipline as the points economy (see
 * RewardPurchaseService): every mastery update runs inside a transaction with
 * lockForUpdate() on the contended row. Two submissions finishing at once would
 * otherwise both read the same prior and the second would overwrite the first,
 * silently losing evidence.
 */
class ConceptMasteryService
{
    /** Retry count for the transaction on a deadlock/serialization conflict. */
    private const TRANSACTION_ATTEMPTS = 3;

    /** Ledger sources — one submission may be folded in once per source. */
    public const SOURCE_TEST = 'test';

    public const SOURCE_EXERCISE = 'exercise';

    public function __construct(
        private readonly BktEngine $engine,
        private readonly EvidenceCollector $collector,
    ) {}

    /**
     * Apply a graded test submission to the student's ability model.
     *
     * Failures are contained: knowledge tracing is an analytics side effect, and
     * a problem here must never break the student's submission flow. Returns a
     * result array rather than throwing.
     */
    public function recordTestSubmission(TestSubmission $submission): array
    {
        try {
            $student = $submission->studentProfile;

            if (! $student) {
                return $this->failure('Submission has no student profile.');
            }

            $evidence = $this->collector->fromTestSubmission($submission);

            return $this->applyEvidence($student, $evidence, [
                'source' => 'test_submission',
                'submission_id' => $submission->submission_id,
            ], self::SOURCE_TEST, (int) $submission->submission_id);
        } catch (\Throwable $e) {
            Log::error('mastery.record_test.failed', [
                'action' => 'recordTestSubmission',
                'submission_id' => $submission->submission_id ?? null,
                'error' => $e->getMessage(),
            ]);

            return $this->failure('Could not update the ability model for this submission.');
        }
    }

    /**
     * Apply an interactive exercise submission to the student's ability model.
     */
    public function recordExerciseSubmission(ExerciseSubmission $submission): array
    {
        try {
            $student = $submission->student;

            if (! $student) {
                return $this->failure('Submission has no student profile.');
            }

            $evidence = $this->collector->fromExerciseSubmission($submission);

            return $this->applyEvidence($student, $evidence, [
                'source' => 'exercise_submission',
                'submission_id' => $submission->submission_id,
            ], self::SOURCE_EXERCISE, (int) $submission->submission_id);
        } catch (\Throwable $e) {
            Log::error('mastery.record_exercise.failed', [
                'action' => 'recordExerciseSubmission',
                'submission_id' => $submission->submission_id ?? null,
                'error' => $e->getMessage(),
            ]);

            return $this->failure('Could not update the ability model for this submission.');
        }
    }

    /**
     * Freeze the student's current estimates as the placement baseline.
     *
     * Call this once, right after the placement test has been recorded. Only
     * rows whose initial_mastery is still null are touched, so calling it again
     * cannot overwrite a real baseline and destroy the learning-gain measure —
     * the whole point of the column is that it never moves.
     *
     * @return int Number of rows given a baseline.
     */
    public function snapshotAsBaseline(StudentProfile $student): int
    {
        try {
            return DB::transaction(function () use ($student) {
                $rows = StudentConceptMastery::query()
                    ->forStudent($student->student_id)
                    ->whereNull('initial_mastery')
                    ->lockForUpdate()
                    ->get();

                foreach ($rows as $row) {
                    $row->initial_mastery = $row->mastery;
                    $row->save();
                }

                Log::info('mastery.baseline.captured', [
                    'action' => 'snapshotAsBaseline',
                    'student_id' => $student->student_id,
                    'concepts' => $rows->count(),
                ]);

                return $rows->count();
            }, self::TRANSACTION_ATTEMPTS);
        } catch (\Throwable $e) {
            Log::error('mastery.baseline.failed', [
                'action' => 'snapshotAsBaseline',
                'student_id' => $student->student_id ?? null,
                'error' => $e->getMessage(),
            ]);

            return 0;
        }
    }

    /**
     * The student's full ability profile, ordered by the concept taxonomy.
     *
     * @return Collection<int, StudentConceptMastery>
     */
    public function getProfile(StudentProfile $student): Collection
    {
        // Ordered in SQL via the concepts join rather than sorting the
        // collection in PHP: a class-wide dashboard reads many students' rows,
        // and an in-memory sort per student turns that into a scaling problem.
        return StudentConceptMastery::query()
            ->forStudent($student->student_id)
            ->join('concepts', 'concepts.concept_id', '=', 'student_concept_mastery.concept_id')
            ->orderBy('concepts.display_order')
            ->orderBy('concepts.name')
            ->with('concept')
            ->select('student_concept_mastery.*')
            ->get();
    }

    /**
     * Concepts the student is weak in, weakest first — the queue adaptive
     * intervention draws from.
     *
     * Only returns concepts with enough evidence behind them: telling a student
     * they are weak at loops based on one unlucky answer is worse than saying
     * nothing.
     *
     * @return Collection<int, StudentConceptMastery>
     */
    public function getWeakConcepts(StudentProfile $student, int $limit = 3): Collection
    {
        return StudentConceptMastery::query()
            ->forStudent($student->student_id)
            ->weak()
            ->with('concept')
            ->limit($limit)
            ->get();
    }

    /**
     * Concepts the student has demonstrably mastered.
     *
     * @return Collection<int, StudentConceptMastery>
     */
    public function getMasteredConcepts(StudentProfile $student): Collection
    {
        return StudentConceptMastery::query()
            ->forStudent($student->student_id)
            ->reportable()
            ->where('mastery', '>=', (float) config('mastery.mastered_threshold'))
            ->with('concept')
            ->orderByDesc('mastery')
            ->get();
    }

    /**
     * Overall ability: the mean mastery across concepts with enough evidence.
     *
     * Null when nothing is reportable yet — "we don't know" is a distinct answer
     * from "0% ability", and callers must not render them the same way.
     */
    public function getOverallMastery(StudentProfile $student): ?float
    {
        $reportable = StudentConceptMastery::query()
            ->forStudent($student->student_id)
            ->reportable()
            ->pluck('mastery');

        if ($reportable->isEmpty()) {
            return null;
        }

        return round((float) $reportable->avg(), 4);
    }

    /**
     * Learning gain since placement, over concepts the student has actually
     * practised (attempts > 0).
     *
     * The restriction matters. ensureAllConceptsTracked() gives every student a
     * row for the whole taxonomy, so averaging over all of them divides real
     * progress by the number of concepts they have not touched yet: a student
     * who took one concept from 0.30 to 0.99 would show a 5.75% gain across 12
     * concepts. That understates the platform's effect and is not what "how much
     * did this student learn" means.
     *
     * Use getLearningGainAcrossAllConcepts() for the whole-curriculum view, and
     * getLearningGainByConcept() when the caller wants to pick its own measure.
     *
     * Null when there is no baseline yet — "unknown", not "no gain".
     */
    public function getLearningGain(StudentProfile $student): ?float
    {
        $rows = StudentConceptMastery::query()
            ->forStudent($student->student_id)
            ->whereNotNull('initial_mastery')
            ->where('attempts', '>', 0)
            ->get(['mastery', 'initial_mastery']);

        if ($rows->isEmpty()) {
            return null;
        }

        return round((float) $rows->avg('mastery') - (float) $rows->avg('initial_mastery'), 4);
    }

    /**
     * Learning gain across the entire taxonomy, including concepts never
     * practised.
     *
     * Answers a different question from getLearningGain(): "how far through the
     * whole curriculum is this student", not "how much did they improve at what
     * they studied". Legitimate for a curriculum-coverage view; misleading as a
     * headline effectiveness figure.
     */
    public function getLearningGainAcrossAllConcepts(StudentProfile $student): ?float
    {
        $rows = StudentConceptMastery::query()
            ->forStudent($student->student_id)
            ->whereNotNull('initial_mastery')
            ->get(['mastery', 'initial_mastery']);

        if ($rows->isEmpty()) {
            return null;
        }

        return round((float) $rows->avg('mastery') - (float) $rows->avg('initial_mastery'), 4);
    }

    /**
     * Per-concept gain, so a caller can choose its own aggregation instead of
     * inheriting one baked into a single average.
     *
     * @return Collection<int, array{concept: Concept, mastery: float, initial_mastery: float, gain: float, attempts: int}>
     */
    public function getLearningGainByConcept(StudentProfile $student): Collection
    {
        return StudentConceptMastery::query()
            ->forStudent($student->student_id)
            ->whereNotNull('initial_mastery')
            ->with('concept')
            ->get()
            ->map(fn (StudentConceptMastery $row) => [
                'concept' => $row->concept,
                'mastery' => (float) $row->mastery,
                'initial_mastery' => (float) $row->initial_mastery,
                'gain' => (float) $row->gain,
                'attempts' => (int) $row->attempts,
            ])
            ->sortByDesc('gain')
            ->values();
    }

    /**
     * Fold a batch of evidence into the student's stored estimates.
     *
     * All of one submission's evidence is applied in a single transaction: a
     * submission is one event, and a half-applied one would leave the model in a
     * state no sequence of answers could produce.
     */
    private function applyEvidence(
        StudentProfile $student,
        Collection $evidence,
        array $context,
        ?string $ledgerSource = null,
        ?int $ledgerSubmissionId = null
    ): array {
        if ($evidence->isEmpty()) {
            // Not an error: it just means nothing on this submission was tagged
            // with a concept yet. Logged at debug so untagged content is
            // visible without filling the log during normal use.
            Log::debug('mastery.no_evidence', $context + ['student_id' => $student->student_id]);

            return [
                'success' => true,
                'updated_concepts' => 0,
                'message' => 'No concept-tagged items on this submission.',
            ];
        }

        $updated = DB::transaction(function () use ($student, $evidence, $ledgerSource, $ledgerSubmissionId) {
            // Claim this submission before touching any mastery row. The unique
            // key makes the claim fail if it was already applied, and doing it
            // inside the transaction means a rollback releases it — so a failed
            // attempt does not permanently block a legitimate retry.
            if ($ledgerSource !== null && $ledgerSubmissionId !== null
                && ! $this->claimSubmission($ledgerSource, $ledgerSubmissionId, $student)) {
                return null;
            }

            $touched = [];

            // Group by concept so each row is locked and written once per
            // submission, however many tagged items pointed at it.
            foreach ($evidence->groupBy('conceptId') as $conceptId => $items) {
                $row = $this->lockOrCreateRow($student, (int) $conceptId);

                $mastery = (float) $row->mastery;
                $correctCount = 0;

                foreach ($items as $item) {
                    $mastery = $this->engine->update(
                        prior: $mastery,
                        isCorrect: $item->isCorrect,
                        difficultyLevel: $item->difficultyLevel,
                        questionType: $item->itemType,
                        weight: $item->weight,
                    );

                    if ($item->isCorrect) {
                        $correctCount++;
                    }
                }

                $row->mastery = $mastery;
                $row->attempts += $items->count();
                $row->correct += $correctCount;
                $row->confidence = $this->engine->confidenceFor($row->attempts);
                $row->last_evidence_at = now();
                $row->save();

                $touched[] = (int) $conceptId;
            }

            return $touched;
        }, self::TRANSACTION_ATTEMPTS);

        // Null means the ledger already held this submission. Treated as a
        // success: the evidence IS applied, just not by this call. A page
        // refresh or a queue retry lands here, and must be a no-op rather than
        // an error the caller has to handle.
        if ($updated === null) {
            Log::info('mastery.already_applied', $context + ['student_id' => $student->student_id]);

            return [
                'success' => true,
                'updated_concepts' => 0,
                'already_applied' => true,
                'message' => 'This submission was already applied to the ability model.',
            ];
        }

        Log::info('mastery.updated', $context + [
            'student_id' => $student->student_id,
            'concepts' => count($updated),
            'evidence_items' => $evidence->count(),
        ]);

        return [
            'success' => true,
            'updated_concepts' => count($updated),
            'concept_ids' => $updated,
            'message' => 'Ability model updated.',
        ];
    }

    /**
     * Record that this submission's evidence is being applied.
     *
     * Returns false if it was already applied. Relies on the unique index doing
     * the arbitration rather than a read-then-write check, which would race
     * between two concurrent submissions of the same id.
     */
    private function claimSubmission(string $source, int $submissionId, StudentProfile $student): bool
    {
        try {
            MasteryProcessedSubmission::create([
                'source' => $source,
                'submission_id' => $submissionId,
                'student_id' => $student->student_id,
                'processed_at' => now(),
            ]);

            return true;
        } catch (QueryException $e) {
            // Unique violation = already claimed. Any other query error is a
            // real problem and must not be silently swallowed as "duplicate".
            if ($this->isUniqueViolation($e)) {
                return false;
            }

            throw $e;
        }
    }

    /**
     * SQLSTATE 23000/23505 covers unique/integrity violations across the three
     * connections this app runs on (MySQL dev, SQLite tests, SQLite deploy).
     */
    private function isUniqueViolation(QueryException $e): bool
    {
        return in_array($e->getCode(), ['23000', '23505'], true);
    }

    /**
     * Fetch the student's row for a concept with a write lock, creating it at
     * the model's prior if this is their first encounter.
     *
     * firstOrCreate then lockForUpdate, rather than a plain create: two
     * concurrent submissions touching a brand-new concept would otherwise race
     * on the insert and hit the unique constraint.
     */
    private function lockOrCreateRow(StudentProfile $student, int $conceptId): StudentConceptMastery
    {
        StudentConceptMastery::firstOrCreate(
            [
                'student_id' => $student->student_id,
                'concept_id' => $conceptId,
            ],
            [
                'mastery' => $this->engine->initialMastery(),
                'confidence' => 0.0,
                'attempts' => 0,
                'correct' => 0,
            ]
        );

        return StudentConceptMastery::query()
            ->where('student_id', $student->student_id)
            ->where('concept_id', $conceptId)
            ->lockForUpdate()
            ->firstOrFail();
    }

    /**
     * Ensure the student has a row for every concept, so a placement baseline
     * covers the whole taxonomy rather than only what they happened to be asked.
     *
     * @return int Number of rows created.
     */
    public function ensureAllConceptsTracked(StudentProfile $student): int
    {
        $existing = StudentConceptMastery::query()
            ->forStudent($student->student_id)
            ->pluck('concept_id')
            ->all();

        // whereNotIn with an empty array already matches every row, so no
        // placeholder value is needed here.
        $missing = Concept::query()
            ->when($existing !== [], fn ($q) => $q->whereNotIn('concept_id', $existing))
            ->pluck('concept_id');

        foreach ($missing as $conceptId) {
            StudentConceptMastery::firstOrCreate(
                [
                    'student_id' => $student->student_id,
                    'concept_id' => $conceptId,
                ],
                [
                    'mastery' => $this->engine->initialMastery(),
                    'confidence' => 0.0,
                    'attempts' => 0,
                    'correct' => 0,
                ]
            );
        }

        return $missing->count();
    }

    private function failure(string $message): array
    {
        return [
            'success' => false,
            'updated_concepts' => 0,
            'message' => $message,
        ];
    }
}
