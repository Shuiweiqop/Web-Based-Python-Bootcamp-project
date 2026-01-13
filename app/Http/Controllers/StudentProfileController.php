<?php

namespace App\Http\Controllers;

use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\LessonProgress;

class StudentProfileController extends Controller
{
    /**
     * Display the student's profile dashboard
     */
    /**
     * Display the student's profile dashboard
     */
    /**
     * Display the student's profile dashboard
     */
    public function show(Request $request): Response
    {
        $user = $request->user();
        $studentProfile = $user->studentProfile()
            ->with([
                'rewardInventory.reward',
                'lessonRegistrations.lesson',
            ])
            ->first();

        if (!$studentProfile) {
            return Inertia::render('Profile/CreateProfile');
        }

        // Get comprehensive stats
        $overallStats = $studentProfile->getOverallStats();
        $testStats = $studentProfile->getTestProgressStats();
        $exerciseStats = $studentProfile->getExerciseStats();
        $questionTypeStats = $studentProfile->getQuestionTypeStats();

        // Recent activity
        $recentTests = $studentProfile->getTestHistory(5);
        $recentExercises = $studentProfile->getExerciseHistory(5);

        // Achievement data
        $achievements = $this->calculateAchievements($studentProfile);

        // Get Learning Paths (TOP 3 for Dashboard)
        $learningPaths = $studentProfile->learningPaths()
            ->with('learningPath')
            ->whereIn('status', ['active', 'paused', 'completed'])
            ->orderByDesc('is_primary')
            ->orderByDesc('last_activity_at')
            ->limit(3)
            ->get()
            ->map(function ($studentPath) {
                $path = $studentPath->learningPath;

                // Calculate completed lessons count
                $lessonIds = $path->lessons->pluck('lesson_id');
                $completedLessons = DB::table('lesson_progress')
                    ->where('student_id', $studentPath->student_id)
                    ->whereIn('lesson_id', $lessonIds)
                    ->where('status', 'completed')
                    ->count();

                return [
                    'id' => $studentPath->student_path_id,
                    'path_id' => $path->path_id,
                    'name' => $path->title,
                    'description' => $path->description,
                    'progress' => round($studentPath->progress_percent, 0),
                    'total_lessons' => $path->total_lessons ?? 0,
                    'completed_lessons' => $completedLessons,
                    'status' => $studentPath->status,
                    'icon' => $path->icon,
                    'color' => $path->color,
                    'difficulty_level' => $path->difficulty_level,
                    'is_primary' => (bool) $studentPath->is_primary,
                    'started_at' => $studentPath->started_at?->format('M d, Y'),
                    'last_activity_at' => $studentPath->last_activity_at?->diffForHumans(),
                ];
            });

        // Get equipped items
        $equipped = [
            'background' => null,
            'avatar_frame' => null,
            'title' => null,
            'badges' => [],
        ];

        $equippedItems = $studentProfile->rewardInventory()
            ->where('is_equipped', true)
            ->with('reward')
            ->get();

        foreach ($equippedItems as $item) {
            $reward = $item->reward;

            $rewardData = [
                'id' => $reward->reward_id,
                'name' => $reward->name,
                'description' => $reward->description,
                'image_url' => $reward->image_url,
                'icon' => $reward->icon ?? null,
                'rarity' => $reward->rarity,
                'metadata' => is_string($reward->metadata)
                    ? json_decode($reward->metadata, true)
                    : ($reward->metadata ?? []),
            ];

            switch ($reward->reward_type) {
                case 'background':
                case 'profile_background':
                    $equipped['background'] = $rewardData;
                    break;
                case 'avatar_frame':
                    $equipped['avatar_frame'] = $rewardData;
                    break;
                case 'title':
                case 'profile_title':
                    $equipped['title'] = $rewardData;
                    break;
                case 'badge':
                    $equipped['badges'][] = $rewardData;
                    break;
            }
        }

        // ✅ Get inventory data grouped by type
        $inventoryCollection = $studentProfile->rewardInventory()
            ->with('reward')
            ->get()
            ->groupBy(fn($item) => $item->reward->reward_type);

        // ✅ Format inventory data for each type
        $backgrounds = $inventoryCollection->get('profile_background', collect())
            ->merge($inventoryCollection->get('background', collect()))
            ->map(fn($item) => [
                'inventory_id' => $item->inventory_id,
                'reward_id' => $item->reward_id,
                'name' => $item->reward->name,
                'description' => $item->reward->description,
                'image_url' => $item->reward->image_url,
                'icon' => $item->reward->icon,
                'rarity' => $item->reward->rarity,
                'quantity' => $item->quantity,
                'is_equipped' => $item->is_equipped,
                'obtained_at' => $item->obtained_at?->diffForHumans(),
                'reward' => [
                    'name' => $item->reward->name,
                    'description' => $item->reward->description,
                    'reward_type' => $item->reward->reward_type,
                    'rarity' => $item->reward->rarity,
                    'image_url' => $item->reward->image_url,
                    'icon' => $item->reward->icon,
                ]
            ])->values();

        $avatarFrames = $inventoryCollection->get('avatar_frame', collect())
            ->map(fn($item) => [
                'inventory_id' => $item->inventory_id,
                'reward_id' => $item->reward_id,
                'name' => $item->reward->name,
                'description' => $item->reward->description,
                'image_url' => $item->reward->image_url,
                'icon' => $item->reward->icon,
                'rarity' => $item->reward->rarity,
                'quantity' => $item->quantity,
                'is_equipped' => $item->is_equipped,
                'obtained_at' => $item->obtained_at?->diffForHumans(),
                'reward' => [
                    'name' => $item->reward->name,
                    'description' => $item->reward->description,
                    'reward_type' => $item->reward->reward_type,
                    'rarity' => $item->reward->rarity,
                    'image_url' => $item->reward->image_url,
                    'icon' => $item->reward->icon,
                ]
            ])->values();

        $titles = $inventoryCollection->get('title', collect())
            ->merge($inventoryCollection->get('profile_title', collect()))
            ->map(fn($item) => [
                'inventory_id' => $item->inventory_id,
                'reward_id' => $item->reward_id,
                'name' => $item->reward->name,
                'description' => $item->reward->description,
                'icon' => $item->reward->icon,
                'rarity' => $item->reward->rarity,
                'quantity' => $item->quantity,
                'is_equipped' => $item->is_equipped,
                'obtained_at' => $item->obtained_at?->diffForHumans(),
                'reward' => [
                    'name' => $item->reward->name,
                    'description' => $item->reward->description,
                    'reward_type' => $item->reward->reward_type,
                    'rarity' => $item->reward->rarity,
                    'icon' => $item->reward->icon,
                ]
            ])->values();

        $badges = $inventoryCollection->get('badge', collect())
            ->map(fn($item) => [
                'inventory_id' => $item->inventory_id,
                'reward_id' => $item->reward_id,
                'name' => $item->reward->name,
                'description' => $item->reward->description,
                'image_url' => $item->reward->image_url,
                'icon' => $item->reward->icon,
                'rarity' => $item->reward->rarity,
                'quantity' => $item->quantity,
                'is_equipped' => $item->is_equipped,
                'obtained_at' => $item->obtained_at?->diffForHumans(),
                'reward' => [
                    'name' => $item->reward->name,
                    'description' => $item->reward->description,
                    'reward_type' => $item->reward->reward_type,
                    'rarity' => $item->reward->rarity,
                    'image_url' => $item->reward->image_url,
                    'icon' => $item->reward->icon,
                ]
            ])->values();

        return Inertia::render('Student/Profile/Index', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar_url ?? null,
            ],
            'profile' => [
                'student_id' => $studentProfile->student_id,
                'current_points' => $studentProfile->current_points,
                'points_level' => $studentProfile->points_level,
                'total_lessons_completed' => $studentProfile->total_lessons_completed,
                'total_tests_taken' => $studentProfile->total_tests_taken,
                'average_score' => $studentProfile->average_score,
                'streak_days' => $studentProfile->streak_days,
                'streak_status' => $studentProfile->streak_status,
                'last_activity_date' => $studentProfile->last_activity_date?->diffForHumans(),
                'completion_percentage' => $studentProfile->completion_percentage,
                'test_performance_level' => $studentProfile->test_performance_level,
                'is_active_today' => $studentProfile->isActiveToday(),
            ],
            'equipped' => $equipped,
            'stats' => [
                'overall' => $overallStats,
                'tests' => $testStats,
                'exercises' => $exerciseStats,
                'question_types' => $questionTypeStats,
                'completion_rate' => round($studentProfile->completion_percentage ?? 0, 1),
            ],
            'recent_activity' => [
                'tests' => $recentTests->map(fn($test) => [
                    'id' => $test->submission_id,
                    'test_name' => $test->test->test_name ?? 'Unknown Test',
                    'score' => $test->score,
                    'status' => $test->status,
                    'submitted_at' => $test->submitted_at?->diffForHumans(),
                    'time_spent' => $this->formatTimeSpent($test->time_spent),
                ]),
                'exercises' => $recentExercises->map(fn($exercise) => [
                    'id' => $exercise->submission_id,
                    'exercise_title' => $exercise->exercise->title ?? 'Unknown Exercise',
                    'lesson_name' => $exercise->exercise->lesson->lesson_name ?? 'Unknown Lesson',
                    'score' => $exercise->score,
                    'max_score' => $exercise->exercise->max_score ?? 100,
                    'submitted_at' => $exercise->submitted_at?->diffForHumans(),
                ]),
            ],
            'achievements' => $achievements,
            'learningPaths' => $learningPaths,

            // ✅ Add inventory data
            'inventory' => [
                'backgrounds' => $backgrounds,
                'avatarFrames' => $avatarFrames,
                'titles' => $titles,
                'badges' => $badges,
            ],

            // ✅ Add reward types mapping
            'rewardTypes' => [
                'avatar_frame' => 'Avatar Frame',
                'profile_background' => 'Background',
                'background' => 'Background',
                'badge' => 'Badge',
                'title' => 'Title',
                'profile_title' => 'Title',
                'theme' => 'Theme',
                'effect' => 'Effect',
            ],
        ]);
    }

    /**
     * Display the rewards inventory page
     */
    public function rewards(Request $request): Response
    {
        $studentProfile = $request->user()->studentProfile;

        if (!$studentProfile) {
            return Inertia::render('Profile/CreateProfile');
        }

        $inventory = $studentProfile->rewardInventory()
            ->with('reward')
            ->get()
            ->groupBy(fn($item) => $item->reward->reward_type)
            ->map(fn($items) => $items->map(fn($item) => [
                'inventory_id' => $item->inventory_id,
                'reward_id' => $item->reward_id,
                'name' => $item->reward->name,
                'description' => $item->reward->description,
                'type' => $item->reward->reward_type,
                'rarity' => $item->reward->rarity,
                'image_url' => $item->reward->image_url,
                'quantity' => $item->quantity,
                'is_equipped' => $item->is_equipped,
                'obtained_at' => $item->obtained_at?->diffForHumans(),
                'metadata' => is_string($item->reward->metadata)
                    ? json_decode($item->reward->metadata, true)
                    : ($item->reward->metadata ?? []),
            ]));

        return Inertia::render('Student/Profile/Rewards', [
            'current_points' => $studentProfile->current_points,
            'inventory' => $inventory,
        ]);
    }

    /**
     * Display points history and statistics
     */
    public function points(Request $request): Response
    {
        $studentProfile = $request->user()->studentProfile;

        if (!$studentProfile) {
            return Inertia::render('Profile/CreateProfile');
        }

        $timeFilter = $request->get('time', 'all');
        $typeFilter = $request->get('type', 'all');

        $pointsHistory = $this->getPointsHistory($studentProfile, $timeFilter, $typeFilter);
        $pointsStats = $this->getPointsStats($studentProfile);

        return Inertia::render('Student/Points/Index', [
            'currentPoints' => $studentProfile->current_points,
            'pointsHistory' => $pointsHistory,
            'pointsStats' => $pointsStats,
            'filters' => [
                'time' => $timeFilter,
                'type' => $typeFilter,
            ],
        ]);
    }

    /**
     * Display learning statistics
     */
    public function statistics(Request $request): Response
    {
        $studentProfile = $request->user()->studentProfile;

        if (!$studentProfile) {
            return Inertia::render('Profile/CreateProfile');
        }

        $testStats = $studentProfile->getTestProgressStats();
        $exerciseStats = $studentProfile->getExerciseStats();
        $questionTypeStats = $studentProfile->getQuestionTypeStats();
        $progressData = $this->getProgressOverTime($studentProfile, 30);

        $lessonProgress = $studentProfile->lessonRegistrations()
            ->with('lesson')
            ->get()
            ->map(fn($reg) => [
                'lesson_name' => $reg->lesson->lesson_name ?? 'Unknown',
                'status' => $reg->registration_status,
                'exercises_completed' => $reg->exercises_completed,
                'tests_passed' => $reg->tests_passed,
                'completion_points' => $reg->completion_points_awarded,
                'completed_at' => $reg->completed_at?->format('Y-m-d'),
            ]);

        return Inertia::render('Student/Profile/Statistics', [
            'profile' => [
                'current_points' => $studentProfile->current_points,
                'points_level' => $studentProfile->points_level,
                'streak_days' => $studentProfile->streak_days,
            ],
            'test_stats' => $testStats,
            'exercise_stats' => $exerciseStats,
            'question_type_stats' => $questionTypeStats,
            'progress_over_time' => $progressData,
            'lesson_progress' => $lessonProgress,
        ]);
    }

    /**
     * Display learning history
     */
    public function history(Request $request): Response
    {
        $studentProfile = $request->user()->studentProfile;

        if (!$studentProfile) {
            return Inertia::render('Profile/CreateProfile');
        }

        $testHistory = $studentProfile->getTestHistory(20);
        $exerciseHistory = $studentProfile->getExerciseHistory(20);

        return Inertia::render('Student/Profile/History', [
            'test_history' => $testHistory->map(fn($test) => [
                'id' => $test->submission_id,
                'test_name' => $test->test->test_name ?? 'Unknown Test',
                'score' => $test->score,
                'status' => $test->status,
                'correct_answers' => $test->correct_answers,
                'total_questions' => $test->total_questions,
                'time_spent' => $this->formatTimeSpent($test->time_spent),
                'submitted_at' => $test->submitted_at?->format('M d, Y H:i'),
            ]),
            'exercise_history' => $exerciseHistory->map(fn($exercise) => [
                'id' => $exercise->submission_id,
                'exercise_title' => $exercise->exercise->title ?? 'Unknown Exercise',
                'lesson_name' => $exercise->exercise->lesson->lesson_name ?? 'Unknown',
                'score' => $exercise->score,
                'max_score' => $exercise->exercise->max_score ?? 100,
                'time_taken' => $this->formatTimeSpent($exercise->time_taken),
                'submitted_at' => $exercise->submitted_at?->format('M d, Y H:i'),
            ]),
        ]);
    }

    /* =========================================
       Private Helper Methods
       ========================================= */

    /**
     * Get points history with filters
     */
    private function getPointsHistory(StudentProfile $profile, string $timeFilter = 'all', string $typeFilter = 'all')
    {
        $query = $profile->rewardRecords()
            ->orderBy('created_at', 'desc');

        if ($timeFilter !== 'all') {
            $query->where('created_at', '>=', $this->getTimeFilterDate($timeFilter));
        }

        if ($typeFilter === 'earned') {
            $query->where('points_change', '>', 0);
        } elseif ($typeFilter === 'spent') {
            $query->where('points_change', '<', 0);
        }

        return $query->limit(50)->get()->map(fn($record) => [
            'id' => $record->record_id,
            'type' => $record->points_change > 0 ? 'earned' : 'spent',
            'points' => abs($record->points_change),
            'balance' => $record->points_after ?? $profile->current_points,
            'source' => $record->reason ?? 'unknown',
            'description' => $this->getPointsDescription($record),
            'created_at' => $record->created_at->diffForHumans(),
            'reference' => $record->reward_id ?? null,
        ]);
    }

    /**
     * Get points statistics
     */
    private function getPointsStats(StudentProfile $profile): array
    {
        $allRecords = $profile->rewardRecords()->get();

        $totalEarned = $allRecords->where('points_change', '>', 0)->sum('points_change');
        $totalSpent = abs($allRecords->where('points_change', '<', 0)->sum('points_change'));

        $thisWeek = $allRecords
            ->where('created_at', '>=', now()->startOfWeek())
            ->where('points_change', '>', 0)
            ->sum('points_change');

        $thisMonth = $allRecords
            ->where('created_at', '>=', now()->startOfMonth())
            ->where('points_change', '>', 0)
            ->sum('points_change');

        $sourceBreakdown = [];
        $earnedRecords = $allRecords->where('points_change', '>', 0);

        if ($earnedRecords->count() > 0) {
            $groupedBySource = $earnedRecords->groupBy('reason');

            foreach ($groupedBySource as $source => $records) {
                $points = $records->sum('points_change');
                $sourceBreakdown[$source] = [
                    'points' => $points,
                    'percentage' => round(($points / max($totalEarned, 1)) * 100, 1),
                ];
            }

            uasort($sourceBreakdown, fn($a, $b) => $b['points'] <=> $a['points']);
        }

        return [
            'totalEarned' => $totalEarned,
            'totalSpent' => $totalSpent,
            'thisWeek' => $thisWeek,
            'thisMonth' => $thisMonth,
            'sourceBreakdown' => $sourceBreakdown,
            'topSource' => !empty($sourceBreakdown) ? array_key_first($sourceBreakdown) : null,
        ];
    }

    /**
     * Get date for time filter
     */
    private function getTimeFilterDate(string $filter)
    {
        return match ($filter) {
            'today' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'year' => now()->startOfYear(),
            default => now()->subYears(10),
        };
    }

    /**
     * Get points description text
     */
    private function getPointsDescription($record): string
    {
        if ($record->points_change > 0) {
            return match ($record->reason) {
                'test_completion' => '完成测验',
                'exercise_completion' => '完成练习',
                'lesson_completion' => '完成课程',
                'daily_streak' => '每日连续学习',
                'achievement' => '解锁成就',
                default => '获得积分',
            };
        } else {
            return '购买奖励：' . ($record->reward->name ?? '未知奖励');
        }
    }

    /**
     * Calculate achievement status
     */
    private function calculateAchievements(StudentProfile $profile): array
    {
        return [
            [
                'id' => 'first_lesson',
                'name' => 'Getting Started',
                'description' => 'Complete your first lesson',
                'icon' => '🎯',
                'unlocked' => $profile->total_lessons_completed >= 1,
            ],
            [
                'id' => 'ten_lessons',
                'name' => 'Dedicated Learner',
                'description' => 'Complete 10 lessons',
                'icon' => '📚',
                'unlocked' => $profile->total_lessons_completed >= 10,
            ],
            [
                'id' => 'first_test',
                'name' => 'Test Taker',
                'description' => 'Complete your first test',
                'icon' => '📝',
                'unlocked' => $profile->total_tests_taken >= 1,
            ],
            [
                'id' => 'perfect_score',
                'name' => 'Perfectionist',
                'description' => 'Score 100% on any test',
                'icon' => '⭐',
                'unlocked' => $profile->getBestScoreForTest(null) >= 100,
            ],
            [
                'id' => 'week_streak',
                'name' => 'Consistent',
                'description' => 'Maintain a 7-day streak',
                'icon' => '🔥',
                'unlocked' => $profile->streak_days >= 7,
            ],
            [
                'id' => 'month_streak',
                'name' => 'Unstoppable',
                'description' => 'Maintain a 30-day streak',
                'icon' => '💪',
                'unlocked' => $profile->streak_days >= 30,
            ],
            [
                'id' => 'points_master',
                'name' => 'Points Master',
                'description' => 'Earn 5,000 points',
                'icon' => '💎',
                'unlocked' => $profile->current_points >= 5000,
            ],
            [
                'id' => 'high_scorer',
                'name' => 'High Achiever',
                'description' => 'Maintain 90% average score',
                'icon' => '🏆',
                'unlocked' => $profile->average_score >= 90,
            ],
        ];
    }

    /**
     * Get progress data over time
     */
    private function getProgressOverTime(StudentProfile $profile, int $days): array
    {
        $startDate = now()->subDays($days);

        $testData = DB::table('test_submissions')
            ->where('student_id', $profile->student_id)
            ->whereIn('status', ['submitted', 'timeout'])
            ->where('submitted_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(submitted_at) as date'),
                DB::raw('AVG(score) as avg_score'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $exerciseData = DB::table('exercise_submissions')
            ->where('student_id', $profile->student_id)
            ->where('completed', true)
            ->where('submitted_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(submitted_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'tests' => $testData,
            'exercises' => $exerciseData,
        ];
    }

    /**
     * Format time spent in seconds to human readable format
     */
    private function formatTimeSpent(?int $seconds): string
    {
        if (!$seconds) return '0s';

        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $secs = $seconds % 60;

        if ($hours > 0) {
            return sprintf('%dh %dm', $hours, $minutes);
        }
        if ($minutes > 0) {
            return sprintf('%dm %ds', $minutes, $secs);
        }
        return sprintf('%ds', $secs);
    }
}
