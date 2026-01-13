<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\LessonRegistration;
use App\Models\InteractiveExercise;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\StudentProfile;
use App\Models\LessonProgress;
use App\Services\LearningPathProgressService;

class LessonController extends Controller
{
    protected $pathProgressService;

    public function __construct(LearningPathProgressService $pathProgressService)
    {
        $this->pathProgressService = $pathProgressService;
    }

    public function index(Request $request)
    {
        $query = Lesson::where('status', 'active')
            ->orderBy('created_at', 'desc');

        if ($q = $request->input('q')) {
            $query->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                    ->orWhere('content', 'like', "%{$q}%");
            });
        }

        if ($difficulty = $request->input('difficulty')) {
            if ($difficulty !== 'all') {
                $query->where('difficulty', $difficulty);
            }
        }

        $lessons = $query->paginate(12)->withQueryString();

        // Get registration status for current student if authenticated
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'student') {
                $studentProfile = $user->studentProfile ?? null;
                if ($studentProfile) {
                    $registrations = LessonRegistration::where('student_id', $studentProfile->student_id)
                        ->whereIn('lesson_id', $lessons->pluck('lesson_id'))
                        ->get()
                        ->keyBy('lesson_id');

                    // Add registration status to each lesson
                    $lessons->getCollection()->transform(function ($lesson) use ($registrations) {
                        $lesson->registration_status = $registrations->get($lesson->lesson_id)?->registration_status;
                        $lesson->is_registered = isset($registrations[$lesson->lesson_id]);
                        return $lesson;
                    });
                }
            }
        }

        return Inertia::render('Lessons/Index', [
            'lessons' => $lessons,
            'filters' => $request->only(['q', 'difficulty'])
        ]);
    }

    public function show(Lesson $lesson)
    {
        $user = Auth::user();
        $isRegistered = false;
        $registrationStatus = null;
        $progressData = null;

        $lesson->load(['sections' => function ($query) {
            $query->orderBy('order_index');
        }]);


        $exercises = $lesson->interactiveExercises()
            ->where('is_active', true)
            ->orderBy('created_at')
            ->get()
            ->map(function ($exercise) {
                return [
                    'exercise_id' => $exercise->exercise_id,
                    'title' => $exercise->title,
                    'description' => $exercise->description,
                    'exercise_type' => $exercise->exercise_type,
                    'max_score' => $exercise->max_score,
                    'time_limit_sec' => $exercise->time_limit_sec,
                ];
            });


        $tests = $lesson->tests()
            ->where('status', 'active')
            ->orderBy('order')
            ->get()
            ->map(function ($test) {
                return [
                    'test_id' => $test->test_id,
                    'title' => $test->title,
                    'description' => $test->description,
                    'time_limit' => $test->time_limit,
                    'max_attempts' => $test->max_attempts,
                    'passing_score' => $test->passing_score,
                    'questions_count' => $test->questions_count,
                    'total_points' => $test->total_points,
                ];
            });


        $userProgress = [
            'exercises' => [],
            'tests' => []
        ];

        if ($user && $user->role === 'student') {
            $studentId = $user->studentProfile->student_id ?? null;

            if ($studentId) {

                $registration = LessonRegistration::where('lesson_id', $lesson->lesson_id)
                    ->where('student_id', $studentId)
                    ->first();

                $isRegistered = (bool) $registration;
                $registrationStatus = $registration ? $registration->registration_status : null;

                $progress = LessonProgress::firstOrCreate(
                    [
                        'student_id' => $studentId,
                        'lesson_id' => $lesson->lesson_id,
                    ],
                    [
                        'status' => 'not_started',
                        'progress_percent' => 0,
                    ]
                );


                if ($isRegistered && $progress->status === 'not_started') {
                    $progress->markAsStarted();
                }


                if ($isRegistered) {
                    $progress->updateCompletionFlags();
                    $calculatedProgress = $progress->calculateProgress();
                    $progress->updateProgress($calculatedProgress);
                    $progress->refresh();
                }

                $progressData = [
                    'status' => $progress->status,
                    'status_label' => $progress->status_label,
                    'progress_percent' => $progress->progress_percent,
                    'exercise_completed' => $progress->exercise_completed,
                    'test_completed' => $progress->test_completed,
                    'reward_granted' => $progress->reward_granted,
                    'started_at' => $progress->started_at?->toIso8601String(),
                    'completed_at' => $progress->completed_at?->toIso8601String(),
                    'last_updated_at' => $progress->last_updated_at?->toIso8601String(),
                ];


                $exerciseSubmissions = \App\Models\ExerciseSubmission::where('student_id', $studentId)
                    ->whereIn('exercise_id', $exercises->pluck('exercise_id'))
                    ->get()
                    ->groupBy('exercise_id');

                foreach ($exercises as $exercise) {
                    $submissions = $exerciseSubmissions->get($exercise['exercise_id'], collect());
                    $bestSubmission = $submissions->sortByDesc('score')->first();

                    $userProgress['exercises'][$exercise['exercise_id']] = [
                        'completed' => $bestSubmission && $bestSubmission->score >= ($exercise['max_score'] * 0.7),
                        'score' => $bestSubmission ? $bestSubmission->score : 0,
                        'attempts' => $submissions->count(),
                    ];
                }


                $testSubmissions = \App\Models\TestSubmission::where('student_id', $studentId)
                    ->whereIn('test_id', $tests->pluck('test_id'))
                    ->get()
                    ->groupBy('test_id');

                foreach ($tests as $test) {
                    $submissions = $testSubmissions->get($test['test_id'], collect());
                    $latestSubmission = $submissions->sortByDesc('attempt_number')->first();
                    $inProgress = $submissions->where('status', 'in_progress')->first();

                    $userProgress['tests'][$test['test_id']] = [
                        'attempts_used' => $submissions->count(),
                        'latest_score' => $latestSubmission ? $latestSubmission->score : null,
                        'latest_status' => $latestSubmission ? $latestSubmission->status : null,
                        'has_in_progress' => (bool) $inProgress,
                        'in_progress_submission_id' => $inProgress ? $inProgress->submission_id : null,
                    ];
                }
            }
        }

        return Inertia::render('Lessons/Show', [
            'lesson' => array_merge($lesson->toArray(), [
                'is_registered' => $isRegistered,
                'registration_status' => $registrationStatus,
            ]),
            'sections' => $lesson->sections,
            'exercises' => $exercises,
            'tests' => $tests,
            'userProgress' => $userProgress,
            'lessonProgress' => $progressData,
        ]);
    }

    /**
     * Register student for a lesson - IMMEDIATE REGISTRATION
     */
    public function register(Request $request, Lesson $lesson)
    {
        Log::info('=== REGISTRATION START ===');
        Log::info('Lesson ID: ' . $lesson->lesson_id);
        Log::info('Request method: ' . $request->method());

        if (!Auth::check()) {
            Log::info('User not authenticated');
            return redirect()->back()->with('error', 'Authentication required');
        }

        $user = Auth::user();
        Log::info('User authenticated: ' . $user->email);
        Log::info('User role: ' . $user->role);

        if ($user->role !== 'student') {
            Log::info('User is not a student, role: ' . $user->role);
            return redirect()->back()->with('error', 'Only students can register for lessons');
        }

        $studentProfile = $user->studentProfile ?? null;
        Log::info('Student profile exists: ' . ($studentProfile ? 'YES' : 'NO'));

        if ($studentProfile) {
            Log::info('Student profile ID: ' . $studentProfile->student_id);
        }

        if (!$studentProfile) {
            Log::info('No student profile found for user: ' . $user->email);
            return redirect()->back()->with('error', 'Student profile not found');
        }

        Log::info('Lesson status: ' . $lesson->status);
        if ($lesson->status !== 'active') {
            Log::info('Lesson not active');
            return redirect()->back()->with('error', 'Lesson is not available for registration');
        }

        try {
            Log::info('Starting registration process...');

            // Check if already registered
            $existingRegistration = LessonRegistration::where('student_id', $studentProfile->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            Log::info('Existing registration check: ' . ($existingRegistration ? 'FOUND' : 'NONE'));

            if ($existingRegistration) {
                Log::info('Already registered, stopping');
                return redirect()->back()->with('error', 'Already registered for this lesson');
            }

            // Create new registration
            Log::info('Creating registration with data:');
            Log::info('student_id: ' . $studentProfile->student_id);
            Log::info('lesson_id: ' . $lesson->lesson_id);

            $registration = LessonRegistration::create([
                'student_id' => $studentProfile->student_id,
                'lesson_id' => $lesson->lesson_id,
            ]);

            Log::info('Registration created: ' . ($registration ? 'SUCCESS' : 'FAILED'));
            if ($registration) {
                Log::info('New registration ID: ' . $registration->registration_id);
            }

            Log::info('=== REGISTRATION SUCCESS ===');
            return redirect()->back()->with('success', 'Successfully registered for lesson!');
        } catch (\Exception $e) {
            Log::error('Registration failed with error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            Log::info('=== REGISTRATION FAILED ===');
            return redirect()->back()->with('error', 'Registration failed. Please try again.');
        }
    }

    /**
     * Cancel student registration
     */
    public function cancelRegistration(Request $request, Lesson $lesson)
    {
        if (!Auth::check()) {
            return redirect()->back()->with('error', 'Authentication required');
        }

        $user = Auth::user();

        if ($user->role !== 'student') {
            return redirect()->back()->with('error', 'Only students can cancel registrations');
        }

        $studentProfile = $user->studentProfile ?? null;
        if (!$studentProfile) {
            return redirect()->back()->with('error', 'Student profile not found');
        }

        try {
            $registration = LessonRegistration::where('student_id', $studentProfile->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->where('registration_status', 'active')
                ->first();

            if (!$registration) {
                return redirect()->back()->with('error', 'No active registration found');
            }

            // Mark as cancelled
            $registration->update(['registration_status' => 'cancelled']);

            return redirect()->back()->with('success', 'Registration cancelled successfully');
        } catch (\Exception $e) {
            Log::error('Cancellation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Cancellation failed. Please try again.');
        }
    }

    /**
     * Get student's registrations
     */
    public function myRegistrations()
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        if ($user->role !== 'student') {
            abort(403, 'Only students can view registrations');
        }

        $studentProfile = $user->studentProfile;
        if (!$studentProfile) {
            return Inertia::render('Lessons/MyRegistrations', [
                'registrations' => [],
                'error' => 'Student profile not found'
            ]);
        }

        $registrations = LessonRegistration::with(['lesson'])
            ->where('student_id', $studentProfile->student_id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Lessons/MyRegistrations', [
            'registrations' => $registrations
        ]);
    }

    // ==================== Exercise/Game Related Methods ====================

    /**
     * Show all exercises/games for a lesson
     */
    public function exerciseIndex(Lesson $lesson)
    {
        // Check if user is registered for the lesson
        $user = Auth::user();
        $isRegistered = false;

        if ($user && $user->role === 'student') {
            $studentProfile = $user->studentProfile;
            if ($studentProfile) {
                $registration = LessonRegistration::where('student_id', $studentProfile->student_id)
                    ->where('lesson_id', $lesson->lesson_id)
                    ->where('registration_status', 'active')
                    ->first();
                $isRegistered = $registration !== null;
            }
        }

        if (!$isRegistered) {
            return redirect()->route('lessons.show', $lesson)
                ->with('error', 'You must register for this lesson first.');
        }

        // Get all active exercises
        $exercises = InteractiveExercise::where('lesson_id', $lesson->lesson_id)
            ->where('is_active', true)
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Lessons/Exercises/Index', [
            'lesson' => $lesson,
            'exercises' => $exercises,
            'stats' => [
                'total_exercises' => $exercises->count(),
                'total_points' => $exercises->sum('max_score'),
            ]
        ]);
    }


    public function exerciseShow(Lesson $lesson, InteractiveExercise $exercise)
    {
        // Ensure exercise belongs to the specified lesson
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404, 'Exercise not found for this lesson');
        }

        // Ensure exercise is active
        if (!$exercise->is_active) {
            abort(404, 'Exercise is not available');
        }

        // Check if user is registered for the lesson
        $user = Auth::user();
        $isRegistered = false;

        if ($user && $user->role === 'student') {
            $studentProfile = $user->studentProfile;
            if ($studentProfile) {
                $registration = LessonRegistration::where('student_id', $studentProfile->student_id)
                    ->where('lesson_id', $lesson->lesson_id)
                    ->where('registration_status', 'active')
                    ->first();
                $isRegistered = $registration !== null;
            }
        }

        if (!$isRegistered) {
            return redirect()->route('lessons.show', $lesson)
                ->with('error', 'You must register for this lesson first.');
        }


        $exerciseData = [
            'exercise_id' => $exercise->exercise_id,
            'id' => $exercise->exercise_id,
            'title' => $exercise->title,
            'description' => $exercise->description,
            'exercise_type' => $exercise->exercise_type,
            'type' => $exercise->exercise_type,
            'content' => $exercise->content,
            'max_score' => $exercise->max_score,
            'time_limit_sec' => $exercise->time_limit_sec,
            'time_limit' => $exercise->time_limit_sec,
            'formatted_duration' => $exercise->formatted_duration,
        ];


        if ($exercise->exercise_type === 'coding') {
            $exerciseData = array_merge($exerciseData, [
                'starter_code' => $exercise->starter_code ?? '',
                'coding_instructions' => $exercise->coding_instructions ?? '',
                'test_cases' => $exercise->test_cases ?? [],
                'enable_live_editor' => $exercise->enable_live_editor ?? false,
            ]);

            Log::info('Coding Exercise loaded', [
                'exercise_id' => $exercise->exercise_id,
                'has_starter_code' => !empty($exercise->starter_code),
                'test_cases_count' => is_array($exercise->test_cases) ? count($exercise->test_cases) : 0,
                'enable_live_editor' => $exercise->enable_live_editor ?? false,
            ]);
        }

        return Inertia::render('Lessons/Exercises/Show', [
            'lesson' => $lesson,
            'exercise' => $exerciseData,
        ]);
    }


    public function getExercise(Lesson $lesson, InteractiveExercise $exercise)
    {
        // Ensure exercise belongs to the specified lesson
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404, 'Exercise not found for this lesson');
        }

        // Ensure exercise is active
        if (!$exercise->is_active) {
            abort(404, 'Exercise is not available');
        }

        $exerciseData = [
            'id' => $exercise->exercise_id,
            'exercise_id' => $exercise->exercise_id,
            'title' => $exercise->title,
            'description' => $exercise->description,
            'type' => $exercise->exercise_type,
            'exercise_type' => $exercise->exercise_type,
            'content' => $exercise->content,
            'max_score' => $exercise->max_score,
            'time_limit' => $exercise->time_limit_sec,
            'time_limit_sec' => $exercise->time_limit_sec,
        ];

        // 🔥 如果是 Coding Exercise
        if ($exercise->exercise_type === 'coding') {
            $exerciseData = array_merge($exerciseData, [
                'starter_code' => $exercise->starter_code ?? '',
                'coding_instructions' => $exercise->coding_instructions ?? '',
                'test_cases' => $exercise->test_cases ?? [],
                'enable_live_editor' => $exercise->enable_live_editor ?? false,
            ]);
        }

        return response()->json([
            'success' => true,
            'exercise' => $exerciseData,
        ]);
    }

    /**
     * Submit exercise answer
     */
    public function submitExercise(Request $request, Lesson $lesson, InteractiveExercise $exercise)
    {
        $request->validate([
            'answer' => 'required',
            'time_spent' => 'integer|min:0',
        ]);

        // Ensure exercise belongs to the specified lesson
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404, 'Exercise not found for this lesson');
        }

        // Ensure exercise is active
        if (!$exercise->is_active) {
            abort(400, 'Exercise is not available');
        }

        // Ensure user is registered for the lesson
        $user = Auth::user();
        if ($user->role === 'student') {
            $studentProfile = $user->studentProfile;
            if ($studentProfile) {
                $registration = LessonRegistration::where('student_id', $studentProfile->student_id)
                    ->where('lesson_id', $lesson->lesson_id)
                    ->where('registration_status', 'active')
                    ->first();

                if (!$registration) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You must be registered for this lesson to submit exercises'
                    ], 403);
                }
            }
        }

        $answer = $request->input('answer');
        $timeSpent = $request->input('time_spent', 0);

        // Calculate score based on exercise type
        $score = $this->calculateScore($exercise, $answer);

        return response()->json([
            'success' => true,
            'score' => $score,
            'max_score' => $exercise->max_score,
            'percentage' => round(($score / $exercise->max_score) * 100, 1),
            'feedback' => $this->generateFeedback($exercise, $score),
            'time_spent' => $timeSpent,
        ]);
    }

    /**
     * Simplified scoring method
     */
    private function calculateScore(InteractiveExercise $exercise, $answer): int
    {
        switch ($exercise->exercise_type) {
            case 'drag_drop':
                return $this->scoreDragDrop($exercise->content, $answer, $exercise->max_score);

            case 'adventure_game':
                return $this->scoreAdventure($exercise->content, $answer, $exercise->max_score);

            case 'coding':
                return $answer['score'] ?? 0;

            default:
                return $exercise->max_score;
        }
    }

    /**
     * Score drag and drop game
     */
    private function scoreDragDrop($content, $answer, $maxScore): int
    {
        if (!isset($content['items']) || !is_array($answer)) {
            return 0;
        }

        $correctMatches = 0;
        $totalItems = count($content['items']);

        foreach ($answer as $itemId => $zone) {
            $correctZone = collect($content['items'])->firstWhere('id', $itemId)['correct_zone'] ?? null;
            if ($correctZone === $zone) {
                $correctMatches++;
            }
        }

        return round(($correctMatches / $totalItems) * $maxScore);
    }

    /**
     * Score adventure game
     */
    private function scoreAdventure($content, $answer, $maxScore): int
    {
        if (!isset($content['scenarios']) || !is_array($answer)) {
            return 0;
        }

        $correctAnswers = 0;
        $totalScenarios = count($content['scenarios']);

        foreach ($answer as $scenarioId => $choiceIndex) {
            $scenario = collect($content['scenarios'])->firstWhere('id', $scenarioId);
            if ($scenario && isset($scenario['choices'][$choiceIndex]) && $scenario['choices'][$choiceIndex]['correct']) {
                $correctAnswers++;
            }
        }

        return round(($correctAnswers / $totalScenarios) * $maxScore);
    }

    /**
     * Generate feedback based on score
     */
    private function generateFeedback(InteractiveExercise $exercise, int $score): array
    {
        $percentage = ($score / $exercise->max_score) * 100;

        if ($percentage >= 90) {
            return [
                'level' => 'excellent',
                'message' => 'Excellent work! You have mastered this concept completely!',
                'suggestion' => 'Keep it up and move on to the next challenge!'
            ];
        } elseif ($percentage >= 70) {
            return [
                'level' => 'good',
                'message' => 'Well done! You understand most of the content.',
                'suggestion' => 'A bit more practice on the details will make it perfect.'
            ];
        } elseif ($percentage >= 50) {
            return [
                'level' => 'okay',
                'message' => 'Good try! You have grasped the basic concepts.',
                'suggestion' => 'Review the lesson content and try again.'
            ];
        } else {
            return [
                'level' => 'needs_improvement',
                'message' => 'Keep going! Learning programming takes time and practice.',
                'suggestion' => 'Review the lesson content first. Feel free to ask for help if needed.'
            ];
        }
    }

    public function completeLesson(Lesson $lesson)
    {
        try {
            Log::info('=== Starting lesson completion process ===', ['lesson_id' => $lesson->lesson_id]);

            $user = Auth::user();

            if (!$user) {
                Log::warning('User not authenticated');
                return back()->withErrors(['error' => 'User not authenticated.']);
            }

            if ($user->role !== 'student') {
                Log::warning('User is not a student', ['user_Id' => $user->user_Id, 'role' => $user->role]);
                return back()->withErrors(['error' => 'Only students can complete lessons.']);
            }

            $studentProfile = StudentProfile::where('user_Id', $user->user_Id)->first();

            if (!$studentProfile) {
                Log::error('Student profile does not exist', ['user_Id' => $user->user_Id]);
                return back()->withErrors(['error' => 'Student profile not found.']);
            }

            Log::info('Student profile found', ['student_id' => $studentProfile->student_id]);

            $registration = LessonRegistration::where('student_id', $studentProfile->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            if (!$registration) {
                Log::warning('Student is not registered for this lesson');
                return back()->withErrors(['error' => 'You are not registered for this lesson.']);
            }

            if ($registration->registration_status === 'completed') {
                Log::info('This lesson has already been completed');
                return back()->withErrors(['error' => 'You have already completed this lesson.']);
            }

            // 🔥 Get progress record
            $progress = LessonProgress::where('student_id', $studentProfile->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            if ($progress && $progress->reward_granted) {
                Log::warning('Reward has already been granted');
                return back()->withErrors(['error' => 'You have already received the completion reward.']);
            }

            // Verify exercises
            $exercises = $lesson->interactiveExercises()->where('is_active', true)->get();
            $completedExercises = 0;

            foreach ($exercises as $exercise) {
                if ($studentProfile->hasCompletedExercise($exercise->exercise_id)) {
                    $completedExercises++;
                }
            }

            if ($completedExercises < $exercises->count()) {
                Log::warning('There are still unfinished exercises');
                return back()->withErrors(['error' => "Please complete all exercises first. ($completedExercises/{$exercises->count()})."]);
            }

            // Verify tests
            $tests = $lesson->tests()->where('status', 'active')->get();
            $passedTests = 0;

            foreach ($tests as $test) {
                $bestScore = $studentProfile->getBestScoreForTest($test->test_id);
                if ($bestScore !== null && $bestScore >= $test->passing_score) {
                    $passedTests++;
                }
            }

            if ($passedTests < $tests->count()) {
                Log::warning('There are still tests not passed');
                return back()->withErrors(['error' => "Please pass all tests first. ($passedTests/{$tests->count()})."]);
            }

            // Update database
            DB::beginTransaction();

            try {
                // Update registration
                $registration->update([
                    'registration_status' => 'completed',
                    'exercises_completed' => $completedExercises,
                    'tests_passed' => $passedTests,
                    'completion_points_awarded' => $lesson->completion_reward_points,
                    'completed_at' => now(),
                ]);

                Log::info('✓ Registration status updated');

                // 🔥 Update progress record
                if ($progress) {
                    $progress->markAsCompleted(true);
                    Log::info('✓ Progress record updated to completed');
                } else {
                    $progress = LessonProgress::create([
                        'student_id' => $studentProfile->student_id,
                        'lesson_id' => $lesson->lesson_id,
                        'status' => 'completed',
                        'progress_percent' => 100,
                        'exercise_completed' => true,
                        'test_completed' => true,
                        'reward_granted' => true,
                        'started_at' => now(),
                        'completed_at' => now(),
                        'last_updated_at' => now(),
                    ]);
                    Log::info('✓ New completed progress record created');
                }

                // 🔥🔥🔥 Key: update learning path progress
                $this->pathProgressService->updatePathsForLesson(
                    $studentProfile->student_id,
                    $lesson->lesson_id
                );
                Log::info('✓ Learning path progress updated');

                // Add points
                $studentProfile->increment('current_points', $lesson->completion_reward_points);
                Log::info('✓ Points added', ['points_added' => $lesson->completion_reward_points]);

                // Update lesson count
                $studentProfile->increment('total_lessons_completed');

                // Update streak
                $today = now()->toDateString();
                $lastActivityDate = $studentProfile->last_activity_date?->toDateString();

                $streakUpdate = ['last_activity_date' => $today];

                if ($lastActivityDate !== $today) {
                    if ($lastActivityDate === now()->subDay()->toDateString()) {
                        $studentProfile->increment('streak_days');
                    } else {
                        $studentProfile->update(['streak_days' => 1]);
                    }
                }

                $studentProfile->update($streakUpdate);

                Notification::create([
                    'user_Id' => $user->user_Id,
                    'type' => 'lesson',
                    'priority' => 'high',
                    'title' => '🎉 Lesson Completed!',
                    'message' => "Congratulations on completing the lesson \"{$lesson->title}\"! You earned {$lesson->completion_reward_points} points.",
                    'icon' => 'trophy',
                    'color' => 'yellow',
                    'data' => [
                        'lesson_id' => $lesson->lesson_id,
                        'lesson_title' => $lesson->title,
                        'points_earned' => $lesson->completion_reward_points,
                        'exercises_completed' => $completedExercises,
                        'tests_passed' => $passedTests,
                    ],
                    'action_url' => route('lessons.show', $lesson->lesson_id),
                    'action_text' => 'View Details',
                ]);

                Log::info('✓ Lesson completion notification sent');

                DB::commit();

                Log::info('✓ Lesson completed successfully!');

                return back()->with('lesson_completed', true)
                    ->with('success', 'Congratulations! You have completed the lesson and earned ' . $lesson->completion_reward_points . ' points!');
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Transaction failed', ['error' => $e->getMessage()]);
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('❌ completeLesson exception', [
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ]);
            return back()->withErrors(['error' => 'An unexpected error occurred: ' . $e->getMessage()]);
        }
    }

    public static function notifyStudentsAboutNewLesson(Lesson $lesson)
    {
        try {
            // Get all student users
            $students = User::where('role', 'student')->get();

            $notifiedCount = 0;

            foreach ($students as $student) {
                Notification::create([
                    'user_Id' => $student->user_Id,
                    'type' => 'lesson',
                    'priority' => 'normal',
                    'title' => '🎓 New Lesson Released!',
                    'message' => "A new lesson \"{$lesson->title}\" has been released. Start learning now!",
                    'icon' => 'book',
                    'color' => 'blue',
                    'data' => [
                        'lesson_id' => $lesson->lesson_id,
                        'lesson_title' => $lesson->title,
                        'difficulty' => $lesson->difficulty,
                    ],
                    'action_url' => route('lessons.show', $lesson->lesson_id),
                    'action_text' => 'View Lesson',
                ]);

                $notifiedCount++;
            }

            Log::info('📢 Sent new lesson notifications', [
                'lesson_id' => $lesson->lesson_id,
                'lesson_title' => $lesson->title,
                'students_notified' => $notifiedCount,
            ]);

            return $notifiedCount;
        } catch (\Exception $e) {
            Log::error('❌ Failed to send lesson notifications', [
                'lesson_id' => $lesson->lesson_id,
                'error' => $e->getMessage(),
            ]);
            return 0;
        }
    }
}
