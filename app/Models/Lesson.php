<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\LessonSection;

class Lesson extends Model
{
    use HasFactory;

    protected $primaryKey = 'lesson_id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $table = 'lessons';

    protected $fillable = [
        'title',
        'content',
        'content_type',
        'difficulty',
        'estimated_duration',
        'video_url',
        'status',
        'completion_reward_points',
        'required_exercises',
        'required_tests',
        'min_exercise_score_percent',
        'created_by',
        'ai_generated',        // 新增
        'ai_source_url',       // 新增
    ];

    protected $casts = [
        'content_type' => 'string',
        'estimated_duration' => 'integer',
        'completion_reward_points' => 'integer',
        'required_exercises' => 'integer',
        'required_tests' => 'integer',
        'min_exercise_score_percent' => 'decimal:2',
        'ai_generated' => 'boolean',
    ];
    protected $appends = [
        'video_embed_url',
    ];

    public function getRouteKeyName()
    {
        return 'lesson_id';
    }
    public function getVideoEmbedUrlAttribute(): ?string
    {
        if (!$this->video_url) {
            return null;
        }

        $url = trim($this->video_url);

        // Already embed URL
        if (str_contains($url, 'youtube.com/embed/')) {
            return $url;
        }

        // youtube.com/watch?v=xxxx
        if (str_contains($url, 'youtube.com/watch')) {
            parse_str(parse_url($url, PHP_URL_QUERY), $query);

            if (!empty($query['v'])) {
                return 'https://www.youtube.com/embed/' . $query['v'];
            }
        }

        // youtu.be/xxxx
        if (str_contains($url, 'youtu.be/')) {
            return 'https://www.youtube.com/embed/' . basename($url);
        }

        // fallback: return original (future-proof for Vimeo, etc.)
        return $url;
    }
    // ==================== Original Relationships ====================

    public function creator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by', 'user_Id');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(LessonSection::class, 'lesson_id', 'lesson_id')
            ->orderBy('order_index');
    }

    public function isAiGenerated(): bool
    {
        return $this->ai_generated === true;
    }
    // 👆 到这里

    public function interactiveExercises(): HasMany
    {
        return $this->hasMany(\App\Models\InteractiveExercise::class, 'lesson_id', 'lesson_id');
    }


    public function tests(): HasMany
    {
        return $this->hasMany(\App\Models\Test::class, 'lesson_id', 'lesson_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(\App\Models\LessonRegistration::class, 'lesson_id', 'lesson_id');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Models\StudentProfile::class,
            'lesson_registrations',
            'lesson_id',
            'student_id'
        )->withPivot([
            'registration_id',
            'registration_status',
            'exercises_completed',
            'tests_passed',
            'completion_points_awarded',
            'completed_at',
            'created_at',
            'updated_at'
        ])->withTimestamps();
    }

    // ==================== Lesson Progress Relationships - NEW ====================

    /**
     * Relationship: Lesson has many progress records
     */
    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class, 'lesson_id', 'lesson_id');
    }
    public function learningPaths(): BelongsToMany
    {
        return $this->belongsToMany(
            LearningPath::class,
            'learning_path_lessons',
            'lesson_id',
            'path_id',
            'lesson_id',
            'path_id'
        )->withPivot([
            'path_lesson_id',
            'sequence_order',
            'is_required',
            'unlock_after_previous',
            'estimated_duration_minutes',
            'path_specific_notes',
        ])->withTimestamps()
            ->orderBy('learning_path_lessons.sequence_order', 'asc');
    }
    /**
     * Get progress for a specific student
     */
    public function getProgressForStudent($studentId): ?LessonProgress
    {
        return $this->progress()
            ->where('student_id', $studentId)
            ->first();
    }

    /**
     * Get completion statistics for this lesson
     */
    public function getCompletionStats(): array
    {
        $total = $this->progress()->count();
        $completed = $this->progress()->where('status', 'completed')->count();
        $inProgress = $this->progress()->where('status', 'in_progress')->count();
        $notStarted = $this->progress()->where('status', 'not_started')->count();

        return [
            'total_students' => $total,
            'completed' => $completed,
            'in_progress' => $inProgress,
            'not_started' => $notStarted,
            'completion_rate' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
            'average_progress' => $this->getAverageProgress(),
        ];
    }

    /**
     * Get average progress percentage
     */
    public function getAverageProgress(): float
    {
        return round($this->progress()->avg('progress_percent') ?? 0, 2);
    }

    /**
     * Get top performers for this lesson
     */
    public function getTopPerformers(int $limit = 10)
    {
        return $this->progress()
            ->with('student.user')
            ->where('status', 'completed')
            ->orderBy('completed_at', 'asc') // First to complete
            ->orderBy('progress_percent', 'desc') // Highest progress
            ->limit($limit)
            ->get();
    }

    /**
     * Get students struggling with this lesson
     */
    public function getStrugglingStudents(): array
    {
        // Students who started but made little progress (< 30%) in last 7 days
        $struggling = $this->progress()
            ->with('student.user')
            ->where('status', 'in_progress')
            ->where('progress_percent', '<', 30)
            ->where('started_at', '<', now()->subDays(7))
            ->get();

        return $struggling->map(function ($progress) {
            return [
                'student' => $progress->student,
                'progress_percent' => $progress->progress_percent,
                'days_since_start' => $progress->started_at->diffInDays(now()),
                'last_updated' => $progress->last_updated_at->diffForHumans(),
            ];
        })->toArray();
    }

    /**
     * Get lesson engagement metrics
     */
    public function getEngagementMetrics(): array
    {
        $progress = $this->progress();

        return [
            'total_enrolled' => $progress->count(),
            'started' => $progress->whereIn('status', ['in_progress', 'completed'])->count(),
            'completed' => $progress->where('status', 'completed')->count(),
            'completion_rate' => $this->getCompletionStats()['completion_rate'],
            'average_completion_time_days' => $this->getAverageCompletionTime(),
            'average_progress' => $this->getAverageProgress(),
            'engagement_rate' => $this->calculateEngagementRate(),
        ];
    }

    /**
     * Calculate average completion time in days
     */
    private function getAverageCompletionTime(): float
    {
        $completedProgress = $this->progress()
            ->where('status', 'completed')
            ->whereNotNull('started_at')
            ->whereNotNull('completed_at')
            ->get();

        if ($completedProgress->isEmpty()) {
            return 0;
        }

        $totalDays = $completedProgress->sum(function ($progress) {
            return $progress->started_at->diffInDays($progress->completed_at);
        });

        return round($totalDays / $completedProgress->count(), 2);
    }

    /**
     * Calculate engagement rate (students who made progress vs total enrolled)
     */
    private function calculateEngagementRate(): float
    {
        $total = $this->progress()->count();

        if ($total === 0) {
            return 0;
        }

        $engaged = $this->progress()
            ->where('progress_percent', '>', 0)
            ->count();

        return round(($engaged / $total) * 100, 2);
    }

    /**
     * Check if lesson content has changed (for recalculating progress)
     */
    public function hasContentChanged(): bool
    {
        $currentExercises = $this->interactiveExercises()->where('is_active', true)->count();
        $currentTests = $this->tests()->where('status', 'active')->count();

        return $currentExercises !== $this->required_exercises ||
            $currentTests !== $this->required_tests;
    }

    /**
     * Recalculate all progress records for this lesson
     */
    public function recalculateAllProgress(): int
    {
        $progressRecords = $this->progress()->get();
        $updated = 0;

        foreach ($progressRecords as $progress) {
            $progress->updateCompletionFlags();
            $calculatedProgress = $progress->calculateProgress();
            $progress->updateProgress($calculatedProgress);
            $updated++;
        }

        return $updated;
    }

    // ==================== Original Helper Methods ====================

    /**
     * Helper method to update completion requirements
     */
    public function updateCompletionRequirements()
    {
        $this->update([
            'required_exercises' => $this->interactiveExercises()->where('is_active', true)->count(),
            'required_tests' => $this->tests()->where('status', 'active')->count(),
        ]);
    }
    public function isLockedForStudent(int $studentId, int $pathId): bool
    {
        // Get the lesson's pivot data in this specific path
        $lessonInPath = $this->learningPaths()
            ->where('learning_paths.path_id', $pathId)  // 明确指定表名
            ->first();

        if (!$lessonInPath) {
            return true; // Lesson not in this path
        }

        // If unlock_after_previous is false, always unlocked
        if (!$lessonInPath->pivot->unlock_after_previous) {
            return false;
        }

        // Check if there's a previous lesson
        $previousLesson = \DB::table('learning_path_lessons')
            ->where('path_id', $pathId)
            ->where('sequence_order', '<', $lessonInPath->pivot->sequence_order)
            ->orderBy('sequence_order', 'desc')
            ->first();

        if (!$previousLesson) {
            return false; // First lesson, always unlocked
        }

        // Check if previous lesson is completed
        $progress = LessonProgress::where('student_id', $studentId)
            ->where('lesson_id', $previousLesson->lesson_id)
            ->first();

        return !($progress && $progress->status === 'completed');
    }

    /**
     * Check if lesson is part of any learning path
     */
    public function isInLearningPath(): bool
    {
        return $this->learningPaths()->exists();
    }

    /**
     * Get the next lesson in a specific learning path
     */
    public function getNextLessonInPath(int $pathId): ?Lesson
    {
        $currentLesson = $this->learningPaths()
            ->where('path_id', $pathId)
            ->first();

        if (!$currentLesson) {
            return null;
        }

        return LearningPath::find($pathId)
            ->lessons()
            ->where('learning_path_lessons.sequence_order', '>', $currentLesson->pivot->sequence_order)
            ->orderBy('learning_path_lessons.sequence_order', 'asc')
            ->first();
    }

    /**
     * Get the previous lesson in a specific learning path
     */
    public function getPreviousLessonInPath(int $pathId): ?Lesson
    {
        $currentLesson = $this->learningPaths()
            ->where('path_id', $pathId)
            ->first();

        if (!$currentLesson) {
            return null;
        }

        return LearningPath::find($pathId)
            ->lessons()
            ->where('learning_path_lessons.sequence_order', '<', $currentLesson->pivot->sequence_order)
            ->orderBy('learning_path_lessons.sequence_order', 'desc')
            ->first();
    }

    /**
     * Get lesson position in a path
     */
    public function getPositionInPath(int $pathId): ?array
    {
        $path = LearningPath::find($pathId);

        if (!$path) {
            return null;
        }

        $currentLesson = $this->learningPaths()
            ->where('path_id', $pathId)
            ->first();

        if (!$currentLesson) {
            return null;
        }

        $totalLessons = $path->lessons()->count();
        $currentPosition = $currentLesson->pivot->sequence_order;

        return [
            'current' => $currentPosition,
            'total' => $totalLessons,
            'text' => "Lesson {$currentPosition} of {$totalLessons}",
            'percentage' => round(($currentPosition / $totalLessons) * 100, 1),
        ];
    }

    /**
     * Check if student can start this lesson
     */
    public function canStudentStartLesson(int $studentId, ?int $pathId = null): array
    {
        // Check if lesson is locked
        if ($this->isLockedForStudent($studentId, $pathId)) {
            $previousLesson = $pathId ? $this->getPreviousLessonInPath($pathId) : null;

            return [
                'can_start' => false,
                'reason' => $previousLesson
                    ? "You must complete \"{$previousLesson->title}\" first."
                    : "This lesson is currently locked.",
            ];
        }

        // Check if student already completed this lesson
        $progress = LessonProgress::where('student_id', $studentId)
            ->where('lesson_id', $this->lesson_id)
            ->first();

        if ($progress && $progress->status === 'completed') {
            return [
                'can_start' => true,
                'reason' => 'You have already completed this lesson. You can review it anytime.',
                'is_review' => true,
            ];
        }

        return [
            'can_start' => true,
            'reason' => 'You can start this lesson.',
            'is_review' => false,
        ];
    }

    /**
     * Get all paths that include this lesson
     */
    public function getPathsContainingLesson()
    {
        return $this->learningPaths()
            ->with(['studentPaths' => function ($query) {
                $query->where('status', 'active');
            }])
            ->get()
            ->map(function ($path) {
                return [
                    'path_id' => $path->path_id,
                    'title' => $path->title,
                    'difficulty' => $path->difficulty_level,
                    'sequence_order' => $path->pivot->sequence_order,
                    'is_required' => $path->pivot->is_required,
                    'active_students' => $path->studentPaths->count(),
                ];
            });
    }

    /**
     * Get lesson statistics within learning paths
     */
    public function getLearningPathStats(): array
    {
        $paths = $this->learningPaths;

        if ($paths->isEmpty()) {
            return [
                'in_paths' => false,
                'total_paths' => 0,
                'paths' => [],
            ];
        }

        return [
            'in_paths' => true,
            'total_paths' => $paths->count(),
            'paths' => $paths->map(function ($path) {
                return [
                    'title' => $path->title,
                    'difficulty' => $path->difficulty_level,
                    'sequence' => $path->pivot->sequence_order,
                    'is_required' => $path->pivot->is_required,
                ];
            })->toArray(),
        ];
    }
    // ==================== Boot Method ====================

    /**
     * Boot method to automatically update requirements when exercises/tests change
     */
    protected static function boot()
    {
        parent::boot();

        // When lesson is created, initialize required fields
        static::created(function ($lesson) {
            $lesson->updateCompletionRequirements();
        });

        // When lesson is updated, check if we need to recalculate progress
        static::updated(function ($lesson) {
            // Use wasChanged() in updated hook because dirty state is already synced after save.
            if ($lesson->wasChanged(['required_exercises', 'required_tests'])) {
                $lesson->recalculateAllProgress();
            }
        });
    }
}
