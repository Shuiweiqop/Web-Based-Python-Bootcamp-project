<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id('progress_id');

            // Foreign key columns
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('lesson_id');

            // Progress tracking fields
            $table->boolean('reward_granted')->default(false);
            $table->boolean('exercise_completed')->default(false);
            $table->boolean('test_completed')->default(false);

            $table->enum('status', ['not_started', 'in_progress', 'completed', 'paused'])
                ->default('not_started');

            $table->unsignedTinyInteger('progress_percent')->default(0); // 0 - 100

            $table->timestamp('started_at')->nullable();
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            // Foreign keys
            $table->foreign('student_id')
                ->references('student_id') // ✅ Match your student_profiles PK name exactly
                ->on('student_profiles')
                ->onDelete('cascade');

            $table->foreign('lesson_id')
                ->references('lesson_id')
                ->on('lessons')
                ->onDelete('cascade');

            // Unique constraint (one progress record per student per lesson)
            $table->unique(['student_id', 'lesson_id']);

            // Indexes for performance
            $table->index('status');
            $table->index('progress_percent');
            $table->index('completed_at');
            $table->index(['student_id', 'status']);
        });

        // Add check constraint only for engines that support ALTER TABLE ... ADD CONSTRAINT.
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE lesson_progress ADD CONSTRAINT chk_progress_percent CHECK (progress_percent BETWEEN 0 AND 100)');
        }
    }

    public function down(): void
    {
        // Drop check constraint only where it is supported.
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE lesson_progress DROP CONSTRAINT IF EXISTS chk_progress_percent');
        }

        Schema::dropIfExists('lesson_progress');
    }
};
