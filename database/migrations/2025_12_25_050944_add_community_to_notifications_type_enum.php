<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // 修改 type 列，添加 'community' 类型
        DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM('lesson', 'test', 'reward', 'achievement', 'system', 'announcement', 'community') NOT NULL");
    }

    public function down()
    {
        // 回滚：移除 'community' 类型
        DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM('lesson', 'test', 'reward', 'achievement', 'system', 'announcement') NOT NULL");
    }
};
