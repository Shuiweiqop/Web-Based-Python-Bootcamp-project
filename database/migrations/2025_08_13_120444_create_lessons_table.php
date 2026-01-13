<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id('lesson_id');
            $table->string('title', 255);
            $table->longText('content')->nullable();
            $table->string('difficulty', 50)->default('beginner');
            $table->integer('estimated_duration')->nullable()->comment('Duration in minutes');
            $table->text('video_url')->nullable();
            $table->enum('status', ['active', 'inactive', 'draft'])->default('active');
            $table->integer('completion_reward_points')->default(0);

            // 新增字段
            $table->integer('required_exercises')->default(0);
            $table->integer('required_tests')->default(0);
            $table->decimal('min_exercise_score_percent', 5, 2)->default(70.00);

            $table->timestamps();

            // Indexes
            $table->index('difficulty');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
