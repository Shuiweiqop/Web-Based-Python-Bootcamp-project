<?php

namespace Tests\Feature;

use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\User;
use App\Services\DailyChallengeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class ExerciseSubmissionLessonCompletionSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_exercise_submit_completion_syncs_registration_progress_and_student_stats_once(): void
    {
        $user = $this->createVerifiedStudent();
        $student = $user->studentProfile;

        $lesson = Lesson::create([
            'title' => 'Synced Completion Lesson',
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
            'title' => 'Complete Me',
            'description' => 'Simple exercise',
            'exercise_type' => 'drag_drop',
            'content' => ['prompt' => 'Match values'],
            'max_score' => 100,
            'is_active' => true,
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

        $mock = Mockery::mock(DailyChallengeService::class);
        $mock->shouldReceive('recordExerciseCompletion')->twice()->andReturn([
            'show_toast' => false,
            'points_earned' => 0,
            'missions_updated' => [],
            'missions_completed' => [],
            'bonuses_earned' => [],
        ]);
        $this->app->instance(DailyChallengeService::class, $mock);

        $payload = [
            'answer' => [
                'completed' => true,
                'score' => 100,
            ],
            'time_spent' => 45,
        ];

        $this->actingAs($user)
            ->postJson("/lessons/{$lesson->lesson_id}/exercises/api/{$exercise->exercise_id}/submit", $payload)
            ->assertOk()
            ->assertJsonPath('lesson_progress.lesson_completed', true);

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

        $this->actingAs($user)
            ->postJson("/lessons/{$lesson->lesson_id}/exercises/api/{$exercise->exercise_id}/submit", $payload)
            ->assertOk();

        $student->refresh();
        $this->assertSame(100, $student->current_points);
        $this->assertSame(1, $student->total_lessons_completed);
    }

    private function createVerifiedStudent(): User
    {
        $user = User::create([
            'name' => 'Completion Sync Tester',
            'email' => 'completion-sync-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        return $user->fresh();
    }
}
