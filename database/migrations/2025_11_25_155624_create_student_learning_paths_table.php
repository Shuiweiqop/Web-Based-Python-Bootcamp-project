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
        Schema::create('student_learning_paths', function (Blueprint $table) {
            // Primary Key
            $table->id('student_path_id');

            // Foreign Keys
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('path_id');

            // Placement Test & Recommendation Fields
            $table->unsignedBigInteger('placement_test_submission_id')->nullable()->comment('Reference to placement test submission');
            $table->unsignedBigInteger('assigned_by_user_id')->nullable()->comment('User ID if assigned by admin/teacher');
            $table->decimal('recommendation_score', 5, 2)->nullable()->comment('Confidence score from recommendation');
            $table->text('recommendation_reason')->nullable()->comment('Reason for path recommendation');
            $table->date('target_completion_date')->nullable()->comment('Target date for completion');

            // Status and Progress
            $table->enum('status', ['active', 'paused', 'completed'])->default('active');
            $table->integer('progress_percent')->default(0);

            // Assignment Info
            $table->boolean('is_primary')->default(false);
            $table->string('assigned_by')->nullable()->comment('system, admin, self');
            $table->timestamp('assigned_at')->nullable();

            // Timestamps
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('last_activity_at')->nullable();

            // Additional Info
            $table->text('notes')->nullable();

            // Standard Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Foreign Key Constraints
            $table->foreign('student_id')
                ->references('student_id')
                ->on('student_profiles')
                ->onDelete('cascade');

            $table->foreign('path_id')
                ->references('path_id')
                ->on('learning_paths')
                ->onDelete('cascade');

            $table->foreign('placement_test_submission_id')
                ->references('submission_id')
                ->on('test_submissions')
                ->onDelete('set null');

            $table->foreign('assigned_by_user_id')
                ->references('user_Id')
                ->on('users')
                ->onDelete('set null');

            // Indexes for Performance
            $table->index(['student_id', 'status'], 'idx_student_status');
            $table->index('path_id', 'idx_path');
            $table->index('is_primary', 'idx_primary');
            $table->index('last_activity_at', 'idx_last_activity');
            $table->index('placement_test_submission_id', 'idx_placement_test');

            // Unique constraint: one active/paused path per student
            $table->unique(['student_id', 'path_id', 'status'], 'unique_student_path_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_learning_paths');
    }
};
