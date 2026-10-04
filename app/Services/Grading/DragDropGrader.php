<?php

namespace App\Services\Grading;

/**
 * Grades a drag-and-drop exercise from where the student put each item.
 *
 * Content is a list of items, each naming the zone it belongs in, and the
 * zones themselves:
 *
 *     {"instructions": "...",
 *      "items": [{"id": 1, "text": "int", "correct_zone": "zone_1"}],
 *      "drop_zones": [{"id": "zone_1", "name": "42", "max_items": 1}]}
 *
 * The answer gets out more ways than the correct_zone key. Seeded items are
 * numbered to match their zones (item 1 belongs in zone_1) and listed in the
 * same order as the zones. So forStudent() drops correct_zone, replaces each
 * item id with an HMAC of the stored one, and shuffles the items. Zones keep
 * their ids: without the item ids to pair with, they say nothing.
 *
 * Each item placed in its zone is worth the same.
 */
class DragDropGrader implements ExerciseGrader
{
    public function forStudent(array $content): array
    {
        $items = [];
        foreach ($this->items($content) as $index => $item) {
            $item['id'] = $this->publicId($item, $index);
            unset($item['correct_zone']);
            $items[] = $item;
        }

        shuffle($items);
        $content['items'] = $items;

        return $content;
    }

    /**
     * Reads $answer['placements']: {public item id: zone id} for each item
     * the student placed.
     */
    public function grade(array $content, array $answer, int $maxScore, array $context = []): array
    {
        $placements = is_array($answer['placements'] ?? null) ? $answer['placements'] : [];
        $zoneNames = [];
        foreach ($this->zones($content) as $zone) {
            $zoneNames[(string) ($zone['id'] ?? '')] = (string) ($zone['name'] ?? $zone['id'] ?? '');
        }

        $results = [];
        $review = [];

        foreach ($this->items($content) as $index => $item) {
            $publicId = $this->publicId($item, $index);
            $placed = isset($placements[$publicId]) && is_scalar($placements[$publicId]) ? (string) $placements[$publicId] : null;
            $correct = isset($item['correct_zone']) ? (string) $item['correct_zone'] : null;
            $isCorrect = $correct !== null && $placed === $correct;

            $results[] = ['item' => $publicId, 'placed' => $placed, 'is_correct' => $isCorrect];
            $review[] = [
                'prompt' => (string) ($item['text'] ?? ''),
                'answer' => $placed !== null ? ($zoneNames[$placed] ?? null) : null,
                'correct_answer' => $correct !== null ? ($zoneNames[$correct] ?? $correct) : null,
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

    private function publicId(array $item, int $index): string
    {
        $stored = isset($item['id']) && $item['id'] !== '' ? (string) $item['id'] : 'index-'.$index;

        return 'd'.substr(hash_hmac('sha256', 'drag_drop:'.$stored, (string) config('app.key')), 0, 16);
    }

    /** @return list<array> */
    private function items(array $content): array
    {
        $items = is_array($content['items'] ?? null) ? $content['items'] : [];

        return array_values(array_filter($items, 'is_array'));
    }

    /** @return list<array> */
    private function zones(array $content): array
    {
        $zones = is_array($content['drop_zones'] ?? null) ? $content['drop_zones'] : [];

        return array_values(array_filter($zones, 'is_array'));
    }
}
