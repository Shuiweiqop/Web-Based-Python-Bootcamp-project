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
        Schema::create('suggestion_rules', function (Blueprint $table) {
            $table->id('rule_id');
            $table->unsignedBigInteger('lesson_id')->nullable();

            $table->string('trigger_type', 50)->comment('E.g., performance_based, time_based');
            $table->boolean('is_active')->default(true);
            $table->json('trigger_condition')->nullable()->comment('Condition in JSON format');

            $table->string('suggestion_type', 50)->comment('E.g., next_lesson, review_lesson');
            $table->text('message');
            $table->timestamps();

            $table->foreign('lesson_id')->references('lesson_id')->on('lessons')->onDelete('cascade');

            $table->index(['lesson_id', 'is_active']);
            $table->index(['trigger_type', 'is_active']);
            $table->index('suggestion_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suggestion_rules');
    }
};
