<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Knowledge-tracing layer, table 4 of 4: the per-student ability model.
 *
 * One row per (student, concept). `mastery` is P(student knows this concept),
 * maintained by Bayesian Knowledge Tracing (Corbett & Anderson, 1995) as answers
 * arrive.
 *
 * `initial_mastery` snapshots the estimate at placement time and is never
 * updated afterwards — the gap between it and `mastery` is the measurable
 * learning gain the analytics layer reports.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_concept_mastery', function (Blueprint $table) {
            $table->id('mastery_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('concept_id');

            $table->decimal('mastery', 5, 4)->default(0.3000)->comment('P(known), 0.0000-1.0000');
            $table->decimal('confidence', 5, 4)->default(0.0000)->comment('Evidence sufficiency, 0.0000-1.0000');

            $table->unsignedInteger('attempts')->default(0);
            $table->unsignedInteger('correct')->default(0);

            $table->decimal('initial_mastery', 5, 4)->nullable()->comment('Baseline at placement; never updated after');
            $table->timestamp('last_evidence_at')->nullable();
            $table->timestamps();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student_profiles')
                ->cascadeOnDelete();

            $table->foreign('concept_id')
                ->references('concept_id')
                ->on('concepts')
                ->cascadeOnDelete();

            $table->unique(['student_id', 'concept_id']);
            $table->index(['student_id', 'mastery']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_concept_mastery');
    }
};
