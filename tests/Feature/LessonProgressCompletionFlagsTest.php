<?php

namespace Tests\Feature;

use App\Models\ExerciseSubmission;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonProgressCompletionFlagsTest extends TestCase
{
    use RefreshDatabase;

    public function test_exercise_completion_flag_requires_completed_passing_submissions(): void
    {
        $user = $this->createVerifiedStudent();
        $student = $user->studentProfile;

        $lesson = Lesson::create([
            'title' => 'Progress Guard Lesson',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 1,
            'required_tests' => 0,
            'min_exercise_score_percent' => 70,
        ]);

        $exercise = InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Passing Gate',
            'description' => 'Must pass to complete',
            'exercise_type' => 'drag_drop',
            'content' => ['prompt' => 'Match values'],
            'max_score' => 100,
            'is_active' => true,
        ]);

        $progress = LessonProgress::create([
            'student_id' => $student->student_id,
            'lesson_id' => $lesson->lesson_id,
            'status' => 'in_progress',
            'progress_percent' => 0,
            'content_completed' => true,
        ]);

        ExerciseSubmission::create([
            'exercise_id' => $exercise->exercise_id,
            'student_id' => $student->student_id,
            'score' => 69,
            'completed' => false,
            'answer_data' => ['score' => 69, 'completed' => false],
        ]);

        $progress->updateCompletionFlags();
        $progress->refresh();

        $this->assertFalse($progress->exercise_completed);
        $this->assertSame('in_progress', $progress->status);

        ExerciseSubmission::create([
            'exercise_id' => $exercise->exercise_id,
            'student_id' => $student->student_id,
            'score' => 70,
            'completed' => true,
            'answer_data' => ['score' => 70, 'completed' => true],
        ]);

        $progress->updateCompletionFlags();
        $progress->refresh();

        $this->assertTrue($progress->exercise_completed);
        $this->assertSame('completed', $progress->status);
    }

    private function createVerifiedStudent(): User
    {
        $user = User::create([
            'name' => 'Progress Tester',
            'email' => 'progress-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        return $user->fresh();
    }
}
