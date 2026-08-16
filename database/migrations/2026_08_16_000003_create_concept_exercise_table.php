<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Knowledge-tracing layer, table 3 of 4: interactive exercise -> concept tags.
 *
 * Same shape as concept_question. Exercises are a second evidence stream: a
 * student who never sits a test still generates mastery signal by practising.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concept_exercise', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('concept_id');
            $table->unsignedBigInteger('exercise_id');
            $table->decimal('weight', 3, 2)->default(1.00)->comment('1.00 = primary concept, lower = secondary');
            $table->timestamps();

            $table->foreign('concept_id')
                ->references('concept_id')
                ->on('concepts')
                ->cascadeOnDelete();

            $table->foreign('exercise_id')
                ->references('exercise_id')
                ->on('interactive_exercises')
                ->cascadeOnDelete();

            $table->unique(['concept_id', 'exercise_id']);
            $table->index('exercise_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concept_exercise');
    }
};
