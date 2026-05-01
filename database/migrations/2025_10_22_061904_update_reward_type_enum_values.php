<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

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
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

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
