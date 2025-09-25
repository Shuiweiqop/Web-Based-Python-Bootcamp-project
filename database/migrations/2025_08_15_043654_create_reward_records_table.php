<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_records', function (Blueprint $table) {
            $table->id('record_id');

            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('reward_id'); // reward_type comes from reward_catalog

            $table->integer('quantity')->default(1)->comment('Number of items redeemed');
            $table->integer('points_spent')->comment('Points deducted from student account');
            $table->integer('points_changed')->comment('Change in student total points after redemption');

            $table->enum('issued_by', [
                'system',          // Automatically awarded by system
                'admin',           // Manually awarded by administrator
                'student_purchase' // Student redeemed with points
            ])->default('student_purchase');

            $table->timestamp('issued_at')->useCurrent();
            $table->timestamps();

            // Foreign keys
            $table->foreign('student_id')
                ->references('student_id')
                ->on('student_profiles')
                ->onDelete('cascade');

            $table->foreign('reward_id')
                ->references('reward_id')
                ->on('reward_catalog')
                ->onDelete('restrict');

            // Indexes for better performance
            $table->index('student_id');
            $table->index('reward_id');
            $table->index('issued_by');
            $table->index('issued_at');
            $table->index(['student_id', 'issued_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_records');
    }
};
