<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Models\Test;
use App\Models\TestSubmission;
use App\Models\SubmissionAnswer;
use App\Models\Question;
use Carbon\Carbon;

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
    public function show(Test $test)
    {
        $student = auth()->user()->studentProfile;

        if (!$student) {
            return redirect()->route('dashboard')
                ->withErrors(['error' => 'Student profile not found.']);
        }

        // Check if test is active
        if ($test->status !== 'active') {
            abort(404);
        }

        // Check if student can take this test
        if (!$student->canTakeTest($test->test_id)) {
            return back()->withErrors(['error' => 'You have reached the maximum attempts for this test.']);
        }

        // Check if student has an in-progress test
        $currentSubmission = $student->getCurrentTestSubmission();
        if ($currentSubmission && $currentSubmission->test_id === $test->test_id) {
            return redirect()->route('student.tests.take', ['test' => $test->test_id]);
        }

        // Get student's attempt history for this test
        $attemptHistory = TestSubmission::where('test_id', $test->test_id)
            ->where('student_id', $student->student_id)
            ->whereIn('status', ['submitted', 'timeout'])
            ->orderBy('submitted_at', 'desc')
            ->get()
            ->map(function ($submission) {
                return [
                    'attempt_number' => $submission->attempt_number,
                    'score' => $submission->score,
                    'status' => $submission->status,
                    'submitted_at' => $submission->submitted_at,
                    'time_spent_formatted' => $submission->time_spent_formatted,
                    'is_passed' => $submission->is_passed,
                ];
            });

        return Inertia::render('Student/Tests/Show', [
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'instructions' => $test->instructions,
                'time_limit' => $test->time_limit,
                'max_attempts' => $test->max_attempts,
                'passing_score' => $test->passing_score,
                'questions_count' => $test->questions_count,
                'total_points' => $test->total_points,
            ],
            'lesson' => [
                'lesson_id' => $test->lesson->lesson_id,
                'title' => $test->lesson->title,
            ],
            'studentStats' => [
                'attempts_taken' => $student->getTestAttemptsForTest($test->test_id),
                'best_score' => $student->getBestScoreForTest($test->test_id),
                'can_take' => $student->canTakeTest($test->test_id),
                'has_passed' => ($student->getBestScoreForTest($test->test_id) ?? 0) >= $test->passing_score,
            ],
            'attemptHistory' => $attemptHistory,
        ]);
    }

    // POST student/tests/{test}/start
    public function start(Test $test)
    {
        $student = auth()->user()->studentProfile;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found.'], 422);
        }

        // Validation checks
        if ($test->status !== 'active') {
            return response()->json(['error' => 'Test is not available.'], 422);
        }

        if (!$student->canTakeTest($test->test_id)) {
            return response()->json(['error' => 'You have reached the maximum attempts for this test.'], 422);
        }

        // Check if student already has an in-progress test
        if ($student->hasInProgressTest()) {
            return response()->json(['error' => 'You already have a test in progress.'], 422);
        }

        DB::beginTransaction();
        try {
            // Get next attempt number
            $attemptNumber = $student->getTestAttemptsForTest($test->test_id) + 1;

            // Create test submission
            $submission = TestSubmission::create([
                'test_id' => $test->test_id,
                'student_id' => $student->student_id,
                'attempt_number' => $attemptNumber,
                'started_at' => Carbon::now(),
                'total_questions' => $test->questions_count,
                'status' => 'in_progress',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'submission_id' => $submission->submission_id,
                'redirect_url' => route('student.tests.take', ['test' => $test->test_id])
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Failed to start test. Please try again.'], 500);
        }
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
            return redirect()->route('student.tests.show', ['test' => $test->test_id])
                ->withErrors(['error' => 'No active test session found.']);
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

    // POST student/tests/{test}/save-answer
    public function saveAnswer(Request $request, Test $test)
    {
        $student = auth()->user()->studentProfile;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found.'], 422);
        }

        $data = $request->validate([
            'question_id' => 'required|exists:questions,question_id',
            'answer_text' => 'nullable|string',
            'selected_options' => 'nullable|array',
            'selected_options.*' => 'exists:question_options,option_id',
            'code_answer' => 'nullable|string',
        ]);

        // Get current submission
        $submission = $student->getCurrentTestSubmission();

        if (!$submission || $submission->test_id !== $test->test_id) {
            return response()->json(['error' => 'No active test session found.'], 422);
        }

        // Check if time has expired
        if ($submission->is_time_expired) {
            return response()->json(['error' => 'Test time has expired.'], 422);
        }

        // Verify question belongs to this test
        $question = Question::where('question_id', $data['question_id'])
            ->where('test_id', $test->test_id)
            ->first();

        if (!$question) {
            return response()->json(['error' => 'Question not found.'], 422);
        }

        // Save or update answer
        $answer = SubmissionAnswer::updateOrCreate(
            [
                'submission_id' => $submission->submission_id,
                'question_id' => $question->question_id,
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

    // POST student/tests/{test}/submit
    public function submit(Test $test)
    {
        $student = auth()->user()->studentProfile;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found.'], 422);
        }

        // Get current submission
        $submission = $student->getCurrentTestSubmission();

        if (!$submission || $submission->test_id !== $test->test_id) {
            return response()->json(['error' => 'No active test session found.'], 422);
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
                'redirect_url' => route('student.tests.results', ['test' => $test->test_id])
            ]);
        } catch (\Exception $e) {
            DB::rollback();
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
}
