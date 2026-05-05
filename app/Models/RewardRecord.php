<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardRecord extends Model
{
    protected $table = 'reward_records';
    protected $primaryKey = 'record_id';
    public $timestamps = true;

    protected $fillable = [
        'student_id',
        'reward_id',
        'quantity',
        'points_spent',
        'points_before',
        'points_after',
        'points_changed',
        'issued_by',
        'issued_at',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'points_spent' => 'integer',
        'points_before' => 'integer',
        'points_after' => 'integer',
        'points_changed' => 'integer',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (! isset($model->points_changed)) {
                if (isset($model->points_before) && isset($model->points_after)) {
                    $model->points_changed = $model->points_after - $model->points_before;
                } else {
                    $model->points_changed = 0;
                }
            }
        });
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(Reward::class, 'reward_id', 'reward_id');
    }

    public function getIssuedByLabel(): string
    {
        return match ($this->issued_by) {
            'student_purchase' => 'Student Purchase',
            'system' => 'System Reward',
            'admin' => 'Admin Grant',
            default => 'Unknown',
        };
    }

    public function isPointsCorrect(): bool
    {
        if (isset($this->points_before, $this->points_spent, $this->points_after)) {
            if (($this->points_before - $this->points_spent) === $this->points_after) {
                return true;
            }
        }

        if (isset($this->points_before, $this->points_after, $this->points_changed)) {
            if (($this->points_after - $this->points_before) === $this->points_changed) {
                return true;
            }
        }

        return false;
    }

    public function scopeByStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeByReward($query, int $rewardId)
    {
        return $query->where('reward_id', $rewardId);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('issued_by', $type);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('issued_at', '>=', now()->subDays($days));
    }
}
