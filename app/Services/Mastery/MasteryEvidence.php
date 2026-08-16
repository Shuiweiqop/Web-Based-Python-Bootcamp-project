<?php

namespace App\Services\Mastery;

/**
 * One observation about one concept: "this student answered an item tagged with
 * concept X, and got it right/wrong".
 *
 * A plain immutable value object rather than an Eloquent model — evidence is
 * derived on the fly from submissions and never persisted, and keeping it free
 * of the ORM is what lets EvidenceCollector and BktEngine both be unit-tested
 * without a database.
 */
final class MasteryEvidence
{
    public function __construct(
        public readonly int $conceptId,
        public readonly bool $isCorrect,
        public readonly int $difficultyLevel,
        public readonly string $itemType,
        public readonly float $weight,
    ) {}
}
