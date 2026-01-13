<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class StudentLearningPath extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'student_path_id';

    protected $fillable = [
        'student_id',
        'path_id',
        'assigned_by',
        'assigned_at',
        'placement_test_submission_id',
        'assigned_by_user_id',
        'status',
        'progress_percent',
        'started_at',
        'completed_at',
        'last_activity_at',
        'recommendation_score',
        'recommendation_reason',
        'initial_skill_assessment',
        'is_primary',
        'target_completion_date',
        'student_notes',
        'completion_reward_granted',  // ← 添加这个
        'last_activity_at',           // ← 添加这个
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'last_activity_at' => 'datetime',
        'target_completion_date' => 'date',
        'progress_percent' => 'integer',
        'recommendation_score' => 'integer',
        'is_primary' => 'boolean',
        'initial_skill_assessment' => 'array',
        'completion_reward_granted' => 'boolean',  // ← 添加这个
        'last_activity_at' => 'datetime',         // ← 添加这个
    ];

    // ==================== Relationships ====================

    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }

    public function learningPath(): BelongsTo
    {
        return $this->belongsTo(LearningPath::class, 'path_id', 'path_id');
    }

    public function placementTestSubmission(): BelongsTo
    {
        return $this->belongsTo(TestSubmission::class, 'placement_test_submission_id', 'submission_id');
    }

    public function assignedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by_user_id', 'user_Id');
    }

    // ==================== Scopes ====================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    // ==================== Progress Calculation ====================

    /**
     * Calculate overall path progress based on lesson completion
     */
    public function calculateProgress(): int
    {
        $lessons = $this->learningPath->lessons;

        if ($lessons->isEmpty()) {
            return 0;
        }

        $totalLessons = $lessons->count();
        $completedLessons = 0;

        foreach ($lessons as $lesson) {
            $progress = LessonProgress::where('student_id', $this->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            if ($progress && $progress->status === 'completed') {
                $completedLessons++;
            }
        }

        return round(($completedLessons / $totalLessons) * 100);
    }

    /**
     * Update path progress and status
     */
    public function updateProgress(): void
    {
        $progress = $this->calculateProgress();

        $updates = [
            'progress_percent' => $progress,
            'last_activity_at' => now(),
        ];

        // Mark as started if not already
        if (!$this->started_at && $progress > 0) {
            $updates['started_at'] = now();
        }

        // Mark as completed if 100%
        if ($progress === 100 && $this->status !== 'completed') {
            $updates['status'] = 'completed';
            $updates['completed_at'] = now();
        }

        $this->update($updates);
    }

    /**
     * Get detailed progress breakdown
     */
    public function getProgressDetails(): array
    {
        $lessons = $this->learningPath->lessons;
        $completed = 0;
        $inProgress = 0;
        $notStarted = 0;

        foreach ($lessons as $lesson) {
            $progress = LessonProgress::where('student_id', $this->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            if (!$progress || $progress->status === 'not_started') {
                $notStarted++;
            } elseif ($progress->status === 'completed') {
                $completed++;
            } else {
                $inProgress++;
            }
        }

        return [
            'total_lessons' => $lessons->count(),
            'completed' => $completed,
            'in_progress' => $inProgress,
            'not_started' => $notStarted,
            'completion_percentage' => $this->progress_percent,
        ];
    }

    /**
     * Get next lesson to study
     */
    public function getNextLesson(): ?Lesson
    {
        $lessons = $this->learningPath->lessons;

        foreach ($lessons as $lesson) {
            // Check if lesson is accessible
            if (!$this->canAccessLesson($lesson->lesson_id)) {
                continue;
            }

            $progress = LessonProgress::where('student_id', $this->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            // Return first uncompleted lesson
            if (!$progress || $progress->status !== 'completed') {
                return $lesson;
            }
        }

        return null; // All lessons completed
    }

    /**
     * Check if student can access a specific lesson
     */
    public function canAccessLesson(int $lessonId): bool
    {
        $lesson = $this->learningPath->lessons()
            ->where('lessons.lesson_id', $lessonId)  // 明确指定表名
            ->first();

        if (!$lesson) {
            return false; // Lesson not in this path
        }

        // If unlock_after_previous is false, always accessible
        if (!$lesson->pivot->unlock_after_previous) {
            return true;
        }

        // Check if previous lesson is completed
        $previousLesson = $this->learningPath->lessons()
            ->where('learning_path_lessons.sequence_order', '<', $lesson->pivot->sequence_order)
            ->orderBy('learning_path_lessons.sequence_order', 'desc')
            ->first();

        if (!$previousLesson) {
            return true; // First lesson, always accessible
        }

        $progress = LessonProgress::where('student_id', $this->student_id)
            ->where('lesson_id', $previousLesson->lesson_id)
            ->first();

        return $progress && $progress->status === 'completed';
    }
    public function getAccessibleLessons()
    {
        return $this->learningPath->lessons->filter(function ($lesson) {
            return $this->canAccessLesson($lesson->lesson_id);
        });
    }

    /**
     * Get locked lessons
     */
    public function getLockedLessons()
    {
        return $this->learningPath->lessons->filter(function ($lesson) {
            return !$this->canAccessLesson($lesson->lesson_id);
        });
    }
    // ==================== Helper Methods ====================

    public function isActiveAttribute(): bool
    {
        return $this->status === 'active';
    }

    public function isCompletedAttribute(): bool
    {
        return $this->status === 'completed';
    }

    public function getDaysInPathAttribute(): int
    {
        if (!$this->started_at) {
            return 0;
        }

        return $this->started_at->diffInDays(now());
    }
    public function getActiveDaysAttribute(): int
    {
        if (!$this->started_at) {
            return 0;
        }

        // 从 lesson_progress 计算有更新的独特日期
        $activeDays = \DB::table('lesson_progress')
            ->join('learning_path_lessons', 'lesson_progress.lesson_id', '=', 'learning_path_lessons.lesson_id')
            ->where('lesson_progress.student_id', $this->student_id)
            ->where('learning_path_lessons.path_id', $this->path_id)
            ->whereNotNull('lesson_progress.last_updated_at')
            ->where('lesson_progress.last_updated_at', '>=', $this->started_at)
            ->selectRaw('DATE(lesson_progress.last_updated_at) as activity_date')
            ->distinct()
            ->count();

        return $activeDays;
    }

    /**
     * Get activity rate (percentage of days with activity)
     */
    public function getActivityRateAttribute(): float
    {
        $totalDays = $this->days_in_path;

        if ($totalDays === 0) {
            return 0;
        }

        return round(($this->active_days / $totalDays) * 100, 1);
    }

    public function getDaysUntilTargetAttribute(): ?int
    {
        if (!$this->target_completion_date) {
            return null;
        }

        return now()->diffInDays($this->target_completion_date, false);
    }

    public function isOverdueAttribute(): bool
    {
        if (!$this->target_completion_date) {
            return false;
        }

        return $this->status !== 'completed' &&
            now()->isAfter($this->target_completion_date);
    }
    public function pause(?string $reason = null): void
    {
        $this->update([
            'status' => 'paused',
            'last_activity_at' => now(),
        ]);

        if ($reason) {
            Log::info('Learning path paused', [
                'student_path_id' => $this->student_path_id,
                'student_id' => $this->student_id,
                'path_id' => $this->path_id,
                'reason' => $reason,
            ]);
        }
    }

    /**
     * Resume this learning path
     */
    public function resume(): void
    {
        $this->update([
            'status' => 'active',
            'last_activity_at' => now(),
        ]);

        Log::info('Learning path resumed', [
            'student_path_id' => $this->student_path_id,
            'student_id' => $this->student_id,
            'path_id' => $this->path_id,
        ]);
    }

    /**
     * Abandon this learning path
     */
    public function abandon(?string $reason = null): void
    {
        $this->update([
            'status' => 'abandoned',
            'last_activity_at' => now(),
        ]);

        Log::info('Learning path abandoned', [
            'student_path_id' => $this->student_path_id,
            'student_id' => $this->student_id,
            'path_id' => $this->path_id,
            'reason' => $reason ?? 'No reason provided',
        ]);
    }

    /**
     * Set this path as primary
     */
    public function setAsPrimary(): void
    {
        // Unset other primary paths for this student
        self::where('student_id', $this->student_id)
            ->where('student_path_id', '!=', $this->student_path_id)
            ->update(['is_primary' => false]);

        // Set this as primary
        $this->update(['is_primary' => true]);
    }
}
