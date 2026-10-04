<?php

namespace Database\Seeders;

use App\Models\InteractiveExercise;
use App\Models\Lesson;
use Illuminate\Database\Seeder;

/**
 * A sorting and a fill-in-the-blank exercise, so both types exist to try.
 *
 * The lesson seeders never created either type, so neither could be opened
 * from a seeded database — not by a developer checking the student page, not
 * by anyone demoing it. Both are graded on the server, which is worth being
 * able to see working.
 *
 * Found by lesson title and exercise title, so running this again updates the
 * two exercises in place rather than adding copies. A lesson that does not
 * exist is skipped.
 */
class GradedPracticeExerciseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->exercises() as $lessonTitle => $exercise) {
            $lesson = Lesson::where('title', $lessonTitle)->first();

            if (! $lesson) {
                continue;
            }

            InteractiveExercise::updateOrCreate(
                ['lesson_id' => $lesson->lesson_id, 'title' => $exercise['title']],
                $exercise + ['is_active' => true]
            );
        }
    }

    private function exercises(): array
    {
        return [
            'Introduction to Python Programming' => [
                'title' => 'From Idea to Running Program',
                'description' => 'Put the steps of writing and running a Python script in order.',
                'exercise_type' => 'sorting',
                'difficulty' => 'beginner',
                'max_score' => 100,
                'time_limit_sec' => 180,
                'content' => [
                    'instruction' => 'Arrange the steps from first to last.',
                    'items' => [
                        ['id' => 'run-1', 'text' => 'Decide what the program should do', 'correctOrder' => 1],
                        ['id' => 'run-2', 'text' => 'Write the code in a .py file', 'correctOrder' => 2],
                        ['id' => 'run-3', 'text' => 'Run it with python file.py', 'correctOrder' => 3],
                        ['id' => 'run-4', 'text' => 'Read the output or the error message', 'correctOrder' => 4],
                        ['id' => 'run-5', 'text' => 'Fix the code and run it again', 'correctOrder' => 5],
                    ],
                ],
            ],
            'Python Variables and Data Types' => [
                'title' => 'Name That Type',
                'description' => 'Fill in the missing words about variables and types.',
                'exercise_type' => 'fill_blank',
                'difficulty' => 'beginner',
                'max_score' => 100,
                'time_limit_sec' => 240,
                'content' => [
                    'sentences' => [
                        [
                            'text' => 'The value 42 has the type ___.',
                            'blanks' => [['correctAnswer' => 'int', 'alternativeAnswers' => ['integer'], 'hint' => 'A whole number']],
                        ],
                        [
                            'text' => 'The value 3.14 has the type ___.',
                            'blanks' => [['correctAnswer' => 'float', 'hint' => 'It has a decimal point']],
                        ],
                        [
                            'text' => 'Use the ___ function to find out the type of a value.',
                            'blanks' => [['correctAnswer' => 'type', 'alternativeAnswers' => ['type()']]],
                        ],
                        [
                            'text' => 'The two boolean values are True and ___.',
                            'caseSensitive' => true,
                            'blanks' => [['correctAnswer' => 'False', 'hint' => 'Capital letter matters']],
                        ],
                    ],
                ],
            ],
        ];
    }
}
