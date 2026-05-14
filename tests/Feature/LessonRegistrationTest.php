<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\LessonRegistration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register_again_after_cancelling_lesson_registration(): void
    {
        $user = $this->createVerifiedStudent();
        $student = $user->studentProfile;

        $lesson = Lesson::create([
            'title' => 'Rejoinable Lesson',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 0,
            'required_tests' => 0,
            'min_exercise_score_percent' => 70,
        ]);

        $this->actingAs($user)
            ->from("/lessons/{$lesson->lesson_id}")
            ->post("/lessons/{$lesson->lesson_id}/register")
            ->assertRedirect("/lessons/{$lesson->lesson_id}");

        $this->actingAs($user)
            ->from("/lessons/{$lesson->lesson_id}")
            ->delete("/lessons/{$lesson->lesson_id}/cancel-registration")
            ->assertRedirect("/lessons/{$lesson->lesson_id}");

        $this->assertSame(
            'cancelled',
            LessonRegistration::where('student_id', $student->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->value('registration_status')
        );

        $this->actingAs($user)
            ->from("/lessons/{$lesson->lesson_id}")
            ->post("/lessons/{$lesson->lesson_id}/register")
            ->assertRedirect("/lessons/{$lesson->lesson_id}")
            ->assertSessionHas('success', 'Successfully registered for lesson!');

        $this->assertSame(1, LessonRegistration::where('student_id', $student->student_id)
            ->where('lesson_id', $lesson->lesson_id)
            ->count());

        $this->assertSame(
            'active',
            LessonRegistration::where('student_id', $student->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->value('registration_status')
        );
    }

    private function createVerifiedStudent(): User
    {
        $user = User::create([
            'name' => 'Registration Tester',
            'email' => 'registration-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        return $user->fresh();
    }
}
