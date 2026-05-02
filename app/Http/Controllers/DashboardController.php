<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\AISessionLog;
use App\Models\ForumReport;
use App\Models\Test;
use App\Models\User;
use App\Services\DailyChallengeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DailyChallengeService $dailyChallengeService
    ) {}

    /**
     * Landing Page / Home Page - public access
     */
    public function home()
    {
        $featuredLessons = Lesson::where('status', 'active')
            ->withCount([
                'interactiveExercises as exercises_count',
                'tests as tests_count',
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
                    'is_registered' => false,
                ];
            });

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
     * Authenticated dashboard entry.
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
     * Admin dashboard.
     */
    private function adminDashboard($user)
    {
        $stats = [
            'total_students' => User::where('role', 'student')->count(),
            'total_lessons' => Lesson::where('status', 'active')->count(),
            'total_tests' => Test::where('status', 'active')->count(),
            'active_students' => $this->getActiveStudents(),
        ];

        $healthStatus = $this->getAdminHealthStatus();
        $summaryCards = $this->getAdminSummaryCards($stats);
        $recentActivity = $this->getAdminRecentActivity();
        $performance = $this->getAdminPerformanceMetrics($stats);

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
            'healthStatus' => $healthStatus,
            'summaryCards' => $summaryCards,
            'recentActivity' => $recentActivity,
            'performance' => $performance,
        ]);
    }

    /**
     * Student dashboard - only show available lessons.
     */
    private function studentDashboard($user)
    {
        $user->load('studentProfile');
        $studentProfile = $user->studentProfile;

        if ($studentProfile && !$studentProfile->hasActiveLearningPath()) {
            return redirect()->route('student.onboarding.index')
                ->with('info', 'Welcome! Let\'s find the perfect learning path for you.');
        }

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

        return Inertia::render('Student/Dashboard', [
            'studentProfile' => $studentProfile ? [
                'current_points' => $studentProfile->current_points,
                'total_lessons_completed' => $studentProfile->total_lessons_completed,
                'total_tests_taken' => $studentProfile->total_tests_taken,
                'average_score' => $studentProfile->average_score,
                'streak_days' => $studentProfile->streak_days,
                'points_level' => $studentProfile->points_level ?? 'Newbie',
                'completion_percentage' => $studentProfile->completion_percentage ?? 0,
                'streak_status' => $studentProfile->streak_status ?? 'Ready to Start! ðŸš€',
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
     * Count distinct active students across all tracked student activity sources.
     */
    private function getActiveStudents()
    {
        $sevenDaysAgo = Carbon::now()->subDays(7);

        $activeStudentIds = DB::table('lesson_registrations')
            ->select('student_id')
            ->where('updated_at', '>=', $sevenDaysAgo)
            ->union(
                DB::table('lesson_progress')
                    ->select('student_id')
                    ->where('last_updated_at', '>=', $sevenDaysAgo)
            )
            ->union(
                DB::table('exercise_submissions')
                    ->select('student_id')
                    ->where('submitted_at', '>=', $sevenDaysAgo)
            )
            ->union(
                DB::table('test_submissions')
                    ->select('student_id')
                    ->where('submitted_at', '>=', $sevenDaysAgo)
            )
            ->union(
                DB::table('forum_posts')
                    ->join('student_profiles', 'forum_posts.user_id', '=', 'student_profiles.user_Id')
                    ->select('student_profiles.student_id')
                    ->where('forum_posts.created_at', '>=', $sevenDaysAgo)
            )
            ->union(
                DB::table('forum_replies')
                    ->join('student_profiles', 'forum_replies.user_id', '=', 'student_profiles.user_Id')
                    ->select('student_profiles.student_id')
                    ->where('forum_replies.created_at', '>=', $sevenDaysAgo)
            );

        return DB::query()
            ->fromSub($activeStudentIds, 'active_students')
            ->distinct()
            ->count('student_id');
    }

    /**
     * Build a true global activity timeline ordered across all activity sources.
     */
    private function getAdminRecentActivity(): array
    {
        $studentRegistrations = DB::table('users')
            ->where('role', 'student')
            ->selectRaw("
                'student_registration' as activity_type,
                users.name as actor_name,
                NULL as subject_name,
                users.created_at as activity_at
            ");

        $lessonCompletions = DB::table('lesson_progress')
            ->join('student_profiles', 'lesson_progress.student_id', '=', 'student_profiles.student_id')
            ->join('users', 'student_profiles.user_Id', '=', 'users.user_Id')
            ->leftJoin('lessons', 'lesson_progress.lesson_id', '=', 'lessons.lesson_id')
            ->where('lesson_progress.status', 'completed')
            ->whereNotNull('lesson_progress.completed_at')
            ->selectRaw("
                'lesson_completed' as activity_type,
                users.name as actor_name,
                lessons.title as subject_name,
                lesson_progress.completed_at as activity_at
            ");

        $testSubmissions = DB::table('test_submissions')
            ->join('student_profiles', 'test_submissions.student_id', '=', 'student_profiles.student_id')
            ->join('users', 'student_profiles.user_Id', '=', 'users.user_Id')
            ->leftJoin('tests', 'test_submissions.test_id', '=', 'tests.test_id')
            ->whereIn('test_submissions.status', ['submitted', 'timeout'])
            ->whereNotNull('test_submissions.submitted_at')
            ->selectRaw("
                'test_submitted' as activity_type,
                users.name as actor_name,
                tests.title as subject_name,
                test_submissions.submitted_at as activity_at
            ");

        $forumPosts = DB::table('forum_posts')
            ->join('users', 'forum_posts.user_id', '=', 'users.user_Id')
            ->selectRaw("
                'forum_post' as activity_type,
                users.name as actor_name,
                NULL as subject_name,
                forum_posts.created_at as activity_at
            ");

        $forumReplies = DB::table('forum_replies')
            ->join('users', 'forum_replies.user_id', '=', 'users.user_Id')
            ->selectRaw("
                'forum_reply' as activity_type,
                users.name as actor_name,
                NULL as subject_name,
                forum_replies.created_at as activity_at
            ");

        $timeline = $studentRegistrations
            ->unionAll($lessonCompletions)
            ->unionAll($testSubmissions)
            ->unionAll($forumPosts)
            ->unionAll($forumReplies);

        return DB::query()
            ->fromSub($timeline, 'recent_activity')
            ->whereNotNull('activity_at')
            ->orderByDesc('activity_at')
            ->limit(6)
            ->get()
            ->map(function ($item) {
                $timestamp = Carbon::parse($item->activity_at);

                return [
                    'type' => $item->activity_type,
                    'message' => match ($item->activity_type) {
                        'student_registration' => "{$item->actor_name} joined the platform",
                        'lesson_completed' => "{$item->actor_name} completed " . ($item->subject_name ?: 'a lesson'),
                        'test_submitted' => "{$item->actor_name} submitted " . ($item->subject_name ?: 'a test'),
                        'forum_post' => "{$item->actor_name} posted in the forum",
                        'forum_reply' => "{$item->actor_name} replied in the forum",
                        default => "{$item->actor_name} had new activity",
                    },
                    'timestamp' => $timestamp->toIso8601String(),
                    'time_ago' => $timestamp->diffForHumans(),
                    'color' => match ($item->activity_type) {
                        'student_registration' => 'green',
                        'lesson_completed' => 'blue',
                        'test_submitted' => 'purple',
                        'forum_post' => 'orange',
                        'forum_reply' => 'amber',
                        default => 'blue',
                    },
                ];
            })
            ->all();
    }

    private function getAdminHealthStatus(): array
    {
        $pendingReports = ForumReport::query()->pending()->count();
        $lockedAccounts = User::query()
            ->whereNotNull('locked_until')
            ->where('locked_until', '>', now())
            ->count();
        $aiSessionsLast24Hours = AISessionLog::query()
            ->where('timestamp', '>=', now()->subDay())
            ->count();
        $reportsReviewedLast24Hours = ForumReport::query()
            ->whereNotNull('reviewed_at')
            ->where('reviewed_at', '>=', now()->subDay())
            ->count();

        $state = 'healthy';
        $label = 'Platform Healthy';

        if ($pendingReports >= 10 || $lockedAccounts >= 5) {
            $state = 'critical';
            $label = 'Needs Immediate Review';
        } elseif ($pendingReports > 0 || $lockedAccounts > 0) {
            $state = 'attention';
            $label = 'Needs Attention';
        }

        return [
            'state' => $state,
            'label' => $label,
            'summary' => "{$pendingReports} pending reports, {$lockedAccounts} locked accounts",
            'details' => [
                "{$reportsReviewedLast24Hours} reports reviewed in the last 24h",
                "{$aiSessionsLast24Hours} AI sessions logged in the last 24h",
            ],
        ];
    }

    private function getAdminSummaryCards(array $stats): array
    {
        $monthStart = now()->startOfMonth();
        $previousMonthStart = now()->subMonthNoOverflow()->startOfMonth();
        $previousMonthEnd = $monthStart->copy()->subSecond();

        $studentCurrent = User::query()
            ->where('role', 'student')
            ->where('created_at', '>=', $monthStart)
            ->count();
        $studentPrevious = User::query()
            ->where('role', 'student')
            ->whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])
            ->count();

        $lessonCurrent = Lesson::query()
            ->where('status', 'active')
            ->where('created_at', '>=', $monthStart)
            ->count();
        $lessonPrevious = Lesson::query()
            ->where('status', 'active')
            ->whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])
            ->count();

        $testCurrent = Test::query()
            ->where('status', 'active')
            ->where('created_at', '>=', $monthStart)
            ->count();
        $testPrevious = Test::query()
            ->where('status', 'active')
            ->whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])
            ->count();

        $currentWeekStart = now()->subDays(7);
        $previousWeekStart = now()->subDays(14);
        $previousWeekEnd = $currentWeekStart->copy()->subSecond();
        $previousActiveStudents = $this->countActiveStudentsBetween($previousWeekStart, $previousWeekEnd);

        return [
            'total_students' => [
                'value' => $stats['total_students'],
                'trend' => $this->formatTrend($studentCurrent, $studentPrevious),
                'caption' => $this->formatComparisonCaption($studentCurrent, $studentPrevious, 'new students', 'this month', 'last month'),
            ],
            'active_students' => [
                'value' => $stats['active_students'],
                'trend' => $this->formatTrend($stats['active_students'], $previousActiveStudents),
                'caption' => $this->formatComparisonCaption($stats['active_students'], $previousActiveStudents, 'active students', 'last 7 days', 'previous 7 days'),
            ],
            'total_lessons' => [
                'value' => $stats['total_lessons'],
                'trend' => $this->formatTrend($lessonCurrent, $lessonPrevious),
                'caption' => $this->formatComparisonCaption($lessonCurrent, $lessonPrevious, 'active lessons', 'this month', 'last month'),
            ],
            'total_tests' => [
                'value' => $stats['total_tests'],
                'trend' => $this->formatTrend($testCurrent, $testPrevious),
                'caption' => $this->formatComparisonCaption($testCurrent, $testPrevious, 'active tests', 'this month', 'last month'),
            ],
        ];
    }

    private function getAdminPerformanceMetrics(array $stats): array
    {
        $lessonProgressCount = LessonProgress::query()->count();
        $completedLessonCount = LessonProgress::query()
            ->where('status', 'completed')
            ->count();
        $courseCompletionRate = $lessonProgressCount > 0
            ? round(($completedLessonCount / $lessonProgressCount) * 100)
            : 0;

        $completedSubmissionQuery = DB::table('test_submissions')
            ->whereIn('status', ['submitted', 'timeout']);
        $completedSubmissionCount = (clone $completedSubmissionQuery)->count();
        $passedSubmissionCount = (clone $completedSubmissionQuery)
            ->whereRaw('score >= (SELECT passing_score FROM tests WHERE test_id = test_submissions.test_id)')
            ->count();
        $testPassRate = $completedSubmissionCount > 0
            ? round(($passedSubmissionCount / $completedSubmissionCount) * 100)
            : 0;

        $studentEngagement = $stats['total_students'] > 0
            ? round(($stats['active_students'] / $stats['total_students']) * 100)
            : 0;

        return [
            [
                'label' => 'Course Completion Rate',
                'value' => $courseCompletionRate,
                'color' => 'green',
                'hint' => "{$completedLessonCount} completed out of {$lessonProgressCount} tracked lesson journeys",
            ],
            [
                'label' => 'Test Pass Rate',
                'value' => $testPassRate,
                'color' => 'blue',
                'hint' => "{$passedSubmissionCount} passed out of {$completedSubmissionCount} submitted attempts",
            ],
            [
                'label' => 'Student Engagement',
                'value' => $studentEngagement,
                'color' => 'purple',
                'hint' => "{$stats['active_students']} active students in the last 7 days",
            ],
        ];
    }

    private function countActiveStudentsBetween(Carbon $start, Carbon $end): int
    {
        $activeStudentIds = DB::table('lesson_registrations')
            ->select('student_id')
            ->whereBetween('updated_at', [$start, $end])
            ->union(
                DB::table('lesson_progress')
                    ->select('student_id')
                    ->whereBetween('last_updated_at', [$start, $end])
            )
            ->union(
                DB::table('exercise_submissions')
                    ->select('student_id')
                    ->whereBetween('submitted_at', [$start, $end])
            )
            ->union(
                DB::table('test_submissions')
                    ->select('student_id')
                    ->whereBetween('submitted_at', [$start, $end])
            )
            ->union(
                DB::table('forum_posts')
                    ->join('student_profiles', 'forum_posts.user_id', '=', 'student_profiles.user_Id')
                    ->select('student_profiles.student_id')
                    ->whereBetween('forum_posts.created_at', [$start, $end])
            )
            ->union(
                DB::table('forum_replies')
                    ->join('student_profiles', 'forum_replies.user_id', '=', 'student_profiles.user_Id')
                    ->select('student_profiles.student_id')
                    ->whereBetween('forum_replies.created_at', [$start, $end])
            );

        return DB::query()
            ->fromSub($activeStudentIds, 'active_students')
            ->distinct()
            ->count('student_id');
    }

    private function formatTrend(int $current, int $previous): array
    {
        if ($current === 0 && $previous === 0) {
            return [
                'direction' => 'neutral',
                'percent' => 0,
                'label' => '0%',
            ];
        }

        if ($previous === 0) {
            return [
                'direction' => 'up',
                'percent' => 100,
                'label' => '+100%',
            ];
        }

        $percent = (int) round((($current - $previous) / $previous) * 100);

        return [
            'direction' => $percent > 0 ? 'up' : ($percent < 0 ? 'down' : 'neutral'),
            'percent' => abs($percent),
            'label' => ($percent > 0 ? '+' : '') . $percent . '%',
        ];
    }

    private function formatComparisonCaption(int $current, int $previous, string $subject, string $currentLabel, string $previousLabel): string
    {
        $difference = $current - $previous;

        if ($difference > 0) {
            return "+{$difference} {$subject} vs {$previousLabel}";
        }

        if ($difference < 0) {
            return abs($difference) . " fewer {$subject} than {$previousLabel}";
        }

        if ($current === 0) {
            return "No {$subject} in {$currentLabel}";
        }

        return "Flat vs {$previousLabel}";
    }
}
