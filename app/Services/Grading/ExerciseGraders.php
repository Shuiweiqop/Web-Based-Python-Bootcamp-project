<?php

namespace App\Services\Grading;

/**
 * Which exercise types are graded on the server, and by what.
 *
 * A type listed here has its answer key stripped before content reaches a
 * student, and its submissions are graded from the student's answers. Types
 * not listed still report their own score (coding is graded separately, on
 * Judge0).
 */
class ExerciseGraders
{
    private const GRADERS = [
        'quiz' => QuizGrader::class,
        'fill_blank' => FillBlankGrader::class,
    ];

    public function for(?string $exerciseType): ?ExerciseGrader
    {
        $class = self::GRADERS[$exerciseType] ?? null;

        return $class ? app($class) : null;
    }
}
