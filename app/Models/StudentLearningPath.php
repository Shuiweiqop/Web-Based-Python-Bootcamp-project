<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
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
        'completion_reward_granted',
        'last_activity_at',
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
        'completion_reward_granted' => 'boolean',
        'last_activity_at' => 'datetime',
    ];

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

    public function calculateProgress(?Collection $lessons = null, ?Collection $progressMap = null): int
    {
        $lessons = $lessons ?? $this->getOrderedLessons();

        if ($lessons->isEmpty()) {
            return 0;
        }

        $progressMap = $progressMap ?? $this->getLessonProgressMap($lessons);

        $completedLessons = $lessons->filter(function ($lesson) use ($progressMap) {
            $progress = $progressMap->get($lesson->lesson_id);

            return $progress && $progress->status === 'completed';
        })->count();

        return round(($completedLessons / $lessons->count()) * 100);
    }

    public function updateProgress(): void
    {
        $lessons = $this->getOrderedLessons();
        $progressMap = $this->getLessonProgressMap($lessons);
        $progress = $this->calculateProgress($lessons, $progressMap);

        $updates = [
            'progress_percent' => $progress,
            'last_activity_at' => now(),
        ];

        if (!$this->started_at && $progress > 0) {
            $updates['started_at'] = now();
        }

        if ($progress === 100 && $this->status !== 'completed') {
            $updates['status'] = 'completed';
            $updates['completed_at'] = now();
        }

        $this->update($updates);
    }

    public function getProgressDetails(?Collection $lessons = null, ?Collection $progressMap = null): array
    {
        $lessons = $lessons ?? $this->getOrderedLessons();
        $progressMap = $progressMap ?? $this->getLessonProgressMap($lessons);

        $completed = $lessons->filter(function ($lesson) use ($progressMap) {
            return $progressMap->get($lesson->lesson_id)?->status === 'completed';
        })->count();

        $inProgress = $lessons->filter(function ($lesson) use ($progressMap) {
            return $progressMap->get($lesson->lesson_id)?->status === 'in_progress';
        })->count();

        $notStarted = $lessons->count() - $completed - $inProgress;

        return [
            'total_lessons' => $lessons->count(),
            'completed' => $completed,
            'in_progress' => $inProgress,
            'not_started' => $notStarted,
            'completion_percentage' => $this->progress_percent,
        ];
    }

    public function getNextLesson(
        ?Collection $lessons = null,
        ?Collection $progressMap = null,
        ?Collection $accessMap = null
    ): ?Lesson {
        $lessons = $lessons ?? $this->getOrderedLessons();
        $progressMap = $progressMap ?? $this->getLessonProgressMap($lessons);
        $accessMap = $accessMap ?? $this->getLessonAccessMap($lessons, $progressMap);

        foreach ($lessons as $lesson) {
            if (!$accessMap->get($lesson->lesson_id, false)) {
                continue;
            }

            $progress = $progressMap->get($lesson->lesson_id);

            if (!$progress || $progress->status !== 'completed') {
                return $lesson;
            }
        }

        return null;
    }

    public function canAccessLesson(
        int $lessonId,
        ?Collection $lessons = null,
        ?Collection $progressMap = null,
        ?Collection $accessMap = null
    ): bool {
        $lessons = $lessons ?? $this->getOrderedLessons();
        $progressMap = $progressMap ?? $this->getLessonProgressMap($lessons);
        $accessMap = $accessMap ?? $this->getLessonAccessMap($lessons, $progressMap);

        return (bool) $accessMap->get($lessonId, false);
    }

    public function getAccessibleLessons()
    {
        $lessons = $this->getOrderedLessons();
        $progressMap = $this->getLessonProgressMap($lessons);
        $accessMap = $this->getLessonAccessMap($lessons, $progressMap);

        return $lessons->filter(function ($lesson) use ($accessMap) {
            return $accessMap->get($lesson->lesson_id, false);
        });
    }

    public function getLockedLessons()
    {
        $lessons = $this->getOrderedLessons();
        $progressMap = $this->getLessonProgressMap($lessons);
        $accessMap = $this->getLessonAccessMap($lessons, $progressMap);

        return $lessons->filter(function ($lesson) use ($accessMap) {
            return !$accessMap->get($lesson->lesson_id, false);
        });
    }

    public function getOrderedLessons(): Collection
    {
        $path = $this->relationLoaded('learningPath')
            ? $this->learningPath
            : $this->learningPath()->first();

        if (!$path) {
            return collect();
        }

        if (!$path->relationLoaded('lessons')) {
            $path->load([
                'lessons' => function ($query) {
                    $query->orderBy('learning_path_lessons.sequence_order');
                }
            ]);
        }

        return $path->lessons->sortBy('pivot.sequence_order')->values();
    }

    public function getLessonProgressMap(?Collection $lessons = null): Collection
    {
        $lessons = $lessons ?? $this->getOrderedLessons();
        $lessonIds = $lessons->pluck('lesson_id')->all();

        if (empty($lessonIds)) {
            return collect();
        }

        return LessonProgress::where('student_id', $this->student_id)
            ->whereIn('lesson_id', $lessonIds)
            ->get()
            ->map(function ($progress) {
                if ($progress->status === 'completed' && (int) $progress->progress_percent < 100) {
                    $progress->updateProgress(100);
                    $progress->refresh();
                }

                return $progress;
            })
            ->keyBy('lesson_id');
    }

    public function getLessonAccessMap(?Collection $lessons = null, ?Collection $progressMap = null): Collection
    {
        $lessons = $lessons ?? $this->getOrderedLessons();
        $progressMap = $progressMap ?? $this->getLessonProgressMap($lessons);
        $accessMap = collect();
        $previousLessonId = null;

        foreach ($lessons as $lesson) {
            $isAccessible = true;

            if ($lesson->pivot->unlock_after_previous && $previousLessonId !== null) {
                $previousProgress = $progressMap->get($previousLessonId);
                $isAccessible = $previousProgress && $previousProgress->status === 'completed';
            }

            $accessMap->put($lesson->lesson_id, $isAccessible);
            $previousLessonId = $lesson->lesson_id;
        }

        return $accessMap;
    }

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

    public function setAsPrimary(): void
    {
        self::where('student_id', $this->student_id)
            ->where('student_path_id', '!=', $this->student_path_id)
            ->update(['is_primary' => false]);

        $this->update(['is_primary' => true]);
    }
}
