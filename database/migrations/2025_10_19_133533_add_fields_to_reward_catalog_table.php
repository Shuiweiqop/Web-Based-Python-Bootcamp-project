<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reward_catalog', function (Blueprint $table) {
            $table->string('rarity', 50)->default('common')->after('reward_type'); // common, rare, epic, legendary
            $table->integer('max_owned')->default(-1)->after('stock_quantity'); // -1 = 无限
            $table->text('apply_instructions')->nullable()->after('image_url'); // 使用说明
            $table->json('metadata')->nullable()->after('apply_instructions'); // 特殊属性

            // 添加 rarity 索引
            $table->index('rarity');
        });
    }

    public function down(): void
    {
        Schema::table('reward_catalog', function (Blueprint $table) {
            $table->dropIndex(['rarity']);
            $table->dropColumn(['rarity', 'max_owned', 'apply_instructions', 'metadata']);
        });
    }
};
