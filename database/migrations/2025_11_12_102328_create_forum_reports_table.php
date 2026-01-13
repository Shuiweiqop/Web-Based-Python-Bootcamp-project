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
        Schema::create('forum_reports', function (Blueprint $table) {
            $table->id('report_id');

            // 举报者
            $table->unsignedBigInteger('reporter_user_id');

            // 被举报的内容
            $table->enum('reportable_type', ['post', 'reply'])->comment('举报类型：帖子或回复');
            $table->unsignedBigInteger('reportable_id')->comment('被举报的帖子或回复ID');

            // 举报原因
            $table->enum('reason', [
                'spam',              // 垃圾内容
                'inappropriate',     // 不当内容
                'harassment',        // 骚扰
                'misinformation',    // 错误信息
                'off_topic',         // 偏离主题
                'other'              // 其他
            ])->default('other');

            $table->text('description')->nullable()->comment('详细描述');

            // 处理状态
            $table->enum('status', ['pending', 'reviewed', 'resolved', 'dismissed'])->default('pending');

            // 管理员处理
            $table->unsignedBigInteger('reviewed_by_admin_id')->nullable();
            $table->text('admin_notes')->nullable()->comment('管理员备注');
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            // 外键约束
            $table->foreign('reporter_user_id')->references('user_Id')->on('users')->onDelete('cascade');
            $table->foreign('reviewed_by_admin_id')->references('user_Id')->on('users')->onDelete('set null');

            // 索引
            $table->index(['reportable_type', 'reportable_id']);
            $table->index('status');
            $table->index('reporter_user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forum_reports');
    }
};
