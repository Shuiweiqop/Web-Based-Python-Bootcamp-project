<?php

namespace Tests\Feature;

use App\Models\ExerciseSubmission;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\User;
use App\Services\Grading\DragDropGrader;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Drag-and-drop exercises are graded on the server.
 *
 * The page used to receive each item's correct_zone, mark every placement
 * right or wrong on the spot — naming the right zone when it was wrong — and
 * post the score. Every student reached 100 by following the hints. Now the
 * page learns nothing until it submits, and the server grades the placements.
 */
class DragDropExerciseGradingTest extends TestCase
{
    use RefreshDatabase;

    // Shaped like the seeded exercise: item n belongs in zone_n.
    private const CONTENT = [
        'instructions' => 'Drag each data type to its matching value',
        'items' => [
            ['id' => 1, 'text' => 'int', 'correct_zone' => 'zone_1'],
            ['id' => 2, 'text' => 'float', 'correct_zone' => 'zone_2'],
            ['id' => 3, 'text' => 'str', 'correct_zone' => 'zone_3'],
            ['id' => 4, 'text' => 'bool', 'correct_zone' => 'zone_4'],
        ],
        'drop_zones' => [
            ['id' => 'zone_1', 'name' => '42', 'max_items' => 1],
            ['id' => 'zone_2', 'name' => '3.14', 'max_items' => 1],
            ['id' => 'zone_3', 'name' => '"Hello"', 'max_items' => 1],
            ['id' => 'zone_4', 'name' => 'True', 'max_items' => 1],
        ],
    ];

    private User $user;

    private Lesson $lesson;

    private InteractiveExercise $exercise;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Drag Tester',
            'email' => 'drag-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);
        $this->user->forceFill(['email_verified_at' => now()])->save();
        $this->user = $this->user->fresh();

        $this->lesson = Lesson::create([
            'title' => 'Types',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 1,
            'required_tests' => 0,
        ]);

        $this->exercise = InteractiveExercise::create([
            'lesson_id' => $this->lesson->lesson_id,
            'title' => 'Data Type Matching',
            'exercise_type' => 'drag_drop',
            'max_score' => 100,
            'is_active' => true,
            'content' => self::CONTENT,
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

    public function test_the_page_cannot_pair_items_with_zones(): void
    {
        $content = $this->actingAs($this->user)
            ->getJson("/lessons/{$this->lesson->lesson_id}/exercises/api/{$this->exercise->exercise_id}")
            ->assertOk()
            ->json('exercise.content');

        foreach ($content['items'] as $item) {
            $this->assertArrayNotHasKey('correct_zone', $item);
            $this->assertNotContains($item['id'], [1, 2, 3, 4, '1', '2', '3', '4'], 'item n would pair with zone_n');
        }
        $this->assertSame(['zone_1', 'zone_2', 'zone_3', 'zone_4'], array_column($content['drop_zones'], 'id'));
    }

    public function test_a_forged_score_is_ignored(): void
    {
        [$int, $float, $str, $bool] = $this->publicIds();

        $this->submit(['placements' => [$int => 'zone_4', $float => 'zone_3', $str => 'zone_2', $bool => 'zone_1'], 'completed' => true, 'score' => 100])
            ->assertOk()
            ->assertJsonPath('submission.score', 0)
            ->assertJsonPath('submission.completed', false)
            ->assertJsonPath('lesson_progress.lesson_completed', false);
    }

    public function test_every_item_in_its_zone_completes_the_lesson(): void
    {
        [$int, $float, $str, $bool] = $this->publicIds();

        $this->submit(['placements' => [$int => 'zone_1', $float => 'zone_2', $str => 'zone_3', $bool => 'zone_4'], 'completed' => false, 'score' => 0])
            ->assertOk()
            ->assertJsonPath('submission.score', 100)
            ->assertJsonPath('submission.completed', true)
            ->assertJsonPath('lesson_progress.lesson_completed', true);
    }

    public function test_unplaced_items_count_as_wrong_and_the_review_names_the_zones(): void
    {
        [$int, $float, $str] = $this->publicIds();

        // 3 placed, 2 of them right; bool left in the tray.
        $this->submit(['placements' => [$int => 'zone_1', $float => 'zone_2', $str => 'zone_4'], 'completed' => true, 'score' => 100])
            ->assertOk()
            ->assertJsonPath('submission.score', 50)
            ->assertJsonPath('review.2.prompt', 'str')
            ->assertJsonPath('review.2.answer', 'True')
            ->assertJsonPath('review.2.correct_answer', '"Hello"')
            ->assertJsonPath('review.3.answer', null)
            ->assertJsonPath('review.3.is_correct', false);

        $this->assertSame('zone_4', ExerciseSubmission::sole()->answer_data['results'][2]['placed']);
    }

    public function test_stored_ids_and_unknown_zones_score_nothing(): void
    {
        $grader = new DragDropGrader;

        $this->assertSame(0, $grader->grade(self::CONTENT, ['placements' => [1 => 'zone_1', 2 => 'zone_2']], 100)['score']);
        $this->assertSame(0, $grader->grade(self::CONTENT, ['placements' => array_fill_keys($this->publicIds(), 'zone_9')], 100)['score']);
        $this->assertSame(0, $grader->grade(self::CONTENT, [], 100)['score']);
    }

    /** The ids the page receives, in the stored order (int, float, str, bool). */
    private function publicIds(): array
    {
        $public = (new DragDropGrader)->forStudent(self::CONTENT)['items'];
        $byText = array_column($public, 'id', 'text');

        return array_map(fn ($item) => $byText[$item['text']], self::CONTENT['items']);
    }

    private function submit(array $answer)
    {
        return $this->actingAs($this->user)->postJson(
            "/lessons/{$this->lesson->lesson_id}/exercises/api/{$this->exercise->exercise_id}/submit",
            ['answer' => $answer, 'time_spent' => 30]
        );
    }
}
