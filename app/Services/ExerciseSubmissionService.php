<?php

namespace App\Services;

use App\Models\ExerciseSubmission;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\StudentProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExerciseSubmissionService
{
    public function __construct(private DailyChallengeService $challengeService) {}

    public function submit(
        StudentProfile $student,
        Lesson $lesson,
        InteractiveExercise $exercise,
        array $answer,
        int $timeSpent
    ): array {
        return DB::transaction(function () use ($student, $lesson, $exercise, $answer, $timeSpent) {
            $score     = (int) round(min(max($answer['score'], 0), $exercise->max_score));
            $completed = $this->determineCompletionStatus($exercise, $answer, $score);

            $submission = ExerciseSubmission::create([
                'exercise_id'  => $exercise->exercise_id,
                'student_id'   => $student->student_id,
                'score'        => $score,
                'time_taken'   => $timeSpent,
                'completed'    => $completed,
                'answer_data'  => array_merge($answer, ['score' => $score, 'completed' => $completed]),
                'submitted_at' => now(),
            ]);

            Log::info('Exercise submission saved', [
                'submission_id' => $submission->submission_id,
                'exercise_id'   => $exercise->exercise_id,
                'student_id'    => $student->student_id,
                'score'         => $submission->score,
            ]);

            $missionProgress = null;
            if ($submission->completed) {
                try {
                    $missionProgress = $this->challengeService->recordExerciseCompletion(
                        (int) $student->student_id,
                        (int) $submission->submission_id
                    );
                } catch (\Throwable $e) {
                    Log::warning('Failed to record exercise daily challenge event', [
                        'student_id'    => $student->student_id,
                        'submission_id' => $submission->submission_id,
                        'error'         => $e->getMessage(),
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
                    'score'         => $submission->score,
                    'percentage'    => $submission->percentage,
                    'is_passing'    => $submission->is_passing,
                    'grade'         => $submission->grade,
                ],
                'mission_progress' => $missionProgress,
                'lesson_progress'  => $registration ? [
                    'exercises_completed'  => $registration->exercises_completed,
                    'exercises_required'   => $lesson->required_exercises ?? 0,
                    'tests_passed'         => $registration->tests_passed,
                    'tests_required'       => $lesson->required_tests ?? 0,
                    'lesson_completed'     => $registration->registration_status === 'completed',
                    'completion_percentage'=> $this->calculateCompletionPercentage($registration, $lesson),
                    'points_amount'        => $registration->registration_status === 'completed'
                        ? $lesson->completion_reward_points
                        : 0,
                ] : null,
            ];
        });
    }

    /**
     * For coding exercises, all test cases must pass.
     * For other types, trust the client-reported completed flag.
     */
    private function determineCompletionStatus(InteractiveExercise $exercise, array $answer, int $score): bool
    {
        if ($exercise->exercise_type !== 'coding') {
            if (($answer['completed'] ?? true) === false) {
                return false;
            }

            if ((int) $exercise->max_score <= 0) {
                return false;
            }

            return ($score / (int) $exercise->max_score) >= 0.7;
        }

        $testResults = $answer['test_results'] ?? null;
        if (!is_array($testResults) || count($testResults) === 0) {
            return false;
        }

        $passed = collect($testResults)->filter(fn($r) => is_array($r) && ($r['passed'] ?? false) === true)->count();
        return $passed === count($testResults);
    }

    private function updateLessonProgress(LessonRegistration $registration, Lesson $lesson, StudentProfile $student): void
    {
        $exercisesCompleted = ExerciseSubmission::where('student_id', $student->student_id)
            ->whereHas('exercise', fn($q) => $q->where('lesson_id', $lesson->lesson_id))
            ->where('completed', true)
            ->where(fn($q) => $q->whereRaw(
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
            'tests_passed'        => $testsPassed,
        ]);

        Log::info('Updated lesson progress', [
            'student_id'          => $student->student_id,
            'lesson_id'           => $lesson->lesson_id,
            'exercises_completed' => $exercisesCompleted,
            'tests_passed'        => $testsPassed,
        ]);

        $exercisesRequired = $lesson->required_exercises ?? 0;
        $testsRequired     = $lesson->required_tests ?? 0;

        if (
            $exercisesCompleted >= $exercisesRequired &&
            $testsPassed >= $testsRequired &&
            $registration->registration_status !== 'completed' &&
            (int) $registration->completion_points_awarded <= 0
        ) {
            $student->increment('current_points', $lesson->completion_reward_points);

            $registration->update([
                'registration_status'       => 'completed',
                'completion_points_awarded' => $lesson->completion_reward_points,
                'completed_at'              => now(),
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
                'lesson_id'  => $lesson->lesson_id,
                'points'     => $lesson->completion_reward_points,
            ]);
        }
    }

    private function calculateCompletionPercentage(LessonRegistration $registration, Lesson $lesson): int
    {
        $exercisesRequired = max($lesson->required_exercises ?? 1, 1);
        $testsRequired     = max($lesson->required_tests ?? 1, 1);

        $exercisesProgress = min($registration->exercises_completed / $exercisesRequired, 1) * 50;
        $testsProgress     = min($registration->tests_passed / $testsRequired, 1) * 50;

        return (int) round($exercisesProgress + $testsProgress);
    }
}
