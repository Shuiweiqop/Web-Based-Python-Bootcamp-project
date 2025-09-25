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
            $table->unsignedBigInteger('student_id');
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

            // Foreign key constraint
            $table->foreign('student_id')
                ->references('student_id')
                ->on('student_profiles')
                ->onDelete('cascade');

            // Indexes for better performance
            $table->index('student_id');
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
