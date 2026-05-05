<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // otps.email — every OTP login lookup was a full-table scan
        Schema::table('otps', function (Blueprint $table) {
            $table->index('email', 'idx_otps_email');
        });

        // exercise_submissions — [student_id, completed] for getCompletedExercisesCount queries
        Schema::table('exercise_submissions', function (Blueprint $table) {
            $table->index(['student_id', 'completed'], 'idx_exercise_submissions_student_completed');
        });

        // notifications — unread count and paginated list are the two hottest queries
        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_Id', 'is_read'],    'idx_notifications_user_unread');
            $table->index(['user_Id', 'created_at'], 'idx_notifications_user_created');
        });

        // lessons — admin list filters by status then sorts by created_at
        Schema::table('lessons', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'idx_lessons_status_created');
        });
    }

    public function down(): void
    {
        Schema::table('otps', function (Blueprint $table) {
            $table->dropIndex('idx_otps_email');
        });

        Schema::table('exercise_submissions', function (Blueprint $table) {
            $table->dropIndex('idx_exercise_submissions_student_completed');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_user_unread');
            $table->dropIndex('idx_notifications_user_created');
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->dropIndex('idx_lessons_status_created');
        });
    }
};
