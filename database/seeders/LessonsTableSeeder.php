<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LessonsTableSeeder extends Seeder
{
    public function run(): void
    {
        $lessons = [
            // Beginner Python Lessons
            [
                'title' => 'Introduction to Python Programming',
                'description' => 'Learn Python basics including syntax, variables, and your first "Hello World" program. Perfect for complete beginners.',
                'difficulty' => 'beginner',
                'estimated_duration' => 30,
                'video_url' => 'https://example.com/videos/python-intro',
                'status' => 'active',
                'completion_reward_points' => 100,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Python Variables and Data Types',
                'description' => 'Understanding different data types in Python: strings, integers, floats, booleans, and how to work with variables.',
                'difficulty' => 'beginner',
                'estimated_duration' => 25,
                'video_url' => 'https://example.com/videos/python-variables',
                'status' => 'active',
                'completion_reward_points' => 80,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Working with Strings in Python',
                'description' => 'Learn string manipulation, formatting, and common string methods. Practice with text processing examples.',
                'difficulty' => 'beginner',
                'estimated_duration' => 35,
                'video_url' => 'https://example.com/videos/python-strings',
                'status' => 'active',
                'completion_reward_points' => 90,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Python Lists and Basic Operations',
                'description' => 'Introduction to Python lists: creating, accessing, modifying, and common list methods and operations.',
                'difficulty' => 'beginner',
                'estimated_duration' => 40,
                'video_url' => 'https://example.com/videos/python-lists',
                'status' => 'active',
                'completion_reward_points' => 100,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Python If Statements and Conditions',
                'description' => 'Learn conditional logic in Python using if, elif, and else statements. Practice with decision-making programs.',
                'difficulty' => 'beginner',
                'estimated_duration' => 30,
                'video_url' => 'https://example.com/videos/python-conditionals',
                'status' => 'active',
                'completion_reward_points' => 90,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],

            // Intermediate Python Lessons
            [
                'title' => 'Python Loops: For and While',
                'description' => 'Master Python loops including for loops, while loops, and loop control statements like break and continue.',
                'difficulty' => 'intermediate',
                'estimated_duration' => 45,
                'video_url' => 'https://example.com/videos/python-loops',
                'status' => 'active',
                'completion_reward_points' => 120,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Python Functions and Parameters',
                'description' => 'Learn to create and use functions in Python including parameters, return values, and local vs global scope.',
                'difficulty' => 'intermediate',
                'estimated_duration' => 50,
                'video_url' => 'https://example.com/videos/python-functions',
                'status' => 'active',
                'completion_reward_points' => 140,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Python Dictionaries and Key-Value Pairs',
                'description' => 'Working with Python dictionaries: creating, accessing, modifying, and iterating through key-value pairs.',
                'difficulty' => 'intermediate',
                'estimated_duration' => 40,
                'video_url' => 'https://example.com/videos/python-dictionaries',
                'status' => 'active',
                'completion_reward_points' => 130,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'File Handling in Python',
                'description' => 'Learn to read from and write to files in Python. Practice with text files and basic file operations.',
                'difficulty' => 'intermediate',
                'estimated_duration' => 35,
                'video_url' => 'https://example.com/videos/python-files',
                'status' => 'active',
                'completion_reward_points' => 150,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Exception Handling with Try-Except',
                'description' => 'Handle errors gracefully in Python using try-except blocks and understanding common exception types.',
                'difficulty' => 'intermediate',
                'estimated_duration' => 30,
                'video_url' => 'https://example.com/videos/python-exceptions',
                'status' => 'active',
                'completion_reward_points' => 120,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],

            // Advanced Python Lessons
            [
                'title' => 'Python Classes and Object-Oriented Programming',
                'description' => 'Introduction to OOP in Python: creating classes, objects, methods, and understanding inheritance basics.',
                'difficulty' => 'advanced',
                'estimated_duration' => 60,
                'video_url' => 'https://example.com/videos/python-oop',
                'status' => 'active',
                'completion_reward_points' => 200,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Working with Python Modules and Packages',
                'description' => 'Learn to import and use Python modules, create your own modules, and work with popular packages.',
                'difficulty' => 'advanced',
                'estimated_duration' => 45,
                'video_url' => 'https://example.com/videos/python-modules',
                'status' => 'active',
                'completion_reward_points' => 180,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Python List Comprehensions and Generators',
                'description' => 'Master advanced Python features like list comprehensions, dictionary comprehensions, and generator expressions.',
                'difficulty' => 'advanced',
                'estimated_duration' => 40,
                'video_url' => 'https://example.com/videos/python-comprehensions',
                'status' => 'active',
                'completion_reward_points' => 170,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Python Decorators and Advanced Functions',
                'description' => 'Understand Python decorators, lambda functions, and advanced function concepts for cleaner code.',
                'difficulty' => 'advanced',
                'estimated_duration' => 50,
                'video_url' => 'https://example.com/videos/python-decorators',
                'status' => 'active',
                'completion_reward_points' => 190,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Data Analysis with Python and Pandas',
                'description' => 'Introduction to data analysis using Python pandas library for reading, manipulating, and analyzing data.',
                'difficulty' => 'advanced',
                'estimated_duration' => 70,
                'video_url' => 'https://example.com/videos/python-pandas',
                'status' => 'active',
                'completion_reward_points' => 220,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],

            // Draft/Inactive Lessons
            [
                'title' => 'Python Web Scraping Basics',
                'description' => 'Learn to extract data from websites using Python requests and BeautifulSoup libraries.',
                'difficulty' => 'intermediate',
                'estimated_duration' => 55,
                'video_url' => null,
                'status' => 'draft',
                'completion_reward_points' => 160,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'title' => 'Python GUI Development with Tkinter',
                'description' => 'Create desktop applications with Python using the Tkinter library for graphical user interfaces.',
                'difficulty' => 'advanced',
                'estimated_duration' => 80,
                'video_url' => 'https://example.com/videos/python-gui',
                'status' => 'inactive',
                'completion_reward_points' => 200,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];

        DB::table('lessons')->insert($lessons);
    }
}
