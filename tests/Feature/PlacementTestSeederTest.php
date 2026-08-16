<?php

namespace Tests\Feature;

use App\Models\Concept;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Test;
use App\Models\User;
use Database\Seeders\ConceptSeeder;
use Database\Seeders\PlacementTestSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Guards the placement test's contract with the ability model.
 *
 * The placement test is the only source of baseline evidence: ConceptTagSeeder
 * deliberately skips placement questions (keyword matching cannot tell a Python
 * question from an English one), so if these questions lose their hand-authored
 * concept tags, every student's baseline silently becomes the flat prior and
 * learning gain stops meaning anything.
 */
class PlacementTestSeederTest extends TestCase
{
    use RefreshDatabase;

    private function seedPlacement(): void
    {
        User::factory()->create(['role' => 'administrator']);
        $this->seed(ConceptSeeder::class);
        $this->seed(PlacementTestSeeder::class);
    }

    public function test_creates_a_python_placement_test(): void
    {
        $this->seedPlacement();

        $test = Test::where('test_type', 'placement')->first();

        $this->assertNotNull($test);
        $this->assertStringContainsString('Python', $test->title);
    }

    /**
     * The core guarantee. An untagged placement question produces no evidence,
     * so the student's baseline for that concept stays at the prior.
     */
    public function test_every_placement_question_is_concept_tagged(): void
    {
        $this->seedPlacement();

        $test = Test::where('test_type', 'placement')->first();
        $questions = Question::where('test_id', $test->test_id)->with('concepts')->get();

        $this->assertGreaterThan(0, $questions->count());

        $untagged = $questions->filter(fn ($q) => $q->concepts->isEmpty());

        $this->assertCount(
            0,
            $untagged,
            'Untagged placement questions contribute nothing to the baseline: '.
            $untagged->pluck('question_text')->implode(' | ')
        );
    }

    /**
     * Every tag must resolve to a real concept. A typo would be silently
     * dropped, costing the baseline evidence with no visible failure.
     */
    public function test_all_placement_tags_reference_real_concepts(): void
    {
        $this->seedPlacement();

        $validIds = Concept::pluck('concept_id')->all();
        $test = Test::where('test_type', 'placement')->first();

        foreach (Question::where('test_id', $test->test_id)->with('concepts')->get() as $question) {
            foreach ($question->concepts as $concept) {
                $this->assertContains($concept->concept_id, $validIds);
            }
        }
    }

    /**
     * BKT weights hard items more heavily, so a placement test with only easy
     * questions cannot separate an advanced student from an intermediate one.
     */
    public function test_covers_all_three_difficulty_levels(): void
    {
        $this->seedPlacement();

        $test = Test::where('test_type', 'placement')->first();
        $levels = Question::where('test_id', $test->test_id)
            ->pluck('difficulty_level')
            ->unique()
            ->sort()
            ->values()
            ->all();

        $this->assertSame([1, 2, 3], $levels);
    }

    public function test_every_question_has_exactly_one_correct_option(): void
    {
        $this->seedPlacement();

        $test = Test::where('test_type', 'placement')->first();

        foreach (Question::where('test_id', $test->test_id)->get() as $question) {
            $correct = QuestionOption::where('question_id', $question->question_id)
                ->where('is_correct', true)
                ->count();

            $this->assertSame(
                1,
                $correct,
                "Question {$question->question_id} has {$correct} correct options."
            );
        }
    }

    /**
     * Runs unattended on deploy, so it must be safe to re-run and must never
     * block on a prompt.
     */
    public function test_reseeding_does_not_duplicate_the_placement_test(): void
    {
        $this->seedPlacement();
        $this->seed(PlacementTestSeeder::class);

        $this->assertSame(1, Test::where('test_type', 'placement')->count());
    }

    /**
     * Without concepts the seeder must still produce a usable test rather than
     * throwing — the questions simply carry no tags.
     */
    public function test_seeds_without_concepts_present(): void
    {
        User::factory()->create(['role' => 'administrator']);

        $this->seed(PlacementTestSeeder::class);

        $this->assertSame(1, Test::where('test_type', 'placement')->count());
    }
}
