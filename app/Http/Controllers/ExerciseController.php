<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\InteractiveExercise;
use App\Models\ExerciseSubmission;
use App\Models\LessonRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExerciseController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
    }

    /**
     * 提交练习答案（学生端）
     */
    public function submit(Request $request, Lesson $lesson, InteractiveExercise $exercise)
    {
        try {
            // 验证请求数据
            $validated = $request->validate([
                'answer' => 'required|array',
                'answer.completed' => 'required|boolean',
                'answer.score' => 'required|numeric|min:0',
                'time_spent' => 'nullable|numeric|min:0',
            ]);

            // 获取当前学生
            $student = Auth::user()->studentProfile;

            if (!$student) {
                Log::error('Student profile not found', [
                    'user_id' => Auth::id(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found.'
                ], 404);
            }

            // 验证 exercise 是否属于该 lesson
            if ($exercise->lesson_id !== $lesson->lesson_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid exercise for this lesson.'
                ], 400);
            }

            // 开始事务
            DB::beginTransaction();

            try {
                $normalizedScore = (int) round(min(
                    max($validated['answer']['score'], 0),
                    $exercise->max_score
                ));
                $normalizedCompleted = $this->determineCompletionStatus(
                    $exercise,
                    $validated['answer']
                );

                // Always create a new submission attempt to preserve history.
                $submission = ExerciseSubmission::create([
                    'exercise_id' => $exercise->exercise_id,
                    'student_id' => $student->student_id,
                    'score' => $normalizedScore,
                    'time_taken' => $validated['time_spent'] ?? 0,
                    'completed' => $normalizedCompleted,
                    'answer_data' => array_merge($validated['answer'], [
                        'score' => $normalizedScore,
                        'completed' => $normalizedCompleted,
                    ]),
                    'submitted_at' => now(),
                ]);

                Log::info('Exercise submission saved', [
                    'submission_id' => $submission->submission_id,
                    'exercise_id' => $exercise->exercise_id,
                    'student_id' => $student->student_id,
                    'score' => $submission->score,
                    'was_recently_created' => $submission->wasRecentlyCreated,
                ]);

                // 更新课程进度
                $registration = LessonRegistration::where('student_id', $student->student_id)
                    ->where('lesson_id', $lesson->lesson_id)
                    ->first();

                if ($registration) {
                    $this->updateLessonProgress($registration, $lesson, $student);
                    $registration->refresh();
                }

                DB::commit();

                // 准备响应数据
                $response = [
                    'success' => true,
                    'message' => 'Exercise completed successfully!',
                    'submission' => [
                        'submission_id' => $submission->submission_id,
                        'score' => $submission->score,
                        'percentage' => $submission->percentage,
                        'is_passing' => $submission->is_passing,
                        'grade' => $submission->grade,
                    ],
                ];

                // 添加课程进度信息
                if ($registration) {
                    $response['lesson_progress'] = [
                        'exercises_completed' => $registration->exercises_completed,
                        'exercises_required' => $lesson->required_exercises ?? 0,
                        'tests_passed' => $registration->tests_passed,
                        'tests_required' => $lesson->required_tests ?? 0,
                        'lesson_completed' => $registration->registration_status === 'completed',
                        'completion_percentage' => $this->calculateCompletionPercentage($registration, $lesson),
                        'points_amount' => $registration->registration_status === 'completed'
                            ? $lesson->completion_reward_points
                            : 0,
                    ];
                }

                return response()->json($response);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error in exercise submission', [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error submitting exercise', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit exercise: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Determine completion status with server-side safeguards.
     * For coding exercises, at least one test must exist and all must pass.
     */
    private function determineCompletionStatus(InteractiveExercise $exercise, array $answer): bool
    {
        if ($exercise->exercise_type !== 'coding') {
            return (bool) ($answer['completed'] ?? false);
        }

        $testResults = $answer['test_results'] ?? null;
        if (!is_array($testResults) || count($testResults) === 0) {
            return false;
        }

        $passedCount = collect($testResults)->filter(function ($result) {
            return is_array($result) && (($result['passed'] ?? false) === true);
        })->count();

        return $passedCount === count($testResults);
    }

    /**
     * 更新课程进度并检查是否完成
     */
    private function updateLessonProgress($registration, $lesson, $student)
    {
        // 统计已完成的 exercises（分数 >= 70%）
        $exercisesCompleted = ExerciseSubmission::where('student_id', $student->student_id)
            ->whereHas('exercise', function ($query) use ($lesson) {
                $query->where('lesson_id', $lesson->lesson_id);
            })
            ->where('completed', true)
            ->where(function ($query) {
                // 分数 >= 70% of max_score
                $query->whereRaw('score >= (SELECT max_score * 0.7 FROM interactive_exercises WHERE exercise_id = exercise_submissions.exercise_id)');
            })
            ->distinct('exercise_id')
            ->count('exercise_id');

        // 统计已通过的 tests
        $testsPassed = DB::table('test_submissions')
            ->join('tests', 'test_submissions.test_id', '=', 'tests.test_id')
            ->where('test_submissions.student_id', $student->student_id)
            ->where('tests.lesson_id', $lesson->lesson_id)
            ->where('test_submissions.status', 'submitted')
            ->whereRaw('(test_submissions.score / test_submissions.total_questions * 100) >= tests.passing_score')
            ->distinct('tests.test_id')
            ->count('tests.test_id');

        // 更新 registration 的进度字段
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

        // 检查是否满足完成条件
        $exercisesRequired = $lesson->required_exercises ?? 0;
        $testsRequired = $lesson->required_tests ?? 0;

        if (
            $exercisesCompleted >= $exercisesRequired &&
            $testsPassed >= $testsRequired &&
            !$registration->completion_points_awarded
        ) {

            // 给予积分
            $student->increment('current_points', $lesson->completion_reward_points);

            // 标记为已完成
            $registration->update([
                'registration_status' => 'completed',
                'completion_points_awarded' => true,
                'completed_at' => now(),
            ]);

            Log::info('Lesson completed and points awarded', [
                'student_id' => $student->student_id,
                'lesson_id' => $lesson->lesson_id,
                'points' => $lesson->completion_reward_points,
            ]);
        }
    }

    /**
     * 计算完成百分比
     */
    private function calculateCompletionPercentage($registration, $lesson)
    {
        $exercisesRequired = max($lesson->required_exercises ?? 1, 1);
        $testsRequired = max($lesson->required_tests ?? 1, 1);

        $exercisesProgress = min(($registration->exercises_completed / $exercisesRequired), 1) * 50;
        $testsProgress = min(($registration->tests_passed / $testsRequired), 1) * 50;

        return round($exercisesProgress + $testsProgress);
    }
}
