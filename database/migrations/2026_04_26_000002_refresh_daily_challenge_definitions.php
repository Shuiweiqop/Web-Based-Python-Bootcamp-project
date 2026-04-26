<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('daily_challenge_definitions')
            ->whereIn('code', [
                'daily_exercise_1',
                'daily_test_1',
                'daily_forum_reply_1',
                'weekly_exercise_5',
                'weekly_test_3',
                'weekly_forum_reply_5',
            ])
            ->update([
                'is_active' => false,
                'updated_at' => now(),
            ]);

        $definitions = [
            [
                'code' => 'daily_focus_sprint',
                'title' => 'Focus Sprint',
                'description' => 'Complete 1 exercise today to warm up your coding flow.',
                'period_type' => 'daily',
                'action_type' => 'exercise_completed',
                'target_count' => 1,
                'reward_points' => 30,
                'is_active' => true,
                'display_order' => 10,
            ],
            [
                'code' => 'daily_practice_combo',
                'title' => 'Practice Combo',
                'description' => 'Complete 3 exercises today to build steady momentum.',
                'period_type' => 'daily',
                'action_type' => 'exercise_completed',
                'target_count' => 3,
                'reward_points' => 75,
                'is_active' => true,
                'display_order' => 20,
            ],
            [
                'code' => 'daily_mastery_check',
                'title' => 'Mastery Check',
                'description' => 'Pass 1 test today and lock in what you learned.',
                'period_type' => 'daily',
                'action_type' => 'test_passed',
                'target_count' => 1,
                'reward_points' => 45,
                'is_active' => true,
                'display_order' => 30,
            ],
            [
                'code' => 'daily_peer_boost',
                'title' => 'Peer Boost',
                'description' => 'Post 1 forum reply today and help the learning community.',
                'period_type' => 'daily',
                'action_type' => 'forum_reply_created',
                'target_count' => 1,
                'reward_points' => 25,
                'is_active' => true,
                'display_order' => 40,
            ],
            [
                'code' => 'weekly_consistency_run',
                'title' => 'Consistency Run',
                'description' => 'Complete 5 exercises this week to keep your streak alive.',
                'period_type' => 'weekly',
                'action_type' => 'exercise_completed',
                'target_count' => 5,
                'reward_points' => 170,
                'is_active' => true,
                'display_order' => 110,
            ],
            [
                'code' => 'weekly_checkpoint_climb',
                'title' => 'Checkpoint Climb',
                'description' => 'Pass 2 tests this week and prove your progress.',
                'period_type' => 'weekly',
                'action_type' => 'test_passed',
                'target_count' => 2,
                'reward_points' => 160,
                'is_active' => true,
                'display_order' => 120,
            ],
            [
                'code' => 'weekly_community_support',
                'title' => 'Community Support',
                'description' => 'Post 3 forum replies this week to stay visible and helpful.',
                'period_type' => 'weekly',
                'action_type' => 'forum_reply_created',
                'target_count' => 3,
                'reward_points' => 90,
                'is_active' => true,
                'display_order' => 130,
            ],
        ];

        foreach ($definitions as $definition) {
            DB::table('daily_challenge_definitions')->updateOrInsert(
                ['code' => $definition['code']],
                array_merge($definition, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }

    public function down(): void
    {
        DB::table('daily_challenge_definitions')
            ->whereIn('code', [
                'daily_focus_sprint',
                'daily_practice_combo',
                'daily_mastery_check',
                'daily_peer_boost',
                'weekly_consistency_run',
                'weekly_checkpoint_climb',
                'weekly_community_support',
            ])
            ->delete();

        DB::table('daily_challenge_definitions')
            ->whereIn('code', [
                'daily_exercise_1',
                'daily_test_1',
                'daily_forum_reply_1',
                'weekly_exercise_5',
                'weekly_test_3',
                'weekly_forum_reply_5',
            ])
            ->update([
                'is_active' => true,
                'updated_at' => now(),
            ]);
    }
};
