<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\StudentProfile;

class StudentProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get ONLY student users (not administrators)
        $students = User::where('role', 'student')->get();

        if ($students->isEmpty()) {
            $this->command->warn('No student users found. Please run UserSeeder first.');
            return;
        }

        foreach ($students as $student) {
            // Verify user is actually a student before creating profile
            if ($student->isStudent()) {
                StudentProfile::firstOrCreate(
                    ['user_Id' => $student->user_Id],
                    [
                        'current_points' => rand(0, 2500), // Random points for demo
                        'total_lessons_completed' => rand(0, 25), // Random lessons completed
                        'total_tests_taken' => rand(0, 15), // Random tests taken
                        'average_score' => rand(60, 98) + (rand(0, 99) / 100), // Random score between 60-98
                        'streak_days' => rand(0, 30), // Random streak
                        'last_activity_date' => now()->subDays(rand(0, 7))->toDateString(), // Activity within last week
                    ]
                );
            }
        }

        // Create specific example profiles ONLY for student users
        $exampleStudents = [
            [
                'email' => 'alice.wong@student.com',
                'points' => 1500,
                'lessons' => 15,
                'tests' => 8,
                'score' => 92.5,
                'streak' => 12,
            ],
            [
                'email' => 'bob.chen@student.com',
                'points' => 2200,
                'lessons' => 22,
                'tests' => 12,
                'score' => 88.3,
                'streak' => 5,
            ],
            [
                'email' => 'charlie.lim@student.com',
                'points' => 800,
                'lessons' => 8,
                'tests' => 5,
                'score' => 76.8,
                'streak' => 3,
            ],
            [
                'email' => 'diana.tan@student.com',
                'points' => 3100,
                'lessons' => 28,
                'tests' => 18,
                'score' => 94.7,
                'streak' => 21,
            ],
        ];

        foreach ($exampleStudents as $example) {
            $user = User::where('email', $example['email'])->first();

            // Double check: only create profile if user exists AND is a student
            if ($user && $user->isStudent()) {
                StudentProfile::updateOrCreate(
                    ['user_Id' => $user->user_Id],
                    [
                        'current_points' => $example['points'],
                        'total_lessons_completed' => $example['lessons'],
                        'total_tests_taken' => $example['tests'],
                        'average_score' => $example['score'],
                        'streak_days' => $example['streak'],
                        'last_activity_date' => now()->subDays(rand(0, 2))->toDateString(),
                    ]
                );
            }
        }

        $this->command->info('Student profiles created successfully for ' . $students->count() . ' student users.');

        // Show warning if administrator tries to have a profile
        $adminCount = User::where('role', 'administrator')->count();
        if ($adminCount > 0) {
            $this->command->info("Note: {$adminCount} administrator(s) found - no profiles created for them (administrators don't have student profiles).");
        }
    }
}
