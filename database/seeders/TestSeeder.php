<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Test;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Lesson;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        $lessons = Lesson::all();

        if ($lessons->isEmpty()) {
            $this->command->info('No lessons found. Please run LessonSeeder first.');
            return;
        }

        $testData = [
            // Introduction to Python Programming
            [
                'lesson_title_keywords' => ['Introduction to Python Programming'],
                'tests' => [
                    [
                        'title' => 'Python Basics Quiz',
                        'description' => 'Test your understanding of Python syntax and basic concepts.',
                        'instructions' => 'Answer all questions to the best of your ability.',
                        'time_limit' => 15,
                        'max_attempts' => 3,
                        'passing_score' => 70,
                        'status' => 'active',
                        'order' => 1,
                        'questions' => [
                            [
                                'type' => 'mcq',
                                'question_text' => 'What is the correct way to print Hello World in Python?',
                                'points' => 10,
                                'difficulty_level' => 1,
                                'order' => 1,
                                'correct_answer' => 'A',
                                'explanation' => 'In Python, the print() function is used to display output.',
                                'options' => [
                                    ['label' => 'A', 'text' => 'print("Hello World")', 'is_correct' => true],
                                    ['label' => 'B', 'text' => 'echo "Hello World"', 'is_correct' => false],
                                    ['label' => 'C', 'text' => 'console.log("Hello World")', 'is_correct' => false],
                                    ['label' => 'D', 'text' => 'printf("Hello World")', 'is_correct' => false],
                                ]
                            ],
                            [
                                'type' => 'true_false',
                                'question_text' => 'Python is an interpreted programming language.',
                                'points' => 5,
                                'difficulty_level' => 1,
                                'order' => 2,
                                'correct_answer' => 'True',
                                'explanation' => 'Python is indeed an interpreted language, executing code line by line.',
                                'options' => [
                                    ['label' => 'A', 'text' => 'True', 'is_correct' => true],
                                    ['label' => 'B', 'text' => 'False', 'is_correct' => false],
                                ]
                            ]
                        ]
                    ]
                ]
            ],

            // Variables and Data Types
            [
                'lesson_title_keywords' => ['Variables and Data Types'],
                'tests' => [
                    [
                        'title' => 'Data Types Mastery',
                        'description' => 'Test your knowledge of Python data types and variables.',
                        'instructions' => 'Complete all questions within the time limit.',
                        'time_limit' => 20,
                        'max_attempts' => 3,
                        'passing_score' => 70,
                        'status' => 'active',
                        'order' => 1,
                        'questions' => [
                            [
                                'type' => 'mcq',
                                'question_text' => 'Which data type represents whole numbers in Python?',
                                'points' => 8,
                                'difficulty_level' => 1,
                                'order' => 1,
                                'correct_answer' => 'A',
                                'explanation' => 'In Python, whole numbers are represented by the int (integer) data type.',
                                'options' => [
                                    ['label' => 'A', 'text' => 'int', 'is_correct' => true],
                                    ['label' => 'B', 'text' => 'string', 'is_correct' => false],
                                    ['label' => 'C', 'text' => 'float', 'is_correct' => false],
                                    ['label' => 'D', 'text' => 'boolean', 'is_correct' => false],
                                ]
                            ],
                            [
                                'type' => 'short_answer',
                                'question_text' => 'What is the correct way to assign the value 10 to a variable named x? (Write only the code)',
                                'points' => 10,
                                'difficulty_level' => 1,
                                'order' => 2,
                                'correct_answer' => 'x = 10',
                                'explanation' => 'Python uses the = operator for variable assignment.',
                                'options' => []
                            ]
                        ]
                    ]
                ]
            ],

            // Loops
            [
                'lesson_title_keywords' => ['Loops: For and While'],
                'tests' => [
                    [
                        'title' => 'Loop Mastery Challenge',
                        'description' => 'Master Python loops with this comprehensive test.',
                        'instructions' => 'Write clean, working code for coding questions.',
                        'time_limit' => 30,
                        'max_attempts' => 2,
                        'passing_score' => 75,
                        'status' => 'active',
                        'order' => 1,
                        'questions' => [
                            [
                                'type' => 'mcq',
                                'question_text' => 'Which loop is best for iterating over a sequence in Python?',
                                'points' => 10,
                                'difficulty_level' => 2,
                                'order' => 1,
                                'correct_answer' => 'B',
                                'explanation' => 'For loops are ideal for iterating over sequences.',
                                'options' => [
                                    ['label' => 'A', 'text' => 'while loop', 'is_correct' => false],
                                    ['label' => 'B', 'text' => 'for loop', 'is_correct' => true],
                                    ['label' => 'C', 'text' => 'do-while loop', 'is_correct' => false],
                                    ['label' => 'D', 'text' => 'repeat loop', 'is_correct' => false],
                                ]
                            ],
                            [
                                'type' => 'coding',
                                'question_text' => 'Write a for loop that prints numbers from 1 to 3.',
                                'code_snippet' => '# Write your code here',
                                'points' => 15,
                                'difficulty_level' => 2,
                                'order' => 2,
                                'correct_answer' => 'for i in range(1, 4):
    print(i)',
                                'explanation' => 'Use range(1, 4) to generate numbers 1, 2, 3.',
                                'options' => []
                            ]
                        ]
                    ]
                ]
            ]
        ];

        foreach ($lessons as $lesson) {
            $this->command->info("Processing lesson: {$lesson->title}");

            $matchedTestData = null;
            foreach ($testData as $category) {
                foreach ($category['lesson_title_keywords'] as $keyword) {
                    if (stripos($lesson->title, $keyword) !== false) {
                        $matchedTestData = $category['tests'];
                        break 2;
                    }
                }
            }

            if ($matchedTestData) {
                foreach ($matchedTestData as $testInfo) {
                    $test = Test::create([
                        'lesson_id' => $lesson->lesson_id,
                        'title' => $testInfo['title'],
                        'description' => $testInfo['description'],
                        'instructions' => $testInfo['instructions'],
                        'time_limit' => $testInfo['time_limit'],
                        'max_attempts' => $testInfo['max_attempts'],
                        'passing_score' => $testInfo['passing_score'],
                        'shuffle_questions' => false,
                        'show_results_immediately' => true,
                        'allow_review' => true,
                        'status' => $testInfo['status'],
                        'order' => $testInfo['order'],
                    ]);

                    $this->command->info("Created test: {$test->title}");

                    // Create questions for this test
                    foreach ($testInfo['questions'] as $questionInfo) {
                        $question = Question::create([
                            'test_id' => $test->test_id,
                            'type' => $questionInfo['type'],
                            'question_text' => $questionInfo['question_text'],
                            'code_snippet' => $questionInfo['code_snippet'] ?? null,
                            'correct_answer' => $questionInfo['correct_answer'],
                            'explanation' => $questionInfo['explanation'],
                            'points' => $questionInfo['points'],
                            'difficulty_level' => $questionInfo['difficulty_level'],
                            'order' => $questionInfo['order'],
                        ]);

                        $this->command->info("  - Created question: {$question->question_text}");

                        // Create options for MCQ and True/False questions
                        if (!empty($questionInfo['options'])) {
                            foreach ($questionInfo['options'] as $optionInfo) {
                                QuestionOption::create([
                                    'question_id' => $question->question_id,
                                    'option_label' => $optionInfo['label'],
                                    'option_text' => $optionInfo['text'],
                                    'is_correct' => $optionInfo['is_correct'],
                                ]);
                            }
                            $optionCount = count($questionInfo['options']);
                            $this->command->info("    - Created {$optionCount} options");
                        }
                    }
                }
            } else {
                $this->createGenericTest($lesson);
            }
        }

        $this->command->info('Test seeding completed!');
    }

    private function createGenericTest(Lesson $lesson): void
    {
        $test = Test::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => "Understanding {$lesson->title}",
            'description' => "Test your knowledge about {$lesson->title}.",
            'instructions' => 'Answer all questions carefully.',
            'time_limit' => 15,
            'max_attempts' => 3,
            'passing_score' => 70,
            'status' => 'draft',
            'order' => 1,
        ]);

        Question::create([
            'test_id' => $test->test_id,
            'type' => 'mcq',
            'question_text' => 'Sample question for manual editing',
            'correct_answer' => 'A',
            'explanation' => 'Please edit this question.',
            'points' => 10,
            'difficulty_level' => 1,
            'order' => 1,
        ]);

        $this->command->info("Created generic test for: {$lesson->title}");
    }
}
