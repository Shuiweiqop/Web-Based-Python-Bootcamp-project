<?php

namespace App\Services\Mastery;

/**
 * Bayesian Knowledge Tracing (Corbett & Anderson, 1995).
 *
 * Maintains P(student knows concept) from a stream of right/wrong answers.
 *
 * Deliberately pure: no database, no request, no logging, no Eloquent. Every
 * input arrives as an argument and the only output is a float. That is what
 * makes the model unit-testable in isolation and reusable off the HTTP path —
 * the persistence lives in ConceptMasteryService.
 *
 * The model in two steps, per observed answer:
 *
 *   1. Evidence (Bayes). Given the answer, revise the estimate that the student
 *      ALREADY knew the concept, accounting for two ways the answer can lie:
 *        - slip  P(S): knew it, still got it wrong
 *        - guess P(G): didn't know it, still got it right
 *
 *   2. Learning. Add the chance the practice opportunity itself taught them:
 *        P(known after) = posterior + (1 - posterior) * P(T)
 *
 * Step 2 is why mastery can rise even on a wrong answer — attempting a problem
 * is a chance to learn from it. That is intended BKT behaviour, not a bug.
 */
final class BktEngine
{
    /**
     * @param  array  $config  The 'mastery' config array (see config/mastery.php).
     */
    public function __construct(private readonly array $config) {}

    /**
     * Build an engine from the application config.
     */
    public static function fromConfig(): self
    {
        return new self(config('mastery'));
    }

    /**
     * Revise a mastery estimate given one observed answer.
     *
     * @param  float  $prior  Current P(known), 0..1.
     * @param  bool  $isCorrect  Whether the student answered correctly.
     * @param  int  $difficultyLevel  1=Easy, 2=Medium, 3=Hard.
     * @param  string  $questionType  Question::TYPE_* value; drives P(guess).
     * @param  float  $weight  How central the concept is to this item (0..1).
     *                         A secondary concept moves less than the primary one.
     * @return float New P(known), clamped to the configured bounds.
     */
    public function update(
        float $prior,
        bool $isCorrect,
        int $difficultyLevel = 2,
        string $questionType = 'default',
        float $weight = 1.0
    ): float {
        $prior = $this->clampMastery($prior);
        $weight = max(0.0, min(1.0, $weight));

        // A zero-weight tag carries no information; leave the estimate alone.
        if ($weight === 0.0) {
            return $prior;
        }

        $pSlip = (float) $this->config['bkt']['p_slip'];
        $pTransit = (float) $this->config['bkt']['p_transit'];
        $pGuess = $this->effectiveGuessProbability($questionType, $difficultyLevel);

        $posterior = $this->applyEvidence($prior, $isCorrect, $pSlip, $pGuess);

        // Learning step: the attempt itself is a chance to acquire the concept.
        $updated = $posterior + (1.0 - $posterior) * $pTransit;

        // Partial credit for a secondary concept: interpolate between "no
        // evidence" (prior) and "full evidence" (updated).
        if ($weight < 1.0) {
            $updated = $prior + ($updated - $prior) * $weight;
        }

        return $this->clampMastery($updated);
    }

    /**
     * Step 1 — Bayes rule. P(knew it | we observed this answer).
     */
    private function applyEvidence(float $prior, bool $isCorrect, float $pSlip, float $pGuess): float
    {
        if ($isCorrect) {
            // Correct because they knew it and didn't slip, OR didn't know and guessed.
            $numerator = $prior * (1.0 - $pSlip);
            $evidence = $numerator + (1.0 - $prior) * $pGuess;
        } else {
            // Wrong because they knew it but slipped, OR didn't know and didn't guess.
            $numerator = $prior * $pSlip;
            $evidence = $numerator + (1.0 - $prior) * (1.0 - $pGuess);
        }

        // Guard the division: with degenerate parameters the evidence term can
        // reach 0, and a NaN here would silently poison every later update.
        if ($evidence <= 1e-9) {
            return $prior;
        }

        return $numerator / $evidence;
    }

    /**
     * P(guess) for this item: the question type sets the base rate, difficulty
     * scales it. Harder items are harder to fluke, so a correct answer on one
     * is stronger evidence of real mastery.
     */
    public function effectiveGuessProbability(string $questionType, int $difficultyLevel): float
    {
        $base = $this->config['p_guess'][$questionType]
            ?? $this->config['p_guess']['default'];

        $factor = $this->config['difficulty_guess_factor'][$difficultyLevel]
            ?? $this->config['difficulty_guess_factor'][2];

        return $this->clamp(
            (float) $base * (float) $factor,
            (float) $this->config['bounds']['min_guess'],
            (float) $this->config['bounds']['max_guess']
        );
    }

    /**
     * Evidence sufficiency for an estimate, from attempt count alone.
     *
     * Distinct from mastery: it answers "how much should we trust this number?".
     * Reported separately so the UI never calls a concept weak off one answer.
     */
    public function confidenceFor(int $attempts): float
    {
        if ($attempts <= 0) {
            return 0.0;
        }

        $halfLife = max(1, (int) $this->config['confidence_half_life_attempts']);

        return $this->clamp($attempts / ($attempts + $halfLife), 0.0, 1.0);
    }

    /**
     * The starting estimate for a concept with no evidence yet.
     */
    public function initialMastery(): float
    {
        return $this->clampMastery((float) $this->config['bkt']['p_init']);
    }

    private function clampMastery(float $value): float
    {
        // NAN/INF would propagate through every later update; reset to the prior-free default.
        if (! is_finite($value)) {
            return (float) $this->config['bkt']['p_init'];
        }

        return $this->clamp(
            $value,
            (float) $this->config['bounds']['min_mastery'],
            (float) $this->config['bounds']['max_mastery']
        );
    }

    private function clamp(float $value, float $min, float $max): float
    {
        return max($min, min($max, $value));
    }
}
