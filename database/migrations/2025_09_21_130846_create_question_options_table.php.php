<?php
// 3. create_question_options_table.php - 选择题选项表（仅用于MCQ题目）

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_options', function (Blueprint $table) {
            $table->id('option_id');
            $table->unsignedBigInteger('question_id');
            $table->string('option_label', 10)->comment('A, B, C, D, etc.');
            $table->text('option_text');
            $table->boolean('is_correct')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('question_id')->references('question_id')->on('questions')->onDelete('cascade');

            // Indexes
            $table->index(['question_id', 'order']);
            $table->index(['question_id', 'is_correct']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_options');
    }
};
