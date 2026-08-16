<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A single Python skill that questions/exercises are tagged with and that a
 * student holds a mastery estimate for.
 */
class Concept extends Model
{
    use HasFactory;

    protected $table = 'concepts';

    protected $primaryKey = 'concept_id';

    protected $fillable = [
        'slug',
        'name',
        'description',
        'parent_id',
        'display_order',
    ];

    protected $casts = [
        'display_order' => 'integer',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id', 'concept_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id', 'concept_id');
    }

    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(
            Question::class,
            'concept_question',
            'concept_id',
            'question_id'
        )->withPivot('weight')->withTimestamps();
    }

    public function exercises(): BelongsToMany
    {
        return $this->belongsToMany(
            InteractiveExercise::class,
            'concept_exercise',
            'concept_id',
            'exercise_id'
        )->withPivot('weight')->withTimestamps();
    }

    public function masteryRecords(): HasMany
    {
        return $this->hasMany(StudentConceptMastery::class, 'concept_id', 'concept_id');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('name');
    }
}
