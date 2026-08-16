<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Ledger entry marking a submission's evidence as already applied.
 *
 * Written only by ConceptMasteryService, inside the same transaction as the
 * mastery update it guards — if the update rolls back, the claim rolls back with
 * it, so a failed attempt does not permanently block a retry.
 */
class MasteryProcessedSubmission extends Model
{
    protected $table = 'mastery_processed_submissions';

    protected $primaryKey = 'processed_id';

    protected $fillable = [
        'source',
        'submission_id',
        'student_id',
        'processed_at',
    ];

    protected $casts = [
        'submission_id' => 'integer',
        'student_id' => 'integer',
        'processed_at' => 'datetime',
    ];
}
