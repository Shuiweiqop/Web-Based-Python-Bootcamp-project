<?php
// 4. app/Models/TestSubmission.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class TestSubmission extends Model
{
    use HasFactory;

    protected $primaryKey = 'submission_id';

    protected $fillable = [
        'test_id',
        'user_id',
        'attempt_number',
        'started_at',
        'submitted_at',
        'time_spent',
        'score',
        'total_questions',
        'correct_answers',
        'status',
        'metadata'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'time_spent' => 'integer',
        'score' => 'decimal:2',
        'total_questions' => 'integer',
        'correct_answers' => 'integer',
        'attempt_number' => 'integer',
        'metadata' => 'array'
    ];

    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_TIMEOUT = 'timeout';
    const STATUS_ABANDONED = 'abandoned';

    // Relationships
    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class, 'test_id', 'test_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(SubmissionAnswer::class, 'submission_id', 'submission_id');
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->whereIn('status', [self::STATUS_SUBMITTED, self::STATUS_TIMEOUT]);
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForTest($query, $testId)
    {
        return $query->where('test_id', $testId);
    }

    public function scopePassed($query)
    {
        return $query->whereHas('test', function ($q) {
            $q->whereColumn('score', '>=', 'tests.passing_score');
        });
    }

    // Helper methods
    public function isCompletedAttribute()
    {
        return in_array($this->status, [self::STATUS_SUBMITTED, self::STATUS_TIMEOUT]);
    }

    public function isInProgressAttribute()
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    public function isPassedAttribute()
    {
        return $this->score >= $this->test->passing_score;
    }

    public function getScorePercentageAttribute()
    {
        return $this->score;
    }

    public function getTimeSpentFormattedAttribute()
    {
        if (!$this->time_spent) {
            return '0 minutes';
        }

        $minutes = floor($this->time_spent / 60);
        $seconds = $this->time_spent % 60;

        if ($minutes > 0) {
            return $seconds > 0 ? "{$minutes}m {$seconds}s" : "{$minutes}m";
        }

        return "{$seconds}s";
    }

    public function getRemainingTimeAttribute()
    {
        if (!$this->test->time_limit || $this->is_completed) {
            return null;
        }

        $elapsed = Carbon::now()->diffInSeconds($this->started_at);
        $remaining = ($this->test->time_limit * 60) - $elapsed;

        return max(0, $remaining);
    }

    public function isTimeExpiredAttribute()
    {
        return $this->remaining_time === 0;
    }

    public function calculateScore()
    {
        $totalPoints = $this->test->questions()->sum('points');
        $earnedPoints = $this->answers()->sum('points_earned');

        if ($totalPoints == 0) {
            return 0;
        }

        return round(($earnedPoints / $totalPoints) * 100, 2);
    }

    public function calculateCorrectAnswers()
    {
        return $this->answers()->where('is_correct', true)->count();
    }

    public function updateScoreAndStats()
    {
        $this->update([
            'score' => $this->calculateScore(),
            'correct_answers' => $this->calculateCorrectAnswers(),
            'total_questions' => $this->test->questions_count
        ]);
    }

    public function submitTest()
    {
        $this->update([
            'submitted_at' => Carbon::now(),
            'status' => self::STATUS_SUBMITTED,
            'time_spent' => Carbon::now()->diffInSeconds($this->started_at)
        ]);

        $this->updateScoreAndStats();
    }

    public function timeoutTest()
    {
        $this->update([
            'submitted_at' => Carbon::now(),
            'status' => self::STATUS_TIMEOUT,
            'time_spent' => $this->test->time_limit * 60
        ]);

        $this->updateScoreAndStats();
    }
}
