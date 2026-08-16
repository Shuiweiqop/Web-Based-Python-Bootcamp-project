<?php

namespace Tests\Feature;

use App\Models\Concept;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\Test;
use App\Services\Mastery\ConceptTaggingService;
use Database\Seeders\ConceptSeeder;
use Database\Seeders\ConceptTagSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Tests concept tagging: the Gemini-backed suggestion service and the offline
 * keyword seeder.
 *
 * Gemini is always faked here — a test suite must never make a paid API call,
 * and faking lets us pin down the responses that matter (hallucinated slugs,
 * malformed JSON, outages).
 */
class ConceptTaggingTest extends TestCase
{
    use RefreshDatabase;

    private function seedConcepts(): void
    {
        $this->seed(ConceptSeeder::class);
    }

    private function makeQuestion(string $text, ?string $code = null): Question
    {
        $lesson = Lesson::create([
            'title' => 'L', 'description' => 'd', 'content' => 'c',
            'difficulty' => 'beginner', 'status' => 'active',
        ]);

        $test = Test::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'T', 'description' => 'd', 'status' => 'active',
        ]);

        return Question::create([
            'test_id' => $test->test_id,
            'type' => 'mcq',
            'question_text' => $text,
            'code_snippet' => $code,
            'correct_answer' => 'a',
            'points' => 10,
            'difficulty_level' => 2,
            'status' => 'active',
        ]);
    }

    private function fakeGemini(string $responseText): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [[
                    'content' => ['parts' => [['text' => $responseText]]],
                ]],
            ], 200),
        ]);
    }

    // ==================== Suggestion service ====================

    public function test_suggests_valid_concepts_from_the_model_response(): void
    {
        $this->seedConcepts();
        config(['services.gemini.key' => 'test-key']);
        $this->fakeGemini('[{"slug": "loops", "weight": 1.0}, {"slug": "lists", "weight": 0.5}]');

        $result = app(ConceptTaggingService::class)
            ->suggestForQuestion($this->makeQuestion('Loop over a list'));

        $this->assertTrue($result['success']);
        $this->assertCount(2, $result['tags']);
        $this->assertSame('loops', $result['tags'][0]['slug']);
        $this->assertSame(1.0, $result['tags'][0]['weight']);
    }

    public function test_markdown_fenced_json_is_still_parsed(): void
    {
        $this->seedConcepts();
        config(['services.gemini.key' => 'test-key']);
        // Models wrap JSON in fences despite being told not to.
        $this->fakeGemini("```json\n[{\"slug\": \"loops\", \"weight\": 1.0}]\n```");

        $result = app(ConceptTaggingService::class)
            ->suggestForQuestion($this->makeQuestion('A loop question'));

        $this->assertTrue($result['success']);
        $this->assertCount(1, $result['tags']);
    }

    /**
     * The safety boundary of the whole feature: a slug the model invented must
     * never reach the database, or evidence would attach to a phantom concept.
     */
    public function test_hallucinated_slugs_are_rejected(): void
    {
        $this->seedConcepts();
        config(['services.gemini.key' => 'test-key']);
        $this->fakeGemini('[{"slug": "loops", "weight": 1.0}, {"slug": "quantum_python", "weight": 1.0}]');

        $result = app(ConceptTaggingService::class)
            ->suggestForQuestion($this->makeQuestion('A loop question'));

        $this->assertTrue($result['success']);
        $this->assertCount(1, $result['tags']);
        $this->assertSame('loops', $result['tags'][0]['slug']);
    }

    public function test_weights_are_clamped_into_range(): void
    {
        $this->seedConcepts();
        config(['services.gemini.key' => 'test-key']);
        $this->fakeGemini('[{"slug": "loops", "weight": 9.5}, {"slug": "lists", "weight": -2}]');

        $result = app(ConceptTaggingService::class)
            ->suggestForQuestion($this->makeQuestion('Q'));

        $weights = array_column($result['tags'], 'weight');
        $this->assertSame([1.0, 0.1], $weights);
    }

    public function test_malformed_json_fails_gracefully(): void
    {
        $this->seedConcepts();
        config(['services.gemini.key' => 'test-key']);
        $this->fakeGemini('I think this tests loops, probably.');

        $result = app(ConceptTaggingService::class)
            ->suggestForQuestion($this->makeQuestion('Q'));

        $this->assertFalse($result['success']);
        $this->assertSame([], $result['tags']);
    }

    public function test_missing_api_key_degrades_gracefully(): void
    {
        $this->seedConcepts();
        config(['services.gemini.key' => null]);

        $result = app(ConceptTaggingService::class)
            ->suggestForQuestion($this->makeQuestion('Q'));

        // Must not throw: a missing key is a config gap, not a crash.
        $this->assertFalse($result['success']);
        $this->assertStringContainsString('not configured', $result['message']);
    }

    public function test_api_failure_degrades_gracefully(): void
    {
        $this->seedConcepts();
        config(['services.gemini.key' => 'test-key']);
        Http::fake(['generativelanguage.googleapis.com/*' => Http::response([], 503)]);

        $result = app(ConceptTaggingService::class)
            ->suggestForQuestion($this->makeQuestion('Q'));

        $this->assertFalse($result['success']);
    }

    public function test_no_concepts_defined_is_reported_clearly(): void
    {
        config(['services.gemini.key' => 'test-key']);

        $result = app(ConceptTaggingService::class)
            ->suggestForQuestion($this->makeQuestion('Q'));

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('ConceptSeeder', $result['message']);
    }

    // ==================== Applying tags ====================

    public function test_apply_persists_tags_with_their_weights(): void
    {
        $this->seedConcepts();
        $question = $this->makeQuestion('Q');

        app(ConceptTaggingService::class)->applyToQuestion($question, [
            ['slug' => 'loops', 'weight' => 1.0],
            ['slug' => 'lists', 'weight' => 0.5],
        ]);

        $tags = $question->fresh()->concepts;

        $this->assertCount(2, $tags);
        $this->assertEqualsWithDelta(
            0.5,
            $tags->firstWhere('slug', 'lists')->pivot->weight,
            0.0001
        );
    }

    /**
     * Default is additive: an admin's hand-corrected tags outrank a model
     * suggestion, so a bulk `concepts:tag` run must not silently undo them.
     */
    public function test_apply_adds_to_existing_tags_by_default(): void
    {
        $this->seedConcepts();
        $question = $this->makeQuestion('Q');
        $service = app(ConceptTaggingService::class);

        $service->applyToQuestion($question, [['slug' => 'loops', 'weight' => 1.0]]);
        $service->applyToQuestion($question, [['slug' => 'functions', 'weight' => 1.0]]);

        $slugs = $question->fresh()->concepts->pluck('slug')->sort()->values()->all();

        $this->assertSame(['functions', 'loops'], $slugs);
    }

    public function test_apply_replaces_previous_tags_when_asked(): void
    {
        $this->seedConcepts();
        $question = $this->makeQuestion('Q');
        $service = app(ConceptTaggingService::class);

        $service->applyToQuestion($question, [['slug' => 'loops', 'weight' => 1.0]]);
        $service->applyToQuestion($question, [['slug' => 'functions', 'weight' => 1.0]], replace: true);

        $tags = $question->fresh()->concepts;

        $this->assertCount(1, $tags);
        $this->assertSame('functions', $tags->first()->slug);
    }

    // ==================== Offline keyword seeder ====================

    public function test_tag_seeder_matches_concepts_by_keyword(): void
    {
        $this->seedConcepts();
        $question = $this->makeQuestion('Write a for loop that prints numbers');

        $this->seed(ConceptTagSeeder::class);

        $this->assertTrue(
            $question->fresh()->concepts->contains('slug', 'loops'),
            'A "for loop" question should be tagged with loops.'
        );
    }

    /**
     * The seeded placement test is an English quiz, not Python. Forcing those
     * questions into a Python concept would feed the ability model evidence
     * about a skill they do not test.
     */
    public function test_tag_seeder_leaves_non_python_questions_untagged(): void
    {
        $this->seedConcepts();
        $question = $this->makeQuestion('What is the past tense of "go"?');

        $this->seed(ConceptTagSeeder::class);

        $this->assertCount(0, $question->fresh()->concepts);
    }

    public function test_tag_seeder_gives_unmatched_exercises_a_fallback_concept(): void
    {
        $this->seedConcepts();
        $lesson = Lesson::create([
            'title' => 'L', 'description' => 'd', 'content' => 'c',
            'difficulty' => 'beginner', 'status' => 'active',
        ]);

        $exercise = InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Mystery Activity',
            'exercise_type' => 'drag_drop',
            'difficulty' => 'beginner',
            'max_score' => 100,
            'is_active' => true,
        ]);

        $this->seed(ConceptTagSeeder::class);

        // Exercises are always Python here, so none may be left invisible to
        // the ability model.
        $this->assertGreaterThan(0, $exercise->fresh()->concepts->count());
    }

    public function test_tag_seeder_is_idempotent(): void
    {
        $this->seedConcepts();
        $question = $this->makeQuestion('Write a for loop over a list');

        $this->seed(ConceptTagSeeder::class);
        $first = $question->fresh()->concepts->count();

        $this->seed(ConceptTagSeeder::class);
        $second = $question->fresh()->concepts->count();

        $this->assertSame($first, $second, 'Re-seeding must not duplicate tags.');
    }

    public function test_tag_seeder_caps_concepts_per_item(): void
    {
        $this->seedConcepts();
        // Deliberately stuffed with keywords from many concepts.
        $question = $this->makeQuestion(
            'Use a for loop over a list and a dictionary with a string function '.
            'and a class method to convert an integer and handle the error'
        );

        $this->seed(ConceptTagSeeder::class);

        $this->assertLessThanOrEqual(
            3,
            $question->fresh()->concepts->count(),
            'One wordy question must not smear evidence across the taxonomy.'
        );
    }

    public function test_tag_seeder_without_concepts_does_not_throw(): void
    {
        // ConceptSeeder deliberately not run.
        $this->makeQuestion('Write a for loop');

        $this->seed(ConceptTagSeeder::class);

        $this->assertSame(0, Concept::count());
    }
}
