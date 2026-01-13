<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // 添加新字段
            $table->string('display_icon', 50)->nullable()->after('message');
            $table->string('display_color', 50)->nullable()->after('display_icon');

            // 可选：迁移旧数据
            // 如果已有 icon 和 color 字段的数据，复制到新字段
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['display_icon', 'display_color']);
        });
    }
};
