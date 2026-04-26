<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Lesson;
use App\Models\Test;
use App\Models\LessonRegistration;
use App\Models\LessonProgress;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Services\DailyChallengeService;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DailyChallengeService $dailyChallengeService
    ) {}

    /**
     * Landing Page / Home Page - 公开访问
     */
    public function home()
    {
        // 获取 6 个特色课程用于 landing page
        $featuredLessons = Lesson::where('status', 'active')
            ->withCount([
                'interactiveExercises as exercises_count',
                'tests as tests_count'
            ])
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($lesson) {
                return [
                    'lesson_id' => $lesson->lesson_id,
                    'title' => $lesson->title,
                    'description' => $lesson->content ? substr(strip_tags($lesson->content), 0, 150) : null,
                    'difficulty' => $lesson->difficulty,
                    'exercises_count' => $lesson->exercises_count ?? 0,
                    'tests_count' => $lesson->tests_count ?? 0,
                    'completion_reward_points' => $lesson->completion_reward_points ?? 100,
                    'estimated_duration' => $lesson->estimated_duration,
                    'is_registered' => false, // 默认未注册
                ];
            });

        // 如果用户已登录且是学生，检查注册状态
        if (Auth::check() && Auth::user()->role === 'student') {
            $studentProfile = Auth::user()->studentProfile;
            if ($studentProfile) {
                $registrations = LessonRegistration::where('student_id', $studentProfile->student_id)
                    ->whereIn('lesson_id', $featuredLessons->pluck('lesson_id'))
                    ->get()
                    ->keyBy('lesson_id');

                $featuredLessons = $featuredLessons->map(function ($lesson) use ($registrations) {
                    $lesson['is_registered'] = isset($registrations[$lesson['lesson_id']]);
                    return $lesson;
                });
            }
        }

        return Inertia::render('LandingPage', [
            'featuredLessons' => $featuredLessons,
        ]);
    }

    /**
     * Dashboard - 需要认证
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'administrator') {
            return $this->adminDashboard($user);
        }

        if ($user->role === 'student') {
            return $this->studentDashboard($user);
        }

        abort(403, 'Unauthorized access. Only administrators and students can access the dashboard.');
    }

    /**
     * Admin Dashboard
     */
    private function adminDashboard($user)
    {
        // 获取真实统计数据
        $stats = [
            'total_students' => User::where('role', 'student')->count(),
            'total_lessons' => Lesson::where('status', 'active')->count(),
            'total_tests' => Test::where('status', 'active')->count(),
            'active_students' => $this->getActiveStudents(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'auth' => [
                'user' => [
                    'id' => $user->getKey(),
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Student Dashboard - 只显示 Available Lessons
     */
    private function studentDashboard($user)
    {
        $user->load('studentProfile');
        $studentProfile = $user->studentProfile;

        // Check if student needs onboarding
        if ($studentProfile && !$studentProfile->hasActiveLearningPath()) {
            return redirect()->route('student.onboarding.index')
                ->with('info', 'Welcome! Let\'s find the perfect learning path for you.');
        }

        // Get learning path progress
        $learningPathProgress = null;
        $nextLesson = null;
        $dailyChallengeBoard = [
            'daily' => [],
            'weekly' => [],
            'summary' => [
                'daily_total' => 0,
                'daily_completed' => 0,
                'weekly_total' => 0,
                'weekly_completed' => 0,
                'total_points_available' => 0,
            ],
        ];

        if ($studentProfile) {
            $learningPathProgress = $studentProfile->getLearningPathProgress();
            $nextLessonModel = $studentProfile->getNextPathLesson();
            $dailyChallengeBoard = $this->dailyChallengeService->getDashboardBoard($studentProfile->student_id);
            if ($nextLessonModel) {
                $nextLesson = [
                    'lesson_id' => $nextLessonModel->lesson_id,
                    'title' => $nextLessonModel->title,
                    'difficulty' => $nextLessonModel->difficulty,
                    'estimated_duration' => $nextLessonModel->estimated_duration,
                    'content' => $nextLessonModel->content ? substr(strip_tags($nextLessonModel->content), 0, 150) : null,
                ];
            }
        }

        // Get available lessons
        $availableLessons = collect();
        if ($studentProfile) {
            $registeredLessonIds = LessonRegistration::where('student_id', $studentProfile->student_id)
                ->pluck('lesson_id')
                ->toArray();

            $availableLessons = Lesson::where('status', 'active')
                ->whereNotIn('lesson_id', $registeredLessonIds)
                ->orderBy('difficulty')
                ->orderBy('created_at', 'desc')
                ->limit(6)
                ->get()
                ->map(function ($lesson) {
                    $exercisesCount = $lesson->interactiveExercises()
                        ->where('is_active', true)
                        ->count();

                    $testsCount = $lesson->tests()
                        ->where('status', 'active')
                        ->count();

                    return [
                        'lesson_id' => $lesson->lesson_id,
                        'title' => $lesson->title,
                        'duration' => $lesson->estimated_duration ?? '60 min',
                        'difficulty' => $lesson->difficulty,
                        'description' => $lesson->content ? substr(strip_tags($lesson->content), 0, 150) : '',
                        'exercises_count' => $exercisesCount,
                        'tests_count' => $testsCount,
                        'completion_reward_points' => $lesson->completion_reward_points ?? 100,
                    ];
                });
        }

        // Get student's recent lessons
        $recentLessons = [];
        if ($studentProfile) {
            $recentLessons = LessonRegistration::with(['lesson'])
                ->where('student_id', $studentProfile->student_id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($registration) {
                    return [
                        'lesson_id' => $registration->lesson->lesson_id,
                        'title' => $registration->lesson->title,
                        'difficulty' => $registration->lesson->difficulty,
                        'registration_status' => $registration->registration_status,
                        'exercises_completed' => $registration->exercises_completed ?? 0,
                        'tests_passed' => $registration->tests_passed ?? 0,
                        'completion_points_awarded' => $registration->completion_points_awarded ?? 0,
                        'created_at' => $registration->created_at->format('Y-m-d'),
                        'completed_at' => $registration->completed_at?->format('Y-m-d'),
                    ];
                });
        }

        // ✅ 修复：不要覆盖 auth.user，让 middleware 处理
        // ❌ 删除这部分 - 它会覆盖 middleware 的数据
        // 'auth' => [
        //     'user' => [...]
        // ],

        return Inertia::render('Student/Dashboard', [
            // ✅ 不传递 auth，让 HandleInertiaRequests middleware 自动处理
            'studentProfile' => $studentProfile ? [
                'current_points' => $studentProfile->current_points,
                'total_lessons_completed' => $studentProfile->total_lessons_completed,
                'total_tests_taken' => $studentProfile->total_tests_taken,
                'average_score' => $studentProfile->average_score,
                'streak_days' => $studentProfile->streak_days,
                'points_level' => $studentProfile->points_level ?? 'Newbie',
                'completion_percentage' => $studentProfile->completion_percentage ?? 0,
                'streak_status' => $studentProfile->streak_status ?? 'Ready to Start! 🚀',
                'last_activity_date' => $studentProfile->last_activity_date?->format('Y-m-d'),
            ] : null,
            'recentLessons' => $recentLessons,
            'learningPathProgress' => $learningPathProgress,
            'nextLesson' => $nextLesson,
            'availableLessons' => $availableLessons,
            'dailyChallengeBoard' => $dailyChallengeBoard,
        ]);
    }
    /**
     * 获取活跃学生数量（过去7天有活动）
     */
    private function getActiveStudents()
    {
        $sevenDaysAgo = Carbon::now()->subDays(7);

        // 方法1: 通过 studentProfile 关联查询 lesson_registrations
        $activeCount = User::where('role', 'student')
            ->whereHas('studentProfile.lessonRegistrations', function ($query) use ($sevenDaysAgo) {
                $query->where('updated_at', '>=', $sevenDaysAgo);
            })
            ->count();

        // 如果上面的方法返回0，尝试方法2: 直接查询 lesson_registrations 表
        if ($activeCount === 0) {
            $activeStudentIds = LessonRegistration::where('updated_at', '>=', $sevenDaysAgo)
                ->distinct()
                ->pluck('student_id');

            $activeCount = User::where('role', 'student')
                ->whereHas('studentProfile', function ($query) use ($activeStudentIds) {
                    $query->whereIn('student_id', $activeStudentIds);
                })
                ->count();
        }

        // 如果还是0，尝试方法3: 使用 exercise_submissions
        if ($activeCount === 0) {
            $activeCount = DB::table('exercise_submissions')
                ->where('submitted_at', '>=', $sevenDaysAgo)
                ->distinct()
                ->count('student_id');
        }

        // 如果数据库是空的，至少返回0而不是错误
        return $activeCount;
    }
}
