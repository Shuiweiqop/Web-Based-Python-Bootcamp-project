<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteractiveExercise extends Model
{
    use HasFactory;

    protected $table = 'interactive_exercises';
    protected $primaryKey = 'exercise_id';
    public $incrementing = true;
    protected $keyType = 'int';

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
        'enable_live_editor',
        'test_cases',
        'coding_instructions',
    ];

    protected $casts = [
        'content' => 'array',
        'duration' => 'integer',
        'points_value' => 'integer',
        'lesson_id' => 'integer',
        'created_by' => 'integer',
        'max_score' => 'integer',
        'time_limit_sec' => 'integer',
        'is_active' => 'boolean',
        'test_cases' => 'array',
        'enable_live_editor' => 'boolean',
    ];

    // ==================== Relationships ====================

    /**
     * 所属课程
     */
    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'lesson_id', 'lesson_id');
    }

    /**
     * 创建者
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_Id');
    }

    /**
     * 所有提交记录
     */
    public function submissions()
    {
        return $this->hasMany(ExerciseSubmission::class, 'exercise_id', 'exercise_id');
    }

    // ==================== Scopes ====================

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

    /**
     * 🆕 按难度筛选
     */
    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    // ==================== Accessors / Mutators ====================

    public function setContentAttribute($value)
    {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $this->attributes['content'] = $decoded === null ? json_encode(['raw' => $value]) : json_encode($decoded);
            return;
        }

        $this->attributes['content'] = $value === null ? null : json_encode($value);
    }

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
     * 🆕 格式化时间限制（秒转分钟）
     */
    public function getFormattedTimeLimitAttribute(): string
    {
        if (!$this->time_limit_sec) {
            return 'No time limit';
        }

        $minutes = floor($this->time_limit_sec / 60);
        $seconds = $this->time_limit_sec % 60;

        if ($minutes > 0) {
            return $seconds > 0 ? "{$minutes}m {$seconds}s" : "{$minutes}m";
        }

        return "{$seconds}s";
    }

    public function getRouteKeyName()
    {
        return 'exercise_id';
    }

    // ==================== Submission Related Methods ====================

    /**
     * 🆕 获取特定学生的所有提交
     */
    public function submissionsForStudent($studentId)
    {
        return $this->submissions()
            ->where('student_id', $studentId)
            ->orderBy('submitted_at', 'desc');
    }

    /**
     * 🆕 获取学生的最佳提交
     */
    public function getBestSubmissionForStudent($studentId)
    {
        return $this->submissions()
            ->where('student_id', $studentId)
            ->orderBy('score', 'desc')
            ->first();
    }

    /**
     * 🆕 获取学生的最新提交
     */
    public function getLatestSubmissionForStudent($studentId)
    {
        return $this->submissions()
            ->where('student_id', $studentId)
            ->latest('submitted_at')
            ->first();
    }

    /**
     * 🆕 检查学生是否完成（≥70% 或自定义百分比）
     */
    public function isCompletedByStudent($studentId, $minPercentage = 70)
    {
        $bestSubmission = $this->getBestSubmissionForStudent($studentId);

        if (!$bestSubmission) {
            return false;
        }

        if ($this->max_score == 0) {
            return false;
        }

        $percentage = ($bestSubmission->score / $this->max_score) * 100;
        return $percentage >= $minPercentage;
    }

    /**
     * 🆕 获取学生的尝试次数
     */
    public function getAttemptCountForStudent($studentId)
    {
        return $this->submissions()
            ->where('student_id', $studentId)
            ->count();
    }

    /**
     * 🆕 获取学生的最佳分数
     */
    public function getBestScoreForStudent($studentId)
    {
        $bestSubmission = $this->getBestSubmissionForStudent($studentId);
        return $bestSubmission ? $bestSubmission->score : 0;
    }

    /**
     * 🆕 获取学生的完成状态详情
     */
    public function getStudentProgress($studentId)
    {
        $submissions = $this->submissionsForStudent($studentId)->get();
        $bestSubmission = $submissions->sortByDesc('score')->first();
        $latestSubmission = $submissions->sortByDesc('submitted_at')->first();

        return [
            'attempts' => $submissions->count(),
            'best_score' => $bestSubmission ? $bestSubmission->score : 0,
            'best_percentage' => $bestSubmission ? $bestSubmission->percentage : 0,
            'latest_score' => $latestSubmission ? $latestSubmission->score : 0,
            'completed' => $bestSubmission ? $bestSubmission->completed : false,
            'last_attempt_at' => $latestSubmission ? $latestSubmission->submitted_at : null,
        ];
    }

    // ==================== Statistics Methods ====================

    /**
     * 🆕 获取平均分
     */
    public function getAverageScore()
    {
        return $this->submissions()->avg('score') ?? 0;
    }

    /**
     * 🆕 获取完成率（所有尝试过的学生中完成的百分比）
     */
    public function getCompletionRate()
    {
        $totalStudents = $this->submissions()
            ->distinct('student_id')
            ->count('student_id');

        if ($totalStudents === 0) {
            return 0;
        }

        $completedStudents = $this->submissions()
            ->where('completed', true)
            ->distinct('student_id')
            ->count('student_id');

        return round(($completedStudents / $totalStudents) * 100, 1);
    }

    /**
     * 🆕 获取总提交次数
     */
    public function getTotalSubmissions()
    {
        return $this->submissions()->count();
    }

    /**
     * 🆕 获取唯一学生数
     */
    public function getUniqueStudentsCount()
    {
        return $this->submissions()
            ->distinct('student_id')
            ->count('student_id');
    }

    /**
     * 🆕 获取完整统计数据
     */
    public function getStatistics()
    {
        $submissions = $this->submissions;

        return [
            'total_submissions' => $submissions->count(),
            'unique_students' => $submissions->unique('student_id')->count(),
            'average_score' => round($submissions->avg('score'), 1),
            'highest_score' => $submissions->max('score'),
            'lowest_score' => $submissions->min('score'),
            'completion_rate' => $this->getCompletionRate(),
            'average_time' => round($submissions->avg('time_taken'), 0),
            'completed_count' => $submissions->where('completed', true)->count(),
        ];
    }

    /**
     * 🆕 获取分数分布
     */
    public function getScoreDistribution()
    {
        $submissions = $this->submissions;
        $maxScore = $this->max_score;

        if ($maxScore == 0) {
            return [];
        }

        $distribution = [
            'A (90-100%)' => 0,
            'B (80-89%)' => 0,
            'C (70-79%)' => 0,
            'D (60-69%)' => 0,
            'F (<60%)' => 0,
        ];

        foreach ($submissions as $submission) {
            $percentage = ($submission->score / $maxScore) * 100;

            if ($percentage >= 90) {
                $distribution['A (90-100%)']++;
            } elseif ($percentage >= 80) {
                $distribution['B (80-89%)']++;
            } elseif ($percentage >= 70) {
                $distribution['C (70-79%)']++;
            } elseif ($percentage >= 60) {
                $distribution['D (60-69%)']++;
            } else {
                $distribution['F (<60%)']++;
            }
        }

        return $distribution;
    }

    // ==================== Helper Methods ====================

    /**
     * 🆕 检查是否有时间限制
     */
    public function hasTimeLimit()
    {
        return $this->time_limit_sec > 0;
    }

    /**
     * 🆕 检查是否需要代码编辑器
     */
    public function requiresCodeEditor()
    {
        return in_array($this->exercise_type, ['coding', 'python_challenge']);
    }

    /**
     * 🆕 获取游戏类型的图标
     */
    public function getTypeIcon()
    {
        $icons = [
            'drag_drop' => '🎯',
            'adventure_game' => '🗺️',
            'maze_game' => '🧩',
            'coding' => '💻',
            'quiz' => '📝',
            // ❌ 已删除: 'matching' => '🔗',
        ];

        return $icons[$this->exercise_type] ?? '🎮';
    }

    /**
     * 🆕 获取难度徽章颜色
     */
    public function getDifficultyColor()
    {
        $colors = [
            'beginner' => 'green',
            'intermediate' => 'yellow',
            'advanced' => 'red',
        ];

        return $colors[$this->difficulty] ?? 'gray';
    }

    // ==================== Model Events ====================

    protected static function boot()
    {
        parent::boot();

        // 创建或删除 exercise 时更新 lesson 的完成要求
        static::created(function ($exercise) {
            if ($exercise->lesson && $exercise->is_active) {
                $exercise->lesson->updateCompletionRequirements();
            }
        });

        static::updated(function ($exercise) {
            if ($exercise->lesson && $exercise->isDirty('is_active')) {
                $exercise->lesson->updateCompletionRequirements();
            }
        });

        static::deleted(function ($exercise) {
            if ($exercise->lesson) {
                $exercise->lesson->updateCompletionRequirements();
            }
        });
    }

    // ==================== Query Helpers ====================

    /**
     * 🆕 获取推荐的下一个 exercise（基于学生进度）
     */
    public static function getNextExerciseForStudent($lessonId, $studentId)
    {
        $exercises = static::byLesson($lessonId)
            ->active()
            ->orderBy('created_at')
            ->get();

        foreach ($exercises as $exercise) {
            if (!$exercise->isCompletedByStudent($studentId)) {
                return $exercise;
            }
        }

        return null; // 所有 exercises 都已完成
    }

    /**
     * 🆕 获取学生在课程中的 exercise 进度摘要
     */
    public static function getProgressSummaryForLesson($lessonId, $studentId)
    {
        $exercises = static::byLesson($lessonId)
            ->active()
            ->get();

        $total = $exercises->count();
        $completed = 0;
        $totalScore = 0;
        $maxPossibleScore = 0;

        foreach ($exercises as $exercise) {
            if ($exercise->isCompletedByStudent($studentId)) {
                $completed++;
            }
            $totalScore += $exercise->getBestScoreForStudent($studentId);
            $maxPossibleScore += $exercise->max_score;
        }

        return [
            'total_exercises' => $total,
            'completed_exercises' => $completed,
            'completion_percentage' => $total > 0 ? round(($completed / $total) * 100, 1) : 0,
            'total_score' => $totalScore,
            'max_possible_score' => $maxPossibleScore,
            'score_percentage' => $maxPossibleScore > 0 ? round(($totalScore / $maxPossibleScore) * 100, 1) : 0,
        ];
    }
}
