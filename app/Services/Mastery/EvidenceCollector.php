<?php

namespace App\Services\Mastery;

use App\Models\ExerciseSubmission;
use App\Models\TestSubmission;
use Illuminate\Support\Collection;

/**
 * Turns a submission into a flat list of MasteryEvidence — one entry per
 * (answered item x tagged concept).
 *
 * Reads only; never writes and never touches the BKT maths. Splitting this out
 * from ConceptMasteryService keeps "where does evidence come from" separate
 * from "how does evidence change the model", so each can be tested alone.
 */
class EvidenceCollector
{
    /**
     * Interactive exercises store difficulty as a label, questions store 1/2/3.
     * Mapped here so BktEngine only ever deals with the numeric scale.
     */
    private const EXERCISE_DIFFICULTY_MAP = [
        'beginner' => 1,
        'easy' => 1,
        'intermediate' => 2,
        'medium' => 2,
        'advanced' => 3,
        'hard' => 3,
        'expert' => 3,
    ];

    /**
     * Evidence from a graded test submission.
     *
     * Answers with a null is_correct are skipped: those are ungraded (a coding
     * answer awaiting execution, say), and treating "not yet graded" as "wrong"
     * would push mastery down for work the student may well have got right.
     *
     * @return Collection<int, MasteryEvidence>
     */
    public function fromTestSubmission(TestSubmission $submission): Collection
    {
        $answers = $submission->answers()
            ->whereNotNull('is_correct')
            ->with('question.concepts')
            ->get();

        $evidence = collect();

        foreach ($answers as $answer) {
            $question = $answer->question;

            if (! $question) {
                continue;
            }

            foreach ($question->concepts as $concept) {
                $evidence->push(new MasteryEvidence(
                    conceptId: $concept->concept_id,
                    isCorrect: (bool) $answer->is_correct,
                    difficultyLevel: $this->normalizeQuestionDifficulty($question->difficulty_level),
                    itemType: (string) $question->type,
                    weight: (float) ($concept->pivot->weight ?? 1.0),
                ));
            }
        }

        return $evidence;
    }

    /**
     * Evidence from an interactive exercise submission.
     *
     * An exercise yields one pass/fail signal rather than per-question answers,
     * so correctness is the score percentage against the pass mark. Exercises
     * are scored leniently by design, so this is weaker evidence than a test
     * answer — hence the configurable weight multiplier applied to each concept.
     *
     * @return Collection<int, MasteryEvidence>
     */
    public function fromExerciseSubmission(ExerciseSubmission $submission): Collection
    {
        $exercise = $submission->exercise;

        if (! $exercise) {
            return collect();
        }

        $passMark = (float) config('mastery.exercise_pass_percentage', 70.0);
        $isCorrect = (float) $submission->percentage >= $passMark;
        $multiplier = (float) config('mastery.exercise_evidence_weight', 0.7);

        $evidence = collect();

        foreach ($exercise->concepts as $concept) {
            $evidence->push(new MasteryEvidence(
                conceptId: $concept->concept_id,
                isCorrect: $isCorrect,
                difficultyLevel: $this->normalizeExerciseDifficulty($exercise->difficulty),
                itemType: 'exercise',
                weight: (float) ($concept->pivot->weight ?? 1.0) * $multiplier,
            ));
        }

        return $evidence;
    }

    /**
     * Clamp a question's difficulty into the 1..3 scale BktEngine expects.
     * Legacy rows can hold 0 or an out-of-range value; those fall back to medium.
     */
    private function normalizeQuestionDifficulty(mixed $level): int
    {
        $level = (int) $level;

        return ($level >= 1 && $level <= 3) ? $level : 2;
    }

    private function normalizeExerciseDifficulty(?string $difficulty): int
    {
        if ($difficulty === null) {
            return 2;
        }

        return self::EXERCISE_DIFFICULTY_MAP[strtolower(trim($difficulty))] ?? 2;
    }
}
