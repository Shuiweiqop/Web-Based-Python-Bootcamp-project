<?php

namespace Database\Seeders;

use App\Models\Concept;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Test;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * The Python placement test: what a new student sits before anything else.
 *
 * Two jobs, and both matter:
 *   1. Score -> recommended learning path (LearningPathRecommendationService).
 *   2. First evidence for the ability model, frozen as each student's baseline.
 *
 * Because of (2) every question carries an explicit `concepts` list. Placement
 * questions are NOT keyword-tagged by ConceptTagSeeder — that seeder skips
 * placement tests on purpose, since keyword matching cannot reliably tell a
 * Python question from an English one. Tagging here, by hand, is both more
 * accurate and the only source of baseline evidence.
 *
 * Difficulty spread is deliberate: easy questions early so a true beginner
 * scores above zero, hard ones late so an advanced student is separated from an
 * intermediate one. BKT weights a correct hard answer more heavily than an easy
 * one, so the spread also sharpens the baseline itself.
 */
class PlacementTestSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'administrator')->first();

        if (! $admin) {
            $this->command?->error('No admin user found. Please create an admin first.');

            return;
        }

        // Idempotent and non-interactive: this runs unattended on deploy, so it
        // must never block on a prompt (the previous version called ask()).
        if (Test::where('test_type', 'placement')->exists()) {
            $this->command?->warn('Placement test already exists — skipping.');

            return;
        }

        $test = Test::create([
            'title' => 'Python Proficiency Placement Test',
            'description' => 'This assessment measures your current Python skills across syntax, data types, control flow, functions, collections, and error handling. Your results determine which learning path fits you best.',
            'instructions' => 'This test contains 20 questions covering core Python topics. You have 30 minutes. Choose the best answer for each question. Your score determines your recommended path: Beginner (0-60%), Intermediate (61-85%), or Advanced (86-100%).',
            'test_type' => 'placement',
            'status' => 'active',
            'time_limit' => 30,
            'passing_score' => 60,
            'max_attempts' => 1,
            'shuffle_questions' => true,
            'show_results_immediately' => true,
            'allow_review' => true,
            'lesson_id' => null,
            'order' => 0,
            'skill_tags' => json_encode([
                'syntax_and_types' => 30,
                'control_flow' => 25,
                'collections' => 25,
                'functions_and_errors' => 20,
            ]),
        ]);

        $questions = array_merge(
            $this->beginnerQuestions(),
            $this->intermediateQuestions(),
            $this->advancedQuestions()
        );

        $conceptIds = Concept::pluck('concept_id', 'slug');

        if ($conceptIds->isEmpty()) {
            $this->command?->warn(
                'No concepts found — placement questions will be untagged and produce no baseline. '.
                'Run ConceptSeeder before this seeder.'
            );
        }

        foreach ($questions as $index => $data) {
            $question = Question::create([
                'test_id' => $test->test_id,
                'question_text' => $data['text'],
                'code_snippet' => $data['code'] ?? null,
                'type' => $data['type'],
                'difficulty_level' => $data['difficulty'],
                'points' => $data['points'],
                'order' => $index + 1,
                'status' => 'active',
                // MCQ correctness lives on the options; kept blank to match the
                // rest of the question bank.
                'correct_answer' => '',
            ]);

            foreach ($data['options'] as $optionIndex => $option) {
                QuestionOption::create([
                    'question_id' => $question->question_id,
                    'option_text' => $option['text'],
                    'is_correct' => $option['correct'],
                    'option_label' => chr(65 + $optionIndex),
                ]);
            }

            $this->attachConcepts($question, $data['concepts'], $conceptIds);
        }

        $this->command?->info(
            'Created Python placement test (ID: '.$test->test_id.') with '.count($questions).' concept-tagged questions.'
        );
    }

    /**
     * Attach the hand-authored concept tags.
     *
     * The first concept is what the question is really about (weight 1.0); any
     * others are supporting skills the student also needs (0.5).
     *
     * @param  array<int, string>  $slugs
     */
    private function attachConcepts(Question $question, array $slugs, $conceptIds): void
    {
        $payload = [];

        foreach ($slugs as $position => $slug) {
            if (! isset($conceptIds[$slug])) {
                // A typo here would silently cost the model evidence, so say so.
                $this->command?->warn("Unknown concept slug '{$slug}' on question {$question->question_id} — skipped.");

                continue;
            }

            $payload[$conceptIds[$slug]] = ['weight' => $position === 0 ? 1.0 : 0.5];
        }

        if ($payload !== []) {
            $question->concepts()->syncWithoutDetaching($payload);
        }
    }

    /**
     * Easy: basic syntax, types, and simple output. A true beginner should get
     * several of these, so the baseline is not pinned at the floor.
     *
     * @return array<int, array<string, mixed>>
     */
    private function beginnerQuestions(): array
    {
        return [
            [
                'text' => 'Which statement correctly prints "Hello, World!" in Python 3?',
                'type' => 'mcq',
                'difficulty' => 1,
                'points' => 5,
                'concepts' => ['variables'],
                'options' => [
                    ['text' => 'echo "Hello, World!"', 'correct' => false],
                    ['text' => 'print("Hello, World!")', 'correct' => true],
                    ['text' => 'System.out.println("Hello, World!")', 'correct' => false],
                    ['text' => 'printf("Hello, World!")', 'correct' => false],
                ],
            ],
            [
                'text' => 'Which data type represents whole numbers in Python?',
                'type' => 'mcq',
                'difficulty' => 1,
                'points' => 5,
                'concepts' => ['data_types'],
                'options' => [
                    ['text' => 'float', 'correct' => false],
                    ['text' => 'str', 'correct' => false],
                    ['text' => 'int', 'correct' => true],
                    ['text' => 'bool', 'correct' => false],
                ],
            ],
            [
                'text' => 'How do you assign the value 10 to a variable named x?',
                'type' => 'mcq',
                'difficulty' => 1,
                'points' => 5,
                'concepts' => ['variables'],
                'options' => [
                    ['text' => 'x = 10', 'correct' => true],
                    ['text' => 'x == 10', 'correct' => false],
                    ['text' => 'int x = 10', 'correct' => false],
                    ['text' => 'let x = 10', 'correct' => false],
                ],
            ],
            [
                'text' => 'What is the result of the expression 7 // 2 in Python 3?',
                'type' => 'mcq',
                'difficulty' => 1,
                'points' => 5,
                'concepts' => ['operators', 'data_types'],
                'options' => [
                    ['text' => '3.5', 'correct' => false],
                    ['text' => '3', 'correct' => true],
                    ['text' => '4', 'correct' => false],
                    ['text' => '1', 'correct' => false],
                ],
            ],
            [
                'text' => 'Which keyword starts a conditional branch in Python?',
                'type' => 'mcq',
                'difficulty' => 1,
                'points' => 5,
                'concepts' => ['conditionals'],
                'options' => [
                    ['text' => 'switch', 'correct' => false],
                    ['text' => 'when', 'correct' => false],
                    ['text' => 'if', 'correct' => true],
                    ['text' => 'case', 'correct' => false],
                ],
            ],
            [
                'text' => 'What does this code print?',
                'code' => "name = \"Ada\"\nprint(\"Hi, \" + name)",
                'type' => 'mcq',
                'difficulty' => 1,
                'points' => 5,
                'concepts' => ['strings', 'variables'],
                'options' => [
                    ['text' => 'Hi, name', 'correct' => false],
                    ['text' => 'Hi, Ada', 'correct' => true],
                    ['text' => 'Hi,  + Ada', 'correct' => false],
                    ['text' => 'An error', 'correct' => false],
                ],
            ],
            [
                'text' => 'Which symbol begins a single-line comment in Python?',
                'type' => 'mcq',
                'difficulty' => 1,
                'points' => 5,
                'concepts' => ['variables'],
                'options' => [
                    ['text' => '//', 'correct' => false],
                    ['text' => '#', 'correct' => true],
                    ['text' => '/*', 'correct' => false],
                    ['text' => '--', 'correct' => false],
                ],
            ],
        ];
    }

    /**
     * Medium: loops, collections, and functions — the intermediate boundary.
     *
     * @return array<int, array<string, mixed>>
     */
    private function intermediateQuestions(): array
    {
        return [
            [
                'text' => 'Which loop is best for iterating over every item in a sequence?',
                'type' => 'mcq',
                'difficulty' => 2,
                'points' => 10,
                'concepts' => ['loops'],
                'options' => [
                    ['text' => 'while loop', 'correct' => false],
                    ['text' => 'for loop', 'correct' => true],
                    ['text' => 'do-while loop', 'correct' => false],
                    ['text' => 'repeat loop', 'correct' => false],
                ],
            ],
            [
                'text' => 'What does this code print?',
                'code' => "for i in range(3):\n    print(i)",
                'type' => 'mcq',
                'difficulty' => 2,
                'points' => 10,
                'concepts' => ['loops'],
                'options' => [
                    ['text' => '1 2 3 (on separate lines)', 'correct' => false],
                    ['text' => '0 1 2 (on separate lines)', 'correct' => true],
                    ['text' => '0 1 2 3 (on separate lines)', 'correct' => false],
                    ['text' => '3 (once)', 'correct' => false],
                ],
            ],
            [
                'text' => 'Which method adds a single item to the end of a list?',
                'type' => 'mcq',
                'difficulty' => 2,
                'points' => 10,
                'concepts' => ['lists'],
                'options' => [
                    ['text' => 'add()', 'correct' => false],
                    ['text' => 'push()', 'correct' => false],
                    ['text' => 'append()', 'correct' => true],
                    ['text' => 'insert()', 'correct' => false],
                ],
            ],
            [
                'text' => 'What is the value of nums[1] after this code runs?',
                'code' => "nums = [10, 20, 30]\nnums[1] = 99",
                'type' => 'mcq',
                'difficulty' => 2,
                'points' => 10,
                'concepts' => ['lists'],
                'options' => [
                    ['text' => '10', 'correct' => false],
                    ['text' => '20', 'correct' => false],
                    ['text' => '99', 'correct' => true],
                    ['text' => '30', 'correct' => false],
                ],
            ],
            [
                'text' => 'Which keyword defines a function in Python?',
                'type' => 'mcq',
                'difficulty' => 2,
                'points' => 10,
                'concepts' => ['functions'],
                'options' => [
                    ['text' => 'func', 'correct' => false],
                    ['text' => 'def', 'correct' => true],
                    ['text' => 'function', 'correct' => false],
                    ['text' => 'lambda', 'correct' => false],
                ],
            ],
            [
                'text' => 'What does this function return when called as add(2, 3)?',
                'code' => "def add(a, b):\n    return a + b",
                'type' => 'mcq',
                'difficulty' => 2,
                'points' => 10,
                'concepts' => ['functions', 'operators'],
                'options' => [
                    ['text' => '5', 'correct' => true],
                    ['text' => '23', 'correct' => false],
                    ['text' => 'None', 'correct' => false],
                    ['text' => 'An error', 'correct' => false],
                ],
            ],
            [
                'text' => 'How do you access the value stored under the key "age" in a dictionary named person?',
                'type' => 'mcq',
                'difficulty' => 2,
                'points' => 10,
                'concepts' => ['dictionaries'],
                'options' => [
                    ['text' => 'person.age', 'correct' => false],
                    ['text' => 'person["age"]', 'correct' => true],
                    ['text' => 'person(age)', 'correct' => false],
                    ['text' => 'person->age', 'correct' => false],
                ],
            ],
            [
                'text' => 'Which method converts a string to uppercase?',
                'type' => 'mcq',
                'difficulty' => 2,
                'points' => 10,
                'concepts' => ['strings'],
                'options' => [
                    ['text' => 'toUpper()', 'correct' => false],
                    ['text' => 'capitalize()', 'correct' => false],
                    ['text' => 'upper()', 'correct' => true],
                    ['text' => 'uppercase()', 'correct' => false],
                ],
            ],
        ];
    }

    /**
     * Hard: slicing, exceptions, comprehensions, and classes. These separate an
     * advanced student from an intermediate one.
     *
     * @return array<int, array<string, mixed>>
     */
    private function advancedQuestions(): array
    {
        return [
            [
                'text' => 'What does this code print?',
                'code' => "nums = [0, 1, 2, 3, 4, 5]\nprint(nums[1:4])",
                'type' => 'mcq',
                'difficulty' => 3,
                'points' => 15,
                'concepts' => ['lists'],
                'options' => [
                    ['text' => '[1, 2, 3]', 'correct' => true],
                    ['text' => '[1, 2, 3, 4]', 'correct' => false],
                    ['text' => '[0, 1, 2, 3]', 'correct' => false],
                    ['text' => '[2, 3, 4]', 'correct' => false],
                ],
            ],
            [
                'text' => 'Which block runs only when no exception was raised?',
                'type' => 'mcq',
                'difficulty' => 3,
                'points' => 15,
                'concepts' => ['error_handling'],
                'options' => [
                    ['text' => 'finally', 'correct' => false],
                    ['text' => 'except', 'correct' => false],
                    ['text' => 'else', 'correct' => true],
                    ['text' => 'catch', 'correct' => false],
                ],
            ],
            [
                'text' => 'What does this code print?',
                'code' => "try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print(\"caught\")",
                'type' => 'mcq',
                'difficulty' => 3,
                'points' => 15,
                'concepts' => ['error_handling'],
                'options' => [
                    ['text' => 'The program crashes', 'correct' => false],
                    ['text' => 'caught', 'correct' => true],
                    ['text' => 'Nothing', 'correct' => false],
                    ['text' => 'inf', 'correct' => false],
                ],
            ],
            [
                'text' => 'What is the value of squares after this code runs?',
                'code' => 'squares = [x * x for x in range(4)]',
                'type' => 'mcq',
                'difficulty' => 3,
                'points' => 15,
                'concepts' => ['lists', 'loops'],
                'options' => [
                    ['text' => '[1, 4, 9, 16]', 'correct' => false],
                    ['text' => '[0, 1, 4, 9]', 'correct' => true],
                    ['text' => '[0, 1, 2, 3]', 'correct' => false],
                    ['text' => '[0, 2, 4, 6]', 'correct' => false],
                ],
            ],
            [
                'text' => 'In a class, what is the conventional name of the first parameter of an instance method?',
                'type' => 'mcq',
                'difficulty' => 3,
                'points' => 15,
                'concepts' => ['oop_basics', 'functions'],
                'options' => [
                    ['text' => 'this', 'correct' => false],
                    ['text' => 'self', 'correct' => true],
                    ['text' => 'cls', 'correct' => false],
                    ['text' => 'me', 'correct' => false],
                ],
            ],
        ];
    }
}
