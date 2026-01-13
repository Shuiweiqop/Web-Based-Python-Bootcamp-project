<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_reward_inventory', function (Blueprint $table) {
            $table->id('inventory_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('reward_id');

            $table->integer('quantity')->default(1)->comment('拥有数量');
            $table->timestamp('obtained_at')->useCurrent();
            $table->boolean('is_equipped')->default(false)->comment('是否正在使用');
            $table->timestamp('equipped_at')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('student_id')
                ->references('student_id')
                ->on('student_profiles')
                ->onDelete('cascade');

            $table->foreign('reward_id')
                ->references('reward_id')
                ->on('reward_catalog')
                ->onDelete('cascade');

            // 每个学生每个奖励只有一条记录
            $table->unique(['student_id', 'reward_id']);

            // 索引
            $table->index(['student_id', 'is_equipped']);
            $table->index('is_equipped');
            $table->index('obtained_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_reward_inventory');
    }
};
