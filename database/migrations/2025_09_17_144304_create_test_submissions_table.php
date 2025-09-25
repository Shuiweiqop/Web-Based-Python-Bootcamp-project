<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_submissions', function (Blueprint $table) {
            $table->id('submission_id');
            $table->unsignedBigInteger('test_id');
            $table->unsignedBigInteger('student_id'); // 直接引用 student_profiles
            $table->integer('attempt_number')->default(1);
            $table->datetime('started_at');
            $table->datetime('submitted_at')->nullable();
            $table->integer('time_spent')->nullable()->comment('Time spent in seconds');
            $table->decimal('score', 5, 2)->nullable()->comment('Final score (percentage)');
            $table->integer('total_questions');
            $table->integer('correct_answers')->default(0);
            $table->enum('status', ['in_progress', 'submitted', 'timeout', 'abandoned'])->default('in_progress');
            $table->json('metadata')->nullable()->comment('Additional data like IP address, browser info, etc.');
            $table->timestamps();

            // 外键约束
            $table->foreign('test_id')->references('test_id')->on('tests')->onDelete('cascade');
            $table->foreign('student_id')->references('student_id')->on('student_profiles')->onDelete('cascade');

            // 索引
            $table->index(['test_id', 'student_id']);
            $table->index(['student_id', 'submitted_at']);
            $table->index('status');

            // 唯一约束
            $table->unique(['test_id', 'student_id', 'attempt_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_submissions');
    }
};
