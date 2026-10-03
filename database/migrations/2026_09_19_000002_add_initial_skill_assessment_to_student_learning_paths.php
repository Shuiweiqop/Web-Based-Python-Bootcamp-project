<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add the column StudentLearningPath already declares.
 *
 * The model lists initial_skill_assessment as fillable and casts it to array,
 * but no migration ever created it, so writing to it throws "no such column"
 * rather than being silently dropped.
 *
 * It holds the per-concept mastery snapshot taken when a path is assigned —
 * the same idea as StudentConceptMastery::initial_mastery, kept per assignment
 * so a path can report the gain made while the student was on it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_learning_paths', function (Blueprint $table) {
            if (! Schema::hasColumn('student_learning_paths', 'initial_skill_assessment')) {
                $table->json('initial_skill_assessment')
                    ->nullable()
                    ->after('recommendation_reason');
            }
        });
    }

    public function down(): void
    {
        Schema::table('student_learning_paths', function (Blueprint $table) {
            if (Schema::hasColumn('student_learning_paths', 'initial_skill_assessment')) {
                $table->dropColumn('initial_skill_assessment');
            }
        });
    }
};
