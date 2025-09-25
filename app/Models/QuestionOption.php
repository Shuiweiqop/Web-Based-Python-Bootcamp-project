<?php
// 3. app/Models/QuestionOption.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionOption extends Model
{
    use HasFactory;

    protected $primaryKey = 'option_id';

    protected $fillable = [
        'question_id',
        'option_label',
        'option_text',
        'is_correct',
        'order'
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'order' => 'integer'
    ];

    // Relationships
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

    public function scopeForQuestion($query, $questionId)
    {
        return $query->where('question_id', $questionId)->orderBy('order');
    }
}
