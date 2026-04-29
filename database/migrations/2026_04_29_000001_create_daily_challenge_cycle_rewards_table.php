<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_challenge_cycle_rewards', function (Blueprint $table) {
            $table->id('cycle_reward_id');
            $table->unsignedBigInteger('student_id');
            $table->enum('period_type', ['daily', 'weekly']);
            $table->date('period_start');
            $table->date('period_end');
            $table->string('bonus_code', 120);
            $table->string('title', 160);
            $table->unsignedInteger('reward_points')->default(0);
            $table->timestamp('granted_at');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student_profiles')
                ->onDelete('cascade');

            $table->unique(
                ['student_id', 'period_type', 'period_start', 'bonus_code'],
                'uq_daily_challenge_cycle_rewards_period_bonus'
            );
            $table->index(['student_id', 'period_start'], 'idx_daily_challenge_cycle_rewards_student_period');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_challenge_cycle_rewards');
    }
};
