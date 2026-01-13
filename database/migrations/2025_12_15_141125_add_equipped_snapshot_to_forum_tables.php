<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ✅ forum_posts 表添加装备快照
        Schema::table('forum_posts', function (Blueprint $table) {
            $table->json('equipped_snapshot')->nullable()->after('content');
        });

        // ✅ forum_replies 表添加装备快照
        Schema::table('forum_replies', function (Blueprint $table) {
            $table->json('equipped_snapshot')->nullable()->after('content');
        });
    }

    public function down(): void
    {
        Schema::table('forum_posts', function (Blueprint $table) {
            $table->dropColumn('equipped_snapshot');
        });

        Schema::table('forum_replies', function (Blueprint $table) {
            $table->dropColumn('equipped_snapshot');
        });
    }
};
