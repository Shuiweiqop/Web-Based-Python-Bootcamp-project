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
        Schema::create('learning_paths', function (Blueprint $table) {
            $table->id('path_id');

            // Basic Information
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->text('learning_outcomes')->nullable(); // What students will learn
            $table->text('prerequisites')->nullable(); // What students should know before starting

            // Difficulty & Duration
            $table->enum('difficulty_level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->integer('estimated_duration_hours')->nullable()->comment('Estimated time to complete in hours');

            // Recommendation Criteria (for automatic path assignment)
            $table->integer('min_score_required')->default(0)->comment('Minimum placement test score (0-100)');
            $table->integer('max_score_required')->default(100)->comment('Maximum placement test score (0-100)');
            $table->json('required_skills')->nullable()->comment('Required skill levels: {"programming": 60, "math": 50}');

            // Visual & UX
            $table->string('icon', 50)->nullable()->comment('Icon name for UI (e.g., code, calculator, book)');
            $table->string('color', 20)->nullable()->comment('Color code for UI (e.g., #3B82F6)');
            $table->string('banner_image')->nullable()->comment('Banner image URL');

            // Status & Metadata
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false)->comment('Show on featured paths list');
            $table->integer('display_order')->default(0)->comment('Order in path list');

            // Tracking
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes(); // Soft delete for safety

            // Indexes
            $table->index('difficulty_level');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index(['min_score_required', 'max_score_required']);

            // Foreign Keys
            $table->foreign('created_by')->references('user_Id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('user_Id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_paths');
    }
};
