<?php

namespace App\Services\Grading;

/**
 * Grades a quiz exercise from the options the student picked.
 *
 * Quiz content is a list of questions, each with its options and the index
 * of the correct one:
 *
 *     {"questions": [{"question": "...", "options": ["a", "b"], "correct": 1, "points": 20}]}
 *
 * The answer key never leaves the server before grading: forStudent() strips
 * it from what the page receives, and the grade is worked out here from the
 * student's selections, not from a score the page reports.
 */
class QuizGrader implements ExerciseGrader
{
    /** Keys that give the answer away, removed before content reaches a student. */
    private const ANSWER_KEYS = ['correct', 'explanation'];

    public function forStudent(array $content): array
    {
        $content['questions'] = array_map(
            fn ($question) => is_array($question)
                ? array_diff_key($question, array_flip(self::ANSWER_KEYS))
                : $question,
            $this->questions($content)
        );

        return $content;
    }

    /**
     * Reads $answer['selections']: the chosen option index per question, in
     * question order; null or missing = unanswered.
     */
    public function grade(array $content, array $answer, int $maxScore): array
    {
        $questions = $this->questions($content);
        $selections = is_array($answer['selections'] ?? null) ? array_values($answer['selections']) : [];

        if ($questions === [] || $maxScore <= 0) {
            return ['score' => 0, 'results' => [], 'review' => []];
        }

        // Questions without points share the score equally.
        $hasPoints = collect($questions)->contains(fn ($q) => isset($q['points']));
        $weight = fn ($q) => $hasPoints ? max(0, (float) ($q['points'] ?? 0)) : 1.0;

        $total = 0.0;
        $earned = 0.0;
        $results = [];
        $review = [];

        foreach ($questions as $i => $question) {
            $selected = $selections[$i] ?? null;
            $selected = is_numeric($selected) ? (int) $selected : null;
            $correct = isset($question['correct']) ? (int) $question['correct'] : null;
            $isCorrect = $correct !== null && $selected === $correct;

            $total += $weight($question);
            if ($isCorrect) {
                $earned += $weight($question);
            }

            $results[] = [
                'selected' => $selected,
                'correct' => $correct,
                'is_correct' => $isCorrect,
                'explanation' => $question['explanation'] ?? null,
            ];

            $options = is_array($question['options'] ?? null) ? $question['options'] : [];
            $review[] = [
                'prompt' => (string) ($question['question'] ?? ''),
                'answer' => $selected !== null && isset($options[$selected]) ? (string) $options[$selected] : null,
                'correct_answer' => $correct !== null && isset($options[$correct]) ? (string) $options[$correct] : null,
                'is_correct' => $isCorrect,
                'explanation' => $question['explanation'] ?? null,
            ];
        }

        $score = $total > 0 ? (int) round($earned / $total * $maxScore) : 0;

        return ['score' => min($score, $maxScore), 'results' => $results, 'review' => $review];
    }

    private function questions(array $content): array
    {
        return is_array($content['questions'] ?? null) ? array_values($content['questions']) : [];
    }
}
