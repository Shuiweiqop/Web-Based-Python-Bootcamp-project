<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM('lesson', 'test', 'reward', 'achievement', 'system', 'announcement', 'community') NOT NULL");
    }

    public function down()
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM('lesson', 'test', 'reward', 'achievement', 'system', 'announcement') NOT NULL");
    }
};
