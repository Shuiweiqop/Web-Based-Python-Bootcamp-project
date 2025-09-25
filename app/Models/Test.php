<?php
// 1. app/Models/Test.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Test extends Model
{
    use HasFactory;

    protected $primaryKey = 'test_id';

    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'instructions',
        'time_limit',
        'max_attempts',
        'passing_score',
        'shuffle_questions',
        'show_results_immediately',
        'allow_review',
        'status',
        'order'
    ];

    protected $casts = [
        'shuffle_questions' => 'boolean',
        'show_results_immediately' => 'boolean',
        'allow_review' => 'boolean',
        'time_limit' => 'integer',
        'max_attempts' => 'integer',
        'passing_score' => 'integer',
        'order' => 'integer'
    ];

    // Relationships
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id', 'lesson_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'test_id', 'test_id')
            ->orderBy('order');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(TestSubmission::class, 'test_id', 'test_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePublished($query)
    {
        return $query->whereIn('status', ['active', 'inactive']);
    }

    public function scopeForLesson($query, $lessonId)
    {
        return $query->where('lesson_id', $lessonId)->orderBy('order');
    }

    // Helper methods
    public function getTotalPointsAttribute()
    {
        return $this->questions()->sum('points');
    }

    public function getQuestionsCountAttribute()
    {
        return $this->questions()->count();
    }

    public function isActiveAttribute()
    {
        return $this->status === 'active';
    }

    public function canUserTakeTest($userId)
    {
        if ($this->status !== 'active') {
            return false;
        }

        $userAttempts = $this->submissions()
            ->where('user_id', $userId)
            ->where('status', 'submitted')
            ->count();

        return $userAttempts < $this->max_attempts;
    }

    public function getUserBestScore($userId)
    {
        return $this->submissions()
            ->where('user_id', $userId)
            ->where('status', 'submitted')
            ->max('score');
    }

    public function getUserLastAttempt($userId)
    {
        return $this->submissions()
            ->where('user_id', $userId)
            ->latest('submitted_at')
            ->first();
    }
}
