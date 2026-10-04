<?php

namespace App\Services\Grading;

/**
 * Grades one exercise type on the server, from what the student actually
 * answered rather than a score the page reports.
 *
 * Every grader also owns what of its content a student may see: the answer
 * key is removed before the page receives the exercise.
 */
interface ExerciseGrader
{
    /** The exercise content with the answer key removed. */
    public function forStudent(array $content): array;

    /**
     * @param  array  $answer  the submitted answer payload; each grader reads its own key
     * @return array{
     *     score: int,
     *     results: list<array>,
     *     review: list<array{prompt: string, answer: ?string, correct_answer: ?string, is_correct: bool, explanation: ?string}>
     * } results are type-specific and stored; review is what the results screen shows
     */
    public function grade(array $content, array $answer, int $maxScore): array;
}
