<?php

namespace App\Services;

use App\Models\StudentProfile;
use Illuminate\Support\Facades\DB;

class StudentProfileService
{
    public function getLearningPaths(StudentProfile $profile, int $limit = 3): \Illuminate\Support\Collection
    {
        return $profile->learningPaths()
            ->with(['learningPath', 'learningPath.lessons'])
            ->whereIn('status', ['active', 'paused', 'completed'])
            ->orderByDesc('is_primary')
            ->orderByDesc('last_activity_at')
            ->limit($limit)
            ->get()
            ->map(function ($studentPath) {
                $path = $studentPath->learningPath;
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
    }

    public function getEquippedItems(StudentProfile $profile): array
    {
        $equipped = ['background' => null, 'avatar_frame' => null, 'title' => null, 'badges' => []];

        foreach ($profile->rewardInventory()->where('is_equipped', true)->with('reward')->get() as $item) {
            $reward = $item->reward;
            $data = [
                'id' => $reward->reward_id,
                'name' => $reward->name,
                'description' => $reward->description,
                'image_url' => $reward->image_url,
                'icon' => $reward->icon ?? null,
                'rarity' => $reward->rarity,
                'metadata' => $reward->metadata ?? [],
            ];

            switch ($reward->reward_type) {
                case 'background':
                case 'profile_background':
                    $equipped['background'] = $data;
                    break;
                case 'avatar_frame':
                    $equipped['avatar_frame'] = $data;
                    break;
                case 'title':
                case 'profile_title':
                    $equipped['title'] = $data;
                    break;
                case 'badge':
                    $equipped['badges'][] = $data;
                    break;
            }
        }

        return $equipped;
    }

    public function getInventoryByType(StudentProfile $profile): array
    {
        $collection = $profile->rewardInventory()->with('reward')->get()
            ->groupBy(fn ($item) => $item->reward->reward_type);

        return [
            'backgrounds' => $collection->get('profile_background', collect())
                ->merge($collection->get('background', collect()))
                ->map(fn ($i) => $this->formatItem($i, true))->values(),
            'avatarFrames' => $collection->get('avatar_frame', collect())
                ->map(fn ($i) => $this->formatItem($i, true))->values(),
            'titles' => $collection->get('title', collect())
                ->merge($collection->get('profile_title', collect()))
                ->map(fn ($i) => $this->formatItem($i, false))->values(),
            'badges' => $collection->get('badge', collect())
                ->map(fn ($i) => $this->formatItem($i, true))->values(),
        ];
    }

    public function getInventoryGrouped(StudentProfile $profile): \Illuminate\Support\Collection
    {
        return $profile->rewardInventory()->with('reward')->get()
            ->groupBy(fn ($item) => $item->reward->reward_type)
            ->map(fn ($items) => $items->map(fn ($item) => [
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
                'metadata' => $item->reward->metadata ?? [],
            ]));
    }

    public function calculateAchievements(StudentProfile $profile): array
    {
        return [
            ['id' => 'first_lesson',  'name' => 'Getting Started',   'description' => 'Complete your first lesson',        'icon' => '🎯', 'unlocked' => $profile->total_lessons_completed >= 1],
            ['id' => 'ten_lessons',   'name' => 'Dedicated Learner',  'description' => 'Complete 10 lessons',               'icon' => '📚', 'unlocked' => $profile->total_lessons_completed >= 10],
            ['id' => 'first_test',    'name' => 'Test Taker',         'description' => 'Complete your first test',          'icon' => '📝', 'unlocked' => $profile->total_tests_taken >= 1],
            ['id' => 'perfect_score', 'name' => 'Perfectionist',      'description' => 'Score 100% on any test',            'icon' => '⭐', 'unlocked' => $profile->getBestScoreForTest(null) >= 100],
            ['id' => 'week_streak',   'name' => 'Consistent',         'description' => 'Maintain a 7-day streak',           'icon' => '🔥', 'unlocked' => $profile->streak_days >= 7],
            ['id' => 'month_streak',  'name' => 'Unstoppable',        'description' => 'Maintain a 30-day streak',          'icon' => '💪', 'unlocked' => $profile->streak_days >= 30],
            ['id' => 'points_master', 'name' => 'Points Master',      'description' => 'Earn 5,000 points',                 'icon' => '💎', 'unlocked' => $profile->current_points >= 5000],
            ['id' => 'high_scorer',   'name' => 'High Achiever',      'description' => 'Maintain 90% average score',        'icon' => '🏆', 'unlocked' => $profile->average_score >= 90],
        ];
    }

    /**
     * Points ledger for the student's points page.
     *
     * Reads `points_changed` and `issued_by`, which are the columns
     * reward_records actually has. An earlier version queried `points_change`
     * and `reason` — neither exists on the table, so this page 500'd on every
     * request.
     */
    public function getPointsHistory(StudentProfile $profile, string $timeFilter, string $typeFilter): \Illuminate\Support\Collection
    {
        $query = $profile->rewardRecords()->with('reward')->orderBy('created_at', 'desc');

        if ($timeFilter !== 'all') {
            $query->where('created_at', '>=', $this->timeFilterDate($timeFilter));
        }
        if ($typeFilter === 'earned') {
            $query->where('points_changed', '>', 0);
        } elseif ($typeFilter === 'spent') {
            $query->where('points_changed', '<', 0);
        }

        return $query->limit(50)->get()->map(fn ($record) => [
            'id' => $record->record_id,
            'type' => $record->points_changed > 0 ? 'earned' : 'spent',
            'points' => abs((int) $record->points_changed),
            'balance' => $record->points_after ?? $profile->current_points,
            'source' => $record->issued_by ?? 'unknown',
            'description' => $this->pointsDescription($record),
            'created_at' => $record->created_at?->diffForHumans(),
            'reference' => $record->reward_id ?? null,
        ]);
    }

    public function getPointsStats(StudentProfile $profile): array
    {
        $base = fn () => $profile->rewardRecords();

        $totalEarned = (int) $base()->where('points_changed', '>', 0)->sum('points_changed');
        $totalSpent = (int) abs($base()->where('points_changed', '<', 0)->sum('points_changed'));
        $thisWeek = (int) $base()->where('points_changed', '>', 0)->where('created_at', '>=', now()->startOfWeek())->sum('points_changed');
        $thisMonth = (int) $base()->where('points_changed', '>', 0)->where('created_at', '>=', now()->startOfMonth())->sum('points_changed');

        $sourceBreakdown = [];
        foreach ($base()->where('points_changed', '>', 0)->selectRaw('issued_by, SUM(points_changed) as total')->groupBy('issued_by')->orderByDesc('total')->get() as $row) {
            $sourceBreakdown[$row->issued_by] = [
                'points' => (int) $row->total,
                'percentage' => round(($row->total / max($totalEarned, 1)) * 100, 1),
            ];
        }

        return [
            'totalEarned' => $totalEarned,
            'totalSpent' => $totalSpent,
            'thisWeek' => $thisWeek,
            'thisMonth' => $thisMonth,
            'sourceBreakdown' => $sourceBreakdown,
            'topSource' => ! empty($sourceBreakdown) ? array_key_first($sourceBreakdown) : null,
        ];
    }

    public function getProgressOverTime(StudentProfile $profile, int $days): array
    {
        $startDate = now()->subDays($days);

        $testData = DB::table('test_submissions')
            ->where('student_id', $profile->student_id)
            ->whereIn('status', ['submitted', 'timeout'])
            ->where('submitted_at', '>=', $startDate)
            ->selectRaw('DATE(submitted_at) as date, AVG(score) as avg_score, COUNT(*) as count')
            ->groupBy('date')->orderBy('date')->get();

        $exerciseData = DB::table('exercise_submissions')
            ->where('student_id', $profile->student_id)
            ->where('completed', true)
            ->where('submitted_at', '>=', $startDate)
            ->selectRaw('DATE(submitted_at) as date, COUNT(*) as count')
            ->groupBy('date')->orderBy('date')->get();

        return ['tests' => $testData, 'exercises' => $exerciseData];
    }

    public function formatTimeSpent(?int $seconds): string
    {
        if (! $seconds) {
            return '0s';
        }
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

    private function formatItem($item, bool $includeImageUrl): array
    {
        $data = [
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
            ],
        ];

        if ($includeImageUrl) {
            $data['image_url'] = $item->reward->image_url;
            $data['reward']['image_url'] = $item->reward->image_url;
        }

        return $data;
    }

    private function timeFilterDate(string $filter): \Carbon\Carbon
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
     * Human label for one ledger entry.
     *
     * Keyed on `issued_by`, the enum the table actually carries
     * (system / admin / student_purchase). There is no finer-grained reason
     * column to distinguish a test award from a lesson award.
     */
    private function pointsDescription($record): string
    {
        if ($record->points_changed > 0) {
            return match ($record->issued_by) {
                'system' => 'Earned through learning',
                'admin' => 'Awarded by an administrator',
                default => 'Points earned',
            };
        }

        return 'Reward purchased: '.($record->reward->name ?? 'Unknown reward');
    }
}
