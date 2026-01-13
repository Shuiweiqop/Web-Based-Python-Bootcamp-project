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
        Schema::create('forum_reply_likes', function (Blueprint $table) {
            $table->id('like_id');
            $table->unsignedBigInteger('user_id'); // ✅ 改用 user_id
            $table->unsignedBigInteger('reply_id');
            $table->timestamp('liked_at')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')
                ->references('user_Id') // ⚠️ 根据你的 users 表主键调整大小写
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('reply_id')
                ->references('reply_id')
                ->on('forum_replies')
                ->onDelete('cascade');

            // Unique constraint - one user can only like a reply once
            $table->unique(['user_id', 'reply_id'], 'unique_user_reply_like');

            // Indexes for better performance
            $table->index('user_id');
            $table->index('reply_id');
            $table->index('liked_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forum_reply_likes');
    }
};
