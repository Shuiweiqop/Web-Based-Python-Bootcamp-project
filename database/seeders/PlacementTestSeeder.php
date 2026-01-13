<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Test;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\User;

class PlacementTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user
        $admin = User::where('role', 'administrator')->first();

        if (!$admin) {
            $this->command->error('❌ No admin user found. Please create an admin first.');
            return;
        }

        // Check if placement test already exists
        $existingTest = Test::where('test_type', 'placement')->first();

        if ($existingTest) {
            $this->command->warn('⚠️  Placement test already exists (ID: ' . $existingTest->test_id . ')');
            $this->command->ask('Do you want to delete it and create a new one? (yes/no)');

            // You can manually delete if needed
            $this->command->info('Skipping... Use: Test::find(' . $existingTest->test_id . ')->delete()');
            return;
        }

        $this->command->info('🚀 Creating Comprehensive English Placement Test...');
        $this->command->newLine();

        // Create Placement Test
        $test = Test::create([
            'title' => 'English Proficiency Placement Test',
            'description' => 'This comprehensive assessment evaluates your English language skills across grammar, vocabulary, reading comprehension, and language usage. Your results will help us recommend the most suitable learning path tailored to your current proficiency level.',
            'instructions' => 'This test contains 30 questions covering various aspects of English language proficiency. You have 45 minutes to complete all questions. Choose the best answer for each question. Your score will determine your recommended learning path: Beginner (0-60%), Intermediate (61-85%), or Advanced (86-100%).',
            'test_type' => 'placement',
            'status' => 'active',
            'time_limit' => 45, // 45 minutes
            'passing_score' => 60,
            'max_attempts' => 1, // Only one attempt allowed
            'shuffle_questions' => true,
            'show_results_immediately' => true,
            'allow_review' => true,
            'lesson_id' => null, // Not tied to any lesson
            'order' => 0,
            'skill_tags' => json_encode([
                'grammar' => 30,
                'vocabulary' => 25,
                'reading' => 25,
                'usage' => 20,
            ]),
        ]);

        $this->command->info('✅ Placement test created (ID: ' . $test->test_id . ')');
        $this->command->info('📋 Test Title: ' . $test->title);
        $this->command->newLine();

        // ==================== BEGINNER LEVEL QUESTIONS (0-60%) ====================

        $beginnerQuestions = [
            // Basic Grammar (5 points each)
            [
                'text' => 'What is the past tense of "go"?',
                'type' => 'mcq',
                'difficulty' => 1,
                'options' => [
                    ['text' => 'goed', 'correct' => false],
                    ['text' => 'went', 'correct' => true],
                    ['text' => 'gone', 'correct' => false],
                    ['text' => 'going', 'correct' => false],
                ],
                'points' => 5,
            ],
            [
                'text' => 'Choose the correct sentence:',
                'type' => 'mcq',
                'difficulty' => 1,
                'options' => [
                    ['text' => 'She don\'t like coffee.', 'correct' => false],
                    ['text' => 'She doesn\'t likes coffee.', 'correct' => false],
                    ['text' => 'She doesn\'t like coffee.', 'correct' => true],
                    ['text' => 'She not like coffee.', 'correct' => false],
                ],
                'points' => 5,
            ],
            [
                'text' => 'I ___ a student.',
                'type' => 'mcq',
                'difficulty' => 1,
                'options' => [
                    ['text' => 'am', 'correct' => true],
                    ['text' => 'is', 'correct' => false],
                    ['text' => 'are', 'correct' => false],
                    ['text' => 'be', 'correct' => false],
                ],
                'points' => 5,
            ],
            [
                'text' => 'They ___ playing football now.',
                'type' => 'mcq',
                'difficulty' => 1,
                'options' => [
                    ['text' => 'is', 'correct' => false],
                    ['text' => 'am', 'correct' => false],
                    ['text' => 'are', 'correct' => true],
                    ['text' => 'be', 'correct' => false],
                ],
                'points' => 5,
            ],

            // Basic Vocabulary (5 points each)
            [
                'text' => 'Which word is a synonym for "happy"?',
                'type' => 'mcq',
                'difficulty' => 1,
                'options' => [
                    ['text' => 'sad', 'correct' => false],
                    ['text' => 'angry', 'correct' => false],
                    ['text' => 'joyful', 'correct' => true],
                    ['text' => 'tired', 'correct' => false],
                ],
                'points' => 5,
            ],
            [
                'text' => 'What is the opposite of "hot"?',
                'type' => 'mcq',
                'difficulty' => 1,
                'options' => [
                    ['text' => 'warm', 'correct' => false],
                    ['text' => 'cold', 'correct' => true],
                    ['text' => 'cool', 'correct' => false],
                    ['text' => 'sunny', 'correct' => false],
                ],
                'points' => 5,
            ],
            [
                'text' => 'A person who teaches is called a ___.',
                'type' => 'mcq',
                'difficulty' => 1,
                'options' => [
                    ['text' => 'doctor', 'correct' => false],
                    ['text' => 'teacher', 'correct' => true],
                    ['text' => 'student', 'correct' => false],
                    ['text' => 'engineer', 'correct' => false],
                ],
                'points' => 5,
            ],
            [
                'text' => 'Where do you go to buy medicine?',
                'type' => 'mcq',
                'difficulty' => 1,
                'options' => [
                    ['text' => 'bakery', 'correct' => false],
                    ['text' => 'library', 'correct' => false],
                    ['text' => 'pharmacy', 'correct' => true],
                    ['text' => 'bank', 'correct' => false],
                ],
                'points' => 5,
            ],
        ];

        // ==================== INTERMEDIATE LEVEL QUESTIONS (61-85%) ====================

        $intermediateQuestions = [
            // Intermediate Grammar (10 points each)
            [
                'text' => 'What is the correct form? "I have been ___ English for 5 years."',
                'type' => 'mcq',
                'difficulty' => 2,
                'options' => [
                    ['text' => 'study', 'correct' => false],
                    ['text' => 'studied', 'correct' => false],
                    ['text' => 'studying', 'correct' => true],
                    ['text' => 'studies', 'correct' => false],
                ],
                'points' => 10,
            ],
            [
                'text' => 'Choose the correct preposition: "She arrived ___ the airport early."',
                'type' => 'mcq',
                'difficulty' => 2,
                'options' => [
                    ['text' => 'in', 'correct' => false],
                    ['text' => 'at', 'correct' => true],
                    ['text' => 'on', 'correct' => false],
                    ['text' => 'to', 'correct' => false],
                ],
                'points' => 10,
            ],
            [
                'text' => 'By the time you arrive, I ___ dinner.',
                'type' => 'mcq',
                'difficulty' => 2,
                'options' => [
                    ['text' => 'will finish', 'correct' => false],
                    ['text' => 'will have finished', 'correct' => true],
                    ['text' => 'finish', 'correct' => false],
                    ['text' => 'am finishing', 'correct' => false],
                ],
                'points' => 10,
            ],
            [
                'text' => 'She made me ___ my homework before going out.',
                'type' => 'mcq',
                'difficulty' => 2,
                'options' => [
                    ['text' => 'to do', 'correct' => false],
                    ['text' => 'do', 'correct' => true],
                    ['text' => 'doing', 'correct' => false],
                    ['text' => 'did', 'correct' => false],
                ],
                'points' => 10,
            ],
            [
                'text' => 'The book ___ by millions of people worldwide.',
                'type' => 'mcq',
                'difficulty' => 2,
                'options' => [
                    ['text' => 'has read', 'correct' => false],
                    ['text' => 'has been read', 'correct' => true],
                    ['text' => 'was reading', 'correct' => false],
                    ['text' => 'reads', 'correct' => false],
                ],
                'points' => 10,
            ],

            // Intermediate Vocabulary (10 points each)
            [
                'text' => 'What does "procrastinate" mean?',
                'type' => 'mcq',
                'difficulty' => 2,
                'options' => [
                    ['text' => 'To work very quickly', 'correct' => false],
                    ['text' => 'To delay or postpone something', 'correct' => true],
                    ['text' => 'To finish something early', 'correct' => false],
                    ['text' => 'To forget something', 'correct' => false],
                ],
                'points' => 10,
            ],
            [
                'text' => 'Which word means "to make something better"?',
                'type' => 'mcq',
                'difficulty' => 2,
                'options' => [
                    ['text' => 'deteriorate', 'correct' => false],
                    ['text' => 'enhance', 'correct' => true],
                    ['text' => 'diminish', 'correct' => false],
                    ['text' => 'reduce', 'correct' => false],
                ],
                'points' => 10,
            ],
            [
                'text' => 'A person who is "resilient" is:',
                'type' => 'mcq',
                'difficulty' => 2,
                'options' => [
                    ['text' => 'easily discouraged', 'correct' => false],
                    ['text' => 'able to recover quickly from difficulties', 'correct' => true],
                    ['text' => 'always happy', 'correct' => false],
                    ['text' => 'very wealthy', 'correct' => false],
                ],
                'points' => 10,
            ],

            // Intermediate Usage (10 points each)
            [
                'text' => 'Choose the sentence with correct punctuation:',
                'type' => 'mcq',
                'difficulty' => 2,
                'options' => [
                    ['text' => 'Its a beautiful day isnt it.', 'correct' => false],
                    ['text' => 'It\'s a beautiful day, isn\'t it?', 'correct' => true],
                    ['text' => 'Its a beautiful day, isnt it?', 'correct' => false],
                    ['text' => 'It\'s a beautiful day isnt it.', 'correct' => false],
                ],
                'points' => 10,
            ],
            [
                'text' => 'Neither the students nor the teacher ___ ready for the exam.',
                'type' => 'mcq',
                'difficulty' => 2,
                'options' => [
                    ['text' => 'are', 'correct' => false],
                    ['text' => 'is', 'correct' => true],
                    ['text' => 'were', 'correct' => false],
                    ['text' => 'be', 'correct' => false],
                ],
                'points' => 10,
            ],
        ];

        // ==================== ADVANCED LEVEL QUESTIONS (86-100%) ====================

        $advancedQuestions = [
            // Advanced Grammar (15 points each)
            [
                'text' => 'If I ___ rich, I would travel the world.',
                'type' => 'mcq',
                'difficulty' => 3,
                'options' => [
                    ['text' => 'am', 'correct' => false],
                    ['text' => 'was', 'correct' => false],
                    ['text' => 'were', 'correct' => true],
                    ['text' => 'will be', 'correct' => false],
                ],
                'points' => 15,
            ],
            [
                'text' => 'Which sentence uses the subjunctive mood correctly?',
                'type' => 'mcq',
                'difficulty' => 3,
                'options' => [
                    ['text' => 'I wish I was there.', 'correct' => false],
                    ['text' => 'I wish I were there.', 'correct' => true],
                    ['text' => 'I wish I am there.', 'correct' => false],
                    ['text' => 'I wish I be there.', 'correct' => false],
                ],
                'points' => 15,
            ],
            [
                'text' => 'The company ___ considerable progress in developing new products.',
                'type' => 'mcq',
                'difficulty' => 3,
                'options' => [
                    ['text' => 'has made', 'correct' => true],
                    ['text' => 'have made', 'correct' => false],
                    ['text' => 'is making', 'correct' => false],
                    ['text' => 'makes', 'correct' => false],
                ],
                'points' => 15,
            ],
            [
                'text' => 'Scarcely ___ the door when the phone rang.',
                'type' => 'mcq',
                'difficulty' => 3,
                'options' => [
                    ['text' => 'I had opened', 'correct' => false],
                    ['text' => 'had I opened', 'correct' => true],
                    ['text' => 'I opened', 'correct' => false],
                    ['text' => 'did I open', 'correct' => false],
                ],
                'points' => 15,
            ],

            // Advanced Vocabulary (15 points each)
            [
                'text' => 'The politician\'s speech was full of ___ remarks that offended many people.',
                'type' => 'mcq',
                'difficulty' => 3,
                'options' => [
                    ['text' => 'benign', 'correct' => false],
                    ['text' => 'innocuous', 'correct' => false],
                    ['text' => 'inflammatory', 'correct' => true],
                    ['text' => 'mundane', 'correct' => false],
                ],
                'points' => 15,
            ],
            [
                'text' => 'What does "ubiquitous" mean?',
                'type' => 'mcq',
                'difficulty' => 3,
                'options' => [
                    ['text' => 'rare and unusual', 'correct' => false],
                    ['text' => 'present everywhere', 'correct' => true],
                    ['text' => 'extremely expensive', 'correct' => false],
                    ['text' => 'completely hidden', 'correct' => false],
                ],
                'points' => 15,
            ],
            [
                'text' => 'The evidence was ___, leaving no room for doubt.',
                'type' => 'mcq',
                'difficulty' => 3,
                'options' => [
                    ['text' => 'ambiguous', 'correct' => false],
                    ['text' => 'equivocal', 'correct' => false],
                    ['text' => 'irrefutable', 'correct' => true],
                    ['text' => 'dubious', 'correct' => false],
                ],
                'points' => 15,
            ],

            // Advanced Usage & Reading (15 points each)
            [
                'text' => 'Choose the sentence with the most appropriate formal tone:',
                'type' => 'mcq',
                'difficulty' => 3,
                'options' => [
                    ['text' => 'We gotta fix this problem ASAP.', 'correct' => false],
                    ['text' => 'It is imperative that we address this issue promptly.', 'correct' => true],
                    ['text' => 'Let\'s deal with this thing right now.', 'correct' => false],
                    ['text' => 'This stuff needs sorting out quick.', 'correct' => false],
                ],
                'points' => 15,
            ],
            [
                'text' => 'In the sentence "The thesis, which took three years to complete, was groundbreaking," what is the function of the clause?',
                'type' => 'mcq',
                'difficulty' => 3,
                'options' => [
                    ['text' => 'Essential restrictive clause', 'correct' => false],
                    ['text' => 'Non-essential descriptive clause', 'correct' => true],
                    ['text' => 'Independent clause', 'correct' => false],
                    ['text' => 'Subordinate clause of result', 'correct' => false],
                ],
                'points' => 15,
            ],
            [
                'text' => 'Which word best completes: "The committee will ___ the proposal before making a final decision."',
                'type' => 'mcq',
                'difficulty' => 3,
                'options' => [
                    ['text' => 'look at', 'correct' => false],
                    ['text' => 'check out', 'correct' => false],
                    ['text' => 'scrutinize', 'correct' => true],
                    ['text' => 'see', 'correct' => false],
                ],
                'points' => 15,
            ],
        ];

        // Combine all questions
        $allQuestions = array_merge($beginnerQuestions, $intermediateQuestions, $advancedQuestions);

        $this->command->info('📝 Creating questions...');
        $progressBar = $this->command->getOutput()->createProgressBar(count($allQuestions));
        $progressBar->start();

        // Create questions
        foreach ($allQuestions as $index => $questionData) {
            $question = Question::create([
                'test_id' => $test->test_id,
                'question_text' => $questionData['text'],
                'type' => $questionData['type'],
                'difficulty_level' => $questionData['difficulty'],
                'points' => $questionData['points'],
                'order' => $index + 1,
                'status' => 'active',
                'correct_answer' => '', // ← 添加这个字段，MCQ 题目用选项标记正确答案
            ]);

            // Create options
            foreach ($questionData['options'] as $optionIndex => $optionData) {
                QuestionOption::create([
                    'question_id' => $question->question_id,
                    'option_text' => $optionData['text'],
                    'is_correct' => $optionData['correct'],
                    'option_label' => chr(65 + $optionIndex), // A, B, C, D
                ]);
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->command->newLine(2);

        // Calculate statistics
        $totalPoints = collect($allQuestions)->sum('points');
        $beginnerPoints = collect($beginnerQuestions)->sum('points');
        $intermediatePoints = collect($intermediateQuestions)->sum('points');
        $advancedPoints = collect($advancedQuestions)->sum('points');

        // Display summary
        $this->command->info('🎉 Placement Test Setup Complete!');
        $this->command->newLine();

        $this->command->table(
            ['Metric', 'Value'],
            [
                ['Test ID', $test->test_id],
                ['Total Questions', count($allQuestions)],
                ['Total Points', $totalPoints],
                ['Time Limit', $test->time_limit . ' minutes'],
                ['Passing Score', $test->passing_score . '%'],
                ['Status', $test->status],
            ]
        );

        $this->command->newLine();

        $this->command->table(
            ['Level', 'Questions', 'Points', 'Score Range'],
            [
                ['Beginner', count($beginnerQuestions), $beginnerPoints, '0-60%'],
                ['Intermediate', count($intermediateQuestions), $intermediatePoints, '61-85%'],
                ['Advanced', count($advancedQuestions), $advancedPoints, '86-100%'],
            ]
        );

        $this->command->newLine();
        $this->command->warn('⚠️  IMPORTANT: Add this to your .env file:');
        $this->command->line('PLACEMENT_TEST_ID=' . $test->test_id);
        $this->command->newLine();

        $this->command->info('✨ You can now use this placement test for student onboarding!');
    }
}
