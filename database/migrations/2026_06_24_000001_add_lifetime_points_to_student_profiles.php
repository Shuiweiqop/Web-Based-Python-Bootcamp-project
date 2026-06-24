<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            // Lifetime / earned XP — never decreases when points are spent.
            $table->integer('lifetime_points')->default(0)->after('current_points');
            $table->index('lifetime_points');
        });

        // Baseline backfill: true earning history can't be reconstructed, so
        // seed lifetime to at least the current spendable balance.
        DB::table('student_profiles')->update([
            'lifetime_points' => DB::raw('current_points'),
        ]);
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropIndex(['lifetime_points']);
            $table->dropColumn('lifetime_points');
        });
    }
};
