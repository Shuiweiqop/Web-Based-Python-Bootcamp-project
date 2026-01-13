<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'content',
        'order_index',
    ];

    protected $casts = [
        'order_index' => 'integer',
    ];

    /**
     * 所属的课程
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id', 'lesson_id');
    }
}
