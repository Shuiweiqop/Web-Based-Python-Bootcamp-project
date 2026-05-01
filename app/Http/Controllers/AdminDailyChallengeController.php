<?php

namespace App\Http\Controllers;

use App\Models\DailyChallengeCycleReward;
use App\Models\DailyChallengeDefinition;
use App\Models\DailyChallengeProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDailyChallengeController extends Controller
{
    private const PERIOD_OPTIONS = [
        'daily' => 'Daily',
        'weekly' => 'Weekly',
    ];

    private const ACTION_OPTIONS = [
        'exercise_completed' => 'Exercise Completed',
        'test_passed' => 'Test Passed',
        'forum_reply_created' => 'Forum Reply Created',
    ];

    public function index(): Response
    {
        $definitions = DailyChallengeDefinition::query()
            ->orderBy('period_type')
            ->orderBy('display_order')
            ->orderBy('challenge_definition_id')
            ->get()
            ->map(fn (DailyChallengeDefinition $definition) => [
                'id' => $definition->challenge_definition_id,
                'code' => $definition->code,
                'title' => $definition->title,
                'description' => $definition->description,
                'period_type' => $definition->period_type,
                'action_type' => $definition->action_type,
                'target_count' => $definition->target_count,
                'reward_points' => $definition->reward_points,
                'is_active' => $definition->is_active,
                'display_order' => $definition->display_order,
                'updated_at' => optional($definition->updated_at)->toIso8601String(),
            ])
            ->values();

        $stats = [
            'total_definitions' => DailyChallengeDefinition::count(),
            'active_definitions' => DailyChallengeDefinition::where('is_active', true)->count(),
            'daily_definitions' => DailyChallengeDefinition::where('period_type', 'daily')->where('is_active', true)->count(),
            'weekly_definitions' => DailyChallengeDefinition::where('period_type', 'weekly')->where('is_active', true)->count(),
            'progress_rows' => DailyChallengeProgress::count(),
            'bonus_rewards_issued' => DailyChallengeCycleReward::count(),
        ];

        return Inertia::render('Admin/DailyChallenges/Index', [
            'definitions' => $definitions,
            'stats' => $stats,
            'options' => [
                'period_types' => self::PERIOD_OPTIONS,
                'action_types' => self::ACTION_OPTIONS,
            ],
        ]);
    }

    public function update(Request $request, DailyChallengeDefinition $dailyChallengeDefinition): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:255'],
            'period_type' => ['required', 'in:' . implode(',', array_keys(self::PERIOD_OPTIONS))],
            'action_type' => ['required', 'in:' . implode(',', array_keys(self::ACTION_OPTIONS))],
            'target_count' => ['required', 'integer', 'min:1', 'max:999'],
            'reward_points' => ['required', 'integer', 'min:0', 'max:99999'],
            'is_active' => ['required', 'boolean'],
            'display_order' => ['required', 'integer', 'min:0', 'max:9999'],
        ]);

        $dailyChallengeDefinition->update($validated);

        return back()->with('success', 'Challenge definition updated successfully.');
    }
}
