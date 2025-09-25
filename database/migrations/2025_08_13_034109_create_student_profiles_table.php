<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id('student_id');
            $table->unsignedBigInteger('user_Id')->comment('Foreign key from users table');

            $table->integer('current_points')->default(0);
            $table->integer('total_lessons_completed')->default(0);
            $table->integer('total_tests_taken')->default(0);
            $table->decimal('average_score', 5, 2)->default(0.00);
            $table->integer('streak_days')->default(0);
            $table->date('last_activity_date')->nullable();
            $table->timestamps();

            // Fix: Reference the correct column name from users table
            $table->foreign('user_Id')->references('user_Id')->on('users')->onDelete('cascade');

            $table->unique('user_Id');
            $table->index('current_points');
            $table->index('last_activity_date');
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            // Reverse the changes
            $table->dropForeign(['user_Id']);
            $table->dropColumn('user_Id');

            $table->unsignedBigInteger('user_id')->after('student_id');
            $table->foreign('user_id')->references('user_Id')->on('users')->onDelete('cascade');
            $table->unique('user_id');
        });
    }
};
