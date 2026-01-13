<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add column
        Schema::table('test_submissions', function (Blueprint $table) {
            $table->unsignedBigInteger('recommended_path_id')->nullable()
                ->after('score')
                ->comment('Learning path recommended based on this test result');

            $table->index('recommended_path_id');
        });

        // Step 2: Add foreign key separately (safer)
        Schema::table('test_submissions', function (Blueprint $table) {
            $table->foreign('recommended_path_id', 'fk_submissions_path')
                ->references('path_id')
                ->on('learning_paths')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('test_submissions', function (Blueprint $table) {
            $table->dropForeign('fk_submissions_path');
            $table->dropIndex(['recommended_path_id']);
            $table->dropColumn('recommended_path_id');
        });
    }
};
