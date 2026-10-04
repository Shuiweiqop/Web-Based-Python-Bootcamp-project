<?php

namespace App\Services;

use App\Exceptions\CodeGradingUnavailableException;
use App\Jobs\UpdateConceptMastery;
use App\Models\ExerciseSubmission;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\StudentProfile;
use App\Services\Grading\ExerciseGrader;
use App\Services\Grading\ExerciseGraders;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExerciseSubmissionService
{
    public function __construct(
        private DailyChallengeService $challengeService,
        private Judge0Service $judge0,
        private ExerciseGraders $graders,
    ) {}

    /**
     * @throws CodeGradingUnavailableException when a coding exercise cannot
     *                                         be graded because Judge0 is down
     */
    public function submit(
        StudentProfile $student,
        Lesson $lesson,
        InteractiveExercise $exercise,
        array $answer,
        int $timeSpent
    ): array {
        // Graded before the transaction opens: it makes one Judge0 call per
        // test case, and a transaction should not stay open across them.
        $grader = $this->graders->for($exercise->exercise_type);

        if ($exercise->exercise_type === 'coding') {
            [$score, $completed, $answer] = $this->gradeCoding($exercise, $answer);
        } elseif ($grader) {
            [$score, $completed, $answer] = $this->gradeWith($grader, $student, $exercise, $answer);
        } else {
            $score = (int) round(min(max($answer['score'], 0), $exercise->max_score));
            $completed = $this->determineCompletionStatus($exercise, $answer, $score);
        }

        return DB::transaction(function () use ($student, $lesson, $exercise, $answer, $timeSpent, $score, $completed, $grader) {

            $submission = ExerciseSubmission::create([
                'exercise_id' => $exercise->exercise_id,
                'student_id' => $student->student_id,
                'score' => $score,
                'time_taken' => $timeSpent,
                'completed' => $completed,
                'answer_data' => array_merge($answer, ['score' => $score, 'completed' => $completed]),
                'submitted_at' => now(),
            ]);

            Log::info('Exercise submission saved', [
                'submission_id' => $submission->submission_id,
                'exercise_id' => $exercise->exercise_id,
                'student_id' => $student->student_id,
                'score' => $submission->score,
            ]);

            // Feed the ability model. Deferred to after commit because the job
            // re-reads the submission by id and would not see an uncommitted row.
            DB::afterCommit(fn () => dispatch(
                UpdateConceptMastery::forExercise((int) $submission->submission_id)
            ));

            $missionProgress = null;
            if ($submission->completed) {
                try {
                    $missionProgress = $this->challengeService->recordExerciseCompletion(
                        (int) $student->student_id,
                        (int) $exercise->exercise_id
                    );
                } catch (\Throwable $e) {
                    Log::warning('Failed to record exercise daily challenge event', [
                        'student_id' => $student->student_id,
                        'submission_id' => $submission->submission_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $registration = LessonRegistration::where('student_id', $student->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            if ($registration) {
                $this->updateLessonProgress($registration, $lesson, $student);
                $registration->refresh();
            }

            return [
                'submission' => [
                    'submission_id' => $submission->submission_id,
                    'score' => $submission->score,
                    'percentage' => $submission->percentage,
                    'is_passing' => $submission->is_passing,
                    'grade' => $submission->grade,
                    'completed' => (bool) $submission->completed,
                ],
                // The server's own run, so the page shows what was graded.
                'test_results' => $exercise->exercise_type === 'coding' ? $answer['test_results'] : null,
                // How each item went, for the results screen of a server-graded type.
                'review' => $grader ? $answer['review'] : null,
                'mission_progress' => $missionProgress,
                'lesson_progress' => $registration ? [
                    'exercises_completed' => $registration->exercises_completed,
                    'exercises_required' => $lesson->required_exercises ?? 0,
                    'tests_passed' => $registration->tests_passed,
                    'tests_required' => $lesson->required_tests ?? 0,
                    'lesson_completed' => $registration->registration_status === 'completed',
                    'completion_percentage' => $this->calculateCompletionPercentage($registration, $lesson),
                    'points_amount' => $registration->registration_status === 'completed'
                        ? $lesson->completion_reward_points
                        : 0,
                ] : null,
            ];
        });
    }

    /**
     * Non-coding exercises: trust the client-reported completed flag, but
     * require a passing score.
     */
    private function determineCompletionStatus(InteractiveExercise $exercise, array $answer, int $score): bool
    {
        if (($answer['completed'] ?? true) === false) {
            return false;
        }

        if ((int) $exercise->max_score <= 0) {
            return false;
        }

        return ($score / (int) $exercise->max_score) >= 0.7;
    }

    /**
     * Coding exercises are graded here, by running the submitted code against
     * the test cases stored on the exercise. Nothing the client reports —
     * score, completed, test_results — is trusted: those decide lesson
     * completion and points, and a forged request could set them freely.
     *
     * @return array{0: int, 1: bool, 2: array} score, completed, answer to store
     */
    private function gradeCoding(InteractiveExercise $exercise, array $answer): array
    {
        $code = is_string($answer['code'] ?? null) ? $answer['code'] : '';
        $testCases = is_array($exercise->test_cases) ? $exercise->test_cases : [];

        $testResults = [];
        if ($code !== '' && $testCases !== []) {
            $testResults = $this->judge0->runTestCases(
                $code,
                (int) $this->judge0->languageId('python'),
                $testCases
            );
        }

        // An outage is not a wrong answer. Recording it as a zero would cost
        // the student a submission they never really made.
        if (collect($testResults)->contains(fn ($r) => $r['error'])) {
            Log::warning('exercise.grade.judge0_unavailable', [
                'action' => 'gradeCoding',
                'exercise_id' => $exercise->exercise_id,
            ]);

            throw new CodeGradingUnavailableException;
        }

        $total = count($testResults);
        $passed = collect($testResults)->where('passed', true)->count();
        $maxScore = (int) $exercise->max_score;

        $score = $total > 0 ? (int) round($passed / $total * $maxScore) : 0;
        $completed = $total > 0 && $passed === $total;

        return [$score, $completed, array_merge($answer, ['test_results' => $testResults])];
    }

    /**
     * Server-graded types (see ExerciseGraders) are graded here from what the
     * student answered, against the answer key stored on the exercise. The
     * page never receives the key, and the score it reports is ignored.
     *
     * @return array{0: int, 1: bool, 2: array} score, completed, answer to store
     */
    private function gradeWith(ExerciseGrader $grader, StudentProfile $student, InteractiveExercise $exercise, array $answer): array
    {
        $maxScore = (int) $exercise->max_score;

        $graded = $grader->grade(
            is_array($exercise->content) ? $exercise->content : [],
            $answer,
            $maxScore,
            ['student_id' => (int) $student->student_id, 'exercise_id' => (int) $exercise->exercise_id]
        );

        $score = min(max($graded['score'], 0), $maxScore);
        $completed = $maxScore > 0 && $score / $maxScore >= 0.7;

        return [
            $score,
            $completed,
            array_merge($answer, ['results' => $graded['results'], 'review' => $graded['review']]),
        ];
    }

    private function updateLessonProgress(LessonRegistration $registration, Lesson $lesson, StudentProfile $student): void
    {
        $exercisesCompleted = ExerciseSubmission::where('student_id', $student->student_id)
            ->whereHas('exercise', fn ($q) => $q->where('lesson_id', $lesson->lesson_id))
            ->where('completed', true)
            ->where(fn ($q) => $q->whereRaw(
                'score >= (SELECT max_score * 0.7 FROM interactive_exercises WHERE exercise_id = exercise_submissions.exercise_id)'
            ))
            ->distinct('exercise_id')
            ->count('exercise_id');

        $testsPassed = DB::table('test_submissions')
            ->join('tests', 'test_submissions.test_id', '=', 'tests.test_id')
            ->where('test_submissions.student_id', $student->student_id)
            ->where('tests.lesson_id', $lesson->lesson_id)
            ->whereIn('test_submissions.status', ['submitted', 'timeout'])
            ->whereRaw('test_submissions.score >= tests.passing_score')
            ->distinct('tests.test_id')
            ->count('tests.test_id');

        $registration->update([
            'exercises_completed' => $exercisesCompleted,
            'tests_passed' => $testsPassed,
        ]);

        Log::info('Updated lesson progress', [
            'student_id' => $student->student_id,
            'lesson_id' => $lesson->lesson_id,
            'exercises_completed' => $exercisesCompleted,
            'tests_passed' => $testsPassed,
        ]);

        $exercisesRequired = $lesson->required_exercises ?? 0;
        $testsRequired = $lesson->required_tests ?? 0;

        if (
            $exercisesCompleted >= $exercisesRequired &&
            $testsPassed >= $testsRequired &&
            $registration->registration_status !== 'completed' &&
            (int) $registration->completion_points_awarded <= 0
        ) {
            $student->addPoints($lesson->completion_reward_points);

            $registration->update([
                'registration_status' => 'completed',
                'completion_points_awarded' => $lesson->completion_reward_points,
                'completed_at' => now(),
            ]);

            $progress = LessonProgress::firstOrCreate(
                [
                    'student_id' => $student->student_id,
                    'lesson_id' => $lesson->lesson_id,
                ],
                [
                    'status' => 'in_progress',
                    'progress_percent' => 0,
                    'started_at' => now(),
                    'last_updated_at' => now(),
                ]
            );

            $progress->markAsCompleted(true);
            $student->increment('total_lessons_completed');

            app(LearningPathProgressService::class)->updatePathsForLesson(
                (int) $student->student_id,
                (int) $lesson->lesson_id
            );

            Log::info('Lesson completed and points awarded', [
                'student_id' => $student->student_id,
                'lesson_id' => $lesson->lesson_id,
                'points' => $lesson->completion_reward_points,
            ]);
        }
    }

    private function calculateCompletionPercentage(LessonRegistration $registration, Lesson $lesson): int
    {
        $exercisesRequired = max($lesson->required_exercises ?? 1, 1);
        $testsRequired = max($lesson->required_tests ?? 1, 1);

        $exercisesProgress = min($registration->exercises_completed / $exercisesRequired, 1) * 50;
        $testsProgress = min($registration->tests_passed / $testsRequired, 1) * 50;

        return (int) round($exercisesProgress + $testsProgress);
    }
}
