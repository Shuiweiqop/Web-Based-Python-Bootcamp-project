<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Models\Test;
use App\Models\TestSubmission;
use App\Models\SubmissionAnswer;
use Illuminate\Support\Facades\Log;

class TestController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:student']);
    }

    // GET student/lessons/{lesson}/tests
    public function indexForLesson(Lesson $lesson, Request $request)
    {
        $student = auth()->user()->studentProfile;

        if (!$student) {
            return redirect()->route('student.dashboard')
                ->withErrors(['error' => 'Student profile not found.']);
        }

        // Get available tests for this lesson
        $tests = Test::active()
            ->forLesson($lesson->lesson_id)
            ->with(['questions'])
            ->get()
            ->map(function ($test) use ($student) {
                return [
                    'test_id' => $test->test_id,
                    'title' => $test->title,
                    'description' => $test->description,
                    'time_limit' => $test->time_limit,
                    'max_attempts' => $test->max_attempts,
                    'passing_score' => $test->passing_score,
                    'questions_count' => $test->questions_count,
                    'total_points' => $test->total_points,
                    'attempts_taken' => $student->getTestAttemptsForTest($test->test_id),
                    'best_score' => $student->getBestScoreForTest($test->test_id),
                    'can_take' => $student->canTakeTest($test->test_id),
                    'has_passed' => ($student->getBestScoreForTest($test->test_id) ?? 0) >= $test->passing_score,
                ];
            });

        return Inertia::render('Student/Tests/Index', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'tests' => $tests,
            'student' => [
                'total_tests_taken' => $student->total_tests_taken,
                'average_score' => $student->average_score,
                'has_in_progress' => $student->hasInProgressTest(),
            ],
        ]);
    }

    // GET student/tests/{test}
    public function show(Lesson $lesson, Test $test)
    {
        $student = auth()->user()->studentProfile;

        if (!$student) {
            return redirect()->route('dashboard')
                ->with('error', 'Student profile not found.');
        }

        // 验证测试属于该课程
        if ($test->lesson_id !== $lesson->lesson_id) {
            return redirect()->route('lessons.show', $lesson->lesson_id)
                ->with('error', 'Invalid test for this lesson.');
        }

        // 验证测试状态
        if ($test->status !== 'active') {
            return redirect()->route('lessons.show', $lesson->lesson_id)
                ->with('error', 'This test is not currently available.');
        }

        // 计算已使用的尝试次数
        $attemptsUsed = TestSubmission::where('test_id', $test->test_id)
            ->where('student_id', $student->student_id)
            ->whereIn('status', ['submitted', 'timeout'])
            ->count();

        $remainingAttempts = max(0, $test->max_attempts - $attemptsUsed);
        $canAttempt = $remainingAttempts > 0;

        // 获取最后一次完成的提交
        $lastSubmission = TestSubmission::where('test_id', $test->test_id)
            ->where('student_id', $student->student_id)
            ->whereIn('status', ['submitted', 'timeout'])
            ->latest('submitted_at')
            ->first();

        // 检查是否有进行中的测试
        $inProgressSubmission = TestSubmission::where('test_id', $test->test_id)
            ->where('student_id', $student->student_id)
            ->where('status', 'in_progress')
            ->first();

        return Inertia::render('Student/Tests/Show', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'instructions' => $test->instructions,
                'time_limit' => $test->time_limit,
                'passing_score' => $test->passing_score,
                'max_attempts' => $test->max_attempts,
                'shuffle_questions' => $test->shuffle_questions,
                'show_results_immediately' => $test->show_results_immediately,
                'allow_review' => $test->allow_review,
                'status' => $test->status,
                'questions_count' => $test->questions()->count(),
                'total_points' => $test->questions()->sum('points'),
            ],
            'canAttempt' => $canAttempt,
            'remainingAttempts' => $remainingAttempts,
            'lastSubmission' => $lastSubmission ? [
                'submission_id' => $lastSubmission->submission_id,
                'score' => $lastSubmission->score,
                'passed' => $lastSubmission->is_passed ?? ($lastSubmission->score >= $test->passing_score),
                'submitted_at' => $lastSubmission->submitted_at,
            ] : null,
            'inProgressSubmission' => $inProgressSubmission ? [
                'submission_id' => $inProgressSubmission->submission_id,
                'started_at' => $inProgressSubmission->started_at,
            ] : null,
        ]);
    }


    // GET student/tests/{test}/take
    public function take(Test $test)
    {
        $student = auth()->user()->studentProfile;

        if (!$student) {
            return redirect()->route('dashboard')
                ->withErrors(['error' => 'Student profile not found.']);
        }

        // Get current submission
        $submission = $student->getCurrentTestSubmission();

        if (!$submission || $submission->test_id !== $test->test_id) {
            // 改为 student.lessons.tests.show，并添加 lesson 参数
            $lesson = $test->lesson;
            return redirect()->route('student.lessons.tests.show', [
                'lesson' => $lesson->lesson_id,
                'test' => $test->test_id
            ])->withErrors(['error' => 'No active test session found.']);
        }

        // Check if time has expired
        if ($submission->is_time_expired) {
            $submission->timeoutTest();
            return redirect()->route('student.tests.results', ['test' => $test->test_id])
                ->with('info', 'Test has been automatically submitted due to time limit.');
        }

        // Load test questions
        $questions = $test->questions()->active()->orderBy('order')->get();

        if ($test->shuffle_questions) {
            $questions = $questions->shuffle();
        }

        // Load existing answers
        $existingAnswers = $submission->answers()
            ->whereIn('question_id', $questions->pluck('question_id'))
            ->get()
            ->keyBy('question_id');

        $questionsData = $questions->map(function ($question) use ($existingAnswers) {
            $existingAnswer = $existingAnswers->get($question->question_id);

            return [
                'question_id' => $question->question_id,
                'type' => $question->type,
                'question_text' => $question->question_text,
                'code_snippet' => $question->code_snippet,
                'points' => $question->points,
                'options' => $question->type === 'mcq' ? $question->options->map(function ($option) {
                    return [
                        'option_id' => $option->option_id,
                        'option_label' => $option->option_label,
                        'option_text' => $option->option_text,
                    ];
                }) : null,
                'existing_answer' => $existingAnswer ? [
                    'answer_text' => $existingAnswer->answer_text,
                    'selected_options' => $existingAnswer->selected_options,
                    'code_answer' => $existingAnswer->code_answer,
                ] : null,
            ];
        });

        return Inertia::render('Student/Tests/Take', [
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'instructions' => $test->instructions,
                'time_limit' => $test->time_limit,
                'questions_count' => $test->questions_count,
                'total_points' => $test->total_points,
            ],
            'submission' => [
                'submission_id' => $submission->submission_id,
                'started_at' => $submission->started_at,
                'remaining_time' => $submission->remaining_time,
            ],
            'questions' => $questionsData,
        ]);
    }
    public function start(Request $request, Lesson $lesson, Test $test)
    {
        $student = auth()->user()->studentProfile;

        if (!$student) {
            return back()->with('error', 'Student profile not found.');
        }

        // 验证测试属于该课程
        if ($test->lesson_id !== $lesson->lesson_id) {
            return back()->with('error', 'Invalid test for this lesson.');
        }

        // 验证测试状态
        if ($test->status !== 'active') {
            return back()->with('error', 'Test is not available.');
        }

        // 检查是否还能参加测验
        if (!$test->canStudentTakeTest($student->student_id)) {
            return back()->with('error', 'You have reached the maximum attempts for this test.');
        }

        // 检查是否有进行中的测验
        $existingSubmission = TestSubmission::where('test_id', $test->test_id)
            ->where('student_id', $student->student_id)
            ->where('status', 'in_progress')
            ->first();

        if ($existingSubmission) {
            // 如果有未完成的提交，重定向到该提交
            return redirect()->route('student.submissions.taking', $existingSubmission->submission_id);
        }

        DB::beginTransaction();
        try {
            // 获取下一个尝试编号
            $attemptNumber = $test->getStudentAttempts($student->student_id) + 1;

            // 创建测验提交记录
            $submission = TestSubmission::create([
                'test_id' => $test->test_id,
                'student_id' => $student->student_id,
                'attempt_number' => $attemptNumber,
                'started_at' => Carbon::now(),
                'total_questions' => $test->questions()->count(),
                'status' => 'in_progress',
            ]);

            DB::commit();

            // 🔥 重定向到 taking 页面
            return redirect()->route('student.submissions.taking', $submission->submission_id);
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Failed to start test', [
                'error' => $e->getMessage(),
                'test_id' => $test->test_id,
                'student_id' => $student->student_id,
            ]);
            return back()->with('error', 'Failed to start test. Please try again.');
        }
    }
    // POST student/tests/{test}/save-answer
    public function saveAnswer(Request $request, TestSubmission $submission)
    {
        $student = auth()->user()->studentProfile;

        if (!$student || $submission->student_id !== $student->student_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'question_id' => 'required|exists:questions,question_id',
            'answer_text' => 'nullable|string',
            'selected_options' => 'nullable|array',
            'code_answer' => 'nullable|string',
        ]);

        // Check if time has expired
        if ($submission->is_time_expired) {
            return response()->json(['error' => 'Test time has expired.'], 422);
        }

        // Save or update answer
        $answer = SubmissionAnswer::updateOrCreate(
            [
                'submission_id' => $submission->submission_id,
                'question_id' => $data['question_id'],
            ],
            [
                'answer_text' => $data['answer_text'] ?? null,
                'selected_options' => $data['selected_options'] ?? null,
                'code_answer' => $data['code_answer'] ?? null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Answer saved successfully.',
        ]);
    }

    /**
     * Submit test (完成测试)
     */
    public function submit(TestSubmission $submission)
    {
        $student = auth()->user()->studentProfile;

        if (!$student || $submission->student_id !== $student->student_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($submission->status !== 'in_progress') {
            return response()->json(['error' => 'Test already submitted'], 422);
        }

        DB::beginTransaction();
        try {
            // Grade all answers
            $answers = $submission->answers()->with('question')->get();

            foreach ($answers as $answer) {
                $answer->checkAndGrade();
            }

            // Submit the test
            $submission->submitTest();

            // Update student stats
            $student->processTestCompletion($submission);

            DB::commit();

            return response()->json([
                'success' => true,
                'submission_id' => $submission->submission_id,
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Test submission failed', [
                'error' => $e->getMessage(),
                'submission_id' => $submission->submission_id
            ]);
            return response()->json(['error' => 'Failed to submit test. Please try again.'], 500);
        }
    }

    // GET student/tests/{test}/results
    public function results(Test $test)
    {
        $student = auth()->user()->studentProfile;

        if (!$student) {
            return redirect()->route('dashboard')
                ->withErrors(['error' => 'Student profile not found.']);
        }

        // Get the latest completed submission for this test
        $submission = TestSubmission::where('test_id', $test->test_id)
            ->where('student_id', $student->student_id)
            ->whereIn('status', ['submitted', 'timeout'])
            ->latest('submitted_at')
            ->first();

        if (!$submission) {
            return redirect()->route('student.tests.show', ['test' => $test->test_id])
                ->withErrors(['error' => 'No completed test found.']);
        }

        // Load answers with questions and options
        $answers = $submission->answers()
            ->with(['question.options'])
            ->get()
            ->map(function ($answer) {
                return [
                    'question_id' => $answer->question_id,
                    'question' => [
                        'type' => $answer->question->type,
                        'question_text' => $answer->question->question_text,
                        'code_snippet' => $answer->question->code_snippet,
                        'points' => $answer->question->points,
                        'explanation' => $answer->question->explanation,
                        'correct_answer' => $answer->question->correct_answer,
                        'options' => $answer->question->options->map(function ($option) {
                            return [
                                'option_id' => $option->option_id,
                                'option_label' => $option->option_label,
                                'option_text' => $option->option_text,
                                'is_correct' => $option->is_correct,
                            ];
                        }),
                    ],
                    'student_answer' => [
                        'answer_text' => $answer->answer_text,
                        'selected_options' => $answer->selected_options,
                        'code_answer' => $answer->code_answer,
                        'answer_display' => $answer->answer_display,
                    ],
                    'is_correct' => $answer->is_correct,
                    'points_earned' => $answer->points_earned,
                    'feedback' => $answer->feedback,
                ];
            });

        return Inertia::render('Student/Tests/Results', [
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'passing_score' => $test->passing_score,
                'allow_review' => $test->allow_review,
                'total_points' => $test->total_points,
            ],
            'submission' => [
                'submission_id' => $submission->submission_id,
                'attempt_number' => $submission->attempt_number,
                'score' => $submission->score,
                'correct_answers' => $submission->correct_answers,
                'total_questions' => $submission->total_questions,
                'time_spent_formatted' => $submission->time_spent_formatted,
                'is_passed' => $submission->is_passed,
                'status' => $submission->status,
                'submitted_at' => $submission->submitted_at,
            ],
            'answers' => $test->allow_review ? $answers : null,
            'canRetake' => $student->canTakeTest($test->test_id),
        ]);
    }

    // GET student/tests-history
    public function history(Request $request)
    {
        $student = auth()->user()->studentProfile;

        if (!$student) {
            return redirect()->route('dashboard')
                ->withErrors(['error' => 'Student profile not found.']);
        }

        $history = $student->getTestHistory(20);

        return Inertia::render('Student/Tests/History', [
            'testHistory' => $history->map(function ($submission) {
                return [
                    'submission_id' => $submission->submission_id,
                    'test_title' => $submission->test->title,
                    'lesson_title' => $submission->test->lesson->title,
                    'attempt_number' => $submission->attempt_number,
                    'score' => $submission->score,
                    'is_passed' => $submission->is_passed,
                    'time_spent_formatted' => $submission->time_spent_formatted,
                    'submitted_at' => $submission->submitted_at,
                    'status' => $submission->status,
                ];
            }),
            'stats' => $student->getTestProgressStats(),
        ]);
    }
    public function taking(TestSubmission $submission)
    {
        $student = auth()->user()->studentProfile;

        if (!$student || $submission->student_id !== $student->student_id) {
            abort(403, 'Unauthorized access to this test submission.');
        }

        // 如果已经提交，重定向到结果页
        if ($submission->status !== 'in_progress') {
            return redirect()->route('student.submissions.result', $submission->submission_id);
        }

        // 加载测试和课程
        $test = Test::with('questions.options')->findOrFail($submission->test_id);
        $lesson = Lesson::findOrFail($test->lesson_id);

        // 准备问题数据
        $questions = $test->questions()
            ->where('status', 'active')
            ->orderBy('order')
            ->get()
            ->map(function ($question) use ($submission) {
                // 获取已保存的答案
                $savedAnswer = $submission->answers()
                    ->where('question_id', $question->question_id)
                    ->first();

                return [
                    'question_id' => $question->question_id,
                    'type' => $question->type,
                    'question_text' => $question->question_text,
                    'code_snippet' => $question->code_snippet,
                    'points' => $question->points,
                    'options' => $question->type === 'mcq' ? $question->options->map(function ($option) {
                        return [
                            'option_id' => $option->option_id,
                            'option_label' => $option->option_label,
                            'option_text' => $option->option_text,
                        ];
                    }) : [],
                    'saved_answer' => $savedAnswer ? [
                        'answer_text' => $savedAnswer->answer_text,
                        'selected_options' => $savedAnswer->selected_options,
                        'code_answer' => $savedAnswer->code_answer,
                    ] : null,
                ];
            });

        // 如果设置了打乱问题
        if ($test->shuffle_questions) {
            $questions = $questions->shuffle()->values();
        }

        return Inertia::render('Student/Tests/Taking', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'instructions' => $test->instructions,
                'time_limit' => $test->time_limit,
                'passing_score' => $test->passing_score,
            ],
            'submission' => [
                'submission_id' => $submission->submission_id,
                'attempt_number' => $submission->attempt_number,
                'started_at' => $submission->started_at,
            ],
            'questions' => $questions,
        ]);
    }
}
