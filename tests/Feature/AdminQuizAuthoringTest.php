<?php

namespace Tests\Feature;

use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Admins can create and edit quiz exercises, and the server refuses a quiz
 * it could not grade.
 *
 * Quizzes were only ever made by the seeder: the admin type picker had no
 * quiz entry, and the exercise requests accepted any content at all.
 */
class AdminQuizAuthoringTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'administrator']);
        $this->lesson = Lesson::create(['title' => 'Syntax', 'content' => 'Body', 'difficulty' => 'beginner', 'status' => 'active']);
    }

    public function test_an_admin_can_create_a_quiz(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.exercises.store'), $this->quiz([
                ['question' => 'Comment character?', 'options' => ['//', '#'], 'correct' => 1, 'points' => 20, 'explanation' => 'Python uses #.'],
                ['question' => 'Print output?', 'options' => ['echo()', 'print()', 'say()'], 'correct' => 1],
            ]))
            ->assertRedirect(route('admin.exercises.index'))
            ->assertSessionHasNoErrors();

        $quiz = InteractiveExercise::where('exercise_type', 'quiz')->sole();
        $this->assertSame(1, $quiz->content['questions'][0]['correct']);
        $this->assertSame('Python uses #.', $quiz->content['questions'][0]['explanation']);
        $this->assertSame(['echo()', 'print()', 'say()'], $quiz->content['questions'][1]['options']);
    }

    public function test_an_admin_can_edit_a_quiz(): void
    {
        $quiz = InteractiveExercise::create([
            'lesson_id' => $this->lesson->lesson_id,
            'title' => 'Old',
            'exercise_type' => 'quiz',
            'max_score' => 100,
            'content' => ['questions' => [['question' => 'Q?', 'options' => ['a', 'b'], 'correct' => 0]]],
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.exercises.update', $quiz), $this->quiz([
                ['question' => 'Q?', 'options' => ['a', 'b', 'c'], 'correct' => 2],
            ]))
            ->assertSessionHasNoErrors();

        $this->assertSame(2, $quiz->fresh()->content['questions'][0]['correct']);
    }

    public function test_a_quiz_the_server_could_not_grade_is_refused(): void
    {
        $cases = [
            'no questions' => [],
            'no correct option' => [['question' => 'Q?', 'options' => ['a', 'b']]],
            'correct past the options' => [['question' => 'Q?', 'options' => ['a', 'b'], 'correct' => 2]],
            'one option' => [['question' => 'Q?', 'options' => ['a'], 'correct' => 0]],
            'empty option' => [['question' => 'Q?', 'options' => ['a', ''], 'correct' => 0]],
            'empty question' => [['question' => '', 'options' => ['a', 'b'], 'correct' => 0]],
        ];

        foreach ($cases as $label => $questions) {
            $this->actingAs($this->admin)->post(route('admin.exercises.store'), $this->quiz($questions));

            $this->assertNotEmpty(session('errors')?->all() ?? [], "A quiz with {$label} was accepted.");
        }

        $this->assertSame(0, InteractiveExercise::count());
    }

    public function test_other_types_are_not_held_to_quiz_rules(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.exercises.store'), [
                'lesson_id' => $this->lesson->lesson_id,
                'title' => 'Match types',
                'exercise_type' => 'drag_drop',
                'max_score' => 100,
                'content' => ['items' => [], 'drop_zones' => []],
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame(1, InteractiveExercise::count());
    }

    private function quiz(array $questions): array
    {
        return [
            'lesson_id' => $this->lesson->lesson_id,
            'title' => 'Syntax quiz',
            'exercise_type' => 'quiz',
            'max_score' => 100,
            'is_active' => true,
            'content' => ['questions' => $questions],
        ];
    }
}
