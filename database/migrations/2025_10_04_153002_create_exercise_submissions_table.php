<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercise_submissions', function (Blueprint $table) {
            $table->id('submission_id');
            $table->unsignedBigInteger('exercise_id');
            $table->unsignedBigInteger('student_id');
            $table->integer('score')->default(0);
            $table->integer('time_taken')->nullable()->comment('Time in seconds');
            $table->boolean('completed')->default(false);
            $table->json('answer_data')->nullable()->comment('Student answer details');
            $table->datetime('submitted_at');
            $table->timestamps();

            // Foreign keys
            $table->foreign('exercise_id')
                ->references('exercise_id')
                ->on('interactive_exercises')
                ->onDelete('cascade');

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student_profiles')
                ->onDelete('cascade');

            // Indexes
            $table->index(['exercise_id', 'student_id']);
            $table->index('submitted_at');
            $table->index(['student_id', 'score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercise_submissions');
    }
};
