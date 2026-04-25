<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Lesson;
use App\Models\Test;
use App\Models\TestSubmission;
use App\Models\SubmissionAnswer;
use App\Models\Question;
use App\Models\LessonProgress;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class StudentTestController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:student']);
    }

    /**
     * Helper: return student's student_id or abort with clear message.
     */
    private function getStudentIdOrFail()
    {
        $user = Auth::user();
        if (!$user) {
            abort(401, 'User not authenticated.');
        }

        // 改为 studentProfile（匹配你的模型关系名）
        if (!$user->studentProfile) {
            abort(403, 'Student profile not found. Please complete your student profile before taking tests.');
        }

        // 检查属性是否存在
        if (!isset($user->studentProfile->student_id)) {
            abort(500, 'Student profile misconfigured: missing student_id.');
        }

        return $user->studentProfile->student_id;
    }

    /**
     * Ensure lesson content has been reviewed before tests are accessible.
     */
    private function ensureLessonContentReviewed(Lesson $lesson, int $studentId): void
    {
        $progress = LessonProgress::where('student_id', $studentId)
            ->where('lesson_id', $lesson->lesson_id)
            ->first();

        if (!$progress || !$progress->content_completed) {
            abort(403, 'Please review the lesson content before accessing tests.');
        }
    }

    /**
     * Display all available tests for a lesson
     * GET /student/lessons/{lesson}/tests
     */
    public function index(Lesson $lesson)
    {
        $studentId = $this->getStudentIdOrFail();
        $this->ensureLessonContentReviewed($lesson, $studentId);

        $tests = Test::where('lesson_id', $lesson->lesson_id)
            ->where('status', 'active')
            ->orderBy('order')
            ->get();

        // Get student's submission history for each test
        $testsWithProgress = $tests->map(function ($test) use ($studentId) {
            $submissions = TestSubmission::where('test_id', $test->test_id)
                ->where('student_id', $studentId)
                ->orderBy('attempt_number', 'desc')
                ->get();

            $latestSubmission = $submissions->first();
            $attemptsUsed = $submissions->count();
            $canRetake = $test->max_attempts === null || $attemptsUsed < $test->max_attempts;
            $hasInProgress = $submissions->where('status', 'in_progress')->isNotEmpty();

            return [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'description' => $test->description,
                'time_limit' => $test->time_limit,
                'max_attempts' => $test->max_attempts,
                'passing_score' => $test->passing_score,
                'questions_count' => $test->questions_count,
                'total_points' => $test->total_points,
                'attempts_used' => $attemptsUsed,
                'can_retake' => $canRetake,
                'has_in_progress' => $hasInProgress,
                'latest_score' => $latestSubmission ? $latestSubmission->score : null,
                'latest_status' => $latestSubmission ? $latestSubmission->status : null,
                'in_progress_submission_id' => $hasInProgress ? $submissions->where('status', 'in_progress')->first()->submission_id : null,
            ];
        });

        return Inertia::render('Student/Tests/Index', [
            'lesson' => [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ],
            'tests' => $testsWithProgress,
        ]);
    }

    /**
     * Show test details before starting
     * GET /student/lessons/{lesson}/tests/{test}
     */
    public function show(Lesson $lesson, Test $test)
    {
        if ($test->lesson_id !== $lesson->lesson_id) {
            abort(404);
        }

        if ($test->status !== 'active') {
            return back()->withErrors(['error' => 'This test is not currently available.']);
        }

        $studentId = $this->getStudentIdOrFail();
        $this->ensureLessonContentReviewed($lesson, $studentId);

        // Get student's submission history
        $submissions = TestSubmission::where('test_id', $test->test_id)
            ->where('student_id', $studentId)
            ->orderBy('attempt_number', 'desc')
            ->get();

        $attemptsUsed = $submissions->count();
        $canStart = $test->max_attempts === null || $attemptsUsed < $test->max_attempts;
        $hasInProgress = $submissions->where('status', 'in_progress')->isNotEmpty();
        $inProgressSubmission = $hasInProgress ? $submissions->where('status', 'in_progress')->first() : null;

        $previousAttempts = $submissions->whereIn('status', ['submitted', 'timeout'])->map(function ($submission) {
            return [
                'submission_id' => $submission->submission_id,
                'attempt_number' => $submission->attempt_number,
                'score' => $submission->score,
                'status' => $submission->status,
                'submitted_at' => $submission->submitted_at,
                'time_spent' => $submission->time_spent,
            ];
        });

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
                'max_attempts' => $test->max_attempts,
                'passing_score' => $test->passing_score,
                'questions_count' => $test->questions_count,
                'total_points' => $test->total_points,
                'shuffle_questions' => $test->shuffle_questions,
            ],
            'attempts_used' => $attemptsUsed,
            'can_start' => $canStart,
            'has_in_progress' => $hasInProgress,
            'in_progress_submission_id' => $inProgressSubmission ? $inProgressSubmission->submission_id : null,
            'previous_attempts' => $previousAttempts,
        ]);
    }

    /**
     * Start a new test attempt
     * POST /student/lessons/{lesson}/tests/{test}/start
     */
    public function start(Request $request, Lesson $lesson, Test $test)
    {
        if ($test->lesson_id !== $lesson->lesson_id || $test->status !== 'active') {
            abort(404);
        }

        $studentId = $this->getStudentIdOrFail();
        $this->ensureLessonContentReviewed($lesson, $studentId);

        // Check if there's already an in-progress submission
        $existingSubmission = TestSubmission::where('test_id', $test->test_id)
            ->where('student_id', $studentId)
            ->where('status', 'in_progress')
            ->first();

        if ($existingSubmission) {
            return redirect()->route('student.submissions.taking', ['submission' => $existingSubmission->submission_id]);
        }

        // Check if student has attempts left (count completed attempts only)
        $completedAttemptsUsed = TestSubmission::where('test_id', $test->test_id)
            ->where('student_id', $studentId)
            ->whereIn('status', ['submitted', 'timeout'])
            ->count();

        if ($test->max_attempts !== null && $completedAttemptsUsed >= $test->max_attempts) {
            return back()->withErrors(['error' => 'You have used all available attempts for this test.']);
        }

        $lastAttemptNumber = (int) TestSubmission::where('test_id', $test->test_id)
            ->where('student_id', $studentId)
            ->max('attempt_number');

        DB::beginTransaction();
        try {
            // Create new submission
            $submission = TestSubmission::create([
                'test_id' => $test->test_id,
                'student_id' => $studentId,
                'attempt_number' => $lastAttemptNumber + 1,
                'started_at' => now(),
                'total_questions' => $test->questions_count,
                'status' => 'in_progress',
                'metadata' => [
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ],
            ]);

            DB::commit();

            return redirect()->route('student.submissions.taking', ['submission' => $submission->submission_id]);
        } catch (\Exception $e) {
            DB::rollback();
            // 记录错误到日志方便排查
            Log::error('Failed to start test: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return back()->withErrors(['error' => 'Failed to start test. Please try again.']);
        }
    }

    /**
     * Display the test-taking interface
     * GET /student/submissions/{submission}
     */
    public function taking(TestSubmission $submission)
    {
        $studentId = $this->getStudentIdOrFail();

        if ($submission->student_id !== $studentId) {
            abort(403, 'Unauthorized access to this submission.');
        }

        if ($submission->status !== 'in_progress') {
            return redirect()->route('student.submissions.result', ['submission' => $submission->submission_id]);
        }

        $test = $submission->test;
        $lesson = $test->lesson;

        // Check if time limit has expired
        if ($test->time_limit) {
            $startedAt = Carbon::parse($submission->started_at);
            $expiresAt = $startedAt->addMinutes($test->time_limit);

            if (now()->greaterThan($expiresAt)) {
                $this->autoSubmitTimeout($submission);
                return redirect()->route('student.submissions.result', ['submission' => $submission->submission_id])
                    ->with('warning', 'Time limit expired. Test has been automatically submitted.');
            }
        }

        // Get questions
        $query = Question::where('test_id', $test->test_id)
            ->where('status', 'active')
            ->with('options')
            ->orderBy('order');

        if ($test->shuffle_questions) {
            $query->inRandomOrder();
        }

        $questions = $query->get();

        // Get existing answers
        $existingAnswers = SubmissionAnswer::where('submission_id', $submission->submission_id)
            ->get()
            ->keyBy('question_id');

        $questionsData = $questions->map(function ($question) use ($existingAnswers) {
            $existingAnswer = $existingAnswers->get($question->question_id);

            $questionData = [
                'question_id' => $question->question_id,
                'type' => $question->type,
                'question_text' => $question->question_text,
                'code_snippet' => $question->code_snippet,
                'points' => $question->points,
                'order' => $question->order,
            ];

            // Add options for MCQ (without revealing correct answers)
            if ($question->type === 'mcq') {
                $questionData['options'] = $question->options->map(function ($option) {
                    return [
                        'option_id' => $option->option_id,
                        'option_label' => $option->option_label,
                        'option_text' => $option->option_text,
                    ];
                });
            }

            // Add existing answer if any
            if ($existingAnswer) {
                $questionData['saved_answer'] = [
                    'answer_text' => $existingAnswer->answer_text,
                    'selected_options' => $existingAnswer->selected_options,
                    'code_answer' => $existingAnswer->code_answer,
                ];
            }

            return $questionData;
        });

        return Inertia::render('Student/Tests/Taking', [
            'lesson' => $lesson ? [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ] : null,
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'instructions' => $test->instructions,
                'time_limit' => $test->time_limit,
                'total_points' => $test->total_points,
                'is_placement' => $test->test_type === 'placement',
            ],
            'submission' => [
                'submission_id' => $submission->submission_id,
                'attempt_number' => $submission->attempt_number,
                'started_at' => $submission->started_at,
            ],
            'questions' => $questionsData,
        ]);
    }

    /**
     * Save/update answer for a question
     * POST /student/submissions/{submission}/answer
     */
    public function submitAnswer(Request $request, TestSubmission $submission)
    {
        $studentId = $this->getStudentIdOrFail();

        if ($submission->student_id !== $studentId || $submission->status !== 'in_progress') {
            return response()->json(['error' => 'Invalid submission'], 403);
        }

        $request->validate([
            'question_id' => 'required|exists:questions,question_id',
            'answer_text' => 'nullable|string',
            'selected_options' => 'nullable|array',
            'code_answer' => 'nullable|string',
        ]);

        $question = Question::findOrFail($request->question_id);

        if ($question->test_id !== $submission->test_id) {
            return response()->json(['error' => 'Question does not belong to this test'], 400);
        }

        // Update or create answer
        SubmissionAnswer::updateOrCreate(
            [
                'submission_id' => $submission->submission_id,
                'question_id' => $request->question_id,
            ],
            [
                'answer_text' => $request->answer_text,
                'selected_options' => $request->selected_options,
                'code_answer' => $request->code_answer,
                'answered_at' => now(),
            ]
        );

        return response()->json(['success' => true, 'message' => 'Answer saved']);
    }

    /**
     * Complete and submit the test
     * POST /student/submissions/{submission}/complete
     */
    public function complete(Request $request, TestSubmission $submission)
    {
        $studentId = $this->getStudentIdOrFail();

        if ($submission->student_id !== $studentId || $submission->status !== 'in_progress') {
            return back()->withErrors(['error' => 'Invalid submission']);
        }

        DB::beginTransaction();
        try {
            // Grade the submission
            $this->gradeSubmission($submission);

            DB::commit();

            return redirect()->route('student.submissions.result', ['submission' => $submission->submission_id])
                ->with('success', 'Test submitted successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to complete test: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return back()->withErrors(['error' => 'Failed to submit test. Please try again.']);
        }
    }

    /**
     * Display test results
     * GET /student/submissions/{submission}/result
     */
    public function result(TestSubmission $submission)
    {
        $studentId = $this->getStudentIdOrFail();

        if ($submission->student_id !== $studentId) {
            abort(403);
        }

        if ($submission->status === 'in_progress') {
            return redirect()->route('student.submissions.taking', ['submission' => $submission->submission_id]);
        }

        $test = $submission->test;
        $lesson = $test->lesson;

        $answers = SubmissionAnswer::where('submission_id', $submission->submission_id)
            ->with('question.options')
            ->get();

        $resultsData = null;

        // Show detailed results if allowed
        if ($test->show_results_immediately || $test->allow_review) {
            $resultsData = $answers->map(function ($answer) use ($test) {
                $question = $answer->question;

                $result = [
                    'question_id' => $question->question_id,
                    'question_text' => $question->question_text,
                    'type' => $question->type,
                    'points' => $question->points,
                    'points_earned' => $answer->points_earned,
                    'is_correct' => $answer->is_correct,
                ];

                // Show student's answer
                if ($question->type === 'mcq') {
                    $result['student_answer'] = $question->options->whereIn('option_id', $answer->selected_options ?? [])->pluck('option_text');
                } else {
                    $result['student_answer'] = $answer->answer_text ?? $answer->code_answer;
                }

                // Show correct answer and explanation if review is allowed
                if ($test->allow_review) {
                    if ($question->type === 'mcq') {
                        $result['correct_answer'] = $question->options->where('is_correct', true)->pluck('option_text');
                    } else {
                        $result['correct_answer'] = $question->correct_answer;
                    }
                    $result['explanation'] = $question->explanation;
                    $result['feedback'] = $answer->feedback;
                }

                return $result;
            });
        }

        return Inertia::render('Student/Tests/Result', [
            'lesson' => $lesson ? [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
            ] : null,
            'test' => [
                'test_id' => $test->test_id,
                'title' => $test->title,
                'passing_score' => $test->passing_score,
                'total_points' => $test->total_points,
                'allow_review' => $test->allow_review,
            ],
            'submission' => [
                'submission_id' => $submission->submission_id,
                'attempt_number' => $submission->attempt_number,
                'score' => $submission->score,
                'correct_answers' => $submission->correct_answers,
                'total_questions' => $submission->total_questions,
                'time_spent' => $submission->time_spent,
                'submitted_at' => $submission->submitted_at,
                'status' => $submission->status,
            ],
            'results' => $resultsData,
            'passed' => $submission->score >= $test->passing_score,
        ]);
    }

    /**
     * Grade the submission
     */
    private function gradeSubmission(TestSubmission $submission)
    {
        $test = $submission->test;
        $answers = SubmissionAnswer::where('submission_id', $submission->submission_id)->get();
        $questions = Question::where('test_id', $test->test_id)->with('options')->get()->keyBy('question_id');

        $correctCount = 0;
        $totalPoints = 0;

        foreach ($answers as $answer) {
            $question = $questions->get($answer->question_id);
            if (!$question) continue;

            $isCorrect = false;
            $pointsEarned = 0;

            switch ($question->type) {
                case 'mcq':
                    $correctOptionIds = $question->options
                        ->where('is_correct', true)
                        ->pluck('option_id')
                        ->map(fn($id) => (string) $id)
                        ->values()
                        ->toArray();
                    $studentOptionIds = collect($answer->selected_options ?? [])
                        ->map(fn($id) => (string) $id)
                        ->values()
                        ->toArray();
                    sort($correctOptionIds);
                    sort($studentOptionIds);
                    $isCorrect = $correctOptionIds === $studentOptionIds;
                    break;

                case 'true_false':
                    $isCorrect = $this->normalizeTrueFalseAnswer($answer->answer_text)
                        === $this->normalizeTrueFalseAnswer($question->correct_answer);
                    break;

                case 'short_answer':
                    $isCorrect = $this->normalizeShortAnswer($answer->answer_text)
                        === $this->normalizeShortAnswer($question->correct_answer);
                    break;

                case 'coding':
                    $isCorrect = $this->normalizeCodingAnswer($answer->code_answer)
                        === $this->normalizeCodingAnswer($question->correct_answer);
                    break;
            }

            if ($isCorrect) {
                $correctCount++;
                $pointsEarned = $question->points;
            }

            $totalPoints += $pointsEarned;

            // Update answer
            $answer->update([
                'is_correct' => $isCorrect,
                'points_earned' => $pointsEarned,
            ]);
        }

        // Calculate score percentage
        $maxPoints = $questions->sum('points');
        $scorePercentage = $maxPoints > 0 ? round(($totalPoints / $maxPoints) * 100, 2) : 0;

        // Calculate time spent
        $startedAt = Carbon::parse($submission->started_at);
        $submittedAt = now();
        $timeSpent = max(0, $startedAt->diffInSeconds($submittedAt, false));

        // Update submission
        $submission->update([
            'submitted_at' => $submittedAt,
            'status' => $submission->status === 'timeout' ? 'timeout' : 'submitted',
            'score' => $scorePercentage,
            'correct_answers' => $correctCount,
            'time_spent' => $timeSpent,
        ]);
    }

    private function normalizeTrueFalseAnswer($value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = strtolower(trim((string) $value));
        if (in_array($normalized, ['true', '1', 'yes'], true)) {
            return 'true';
        }
        if (in_array($normalized, ['false', '0', 'no'], true)) {
            return 'false';
        }

        return $normalized;
    }

    private function normalizeShortAnswer($value): string
    {
        if ($value === null) {
            return '';
        }

        return preg_replace('/\s+/', ' ', strtolower(trim((string) $value)));
    }

    private function normalizeCodingAnswer($value): string
    {
        if ($value === null) {
            return '';
        }

        $normalized = str_replace(["\r\n", "\r"], "\n", (string) $value);
        $normalized = preg_replace('/[ \t]+$/m', '', $normalized);

        return trim($normalized);
    }

    /**
     * Auto-submit when time expires
     */
    private function autoSubmitTimeout(TestSubmission $submission)
    {
        $submission->update(['status' => 'timeout']);
        $this->gradeSubmission($submission);
    }
}
