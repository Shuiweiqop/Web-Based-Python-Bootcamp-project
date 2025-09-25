<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteractiveExercise extends Model
{
    use HasFactory;

    // 表 / 主键设置
    protected $table = 'interactive_exercises';
    protected $primaryKey = 'exercise_id';
    public $incrementing = true;
    protected $keyType = 'int';

    // 可批量赋值字段（按需增减）
    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'exercise_type',
        'difficulty',
        'duration',
        'points_value',
        'content',
        'status',
        'created_by',
        'asset_url',
        'max_score',
        'time_limit_sec',
        'is_active',
        'starter_code',
        'solution',
    ];

    // casts：content 用 array 更好与前端交互
    protected $casts = [
        'content' => 'array',
        'duration' => 'integer',
        'points_value' => 'integer',
        'lesson_id' => 'integer',
        'created_by' => 'integer',
        'max_score' => 'integer',
        'time_limit_sec' => 'integer',
        'is_active' => 'boolean',
    ];

    /***************
     * Relationships
     ***************/
    // 属于一个 Lesson（lesson 表主键为 lesson_id）
    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'lesson_id', 'lesson_id');
    }

    // 创建者：注意你的 User PK 是 user_Id（如你的 User model 所示）
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_Id');
    }

    /***************
     * Scopes
     ***************/
    public function scopeByLesson($query, $lessonId)
    {
        return $query->where('lesson_id', $lessonId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('exercise_type', $type);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRecent($query, $limit = 10)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    /***************
     * Accessors / Mutators
     ***************/
    /**
     * Accept content as array or JSON string.
     */
    public function setContentAttribute($value)
    {
        if (is_string($value)) {
            // 如果是 JSON 字符串，尝试 decode，否则保留原字符串（后续可调整）
            $decoded = json_decode($value, true);
            $this->attributes['content'] = $decoded === null ? json_encode(['raw' => $value]) : json_encode($decoded);
            return;
        }

        // 如果是数组或 null，直接存储（model cast 会处理为 array）
        $this->attributes['content'] = $value === null ? null : json_encode($value);
    }

    /**
     * 更友好的 duration 展示（分钟或小时）
     */
    public function getFormattedDurationAttribute(): string
    {
        $duration = $this->duration ?? 0;
        if ($duration <= 0) {
            return 'No time limit';
        }
        if ($duration < 60) {
            return $duration . ' min';
        }
        $hours = floor($duration / 60);
        $minutes = $duration % 60;
        return $hours . 'h' . ($minutes ? ' ' . $minutes . 'm' : '');
    }

    /**
     * route model binding key
     */
    public function getRouteKeyName()
    {
        return 'exercise_id';
    }
}
