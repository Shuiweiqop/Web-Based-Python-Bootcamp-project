<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reward_records', function (Blueprint $table) {
            // 在 points_spent 后面添加
            $table->integer('points_before')->after('points_spent')->comment('购买前的积分');
            $table->integer('points_after')->after('points_before')->comment('购买后的积分');
        });
    }

    public function down(): void
    {
        Schema::table('reward_records', function (Blueprint $table) {
            $table->dropColumn(['points_before', 'points_after']);
        });
    }
};
