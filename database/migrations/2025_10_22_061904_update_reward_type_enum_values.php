<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // ✅ 修改 reward_type ENUM 值以匹配代码
        DB::statement("
            ALTER TABLE reward_catalog 
            MODIFY COLUMN reward_type ENUM(
                'avatar_frame',
                'profile_background', 
                'badge',
                'title',
                'theme',
                'effect'
            ) NOT NULL DEFAULT 'badge'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        // 回滚到原始 ENUM 值
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
