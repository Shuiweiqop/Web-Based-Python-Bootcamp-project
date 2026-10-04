<?php

namespace Tests\Feature;

use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\User;
use App\Services\ExerciseSubmissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

/**
 * A failed submission does not show the student what went wrong inside.
 *
 * The submit endpoint used to answer an unexpected exception with
 * 'Failed to submit exercise: '.$e->getMessage(), which put whatever the
 * exception said — a SQL statement, a file path — in front of the student.
 */
class ExerciseSubmitErrorTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_unexpected_failure_keeps_its_details_in_the_log(): void
    {
        $internal = 'SQLSTATE[23000]: Integrity constraint violation: insert into `exercise_submissions` (secret) at /var/www/app/Services/ExerciseSubmissionService.php';

        $this->mock(ExerciseSubmissionService::class)
            ->shouldReceive('submit')
            ->andThrow(new \RuntimeException($internal));

        Log::spy();

        [$user, $lesson, $exercise] = $this->readyToSubmit();

        $response = $this->actingAs($user)
            ->postJson("/lessons/{$lesson->lesson_id}/exercises/api/{$exercise->exercise_id}/submit", [
                'answer' => ['completed' => true, 'score' => 100],
            ])
            ->assertStatus(500)
            ->assertJsonPath('success', false);

        $this->assertStringNotContainsString('SQLSTATE', $response->getContent());
        $this->assertStringNotContainsString('/var/www', $response->getContent());

        Log::shouldHaveReceived('error')->withArgs(fn ($event, $context) => $event === 'exercise.submit.failed'
            && $context['exercise_id'] === $exercise->exercise_id
            && $context['error'] === $internal
        )->once();
    }

    private function readyToSubmit(): array
    {
        $user = User::create([
            'name' => 'Error Tester',
            'email' => 'error-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();
        $user = $user->fresh();

        $lesson = Lesson::create(['title' => 'L', 'content' => 'Body', 'difficulty' => 'beginner', 'status' => 'active']);
        $exercise = InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'E',
            'exercise_type' => 'maze_game',
            'max_score' => 100,
            'is_active' => true,
        ]);

        $student = $user->studentProfile;
        LessonRegistration::create(['student_id' => $student->student_id, 'lesson_id' => $lesson->lesson_id]);
        LessonProgress::create([
            'student_id' => $student->student_id,
            'lesson_id' => $lesson->lesson_id,
            'status' => 'in_progress',
            'progress_percent' => 0,
            'content_completed' => true,
        ]);

        return [$user, $lesson, $exercise];
    }
}
