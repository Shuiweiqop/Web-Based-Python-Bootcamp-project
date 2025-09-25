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
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the student that owns the registration
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }

    /**
     * Get the lesson that this registration belongs to
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id', 'lesson_id');
    }

    /**
     * Scope for filtering by status
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('registration_status', $status);
    }

    /**
     * Scope for active registrations
     */
    public function scopeActive($query)
    {
        return $query->where('registration_status', 'active');
    }

    /**
     * Scope for cancelled registrations
     */
    public function scopeCancelled($query)
    {
        return $query->where('registration_status', 'cancelled');
    }

    /**
     * Check if registration can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return $this->registration_status === 'active';
    }

    /**
     * Get status badge color for UI
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->registration_status) {
            'active' => 'green',
            'cancelled' => 'gray',
            default => 'gray'
        };
    }

    /**
     * Get human readable status
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->registration_status) {
            'active' => 'Active',
            'cancelled' => 'Cancelled',
            default => 'Unknown'
        };
    }
}
