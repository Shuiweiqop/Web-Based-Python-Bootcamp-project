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
        Schema::table('lesson_registrations', function (Blueprint $table) {
            // 🔥 将 completion_points_awarded 从 boolean 改为 integer
            $table->integer('completion_points_awarded')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lesson_registrations', function (Blueprint $table) {
            // 回滚到 boolean
            $table->boolean('completion_points_awarded')->default(false)->change();
        });
    }
};
