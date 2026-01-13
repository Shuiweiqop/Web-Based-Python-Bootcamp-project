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
        Schema::create('lesson_sections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lesson_id')->comment('课程ID');
            $table->string('title')->comment('章节标题');
            $table->longText('content')->comment('章节内容');
            $table->integer('order_index')->default(0)->comment('排序序号');
            $table->timestamps();

            // 索引
            $table->index(['lesson_id', 'order_index']);

            // 外键约束
            $table->foreign('lesson_id')
                ->references('lesson_id')
                ->on('lessons')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lesson_sections');
    }
};
