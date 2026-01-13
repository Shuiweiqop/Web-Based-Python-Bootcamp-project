<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('learning_path_lessons', function (Blueprint $table) {
            $table->id('path_lesson_id');

            // Relationships - 明确指定为 unsignedBigInteger
            $table->unsignedBigInteger('path_id');
            $table->unsignedBigInteger('lesson_id');

            // Ordering & Requirements
            $table->integer('sequence_order')->default(0)->comment('Order of lesson in the path (1, 2, 3...)');
            $table->boolean('is_required')->default(true)->comment('Is this lesson mandatory?');
            $table->boolean('unlock_after_previous')->default(true)->comment('Must complete previous lesson first?');

            // Additional Settings
            $table->integer('estimated_duration_minutes')->nullable()->comment('Estimated time for this lesson');
            $table->text('path_specific_notes')->nullable()->comment('Notes specific to this path context');

            // Timestamps
            $table->timestamps();

            // Indexes FIRST (before foreign keys)
            $table->index('path_id');
            $table->index('lesson_id');
            $table->index(['path_id', 'sequence_order']); // For ordering queries

            // Unique Constraint: A lesson can only appear once in a path
            $table->unique(['path_id', 'lesson_id'], 'unique_path_lesson');
        });

        // 在单独的 statement 中添加外键（更安全）
        Schema::table('learning_path_lessons', function (Blueprint $table) {
            // Foreign Key to learning_paths
            $table->foreign('path_id', 'fk_path_lessons_path')
                ->references('path_id')
                ->on('learning_paths')
                ->onDelete('cascade');

            // Foreign Key to lessons
            $table->foreign('lesson_id', 'fk_path_lessons_lesson')
                ->references('lesson_id')
                ->on('lessons')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_path_lessons');
    }
};
