<?php

namespace Tests\Feature;

use App\Models\DailyChallengeDefinition;
use App\Models\DailyChallengeProgress;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Exercise missions count distinct exercises, not submissions.
 *
 * Mission events were keyed by submission id, and every submission gets a
 * new one, so "Practice Combo" (complete 3 exercises today) was met by
 * submitting a single exercise three times — no forged request needed.
 */
class ExerciseChallengeCountingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Mission Tester',
            'email' => 'mission-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);
        $this->user->forceFill(['email_verified_at' => now()])->save();
        $this->user = $this->user->fresh();

        $this->lesson = Lesson::create([
            'title' => 'Mission Lesson',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 0,
            'required_exercises' => 10,
            'required_tests' => 0,
        ]);

        $student = $this->user->studentProfile;

        LessonRegistration::create([
            'student_id' => $student->student_id,
            'lesson_id' => $this->lesson->lesson_id,
        ]);

        LessonProgress::create([
            'student_id' => $student->student_id,
            'lesson_id' => $this->lesson->lesson_id,
            'status' => 'in_progress',
            'progress_percent' => 0,
            'content_completed' => true,
        ]);
    }

    public function test_resubmitting_one_exercise_counts_once_toward_missions(): void
    {
        $exercise = $this->makeExercise('Only one');

        $this->submit($exercise);
        $this->submit($exercise);
        $this->submit($exercise);

        $combo = $this->progressFor('daily_practice_combo');
        $this->assertSame(1, $combo->current_count);
        $this->assertFalse($combo->is_completed);

        // Focus Sprint (1 exercise) is still earned, once: 30 points.
        $this->assertSame(30, $this->user->studentProfile->fresh()->current_points);
    }

    public function test_three_different_exercises_complete_the_combo(): void
    {
        foreach (['First', 'Second', 'Third'] as $title) {
            $this->submit($this->makeExercise($title));
        }

        $combo = $this->progressFor('daily_practice_combo');
        $this->assertSame(3, $combo->current_count);
        $this->assertTrue($combo->is_completed);
    }

    private function makeExercise(string $title): InteractiveExercise
    {
        return InteractiveExercise::create([
            'lesson_id' => $this->lesson->lesson_id,
            'title' => $title,
            // A type that still reports its own score: this tests what
            // happens after a completed submission, not how it is graded.
            'exercise_type' => 'maze_game',
            'content' => ['prompt' => 'Match values'],
            'max_score' => 100,
            'is_active' => true,
        ]);
    }

    private function submit(InteractiveExercise $exercise): void
    {
        $this->actingAs($this->user)
            ->postJson(
                "/lessons/{$this->lesson->lesson_id}/exercises/api/{$exercise->exercise_id}/submit",
                ['answer' => ['completed' => true, 'score' => 100], 'time_spent' => 30]
            )
            ->assertOk();
    }

    private function progressFor(string $code): DailyChallengeProgress
    {
        $definition = DailyChallengeDefinition::where('code', $code)->firstOrFail();

        return DailyChallengeProgress::where('student_id', $this->user->studentProfile->student_id)
            ->where('challenge_definition_id', $definition->challenge_definition_id)
            ->firstOrFail();
    }
}
