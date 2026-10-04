<?php

namespace App\Services\Grading;

/**
 * Grades a fill-in-the-blank exercise from what the student typed.
 *
 * Content is a list of sentences; each ___ in a sentence's text is a blank,
 * matched by position to an entry in its blanks list:
 *
 *     {"sentences": [{"text": "print(___)", "caseSensitive": false,
 *                     "blanks": [{"correctAnswer": "x", "alternativeAnswers": ["y"], "hint": "..."}]}]}
 *
 * Every blank is worth the same. An answer matches the correct answer or any
 * alternative, after trimming; case is ignored unless the sentence says
 * otherwise.
 */
class FillBlankGrader implements ExerciseGrader
{
    /** Keys that give the answer away, removed before content reaches a student. */
    private const ANSWER_KEYS = ['correctAnswer', 'alternativeAnswers'];

    public function forStudent(array $content): array
    {
        $content['sentences'] = array_map(function ($sentence) {
            if (! is_array($sentence)) {
                return $sentence;
            }

            $sentence['blanks'] = array_map(
                fn ($blank) => is_array($blank) ? array_diff_key($blank, array_flip(self::ANSWER_KEYS)) : $blank,
                $this->blanks($sentence)
            );

            return $sentence;
        }, $this->sentences($content));

        return $content;
    }

    /**
     * Reads $answer['answers']: what was typed, per sentence then per blank,
     * in order; null or missing = left empty.
     */
    public function grade(array $content, array $answer, int $maxScore): array
    {
        $typed = is_array($answer['answers'] ?? null) ? array_values($answer['answers']) : [];

        $results = [];
        $review = [];

        foreach ($this->sentences($content) as $s => $sentence) {
            $sentenceAnswers = is_array($typed[$s] ?? null) ? array_values($typed[$s]) : [];
            $blanks = $this->blanks($sentence);

            foreach ($blanks as $b => $blank) {
                $given = is_scalar($sentenceAnswers[$b] ?? null) ? trim((string) $sentenceAnswers[$b]) : '';
                $accepted = $this->acceptedAnswers($blank);
                $isCorrect = $given !== '' && $this->matches($given, $accepted, (bool) ($sentence['caseSensitive'] ?? false));

                $results[] = [
                    'sentence' => $s,
                    'blank' => $b,
                    'answer' => $given === '' ? null : $given,
                    'is_correct' => $isCorrect,
                ];

                $review[] = [
                    'prompt' => (string) ($sentence['text'] ?? '').(count($blanks) > 1 ? ' (blank '.($b + 1).')' : ''),
                    'answer' => $given === '' ? null : $given,
                    'correct_answer' => $accepted === [] ? null : implode(' / ', $accepted),
                    'is_correct' => $isCorrect,
                    'explanation' => null,
                ];
            }
        }

        $total = count($results);

        if ($total === 0 || $maxScore <= 0) {
            return ['score' => 0, 'results' => $results, 'review' => $review];
        }

        $correct = count(array_filter($results, fn ($r) => $r['is_correct']));

        return [
            'score' => (int) round($correct / $total * $maxScore),
            'results' => $results,
            'review' => $review,
        ];
    }

    private function acceptedAnswers(array $blank): array
    {
        $alternatives = is_array($blank['alternativeAnswers'] ?? null) ? $blank['alternativeAnswers'] : [];

        return array_values(array_filter(
            array_map(fn ($a) => trim((string) $a), [$blank['correctAnswer'] ?? '', ...$alternatives]),
            fn ($a) => $a !== ''
        ));
    }

    private function matches(string $given, array $accepted, bool $caseSensitive): bool
    {
        foreach ($accepted as $candidate) {
            if ($caseSensitive ? $given === $candidate : mb_strtolower($given) === mb_strtolower($candidate)) {
                return true;
            }
        }

        return false;
    }

    private function sentences(array $content): array
    {
        return is_array($content['sentences'] ?? null) ? array_values($content['sentences']) : [];
    }

    private function blanks(array $sentence): array
    {
        return is_array($sentence['blanks'] ?? null) ? array_values($sentence['blanks']) : [];
    }
}
