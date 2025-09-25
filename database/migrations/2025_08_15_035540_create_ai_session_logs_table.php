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
        Schema::create('ai_session_logs', function (Blueprint $table) {
            $table->id('ai_session_log_id');
            $table->unsignedBigInteger('student_id');
            $table->string('ai_session_id', 100);
            $table->unsignedBigInteger('lesson_id')->nullable();
            $table->text('prompt');
            $table->text('response');
            $table->timestamp('timestamp')->useCurrent();
            $table->timestamps(); // This adds created_at and updated_at

            // Foreign key constraints
            $table->foreign('student_id')->references('student_id')->on('student_profiles')->onDelete('cascade');
            $table->foreign('lesson_id')->references('lesson_id')->on('lessons')->onDelete('set null');

            // Indexes for better performance
            $table->index('ai_session_id');
            $table->index('student_id');
            $table->index('lesson_id');
            $table->index('timestamp');
            $table->index(['student_id', 'ai_session_id']); // Compound index for session queries
            $table->index(['lesson_id', 'timestamp']);       // Compound index for lesson-based queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_session_logs');
    }
};
