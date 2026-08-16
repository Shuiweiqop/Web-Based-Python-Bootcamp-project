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
     * ConceptSeeder has no dependencies but must run FIRST: PlacementTestSeeder
     * resolves concept slugs to attach baseline tags, and ConceptTagSeeder needs
     * the taxonomy to exist. Without it the ability model gets no evidence.
     */
    public function run(): void
    {
        $this->call([
            ConceptSeeder::class,              // knowledge-tracing concept taxonomy (no deps)
            UserSeeder::class,                 // admin + named students (+ factory top-up to 10)
            StudentProfileSeeder::class,       // profiles for the student users
            LessonsTableSeeder::class,         // lessons + sections
            InteractiveExerciseSeeder::class,  // exercises attached to lessons
            TestSeeder::class,                 // per-lesson quizzes
            PlacementTestSeeder::class,        // standalone placement test
            LearningPathSeeder::class,         // paths referencing lessons
            ForumSeeder::class,                // posts/replies by admin + students
            ConceptTagSeeder::class,           // tags questions/exercises; needs both to exist
        ]);
    }
}
