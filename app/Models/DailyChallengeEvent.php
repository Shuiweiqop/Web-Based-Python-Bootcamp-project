<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyChallengeEvent extends Model
{
    protected $table = 'daily_challenge_events';
    protected $primaryKey = 'challenge_event_id';

    protected $fillable = [
        'challenge_progress_id',
        'student_id',
        'challenge_definition_id',
        'source_type',
        'source_id',
        'occurred_at',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
    ];

    public function progress(): BelongsTo
    {
        return $this->belongsTo(DailyChallengeProgress::class, 'challenge_progress_id', 'challenge_progress_id');
    }

    public function definition(): BelongsTo
    {
        return $this->belongsTo(DailyChallengeDefinition::class, 'challenge_definition_id', 'challenge_definition_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }
}

