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
                'active',    // Successfully registered and active
                'cancelled'  // User cancelled their registration
            ])->default('active');

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

            // Unique constraint to prevent duplicate registrations
            $table->unique(['student_id', 'lesson_id'], 'unique_student_lesson');

            // Index for performance
            $table->index('registration_status', 'idx_registration_status');
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
