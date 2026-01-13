<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LearningPath;
use App\Models\Lesson;
use Illuminate\Support\Facades\DB;

class LearningPathSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🌱 Seeding Learning Paths...');

        // Create 3 learning paths
        $beginnerPath = LearningPath::create([
            'title' => 'Beginner Programming Path',
            'description' => 'Perfect for complete beginners with no prior programming experience',
            'learning_outcomes' => 'Master basic programming concepts, variables, loops, and functions',
            'prerequisites' => 'No prerequisites required',
            'difficulty_level' => 'beginner',
            'min_score_required' => 0,
            'max_score_required' => 60,
            'estimated_duration_hours' => 40,
            'is_active' => true,
            'is_featured' => true,
            'display_order' => 1,
            'icon' => 'book',
            'color' => '#10B981',
        ]);

        $intermediatePath = LearningPath::create([
            'title' => 'Intermediate Programming Path',
            'description' => 'For learners with basic programming knowledge',
            'learning_outcomes' => 'Learn OOP, data structures, algorithms, and best practices',
            'prerequisites' => 'Basic understanding of programming fundamentals',
            'difficulty_level' => 'intermediate',
            'min_score_required' => 61,
            'max_score_required' => 85,
            'estimated_duration_hours' => 60,
            'is_active' => true,
            'is_featured' => true,
            'display_order' => 2,
            'icon' => 'code',
            'color' => '#3B82F6',
        ]);

        $advancedPath = LearningPath::create([
            'title' => 'Advanced Programming Path',
            'description' => 'For experienced developers seeking mastery',
            'learning_outcomes' => 'Master advanced patterns, system design, and optimization',
            'prerequisites' => 'Solid understanding of OOP and data structures',
            'difficulty_level' => 'advanced',
            'min_score_required' => 86,
            'max_score_required' => 100,
            'estimated_duration_hours' => 80,
            'is_active' => true,
            'is_featured' => false,
            'display_order' => 3,
            'icon' => 'rocket',
            'color' => '#8B5CF6',
        ]);

        $this->command->info('✅ Created 3 learning paths');

        // Add lessons to paths (if lessons exist)
        $lessons = Lesson::limit(5)->get();

        if ($lessons->count() > 0) {
            foreach ($lessons as $index => $lesson) {
                // Add to Beginner Path
                DB::table('learning_path_lessons')->insert([
                    'path_id' => $beginnerPath->path_id,
                    'lesson_id' => $lesson->lesson_id,
                    'sequence_order' => $index + 1,
                    'is_required' => true,
                    'unlock_after_previous' => $index > 0,
                    'estimated_duration_minutes' => 60,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Add to Intermediate Path
                DB::table('learning_path_lessons')->insert([
                    'path_id' => $intermediatePath->path_id,
                    'lesson_id' => $lesson->lesson_id,
                    'sequence_order' => $index + 1,
                    'is_required' => true,
                    'unlock_after_previous' => true,
                    'estimated_duration_minutes' => 90,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $this->command->info("✅ Added {$lessons->count()} lessons to each path");
        } else {
            $this->command->warn('⚠️ No lessons found. Create lessons first.');
        }

        $this->command->info('🎉 Learning Path seeding completed!');
    }
}
