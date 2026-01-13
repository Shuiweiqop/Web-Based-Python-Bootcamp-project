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
        Schema::create('forum_posts', function (Blueprint $table) {
            $table->id('post_id');
            $table->unsignedBigInteger('user_id'); // ✅ 改用 user_id (支持 admin 和 student)
            $table->string('title', 200);
            $table->text('content');
            $table->enum('category', [
                'general',        // General discussions
                'help',           // Help and support questions
                'showcase',       // Show off projects/code
                'resources',      // Share learning resources
                'announcements',  // Important announcements
                'feedback'        // Platform feedback and suggestions
            ])->default('general');
            $table->integer('likes')->unsigned()->default(0);
            $table->integer('views')->unsigned()->default(0);
            $table->boolean('is_pinned')->default(false)->comment('Admin can pin important posts');
            $table->boolean('is_locked')->default(false)->comment('Prevent new replies');
            $table->timestamps();

            // Foreign key constraint - 关联到 users 表
            $table->foreign('user_id')
                ->references('user_Id') // ⚠️ 根据你的 users 表主键调整大小写
                ->on('users')
                ->onDelete('cascade');

            // Indexes for better performance
            $table->index('user_id');
            $table->index('category');
            $table->index('created_at');
            $table->index(['category', 'created_at']);
            $table->index(['likes', 'created_at']);
            $table->index(['is_pinned', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forum_posts');
    }
};
