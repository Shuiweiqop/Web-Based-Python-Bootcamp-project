<?php

namespace Tests\Feature;

use App\Models\ExerciseSubmission;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\User;
use App\Services\Grading\SortingGrader;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Sorting exercises are graded on the server.
 *
 * The page used to receive each item's correctOrder — and items stored in
 * the right order, with ids built from the time they were added — sort them
 * itself and post the score. Now none of that reaches the page, and the grade
 * is worked out from the order the student submits.
 */
class SortingExerciseGradingTest extends TestCase
{
    use RefreshDatabase;

    private const ITEMS = [
        ['id' => 'item-1700000000001', 'text' => 'Write the code', 'correctOrder' => 1],
        ['id' => 'item-1700000000002', 'text' => 'Run it', 'correctOrder' => 2],
        ['id' => 'item-1700000000003', 'text' => 'Read the error', 'correctOrder' => 3],
        ['id' => 'item-1700000000004', 'text' => 'Fix the bug', 'correctOrder' => 4],
    ];

    private User $user;

    private Lesson $lesson;

    private InteractiveExercise $exercise;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Sort Tester',
            'email' => 'sort-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);
        $this->user->forceFill(['email_verified_at' => now()])->save();
        $this->user = $this->user->fresh();

        $this->lesson = Lesson::create([
            'title' => 'Debugging',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 1,
            'required_tests' => 0,
        ]);

        $this->exercise = InteractiveExercise::create([
            'lesson_id' => $this->lesson->lesson_id,
            'title' => 'Debug loop',
            'exercise_type' => 'sorting',
            'max_score' => 100,
            'is_active' => true,
            'content' => ['instruction' => 'Put the steps in order', 'items' => self::ITEMS],
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

    public function test_the_page_cannot_work_out_the_order(): void
    {
        $items = $this->actingAs($this->user)
            ->getJson("/lessons/{$this->lesson->lesson_id}/exercises/api/{$this->exercise->exercise_id}")
            ->assertOk()
            ->json('exercise.content.items');

        $this->assertCount(4, $items);
        foreach ($items as $item) {
            $this->assertArrayNotHasKey('correctOrder', $item);
            $this->assertStringNotContainsString('1700000000', $item['id'], 'the stored id leaks the order');
        }
        $this->assertEqualsCanonicalizing(
            array_column(self::ITEMS, 'text'),
            array_column($items, 'text')
        );
    }

    public function test_items_are_shuffled_before_they_reach_the_page(): void
    {
        $grader = new SortingGrader;
        $content = ['items' => array_map(fn ($i) => ['id' => "item-$i", 'text' => "Step $i", 'correctOrder' => $i], range(1, 12))];

        // With 12 items, 20 shuffles all landing in the stored order is not
        // going to happen by chance.
        $orders = collect(range(1, 20))->map(fn () => array_column($grader->forStudent($content)['items'], 'text'));
        $this->assertTrue($orders->contains(fn ($o) => $o !== array_column($content['items'], 'text')));
    }

    public function test_a_forged_score_is_ignored(): void
    {
        $this->submit(['order' => array_reverse($this->publicIds()), 'completed' => true, 'score' => 100])
            ->assertOk()
            ->assertJsonPath('submission.score', 0)
            ->assertJsonPath('submission.completed', false)
            ->assertJsonPath('lesson_progress.lesson_completed', false);
    }

    public function test_the_correct_order_completes_the_lesson(): void
    {
        $this->submit(['order' => $this->publicIds(), 'completed' => false, 'score' => 0])
            ->assertOk()
            ->assertJsonPath('submission.score', 100)
            ->assertJsonPath('submission.completed', true)
            ->assertJsonPath('lesson_progress.lesson_completed', true);
    }

    public function test_each_right_position_counts_and_the_review_names_the_items(): void
    {
        [$write, $run, $read, $fix] = $this->publicIds();

        // Run and Read swapped: positions 1 and 4 right.
        $this->submit(['order' => [$write, $read, $run, $fix], 'completed' => true, 'score' => 100])
            ->assertOk()
            ->assertJsonPath('submission.score', 50)
            ->assertJsonPath('review.1.prompt', 'Position 2')
            ->assertJsonPath('review.1.answer', 'Read the error')
            ->assertJsonPath('review.1.correct_answer', 'Run it')
            ->assertJsonPath('review.1.is_correct', false)
            ->assertJsonPath('review.3.is_correct', true);

        $this->assertSame($read, ExerciseSubmission::sole()->answer_data['results'][1]['placed']);
    }

    public function test_unknown_or_missing_ids_score_nothing(): void
    {
        $grader = new SortingGrader;
        $content = ['items' => self::ITEMS];

        $this->assertSame(0, $grader->grade($content, ['order' => ['item-1700000000001', 'item-1700000000002']], 100)['score']);
        $this->assertSame(0, $grader->grade($content, [], 100)['score']);
        $this->assertSame(0, $grader->grade(['items' => []], ['order' => []], 100)['score']);
    }

    /** The ids the page receives, in the correct order. */
    private function publicIds(): array
    {
        $public = (new SortingGrader)->forStudent(['items' => self::ITEMS])['items'];
        $byText = array_column($public, 'id', 'text');

        return array_map(fn ($item) => $byText[$item['text']], self::ITEMS);
    }

    private function submit(array $answer)
    {
        return $this->actingAs($this->user)->postJson(
            "/lessons/{$this->lesson->lesson_id}/exercises/api/{$this->exercise->exercise_id}/submit",
            ['answer' => $answer, 'time_spent' => 30]
        );
    }
}
