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
        Schema::create('forum_favorites', function (Blueprint $table) {
            $table->id('favorite_id');
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('post_id');
            $table->timestamp('favorited_at')->useCurrent();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('student_id')->references('student_id')->on('student_profiles')->onDelete('cascade');
            $table->foreign('post_id')->references('post_id')->on('forum_posts')->onDelete('cascade');

            // Unique constraint to prevent duplicate favorites
            $table->unique(['student_id', 'post_id']);

            // Indexes for better performance
            $table->index('student_id');
            $table->index('post_id');
            $table->index('favorited_at');
            $table->index(['student_id', 'favorited_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forum_favorites');
    }
};
