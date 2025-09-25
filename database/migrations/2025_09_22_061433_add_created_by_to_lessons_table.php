<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            // 使用 unsignedBigInteger 并手动指定外键引用
            $table->unsignedBigInteger('created_by')->nullable()->after('lesson_id');
            $table->foreign('created_by')->references('user_Id')->on('users')->onDelete('set null');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropIndex(['created_by']);
            $table->dropColumn('created_by');
        });
    }
};
