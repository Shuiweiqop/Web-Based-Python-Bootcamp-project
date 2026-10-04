<?php

namespace Tests\Feature;

use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\User;
use App\Services\Grading\MemoryMatchGrader;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Memory match is scored from the turns the server saw.
 *
 * The page used to hold every pair (card ids even read pair-1-prompt /
 * pair-1-answer), decide matches itself, and post a score built from its own
 * count of misses and streaks. Now it gets an unpaired deck, asks the server
 * about each turn, and the server scores the run it recorded.
 */
class MemoryMatchExerciseGradingTest extends TestCase
{
    use RefreshDatabase;

    private const PAIRS = [
        ['id' => 'p1', 'prompt' => 'len()', 'answer' => 'Length of a sequence'],
        ['id' => 'p2', 'prompt' => 'print()', 'answer' => 'Write to the screen'],
        ['id' => 'p3', 'prompt' => 'input()', 'answer' => 'Read from the keyboard'],
    ];

    private User $user;

    private Lesson $lesson;

    private InteractiveExercise $exercise;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = $this->makeStudent('memory');

        $this->lesson = Lesson::create([
            'title' => 'Built-ins',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 1,
            'required_tests' => 0,
        ]);

        $this->exercise = InteractiveExercise::create([
            'lesson_id' => $this->lesson->lesson_id,
            'title' => 'Match the built-ins',
            'exercise_type' => 'memory_match',
            'max_score' => 100,
            'is_active' => true,
            'content' => ['instructions' => 'Match each function to what it does', 'pairs' => self::PAIRS],
        ]);

        $this->prepare($this->user);
    }

    public function test_the_page_gets_a_deck_with_no_pairing(): void
    {
        $content = $this->actingAs($this->user)
            ->getJson($this->apiUrl())
            ->assertOk()
            ->json('exercise.content');

        $this->assertArrayNotHasKey('pairs', $content);
        $this->assertCount(6, $content['cards']);
        foreach ($content['cards'] as $card) {
            $this->assertSame(['id', 'label', 'role'], array_keys($card));
            $this->assertStringNotContainsString('p1', $card['id']);
        }
        $this->assertEqualsCanonicalizing(
            [...array_column(self::PAIRS, 'prompt'), ...array_column(self::PAIRS, 'answer')],
            array_column($content['cards'], 'label')
        );
    }

    public function test_flipping_reports_matches_and_misses(): void
    {
        $this->flip('run-a', 'len()', 'Length of a sequence')
            ->assertOk()
            ->assertJson(['success' => true, 'match' => true, 'matched_pairs' => 1, 'total_pairs' => 3]);

        $this->flip('run-a', 'print()', 'Read from the keyboard')
            ->assertOk()
            ->assertJson(['match' => false, 'matched_pairs' => 1]);

        // Two prompts are never a pair.
        $this->flip('run-a', 'print()', 'input()')->assertJson(['match' => false]);
    }

    public function test_bad_turns_are_refused(): void
    {
        $this->flip('run-a', 'len()', 'Length of a sequence')->assertOk();

        $this->flip('run-a', 'len()', 'Write to the screen')->assertStatus(422);
        $this->flip('run-a', 'print()', 'print()')->assertStatus(422);
        $this->actingAs($this->user)->postJson($this->apiUrl().'/flip', ['run' => 'run-a', 'first' => 'p2-prompt', 'second' => 'p2-answer'])->assertStatus(422);
        $this->actingAs($this->user)->postJson($this->apiUrl().'/flip', ['run' => 'bad run!', 'first' => 'x', 'second' => 'y'])->assertStatus(422);
    }

    public function test_a_perfect_run_scores_full_marks_and_a_forged_score_is_ignored(): void
    {
        foreach (self::PAIRS as $pair) {
            $this->flip('run-a', $pair['prompt'], $pair['answer'])->assertJson(['match' => true]);
        }

        $this->submit(['run' => 'run-a', 'completed' => false, 'score' => 0])
            ->assertOk()
            ->assertJsonPath('submission.score', 100)
            ->assertJsonPath('submission.completed', true)
            ->assertJsonPath('lesson_progress.lesson_completed', true);
    }

    public function test_misses_and_streaks_score_with_the_games_formula(): void
    {
        // Two misses, then all three pairs in a row: 3 found of 5 attempts,
        // accuracy 60% (floored to 70%), best streak 3 (+6).
        $this->flip('run-a', 'len()', 'Write to the screen');
        $this->flip('run-a', 'print()', 'Read from the keyboard');
        foreach (self::PAIRS as $pair) {
            $this->flip('run-a', $pair['prompt'], $pair['answer']);
        }

        // round(100 * 1 * 0.7 + 6) = 76
        $this->submit(['run' => 'run-a', 'completed' => true, 'score' => 100])
            ->assertOk()
            ->assertJsonPath('submission.score', 76);
    }

    public function test_a_half_played_run_counts_what_was_found(): void
    {
        $this->flip('run-a', 'len()', 'Length of a sequence');

        // round(100 * 1/3 * 1.0 + 2) = 35
        $this->submit(['run' => 'run-a', 'completed' => true, 'score' => 100])
            ->assertOk()
            ->assertJsonPath('submission.score', 35)
            ->assertJsonPath('submission.completed', false)
            ->assertJsonPath('review.0.is_correct', true)
            ->assertJsonPath('review.1.answer', null)
            ->assertJsonPath('review.1.correct_answer', 'Write to the screen');
    }

    public function test_a_run_scores_once_and_only_for_its_own_student(): void
    {
        foreach (self::PAIRS as $pair) {
            $this->flip('run-a', $pair['prompt'], $pair['answer']);
        }

        // Another student submitting the same run id gets nothing.
        $other = $this->makeStudent('other');
        $this->prepare($other);
        $this->actingAs($other)->postJson($this->apiUrl().'/submit', ['answer' => ['run' => 'run-a', 'completed' => true, 'score' => 100]])
            ->assertOk()
            ->assertJsonPath('submission.score', 0);

        $this->submit(['run' => 'run-a', 'completed' => true, 'score' => 100])->assertJsonPath('submission.score', 100);

        // Submitting the same run again finds it already scored.
        $this->submit(['run' => 'run-a', 'completed' => true, 'score' => 100])->assertJsonPath('submission.score', 0);
    }

    public function test_no_run_scores_nothing(): void
    {
        $this->submit(['completed' => true, 'score' => 100])
            ->assertOk()
            ->assertJsonPath('submission.score', 0);
    }

    private function flip(string $run, string $firstLabel, string $secondLabel)
    {
        $ids = $this->cardIds();

        return $this->actingAs($this->user)->postJson($this->apiUrl().'/flip', [
            'run' => $run,
            'first' => $ids[$firstLabel],
            'second' => $ids[$secondLabel],
        ]);
    }

    /** The ids the page receives, by card label. */
    private function cardIds(): array
    {
        $cards = (new MemoryMatchGrader)->forStudent(['pairs' => self::PAIRS])['cards'];

        return array_column($cards, 'id', 'label');
    }

    private function submit(array $answer)
    {
        return $this->actingAs($this->user)->postJson($this->apiUrl().'/submit', ['answer' => $answer, 'time_spent' => 30]);
    }

    private function apiUrl(): string
    {
        return "/lessons/{$this->lesson->lesson_id}/exercises/api/{$this->exercise->exercise_id}";
    }

    private function makeStudent(string $name): User
    {
        $user = User::create([
            'name' => ucfirst($name).' Tester',
            'email' => $name.'-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();

        return $user->fresh();
    }

    private function prepare(User $user): void
    {
        $student = $user->studentProfile;

        LessonRegistration::create(['student_id' => $student->student_id, 'lesson_id' => $this->lesson->lesson_id]);
        LessonProgress::create([
            'student_id' => $student->student_id,
            'lesson_id' => $this->lesson->lesson_id,
            'status' => 'in_progress',
            'progress_percent' => 0,
            'content_completed' => true,
        ]);
    }
}
