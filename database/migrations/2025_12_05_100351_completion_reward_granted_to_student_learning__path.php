<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('student_learning_paths', function (Blueprint $table) {
            // 添加完成奖励标记字段
            $table->boolean('completion_reward_granted')
                ->default(false)
                ->after('progress_percent');
        });
    }

    public function down()
    {
        Schema::table('student_learning_paths', function (Blueprint $table) {
            $table->dropColumn('completion_reward_granted');
        });
    }
};
