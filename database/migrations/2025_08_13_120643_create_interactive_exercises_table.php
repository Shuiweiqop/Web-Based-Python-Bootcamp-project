<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interactive_exercises', function (Blueprint $table) {
            $table->id('exercise_id');

            // 关联 lesson
            $table->unsignedBigInteger('lesson_id')->index();

            $table->string('title', 150);
            $table->text('description')->nullable();

            // 保留一个灵活的 type 字段（可扩展）
            $table->string('exercise_type', 50)->nullable()->comment('eg: coding / mini_game / practice');
            $table->index('exercise_type');

            // 可选多媒体/资源
            $table->text('asset_url')->nullable();

            // 分数/时间/状态
            $table->integer('max_score')->default(100);
            $table->integer('time_limit_sec')->nullable()->comment('Time limit in seconds');
            $table->boolean('is_active')->default(true);

            // 代码题专用（starter + solution），可为空
            $table->longText('starter_code')->nullable();
            $table->longText('solution')->nullable();

            // 自由 JSON 存放题目结构/选项等
            $table->json('content')->nullable();

            // 记录是谁创建（可为 null，如果你只有一个 admin 可为空）
            $table->unsignedBigInteger('created_by')->nullable()->index();

            $table->timestamps();

            // 外键约束
            $table->foreign('lesson_id')->references('lesson_id')->on('lessons')->onDelete('cascade');

            // 如果 users 表的 PK 是 user_Id（像你之前 model 设的），请使用 user_Id；否则用 users.id
            // 这里我们用 user_Id（你之前说 user model primaryKey = 'user_Id'）
            if (Schema::hasTable('users')) {
                $table->foreign('created_by')
                    ->references('user_Id')
                    ->on('users')
                    ->nullOnDelete();
            }

            // 索引组合（查询常用）
            $table->index(['lesson_id', 'is_active']);
            $table->index(['lesson_id', 'exercise_type']);
        });
    }

    public function down(): void
    {
        Schema::table('interactive_exercises', function (Blueprint $table) {
            // 在 drop 前，先 drop 外键以避免 MySQL errno 150
            if (Schema::hasColumn('interactive_exercises', 'created_by')) {
                $table->dropForeign(['created_by']);
            }
            if (Schema::hasColumn('interactive_exercises', 'lesson_id')) {
                $table->dropForeign(['lesson_id']);
            }
        });

        Schema::dropIfExists('interactive_exercises');
    }
};
