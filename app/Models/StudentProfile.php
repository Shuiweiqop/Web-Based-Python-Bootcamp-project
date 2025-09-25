<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\TestSubmission;

class StudentProfile extends Model
{
    use HasFactory;

    protected $table = 'student_profiles';
    protected $primaryKey = 'student_id';
    public $incrementing = true;
    protected $keyType = 'int';

    // 保持字段名和 DB 一致（使用 user_Id）
    protected $fillable = [
        'user_Id',
        'current_points',
        'total_lessons_completed',
        'total_tests_taken',
        'average_score',
        'streak_days',
        'last_activity_date',
    ];

    // 使用属性形式定义 casts
    protected $casts = [
        'current_points' => 'integer',
        'total_lessons_completed' => 'integer',
        'total_tests_taken' => 'integer',
        'average_score' => 'decimal:2',
        'streak_days' => 'integer',
        'last_activity_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /* -------------------------
       关系定义 (Relationships)
       ------------------------- */

    /**
     * Student Profile belongs to User.
     * 注意：这里把 FK 显式写为 'user_Id' -> User PK 'user_Id'
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_Id', 'user_Id');
    }

    /**
     * Many-to-Many: Student -> Lessons through lesson_registrations pivot.
     */
    public function lessons(): BelongsToMany
    {
        return $this->belongsToMany(
            Lesson::class,
            'lesson_registrations',
            'student_id',
            'lesson_id'
        )->withPivot(['registration_id', 'registration_status', 'created_at', 'updated_at'])
            ->withTimestamps()
            ->wherePivot('registration_status', 'active');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(LessonRegistration::class, 'student_id', 'student_id');
    }

    /**
     * Get all test submissions for this student
     */
    public function testSubmissions(): HasMany
    {
        return $this->hasMany(TestSubmission::class, 'student_id', 'student_id');
    }

    /* -------------------------
       基础积分和学习管理方法
       ------------------------- */

    public function addPoints(int $points): self
    {
        $this->increment('current_points', $points);
        $this->updateLastActivity();
        $this->refresh();
        return $this;
    }

    public function deductPoints(int $points): self
    {
        $this->current_points = max(0, $this->current_points - $points);
        $this->save();
        $this->refresh();
        return $this;
    }

    public function completedLesson(): self
    {
        $this->increment('total_lessons_completed');
        $this->updateLastActivity();
        $this->refresh();
        return $this;
    }

    public function updateStreak(): self
    {
        $today = now()->toDateString();
        $lastActivity = $this->last_activity_date?->toDateString();

        if ($lastActivity === $today) {
            return $this;
        } elseif ($lastActivity === now()->subDay()->toDateString()) {
            $this->increment('streak_days');
        } else {
            $this->streak_days = 1;
            $this->save();
        }

        $this->updateLastActivity();
        $this->refresh();
        return $this;
    }

    private function updateLastActivity(): void
    {
        $this->last_activity_date = now()->toDateString();
        $this->save();
    }

    /* -------------------------
       测验系统核心方法
       ------------------------- */

    /**
     * 更新测验统计数据
     */
    public function updateTestStats(): self
    {
        $submissions = $this->testSubmissions()->whereIn('status', ['submitted', 'timeout']);

        $this->update([
            'total_tests_taken' => $submissions->count(),
            'average_score' => $submissions->avg('score') ?? 0.00
        ]);

        return $this;
    }

    /**
     * 完成测验后更新学生记录
     */
    public function completedTest(float $percentageScore): self
    {
        $previousCount = (int) $this->total_tests_taken;
        $previousAvg = (float) $this->average_score;

        $newCount = $previousCount + 1;
        $newTotalScore = ($previousAvg * $previousCount) + $percentageScore;
        $this->total_tests_taken = $newCount;
        $this->average_score = round($newTotalScore / $newCount, 2);

        $this->updateLastActivity();
        $this->save();
        $this->refresh();
        return $this;
    }

    /**
     * 处理测验完成的完整流程（主要方法）
     */
    public function processTestCompletion($testSubmission): self
    {
        if (!$testSubmission || !$testSubmission->is_completed) {
            return $this;
        }

        // 更新测验统计
        $this->completedTest($testSubmission->score);

        // 计算并添加奖励积分
        $averageDifficulty = $testSubmission->test->questions()
            ->avg('difficulty_level') ?? 1;
        $rewardPoints = $this->calculateTestRewardPoints(
            $testSubmission->score,
            (int) round($averageDifficulty)
        );
        $this->addPoints($rewardPoints);

        // 更新连续天数
        $this->updateStreak();

        return $this;
    }

    /* -------------------------
       测验查询和检查方法
       ------------------------- */

    /**
     * 检查学生是否可以参加特定测验
     */
    public function canTakeTest($testId): bool
    {
        $test = \App\Models\Test::find($testId);
        if (!$test) return false;

        return $test->canStudentTakeTest($this->student_id);
    }

    /**
     * 获取学生在特定测验中的尝试次数
     */
    public function getTestAttemptsForTest($testId): int
    {
        return $this->testSubmissions()
            ->where('test_id', $testId)
            ->whereIn('status', ['submitted', 'timeout'])
            ->count();
    }

    /**
     * 获取学生在特定测验中的最高分
     */
    public function getBestScoreForTest($testId): ?float
    {
        return $this->testSubmissions()
            ->where('test_id', $testId)
            ->whereIn('status', ['submitted', 'timeout'])
            ->max('score');
    }

    /**
     * 获取最近的测验提交记录
     */
    public function getLatestTestSubmission()
    {
        return $this->testSubmissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->latest('submitted_at')
            ->first();
    }

    /**
     * 检查是否有正在进行的测验
     */
    public function hasInProgressTest(): bool
    {
        return $this->testSubmissions()
            ->where('status', 'in_progress')
            ->exists();
    }

    /**
     * 获取当前正在进行的测验提交
     */
    public function getCurrentTestSubmission()
    {
        return $this->testSubmissions()
            ->where('status', 'in_progress')
            ->latest('started_at')
            ->first();
    }

    /* -------------------------
       积分和奖励计算
       ------------------------- */

    /**
     * 根据测验分数和难度计算奖励积分
     */
    public function calculateTestRewardPoints(float $score, int $testDifficulty = 1): int
    {
        // 基础积分（根据分数）
        $basePoints = match (true) {
            $score >= 95 => 60,  // 优秀
            $score >= 90 => 50,  // 很好
            $score >= 80 => 40,  // 良好
            $score >= 70 => 30,  // 及格
            $score >= 60 => 20,  // 接近及格
            default => 10,       // 参与奖励
        };

        // 难度系数
        $difficultyMultiplier = match ($testDifficulty) {
            3 => 1.5,  // 困难
            2 => 1.2,  // 中等
            default => 1.0, // 简单
        };

        // 连续天数奖励（额外奖励）
        $streakBonus = match (true) {
            $this->streak_days >= 7 => 1.2,
            $this->streak_days >= 3 => 1.1,
            default => 1.0,
        };

        return (int) round($basePoints * $difficultyMultiplier * $streakBonus);
    }

    /* -------------------------
       数据统计和分析
       ------------------------- */

    /**
     * 获取测验历史记录
     */
    public function getTestHistory(int $limit = 10)
    {
        return $this->testSubmissions()
            ->with(['test'])
            ->whereIn('status', ['submitted', 'timeout'])
            ->latest('submitted_at')
            ->limit($limit)
            ->get();
    }

    /**
     * 获取详细的测验进度统计
     */
    public function getTestProgressStats(): array
    {
        $submissions = $this->testSubmissions()->whereIn('status', ['submitted', 'timeout']);
        $totalSubmissions = $submissions->count();

        if ($totalSubmissions === 0) {
            return [
                'total_tests' => 0,
                'passed_tests' => 0,
                'failed_tests' => 0,
                'average_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'recent_improvement' => 0,
                'pass_rate' => 0,
                'total_time_spent' => 0,
            ];
        }

        $passedTests = $submissions->where('score', '>=', 70)->count();
        $scores = $submissions->pluck('score');

        return [
            'total_tests' => $totalSubmissions,
            'passed_tests' => $passedTests,
            'failed_tests' => $totalSubmissions - $passedTests,
            'average_score' => round($scores->avg(), 2),
            'highest_score' => $scores->max(),
            'lowest_score' => $scores->min(),
            'recent_improvement' => $this->calculateRecentImprovement(),
            'pass_rate' => round(($passedTests / $totalSubmissions) * 100, 2),
            'total_time_spent' => $this->getTotalTestTimeSpent(),
        ];
    }

    /**
     * 计算最近的进步情况
     */
    private function calculateRecentImprovement(): float
    {
        $recentSubmissions = $this->testSubmissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->latest('submitted_at')
            ->limit(6)
            ->pluck('score');

        if ($recentSubmissions->count() < 4) return 0;

        $recent = $recentSubmissions->take(3)->avg();
        $earlier = $recentSubmissions->skip(3)->avg();

        return round($recent - $earlier, 2);
    }

    /**
     * 获取测验总耗时（分钟）
     */
    private function getTotalTestTimeSpent(): int
    {
        return $this->testSubmissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->sum('time_spent') ?? 0;
    }

    /**
     * 获取按题目类型的统计
     */
    public function getQuestionTypeStats(): array
    {
        $submissions = $this->testSubmissions()
            ->with(['answers.question'])
            ->whereIn('status', ['submitted', 'timeout'])
            ->get();

        $stats = [
            'mcq' => ['total' => 0, 'correct' => 0],
            'coding' => ['total' => 0, 'correct' => 0],
            'true_false' => ['total' => 0, 'correct' => 0],
            'short_answer' => ['total' => 0, 'correct' => 0],
        ];

        foreach ($submissions as $submission) {
            foreach ($submission->answers as $answer) {
                $type = $answer->question->type;
                if (isset($stats[$type])) {
                    $stats[$type]['total']++;
                    if ($answer->is_correct) {
                        $stats[$type]['correct']++;
                    }
                }
            }
        }

        // 计算正确率
        foreach ($stats as $type => &$data) {
            $data['accuracy'] = $data['total'] > 0
                ? round(($data['correct'] / $data['total']) * 100, 2)
                : 0;
        }

        return $stats;
    }

    /* -------------------------
       访问器 (Accessors) 和属性
       ------------------------- */

    public function getPointsLevelAttribute(): string
    {
        return match (true) {
            $this->current_points >= 10000 => 'Expert',
            $this->current_points >= 5000 => 'Advanced',
            $this->current_points >= 2000 => 'Intermediate',
            $this->current_points >= 500 => 'Beginner',
            default => 'Newbie',
        };
    }

    public function getCompletionPercentageAttribute(): int
    {
        $totalLessons = 100; // 可以从配置或数据库获取
        return min(100, (int) round(($this->total_lessons_completed / max(1, $totalLessons)) * 100));
    }

    public function getStreakStatusAttribute(): string
    {
        return match (true) {
            $this->streak_days >= 30 => 'On Fire! 🔥',
            $this->streak_days >= 7 => 'Great Streak! ⚡',
            $this->streak_days >= 3 => 'Building Momentum! 💪',
            $this->streak_days > 0 => 'Getting Started! 🌟',
            default => 'Ready to Start! 🚀',
        };
    }

    public function getTestPerformanceLevelAttribute(): string
    {
        $avgScore = (float) $this->average_score;
        return match (true) {
            $avgScore >= 90 => 'Excellent',
            $avgScore >= 80 => 'Very Good',
            $avgScore >= 70 => 'Good',
            $avgScore >= 60 => 'Fair',
            $avgScore > 0 => 'Needs Improvement',
            default => 'Not Started',
        };
    }

    /**
     * 检查今天是否活跃
     */
    public function isActiveToday(): bool
    {
        return $this->last_activity_date?->isToday() ?? false;
    }

    /* -------------------------
       查询作用域 (Scopes)
       ------------------------- */

    public function scopeHighAchievers($query)
    {
        return $query->where('current_points', '>=', 5000);
    }

    public function scopeActiveStudents($query)
    {
        return $query->where('last_activity_date', '>=', now()->subDays(7));
    }

    public function scopeGoodStreak($query)
    {
        return $query->where('streak_days', '>=', 7);
    }

    public function scopeTopPerformers($query, int $limit = 10)
    {
        return $query->orderBy('average_score', 'desc')
            ->orderBy('current_points', 'desc')
            ->limit($limit);
    }

    public function scopeTestTakers($query)
    {
        return $query->where('total_tests_taken', '>', 0);
    }

    public function scopeHighScorers($query, float $minScore = 80.0)
    {
        return $query->where('average_score', '>=', $minScore);
    }

    public function scopeRecentlyActive($query, int $days = 3)
    {
        return $query->where('last_activity_date', '>=', now()->subDays($days));
    }
}
