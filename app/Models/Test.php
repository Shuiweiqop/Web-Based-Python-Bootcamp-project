<?php

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
        'order',
        'test_type',
        'skill_tags',
        'created_by',
    ];

    protected $casts = [
        'time_limit' => 'integer',
        'max_attempts' => 'integer',
        'passing_score' => 'integer',
        'shuffle_questions' => 'boolean',
        'show_results_immediately' => 'boolean',
        'allow_review' => 'boolean',
        'order' => 'integer',
        'skill_tags' => 'array',  // JSON 字段
    ];

    protected $attributes = [
        'max_attempts' => 3,
        'passing_score' => 70,
        'status' => 'draft',
        'order' => 0,
        'shuffle_questions' => false,
        'show_results_immediately' => true,
        'allow_review' => true,
        'test_type' => 'lesson',  // ✅ 修复：匹配数据库的 enum 值
    ];

    // ==================== Relationships ====================

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id', 'lesson_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'test_id', 'test_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(TestSubmission::class, 'test_id', 'test_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'user_Id');
    }

    // ==================== Scopes ====================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForLesson($query, $lessonId)
    {
        return $query->where('lesson_id', $lessonId);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('created_at');
    }

    /**
     * Scope: Only placement tests
     */
    public function scopePlacement($query)
    {
        return $query->where('test_type', 'placement');
    }

    /**
     * Scope: Only lesson tests
     */
    public function scopeLesson($query)
    {
        return $query->where('test_type', 'lesson');
    }

    /**
     * Scope: Only final exams
     */
    public function scopeFinal($query)
    {
        return $query->where('test_type', 'final');
    }

    // ==================== Accessors ====================

    public function getQuestionsCountAttribute(): int
    {
        return $this->questions()->count();
    }

    public function getTotalPointsAttribute(): int
    {
        return $this->questions()->sum('points') ?? 0;
    }

    public function getIsPlacementTestAttribute(): bool
    {
        return $this->test_type === 'placement';
    }

    public function getIsLessonTestAttribute(): bool
    {
        return $this->test_type === 'lesson';
    }

    public function getIsFinalExamAttribute(): bool
    {
        return $this->test_type === 'final';
    }

    public function getTestTypeNameAttribute(): string
    {
        return match ($this->test_type) {
            'lesson' => 'Lesson Test',
            'placement' => 'Placement Test',
            'final' => 'Final Exam',
            default => 'Unknown',
        };
    }

    // ==================== Helper Methods ====================

    /**
     * Check if student can take this test
     */
    public function canStudentTakeTest(int $studentId): bool
    {
        // Special logic for placement tests
        if ($this->test_type === 'placement') {
            // Check if already completed
            $completedSubmission = $this->submissions()
                ->where('student_id', $studentId)
                ->whereIn('status', ['submitted', 'timeout'])
                ->exists();

            // Allow retake if configured
            $allowRetake = config('recommendation.allow_placement_retake', false);

            if ($completedSubmission && !$allowRetake) {
                return false;
            }

            return true;
        }

        // Regular test logic
        if (!$this->max_attempts) {
            return true;
        }

        $attempts = $this->submissions()
            ->where('student_id', $studentId)
            ->whereIn('status', ['submitted', 'timeout'])
            ->count();

        return $attempts < $this->max_attempts;
    }

    /**
     * Get in-progress submission for student
     */
    public function getInProgressSubmission(int $studentId): ?TestSubmission
    {
        return $this->submissions()
            ->where('student_id', $studentId)
            ->where('status', 'in_progress')
            ->first();
    }

    /**
     * Check if student has submitted this test
     */
    public function hasStudentSubmitted(int $studentId): bool
    {
        return $this->submissions()
            ->where('student_id', $studentId)
            ->whereIn('status', ['submitted', 'timeout'])
            ->exists();
    }

    /**
     * Get student's best score
     */
    public function getStudentBestScore(int $studentId): float
    {
        return $this->submissions()
            ->where('student_id', $studentId)
            ->whereIn('status', ['submitted', 'timeout'])
            ->max('score') ?? 0;
    }

    /**
     * Get student's attempt count
     */
    public function getStudentAttempts(int $studentId): int
    {
        return $this->submissions()
            ->where('student_id', $studentId)
            ->whereIn('status', ['submitted', 'timeout'])
            ->count();
    }

    /**
     * Check if student passed
     */
    public function hasStudentPassed(int $studentId): bool
    {
        $bestScore = $this->getStudentBestScore($studentId);
        return $bestScore >= $this->passing_score;
    }

    /**
     * Check if test has time limit
     */
    public function hasTimeLimit(): bool
    {
        return !is_null($this->time_limit) && $this->time_limit > 0;
    }

    /**
     * Check if student has in-progress submission
     */
    public function hasInProgressSubmission(int $studentId): bool
    {
        return $this->submissions()
            ->where('student_id', $studentId)
            ->where('status', 'in_progress')
            ->exists();
    }

    /**
     * Check if test is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get completed submissions for a student
     */
    public function getCompletedSubmissions(int $studentId)
    {
        return $this->submissions()
            ->where('student_id', $studentId)
            ->whereIn('status', ['submitted', 'timeout'])
            ->orderBy('submitted_at', 'desc')
            ->get();
    }

    // ==================== NEW: Placement Test Statistics ====================

    /**
     * Get statistics for placement test
     */
    public function getPlacementTestStats(): array
    {
        if ($this->test_type !== 'placement') {
            return [];
        }

        $submissions = $this->submissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->get();

        if ($submissions->isEmpty()) {
            return [
                'total_submissions' => 0,
                'average_score' => 0,
                'median_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'total_recommended' => 0,
                'total_accepted' => 0,
                'acceptance_rate' => 0,
            ];
        }

        $scores = $submissions->pluck('score')->sort()->values();
        $medianIndex = floor($scores->count() / 2);

        $totalRecommended = $submissions->whereNotNull('recommended_path_id')->count();
        $totalAccepted = $submissions->filter(function ($submission) {
            return $submission->hasAcceptedRecommendation();
        })->count();

        return [
            'total_submissions' => $submissions->count(),
            'average_score' => round($scores->avg(), 2),
            'median_score' => $scores->count() > 0 ? $scores[$medianIndex] : 0,
            'highest_score' => $scores->max(),
            'lowest_score' => $scores->min(),
            'total_recommended' => $totalRecommended,
            'total_accepted' => $totalAccepted,
            'acceptance_rate' => $totalRecommended > 0
                ? round(($totalAccepted / $totalRecommended) * 100, 2)
                : 0,
            'score_distribution' => [
                'beginner' => $scores->filter(fn($s) => $s <= 60)->count(),
                'intermediate' => $scores->filter(fn($s) => $s > 60 && $s <= 85)->count(),
                'advanced' => $scores->filter(fn($s) => $s > 85)->count(),
            ],
        ];
    }

    /**
     * Get average completion time for this test
     */
    public function getAverageCompletionTime(): int
    {
        return $this->submissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->avg('time_spent') ?? 0;
    }

    /**
     * Get pass rate for this test
     */
    public function getPassRate(): float
    {
        $total = $this->submissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->count();

        if ($total === 0) {
            return 0;
        }

        $passed = $this->submissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->where('score', '>=', $this->passing_score)
            ->count();

        return round(($passed / $total) * 100, 2);
    }
}
