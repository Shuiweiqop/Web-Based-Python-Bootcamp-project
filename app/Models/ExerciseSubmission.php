<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class ExerciseSubmission extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'exercise_submissions';

    /**
     * The primary key associated with the table.
     */
    protected $primaryKey = 'submission_id';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'exercise_id',
        'student_id',
        'score',
        'time_taken',
        'completed',
        'answer_data',
        'submitted_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'score' => 'integer',
        'time_taken' => 'integer',
        'completed' => 'boolean',
        'answer_data' => 'array', // 自动转换 JSON
        'submitted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        // 如果不想暴露答案数据，可以添加：
        // 'answer_data',
    ];

    /**
     * Boot the model and add global scopes/events.
     */
    protected static function boot()
    {
        parent::boot();

        // 自动设置 submitted_at 时间
        static::creating(function ($submission) {
            if (!$submission->submitted_at) {
                $submission->submitted_at = now();
            }
        });

        // 创建后触发课程完成检查
        static::created(function ($submission) {
            $submission->checkLessonCompletion();
        });
    }

    // ==================== Relationships ====================

    /**
     * 所属的 Exercise
     */
    public function exercise()
    {
        return $this->belongsTo(InteractiveExercise::class, 'exercise_id', 'exercise_id');
    }

    /**
     * 所属的 Student
     */
    public function student()
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }

    /**
     * 通过 exercise 获取 lesson
     */
    public function lesson()
    {
        return $this->hasOneThrough(
            Lesson::class,
            InteractiveExercise::class,
            'exercise_id', // exercise 的主键
            'lesson_id',   // lesson 的主键
            'exercise_id', // submission 的外键
            'lesson_id'    // exercise 的外键
        );
    }

    // ==================== Scopes ====================

    /**
     * 只查询已完成的提交
     */
    public function scopeCompleted($query)
    {
        return $query->where('completed', true);
    }

    /**
     * 按分数排序（降序）
     */
    public function scopeOrderByScore($query, $direction = 'desc')
    {
        return $query->orderBy('score', $direction);
    }

    /**
     * 查询特定学生的提交
     */
    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * 查询特定 exercise 的提交
     */
    public function scopeForExercise($query, $exerciseId)
    {
        return $query->where('exercise_id', $exerciseId);
    }

    /**
     * 获取最近的提交
     */
    public function scopeRecent($query, $limit = 10)
    {
        return $query->orderBy('submitted_at', 'desc')->limit($limit);
    }

    /**
     * 🔥 新增：只查询 Coding Exercise 的提交
     */
    public function scopeCodingOnly($query)
    {
        return $query->whereHas('exercise', function ($q) {
            $q->where('exercise_type', 'coding');
        });
    }

    /**
     * 🔥 新增：查询特定编程语言的提交
     */
    public function scopeByLanguage($query, $language)
    {
        return $query->whereJsonContains('answer_data->language', $language);
    }

    // ==================== Accessors & Mutators ====================

    /**
     * 获取格式化的提交时间
     */
    public function getFormattedSubmittedAtAttribute()
    {
        return $this->submitted_at->format('M d, Y h:i A');
    }

    /**
     * 获取相对时间 (e.g., "2 hours ago")
     */
    public function getSubmittedAtHumanAttribute()
    {
        return $this->submitted_at->diffForHumans();
    }

    /**
     * 获取格式化的用时
     */
    public function getFormattedTimeAttribute()
    {
        if (!$this->time_taken) {
            return 'N/A';
        }

        $minutes = floor($this->time_taken / 60);
        $seconds = $this->time_taken % 60;

        if ($minutes > 0) {
            return "{$minutes}m {$seconds}s";
        }

        return "{$seconds}s";
    }

    /**
     * 获取百分比分数
     */
    public function getPercentageAttribute()
    {
        if (!$this->exercise || $this->exercise->max_score == 0) {
            return 0;
        }

        return round(($this->score / $this->exercise->max_score) * 100, 1);
    }

    /**
     * 获取评级 (A, B, C, D, F)
     */
    public function getGradeAttribute()
    {
        $percentage = $this->percentage;

        if ($percentage >= 90) return 'A';
        if ($percentage >= 80) return 'B';
        if ($percentage >= 70) return 'C';
        if ($percentage >= 60) return 'D';
        return 'F';
    }

    /**
     * 是否及格（70%）
     */
    public function getIsPassingAttribute()
    {
        return $this->percentage >= 70;
    }

    // ==================== 🔥 Coding Exercise Specific Accessors ====================

    /**
     * 🔥 获取提交的代码
     */
    public function getSubmittedCodeAttribute()
    {
        return $this->answer_data['code'] ?? null;
    }

    /**
     * 🔥 获取使用的编程语言
     */
    public function getLanguageAttribute()
    {
        return $this->answer_data['language'] ?? 'unknown';
    }

    /**
     * 🔥 获取测试结果
     */
    public function getTestResultsAttribute()
    {
        return $this->answer_data['test_results'] ?? [];
    }

    /**
     * 🔥 获取通过的测试用例数量
     */
    public function getPassedTestsCountAttribute()
    {
        return $this->answer_data['passed_count'] ?? 0;
    }

    /**
     * 🔥 获取总测试用例数量
     */
    public function getTotalTestsCountAttribute()
    {
        return $this->answer_data['total_count'] ?? 0;
    }

    /**
     * 🔥 获取测试通过率（百分比）
     */
    public function getTestPassRateAttribute()
    {
        if ($this->total_tests_count == 0) {
            return 0;
        }
        return round(($this->passed_tests_count / $this->total_tests_count) * 100, 1);
    }

    /**
     * 🔥 是否所有测试都通过
     */
    public function getAllTestsPassedAttribute()
    {
        return $this->passed_tests_count > 0 &&
            $this->passed_tests_count === $this->total_tests_count;
    }

    /**
     * 🔥 是否是编程题提交
     */
    public function getIsCodingSubmissionAttribute()
    {
        return isset($this->answer_data['code']) && isset($this->answer_data['language']);
    }

    /**
     * 🔥 获取代码行数
     */
    public function getCodeLinesCountAttribute()
    {
        if (!$this->submitted_code) {
            return 0;
        }
        return count(array_filter(explode("\n", $this->submitted_code), function ($line) {
            return trim($line) !== '';
        }));
    }

    // ==================== Helper Methods ====================

    /**
     * 检查是否是该学生在此 exercise 的最佳成绩
     */
    public function isBestScore(): bool
    {
        $bestScore = static::where('exercise_id', $this->exercise_id)
            ->where('student_id', $this->student_id)
            ->max('score');

        return $this->score == $bestScore;
    }

    /**
     * 获取该学生在此 exercise 的最佳提交
     */
    public function getBestSubmission()
    {
        return static::where('exercise_id', $this->exercise_id)
            ->where('student_id', $this->student_id)
            ->orderByScore()
            ->first();
    }

    /**
     * 获取该学生在此 exercise 的尝试次数
     */
    public function getAttemptNumber(): int
    {
        return static::where('exercise_id', $this->exercise_id)
            ->where('student_id', $this->student_id)
            ->where('submitted_at', '<=', $this->submitted_at)
            ->count();
    }

    /**
     * 触发课程完成检查
     */
    public function checkLessonCompletion()
    {
        try {
            $exercise = $this->exercise;
            if (!$exercise) return;

            $lesson = $exercise->lesson;
            if (!$lesson) return;

            $registration = LessonRegistration::where('student_id', $this->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            if ($registration) {
                // 如果存在 LessonCompletionService，使用它
                if (class_exists('\App\Services\LessonCompletionService')) {
                    \App\Services\LessonCompletionService::checkAndAward($registration);
                } else {
                    // 否则直接调用 Lesson 的方法
                    $lesson->checkAndAwardLessonCompletion($this->student_id);
                }
            }
        } catch (\Exception $e) {
            \Log::error('Failed to check lesson completion: ' . $e->getMessage());
        }
    }

    // ==================== 🔥 Coding Exercise Specific Methods ====================

    /**
     * 🔥 获取详细的测试结果摘要
     */
    public function getTestSummary(): array
    {
        if (!$this->is_coding_submission) {
            return [];
        }

        $results = $this->test_results;
        $passed = [];
        $failed = [];

        foreach ($results as $result) {
            if ($result['passed'] ?? false) {
                $passed[] = $result;
            } else {
                $failed[] = $result;
            }
        }

        return [
            'total' => count($results),
            'passed' => count($passed),
            'failed' => count($failed),
            'pass_rate' => $this->test_pass_rate,
            'all_passed' => $this->all_tests_passed,
            'passed_tests' => $passed,
            'failed_tests' => $failed,
        ];
    }

    /**
     * 🔥 获取代码执行错误（如果有）
     */
    public function getExecutionErrors(): ?array
    {
        if (!$this->is_coding_submission) {
            return null;
        }

        $errors = [];
        foreach ($this->test_results as $result) {
            if (!empty($result['error'])) {
                $errors[] = [
                    'test' => $result['test_number'] ?? $result['description'] ?? 'Unknown',
                    'error' => $result['error'],
                ];
            }
        }

        return !empty($errors) ? $errors : null;
    }

    /**
     * 🔥 比较两次提交的改进情况
     */
    public function compareWithPrevious(): ?array
    {
        $previous = static::where('exercise_id', $this->exercise_id)
            ->where('student_id', $this->student_id)
            ->where('submitted_at', '<', $this->submitted_at)
            ->orderBy('submitted_at', 'desc')
            ->first();

        if (!$previous) {
            return null;
        }

        return [
            'score_change' => $this->score - $previous->score,
            'percentage_change' => $this->percentage - $previous->percentage,
            'improved' => $this->score > $previous->score,
            'previous_score' => $previous->score,
            'current_score' => $this->score,
        ];
    }

    // ==================== Static Helper Methods ====================

    /**
     * 获取学生的最佳成绩（每个 exercise 一条）
     */
    public static function getBestScoresForStudent($studentId, $lessonId = null)
    {
        $query = static::select('exercise_id', \DB::raw('MAX(score) as best_score'))
            ->where('student_id', $studentId)
            ->groupBy('exercise_id');

        if ($lessonId) {
            $query->whereHas('exercise', function ($q) use ($lessonId) {
                $q->where('lesson_id', $lessonId);
            });
        }

        return $query->get();
    }

    /**
     * 获取 exercise 的平均分
     */
    public static function getAverageScoreForExercise($exerciseId)
    {
        return static::where('exercise_id', $exerciseId)
            ->avg('score');
    }

    /**
     * 获取学生的总提交次数
     */
    public static function getTotalSubmissionsForStudent($studentId)
    {
        return static::where('student_id', $studentId)->count();
    }

    /**
     * 获取学生完成的 exercise 数量
     */
    public static function getCompletedExercisesCount($studentId, $lessonId = null)
    {
        $query = static::where('student_id', $studentId)
            ->where('completed', true)
            ->select('exercise_id')
            ->distinct();

        if ($lessonId) {
            $query->whereHas('exercise', function ($q) use ($lessonId) {
                $q->where('lesson_id', $lessonId);
            });
        }

        return $query->count();
    }

    /**
     * 🔥 新增：获取编程语言使用统计
     */
    public static function getLanguageStats($studentId = null)
    {
        $query = static::codingOnly();

        if ($studentId) {
            $query->where('student_id', $studentId);
        }

        $submissions = $query->get();
        $stats = [];

        foreach ($submissions as $submission) {
            $lang = $submission->language;
            if (!isset($stats[$lang])) {
                $stats[$lang] = [
                    'count' => 0,
                    'avg_score' => 0,
                    'total_score' => 0,
                ];
            }
            $stats[$lang]['count']++;
            $stats[$lang]['total_score'] += $submission->score;
        }

        foreach ($stats as $lang => &$data) {
            $data['avg_score'] = round($data['total_score'] / $data['count'], 2);
        }

        return $stats;
    }

    /**
     * 🔥 新增：获取学生的编程进度统计
     */
    public static function getCodingProgress($studentId, $lessonId = null)
    {
        $query = static::codingOnly()
            ->where('student_id', $studentId);

        if ($lessonId) {
            $query->whereHas('exercise', function ($q) use ($lessonId) {
                $q->where('lesson_id', $lessonId);
            });
        }

        $submissions = $query->get();

        return [
            'total_submissions' => $submissions->count(),
            'completed_exercises' => $submissions->where('completed', true)->unique('exercise_id')->count(),
            'avg_score' => round($submissions->avg('score'), 2),
            'avg_test_pass_rate' => round($submissions->avg(function ($s) {
                return $s->test_pass_rate;
            }), 2),
            'total_lines_of_code' => $submissions->sum('code_lines_count'),
            'language_usage' => static::getLanguageStats($studentId),
        ];
    }

    /**
     * 🔥 新增：获取最常见的错误模式
     */
    public static function getCommonErrors($exerciseId, $limit = 5)
    {
        $submissions = static::where('exercise_id', $exerciseId)
            ->codingOnly()
            ->get();

        $errorFrequency = [];

        foreach ($submissions as $submission) {
            $errors = $submission->getExecutionErrors();
            if ($errors) {
                foreach ($errors as $error) {
                    $errorMsg = $error['error'];
                    if (!isset($errorFrequency[$errorMsg])) {
                        $errorFrequency[$errorMsg] = 0;
                    }
                    $errorFrequency[$errorMsg]++;
                }
            }
        }

        arsort($errorFrequency);
        return array_slice($errorFrequency, 0, $limit, true);
    }
}
