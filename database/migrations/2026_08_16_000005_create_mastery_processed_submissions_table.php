<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Idempotency ledger for the knowledge-tracing layer.
 *
 * One row per submission whose evidence has already been folded into the ability
 * model. The unique key is what makes re-application impossible.
 *
 * Needed because the entry points are not all safe to repeat: onboarding.result
 * is a GET route, so a page refresh re-runs the placement flow, and a queue that
 * retries a job would otherwise apply the same answers again. BKT assumes each
 * observation is independent — replaying one fabricates evidence the student
 * never produced.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mastery_processed_submissions', function (Blueprint $table) {
            $table->id('processed_id');
            $table->string('source', 32)->comment('test | exercise | placement');
            $table->unsignedBigInteger('submission_id');
            $table->unsignedBigInteger('student_id')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            // The guarantee: one submission is folded in at most once per source.
            $table->unique(['source', 'submission_id']);
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mastery_processed_submissions');
    }
};
