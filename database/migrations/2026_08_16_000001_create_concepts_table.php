<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Knowledge-tracing layer, table 1 of 4: the concept dictionary.
 *
 * A concept is a single Python skill ("loops", "functions") that questions and
 * exercises can be tagged with, and that a student holds a mastery estimate for.
 * Self-referencing parent_id allows a shallow hierarchy (loops > for_loop) without
 * committing to one now.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concepts', function (Blueprint $table) {
            $table->id('concept_id');
            $table->string('slug')->unique()->comment('Stable machine key, e.g. "loops"');
            $table->string('name')->comment('Human label, e.g. "Loops"');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable()->comment('Optional parent concept');
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->foreign('parent_id')
                ->references('concept_id')
                ->on('concepts')
                ->nullOnDelete();

            $table->index('parent_id');
            $table->index('display_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concepts');
    }
};
