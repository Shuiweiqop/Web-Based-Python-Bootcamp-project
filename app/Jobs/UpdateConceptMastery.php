<?php

namespace App\Jobs;

use App\Models\ExerciseSubmission;
use App\Models\StudentProfile;
use App\Models\TestSubmission;
use App\Services\Mastery\ConceptMasteryService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

/**
 * Folds one submission into the student's ability model, off the request path.
 *
 * Queued because knowledge tracing is an analytics side effect: the student's
 * grade and points are already final by the time this runs, so it must never
 * slow down or break the submission response. Under QUEUE_CONNECTION=sync
 * (the demo deployment) it simply runs inline, which is fine at demo scale.
 *
 * Dispatch AFTER the enclosing transaction commits — the job resolves the
 * submission by id, so an uncommitted row would not be visible to it.
 */
class UpdateConceptMastery implements ShouldQueue
{
    use Queueable;

    public const SOURCE_TEST = 'test';

    public const SOURCE_EXERCISE = 'exercise';

    public const SOURCE_PLACEMENT = 'placement';

    /**
     * @param  string  $source  One of the SOURCE_* constants.
     * @param  int|null  $submissionId  Submission to read evidence from; null for placement.
     * @param  int|null  $studentId  Required for the placement baseline.
     */
    public function __construct(
        private readonly string $source,
        private readonly ?int $submissionId = null,
        private readonly ?int $studentId = null,
    ) {}

    public static function forTest(int $submissionId): self
    {
        return new self(self::SOURCE_TEST, $submissionId);
    }

    public static function forExercise(int $submissionId): self
    {
        return new self(self::SOURCE_EXERCISE, $submissionId);
    }

    /**
     * Placement: seed a row for every concept, apply the placement answers, then
     * freeze the result as the baseline every later learning-gain figure is
     * measured against.
     */
    public static function forPlacement(int $studentId, int $submissionId): self
    {
        return new self(self::SOURCE_PLACEMENT, $submissionId, $studentId);
    }

    public function handle(ConceptMasteryService $service): void
    {
        try {
            match ($this->source) {
                self::SOURCE_TEST => $this->handleTest($service),
                self::SOURCE_EXERCISE => $this->handleExercise($service),
                self::SOURCE_PLACEMENT => $this->handlePlacement($service),
                default => Log::warning('mastery.job.unknown_source', ['source' => $this->source]),
            };
        } catch (\Throwable $e) {
            // The service already contains its own failures; this is the last
            // net so a queue worker never dies over an analytics update.
            Log::error('mastery.job.failed', [
                'action' => 'UpdateConceptMastery',
                'source' => $this->source,
                'submission_id' => $this->submissionId,
                'student_id' => $this->studentId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function handleTest(ConceptMasteryService $service): void
    {
        $submission = TestSubmission::find($this->submissionId);

        if (! $submission) {
            Log::warning('mastery.job.submission_missing', [
                'source' => $this->source,
                'submission_id' => $this->submissionId,
            ]);

            return;
        }

        $service->recordTestSubmission($submission);
    }

    private function handleExercise(ConceptMasteryService $service): void
    {
        $submission = ExerciseSubmission::find($this->submissionId);

        if (! $submission) {
            Log::warning('mastery.job.submission_missing', [
                'source' => $this->source,
                'submission_id' => $this->submissionId,
            ]);

            return;
        }

        $service->recordExerciseSubmission($submission);
    }

    private function handlePlacement(ConceptMasteryService $service): void
    {
        $student = StudentProfile::find($this->studentId);

        if (! $student) {
            Log::warning('mastery.job.student_missing', [
                'source' => $this->source,
                'student_id' => $this->studentId,
            ]);

            return;
        }

        // Cover the whole taxonomy, not just the concepts the placement test
        // happened to ask about — otherwise a concept first met later would have
        // no baseline and would be excluded from learning-gain forever.
        $service->ensureAllConceptsTracked($student);

        if ($this->submissionId) {
            $submission = TestSubmission::find($this->submissionId);

            if ($submission) {
                $service->recordTestSubmission($submission);
            }
        }

        $service->snapshotAsBaseline($student);
    }
}
