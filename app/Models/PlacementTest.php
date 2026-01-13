<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class PlacementTest extends Test
{
    /**
     * ✅ 明确指定使用 tests 表（而不是 placement_tests）
     */
    protected $table = 'tests';

    /**
     * ✅ 使用父类的主键
     */
    protected $primaryKey = 'test_id';

    /**
     * 设置默认的 test_type 和其他属性
     */
    protected $attributes = [
        'test_type' => 'placement',
        'max_attempts' => 1,  // 评估测试通常只允许一次
        'passing_score' => 0, // 评估测试没有及格线
        'status' => 'active',
        'order' => 0,
        'shuffle_questions' => true, // 评估测试建议打乱
        'show_results_immediately' => false, // 不立即显示结果
        'allow_review' => false, // 不允许复习
    ];

    /**
     * 全局作用域：自动过滤只查 placement 类型
     */
    protected static function booted()
    {
        static::addGlobalScope('placement', function (Builder $builder) {
            $builder->where('test_type', 'placement');
        });

        // 创建时自动设置 test_type
        static::creating(function ($model) {
            if (!$model->test_type) {
                $model->test_type = 'placement';
            }
        });
    }

    /**
     * lesson_id 对 PlacementTest 来说永远是 null
     */
    public function getLessonIdAttribute($value)
    {
        return null;
    }

    /**
     * 覆盖父类方法：Placement Test 不需要检查 lesson
     */
    public function canStudentTakeTest(int $studentId): bool
    {
        // 检查是否已完成
        $completedSubmission = $this->submissions()
            ->where('student_id', $studentId)
            ->whereIn('status', ['submitted', 'timeout'])
            ->exists();

        // 从配置读取是否允许重考
        $allowRetake = config('recommendation.allow_placement_retake', false);

        if ($completedSubmission && !$allowRetake) {
            return false;
        }

        return true;
    }

    /**
     * 获取技能标签（Placement Test 专属）
     */
    public function getSkillWeights(): array
    {
        return $this->skill_tags ?? [];
    }

    /**
     * 计算学生的技能得分分布
     */
    public function calculateSkillScores(int $studentId): array
    {
        $submission = $this->submissions()
            ->where('student_id', $studentId)
            ->whereIn('status', ['submitted', 'timeout'])
            ->latest('submitted_at')
            ->first();

        if (!$submission) {
            return [];
        }

        // 根据答题情况计算各技能得分
        // 这里可以进一步实现你的技能评估逻辑
        return $submission->skill_scores ?? [];
    }

    /**
     * 不允许设置 lesson_id
     */
    public function setLessonIdAttribute($value)
    {
        // 忽略任何设置 lesson_id 的尝试
        return;
    }

    /**
     * 检查是否是默认的入学测试
     */
    public function isDefault(): bool
    {
        // 可以通过配置或数据库字段来标记默认测试
        return config('recommendation.default_placement_test_id') === $this->test_id;
    }

    /**
     * 获取推荐路径的学生数量
     */
    public function getRecommendedStudentsCount(): int
    {
        return $this->submissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->whereNotNull('recommended_path_id')
            ->distinct('student_id')
            ->count('student_id');
    }

    /**
     * 获取接受推荐的学生数量
     */
    public function getAcceptedRecommendationsCount(): int
    {
        return $this->submissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->whereHas('studentPath', function ($query) {
                $query->whereIn('status', ['active', 'paused', 'completed']);
            })
            ->distinct('student_id')
            ->count('student_id');
    }
}
