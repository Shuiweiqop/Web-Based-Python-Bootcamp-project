<?php

namespace Tests\Feature;

use App\Models\ExerciseSubmission;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonManualCompletionRequirementsTest extends TestCase
{
    use RefreshDatabase;

    public function test_manual_completion_uses_required_exercise_count_not_all_active_exercises(): void
    {
        $user = $this->createVerifiedStudent();
        $student = $user->studentProfile;

        $lesson = Lesson::create([
            'title' => 'Optional Exercise Lesson',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 1,
            'required_tests' => 0,
            'min_exercise_score_percent' => 70,
        ]);

        $requiredExercise = $this->createExercise($lesson, 'Required Practice');
        $this->createExercise($lesson, 'Optional Stretch');
        $lesson->update(['required_exercises' => 1]);
        $lesson->refresh();

        LessonRegistration::create([
            'student_id' => $student->student_id,
            'lesson_id' => $lesson->lesson_id,
            'registration_status' => 'active',
        ]);

        LessonProgress::create([
            'student_id' => $student->student_id,
            'lesson_id' => $lesson->lesson_id,
            'status' => 'in_progress',
            'progress_percent' => 50,
            'content_completed' => true,
        ]);

        ExerciseSubmission::create([
            'student_id' => $student->student_id,
            'exercise_id' => $requiredExercise->exercise_id,
            'score' => 100,
            'completed' => true,
            'time_taken' => 30,
            'answer_data' => ['completed' => true],
        ]);

        $response = $this->actingAs($user)
            ->from("/lessons/{$lesson->lesson_id}")
            ->post("/lessons/{$lesson->lesson_id}/complete");

        $response->assertRedirect("/lessons/{$lesson->lesson_id}");
        $response->assertSessionHasNoErrors();

        $registration = LessonRegistration::where('student_id', $student->student_id)
            ->where('lesson_id', $lesson->lesson_id)
            ->firstOrFail();
        $progress = LessonProgress::where('student_id', $student->student_id)
            ->where('lesson_id', $lesson->lesson_id)
            ->firstOrFail();
        $student->refresh();

        $this->assertSame('completed', $registration->registration_status);
        $this->assertSame(100, $registration->completion_points_awarded);
        $this->assertSame('completed', $progress->status);
        $this->assertTrue($progress->reward_granted);
        $this->assertSame(100, $student->current_points);
        $this->assertSame(1, $student->total_lessons_completed);
    }

    private function createVerifiedStudent(): User
    {
        $user = User::create([
            'name' => 'Manual Completion Tester',
            'email' => 'manual-completion-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        return $user->fresh();
    }

    private function createExercise(Lesson $lesson, string $title): InteractiveExercise
    {
        return InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => $title,
            'description' => 'Simple exercise',
            'exercise_type' => 'drag_drop',
            'content' => ['prompt' => 'Match values'],
            'max_score' => 100,
            'is_active' => true,
        ]);
    }
}
