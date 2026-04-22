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
        // Modify the tests table to allow lesson_id to be nullable
        Schema::table('tests', function (Blueprint $table) {
            // Make lesson_id nullable for placement tests
            $table->unsignedBigInteger('lesson_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            // Revert back if needed (but check if there are placement tests first)
            $table->unsignedBigInteger('lesson_id')->nullable(false)->change();
        });
    }
};
