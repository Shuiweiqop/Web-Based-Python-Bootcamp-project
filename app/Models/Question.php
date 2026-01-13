<?php
// app/Models/Question.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\SubmissionAnswer; // 确保导入 SubmissionAnswer 模型

class Question extends Model
{
    use HasFactory;

    protected $primaryKey = 'question_id';

    protected $fillable = [
        'test_id',
        'type',
        'question_text',
        'code_snippet',
        'correct_answer',
        'explanation',
        'points',
        'difficulty_level',
        'order',
        'metadata',
        'status'
    ];

    protected $casts = [
        'metadata' => 'array',
        'points' => 'integer',
        'difficulty_level' => 'integer',
        'order' => 'integer'
    ];

    const TYPE_MCQ = 'mcq';
    const TYPE_CODING = 'coding';
    const TYPE_TRUE_FALSE = 'true_false';
    const TYPE_SHORT_ANSWER = 'short_answer';

    const TYPES = [
        self::TYPE_MCQ => 'Multiple Choice',
        self::TYPE_CODING => 'Coding Exercise',
        self::TYPE_TRUE_FALSE => 'True/False',
        self::TYPE_SHORT_ANSWER => 'Short Answer'
    ];

    // Laravel Boot method for auto-setting order
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($question) {
            // 确保 order 有值
            if (!$question->order) {
                $maxOrder = static::where('test_id', $question->test_id)->max('order');
                $question->order = ($maxOrder ?? 0) + 1;
            }
        });
    }

    // Relationships
    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class, 'test_id', 'test_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(QuestionOption::class, 'question_id', 'question_id')
            ->orderBy('order');
    }

    public function submissionAnswers(): HasMany
    {
        return $this->hasMany(SubmissionAnswer::class, 'question_id', 'question_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByDifficulty($query, $level)
    {
        return $query->where('difficulty_level', $level);
    }

    public function scopeForTest($query, $testId)
    {
        return $query->where('test_id', $testId)->orderBy('order');
    }

    // Accessors - 使用新的 Laravel 语法
    public function getTypeNameAttribute()
    {
        return self::TYPES[$this->type] ?? 'Unknown';
    }

    public function getDifficultyNameAttribute()
    {
        $levels = [1 => 'Easy', 2 => 'Medium', 3 => 'Hard'];
        return $levels[$this->difficulty_level] ?? 'Unknown';
    }

    // Boolean checks
    public function getIsMcqAttribute()
    {
        return $this->type === self::TYPE_MCQ;
    }

    public function getIsCodingAttribute()
    {
        return $this->type === self::TYPE_CODING;
    }

    public function getIsTrueFalseAttribute()
    {
        return $this->type === self::TYPE_TRUE_FALSE;
    }

    public function getIsShortAnswerAttribute()
    {
        return $this->type === self::TYPE_SHORT_ANSWER;
    }

    // Helper methods
    public function getCorrectOptions()
    {
        if ($this->type !== self::TYPE_MCQ) {
            return collect();
        }

        return $this->options()->where('is_correct', true)->get();
    }

    public function getTotalOptionsCount()
    {
        return $this->options()->count();
    }

    public function checkAnswer($userAnswer)
    {
        switch ($this->type) {
            case self::TYPE_MCQ:
                return $this->checkMcqAnswer($userAnswer);
            case self::TYPE_TRUE_FALSE:
                return $this->checkTrueFalseAnswer($userAnswer);
            case self::TYPE_SHORT_ANSWER:
                return $this->checkShortAnswer($userAnswer);
            case self::TYPE_CODING:
                return $this->checkCodingAnswer($userAnswer);
            default:
                return false;
        }
    }

    private function checkMcqAnswer($selectedOptions)
    {
        if (!is_array($selectedOptions)) {
            return false;
        }

        $correctOptions = $this->getCorrectOptions()->pluck('option_id')->toArray();
        sort($correctOptions);
        sort($selectedOptions);

        return $correctOptions === $selectedOptions;
    }

    private function checkTrueFalseAnswer($answer)
    {
        return strtolower(trim($answer)) === strtolower(trim($this->correct_answer));
    }

    private function checkShortAnswer($answer)
    {
        // Simple string comparison - 可以后续改进为更复杂的匹配
        return strtolower(trim($answer)) === strtolower(trim($this->correct_answer));
    }

    private function checkCodingAnswer($code)
    {
        // 编程题的答案检查需要代码执行服务
        // 目前返回 false，等待实现代码执行功能
        return false;
    }

    // Validation helper
    public function hasValidAnswer()
    {
        switch ($this->type) {
            case self::TYPE_MCQ:
                return $this->options()->where('is_correct', true)->exists();
            case self::TYPE_TRUE_FALSE:
                return in_array(strtolower($this->correct_answer), ['true', 'false']);
            case self::TYPE_SHORT_ANSWER:
            case self::TYPE_CODING:
                return !empty(trim($this->correct_answer));
            default:
                return false;
        }
    }

    // 获取题目的配置摘要
    public function getConfigSummary()
    {
        $summary = [
            'type' => $this->type_name,
            'points' => $this->points,
            'difficulty' => $this->difficulty_name,
            'status' => $this->status,
        ];

        if ($this->type === self::TYPE_MCQ) {
            $summary['options_count'] = $this->getTotalOptionsCount();
            $summary['correct_options'] = $this->getCorrectOptions()->count();
        }

        if ($this->metadata && is_array($this->metadata)) {
            $summary['metadata'] = $this->metadata;
        }

        return $summary;
    }

    // 软删除支持 (如果需要)
    // use SoftDeletes;
    // protected $dates = ['deleted_at'];
}
