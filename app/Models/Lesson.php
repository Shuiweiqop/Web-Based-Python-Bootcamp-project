<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $primaryKey = 'lesson_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $table = 'lessons';

    protected $fillable = [
        'title',
        'description',
        'difficulty',
        'estimated_duration',
        'video_url',
        'status',
        'completion_reward_points',
        'created_by', // 添加这个字段到 fillable
    ];

    public function getRouteKeyName()
    {
        return 'lesson_id';
    }

    // 添加 creator 关系
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by', 'user_Id');
    }

    public function exercises()
    {
        return $this->hasMany(\App\Models\InteractiveExercise::class, 'lesson_id', 'lesson_id');
    }

    public function tests()
    {
        return $this->hasMany(\App\Models\Test::class, 'lesson_id', 'lesson_id');
    }

    public function registrations()
    {
        return $this->hasMany(\App\Models\LessonRegistration::class, 'lesson_id', 'lesson_id');
    }

    public function students()
    {
        return $this->belongsToMany(
            \App\Models\StudentProfile::class,
            'lesson_registrations',
            'lesson_id',
            'student_id'
        )->withPivot(['registration_id', 'registration_status', 'created_at', 'updated_at'])
            ->withTimestamps();
    }
}
