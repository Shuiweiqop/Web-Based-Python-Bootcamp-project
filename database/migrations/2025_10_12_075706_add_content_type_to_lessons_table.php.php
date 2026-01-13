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
        Schema::table('lessons', function (Blueprint $table) {
            // Add content_type field to specify how content should be rendered
            $table->enum('content_type', ['text', 'markdown', 'html'])
                ->default('markdown')
                ->after('content')
                ->comment('Content format: text (plain), markdown, or html');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn('content_type');
        });
    }
};
