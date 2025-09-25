<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Test;
use App\Models\Lesson;

class TestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 获取所有课程，如果没有课程则先创建一些
        $lessons = Lesson::all();

        if ($lessons->isEmpty()) {
            $this->command->info('No lessons found. Please run LessonSeeder first or create lessons manually.');
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
                        'type' => 'mcq',
                        'options' => [
                            'A' => 'print("Hello World")',
                            'B' => 'echo "Hello World"',
                            'C' => 'console.log("Hello World")',
                            'D' => 'printf("Hello World")'
                        ],
                        'correct_answer' => 'A',
                        'explanation' => 'In Python, the print() function is used to display output.',
                        'max_score' => 10,
                        'time_limit' => 10,
                        'difficulty_level' => 1,
                        'status' => 'active',
                        'order' => 1
                    ],
                    [
                        'title' => 'Python is Interpreted',
                        'description' => 'True or False: Python is an interpreted programming language.',
                        'type' => 'true_false',
                        'options' => null,
                        'correct_answer' => 'True',
                        'explanation' => 'Python is indeed an interpreted language, meaning it executes code line by line.',
                        'max_score' => 5,
                        'time_limit' => 5,
                        'difficulty_level' => 1,
                        'status' => 'active',
                        'order' => 2
                    ]
                ]
            ],

            // Python Variables and Data Types
            [
                'lesson_title_keywords' => ['Variables and Data Types'],
                'tests' => [
                    [
                        'title' => 'Data Types Identification',
                        'description' => 'Which data type represents whole numbers in Python?',
                        'type' => 'mcq',
                        'options' => [
                            'A' => 'int',
                            'B' => 'string',
                            'C' => 'float',
                            'D' => 'boolean'
                        ],
                        'correct_answer' => 'A',
                        'explanation' => 'In Python, whole numbers are represented by the int (integer) data type.',
                        'max_score' => 8,
                        'time_limit' => 10,
                        'difficulty_level' => 1,
                        'status' => 'active',
                        'order' => 1
                    ],
                    [
                        'title' => 'Variable Assignment',
                        'description' => 'What is the correct way to assign a value to a variable in Python?',
                        'type' => 'short_answer',
                        'options' => null,
                        'correct_answer' => 'variable_name = value',
                        'explanation' => 'Python uses the = operator for variable assignment.',
                        'max_score' => 10,
                        'time_limit' => 8,
                        'difficulty_level' => 1,
                        'status' => 'active',
                        'order' => 2
                    ]
                ]
            ],

            // Working with Strings in Python
            [
                'lesson_title_keywords' => ['Working with Strings'],
                'tests' => [
                    [
                        'title' => 'String Methods Quiz',
                        'description' => 'Test your knowledge of Python string methods and operations.',
                        'type' => 'mcq',
                        'options' => [
                            'A' => 'str.upper()',
                            'B' => 'str.lowercase()',
                            'C' => 'str.capitalize()',
                            'D' => 'str.lower()'
                        ],
                        'correct_answer' => 'D',
                        'explanation' => 'The lower() method converts all characters in a string to lowercase.',
                        'max_score' => 10,
                        'time_limit' => 12,
                        'difficulty_level' => 1,
                        'status' => 'active',
                        'order' => 1
                    ],
                    [
                        'title' => 'String Immutability',
                        'description' => 'True or False: Python strings are immutable.',
                        'type' => 'true_false',
                        'options' => null,
                        'correct_answer' => 'True',
                        'explanation' => 'Python strings are immutable, meaning they cannot be changed after creation.',
                        'max_score' => 5,
                        'time_limit' => 8,
                        'difficulty_level' => 1,
                        'status' => 'active',
                        'order' => 2
                    ]
                ]
            ],

            // Python Lists and Basic Operations
            [
                'lesson_title_keywords' => ['Lists and Basic Operations'],
                'tests' => [
                    [
                        'title' => 'List Operations',
                        'description' => 'Which method adds an element to the end of a Python list?',
                        'type' => 'mcq',
                        'options' => [
                            'A' => 'list.add()',
                            'B' => 'list.append()',
                            'C' => 'list.insert()',
                            'D' => 'list.put()'
                        ],
                        'correct_answer' => 'B',
                        'explanation' => 'The append() method adds an element to the end of a list.',
                        'max_score' => 10,
                        'time_limit' => 10,
                        'difficulty_level' => 1,
                        'status' => 'active',
                        'order' => 1
                    ],
                    [
                        'title' => 'Create a Simple List',
                        'description' => 'Write code to create a list with three numbers: 1, 2, 3',
                        'type' => 'short_answer',
                        'options' => null,
                        'correct_answer' => '[1, 2, 3]',
                        'explanation' => 'Lists in Python are created using square brackets with comma-separated values.',
                        'max_score' => 8,
                        'time_limit' => 8,
                        'difficulty_level' => 1,
                        'status' => 'active',
                        'order' => 2
                    ]
                ]
            ],

            // Python If Statements and Conditions
            [
                'lesson_title_keywords' => ['If Statements and Conditions'],
                'tests' => [
                    [
                        'title' => 'Conditional Syntax',
                        'description' => 'What is the correct syntax for an if statement in Python?',
                        'type' => 'mcq',
                        'options' => [
                            'A' => 'if x = 5:',
                            'B' => 'if x == 5:',
                            'C' => 'if (x = 5):',
                            'D' => 'if x equals 5:'
                        ],
                        'correct_answer' => 'B',
                        'explanation' => 'Python uses == for comparison and : to start the if block.',
                        'max_score' => 10,
                        'time_limit' => 10,
                        'difficulty_level' => 1,
                        'status' => 'active',
                        'order' => 1
                    ],
                    [
                        'title' => 'Elif Usage',
                        'description' => 'True or False: elif is used for multiple conditions in Python.',
                        'type' => 'true_false',
                        'options' => null,
                        'correct_answer' => 'True',
                        'explanation' => 'elif (else if) allows you to check multiple conditions sequentially.',
                        'max_score' => 5,
                        'time_limit' => 8,
                        'difficulty_level' => 1,
                        'status' => 'active',
                        'order' => 2
                    ]
                ]
            ],

            // Python Loops: For and While
            [
                'lesson_title_keywords' => ['Loops: For and While'],
                'tests' => [
                    [
                        'title' => 'Loop Types',
                        'description' => 'Which loop is best for iterating over a sequence in Python?',
                        'type' => 'mcq',
                        'options' => [
                            'A' => 'while loop',
                            'B' => 'for loop',
                            'C' => 'do-while loop',
                            'D' => 'repeat loop'
                        ],
                        'correct_answer' => 'B',
                        'explanation' => 'For loops are ideal for iterating over sequences like lists, strings, or ranges.',
                        'max_score' => 12,
                        'time_limit' => 15,
                        'difficulty_level' => 2,
                        'status' => 'active',
                        'order' => 1
                    ],
                    [
                        'title' => 'Simple For Loop',
                        'description' => 'Write a for loop that prints numbers 1 to 3.',
                        'type' => 'coding',
                        'options' => null,
                        'correct_answer' => 'for i in range(1, 4):\n    print(i)',
                        'explanation' => 'Use range(1, 4) to generate numbers 1, 2, 3.',
                        'max_score' => 15,
                        'time_limit' => 20,
                        'difficulty_level' => 2,
                        'status' => 'active',
                        'order' => 2
                    ]
                ]
            ],

            // Python Functions and Parameters
            [
                'lesson_title_keywords' => ['Functions and Parameters'],
                'tests' => [
                    [
                        'title' => 'Function Definition',
                        'description' => 'Which keyword is used to define a function in Python?',
                        'type' => 'mcq',
                        'options' => [
                            'A' => 'function',
                            'B' => 'def',
                            'C' => 'func',
                            'D' => 'define'
                        ],
                        'correct_answer' => 'B',
                        'explanation' => 'The "def" keyword is used to define functions in Python.',
                        'max_score' => 12,
                        'time_limit' => 15,
                        'difficulty_level' => 2,
                        'status' => 'active',
                        'order' => 1
                    ],
                    [
                        'title' => 'Create Addition Function',
                        'description' => 'Write a function that takes two parameters and returns their sum.',
                        'type' => 'coding',
                        'options' => null,
                        'correct_answer' => 'def add(a, b):\n    return a + b',
                        'explanation' => 'A simple function with two parameters that returns their sum.',
                        'max_score' => 20,
                        'time_limit' => 25,
                        'difficulty_level' => 2,
                        'status' => 'active',
                        'order' => 2
                    ]
                ]
            ],

            // Python Dictionaries and Key-Value Pairs
            [
                'lesson_title_keywords' => ['Dictionaries and Key-Value Pairs'],
                'tests' => [
                    [
                        'title' => 'Dictionary Creation',
                        'description' => 'How do you create an empty dictionary in Python?',
                        'type' => 'mcq',
                        'options' => [
                            'A' => '[]',
                            'B' => '{}',
                            'C' => '()',
                            'D' => 'dict[]'
                        ],
                        'correct_answer' => 'B',
                        'explanation' => 'Empty dictionaries are created using curly braces {}.',
                        'max_score' => 10,
                        'time_limit' => 12,
                        'difficulty_level' => 2,
                        'status' => 'active',
                        'order' => 1
                    ],
                    [
                        'title' => 'Dictionary Keys Must Be Immutable',
                        'description' => 'True or False: Dictionary keys must be immutable in Python.',
                        'type' => 'true_false',
                        'options' => null,
                        'correct_answer' => 'True',
                        'explanation' => 'Dictionary keys must be immutable objects like strings, numbers, or tuples.',
                        'max_score' => 8,
                        'time_limit' => 10,
                        'difficulty_level' => 2,
                        'status' => 'active',
                        'order' => 2
                    ]
                ]
            ]
        ];

        // 为每个课程创建相应的测试
        foreach ($lessons as $lesson) {
            $this->command->info("Processing lesson: {$lesson->title}");

            // 查找匹配的测试数据
            $matchedTestData = null;
            foreach ($testData as $category) {
                foreach ($category['lesson_title_keywords'] as $keyword) {
                    if (stripos($lesson->title, $keyword) !== false) {
                        $matchedTestData = $category['tests'];
                        $this->command->info("Matched keyword: {$keyword}");
                        break 2;
                    }
                }
            }

            // 如果找到匹配的测试数据，创建测试
            if ($matchedTestData) {
                foreach ($matchedTestData as $testInfo) {
                    $test = Test::create([
                        'lesson_id' => $lesson->lesson_id,
                        'title' => $testInfo['title'],
                        'description' => $testInfo['description'],
                        'type' => $testInfo['type'],
                        'options' => $testInfo['options'],
                        'correct_answer' => $testInfo['correct_answer'],
                        'explanation' => $testInfo['explanation'],
                        'max_score' => $testInfo['max_score'],
                        'time_limit' => $testInfo['time_limit'],
                        'difficulty_level' => $testInfo['difficulty_level'],
                        'status' => $testInfo['status'],
                        'order' => $testInfo['order'],
                    ]);

                    $this->command->info("Created test: {$test->title}");
                }
            } else {
                // 为没有匹配的课程创建通用测试
                $this->createGenericTests($lesson);
            }
        }

        $this->command->info('Test seeding completed!');
    }

    /**
     * Create generic tests for lessons that don't match specific categories
     */
    private function createGenericTests(Lesson $lesson): void
    {
        $genericTests = [
            [
                'title' => "Understanding {$lesson->title} - Quiz",
                'description' => "Test your knowledge about the concepts covered in {$lesson->title}.",
                'type' => 'mcq',
                'options' => [
                    'A' => 'Option A',
                    'B' => 'Option B',
                    'C' => 'Option C',
                    'D' => 'Option D'
                ],
                'correct_answer' => 'B',
                'explanation' => 'This is the correct answer for this example question.',
                'max_score' => 10,
                'time_limit' => 15,
                'difficulty_level' => 1,
                'status' => 'draft', // Set as draft for manual review
                'order' => 1
            ],
            [
                'title' => "Practice Exercise: {$lesson->title}",
                'description' => "Apply what you've learned in {$lesson->title} with this practical exercise.",
                'type' => 'short_answer',
                'options' => null,
                'correct_answer' => 'sample answer',
                'explanation' => 'This is an example explanation.',
                'max_score' => 15,
                'time_limit' => 20,
                'difficulty_level' => 2,
                'status' => 'draft',
                'order' => 2
            ]
        ];

        foreach ($genericTests as $testInfo) {
            Test::create([
                'lesson_id' => $lesson->lesson_id,
                'title' => $testInfo['title'],
                'description' => $testInfo['description'],
                'type' => $testInfo['type'],
                'options' => $testInfo['options'],
                'correct_answer' => $testInfo['correct_answer'],
                'explanation' => $testInfo['explanation'],
                'max_score' => $testInfo['max_score'],
                'time_limit' => $testInfo['time_limit'],
                'difficulty_level' => $testInfo['difficulty_level'],
                'status' => $testInfo['status'],
                'order' => $testInfo['order'],
            ]);
        }

        $this->command->info("Created generic tests for: {$lesson->title}");
    }
}
