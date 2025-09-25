<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tests', function (Blueprint $table) {
            $table->id('test_id');
            $table->unsignedBigInteger('lesson_id');
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->text('instructions')->nullable()->comment('Test instructions for students');
            $table->integer('time_limit')->nullable()->comment('Time limit in minutes for entire test');
            $table->integer('max_attempts')->default(3)->comment('Maximum attempts allowed');
            $table->integer('passing_score')->default(70)->comment('Minimum score to pass (percentage)');
            $table->boolean('shuffle_questions')->default(false)->comment('Randomize question order');
            $table->boolean('show_results_immediately')->default(true)->comment('Show results after submission');
            $table->boolean('allow_review')->default(true)->comment('Allow students to review answers');
            $table->enum('status', ['active', 'inactive', 'draft'])->default('draft');
            $table->integer('order')->default(0)->comment('Order within the lesson');
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('lesson_id')->references('lesson_id')->on('lessons')->onDelete('cascade');

            // Indexes
            $table->index(['lesson_id', 'status']);
            $table->index(['lesson_id', 'order']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tests');
    }
};
