<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class LearningPath extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'path_id';

    protected $fillable = [
        'title',
        'description',
        'learning_outcomes',
        'prerequisites',
        'difficulty_level',
        'estimated_duration_hours',
        'min_score_required',
        'max_score_required',
        'required_skills',
        'icon',
        'color',
        'banner_image',
        'is_active',
        'is_featured',
        'display_order',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'estimated_duration_hours' => 'integer',
        'min_score_required' => 'integer',
        'max_score_required' => 'integer',
        'required_skills' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'display_order' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    // ==================== Relationships ====================

    public function lessons(): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Models\Lesson::class,
            'learning_path_lessons',
            'path_id',
            'lesson_id',
            'path_id',
            'lesson_id'
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

    public function studentPaths(): HasMany
    {
        return $this->hasMany(StudentLearningPath::class, 'path_id', 'path_id');
    }

    public function activeStudents(): HasMany
    {
        return $this->studentPaths()->where('status', 'active');
    }

    public function completedStudents(): HasMany
    {
        return $this->studentPaths()->where('status', 'completed');
    }

    public function recommendedFromSubmissions(): HasMany
    {
        return $this->hasMany(TestSubmission::class, 'recommended_path_id', 'path_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'user_Id');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by', 'user_Id');
    }

    // ==================== Scopes ====================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->where('is_active', true);
    }

    public function scopeForDifficulty($query, $difficulty)
    {
        return $query->where('difficulty_level', $difficulty);
    }

    public function scopeForScore($query, $score)
    {
        return $query->where('min_score_required', '<=', $score)
            ->where('max_score_required', '>=', $score)
            ->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order', 'asc')
            ->orderBy('title', 'asc');
    }

    // ==================== Attribute Accessors ====================

    public function getTotalLessonsAttribute(): int
    {
        return $this->lessons()->count();
    }

    public function getRequiredLessonsCountAttribute(): int
    {
        return $this->lessons()
            ->wherePivot('is_required', true)
            ->count();
    }

    public function getCalculatedDurationHoursAttribute(): float
    {
        $lessons = $this->relationLoaded('lessons')
            ? $this->lessons
            : $this->lessons()->get(['lessons.lesson_id', 'lessons.estimated_duration']);

        $totalMinutes = $lessons->sum(function ($lesson) {
            return $lesson->pivot->estimated_duration_minutes
                ?? $lesson->estimated_duration
                ?? 0;
        });

        return round($totalMinutes / 60, 1);
    }

    public function getEnrollmentCountAttribute(): int
    {
        return $this->studentPaths()->count();
    }

    public function getActiveEnrollmentCountAttribute(): int
    {
        return $this->activeStudents()->count();
    }

    public function getCompletionCountAttribute(): int
    {
        return $this->completedStudents()->count();
    }

    public function getCompletionRateAttribute(): float
    {
        $total = $this->enrollment_count;

        if ($total === 0) {
            return 0;
        }

        return round(($this->completion_count / $total) * 100, 2);
    }

    // ==================== Helper Methods ====================

    public function isSuitableForScore(float $score): bool
    {
        return $score >= $this->min_score_required &&
            $score <= $this->max_score_required;
    }

    public function getCompletionStats(): array
    {
        $students = $this->studentPaths;
        $total = $students->count();

        if ($total === 0) {
            return [
                'total_students' => 0,
                'active' => 0,
                'completed' => 0,
                'paused' => 0,
                'abandoned' => 0,
                'average_progress' => 0,
                'completion_rate' => 0,
            ];
        }

        return [
            'total_students' => $total,
            'active' => $students->where('status', 'active')->count(),
            'completed' => $students->where('status', 'completed')->count(),
            'paused' => $students->where('status', 'paused')->count(),
            'abandoned' => $students->where('status', 'abandoned')->count(),
            'average_progress' => round($students->avg('progress_percent'), 2),
            'completion_rate' => $this->completion_rate,
        ];
    }

    public function getLessonByOrder(int $order): ?Lesson
    {
        return $this->lessons()
            ->wherePivot('sequence_order', $order)
            ->first();
    }

    public function getFirstLesson(): ?Lesson
    {
        return $this->lessons()->first();
    }

    public function addLesson(int $lessonId, array $pivotData = []): void
    {
        $maxOrder = DB::table('learning_path_lessons')
            ->where('path_id', $this->path_id)
            ->max('sequence_order') ?? 0;

        $defaultData = [
            'sequence_order' => $maxOrder + 1,
            'is_required' => true,
            'unlock_after_previous' => true,
        ];

        $this->lessons()->attach($lessonId, array_merge($defaultData, $pivotData));
    }

    public function removeLesson(int $lessonId): void
    {
        $this->lessons()->detach($lessonId);
        $this->reorderLessons();
    }

    public function reorderLessons(): void
    {
        $lessons = $this->lessons()->orderBy('sequence_order')->get();

        foreach ($lessons as $index => $lesson) {
            $this->lessons()->updateExistingPivot($lesson->lesson_id, [
                'sequence_order' => $index + 1
            ]);
        }
    }

    public function updateLessonOrder(array $lessonIds): void
    {
        foreach ($lessonIds as $order => $lessonId) {
            $this->lessons()->updateExistingPivot($lessonId, [
                'sequence_order' => $order + 1
            ]);
        }
    }

    public function clonePath(string $newTitle): self
    {
        $clone = $this->replicate();
        $clone->title = $newTitle;
        $clone->is_active = false;
        $clone->save();

        foreach ($this->lessons as $lesson) {
            $clone->lessons()->attach($lesson->lesson_id, [
                'sequence_order' => $lesson->pivot->sequence_order,
                'is_required' => $lesson->pivot->is_required,
                'unlock_after_previous' => $lesson->pivot->unlock_after_previous,
                'estimated_duration_minutes' => $lesson->pivot->estimated_duration_minutes,
                'path_specific_notes' => $lesson->pivot->path_specific_notes,
            ]);
        }

        return $clone;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($path) {
            if (!$path->display_order) {
                $path->display_order = static::max('display_order') + 1;
            }
        });
    }
}
