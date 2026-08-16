<?php

namespace App\Services\Mastery;

use App\Models\Concept;
use App\Models\InteractiveExercise;
use App\Models\Question;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Infers which concepts a question or exercise exercises, using Gemini.
 *
 * Tagging is the one part of the knowledge-tracing layer that needs human-level
 * judgement about content, and doing it by hand for a whole question bank is the
 * main cost of adopting the model. This turns that into a reviewable first draft.
 *
 * Suggestions are advisory: the caller decides whether to persist them, and an
 * admin can always correct them. The service never invents a concept — every
 * returned slug is validated against the concepts table, because a hallucinated
 * tag would silently corrupt every mastery estimate that depends on it.
 */
class ConceptTaggingService
{
    private ?string $apiKey;

    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
        $this->model = config('services.gemini.model', 'gemini-2.5-flash');
    }

    /**
     * Suggest concepts for a question.
     *
     * @return array{success: bool, tags: array<int, array{slug: string, weight: float}>, message: string}
     */
    public function suggestForQuestion(Question $question): array
    {
        $item = trim(implode("\n", array_filter([
            'Question: '.$question->question_text,
            $question->code_snippet ? "Code:\n".$question->code_snippet : null,
            'Type: '.$question->type,
        ])));

        return $this->suggest($item, ['question_id' => $question->question_id]);
    }

    /**
     * Suggest concepts for an interactive exercise.
     *
     * @return array{success: bool, tags: array<int, array{slug: string, weight: float}>, message: string}
     */
    public function suggestForExercise(InteractiveExercise $exercise): array
    {
        $item = trim(implode("\n", array_filter([
            'Exercise: '.$exercise->title,
            $exercise->description ? 'Description: '.$exercise->description : null,
            'Type: '.$exercise->exercise_type,
        ])));

        return $this->suggest($item, ['exercise_id' => $exercise->exercise_id]);
    }

    /**
     * Ask Gemini which concepts an item covers, then keep only the valid ones.
     *
     * Every failure path returns success:false rather than throwing: tagging is
     * a best-effort authoring aid, and a Gemini outage must not break the admin
     * screens or an artisan run halfway through a question bank.
     */
    private function suggest(string $itemText, array $logContext): array
    {
        try {
            if (empty($this->apiKey)) {
                return $this->failure('Gemini API key is not configured.');
            }

            $validSlugs = Concept::pluck('slug')->all();

            if (empty($validSlugs)) {
                return $this->failure('No concepts defined. Run the ConceptSeeder first.');
            }

            $response = Http::timeout(30)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}",
                [
                    'contents' => [[
                        'parts' => [['text' => $this->buildPrompt($itemText, $validSlugs)]],
                    ]],
                    'generationConfig' => [
                        // Low temperature: this is a classification task, and
                        // creative variation is exactly what we don't want.
                        'temperature' => 0.1,
                        'maxOutputTokens' => 500,
                    ],
                ]
            );

            if ($response->failed()) {
                Log::error('mastery.tagging.request_failed', $logContext + [
                    'action' => 'suggest',
                    'status' => $response->status(),
                ]);

                return $this->failure('The tagging request failed.');
            }

            $text = data_get($response->json(), 'candidates.0.content.parts.0.text');

            if (! is_string($text) || $text === '') {
                Log::warning('mastery.tagging.empty_response', $logContext + ['action' => 'suggest']);

                return $this->failure('The model returned no usable content.');
            }

            return $this->parseTags($text, $validSlugs, $logContext);
        } catch (\Throwable $e) {
            Log::error('mastery.tagging.failed', $logContext + [
                'action' => 'suggest',
                'error' => $e->getMessage(),
            ]);

            return $this->failure('Could not generate concept suggestions.');
        }
    }

    private function buildPrompt(string $itemText, array $validSlugs): string
    {
        $slugList = implode(', ', $validSlugs);

        return <<<PROMPT
        You are tagging Python exercises for a learning platform's knowledge model.

        Choose which concepts the following item actually requires a student to
        understand in order to answer it. Judge the skill being tested, not the
        surface wording — an item that merely mentions a list but tests loop
        control is a loops item.

        You MUST only use slugs from this list: {$slugList}

        Rules:
        - Return 1 to 3 concepts. Most items test exactly one.
        - weight 1.0 for the concept the item is really about; 0.3 to 0.6 for a
          supporting concept the student also needs.
        - If none of the listed concepts fit, return an empty array.
        - Never invent a slug that is not in the list above.

        Item:
        {$itemText}

        Return ONLY a JSON array, no markdown fences and no commentary:
        [{"slug": "loops", "weight": 1.0}, {"slug": "lists", "weight": 0.5}]
        PROMPT;
    }

    /**
     * Parse the model's JSON and drop anything that is not a real concept.
     *
     * This validation is the safety boundary of the whole feature: an invented
     * or misspelled slug that slipped through would attach evidence to nothing,
     * or worse, to the wrong concept.
     */
    private function parseTags(string $text, array $validSlugs, array $logContext): array
    {
        $clean = trim(preg_replace('/```json\s*|\s*```/', '', $text));
        $decoded = json_decode($clean, true);

        if (json_last_error() !== JSON_ERROR_NONE || ! is_array($decoded)) {
            Log::warning('mastery.tagging.parse_failed', $logContext + [
                'action' => 'parseTags',
                'error' => json_last_error_msg(),
            ]);

            return $this->failure('Could not parse the tagging response.');
        }

        $tags = [];
        $rejected = [];

        foreach ($decoded as $entry) {
            if (! is_array($entry) || ! isset($entry['slug'])) {
                continue;
            }

            $slug = strtolower(trim((string) $entry['slug']));

            if (! in_array($slug, $validSlugs, true)) {
                $rejected[] = $slug;

                continue;
            }

            // Clamp: a weight outside 0..1 would distort the BKT update.
            $weight = isset($entry['weight']) ? (float) $entry['weight'] : 1.0;
            $weight = max(0.1, min(1.0, $weight));

            $tags[$slug] = ['slug' => $slug, 'weight' => $weight];
        }

        if (! empty($rejected)) {
            Log::info('mastery.tagging.rejected_slugs', $logContext + [
                'action' => 'parseTags',
                'rejected' => $rejected,
            ]);
        }

        return [
            'success' => true,
            'tags' => array_values($tags),
            'message' => count($tags).' concept(s) suggested.',
        ];
    }

    /**
     * Persist suggested tags onto a question.
     *
     * Additive by default: an admin's hand-corrected tags outrank a model
     * suggestion, and a bulk `concepts:tag` run must not silently undo their
     * work. Pass $replace = true only where overwriting is the explicit intent.
     *
     * @param  array<int, array{slug: string, weight: float}>  $tags
     * @param  bool  $replace  Detach existing tags not in $tags.
     * @return int Number of concepts attached.
     */
    public function applyToQuestion(Question $question, array $tags, bool $replace = false): int
    {
        $payload = $this->buildSyncPayload($tags);

        $replace
            ? $question->concepts()->sync($payload)
            : $question->concepts()->syncWithoutDetaching($payload);

        return count($payload);
    }

    /**
     * @param  array<int, array{slug: string, weight: float}>  $tags
     * @param  bool  $replace  Detach existing tags not in $tags.
     */
    public function applyToExercise(InteractiveExercise $exercise, array $tags, bool $replace = false): int
    {
        $payload = $this->buildSyncPayload($tags);

        $replace
            ? $exercise->concepts()->sync($payload)
            : $exercise->concepts()->syncWithoutDetaching($payload);

        return count($payload);
    }

    /**
     * Map slug => pivot data, resolving slugs to ids in one query.
     */
    private function buildSyncPayload(array $tags): array
    {
        if (empty($tags)) {
            return [];
        }

        $slugs = array_column($tags, 'slug');
        $ids = Concept::whereIn('slug', $slugs)->pluck('concept_id', 'slug');

        $payload = [];

        foreach ($tags as $tag) {
            $conceptId = $ids[$tag['slug']] ?? null;

            if ($conceptId === null) {
                continue;
            }

            $payload[$conceptId] = ['weight' => $tag['weight']];
        }

        return $payload;
    }

    private function failure(string $message): array
    {
        return ['success' => false, 'tags' => [], 'message' => $message];
    }
}
