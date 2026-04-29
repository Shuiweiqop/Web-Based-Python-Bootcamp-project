<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyChallengeCycleReward extends Model
{
    protected $table = 'daily_challenge_cycle_rewards';
    protected $primaryKey = 'cycle_reward_id';

    protected $fillable = [
        'student_id',
        'period_type',
        'period_start',
        'period_end',
        'bonus_code',
        'title',
        'reward_points',
        'granted_at',
        'metadata',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'reward_points' => 'integer',
        'granted_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }
}
