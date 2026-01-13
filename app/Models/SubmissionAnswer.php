<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionAnswer extends Model
{
    use HasFactory;

    protected $table = 'submission_answers';
    protected $primaryKey = 'answer_id';

    protected $fillable = [
        'submission_id',
        'question_id',
        'answer_text',
        'selected_options',
        'code_answer',
        'execution_output',
        'is_correct',
        'points_earned',
        'feedback',
        'answered_at',
        'metadata'
    ];

    protected $casts = [
        'selected_options' => 'array',
        'is_correct' => 'boolean',
        'points_earned' => 'decimal:2',
        'answered_at' => 'datetime',
        'metadata' => 'array'
    ];

    // Relationships
    public function submission(): BelongsTo
    {
        return $this->belongsTo(TestSubmission::class, 'submission_id', 'submission_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id', 'question_id');
    }

    // Scopes
    public function scopeCorrect($query)
    {
        return $query->where('is_correct', true);
    }

    public function scopeIncorrect($query)
    {
        return $query->where('is_correct', false);
    }

    public function scopeForSubmission($query, $submissionId)
    {
        return $query->where('submission_id', $submissionId);
    }

    public function scopeForQuestion($query, $questionId)
    {
        return $query->where('question_id', $questionId);
    }
}
