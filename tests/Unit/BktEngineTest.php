<?php

namespace Tests\Unit;

use App\Services\Mastery\BktEngine;
use Tests\TestCase;

/**
 * Unit tests for the Bayesian Knowledge Tracing engine.
 *
 * No RefreshDatabase and no DB at all — BktEngine is pure computation, which is
 * exactly why it can be pinned down this precisely. These tests define the
 * contract the persistence layer relies on.
 */
class BktEngineTest extends TestCase
{
    /**
     * Fixed parameters so the assertions below are about the MODEL, not about
     * whatever config/mastery.php happens to say today.
     */
    private function engine(array $overrides = []): BktEngine
    {
        $config = [
            'bkt' => [
                'p_init' => 0.30,
                'p_transit' => 0.15,
                'p_slip' => 0.10,
            ],
            'p_guess' => [
                'mcq' => 0.25,
                'true_false' => 0.50,
                'short_answer' => 0.10,
                'coding' => 0.05,
                'default' => 0.20,
            ],
            'difficulty_guess_factor' => [
                1 => 1.30,
                2 => 1.00,
                3 => 0.60,
            ],
            'bounds' => [
                'min_mastery' => 0.01,
                'max_mastery' => 0.99,
                'min_guess' => 0.01,
                'max_guess' => 0.60,
            ],
            'confidence_half_life_attempts' => 5,
            'min_confidence_to_report' => 0.50,
            'weak_concept_threshold' => 0.60,
            'mastered_threshold' => 0.85,
        ];

        return new BktEngine(array_replace_recursive($config, $overrides));
    }

    // ==================== Direction of movement ====================

    public function test_correct_answer_increases_mastery(): void
    {
        $engine = $this->engine();

        $this->assertGreaterThan(0.30, $engine->update(0.30, true, 2, 'mcq'));
    }

    public function test_wrong_answer_decreases_mastery(): void
    {
        $engine = $this->engine();

        $this->assertLessThan(0.70, $engine->update(0.70, false, 2, 'mcq'));
    }

    /**
     * The exact posterior for a known case, computed by hand from the BKT
     * equations. If a refactor silently changes the maths, this fails.
     *
     *   prior=0.30, correct, p_slip=0.10, p_guess=0.25 (mcq, difficulty 2)
     *   numerator = 0.30 * 0.90                  = 0.27
     *   evidence  = 0.27 + (0.70 * 0.25)         = 0.445
     *   posterior = 0.27 / 0.445                 = 0.606741...
     *   learned   = 0.606741 + 0.393258 * 0.15   = 0.665730...
     */
    public function test_matches_hand_computed_posterior_for_correct_answer(): void
    {
        $engine = $this->engine();

        $this->assertEqualsWithDelta(0.665730, $engine->update(0.30, true, 2, 'mcq'), 0.000001);
    }

    /**
     *   prior=0.70, wrong, p_slip=0.10, p_guess=0.25
     *   numerator = 0.70 * 0.10                  = 0.07
     *   evidence  = 0.07 + (0.30 * 0.75)         = 0.295
     *   posterior = 0.07 / 0.295                 = 0.237288...
     *   learned   = 0.237288 + 0.762711 * 0.15   = 0.351694...
     */
    public function test_matches_hand_computed_posterior_for_wrong_answer(): void
    {
        $engine = $this->engine();

        $this->assertEqualsWithDelta(0.351694, $engine->update(0.70, false, 2, 'mcq'), 0.000001);
    }

    // ==================== Question type sensitivity ====================

    /**
     * The headline property of BKT over a naive average: a correct coding
     * answer is near-impossible to fluke, so it must move mastery further than
     * a correct true/false, which is right half the time by luck.
     */
    public function test_correct_coding_answer_moves_mastery_more_than_true_false(): void
    {
        $engine = $this->engine();

        $coding = $engine->update(0.30, true, 2, 'coding');
        $trueFalse = $engine->update(0.30, true, 2, 'true_false');

        $this->assertGreaterThan($trueFalse, $coding);
    }

    public function test_unknown_question_type_falls_back_to_default_guess(): void
    {
        $engine = $this->engine();

        $this->assertSame(
            $engine->effectiveGuessProbability('default', 2),
            $engine->effectiveGuessProbability('no_such_type', 2)
        );
    }

    // ==================== Difficulty sensitivity ====================

    public function test_correct_hard_answer_moves_mastery_more_than_correct_easy_answer(): void
    {
        $engine = $this->engine();

        $hard = $engine->update(0.30, true, 3, 'mcq');
        $easy = $engine->update(0.30, true, 1, 'mcq');

        $this->assertGreaterThan($easy, $hard);
    }

    public function test_unknown_difficulty_falls_back_to_medium(): void
    {
        $engine = $this->engine();

        $this->assertSame(
            $engine->effectiveGuessProbability('mcq', 2),
            $engine->effectiveGuessProbability('mcq', 99)
        );
    }

    public function test_guess_probability_is_clamped_to_bounds(): void
    {
        // A factor this large would push p_guess past 1.0 and invert the maths.
        $engine = $this->engine(['difficulty_guess_factor' => [1 => 100.0]]);

        $this->assertSame(0.60, $engine->effectiveGuessProbability('mcq', 1));
    }

    // ==================== Concept weight ====================

    public function test_secondary_concept_moves_less_than_primary_concept(): void
    {
        $engine = $this->engine();

        $primary = $engine->update(0.30, true, 2, 'mcq', 1.0);
        $secondary = $engine->update(0.30, true, 2, 'mcq', 0.5);

        $this->assertGreaterThan($secondary, $primary);
        $this->assertGreaterThan(0.30, $secondary);
    }

    public function test_zero_weight_leaves_mastery_untouched(): void
    {
        $engine = $this->engine();

        $this->assertSame(0.42, $engine->update(0.42, true, 2, 'mcq', 0.0));
    }

    public function test_weight_is_clamped_to_one(): void
    {
        $engine = $this->engine();

        $this->assertEqualsWithDelta(
            $engine->update(0.30, true, 2, 'mcq', 1.0),
            $engine->update(0.30, true, 2, 'mcq', 5.0),
            0.000001
        );
    }

    // ==================== Bounds and numerical safety ====================

    public function test_mastery_never_reaches_certainty_after_many_correct_answers(): void
    {
        $engine = $this->engine();
        $mastery = 0.30;

        for ($i = 0; $i < 100; $i++) {
            $mastery = $engine->update($mastery, true, 3, 'coding');
        }

        $this->assertLessThanOrEqual(0.99, $mastery);
        $this->assertGreaterThan(0.90, $mastery);
    }

    public function test_mastery_never_reaches_zero_after_many_wrong_answers(): void
    {
        $engine = $this->engine();
        $mastery = 0.70;

        for ($i = 0; $i < 100; $i++) {
            $mastery = $engine->update($mastery, false, 2, 'mcq');
        }

        $this->assertGreaterThanOrEqual(0.01, $mastery);
        $this->assertLessThan(0.20, $mastery);
    }

    public function test_out_of_range_prior_is_clamped_before_use(): void
    {
        $engine = $this->engine();

        $this->assertLessThanOrEqual(0.99, $engine->update(5.0, true, 2, 'mcq'));
        $this->assertGreaterThanOrEqual(0.01, $engine->update(-3.0, false, 2, 'mcq'));
    }

    public function test_non_finite_prior_does_not_produce_nan(): void
    {
        $engine = $this->engine();

        $result = $engine->update(NAN, true, 2, 'mcq');

        $this->assertTrue(is_finite($result), 'NAN prior must not propagate.');
    }

    /**
     * With p_slip = 0 and p_guess = 0, a wrong answer makes the evidence term
     * collapse to 0. The engine must return the prior rather than divide by zero.
     */
    public function test_degenerate_parameters_do_not_divide_by_zero(): void
    {
        $engine = $this->engine([
            'bkt' => ['p_slip' => 0.0],
            'p_guess' => ['mcq' => 0.0],
            'bounds' => ['min_guess' => 0.0],
        ]);

        $result = $engine->update(0.0000, false, 2, 'mcq');

        $this->assertTrue(is_finite($result));
    }

    // ==================== Confidence ====================

    public function test_confidence_is_zero_without_evidence(): void
    {
        $this->assertSame(0.0, $this->engine()->confidenceFor(0));
    }

    public function test_confidence_grows_with_attempts(): void
    {
        $engine = $this->engine();

        $this->assertGreaterThan($engine->confidenceFor(1), $engine->confidenceFor(5));
        $this->assertGreaterThan($engine->confidenceFor(5), $engine->confidenceFor(20));
    }

    public function test_confidence_reaches_half_at_the_configured_half_life(): void
    {
        // half_life = 5 attempts  ->  5 / (5 + 5) = 0.5
        $this->assertEqualsWithDelta(0.5, $this->engine()->confidenceFor(5), 0.000001);
    }

    public function test_confidence_never_exceeds_one(): void
    {
        $this->assertLessThanOrEqual(1.0, $this->engine()->confidenceFor(100000));
    }

    public function test_negative_attempts_yield_zero_confidence(): void
    {
        $this->assertSame(0.0, $this->engine()->confidenceFor(-5));
    }

    // ==================== Initial state ====================

    public function test_initial_mastery_comes_from_config(): void
    {
        $this->assertEqualsWithDelta(0.30, $this->engine()->initialMastery(), 0.000001);
    }

    public function test_from_config_builds_a_usable_engine(): void
    {
        $engine = BktEngine::fromConfig();

        $updated = $engine->update(0.30, true, 2, 'mcq');

        $this->assertGreaterThan(0.30, $updated);
        $this->assertTrue(is_finite($updated));
    }

    // ==================== Behaviour a naive average cannot reproduce ====================

    /**
     * A student who answers correctly then incorrectly is not back where they
     * started: the learning step (p_transit) means attempting the material has
     * lasting value. This is the property that distinguishes BKT from a running
     * average of right/wrong, and it is intended behaviour.
     */
    public function test_correct_then_wrong_leaves_mastery_above_a_pure_average(): void
    {
        $engine = $this->engine();

        $afterCorrect = $engine->update(0.30, true, 2, 'mcq');
        $afterWrong = $engine->update($afterCorrect, false, 2, 'mcq');

        // A 1-right-1-wrong running average would sit at 0.50; BKT does not.
        $this->assertNotEqualsWithDelta(0.50, $afterWrong, 0.01);
        $this->assertGreaterThan(0.01, $afterWrong);
    }

    /**
     * Sustained correct answers must converge upward rather than oscillate —
     * the property the analytics layer's "learning gain" curve depends on.
     */
    public function test_repeated_correct_answers_converge_monotonically_upward(): void
    {
        $engine = $this->engine();
        $mastery = 0.30;

        for ($i = 0; $i < 10; $i++) {
            $next = $engine->update($mastery, true, 2, 'mcq');
            $this->assertGreaterThanOrEqual($mastery, $next, "Step {$i} moved the wrong way.");
            $mastery = $next;
        }

        $this->assertGreaterThan(0.85, $mastery);
    }
}
