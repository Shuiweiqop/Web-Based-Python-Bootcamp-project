<?php
// 2. app/Models/Question.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    // Helper methods
    public function getTypeNameAttribute()
    {
        return self::TYPES[$this->type] ?? 'Unknown';
    }

    public function isMcqAttribute()
    {
        return $this->type === self::TYPE_MCQ;
    }

    public function isCodingAttribute()
    {
        return $this->type === self::TYPE_CODING;
    }

    public function isTrueFalseAttribute()
    {
        return $this->type === self::TYPE_TRUE_FALSE;
    }

    public function isShortAnswerAttribute()
    {
        return $this->type === self::TYPE_SHORT_ANSWER;
    }

    public function getDifficultyNameAttribute()
    {
        $levels = [1 => 'Easy', 2 => 'Medium', 3 => 'Hard'];
        return $levels[$this->difficulty_level] ?? 'Unknown';
    }

    public function getCorrectOptions()
    {
        if ($this->type !== self::TYPE_MCQ) {
            return collect();
        }

        return $this->options()->where('is_correct', true)->get();
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
        // Simple string comparison (you might want to make this more sophisticated)
        return strtolower(trim($answer)) === strtolower(trim($this->correct_answer));
    }

    private function checkCodingAnswer($code)
    {
        // This would need actual code execution logic
        // For now, just return false - implement code execution service later
        return false;
    }
}
