<?php

namespace App\Services\Grading;

use Illuminate\Support\Facades\Cache;
use InvalidArgumentException;

/**
 * Grades a memory match exercise from the turns the server itself saw.
 *
 * Content is a list of pairs, each a prompt and its answer:
 *
 *     {"instructions": "...", "pairs": [{"id": "p1", "prompt": "len()", "answer": "Length of a sequence"}]}
 *
 * The game needs to know at once whether two flipped cards match, so the
 * pairing cannot stay on the server until the end the way other answer keys
 * do. Instead the page gets a deck — every card's text, shuffled, under an id
 * that says nothing about its partner — and asks flip() about each pair of
 * cards it turns over. flip() answers and keeps the run's tally: pairs found,
 * misses, streak. grade() scores that tally with the formula the page used,
 * so a run has to be played to be scored, and every wrong guess counts.
 *
 * A run is keyed by student, exercise and a run id the page makes up when a
 * game starts; Restart starts a new one. Runs live in the cache and expire.
 */
class MemoryMatchGrader implements ExerciseGrader
{
    private const RUN_TTL_SECONDS = 3 * 60 * 60;

    public function forStudent(array $content): array
    {
        $cards = [];
        foreach ($this->pairs($content) as $key => $pair) {
            $cards[] = ['id' => $this->cardId($key, 'prompt'), 'label' => (string) $pair['prompt'], 'role' => 'Concept'];
            $cards[] = ['id' => $this->cardId($key, 'answer'), 'label' => (string) $pair['answer'], 'role' => 'Match'];
        }

        shuffle($cards);
        unset($content['pairs']);
        $content['cards'] = $cards;

        return $content;
    }

    /**
     * Turn over two cards in a run.
     *
     * @return array{match: bool, matched_pairs: int, total_pairs: int}
     *
     * @throws InvalidArgumentException when a card is not in the deck, is
     *                                  turned twice, or is already matched
     */
    public function flip(array $content, int $studentId, int $exerciseId, string $run, string $first, string $second): array
    {
        $deck = $this->deck($content);

        if ($first === $second || ! isset($deck[$first], $deck[$second])) {
            throw new InvalidArgumentException('Those cards are not in this game.');
        }

        $key = $this->runKey($studentId, $exerciseId, $run);

        return Cache::lock($key.':lock', 5)->block(3, function () use ($key, $deck, $first, $second) {
            $state = Cache::get($key, $this->freshRun());

            if (in_array($first, $state['matched'], true) || in_array($second, $state['matched'], true)) {
                throw new InvalidArgumentException('That card is already matched.');
            }

            [$firstPair, $firstSide] = $deck[$first];
            [$secondPair, $secondSide] = $deck[$second];
            $isMatch = $firstPair === $secondPair && $firstSide !== $secondSide;

            if ($isMatch) {
                $state['matched'][] = $first;
                $state['matched'][] = $second;
                $state['streak']++;
                $state['best_streak'] = max($state['best_streak'], $state['streak']);
            } else {
                $state['misses']++;
                $state['streak'] = 0;
            }

            Cache::put($key, $state, self::RUN_TTL_SECONDS);

            return [
                'match' => $isMatch,
                'matched_pairs' => intdiv(count($state['matched']), 2),
                'total_pairs' => intdiv(count($deck), 2),
            ];
        });
    }

    /**
     * Reads $answer['run'] and scores the turns recorded for it. A run is
     * scored once: grading clears it.
     */
    public function grade(array $content, array $answer, int $maxScore, array $context = []): array
    {
        $pairs = $this->pairs($content);
        $run = is_string($answer['run'] ?? null) ? $answer['run'] : '';

        $state = $this->freshRun();
        if ($run !== '' && isset($context['student_id'], $context['exercise_id'])) {
            $key = $this->runKey((int) $context['student_id'], (int) $context['exercise_id'], $run);
            $state = Cache::pull($key, $state);
        }

        $results = [];
        $review = [];
        foreach ($pairs as $key => $pair) {
            $found = in_array($this->cardId($key, 'prompt'), $state['matched'], true);

            $results[] = ['pair' => $key, 'found' => $found];
            $review[] = [
                'prompt' => (string) $pair['prompt'],
                'answer' => $found ? (string) $pair['answer'] : null,
                'correct_answer' => (string) $pair['answer'],
                'is_correct' => $found,
                'explanation' => null,
            ];
        }

        return [
            'score' => $this->score(count($pairs), count(array_filter($results, fn ($r) => $r['found'])), $state, $maxScore),
            'results' => $results,
            'review' => $review,
        ];
    }

    /**
     * The page's formula: the share of pairs found, scaled down by accuracy
     * (to no less than 70%), plus up to 10 points for the best streak.
     */
    private function score(int $totalPairs, int $found, array $state, int $maxScore): int
    {
        if ($totalPairs === 0 || $maxScore <= 0) {
            return 0;
        }

        $attempts = $found + $state['misses'];
        $accuracy = $attempts > 0 ? round($found / $attempts * 100) : 100;
        $penalty = max(0.7, $accuracy / 100);
        $streakBonus = min($state['best_streak'] * 2, 10);

        return (int) min($maxScore, round($maxScore * ($found / $totalPairs) * $penalty + $streakBonus));
    }

    private function freshRun(): array
    {
        return ['matched' => [], 'misses' => 0, 'streak' => 0, 'best_streak' => 0];
    }

    private function runKey(int $studentId, int $exerciseId, string $run): string
    {
        return "memory_match:{$studentId}:{$exerciseId}:".hash('sha256', $run);
    }

    /** @return array<string, array{0: string, 1: string}> card id => [pair key, side] */
    private function deck(array $content): array
    {
        $deck = [];
        foreach (array_keys($this->pairs($content)) as $key) {
            $deck[$this->cardId($key, 'prompt')] = [$key, 'prompt'];
            $deck[$this->cardId($key, 'answer')] = [$key, 'answer'];
        }

        return $deck;
    }

    private function cardId(string $pairKey, string $side): string
    {
        return 'm'.substr(hash_hmac('sha256', "memory_match:{$pairKey}:{$side}", (string) config('app.key')), 0, 16);
    }

    /**
     * Pairs with both a prompt and an answer, as the page used to filter
     * them, keyed by their stored id or position.
     *
     * @return array<string, array>
     */
    private function pairs(array $content): array
    {
        $pairs = [];
        foreach (is_array($content['pairs'] ?? null) ? array_values($content['pairs']) : [] as $index => $pair) {
            if (! is_array($pair) || blank($pair['prompt'] ?? null) || blank($pair['answer'] ?? null)) {
                continue;
            }
            $key = isset($pair['id']) && $pair['id'] !== '' ? (string) $pair['id'] : 'index-'.$index;
            $pairs[$key] = $pair;
        }

        return $pairs;
    }
}
