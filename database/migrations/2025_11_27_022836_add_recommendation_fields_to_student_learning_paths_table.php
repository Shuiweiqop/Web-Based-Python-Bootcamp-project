<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('student_learning_paths', function (Blueprint $table) {
                $table->index('placement_test_submission_id', 'idx_placement_test_submission');
                $table->index('assigned_by_user_id', 'idx_assigned_by_user');
            });

            return;
        }

        DB::statement('ALTER TABLE student_learning_paths ENGINE=InnoDB');
        DB::statement('ALTER TABLE test_submissions ENGINE=InnoDB');
        DB::statement('ALTER TABLE users ENGINE=InnoDB');

        DB::statement('
            UPDATE student_learning_paths
            SET placement_test_submission_id = NULL
            WHERE placement_test_submission_id IS NOT NULL
            AND placement_test_submission_id NOT IN (SELECT submission_id FROM test_submissions)
        ');

        DB::statement('
            UPDATE student_learning_paths
            SET assigned_by_user_id = NULL
            WHERE assigned_by_user_id IS NOT NULL
            AND assigned_by_user_id NOT IN (SELECT user_Id FROM users)
        ');

        Schema::table('student_learning_paths', function (Blueprint $table) {
            $table->index('placement_test_submission_id', 'idx_placement_test_submission');
            $table->index('assigned_by_user_id', 'idx_assigned_by_user');
        });

        Schema::table('student_learning_paths', function (Blueprint $table) {
            $table->foreign('placement_test_submission_id', 'fk_slp_placement_test')
                ->references('submission_id')
                ->on('test_submissions')
                ->onDelete('set null');

            $table->foreign('assigned_by_user_id', 'fk_slp_assigned_by_user')
                ->references('user_Id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            Schema::table('student_learning_paths', function (Blueprint $table) {
                $table->dropForeign('fk_slp_placement_test');
                $table->dropForeign('fk_slp_assigned_by_user');
            });
        }

        Schema::table('student_learning_paths', function (Blueprint $table) {
            $table->dropIndex('idx_placement_test_submission');
            $table->dropIndex('idx_assigned_by_user');
        });
    }
};
