<?php
// 5. create_submission_answers_table.php - 具体答案表

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submission_answers', function (Blueprint $table) {
            $table->id('answer_id');
            $table->unsignedBigInteger('submission_id');
            $table->unsignedBigInteger('question_id');
            $table->longText('answer_text')->nullable()->comment('Student answer text');
            $table->json('selected_options')->nullable()->comment('For MCQ: array of selected option IDs');
            $table->longText('code_answer')->nullable()->comment('For coding questions');
            $table->text('execution_output')->nullable()->comment('Output from code execution');
            $table->boolean('is_correct')->nullable()->comment('Whether the answer is correct');
            $table->decimal('points_earned', 5, 2)->default(0)->comment('Points earned for this question');
            $table->text('feedback')->nullable()->comment('Automated or manual feedback');
            $table->datetime('answered_at')->nullable();
            $table->json('metadata')->nullable()->comment('Additional data like execution time, etc.');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('submission_id')->references('submission_id')->on('test_submissions')->onDelete('cascade');
            $table->foreign('question_id')->references('question_id')->on('questions')->onDelete('cascade');

            // Indexes
            $table->index(['submission_id', 'question_id']);
            $table->index('question_id');
            $table->index('is_correct');

            // Unique constraint to prevent duplicate answers
            $table->unique(['submission_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_answers');
    }
};
