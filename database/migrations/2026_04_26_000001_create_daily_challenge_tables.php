<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_challenge_definitions', function (Blueprint $table) {
            $table->id('challenge_definition_id');
            $table->string('code', 120)->unique();
            $table->string('title', 160);
            $table->string('description', 255)->nullable();
            $table->enum('period_type', ['daily', 'weekly']);
            $table->enum('action_type', ['exercise_completed', 'test_passed', 'forum_reply_created']);
            $table->unsignedInteger('target_count')->default(1);
            $table->unsignedInteger('reward_points')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('daily_challenge_progress', function (Blueprint $table) {
            $table->id('challenge_progress_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('challenge_definition_id');
            $table->date('period_start');
            $table->date('period_end');
            $table->unsignedInteger('current_count')->default(0);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->boolean('reward_granted')->default(false);
            $table->timestamp('reward_granted_at')->nullable();
            $table->timestamp('last_event_at')->nullable();
            $table->timestamps();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student_profiles')
                ->onDelete('cascade');

            $table->foreign('challenge_definition_id')
                ->references('challenge_definition_id')
                ->on('daily_challenge_definitions')
                ->onDelete('cascade');

            $table->unique(
                ['student_id', 'challenge_definition_id', 'period_start'],
                'uq_daily_challenge_progress_period'
            );
            $table->index(['student_id', 'period_start'], 'idx_daily_challenge_progress_student_period');
        });

        Schema::create('daily_challenge_events', function (Blueprint $table) {
            $table->id('challenge_event_id');
            $table->unsignedBigInteger('challenge_progress_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('challenge_definition_id');
            $table->string('source_type', 64);
            $table->string('source_id', 64);
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->foreign('challenge_progress_id')
                ->references('challenge_progress_id')
                ->on('daily_challenge_progress')
                ->onDelete('cascade');

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student_profiles')
                ->onDelete('cascade');

            $table->foreign('challenge_definition_id')
                ->references('challenge_definition_id')
                ->on('daily_challenge_definitions')
                ->onDelete('cascade');

            $table->unique(
                ['challenge_progress_id', 'source_type', 'source_id'],
                'uq_daily_challenge_events_source'
            );
            $table->index(['student_id', 'occurred_at'], 'idx_daily_challenge_events_student_occurrence');
        });

        DB::table('daily_challenge_definitions')->insert([
            [
                'code' => 'daily_exercise_1',
                'title' => 'Daily Practice Sprint',
                'description' => 'Complete 1 exercise today.',
                'period_type' => 'daily',
                'action_type' => 'exercise_completed',
                'target_count' => 1,
                'reward_points' => 30,
                'is_active' => true,
                'display_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'daily_test_1',
                'title' => 'Daily Checkpoint',
                'description' => 'Pass 1 test today.',
                'period_type' => 'daily',
                'action_type' => 'test_passed',
                'target_count' => 1,
                'reward_points' => 40,
                'is_active' => true,
                'display_order' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'daily_forum_reply_1',
                'title' => 'Daily Community Boost',
                'description' => 'Post 1 forum reply today.',
                'period_type' => 'daily',
                'action_type' => 'forum_reply_created',
                'target_count' => 1,
                'reward_points' => 25,
                'is_active' => true,
                'display_order' => 30,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'weekly_exercise_5',
                'title' => 'Weekly Exercise Run',
                'description' => 'Complete 5 exercises this week.',
                'period_type' => 'weekly',
                'action_type' => 'exercise_completed',
                'target_count' => 5,
                'reward_points' => 160,
                'is_active' => true,
                'display_order' => 110,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'weekly_test_3',
                'title' => 'Weekly Mastery Check',
                'description' => 'Pass 3 tests this week.',
                'period_type' => 'weekly',
                'action_type' => 'test_passed',
                'target_count' => 3,
                'reward_points' => 220,
                'is_active' => true,
                'display_order' => 120,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'weekly_forum_reply_5',
                'title' => 'Weekly Community Streak',
                'description' => 'Post 5 forum replies this week.',
                'period_type' => 'weekly',
                'action_type' => 'forum_reply_created',
                'target_count' => 5,
                'reward_points' => 140,
                'is_active' => true,
                'display_order' => 130,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_challenge_events');
        Schema::dropIfExists('daily_challenge_progress');
        Schema::dropIfExists('daily_challenge_definitions');
    }
};

