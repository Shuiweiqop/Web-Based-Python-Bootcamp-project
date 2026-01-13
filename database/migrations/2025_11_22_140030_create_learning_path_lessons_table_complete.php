<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 先删除旧表（如果存在）
        Schema::dropIfExists('learning_path_lessons');

        // 创建新表
        Schema::create('learning_path_lessons', function (Blueprint $table) {
            $table->id('path_lesson_id');
            $table->unsignedBigInteger('path_id');
            $table->unsignedBigInteger('lesson_id');
            $table->integer('sequence_order')->default(0);
            $table->boolean('is_required')->default(true);
            $table->boolean('unlock_after_previous')->default(true);
            $table->integer('estimated_duration_minutes')->nullable();
            $table->text('path_specific_notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('path_id');
            $table->index('lesson_id');
            $table->index(['path_id', 'sequence_order']);
            $table->unique(['path_id', 'lesson_id'], 'unique_path_lesson');

            // Foreign keys
            $table->foreign('path_id')->references('path_id')->on('learning_paths')->onDelete('cascade');
            $table->foreign('lesson_id')->references('lesson_id')->on('lessons')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_path_lessons');
    }
};
