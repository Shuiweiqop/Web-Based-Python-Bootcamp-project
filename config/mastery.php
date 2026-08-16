<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Bayesian Knowledge Tracing (BKT) parameters
    |--------------------------------------------------------------------------
    |
    | The four-parameter BKT model (Corbett & Anderson, 1995). After each answer
    | the model asks "given this student got it right/wrong, what is the chance
    | they actually know the concept?", then adds the chance they just learned it.
    |
    | These are not magic numbers to tidy — each one changes how fast mastery
    | moves. See App\Services\Mastery\BktEngine for how they are applied.
    |
    */

    'bkt' => [
        // P(L0): assumed mastery before any evidence. 0.30 = mild pessimism,
        // so a correct answer is informative rather than confirming a prior.
        'p_init' => (float) env('BKT_P_INIT', 0.30),

        // P(T): chance a student transitions from "not known" to "known" as a
        // result of one practice opportunity.
        'p_transit' => (float) env('BKT_P_TRANSIT', 0.15),

        // P(S): "slip" — knows the concept but answers wrong anyway (typo,
        // misread). Keeps one careless mistake from erasing real mastery.
        'p_slip' => (float) env('BKT_P_SLIP', 0.10),
    ],

    /*
    |--------------------------------------------------------------------------
    | Guess probability by question type
    |--------------------------------------------------------------------------
    |
    | P(G): the chance of answering correctly WITHOUT knowing the concept. This
    | is question-type dependent and that difference matters: a true/false answer
    | is right half the time by luck, so it is weak evidence, while a correct
    | coding answer is very hard to fake and is strong evidence.
    |
    | Keys match App\Models\Question::TYPES. 'default' covers anything unmapped.
    |
    */

    'p_guess' => [
        'mcq' => (float) env('BKT_P_GUESS_MCQ', 0.25),          // ~4 options
        'true_false' => (float) env('BKT_P_GUESS_TRUE_FALSE', 0.50),   // coin flip
        'short_answer' => (float) env('BKT_P_GUESS_SHORT_ANSWER', 0.10),
        'coding' => (float) env('BKT_P_GUESS_CODING', 0.05),       // near-impossible to fluke
        'default' => 0.20,
    ],

    /*
    |--------------------------------------------------------------------------
    | Difficulty adjustment
    |--------------------------------------------------------------------------
    |
    | questions.difficulty_level is 1=Easy, 2=Medium, 3=Hard. A hard question is
    | harder to guess, so its effective P(G) is scaled down — which makes a
    | correct answer on a hard question count for more. Symmetrically, an easy
    | question is easier to fluke, so P(G) is scaled up.
    |
    | Effective P(G) = base P(G) * factor, clamped by the bounds below.
    |
    */

    'difficulty_guess_factor' => [
        1 => (float) env('BKT_DIFFICULTY_FACTOR_EASY', 1.30),
        2 => (float) env('BKT_DIFFICULTY_FACTOR_MEDIUM', 1.00),
        3 => (float) env('BKT_DIFFICULTY_FACTOR_HARD', 0.60),
    ],

    /*
    |--------------------------------------------------------------------------
    | Bounds
    |--------------------------------------------------------------------------
    |
    | Mastery is never pinned to exactly 0 or 1: a student is never certainly
    | ignorant nor certainly expert, and clamping away from the extremes keeps
    | the model responsive to later evidence instead of getting stuck.
    |
    */

    'bounds' => [
        'min_mastery' => 0.01,
        'max_mastery' => 0.99,
        'min_guess' => 0.01,
        'max_guess' => 0.60,
    ],

    /*
    |--------------------------------------------------------------------------
    | Confidence
    |--------------------------------------------------------------------------
    |
    | Confidence is NOT mastery — it is how much evidence backs the estimate.
    | A student with one lucky answer has high mastery but low confidence, and
    | the UI must not report "weak in loops" off a single data point.
    |
    | Modelled as attempts / (attempts + k): k attempts gives 0.5 confidence.
    |
    */

    'confidence_half_life_attempts' => (int) env('BKT_CONFIDENCE_HALF_LIFE', 5),

    // Below this confidence, treat a concept as "not enough data" rather than
    // reporting it as a strength or a weakness.
    'min_confidence_to_report' => (float) env('BKT_MIN_CONFIDENCE', 0.50),

    // At or below this mastery (with enough confidence) a concept counts as weak
    // and becomes a candidate for adaptive intervention.
    'weak_concept_threshold' => (float) env('BKT_WEAK_THRESHOLD', 0.60),

    // At or above this mastery a concept counts as mastered.
    'mastered_threshold' => (float) env('BKT_MASTERED_THRESHOLD', 0.85),

    /*
    |--------------------------------------------------------------------------
    | Interactive exercise evidence
    |--------------------------------------------------------------------------
    |
    | An exercise produces one pass/fail signal for the whole activity, not a
    | per-question answer, and exercises are scored leniently (retries, partial
    | credit). So exercise evidence is real but weaker than a test answer, and
    | its concept weight is scaled down rather than counted at full strength.
    |
    */

    // Score percentage at or above which an exercise counts as "correct".
    'exercise_pass_percentage' => (float) env('BKT_EXERCISE_PASS_PERCENTAGE', 70.0),

    // Multiplier applied to every concept weight from an exercise submission.
    'exercise_evidence_weight' => (float) env('BKT_EXERCISE_EVIDENCE_WEIGHT', 0.7),

];
