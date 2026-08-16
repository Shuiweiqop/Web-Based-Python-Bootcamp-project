<?php

namespace Database\Seeders;

use App\Models\Concept;
use App\Models\InteractiveExercise;
use App\Models\Question;
use Illuminate\Database\Seeder;

/**
 * Tags seeded questions and exercises with concepts, so a fresh install has a
 * working ability model without needing a Gemini key.
 *
 * Deliberately keyword-based rather than AI-driven: seeding must be
 * deterministic and offline. The deployed demo re-seeds on every boot, and a
 * demo whose mastery dashboard is empty because an API call failed is worse than
 * one with slightly coarse tags. `php artisan concepts:tag` is the AI path for
 * real content authoring.
 *
 * Idempotent: syncWithoutDetaching, so re-seeding never duplicates a tag and
 * never clears one an admin has corrected by hand.
 */
class ConceptTagSeeder extends Seeder
{
    /**
     * Keyword -> concept slug. Checked against the item's text, longest phrases
     * first so "for loop" wins over a bare "for".
     *
     * @var array<string, string>
     */
    private const KEYWORD_MAP = [
        // loops
        'for loop' => 'loops', 'while loop' => 'loops', 'iterating' => 'loops',
        'iterate' => 'loops', 'loop' => 'loops', 'range(' => 'loops',
        // functions
        'function' => 'functions', 'def ' => 'functions', 'return value' => 'functions',
        'parameter' => 'functions', 'argument' => 'functions',
        // lists
        'list' => 'lists', 'array' => 'lists', 'append' => 'lists',
        'index' => 'lists', 'slicing' => 'lists',
        // dictionaries
        'dictionary' => 'dictionaries', 'dict' => 'dictionaries',
        'key-value' => 'dictionaries', 'set' => 'dictionaries',
        // strings
        'string' => 'strings', 'text' => 'strings', 'concatenat' => 'strings',
        'upper()' => 'strings', 'lower()' => 'strings', 'format' => 'strings',
        // conditionals
        'if statement' => 'conditionals', 'elif' => 'conditionals',
        'else' => 'conditionals', 'condition' => 'conditionals', 'boolean' => 'conditionals',
        // data types
        'data type' => 'data_types', 'integer' => 'data_types', 'whole number' => 'data_types',
        'float' => 'data_types', 'type conversion' => 'data_types', 'convert' => 'data_types',
        // variables
        'variable' => 'variables', 'assign' => 'variables', 'declaration' => 'variables',
        // operators
        'operator' => 'operators', 'arithmetic' => 'operators', 'comparison' => 'operators',
        // error handling
        'try' => 'error_handling', 'except' => 'error_handling', 'exception' => 'error_handling',
        'error' => 'error_handling', 'debug' => 'error_handling',
        // file io
        'file' => 'file_io', 'read from' => 'file_io', 'write to' => 'file_io',
        // oop
        'class' => 'oop_basics', 'object' => 'oop_basics', 'method' => 'oop_basics',
        'attribute' => 'oop_basics',
        // General Python syntax. Last so a more specific keyword always wins:
        // these catch intro items ("print Hello World", "Python is interpreted")
        // that test basic syntax without naming any single construct.
        'print(' => 'variables', 'print ' => 'variables',
        'syntax' => 'variables', 'python' => 'variables',
    ];

    /** Concept every Python item gets when no keyword matches. */
    private const FALLBACK_SLUG = 'variables';

    public function run(): void
    {
        $conceptIds = Concept::pluck('concept_id', 'slug');

        if ($conceptIds->isEmpty()) {
            $this->command?->warn('No concepts found — run ConceptSeeder first. Skipping tag seeding.');

            return;
        }

        $questions = $this->tagQuestions($conceptIds);
        $exercises = $this->tagExercises($conceptIds);

        $this->command?->info("Tagged {$questions} question(s) and {$exercises} exercise(s) with concepts.");
    }

    private function tagQuestions($conceptIds): int
    {
        $count = 0;

        foreach (Question::with(['concepts', 'test'])->get() as $question) {
            if (! $this->looksLikeProgrammingContent($question)) {
                continue;
            }

            $text = strtolower(trim(
                $question->question_text.' '.($question->code_snippet ?? '')
            ));

            $slugs = $this->matchConcepts($text);

            // No keyword hit: leave it untagged rather than force it into a
            // concept it never tests.
            if (empty($slugs)) {
                continue;
            }

            $question->concepts()->syncWithoutDetaching(
                $this->buildPayload($slugs, $conceptIds)
            );
            $count++;
        }

        return $count;
    }

    /**
     * Guard against tagging non-programming questions.
     *
     * The seeded placement test is an English quiz, and its wording collides
     * with the keyword map in ways that look plausible — "what is the function
     * of the clause" matches `function`. Tagging that would feed the ability
     * model evidence about a Python skill the question does not test, which is
     * worse than leaving it untagged.
     *
     * Keyword matching alone cannot tell the two apart, so scope it structurally
     * instead: only questions attached to a non-placement test are candidates.
     */
    private function looksLikeProgrammingContent(Question $question): bool
    {
        $test = $question->test;

        if (! $test) {
            return false;
        }

        return ($test->test_type ?? null) !== 'placement';
    }

    private function tagExercises($conceptIds): int
    {
        $count = 0;

        foreach (InteractiveExercise::with('concepts')->get() as $exercise) {
            $text = strtolower(trim(
                $exercise->title.' '.($exercise->description ?? '')
            ));

            $slugs = $this->matchConcepts($text);

            // Exercises are always Python here, so an unmatched one still gets
            // the fallback — leaving it untagged would make it invisible to the
            // ability model entirely.
            if (empty($slugs)) {
                $slugs = [self::FALLBACK_SLUG => 1.0];
            }

            $exercise->concepts()->syncWithoutDetaching(
                $this->buildPayload($slugs, $conceptIds)
            );
            $count++;
        }

        return $count;
    }

    /**
     * Find concepts mentioned in the text.
     *
     * The first match is the primary concept (weight 1.0); up to two further
     * matches are supporting concepts (0.5). Capped at three so one wordy
     * question cannot smear weak evidence across half the taxonomy.
     *
     * @return array<string, float> slug => weight
     */
    private function matchConcepts(string $text): array
    {
        $matched = [];

        foreach (self::KEYWORD_MAP as $keyword => $slug) {
            if (count($matched) >= 3) {
                break;
            }

            if (isset($matched[$slug])) {
                continue;
            }

            if (str_contains($text, $keyword)) {
                $matched[$slug] = empty($matched) ? 1.0 : 0.5;
            }
        }

        return $matched;
    }

    /**
     * @param  array<string, float>  $slugs
     */
    private function buildPayload(array $slugs, $conceptIds): array
    {
        $payload = [];

        foreach ($slugs as $slug => $weight) {
            if (isset($conceptIds[$slug])) {
                $payload[$conceptIds[$slug]] = ['weight' => $weight];
            }
        }

        return $payload;
    }
}
