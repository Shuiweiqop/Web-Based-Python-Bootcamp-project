<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // SQLite does not support MODIFY COLUMN for enum-like changes.
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // 修改 reward_type 为匹配的 ENUM 值
        DB::statement("
            ALTER TABLE reward_catalog 
            MODIFY COLUMN reward_type ENUM(
                'avatar_frame',
                'profile_background', 
                'badge',
                'title',
                'theme',
                'effect'
            ) NOT NULL
        ");
    }

    public function down()
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // 回滚到原始值
        DB::statement("
            ALTER TABLE reward_catalog 
            MODIFY COLUMN reward_type ENUM(
                'badge',
                'certificate',
                'avatar',
                'theme'
            ) NOT NULL
        ");
    }
};
