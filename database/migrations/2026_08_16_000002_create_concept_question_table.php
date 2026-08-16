<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Knowledge-tracing layer, table 2 of 4: question -> concept tags.
 *
 * Many-to-many because one question can exercise several concepts ("loop over a
 * list" = loops + lists). `weight` marks how central the concept is to the
 * question, so a secondary concept moves its mastery estimate less than the
 * primary one.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concept_question', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('concept_id');
            $table->unsignedBigInteger('question_id');
            $table->decimal('weight', 3, 2)->default(1.00)->comment('1.00 = primary concept, lower = secondary');
            $table->timestamps();

            $table->foreign('concept_id')
                ->references('concept_id')
                ->on('concepts')
                ->cascadeOnDelete();

            $table->foreign('question_id')
                ->references('question_id')
                ->on('questions')
                ->cascadeOnDelete();

            $table->unique(['concept_id', 'question_id']);
            $table->index('question_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concept_question');
    }
};
