
<?php
// 2. create_questions_table.php - 题目表

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id('question_id');
            $table->unsignedBigInteger('test_id');
            $table->enum('type', ['mcq', 'coding', 'true_false', 'short_answer'])->comment('Question type');
            $table->text('question_text')->comment('The actual question');
            $table->text('code_snippet')->nullable()->comment('Code snippet for coding questions');
            $table->longText('correct_answer')->comment('Correct answer or expected output');
            $table->text('explanation')->nullable()->comment('Explanation for the correct answer');
            $table->integer('points')->default(10)->comment('Points for this question');
            $table->integer('difficulty_level')->default(1)->comment('1=Easy, 2=Medium, 3=Hard');
            $table->integer('order')->default(0)->comment('Order within the test');
            $table->json('metadata')->nullable()->comment('Additional configuration (time limit for individual question, etc.)');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('test_id')->references('test_id')->on('tests')->onDelete('cascade');

            // Indexes
            $table->index(['test_id', 'type']);
            $table->index(['test_id', 'order']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
