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
        Schema::create('forum_replies', function (Blueprint $table) {
            $table->id('reply_id');
            $table->unsignedBigInteger('post_id');
            $table->unsignedBigInteger('user_id'); // ✅ 改用 user_id
            $table->unsignedBigInteger('parent_reply_id')->nullable()->comment('For nested replies');
            $table->text('content');
            $table->integer('likes')->unsigned()->default(0);
            $table->boolean('is_solution')->default(false)->comment('Mark as accepted answer');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('post_id')
                ->references('post_id')
                ->on('forum_posts')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('user_Id') // ⚠️ 根据你的 users 表主键调整大小写
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('parent_reply_id')
                ->references('reply_id')
                ->on('forum_replies')
                ->onDelete('cascade');

            // Indexes for better performance
            $table->index('post_id');
            $table->index('user_id');
            $table->index('parent_reply_id');
            $table->index('is_solution');
            $table->index('created_at');
            $table->index(['post_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forum_replies');
    }
};
