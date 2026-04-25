<?php

namespace App\Http\Controllers\Student;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\TestSubmission;
use App\Models\LearningPath;
use App\Models\StudentLearningPath;
use App\Services\LearningPathRecommendationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OnboardingController extends Controller
{
    protected $recommendationService;

    public function __construct(LearningPathRecommendationService $recommendationService)
    {
        $this->middleware(['auth']);
        $this->recommendationService = $recommendationService;
    }

    /**
     * Show onboarding welcome page
     */
    public function index()
    {
        $user = Auth::user();

        // Only students can access onboarding
        if ($user->role !== 'student') {
            abort(403, '管理员账号无需进行学生入学评估。');
        }

        $student = $user->studentProfile;

        if (!$student) {
            return redirect()->route('dashboard')
                ->with('error', 'Student profile not found.');
        }

        // Check if student already has a learning path
        if ($student->hasActiveLearningPath()) {
            return redirect()->route('dashboard')
                ->with('info', 'You already have an active learning path!');
        }

        // Check if student has completed placement test
        if ($student->hasCompletedPlacementTest()) {
            $latestSubmission = $student->getLatestPlacementTest();

            // If they have a recommendation but haven't accepted
            if ($latestSubmission->recommended_path_id && !$latestSubmission->hasAcceptedRecommendation()) {
                return redirect()->route('student.onboarding.result', $latestSubmission->submission_id);
            }
        }

        return Inertia::render('Student/Onboarding/Welcome', [
            'student' => [
                'name' => $student->user->name,
                'email' => $student->user->email,
            ],
        ]);
    }

    /**
     * Start placement test
     */
    public function startTest()
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return back()->with('error', 'Only students can take placement tests.');
        }

        $student = $user->studentProfile;

        if (!$student) {
            return back()->with('error', 'Student profile not found.');
        }

        // Get placement test
        $placementTest = Test::where('test_type', 'placement')
            ->where('status', 'active')
            ->first();

        // Fallback to first placement test if active one not found
        if (!$placementTest) {
            $placementTest = Test::where('test_type', 'placement')->first();
        }

        if (!$placementTest) {
            Log::error('Placement test not found in database');
            return back()->with('error', 'Placement test not found. Please contact support.');
        }

        Log::info('Found placement test', [
            'test_id' => $placementTest->test_id,
            'test_type' => $placementTest->test_type,
            'status' => $placementTest->status,
            'title' => $placementTest->title,
        ]);

        // Check if there's an in-progress submission
        $existingSubmission = $placementTest->getInProgressSubmission($student->student_id);

        if ($existingSubmission) {
            Log::info('Resuming existing submission', [
                'submission_id' => $existingSubmission->submission_id,
            ]);
            return redirect()->route('student.submissions.taking', $existingSubmission->submission_id)
                ->with('info', 'Resuming your placement test...');
        }

        // Check if student can take the test
        if (!$placementTest->canStudentTakeTest($student->student_id)) {
            return back()->with('error', 'You have already completed the placement test.');
        }

        // 创建新的提交
        DB::beginTransaction();
        try {
            // 先检查题目数量
            $questionCount = $placementTest->questions()->count();

            Log::info('Checking questions', [
                'test_id' => $placementTest->test_id,
                'question_count' => $questionCount,
            ]);

            if ($questionCount === 0) {
                DB::rollback();
                Log::error('Placement test has no questions', [
                    'test_id' => $placementTest->test_id,
                ]);
                return back()->with('error', 'Placement test has no questions. Please contact administrator to add questions first.');
            }

            // 计算下一个 attempt number
            $lastAttempt = TestSubmission::where('test_id', $placementTest->test_id)
                ->where('student_id', $student->student_id)
                ->max('attempt_number') ?? 0;

            $nextAttemptNumber = $lastAttempt + 1;

            Log::info('Calculating attempt number', [
                'last_attempt' => $lastAttempt,
                'next_attempt' => $nextAttemptNumber,
            ]);

            $submissionData = [
                'test_id' => $placementTest->test_id,
                'student_id' => $student->student_id,
                'attempt_number' => $nextAttemptNumber,
                'started_at' => now(),
                'total_questions' => $questionCount,
                'status' => 'in_progress',
                'is_placement_test' => true,
                'is_completed' => false,
                'correct_answers' => 0,
            ];

            Log::info('Creating submission with data', $submissionData);

            $submission = TestSubmission::create($submissionData);

            Log::info('Submission created successfully', [
                'submission_id' => $submission->submission_id,
                'test_id' => $submission->test_id,
                'student_id' => $submission->student_id,
                'attempt_number' => $submission->attempt_number,
            ]);

            DB::commit();

            // 直接重定向到答题页面
            return redirect()->route('student.submissions.taking', $submission->submission_id);
        } catch (\Illuminate\Database\QueryException $e) {
            DB::rollback();
            Log::error('Database error when creating submission', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
                'code' => $e->getCode(),
            ]);

            if (config('app.debug')) {
                return back()->with('error', 'Database error: ' . $e->getMessage());
            }
            return back()->with('error', 'Failed to start test due to database error. Please try again.');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to start placement test', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString(),
                'test_id' => $placementTest->test_id ?? null,
                'student_id' => $student->student_id ?? null,
            ]);

            if (config('app.debug')) {
                return back()->with('error', 'Failed to start test: ' . $e->getMessage());
            }

            return back()->with('error', 'Failed to start test. Please try again.');
        }
    }

    /**
     * Show recommendation results after placement test
     */
    public function result($submissionId)
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return redirect()->route('dashboard')
                ->with('error', 'Unauthorized access.');
        }

        $student = $user->studentProfile;
        $submission = TestSubmission::with(['test', 'recommendedPath'])->findOrFail($submissionId);

        // Verify ownership
        if ($submission->student_id !== $student->student_id) {
            abort(403, 'Unauthorized access');
        }

        // 修改验证逻辑：检查 status 而不是 is_completed
        if (!$submission->is_placement_test) {
            Log::warning('Not a placement test', [
                'submission_id' => $submissionId,
                'is_placement_test' => $submission->is_placement_test,
            ]);
            return redirect()->route('student.onboarding.index')
                ->with('error', 'Invalid submission: not a placement test');
        }

        // 检查是否已完成（status 应该是 'submitted' 或 'timeout'）
        if (!in_array($submission->status, ['submitted', 'timeout'])) {
            Log::warning('Submission not completed', [
                'submission_id' => $submissionId,
                'status' => $submission->status,
                'is_completed' => $submission->is_completed,
            ]);
            return redirect()->route('student.submissions.taking', $submissionId)
                ->with('info', 'Please complete the test first.');
        }

        // If no recommendation yet, generate one
        if (!$submission->recommended_path_id) {
            Log::info('Generating recommendation', [
                'submission_id' => $submissionId,
            ]);

            $recommendation = $this->recommendationService->recommendFromPlacementTest($submission);

            if (!$recommendation['success']) {
                Log::error('Failed to generate recommendation', [
                    'submission_id' => $submissionId,
                    'message' => $recommendation['message'],
                ]);
                return back()->with('error', $recommendation['message']);
            }

            $submission->refresh();
        }

        // Get recommendation details
        $recommendedPath = $submission->recommendedPath;

        if (!$recommendedPath) {
            Log::error('No recommended path found', [
                'submission_id' => $submissionId,
                'recommended_path_id' => $submission->recommended_path_id,
            ]);
            return redirect()->route('student.onboarding.index')
                ->with('error', 'No suitable learning path found. Please contact support.');
        }

        $alternativePaths = $submission->getAlternativePaths(3);
        $confidence = $submission->recommendation_confidence;

        // Check if already accepted
        $alreadyAcceptedAssignment = $submission->getAcceptedPathAssignment();
        $alreadyAccepted = $alreadyAcceptedAssignment !== null;

        return Inertia::render('Student/Onboarding/RecommendedPath', [
            'submission' => [
                'submission_id' => $submission->submission_id,
                'score' => $submission->score,
                'total_questions' => $submission->total_questions,
                'correct_answers' => $submission->correct_answers,
                'time_spent' => $submission->time_spent_formatted ?? 'N/A',
                'submitted_at' => $submission->submitted_at ? $submission->submitted_at->format('M d, Y h:i A') : 'N/A',
            ],
            'recommendedPath' => [
                'path_id' => $recommendedPath->path_id,
                'title' => $recommendedPath->title,
                'description' => $recommendedPath->description,
                'learning_outcomes' => $recommendedPath->learning_outcomes,
                'prerequisites' => $recommendedPath->prerequisites,
                'difficulty_level' => $recommendedPath->difficulty_level,
                'estimated_duration_hours' => $recommendedPath->calculated_duration_hours ?? 0,
                'calculated_duration_hours' => $recommendedPath->calculated_duration_hours ?? 0,
                'total_lessons' => $recommendedPath->total_lessons,
                'icon' => $recommendedPath->icon,
                'color' => $recommendedPath->color,
                'confidence' => $confidence,
            ],
            'alternativePaths' => $alternativePaths->map(function ($path) {
                return [
                    'path_id' => $path->path_id,
                    'title' => $path->title,
                    'description' => $path->description,
                    'difficulty_level' => $path->difficulty_level,
                    'estimated_duration_hours' => $path->calculated_duration_hours ?? 0,
                    'calculated_duration_hours' => $path->calculated_duration_hours ?? 0,
                    'total_lessons' => $path->total_lessons,
                    'icon' => $path->icon,
                    'color' => $path->color,
                ];
            }),
            'message' => $submission->recommendation_message,
            'alreadyAccepted' => $alreadyAccepted,
            'acceptedStudentPathId' => $alreadyAcceptedAssignment?->student_path_id,
        ]);
    }

    /**
     * Accept recommended learning path
     */
    public function acceptPath(Request $request, $pathId)
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return back()->with('error', 'Unauthorized access.');
        }

        $student = $user->studentProfile;

        $request->validate([
            'submission_id' => 'required|exists:test_submissions,submission_id',
            'set_as_primary' => 'boolean',
        ]);

        $submission = TestSubmission::findOrFail($request->submission_id);

        // Verify ownership
        if ($submission->student_id !== $student->student_id) {
            abort(403, 'Unauthorized access');
        }

        // Verify it's a placement test
        if (!$submission->is_placement_test) {
            return back()->with('error', 'Invalid submission');
        }

        // Check if already accepted
        if ($submission->hasAcceptedRecommendation()) {
            $acceptedAssignment = $submission->getAcceptedPathAssignment();

            if ($acceptedAssignment) {
                return redirect()->route('student.paths.show', $acceptedAssignment->student_path_id)
                    ->with('info', 'You have already accepted this path.');
            }

            return redirect()->route('student.paths.index')
                ->with('info', 'You have already accepted this path.');
        }

        // Get the path
        $path = LearningPath::findOrFail($pathId);

        // Check if student already has this path
        $existingPath = StudentLearningPath::where('student_id', $student->student_id)
            ->where('path_id', $pathId)
            ->whereIn('status', ['active', 'paused'])
            ->first();

        if ($existingPath) {
            return redirect()->route('student.paths.show', $existingPath->student_path_id)
                ->with('info', 'You are already enrolled in this path.');
        }

        // Assign the path
        $studentPath = $student->assignLearningPath(
            $pathId,
            'system',
            [
                'placement_test_submission_id' => $submission->submission_id,
                'recommendation_score' => $submission->recommendation_confidence,
                'recommendation_reason' => $submission->recommendation_message,
                'is_primary' => $request->input('set_as_primary', true),
            ]
        );

        return redirect()->route('student.paths.show', $studentPath->student_path_id)
            ->with('success', "Welcome to {$path->title}! Let's start learning!");
    }

    /**
     * Choose a different path (not the recommended one)
     */
    public function choosePath(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return back()->with('error', 'Unauthorized access.');
        }

        $student = $user->studentProfile;

        $request->validate([
            'path_id' => 'required|exists:learning_paths,path_id',
            'submission_id' => 'required|exists:test_submissions,submission_id',
        ]);

        $submission = TestSubmission::findOrFail($request->submission_id);

        // Verify ownership
        if ($submission->student_id !== $student->student_id) {
            abort(403, 'Unauthorized access');
        }

        $pathId = $request->path_id;
        $path = LearningPath::findOrFail($pathId);

        // Check if student already has this path
        $existingPath = StudentLearningPath::where('student_id', $student->student_id)
            ->where('path_id', $pathId)
            ->whereIn('status', ['active', 'paused'])
            ->first();

        if ($existingPath) {
            return redirect()->route('student.paths.show', $existingPath->student_path_id)
                ->with('info', 'You are already enrolled in this path.');
        }

        // Assign the chosen path
        $studentPath = $student->assignLearningPath(
            $pathId,
            'self', // Student chose this themselves
            [
                'placement_test_submission_id' => $submission->submission_id,
                'recommendation_reason' => 'Student chose a different path',
                'is_primary' => true,
            ]
        );

        return redirect()->route('student.paths.show', $studentPath->student_path_id)
            ->with('success', "You've chosen {$path->title}. Let's start learning!");
    }

    /**
     * Skip onboarding (allow manual path selection)
     */
    public function skip()
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return back()->with('error', 'Unauthorized access.');
        }

        // Only allow if feature is enabled
        if (!config('recommendation.features.manual_path_selection', true)) {
            return back()->with('error', 'Manual path selection is not available.');
        }

        return redirect()->route('student.paths.browse')
            ->with('info', 'Browse and choose a learning path that fits your goals.');
    }
}
