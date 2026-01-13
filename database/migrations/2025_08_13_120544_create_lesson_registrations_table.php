<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_registrations', function (Blueprint $table) {
            $table->id('registration_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('lesson_id');

            $table->enum('registration_status', [
                'active',
                'completed',
                'cancelled'
            ])->default('active');

            // 完成进度追踪
            $table->integer('exercises_completed')->default(0);
            $table->integer('tests_passed')->default(0);
            $table->boolean('completion_points_awarded')->default(false);
            $table->datetime('completed_at')->nullable();

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('student_id')
                ->references('student_id')
                ->on('student_profiles')
                ->onDelete('cascade');

            $table->foreign('lesson_id')
                ->references('lesson_id')
                ->on('lessons')
                ->onDelete('cascade');

            // Unique constraint
            $table->unique(['student_id', 'lesson_id'], 'unique_student_lesson');

            // Indexes
            $table->index('registration_status');
            $table->index(['student_id', 'completion_points_awarded']);
            $table->index('completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('lesson_registrations', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropForeign(['lesson_id']);
        });

        Schema::dropIfExists('lesson_registrations');
    }
};
