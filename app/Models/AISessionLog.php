<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AISessionLog extends Model
{
    use HasFactory;

    protected $table = 'ai_session_logs';
    protected $primaryKey = 'ai_session_log_id';

    protected $fillable = [
        'student_id',
        'ai_session_id',
        'lesson_id',
        'prompt',
        'response',
        'timestamp',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    // 关联学生
    public function student()
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }

    // 关联课程
    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'lesson_id', 'lesson_id');
    }
}
