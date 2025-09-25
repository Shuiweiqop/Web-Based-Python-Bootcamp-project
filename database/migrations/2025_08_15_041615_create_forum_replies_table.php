<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forum_replies', function (Blueprint $table) {
            $table->id('reply_id');
            $table->unsignedBigInteger('post_id');   // must be unsignedBigInteger
            $table->unsignedBigInteger('student_id');
            $table->text('content');
            $table->integer('likes')->default(0);
            $table->boolean('is_solution')->default(false)->comment('Mark reply as solution to help question');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('post_id')->references('post_id')->on('forum_posts')->onDelete('cascade');
            $table->foreign('student_id')->references('student_id')->on('student_profiles')->onDelete('cascade');

            // Indexes
            $table->index('post_id');
            $table->index('student_id');
            $table->index('created_at');
            $table->index(['post_id', 'created_at']);
            $table->index(['post_id', 'is_solution']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forum_replies');
    }
};
