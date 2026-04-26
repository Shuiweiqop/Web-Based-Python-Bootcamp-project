<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DailyChallengeProgress extends Model
{
    protected $table = 'daily_challenge_progress';
    protected $primaryKey = 'challenge_progress_id';

    protected $fillable = [
        'student_id',
        'challenge_definition_id',
        'period_start',
        'period_end',
        'current_count',
        'is_completed',
        'completed_at',
        'reward_granted',
        'reward_granted_at',
        'last_event_at',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'current_count' => 'integer',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'reward_granted' => 'boolean',
        'reward_granted_at' => 'datetime',
        'last_event_at' => 'datetime',
    ];

    public function definition(): BelongsTo
    {
        return $this->belongsTo(DailyChallengeDefinition::class, 'challenge_definition_id', 'challenge_definition_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(DailyChallengeEvent::class, 'challenge_progress_id', 'challenge_progress_id');
    }
}

