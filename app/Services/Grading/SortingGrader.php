<?php

namespace App\Services\Grading;

/**
 * Grades a sorting exercise from the order the student put the items in.
 *
 * Content is a list of items with their place in the correct sequence:
 *
 *     {"instruction": "...", "items": [{"id": "item-1", "text": "...", "correctOrder": 1}]}
 *
 * The order gives itself away three ways, and forStudent() closes all of
 * them: correctOrder is removed; the items are shuffled, since authors add
 * them in order; and ids are replaced, since the authoring form builds them
 * from a timestamp (item-<ms>, or item-<ms>-<n> on bulk import) that sorts
 * into the answer. The replacement is an HMAC of the stored id, so grading
 * can map it back without keeping any state.
 *
 * Each position the student got right is worth the same.
 */
class SortingGrader implements ExerciseGrader
{
    public function forStudent(array $content): array
    {
        $items = array_map(function (array $item, int $index) {
            $item['id'] = $this->publicId($item, $index);
            unset($item['correctOrder']);

            return $item;
        }, $this->items($content), array_keys($this->items($content)));

        shuffle($items);
        $content['items'] = $items;

        return $content;
    }

    /**
     * Reads $answer['order']: the items' public ids, top to bottom, as the
     * student left them.
     */
    public function grade(array $content, array $answer, int $maxScore): array
    {
        $order = is_array($answer['order'] ?? null) ? array_values($answer['order']) : [];

        $items = $this->items($content);
        $textById = [];
        foreach ($items as $index => $item) {
            $textById[$this->publicId($item, $index)] = (string) ($item['text'] ?? '');
        }

        $correct = $this->inCorrectOrder($items);

        $results = [];
        $review = [];

        foreach ($correct as $position => [$publicId, $text]) {
            $placed = is_string($order[$position] ?? null) ? $order[$position] : null;
            $isCorrect = $placed === $publicId;

            $results[] = ['position' => $position, 'placed' => $placed, 'is_correct' => $isCorrect];
            $review[] = [
                'prompt' => 'Position '.($position + 1),
                'answer' => $placed !== null ? ($textById[$placed] ?? null) : null,
                'correct_answer' => $text,
                'is_correct' => $isCorrect,
                'explanation' => null,
            ];
        }

        $total = count($results);

        if ($total === 0 || $maxScore <= 0) {
            return ['score' => 0, 'results' => $results, 'review' => $review];
        }

        $right = count(array_filter($results, fn ($r) => $r['is_correct']));

        return [
            'score' => (int) round($right / $total * $maxScore),
            'results' => $results,
            'review' => $review,
        ];
    }

    /** @return list<array{0: string, 1: string}> public id and text, in the correct sequence */
    private function inCorrectOrder(array $items): array
    {
        $ranked = [];
        foreach ($items as $index => $item) {
            $ranked[] = [
                'rank' => is_numeric($item['correctOrder'] ?? null) ? (float) $item['correctOrder'] : (float) $index,
                'index' => $index,
                'id' => $this->publicId($item, $index),
                'text' => (string) ($item['text'] ?? ''),
            ];
        }

        // Stored position breaks ties, so the sequence is the same every time.
        usort($ranked, fn ($a, $b) => [$a['rank'], $a['index']] <=> [$b['rank'], $b['index']]);

        return array_map(fn ($r) => [$r['id'], $r['text']], $ranked);
    }

    private function publicId(array $item, int $index): string
    {
        $stored = isset($item['id']) && $item['id'] !== '' ? (string) $item['id'] : 'index-'.$index;

        return 's'.substr(hash_hmac('sha256', 'sorting:'.$stored, (string) config('app.key')), 0, 16);
    }

    /** @return list<array> */
    private function items(array $content): array
    {
        $items = is_array($content['items'] ?? null) ? $content['items'] : [];

        return array_values(array_filter($items, 'is_array'));
    }
}
