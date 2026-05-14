<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\Test;
use App\Models\TestSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LessonShowTestProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_lesson_show_uses_best_completed_test_score_for_pass_progress(): void
    {
        $user = $this->createVerifiedStudent();
        $student = $user->studentProfile;

        $lesson = Lesson::create([
            'title' => 'Best Score Lesson',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 0,
            'required_tests' => 1,
            'min_exercise_score_percent' => 70,
        ]);

        $test = Test::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Checkpoint',
            'description' => 'Short quiz',
            'instructions' => 'Answer all questions',
            'time_limit' => 30,
            'max_attempts' => 3,
            'passing_score' => 70,
            'status' => 'active',
            'order' => 1,
            'test_type' => 'lesson',
        ]);

        LessonRegistration::create([
            'student_id' => $student->student_id,
            'lesson_id' => $lesson->lesson_id,
        ]);

        LessonProgress::create([
            'student_id' => $student->student_id,
            'lesson_id' => $lesson->lesson_id,
            'status' => 'in_progress',
            'progress_percent' => 0,
            'content_completed' => true,
        ]);

        TestSubmission::create([
            'test_id' => $test->test_id,
            'student_id' => $student->student_id,
            'attempt_number' => 1,
            'started_at' => now()->subMinutes(20),
            'submitted_at' => now()->subMinutes(15),
            'time_spent' => 300,
            'score' => 85,
            'total_questions' => 1,
            'correct_answers' => 1,
            'status' => 'submitted',
        ]);

        TestSubmission::create([
            'test_id' => $test->test_id,
            'student_id' => $student->student_id,
            'attempt_number' => 2,
            'started_at' => now()->subMinutes(10),
            'submitted_at' => now()->subMinutes(5),
            'time_spent' => 300,
            'score' => 50,
            'total_questions' => 1,
            'correct_answers' => 0,
            'status' => 'submitted',
        ]);

        $this->actingAs($user)
            ->get("/lessons/{$lesson->lesson_id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Lessons/Show')
                ->where("userProgress.tests.{$test->test_id}.best_score", '85.00')
                ->where("userProgress.tests.{$test->test_id}.latest_score", '50.00')
            );
    }

    private function createVerifiedStudent(): User
    {
        $user = User::create([
            'name' => 'Best Score Tester',
            'email' => 'best-score-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        return $user->fresh();
    }
}
