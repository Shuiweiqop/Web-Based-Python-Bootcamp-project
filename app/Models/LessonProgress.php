<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonProgress extends Model
{
    use HasFactory;

    protected $table = 'lesson_progress';
    protected $primaryKey = 'progress_id';

    protected $fillable = [
        'student_id',
        'lesson_id',
        'reward_granted',
        'exercise_completed',
        'test_completed',
        'status',
        'progress_percent',
        'started_at',
        'last_updated_at',
        'completed_at',
    ];

    protected $casts = [
        'reward_granted' => 'boolean',
        'exercise_completed' => 'boolean',
        'test_completed' => 'boolean',
        'progress_percent' => 'integer',
        'started_at' => 'datetime',
        'last_updated_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Relationship: Progress belongs to a student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }

    /**
     * Relationship: Progress belongs to a lesson
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id', 'lesson_id');
    }

    /**
     * Scope: Get in-progress lessons
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope: Get completed lessons
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope: Get not started lessons
     */
    public function scopeNotStarted($query)
    {
        return $query->where('status', 'not_started');
    }

    /**
     * Check if lesson is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if lesson is in progress
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if reward has been granted
     */
    public function hasReward(): bool
    {
        return $this->reward_granted;
    }

    /**
     * Mark lesson as started
     */
    public function markAsStarted(): void
    {
        if ($this->status === 'not_started') {
            $this->update([
                'status' => 'in_progress',
                'started_at' => now(),
                'last_updated_at' => now(),
            ]);
        }
    }

    /**
     * Update progress percentage
     */
    public function updateProgress(int $percent): void
    {
        $this->update([
            'progress_percent' => min(100, max(0, $percent)),
            'last_updated_at' => now(),
        ]);
    }

    /**
     * Mark lesson as completed
     */
    public function markAsCompleted(bool $grantReward = false): void
    {
        $this->update([
            'status' => 'completed',
            'progress_percent' => 100,
            'completed_at' => now(),
            'last_updated_at' => now(),
            'reward_granted' => $grantReward,
        ]);
    }

    /**
     * Calculate progress based on exercises and tests
     */
    public function calculateProgress(): int
    {
        $lesson = $this->lesson;

        $totalExercises = $lesson->interactiveExercises()->where('is_active', true)->count();
        $totalTests = $lesson->tests()->where('status', 'active')->count();

        if ($totalExercises === 0 && $totalTests === 0) {
            return 100; // No content, consider as complete
        }

        $completedExercises = 0;
        $completedTests = 0;

        // Count completed exercises
        if ($totalExercises > 0) {
            $exerciseIds = $lesson->interactiveExercises()->where('is_active', true)->pluck('exercise_id');
            $completedExercises = ExerciseSubmission::where('student_id', $this->student_id)
                ->whereIn('exercise_id', $exerciseIds)
                ->where('score', '>=', function ($query) use ($exerciseIds) {
                    $query->select('max_score')
                        ->from('interactive_exercises')
                        ->whereColumn('exercise_id', 'exercise_submissions.exercise_id')
                        ->limit(1);
                })
                ->distinct('exercise_id')
                ->count();
        }

        // Count completed tests
        if ($totalTests > 0) {
            $testIds = $lesson->tests()->where('status', 'active')->pluck('test_id');
            $completedTests = TestSubmission::where('student_id', $this->student_id)
                ->whereIn('test_id', $testIds)
                ->where('status', 'completed')
                ->where('score', '>=', function ($query) use ($testIds) {
                    $query->select('passing_score')
                        ->from('tests')
                        ->whereColumn('test_id', 'test_submissions.test_id')
                        ->limit(1);
                })
                ->distinct('test_id')
                ->count();
        }

        $totalItems = $totalExercises + $totalTests;
        $completedItems = $completedExercises + $completedTests;

        return $totalItems > 0 ? round(($completedItems / $totalItems) * 100) : 0;
    }

    /**
     * Update completion flags based on actual data
     */
    public function updateCompletionFlags(): void
    {
        $lesson = $this->lesson;

        // Check exercises
        $totalExercises = $lesson->interactiveExercises()->where('is_active', true)->count();
        $exerciseCompleted = false;

        if ($totalExercises > 0) {
            $exerciseIds = $lesson->interactiveExercises()->where('is_active', true)->pluck('exercise_id');
            $completedCount = ExerciseSubmission::where('student_id', $this->student_id)
                ->whereIn('exercise_id', $exerciseIds)
                ->distinct('exercise_id')
                ->count();

            $exerciseCompleted = $completedCount >= $totalExercises;
        } else {
            $exerciseCompleted = true; // No exercises means complete
        }

        // Check tests
        $totalTests = $lesson->tests()->where('status', 'active')->count();
        $testCompleted = false;

        if ($totalTests > 0) {
            $testIds = $lesson->tests()->where('status', 'active')->pluck('test_id');
            $passedCount = TestSubmission::where('student_id', $this->student_id)
                ->whereIn('test_id', $testIds)
                ->where('status', 'completed')
                ->whereRaw('score >= (SELECT passing_score FROM tests WHERE test_id = test_submissions.test_id)')
                ->distinct('test_id')
                ->count();

            $testCompleted = $passedCount >= $totalTests;
        } else {
            $testCompleted = true; // No tests means complete
        }

        // Update flags
        $this->update([
            'exercise_completed' => $exerciseCompleted,
            'test_completed' => $testCompleted,
            'last_updated_at' => now(),
        ]);

        // Auto-complete if both are done
        if ($exerciseCompleted && $testCompleted && $this->status !== 'completed') {
            $this->markAsCompleted();
        }
    }

    /**
     * Get formatted status
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'not_started' => 'Not Started',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'paused' => 'Paused',
            default => 'Unknown',
        };
    }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'not_started' => 'gray',
            'in_progress' => 'blue',
            'completed' => 'green',
            'paused' => 'yellow',
            default => 'gray',
        };
    }
}
