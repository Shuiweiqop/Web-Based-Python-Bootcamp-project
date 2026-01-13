<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 先确保表是 InnoDB 引擎
        DB::statement('ALTER TABLE student_learning_paths ENGINE=InnoDB');
        DB::statement('ALTER TABLE test_submissions ENGINE=InnoDB');
        DB::statement('ALTER TABLE users ENGINE=InnoDB');

        // 清理可能的孤立数据
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

        // 添加索引
        Schema::table('student_learning_paths', function (Blueprint $table) {
            $table->index('placement_test_submission_id', 'idx_placement_test_submission');
            $table->index('assigned_by_user_id', 'idx_assigned_by_user');
        });

        // 添加外键约束 - 注意 users 表的主键是 user_Id
        Schema::table('student_learning_paths', function (Blueprint $table) {
            $table->foreign('placement_test_submission_id', 'fk_slp_placement_test')
                ->references('submission_id')
                ->on('test_submissions')
                ->onDelete('set null');

            // 这里引用的是 user_Id，不是 id
            $table->foreign('assigned_by_user_id', 'fk_slp_assigned_by_user')
                ->references('user_Id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('student_learning_paths', function (Blueprint $table) {
            $table->dropForeign('fk_slp_placement_test');
            $table->dropForeign('fk_slp_assigned_by_user');
            $table->dropIndex('idx_placement_test_submission');
            $table->dropIndex('idx_assigned_by_user');
        });
    }
};
