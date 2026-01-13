<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonRegistration extends Model
{
    use HasFactory;

    protected $table = 'lesson_registrations';
    protected $primaryKey = 'registration_id';

    protected $fillable = [
        'student_id',
        'lesson_id',
        'registration_status',
        'exercises_completed',
        'tests_passed',
        'completion_points_awarded',
        'completed_at',
    ];

    protected $casts = [
        'exercises_completed' => 'integer',
        'tests_passed' => 'integer',
        'completion_points_awarded' => 'integer', // 🔥 改为 integer，而不是 boolean
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id', 'lesson_id');
    }

    // Scopes
    public function scopeWithStatus($query, $status)
    {
        return $query->where('registration_status', $status);
    }

    public function scopeActive($query)
    {
        return $query->where('registration_status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('registration_status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('registration_status', 'cancelled');
    }

    public function scopeAwarded($query)
    {
        return $query->where('completion_points_awarded', '>', 0); // 🔥 修正：检查积分 > 0
    }

    // Helper methods
    public function canBeCancelled(): bool
    {
        return $this->registration_status === 'active';
    }

    public function isCompleted(): bool
    {
        // 🔥 修正：检查状态或是否已发放积分
        return $this->registration_status === 'completed' || $this->completion_points_awarded > 0;
    }

    // 🔥 新增：检查是否已发放积分
    public function hasReceivedPoints(): bool
    {
        return $this->completion_points_awarded > 0;
    }

    public function getCompletionProgress(): array
    {
        $lesson = $this->lesson;

        return [
            'exercises' => [
                'completed' => $this->exercises_completed,
                'required' => $lesson->required_exercises ?? 0,
                'percentage' => ($lesson->required_exercises ?? 0) > 0
                    ? round(($this->exercises_completed / $lesson->required_exercises) * 100)
                    : 0
            ],
            'tests' => [
                'passed' => $this->tests_passed,
                'required' => $lesson->required_tests ?? 0,
                'percentage' => ($lesson->required_tests ?? 0) > 0
                    ? round(($this->tests_passed / $lesson->required_tests) * 100)
                    : 0
            ],
        ];
    }

    // Attributes
    public function getStatusColorAttribute(): string
    {
        return match ($this->registration_status) {
            'active' => 'blue',
            'completed' => 'green',
            'cancelled' => 'gray',
            default => 'gray'
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->registration_status) {
            'active' => 'Active',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            default => 'Unknown'
        };
    }
}
