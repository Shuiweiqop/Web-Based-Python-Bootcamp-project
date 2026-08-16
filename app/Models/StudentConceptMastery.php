<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One student's current mastery estimate for one concept.
 *
 * Written only by App\Services\Mastery\ConceptMasteryService, inside a
 * transaction with a row lock — the same discipline the points economy uses.
 * Never mutate mastery from a controller.
 */
class StudentConceptMastery extends Model
{
    use HasFactory;

    protected $table = 'student_concept_mastery';

    protected $primaryKey = 'mastery_id';

    protected $fillable = [
        'student_id',
        'concept_id',
        'mastery',
        'confidence',
        'attempts',
        'correct',
        'initial_mastery',
        'last_evidence_at',
    ];

    protected $casts = [
        'mastery' => 'float',
        'confidence' => 'float',
        'initial_mastery' => 'float',
        'attempts' => 'integer',
        'correct' => 'integer',
        'last_evidence_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class, 'student_id', 'student_id');
    }

    public function concept(): BelongsTo
    {
        return $this->belongsTo(Concept::class, 'concept_id', 'concept_id');
    }

    /**
     * Mastery gained since the placement baseline.
     *
     * Null when no baseline was captured — that is "unknown", not "no gain",
     * and callers must render it differently from 0.0.
     */
    public function getGainAttribute(): ?float
    {
        if ($this->initial_mastery === null) {
            return null;
        }

        return round($this->mastery - $this->initial_mastery, 4);
    }

    /**
     * Enough evidence for this estimate to be worth showing a user?
     */
    public function isReportable(): bool
    {
        return $this->confidence >= (float) config('mastery.min_confidence_to_report');
    }

    public function isWeak(): bool
    {
        return $this->isReportable()
            && $this->mastery < (float) config('mastery.weak_concept_threshold');
    }

    public function isMastered(): bool
    {
        return $this->isReportable()
            && $this->mastery >= (float) config('mastery.mastered_threshold');
    }

    /** Concepts backed by enough evidence to report on. */
    public function scopeReportable($query)
    {
        return $query->where('confidence', '>=', (float) config('mastery.min_confidence_to_report'));
    }

    /** Weak concepts, weakest first — the queue for adaptive intervention. */
    public function scopeWeak($query)
    {
        return $query->reportable()
            ->where('mastery', '<', (float) config('mastery.weak_concept_threshold'))
            ->orderBy('mastery');
    }

    public function scopeForStudent($query, int $studentId)
    {
        return $query->where('student_id', $studentId);
    }
}
