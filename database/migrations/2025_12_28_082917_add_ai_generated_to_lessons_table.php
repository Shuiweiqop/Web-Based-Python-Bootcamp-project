<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            // 标记课程是否由AI辅助生成
            $table->boolean('ai_generated')->default(false)->after('status');

            // 可选：存储AI生成时使用的原始输入（如video URL）
            $table->text('ai_source_url')->nullable()->after('ai_generated');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['ai_generated', 'ai_source_url']);
        });
    }
};
