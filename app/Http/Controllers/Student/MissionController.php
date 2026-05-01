<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\DailyChallengeCycleReward;
use App\Models\DailyChallengeProgress;
use App\Models\StudentProfile;
use App\Services\DailyChallengeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MissionController extends Controller
{
    public function __construct(
        private readonly DailyChallengeService $dailyChallengeService
    ) {}

    public function index(Request $request): Response
    {
        $studentProfile = $this->resolveStudentProfile($request);

        $missionBoard = $this->dailyChallengeService->getDashboardBoard($studentProfile->student_id);
        $rewardHistory = $this->buildRewardHistory($studentProfile->student_id, 6);
        $periodHistory = $this->buildPeriodHistory($studentProfile->student_id, 4);

        return Inertia::render('Student/Missions/Index', [
            'studentProfile' => $this->buildStudentProfilePayload($studentProfile),
            'missionBoard' => $missionBoard,
            'rewardHistory' => $rewardHistory,
            'periodHistory' => $periodHistory,
        ]);
    }

    public function history(Request $request): Response
    {
        $studentProfile = $this->resolveStudentProfile($request);
        $missionBoard = $this->dailyChallengeService->getDashboardBoard($studentProfile->student_id);
        $rewardHistory = $this->buildRewardHistory($studentProfile->student_id, 60);

        return Inertia::render('Student/Missions/History', [
            'studentProfile' => $this->buildStudentProfilePayload($studentProfile),
            'missionBoard' => $missionBoard,
            'rewardHistory' => $rewardHistory,
        ]);
    }

    public function archive(Request $request): Response
    {
        $studentProfile = $this->resolveStudentProfile($request);
        $missionBoard = $this->dailyChallengeService->getDashboardBoard($studentProfile->student_id);
        $periodHistory = $this->buildPeriodHistory($studentProfile->student_id, 24);

        return Inertia::render('Student/Missions/Archive', [
            'studentProfile' => $this->buildStudentProfilePayload($studentProfile),
            'missionBoard' => $missionBoard,
            'periodHistory' => $periodHistory,
        ]);
    }

    private function resolveStudentProfile(Request $request): StudentProfile
    {
        $user = $request->user();

        if (!$user || $user->role !== 'student') {
            abort(403, 'Only students can access the mission center.');
        }

        return StudentProfile::query()
            ->where('user_Id', $user->user_Id)
            ->firstOrFail();
    }

    private function buildStudentProfilePayload(StudentProfile $studentProfile): array
    {
        return [
            'student_id' => $studentProfile->student_id,
            'current_points' => $studentProfile->current_points,
            'points_level' => $studentProfile->points_level,
            'streak_days' => $studentProfile->streak_days,
        ];
    }

    private function buildRewardHistory(int $studentId, ?int $limit = 20): array
    {
        $challengeRewards = DailyChallengeProgress::query()
            ->with('definition:challenge_definition_id,code,title,period_type,target_count,reward_points')
            ->where('student_id', $studentId)
            ->where('reward_granted', true)
            ->whereNotNull('reward_granted_at')
            ->get()
            ->map(function (DailyChallengeProgress $progress) {
                return [
                    'kind' => 'mission_reward',
                    'title' => $progress->definition?->title ?? 'Mission Reward',
                    'subtitle' => 'Challenge completion reward',
                    'code' => $progress->definition?->code,
                    'period_type' => $progress->definition?->period_type ?? 'daily',
                    'period_start' => $progress->period_start?->toDateString(),
                    'period_end' => $progress->period_end?->toDateString(),
                    'reward_points' => (int) ($progress->definition?->reward_points ?? 0),
                    'granted_at' => $progress->reward_granted_at?->toIso8601String(),
                    'meta' => [
                        'target_count' => (int) ($progress->definition?->target_count ?? 0),
                        'current_count' => (int) $progress->current_count,
                    ],
                ];
            });

        $bonusRewards = DailyChallengeCycleReward::query()
            ->where('student_id', $studentId)
            ->get()
            ->map(function (DailyChallengeCycleReward $reward) {
                return [
                    'kind' => 'bonus_reward',
                    'title' => $reward->title,
                    'subtitle' => $reward->bonus_code === 'daily_full_clear'
                        ? 'Full-clear bonus reward'
                        : 'Milestone bonus reward',
                    'code' => $reward->bonus_code,
                    'period_type' => $reward->period_type,
                    'period_start' => $reward->period_start?->toDateString(),
                    'period_end' => $reward->period_end?->toDateString(),
                    'reward_points' => (int) $reward->reward_points,
                    'granted_at' => $reward->granted_at?->toIso8601String(),
                    'meta' => $reward->metadata ?? [],
                ];
            });

        return $challengeRewards
            ->concat($bonusRewards)
            ->sortByDesc('granted_at')
            ->when($limit, fn ($collection) => $collection->take($limit))
            ->values()
            ->all();
    }

    private function buildPeriodHistory(int $studentId, ?int $limit = 8): array
    {
        $progressEntries = DailyChallengeProgress::query()
            ->with('definition:challenge_definition_id,code,title,period_type,target_count,reward_points')
            ->where('student_id', $studentId)
            ->orderByDesc('period_start')
            ->orderByDesc('challenge_progress_id')
            ->get();

        $bonusRewards = DailyChallengeCycleReward::query()
            ->where('student_id', $studentId)
            ->get()
            ->groupBy(fn (DailyChallengeCycleReward $reward) => $reward->period_type . '|' . $reward->period_start?->toDateString());

        return $progressEntries
            ->groupBy(fn (DailyChallengeProgress $progress) => ($progress->definition?->period_type ?? 'daily') . '|' . $progress->period_start?->toDateString())
            ->map(function ($entries, string $key) use ($bonusRewards) {
                /** @var DailyChallengeProgress $first */
                $first = $entries->first();
                [$periodType, $periodStart] = explode('|', $key);
                $periodBonusRewards = $bonusRewards->get($key, collect());

                return [
                    'period_type' => $periodType,
                    'period_start' => $periodStart,
                    'period_end' => $first->period_end?->toDateString(),
                    'total_missions' => $entries->count(),
                    'completed_missions' => $entries->where('is_completed', true)->count(),
                    'reward_points_earned' => $entries->sum(function (DailyChallengeProgress $progress) {
                        return $progress->reward_granted ? (int) ($progress->definition?->reward_points ?? 0) : 0;
                    }),
                    'bonus_points_earned' => $periodBonusRewards->sum('reward_points'),
                    'bonus_titles' => $periodBonusRewards->pluck('title')->values()->all(),
                    'missions' => $entries->map(function (DailyChallengeProgress $progress) {
                        return [
                            'title' => $progress->definition?->title ?? 'Mission',
                            'code' => $progress->definition?->code,
                            'current_count' => (int) $progress->current_count,
                            'target_count' => (int) ($progress->definition?->target_count ?? 1),
                            'is_completed' => (bool) $progress->is_completed,
                            'reward_granted' => (bool) $progress->reward_granted,
                        ];
                    })->values()->all(),
                ];
            })
            ->sortByDesc('period_start')
            ->when($limit, fn ($collection) => $collection->take($limit))
            ->values()
            ->all();
    }
}
