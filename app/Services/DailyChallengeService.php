<?php

namespace App\Services;

use App\Models\DailyChallengeDefinition;
use App\Models\DailyChallengeCycleReward;
use App\Models\DailyChallengeEvent;
use App\Models\DailyChallengeProgress;
use App\Models\Notification;
use App\Models\StudentProfile;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DailyChallengeService
{
    private const DAILY_FULL_CLEAR_BONUS_CODE = 'daily_full_clear';
    private const DAILY_FULL_CLEAR_BONUS_POINTS = 90;
    private const DAILY_STREAK_MILESTONES = [
        3 => 40,
        7 => 120,
        14 => 260,
    ];

    public function getDashboardBoard(int $studentId): array
    {
        $definitions = DailyChallengeDefinition::query()
            ->where('is_active', true)
            ->orderBy('period_type')
            ->orderBy('display_order')
            ->get();

        $daily = [];
        $weekly = [];

        foreach ($definitions as $definition) {
            [$periodStart, $periodEnd] = $this->resolvePeriodWindow($definition->period_type);

            $progress = DailyChallengeProgress::query()
                ->where('student_id', $studentId)
                ->where('challenge_definition_id', $definition->challenge_definition_id)
                ->whereDate('period_start', $periodStart->toDateString())
                ->first();

            $currentCount = min($definition->target_count, (int) ($progress?->current_count ?? 0));
            $targetCount = max(1, (int) $definition->target_count);
            $isCompleted = (bool) ($progress?->is_completed ?? false);
            $rewardGranted = (bool) ($progress?->reward_granted ?? false);
            $remainingCount = max(0, $targetCount - $currentCount);

            $item = [
                'id' => $definition->challenge_definition_id,
                'code' => $definition->code,
                'title' => $definition->title,
                'description' => $definition->description,
                'period_type' => $definition->period_type,
                'action_type' => $definition->action_type,
                'target_count' => $targetCount,
                'current_count' => $currentCount,
                'remaining_count' => $remainingCount,
                'progress_percent' => (int) round(($currentCount / $targetCount) * 100),
                'is_completed' => $isCompleted,
                'reward_granted' => $rewardGranted,
                'reward_points' => (int) $definition->reward_points,
                'completed_at' => $progress?->completed_at?->toIso8601String(),
                'last_event_at' => $progress?->last_event_at?->toIso8601String(),
                'period_start' => $periodStart->toDateString(),
                'period_end' => $periodEnd->toDateString(),
                'period_label' => $definition->period_type === 'weekly' ? 'This Week' : 'Today',
                'status_label' => $rewardGranted
                    ? 'Reward sent'
                    : ($isCompleted ? 'Completed' : ($remainingCount === 0 ? 'Ready' : $remainingCount . ' to go')),
                'category' => $this->resolveCategory($definition->action_type),
                'ui' => $this->resolveUiMeta($definition->action_type, $definition->period_type, $isCompleted),
            ];

            if ($definition->period_type === 'weekly') {
                $weekly[] = $item;
            } else {
                $daily[] = $item;
            }
        }

        [$dailyStart, $dailyEnd] = $this->resolvePeriodWindow('daily');
        $fullClearReward = DailyChallengeCycleReward::query()
            ->where('student_id', $studentId)
            ->where('period_type', 'daily')
            ->whereDate('period_start', $dailyStart->toDateString())
            ->where('bonus_code', self::DAILY_FULL_CLEAR_BONUS_CODE)
            ->first();

        $streakSummary = $this->getDailyMissionStreakSummary($studentId);

        return [
            'daily' => $daily,
            'weekly' => $weekly,
            'summary' => [
                'daily_total' => count($daily),
                'daily_completed' => collect($daily)->where('is_completed', true)->count(),
                'weekly_total' => count($weekly),
                'weekly_completed' => collect($weekly)->where('is_completed', true)->count(),
                'total_points_available' => collect($daily)
                    ->merge($weekly)
                    ->sum('reward_points'),
                'daily_full_clear_bonus_points' => self::DAILY_FULL_CLEAR_BONUS_POINTS,
                'daily_full_clear_bonus_earned' => (bool) $fullClearReward,
                'daily_full_clear_bonus_title' => 'Full Clear Bonus',
                'mission_streak' => $streakSummary,
            ],
        ];
    }

    public function recordExerciseCompletion(int $studentId, int|string $submissionId): void
    {
        $this->recordAction($studentId, 'exercise_completed', 'exercise_submission', $submissionId);
    }

    public function recordTestPassed(int $studentId, int|string $submissionId): void
    {
        $this->recordAction($studentId, 'test_passed', 'test_submission', $submissionId);
    }

    public function recordForumReplyCreated(int $studentId, int|string $replyId): void
    {
        $this->recordAction($studentId, 'forum_reply_created', 'forum_reply', $replyId);
    }

    private function recordAction(
        int $studentId,
        string $actionType,
        string $sourceType,
        int|string $sourceId
    ): void {
        $definitions = DailyChallengeDefinition::query()
            ->where('is_active', true)
            ->where('action_type', $actionType)
            ->orderBy('display_order')
            ->get();

        if ($definitions->isEmpty()) {
            return;
        }

        foreach ($definitions as $definition) {
            DB::transaction(function () use ($studentId, $definition, $sourceType, $sourceId): void {
                [$periodStart, $periodEnd] = $this->resolvePeriodWindow($definition->period_type);

                $progress = DailyChallengeProgress::query()
                    ->where('student_id', $studentId)
                    ->where('challenge_definition_id', $definition->challenge_definition_id)
                    ->whereDate('period_start', $periodStart->toDateString())
                    ->lockForUpdate()
                    ->first();

                if (!$progress) {
                    $progress = DailyChallengeProgress::create([
                        'student_id' => $studentId,
                        'challenge_definition_id' => $definition->challenge_definition_id,
                        'period_start' => $periodStart->toDateString(),
                        'period_end' => $periodEnd->toDateString(),
                        'current_count' => 0,
                        'is_completed' => false,
                        'reward_granted' => false,
                    ]);
                }

                $sourceIdString = (string) $sourceId;
                $existingEvent = DailyChallengeEvent::query()
                    ->where('challenge_progress_id', $progress->challenge_progress_id)
                    ->where('source_type', $sourceType)
                    ->where('source_id', $sourceIdString)
                    ->exists();

                if ($existingEvent) {
                    return;
                }

                try {
                    DailyChallengeEvent::create([
                        'challenge_progress_id' => $progress->challenge_progress_id,
                        'student_id' => $studentId,
                        'challenge_definition_id' => $definition->challenge_definition_id,
                        'source_type' => $sourceType,
                        'source_id' => $sourceIdString,
                        'occurred_at' => now(),
                    ]);
                } catch (QueryException $exception) {
                    // Another request may have recorded this exact source event first.
                    if (($exception->errorInfo[0] ?? null) === '23000') {
                        return;
                    }

                    throw $exception;
                }

                $newCount = min($definition->target_count, $progress->current_count + 1);
                $isCompleted = $progress->is_completed || $newCount >= $definition->target_count;
                $completedAt = $progress->completed_at;

                if (!$progress->is_completed && $isCompleted) {
                    $completedAt = now();
                }

                $progress->update([
                    'current_count' => $newCount,
                    'is_completed' => $isCompleted,
                    'completed_at' => $completedAt,
                    'last_event_at' => now(),
                ]);

                if ($isCompleted && !$progress->reward_granted && $definition->reward_points > 0) {
                    $student = StudentProfile::query()
                        ->where('student_id', $studentId)
                        ->lockForUpdate()
                        ->first();

                    if (!$student) {
                        Log::warning('Daily challenge reward skipped because student profile was missing', [
                            'student_id' => $studentId,
                            'challenge_definition_id' => $definition->challenge_definition_id,
                        ]);

                        return;
                    }

                    $student->increment('current_points', $definition->reward_points);

                    Notification::createPoints(
                        (int) $student->user_Id,
                        (int) $definition->reward_points,
                        'Challenge complete: ' . $definition->title
                    );

                    $progress->update([
                        'reward_granted' => true,
                        'reward_granted_at' => now(),
                    ]);
                }

                $this->awardDailyFullClearBonus($studentId);
            });
        }
    }

    private function resolvePeriodWindow(string $periodType): array
    {
        $now = CarbonImmutable::now(config('app.timezone'));

        if ($periodType === 'weekly') {
            $start = $now->startOfWeek(CarbonImmutable::MONDAY);
            $end = $start->endOfWeek(CarbonImmutable::SUNDAY);

            return [$start, $end];
        }

        $start = $now->startOfDay();
        $end = $now->endOfDay();

        return [$start, $end];
    }

    private function resolveCategory(string $actionType): string
    {
        return match ($actionType) {
            'exercise_completed' => 'Practice',
            'test_passed' => 'Mastery',
            'forum_reply_created' => 'Community',
            default => 'Mission',
        };
    }

    private function resolveUiMeta(string $actionType, string $periodType, bool $isCompleted): array
    {
        $baseMeta = match ($actionType) {
            'exercise_completed' => [
                'icon' => 'zap',
                'accent' => 'amber',
                'chip' => 'Practice Loop',
            ],
            'test_passed' => [
                'icon' => 'target',
                'accent' => 'blue',
                'chip' => 'Mastery Check',
            ],
            'forum_reply_created' => [
                'icon' => 'messages',
                'accent' => 'emerald',
                'chip' => 'Community Quest',
            ],
            default => [
                'icon' => 'sparkles',
                'accent' => 'slate',
                'chip' => 'Mission',
            ],
        };

        $baseMeta['badge'] = $periodType === 'weekly' ? 'Weekly Quest' : 'Daily Mission';
        $baseMeta['state'] = $isCompleted ? 'complete' : 'active';

        return $baseMeta;
    }

    private function awardDailyFullClearBonus(int $studentId): void
    {
        [$periodStart, $periodEnd] = $this->resolvePeriodWindow('daily');

        $definitions = DailyChallengeDefinition::query()
            ->where('is_active', true)
            ->where('period_type', 'daily')
            ->get(['challenge_definition_id']);

        if ($definitions->isEmpty()) {
            return;
        }

        $completedCount = DailyChallengeProgress::query()
            ->where('student_id', $studentId)
            ->whereIn('challenge_definition_id', $definitions->pluck('challenge_definition_id'))
            ->whereDate('period_start', $periodStart->toDateString())
            ->where('is_completed', true)
            ->count();

        if ($completedCount !== $definitions->count()) {
            return;
        }

        $existingReward = DailyChallengeCycleReward::query()
            ->where('student_id', $studentId)
            ->where('period_type', 'daily')
            ->whereDate('period_start', $periodStart->toDateString())
            ->where('bonus_code', self::DAILY_FULL_CLEAR_BONUS_CODE)
            ->lockForUpdate()
            ->first();

        if ($existingReward) {
            return;
        }

        $student = StudentProfile::query()
            ->where('student_id', $studentId)
            ->lockForUpdate()
            ->first();

        if (!$student) {
            Log::warning('Daily full clear bonus skipped because student profile was missing', [
                'student_id' => $studentId,
            ]);

            return;
        }

        $student->increment('current_points', self::DAILY_FULL_CLEAR_BONUS_POINTS);

        DailyChallengeCycleReward::create([
            'student_id' => $studentId,
            'period_type' => 'daily',
            'period_start' => $periodStart->toDateString(),
            'period_end' => $periodEnd->toDateString(),
            'bonus_code' => self::DAILY_FULL_CLEAR_BONUS_CODE,
            'title' => 'Full Clear Bonus',
            'reward_points' => self::DAILY_FULL_CLEAR_BONUS_POINTS,
            'granted_at' => now(),
            'metadata' => [
                'completed_definitions' => $definitions->count(),
            ],
        ]);

        Notification::createPoints(
            (int) $student->user_Id,
            self::DAILY_FULL_CLEAR_BONUS_POINTS,
            'All daily missions completed'
        );

        Notification::createAchievement(
            (int) $student->user_Id,
            'Daily Full Clear',
            'You completed every daily mission and earned a bonus reward.'
        );

        $this->awardMissionStreakMilestones($studentId, $student, $periodStart, $periodEnd);
    }

    private function awardMissionStreakMilestones(
        int $studentId,
        StudentProfile $student,
        CarbonImmutable $periodStart,
        CarbonImmutable $periodEnd
    ): void {
        $streakSummary = $this->getDailyMissionStreakSummary($studentId, $periodStart);
        $currentStreak = $streakSummary['current_streak'] ?? 0;

        foreach (self::DAILY_STREAK_MILESTONES as $days => $points) {
            if ($currentStreak !== $days) {
                continue;
            }

            $bonusCode = sprintf('daily_streak_%d', $days);
            $existingReward = DailyChallengeCycleReward::query()
                ->where('student_id', $studentId)
                ->where('period_type', 'daily')
                ->whereDate('period_start', $periodStart->toDateString())
                ->where('bonus_code', $bonusCode)
                ->lockForUpdate()
                ->first();

            if ($existingReward) {
                continue;
            }

            $student->increment('current_points', $points);

            DailyChallengeCycleReward::create([
                'student_id' => $studentId,
                'period_type' => 'daily',
                'period_start' => $periodStart->toDateString(),
                'period_end' => $periodEnd->toDateString(),
                'bonus_code' => $bonusCode,
                'title' => sprintf('%d-Day Mission Streak', $days),
                'reward_points' => $points,
                'granted_at' => now(),
                'metadata' => [
                    'streak_days' => $days,
                ],
            ]);

            Notification::createPoints(
                (int) $student->user_Id,
                $points,
                sprintf('%d-day mission streak reward', $days)
            );

            Notification::createAchievement(
                (int) $student->user_Id,
                sprintf('%d-Day Mission Streak', $days),
                sprintf('You cleared every daily mission for %d days in a row.', $days)
            );
        }
    }

    private function getDailyMissionStreakSummary(int $studentId, ?CarbonImmutable $anchorDate = null): array
    {
        $anchor = ($anchorDate ?? CarbonImmutable::now(config('app.timezone')))->startOfDay();

        $rewardDates = DailyChallengeCycleReward::query()
            ->where('student_id', $studentId)
            ->where('period_type', 'daily')
            ->where('bonus_code', self::DAILY_FULL_CLEAR_BONUS_CODE)
            ->orderByDesc('period_start')
            ->pluck('period_start')
            ->map(fn ($date) => CarbonImmutable::parse($date, config('app.timezone'))->toDateString())
            ->values();

        $rewardDateSet = array_flip($rewardDates->all());

        $currentStreak = 0;
        $cursor = $anchor;

        while (isset($rewardDateSet[$cursor->toDateString()])) {
            $currentStreak++;
            $cursor = $cursor->subDay();
        }

        $bestStreak = 0;
        $running = 0;
        $previousDate = null;

        foreach ($rewardDates->sort()->values() as $dateString) {
            $currentDate = CarbonImmutable::parse($dateString, config('app.timezone'));

            if ($previousDate && $previousDate->addDay()->toDateString() === $currentDate->toDateString()) {
                $running++;
            } else {
                $running = 1;
            }

            $bestStreak = max($bestStreak, $running);
            $previousDate = $currentDate;
        }

        $nextMilestoneDays = null;
        $nextMilestonePoints = null;

        foreach (self::DAILY_STREAK_MILESTONES as $days => $points) {
            if ($currentStreak < $days) {
                $nextMilestoneDays = $days;
                $nextMilestonePoints = $points;
                break;
            }
        }

        $latestMilestone = null;
        foreach (array_keys(self::DAILY_STREAK_MILESTONES) as $days) {
            if ($currentStreak >= $days) {
                $latestMilestone = $days;
            }
        }

        return [
            'current_streak' => $currentStreak,
            'best_streak' => $bestStreak,
            'next_milestone_days' => $nextMilestoneDays,
            'next_milestone_points' => $nextMilestonePoints,
            'days_to_next_milestone' => $nextMilestoneDays ? max(0, $nextMilestoneDays - $currentStreak) : 0,
            'latest_milestone' => $latestMilestone,
            'milestones' => collect(self::DAILY_STREAK_MILESTONES)
                ->map(fn ($points, $days) => [
                    'days' => (int) $days,
                    'points' => $points,
                    'earned' => $currentStreak >= (int) $days,
                ])
                ->values()
                ->all(),
        ];
    }
}
