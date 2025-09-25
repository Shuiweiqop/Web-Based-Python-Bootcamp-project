<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\LessonRegistration;
use App\Models\InteractiveExercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LessonController extends Controller
{
    public function index(Request $request)
    {
        $query = Lesson::where('status', 'active')
            ->orderBy('created_at', 'desc');

        if ($q = $request->input('q')) {
            $query->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
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
        try {
            $user = auth()->user();
            $isRegistered = false;
            $registrationStatus = null;

            if ($user && $user->role === 'student') {
                $studentProfile = $user->studentProfile ?? null;
                if ($studentProfile) {
                    $registration = LessonRegistration::where('student_id', $studentProfile->student_id)
                        ->where('lesson_id', $lesson->lesson_id)
                        ->where('registration_status', 'active') // Only check for active registrations
                        ->first();

                    $isRegistered = $registration !== null;
                    $registrationStatus = $registration?->registration_status ?? null;
                }
            }

            // 新增：获取该课程的所有活跃练习/游戏
            $exercises = InteractiveExercise::where('lesson_id', $lesson->lesson_id)
                ->where('is_active', true)
                ->orderBy('created_at', 'asc')
                ->get();

            // 新增：统计信息
            $totalExercises = $exercises->count();
            $totalPoints = $exercises->sum('max_score');

            $lessonData = $lesson->toArray();
            $lessonData['is_registered'] = $isRegistered;
            $lessonData['registration_status'] = $registrationStatus;

            return Inertia::render('Lessons/Show', [
                'lesson' => $lessonData,
                'exercises' => $exercises, // 新增
                'stats' => [              // 新增
                    'total_exercises' => $totalExercises,
                    'total_points' => $totalPoints,
                ],
                'auth' => [
                    'user' => $user
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in LessonController@show: ' . $e->getMessage());

            return Inertia::render('Lessons/Show', [
                'lesson' => $lesson->toArray(),
                'exercises' => [], // 新增默认值
                'stats' => ['total_exercises' => 0, 'total_points' => 0], // 新增默认值
                'auth' => [
                    'user' => auth()->user()
                ]
            ])->with('error', 'There was an error loading the lesson details.');
        }
    }
    /**
     * Register student for a lesson - IMMEDIATE REGISTRATION
     */
    public function register(Request $request, Lesson $lesson)
    {
        \Log::info('=== REGISTRATION START ===');
        \Log::info('Lesson ID: ' . $lesson->lesson_id);
        \Log::info('Request method: ' . $request->method());

        if (!Auth::check()) {
            \Log::info('User not authenticated');
            return redirect()->back()->with('error', 'Authentication required');
        }

        $user = Auth::user();
        \Log::info('User authenticated: ' . $user->email);
        \Log::info('User role: ' . $user->role);

        if ($user->role !== 'student') {
            \Log::info('User is not a student, role: ' . $user->role);
            return redirect()->back()->with('error', 'Only students can register for lessons');
        }

        $studentProfile = $user->studentProfile ?? null;
        \Log::info('Student profile exists: ' . ($studentProfile ? 'YES' : 'NO'));

        if ($studentProfile) {
            \Log::info('Student profile ID: ' . $studentProfile->student_id);
        }

        if (!$studentProfile) {
            \Log::info('No student profile found for user: ' . $user->email);
            return redirect()->back()->with('error', 'Student profile not found');
        }

        \Log::info('Lesson status: ' . $lesson->status);
        if ($lesson->status !== 'active') {
            \Log::info('Lesson not active');
            return redirect()->back()->with('error', 'Lesson is not available for registration');
        }

        try {
            \Log::info('Starting registration process...');

            // Check if already registered
            $existingRegistration = LessonRegistration::where('student_id', $studentProfile->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            \Log::info('Existing registration check: ' . ($existingRegistration ? 'FOUND' : 'NONE'));

            if ($existingRegistration) {
                \Log::info('Already registered, stopping');
                return redirect()->back()->with('error', 'Already registered for this lesson');
            }

            // Create new registration
            \Log::info('Creating registration with data:');
            \Log::info('student_id: ' . $studentProfile->student_id);
            \Log::info('lesson_id: ' . $lesson->lesson_id);

            $registration = LessonRegistration::create([
                'student_id' => $studentProfile->student_id,
                'lesson_id' => $lesson->lesson_id,
            ]);

            \Log::info('Registration created: ' . ($registration ? 'SUCCESS' : 'FAILED'));
            if ($registration) {
                \Log::info('New registration ID: ' . $registration->registration_id);
            }

            \Log::info('=== REGISTRATION SUCCESS ===');
            return redirect()->back()->with('success', 'Successfully registered for lesson!');
        } catch (\Exception $e) {
            \Log::error('Registration failed with error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            \Log::info('=== REGISTRATION FAILED ===');
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
                ->where('registration_status', 'active') // Only cancel active registrations
                ->first();

            if (!$registration) {
                return redirect()->back()->with('error', 'No active registration found');
            }

            // Simply mark as cancelled
            $registration->update(['registration_status' => 'cancelled']);

            return redirect()->back()->with('success', 'Registration cancelled successfully');
        } catch (\Exception $e) {
            \Log::error('Cancellation failed: ' . $e->getMessage());
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

    // ==================== 新增游戏相关方法 ====================

    /**
     * 显示某课程的所有练习/游戏列表页面
     */
    public function exerciseIndex(Lesson $lesson)
    {
        // 检查用户是否已注册课程
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

        // 获取所有活跃的练习
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

    /**
     * 显示单个练习/游戏页面
     */
    public function exerciseShow(Lesson $lesson, InteractiveExercise $exercise)
    {
        // 确保 exercise 属于指定的 lesson
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404, 'Exercise not found for this lesson');
        }

        // 确保练习是活跃的
        if (!$exercise->is_active) {
            abort(404, 'Exercise is not available');
        }

        // 检查用户是否已注册课程
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

        return Inertia::render('Lessons/Exercises/Show', [
            'lesson' => $lesson,
            'exercise' => [
                'id' => $exercise->exercise_id,
                'title' => $exercise->title,
                'description' => $exercise->description,
                'type' => $exercise->exercise_type,
                'content' => $exercise->content,
                'max_score' => $exercise->max_score,
                'time_limit' => $exercise->time_limit_sec,
                'starter_code' => $exercise->starter_code,
                'formatted_duration' => $exercise->formatted_duration,
            ]
        ]);
    }

    /**
     * 获取特定练习的详细信息（API）
     */
    public function getExercise(Lesson $lesson, InteractiveExercise $exercise)
    {
        // 确保 exercise 属于指定的 lesson
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404, 'Exercise not found for this lesson');
        }

        // 确保练习是活跃的
        if (!$exercise->is_active) {
            abort(404, 'Exercise is not available');
        }

        return response()->json([
            'success' => true,
            'exercise' => [
                'id' => $exercise->exercise_id,
                'title' => $exercise->title,
                'description' => $exercise->description,
                'type' => $exercise->exercise_type,
                'content' => $exercise->content,
                'max_score' => $exercise->max_score,
                'time_limit' => $exercise->time_limit_sec,
                'starter_code' => $exercise->starter_code,
                // 注意：正常情况下不应该返回 solution 给学生
            ]
        ]);
    }

    /**
/**
     * 提交练习答案
     */
    public function submitExercise(Request $request, Lesson $lesson, InteractiveExercise $exercise)
    {
        $request->validate([
            'answer' => 'required',
            'time_spent' => 'integer|min:0',
        ]);

        // 确保 exercise 属于指定的 lesson
        if ($exercise->lesson_id !== $lesson->lesson_id) {
            abort(404, 'Exercise not found for this lesson');
        }

        // 确保练习是活跃的
        if (!$exercise->is_active) {
            abort(400, 'Exercise is not available');
        }

        // 确保用户已注册课程
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

        // 根据练习类型评分
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
     * 简化的评分方法
     */
    private function calculateScore(InteractiveExercise $exercise, $answer): int
    {
        // 简化的评分逻辑 - 你可以后续根据具体游戏类型完善
        switch ($exercise->exercise_type) {
            case 'drag_drop':
                // 拖拽游戏评分逻辑
                return $this->scoreDragDrop($exercise->content, $answer, $exercise->max_score);

            case 'adventure_game':
                // 冒险游戏评分逻辑
                return $this->scoreAdventure($exercise->content, $answer, $exercise->max_score);

            default:
                // 默认给满分（后续可以完善）
                return $exercise->max_score;
        }
    }

    /**
     * 拖拽游戏评分
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
     * 冒险游戏评分
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
    private function generateFeedback(InteractiveExercise $exercise, int $score): array
    {
        $percentage = ($score / $exercise->max_score) * 100;

        if ($percentage >= 90) {
            return [
                'level' => 'excellent',
                'message' => '太棒了！你完全掌握了这个概念！🎉',
                'suggestion' => '继续保持，挑战下一个关卡吧！'
            ];
        } elseif ($percentage >= 70) {
            return [
                'level' => 'good',
                'message' => '做得很好！你已经理解了大部分内容。👏',
                'suggestion' => '再练习一下细节部分会更完美。'
            ];
        } elseif ($percentage >= 50) {
            return [
                'level' => 'okay',
                'message' => '不错的尝试！你已经掌握了基础概念。😊',
                'suggestion' => '建议复习课程内容，然后再试一次。'
            ];
        } else {
            return [
                'level' => 'needs_improvement',
                'message' => '继续努力！学习编程需要时间和练习。💪',
                'suggestion' => '建议先重新学习课程内容，有问题可以寻求帮助。'
            ];
        }
    }
}
