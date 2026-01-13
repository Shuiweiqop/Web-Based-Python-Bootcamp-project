<?php

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
        'student_id',
        'attempt_number',
        'started_at',
        'submitted_at',
        'time_spent',
        'score',
        'total_questions',
        'correct_answers',
        'status',
        'metadata',
        'recommended_path_id',
        'is_completed',
        'is_placement_test',
        'recommendation_confidence',
        'recommendation_message',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'time_spent' => 'integer',
        'score' => 'decimal:2',
        'total_questions' => 'integer',
        'correct_answers' => 'integer',
        'attempt_number' => 'integer',
        'metadata' => 'array',
        'recommended_path_id' => 'integer',
        'is_completed' => 'boolean',
        'is_placement_test' => 'boolean',
        'recommendation_confidence' => 'decimal:2',
    ];

    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_TIMEOUT = 'timeout';
    const STATUS_ABANDONED = 'abandoned';

    // ==================== Original Relationships ====================

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class, 'test_id', 'test_id');
    }

    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }

    public function user(): BelongsTo
    {
        return $this->studentProfile->user();
    }

    public function answers(): HasMany
    {
        return $this->hasMany(SubmissionAnswer::class, 'submission_id', 'submission_id');
    }

    // ==================== NEW: Learning Path Relationships ====================

    /**
     * The learning path recommended based on this test submission
     */
    public function recommendedPath(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class, 'recommended_path_id', 'path_id');
    }

    // ==================== Original Scopes ====================

    public function scopeCompleted($query)
    {
        return $query->whereIn('status', [self::STATUS_SUBMITTED, self::STATUS_TIMEOUT]);
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
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

    // ==================== NEW: Placement Test Scopes ====================

    /**
     * Scope: Only placement test submissions
     */
    public function scopePlacementTests($query)
    {
        return $query->where('is_placement_test', true);
    }

    /**
     * Scope: Submissions with recommended paths
     */
    public function scopeWithRecommendations($query)
    {
        return $query->whereNotNull('recommended_path_id');
    }

    // ==================== Original Helper Methods ====================

    public function getIsInProgressAttribute()
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    public function getIsPassedAttribute()
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

    public function getIsTimeExpiredAttribute()
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
            'time_spent' => Carbon::now()->diffInSeconds($this->started_at),
            'is_completed' => true,
        ]);

        $this->updateScoreAndStats();

        // NEW: Auto-recommend path if this is a placement test
        if ($this->is_placement_test) {
            $this->recommendPath();
        }
    }

    public function timeoutTest()
    {
        $this->update([
            'submitted_at' => Carbon::now(),
            'status' => self::STATUS_TIMEOUT,
            'time_spent' => $this->test->time_limit * 60,
            'is_completed' => true,
        ]);

        $this->updateScoreAndStats();

        // NEW: Auto-recommend path if this is a placement test
        if ($this->is_placement_test) {
            $this->recommendPath();
        }
    }

    // ==================== NEW: Learning Path Recommendation Methods ====================

    /**
     * Recommend a learning path based on test score
     * 
     * @return LearningPath|null The recommended path, or null if no suitable path found
     */
    public function recommendPath(): ?LearningPath
    {
        // Only recommend for placement tests
        if (!$this->is_placement_test) {
            return null;
        }

        // Find the most suitable path based on score
        $path = LearningPath::active()
            ->forScore($this->score)
            ->orderBy('min_score_required', 'desc')
            ->first();

        if ($path) {
            // Calculate confidence
            $confidence = $this->calculateRecommendationConfidence($path);

            // Generate message
            $message = $this->generateRecommendationMessage($path, $confidence);

            $this->update([
                'recommended_path_id' => $path->path_id,
                'recommendation_confidence' => $confidence,
                'recommendation_message' => $message,
            ]);

            // Refresh the relationship
            $this->load('recommendedPath');
        }

        return $path;
    }

    /**
     * Calculate recommendation confidence score (0-100)
     * Higher confidence when score is in the middle of the path's score range
     */
    protected function calculateRecommendationConfidence(LearningPath $path): float
    {
        $range = $path->max_score_required - $path->min_score_required;

        // If range is 0 (exact score match), return 100%
        if ($range === 0) {
            return 100;
        }

        $position = $this->score - $path->min_score_required;

        // Calculate distance from center of range
        $centerPosition = $range / 2;
        $distanceFromCenter = abs($centerPosition - $position);

        // Confidence is higher when closer to center
        // Maximum penalty is 30% (so minimum confidence is 70%)
        $penalty = ($distanceFromCenter / $centerPosition) * 30;
        $confidence = 100 - $penalty;

        return max(70, min(100, round($confidence, 2)));
    }

    /**
     * Generate a formatted recommendation message
     */
    protected function generateRecommendationMessage(LearningPath $path, float $confidence): string
    {
        $messages = [
            'high' => "Based on your test score of {$this->score}%, we strongly recommend the \"{$path->title}\" learning path.",
            'medium' => "Your score of {$this->score}% suggests the \"{$path->title}\" learning path would be a good fit.",
            'low' => "We recommend starting with the \"{$path->title}\" learning path based on your score of {$this->score}%.",
        ];

        if ($confidence >= 85) {
            return $messages['high'];
        } elseif ($confidence >= 75) {
            return $messages['medium'];
        } else {
            return $messages['low'];
        }
    }

    /**
     * Get alternative learning paths that are also suitable
     * 
     * @param int $limit Maximum number of alternatives to return
     * @return \Illuminate\Support\Collection
     */
    public function getAlternativePaths(int $limit = 3)
    {
        if (!$this->is_placement_test) {
            return collect();
        }

        return LearningPath::active()
            ->where('path_id', '!=', $this->recommended_path_id)
            ->where(function ($query) {
                // Include paths where score is close to the boundaries
                $marginOfError = 10; // ±10 points

                $query->where(function ($q) use ($marginOfError) {
                    // Paths where score is within range or slightly below
                    $q->where('min_score_required', '<=', $this->score)
                        ->where('max_score_required', '>=', $this->score - $marginOfError);
                })->orWhere(function ($q) use ($marginOfError) {
                    // Paths where score is slightly above minimum
                    $q->where('min_score_required', '<=', $this->score + $marginOfError)
                        ->where('max_score_required', '>=', $this->score);
                });
            })
            ->orderBy('display_order', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get difficulty level name based on score
     */
    public function getDifficultyLevelAttribute(): string
    {
        if ($this->score >= 86) {
            return 'advanced';
        } elseif ($this->score >= 61) {
            return 'intermediate';
        } else {
            return 'beginner';
        }
    }

    /**
     * Check if student has accepted the recommended path
     */
    public function hasAcceptedRecommendation(): bool
    {
        if (!$this->recommended_path_id) {
            return false;
        }

        return StudentLearningPath::where('student_id', $this->student_id)
            ->where('path_id', $this->recommended_path_id)
            ->where('placement_test_submission_id', $this->submission_id)
            ->exists();
    }

    /**
     * Get the student learning path if recommendation was accepted
     */
    public function getAcceptedPathAssignment(): ?StudentLearningPath
    {
        if (!$this->recommended_path_id) {
            return null;
        }

        return StudentLearningPath::where('student_id', $this->student_id)
            ->where('path_id', $this->recommended_path_id)
            ->where('placement_test_submission_id', $this->submission_id)
            ->first();
    }

    // ==================== Boot Method ====================

    /**
     * Boot method to automatically recommend paths when test is completed
     */
    protected static function boot()
    {
        parent::boot();

        // When submission is updated and status changes to completed
        static::updated(function ($submission) {
            // If just completed and is a placement test and no recommendation yet
            if (
                $submission->is_completed &&
                $submission->is_placement_test &&
                !$submission->recommended_path_id
            ) {
                $submission->recommendPath();
            }
        });
    }
}
