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
        Schema::table('tests', function (Blueprint $table) {
            // Test Type: lesson (default), placement (evaluation test), final
            $table->enum('test_type', ['lesson', 'placement', 'final'])
                ->default('lesson')
                ->after('test_id')
                ->comment('Type of test: lesson=normal test, placement=evaluation test, final=final exam');

            // Make lesson_id nullable for placement tests (not tied to specific lesson)
            $table->unsignedBigInteger('lesson_id')->nullable()->change();

            // Skill tags for placement test questions (JSON)
            // Example: {"programming": 40, "math": 30, "logic": 30}
            $table->json('skill_tags')->nullable()->after('test_type')
                ->comment('Skill weights for placement test analysis');

            // Add index for test_type for faster queries
            $table->index('test_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->dropIndex(['test_type']);
            $table->dropColumn(['test_type', 'skill_tags']);

            // Revert lesson_id to non-nullable (optional, depends on your needs)
            // $table->unsignedBigInteger('lesson_id')->nullable(false)->change();
        });
    }
};
