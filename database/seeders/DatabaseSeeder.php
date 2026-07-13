<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Order matters — later seeders depend on earlier data:
     *   Users → StudentProfiles → Lessons → (Exercises, Tests, LearningPaths) → Forum.
     * ForumSeeder needs 1 administrator + 10 students, which UserSeeder now guarantees.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,                 // admin + named students (+ factory top-up to 10)
            StudentProfileSeeder::class,       // profiles for the student users
            LessonsTableSeeder::class,         // lessons + sections
            InteractiveExerciseSeeder::class,  // exercises attached to lessons
            TestSeeder::class,                 // per-lesson quizzes
            PlacementTestSeeder::class,        // standalone placement test
            LearningPathSeeder::class,         // paths referencing lessons
            ForumSeeder::class,                // posts/replies by admin + students
        ]);
    }
}
