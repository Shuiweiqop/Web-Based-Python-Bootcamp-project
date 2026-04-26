<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DailyChallengeDefinition extends Model
{
    protected $table = 'daily_challenge_definitions';
    protected $primaryKey = 'challenge_definition_id';

    protected $fillable = [
        'code',
        'title',
        'description',
        'period_type',
        'action_type',
        'target_count',
        'reward_points',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'target_count' => 'integer',
        'reward_points' => 'integer',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    public function progressEntries(): HasMany
    {
        return $this->hasMany(DailyChallengeProgress::class, 'challenge_definition_id', 'challenge_definition_id');
    }
}

