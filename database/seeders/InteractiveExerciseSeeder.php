<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lesson;
use App\Models\InteractiveExercise;

class InteractiveExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $lessons = Lesson::all();

        if ($lessons->isEmpty()) {
            $this->command->warn('No lessons found. Please run LessonsTableSeeder first.');
            return;
        }

        $this->command->info('Creating exercises for each lesson...');

        foreach ($lessons as $lesson) {
            $this->createExercisesForLesson($lesson);
        }

        $this->command->info('Exercise seeding completed!');
    }

    private function createExercisesForLesson(Lesson $lesson): void
    {
        $exerciseCount = 0;

        switch ($lesson->title) {
            case 'Introduction to Python Programming':
                $this->createIntroExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'Python Variables and Data Types':
                $this->createVariableExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'Working with Strings in Python':
                $this->createStringExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'Python Lists and Basic Operations':
                $this->createListExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'Python If Statements and Conditions':
                $this->createConditionalExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'Python Loops: For and While':
                $this->createLoopExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'Python Functions and Parameters':
                $this->createFunctionExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'Python Dictionaries and Key-Value Pairs':
                $this->createDictionaryExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'File Handling in Python':
                $this->createFileExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'Exception Handling with Try-Except':
                $this->createExceptionExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'Python Classes and Object-Oriented Programming':
                $this->createOOPExercises($lesson);
                $exerciseCount = 4;
                break;

            case 'Working with Python Modules and Packages':
                $this->createModuleExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'Python List Comprehensions and Generators':
                $this->createComprehensionExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'Python Decorators and Advanced Functions':
                $this->createDecoratorExercises($lesson);
                $exerciseCount = 3;
                break;

            case 'Data Analysis with Python and Pandas':
                $this->createPandasExercises($lesson);
                $exerciseCount = 4;
                break;

            default:
                $this->createGenericExercises($lesson);
                $exerciseCount = 2;
                break;
        }

        $lesson->update(['required_exercises' => $exerciseCount]);
        $this->command->info("Created {$exerciseCount} exercises for: {$lesson->title}");
    }

    // ==================== Introduction to Python ====================
    private function createIntroExercises(Lesson $lesson): void
    {
        InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Hello World Challenge',
            'description' => 'Write your first Python program that prints "Hello, World!"',
            'exercise_type' => 'coding',
            'max_score' => 100,
            'time_limit_sec' => 300,
            'is_active' => true,
            'starter_code' => "# Write your code below\n",
            'solution' => "print('Hello, World!')",
            'content' => json_encode([
                'test_cases' => [
                    ['expected_output' => 'Hello, World!'],
                ],
            ]),
        ]);

        InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Python Syntax Quiz',
            'description' => 'Test your knowledge of Python syntax basics',
            'exercise_type' => 'quiz',
            'max_score' => 80,
            'time_limit_sec' => 240,
            'is_active' => true,
            'content' => json_encode([
                'questions' => [
                    [
                        'question' => 'What character is used for comments in Python?',
                        'options' => ['//', '#', '/*', '--'],
                        'correct' => 1,
                        'points' => 20,
                    ],
                    [
                        'question' => 'Which statement prints output in Python?',
                        'options' => ['echo()', 'console.log()', 'print()', 'System.out.println()'],
                        'correct' => 2,
                        'points' => 20,
                    ],
                    [
                        'question' => 'Does Python use indentation to define code blocks?',
                        'options' => ['Yes', 'No'],
                        'correct' => 0,
                        'points' => 20,
                    ],
                    [
                        'question' => 'What is the correct way to create a variable in Python?',
                        'options' => ['int x = 5', 'var x = 5', 'x = 5', 'let x = 5'],
                        'correct' => 2,
                        'points' => 20,
                    ],
                ],
            ]),
        ]);

        InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Python Basics Adventure',
            'description' => 'Navigate through Python basics by solving challenges',
            'exercise_type' => 'adventure_game',
            'max_score' => 120,
            'time_limit_sec' => 480,
            'is_active' => true,
            'content' => json_encode([
                'levels' => [
                    [
                        'id' => 1,
                        'name' => 'Variable Village',
                        'challenge' => 'Create a variable "name" with your name',
                        'hint' => 'Use: name = "YourName"',
                        'points' => 40,
                    ],
                    [
                        'id' => 2,
                        'name' => 'Print Palace',
                        'challenge' => 'Print "Python is awesome!"',
                        'hint' => 'Use the print() function',
                        'points' => 40,
                    ],
                    [
                        'id' => 3,
                        'name' => 'Comment Cave',
                        'challenge' => 'Write a comment explaining what comments are',
                        'hint' => 'Comments start with #',
                        'points' => 40,
                    ],
                ],
            ]),
        ]);
    }

    // ==================== Variables and Data Types ====================
    private function createVariableExercises(Lesson $lesson): void
    {
        // 修改为正确的 drag_drop 数据结构
        InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Data Type Matching',
            'description' => 'Drag Python data types to match their correct values',
            'exercise_type' => 'drag_drop',
            'max_score' => 100,
            'time_limit_sec' => 300,
            'is_active' => true,
            'content' => json_encode([
                'instructions' => 'Drag each data type to its matching value',
                'items' => [
                    ['id' => 1, 'text' => 'int', 'correct_zone' => 'zone_1', 'description' => 'Integer number'],
                    ['id' => 2, 'text' => 'float', 'correct_zone' => 'zone_2', 'description' => 'Decimal number'],
                    ['id' => 3, 'text' => 'str', 'correct_zone' => 'zone_3', 'description' => 'Text string'],
                    ['id' => 4, 'text' => 'bool', 'correct_zone' => 'zone_4', 'description' => 'True/False value'],
                ],
                'drop_zones' => [
                    [
                        'id' => 'zone_1',
                        'name' => '42',
                        'description' => 'A whole number without decimals',
                        'color' => '#3B82F6',
                        'max_items' => 1,
                    ],
                    [
                        'id' => 'zone_2',
                        'name' => '3.14',
                        'description' => 'A number with decimal point',
                        'color' => '#10B981',
                        'max_items' => 1,
                    ],
                    [
                        'id' => 'zone_3',
                        'name' => '"Hello"',
                        'description' => 'Text enclosed in quotes',
                        'color' => '#F59E0B',
                        'max_items' => 1,
                    ],
                    [
                        'id' => 'zone_4',
                        'name' => 'True',
                        'description' => 'Boolean value (True or False)',
                        'color' => '#EF4444',
                        'max_items' => 1,
                    ],
                ],
            ]),
        ]);

        InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Variable Declaration Practice',
            'description' => 'Create variables of different data types',
            'exercise_type' => 'coding',
            'max_score' => 100,
            'time_limit_sec' => 600,
            'is_active' => true,
            'starter_code' => "# Create the following variables:\n# 1. An integer called 'age' with value 25\n# 2. A float called 'price' with value 19.99\n# 3. A string called 'name' with value 'Python'\n# 4. A boolean called 'is_active' with value True\n\n",
            'solution' => "age = 25\nprice = 19.99\nname = 'Python'\nis_active = True",
            'content' => json_encode([
                'requirements' => [
                    'Must declare all 4 variables',
                    'Each variable must have correct type',
                    'Each variable must have correct value',
                ],
            ]),
        ]);

        InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Type Conversion Challenge',
            'description' => 'Convert between different data types',
            'exercise_type' => 'quiz',
            'max_score' => 80,
            'time_limit_sec' => 300,
            'is_active' => true,
            'content' => json_encode([
                'questions' => [
                    [
                        'question' => 'What is the result of int("42")?',
                        'options' => ['42 (integer)', '"42" (string)', 'Error', '42.0 (float)'],
                        'correct' => 0,
                        'points' => 20,
                    ],
                    [
                        'question' => 'What is the result of str(100)?',
                        'options' => ['100 (integer)', '"100" (string)', 'Error', '100.0'],
                        'correct' => 1,
                        'points' => 20,
                    ],
                    [
                        'question' => 'What is the result of float(5)?',
                        'options' => ['5', '"5"', '5.0', 'Error'],
                        'correct' => 2,
                        'points' => 20,
                    ],
                    [
                        'question' => 'What is the result of bool(0)?',
                        'options' => ['True', 'False', '0', 'Error'],
                        'correct' => 1,
                        'points' => 20,
                    ],
                ],
            ]),
        ]);
    }

    // ==================== Strings ====================
    private function createStringExercises(Lesson $lesson): void
    {
        InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'String Methods Practice',
            'description' => 'Use Python string methods to manipulate text',
            'exercise_type' => 'coding',
            'max_score' => 100,
            'time_limit_sec' => 600,
            'is_active' => true,
            'starter_code' => "text = 'hello world'\n# Convert to uppercase\n# Replace 'world' with 'Python'\n# Capitalize the first letter\n\n",
            'solution' => "text = 'hello world'\nuppercase = text.upper()\nreplaced = text.replace('world', 'Python')\ncapitalized = text.capitalize()",
            'content' => json_encode([
                'test_cases' => [
                    ['input' => 'hello world', 'method' => 'upper', 'expected' => 'HELLO WORLD'],
                    ['input' => 'hello world', 'method' => 'replace', 'expected' => 'hello Python'],
                ],
            ]),
        ]);

        InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'String Formatting Quiz',
            'description' => 'Test your knowledge of string formatting',
            'exercise_type' => 'quiz',
            'max_score' => 80,
            'time_limit_sec' => 240,
            'is_active' => true,
            'content' => json_encode([
                'questions' => [
                    [
                        'question' => 'Which is the modern way to format strings in Python?',
                        'options' => ['% formatting', 'format()', 'f-strings', 'concat()'],
                        'correct' => 2,
                        'points' => 20,
                    ],
                    [
                        'question' => 'What does "hello".upper() return?',
                        'options' => ['"HELLO"', '"Hello"', '"hello"', 'Error'],
                        'correct' => 0,
                        'points' => 20,
                    ],
                    [
                        'question' => 'How do you get the length of a string?',
                        'options' => ['string.length()', 'len(string)', 'string.size()', 'length(string)'],
                        'correct' => 1,
                        'points' => 20,
                    ],
                    [
                        'question' => 'What is string slicing?',
                        'options' => ['Cutting strings', 'Extracting parts of a string', 'Joining strings', 'Deleting strings'],
                        'correct' => 1,
                        'points' => 20,
                    ],
                ],
            ]),
        ]);

        InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'String Manipulation Maze',
            'description' => 'Navigate the maze by solving string challenges',
            'exercise_type' => 'maze_game',
            'max_score' => 120,
            'time_limit_sec' => 480,
            'is_active' => true,
            'content' => json_encode([
                'grid_size' => [8, 8],
                'start' => [0, 0],
                'end' => [7, 7],
                'obstacles' => [[2, 2], [3, 3], [4, 4]],
                'checkpoints' => [
                    [
                        'position' => [3, 3],
                        'question' => 'What method converts string to lowercase?',
                        'answer' => 'lower',
                        'points' => 40,
                    ],
                    [
                        'position' => [5, 5],
                        'question' => 'What symbol is used for string concatenation?',
                        'answer' => '+',
                        'points' => 40,
                    ],
                ],
            ]),
        ]);
    }

    // 保持其他方法不变...
    private function createListExercises(Lesson $lesson): void
    {
        $this->createGenericExercises($lesson);
    }
    private function createConditionalExercises(Lesson $lesson): void
    {
        $this->createGenericExercises($lesson);
    }
    private function createLoopExercises(Lesson $lesson): void
    {
        $this->createGenericExercises($lesson);
    }
    private function createFunctionExercises(Lesson $lesson): void
    {
        $this->createGenericExercises($lesson);
    }
    private function createDictionaryExercises(Lesson $lesson): void
    {
        $this->createGenericExercises($lesson);
    }
    private function createFileExercises(Lesson $lesson): void
    {
        $this->createGenericExercises($lesson);
    }
    private function createExceptionExercises(Lesson $lesson): void
    {
        $this->createGenericExercises($lesson);
    }
    private function createOOPExercises(Lesson $lesson): void
    {
        $this->createGenericExercises($lesson);
    }
    private function createModuleExercises(Lesson $lesson): void
    {
        $this->createGenericExercises($lesson);
    }
    private function createComprehensionExercises(Lesson $lesson): void
    {
        $this->createGenericExercises($lesson);
    }
    private function createDecoratorExercises(Lesson $lesson): void
    {
        $this->createGenericExercises($lesson);
    }
    private function createPandasExercises(Lesson $lesson): void
    {
        $this->createGenericExercises($lesson);
    }

    private function createGenericExercises(Lesson $lesson): void
    {
        InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Practice Exercise',
            'description' => "Practice what you learned in {$lesson->title}",
            'exercise_type' => 'coding',
            'max_score' => 100,
            'time_limit_sec' => 600,
            'is_active' => true,
            'starter_code' => "# Practice exercise\n# Write your code here\n",
            'solution' => "# Solution will vary based on the exercise",
            'content' => json_encode([
                'instructions' => 'Apply concepts from the lesson',
            ]),
        ]);

        InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Knowledge Check Quiz',
            'description' => "Test your understanding of {$lesson->title}",
            'exercise_type' => 'quiz',
            'max_score' => 80,
            'time_limit_sec' => 300,
            'is_active' => true,
            'content' => json_encode([
                'questions' => [
                    [
                        'question' => 'Did you understand the main concepts?',
                        'options' => ['Yes', 'No', 'Somewhat', 'Need more practice'],
                        'correct' => 0,
                        'points' => 40,
                    ],
                    [
                        'question' => 'Can you apply what you learned?',
                        'options' => ['Yes', 'No', 'With help', 'Not sure'],
                        'correct' => 0,
                        'points' => 40,
                    ],
                ],
            ]),
        ]);
    }
}
