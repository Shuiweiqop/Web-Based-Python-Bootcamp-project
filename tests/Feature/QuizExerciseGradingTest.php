<?php

namespace Tests\Feature;

use App\Models\ExerciseSubmission;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\User;
use App\Services\Grading\QuizGrader;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Quiz exercises are graded on the server.
 *
 * The page used to receive each question's correct option, and the submit
 * endpoint stored whatever score the page reported. Now the answer key stays
 * on the server and the grade is worked out from the options picked.
 */
class QuizExerciseGradingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Lesson $lesson;

    private InteractiveExercise $quiz;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Quiz Tester',
            'email' => 'quiz-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);
        $this->user->forceFill(['email_verified_at' => now()])->save();
        $this->user = $this->user->fresh();

        $this->lesson = Lesson::create([
            'title' => 'Syntax',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 1,
            'required_tests' => 0,
        ]);

        $this->quiz = InteractiveExercise::create([
            'lesson_id' => $this->lesson->lesson_id,
            'title' => 'Python Syntax Quiz',
            'exercise_type' => 'quiz',
            'max_score' => 80,
            'is_active' => true,
            'content' => [
                'questions' => [
                    ['question' => 'Comment character?', 'options' => ['//', '#'], 'correct' => 1, 'points' => 20],
                    ['question' => 'Print output?', 'options' => ['echo()', 'print()'], 'correct' => 1, 'points' => 20],
                    ['question' => 'Indentation matters?', 'options' => ['Yes', 'No'], 'correct' => 0, 'points' => 20],
                    ['question' => 'Make a variable?', 'options' => ['int x = 5', 'x = 5'], 'correct' => 1, 'points' => 20, 'explanation' => 'No type keyword.'],
                ],
            ],
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

    public function test_the_page_does_not_receive_the_answer_key(): void
    {
        $this->actingAs($this->user)
            ->get("/lessons/{$this->lesson->lesson_id}/exercises/{$this->quiz->exercise_id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('exercise.content.questions.0.question', 'Comment character?')
                ->where('exercise.content.questions.0.options', ['//', '#'])
                ->missing('exercise.content.questions.0.correct')
                ->missing('exercise.content.questions.3.explanation')
            );

        $json = $this->actingAs($this->user)
            ->getJson("/lessons/{$this->lesson->lesson_id}/exercises/api/{$this->quiz->exercise_id}")
            ->assertOk()
            ->json('exercise.content.questions');

        foreach ($json as $question) {
            $this->assertArrayNotHasKey('correct', $question);
        }
    }

    public function test_a_forged_score_is_ignored(): void
    {
        $this->submit(['selections' => [0, 0, 1, 0], 'completed' => true, 'score' => 80])
            ->assertOk()
            ->assertJsonPath('submission.score', 0)
            ->assertJsonPath('submission.completed', false)
            ->assertJsonPath('lesson_progress.lesson_completed', false);

        $this->assertSame(0, $this->user->studentProfile->fresh()->current_points);
    }

    public function test_correct_selections_score_full_marks_and_complete_the_lesson(): void
    {
        $this->submit(['selections' => [1, 1, 0, 1], 'completed' => false, 'score' => 0])
            ->assertOk()
            ->assertJsonPath('submission.score', 80)
            ->assertJsonPath('submission.completed', true)
            ->assertJsonPath('review.3.is_correct', true)
            ->assertJsonPath('review.3.explanation', 'No type keyword.')
            ->assertJsonPath('lesson_progress.lesson_completed', true);

        $registration = LessonRegistration::where('student_id', $this->user->studentProfile->student_id)
            ->where('lesson_id', $this->lesson->lesson_id)
            ->firstOrFail();
        $this->assertSame(100, (int) $registration->completion_points_awarded);
    }

    public function test_results_reveal_the_correct_option_after_submitting(): void
    {
        $this->submit(['selections' => [1, 1, 1, null], 'completed' => true, 'score' => 80])
            ->assertOk()
            // 2 of 4 equally weighted questions: 40 of 80, under the 70% bar.
            ->assertJsonPath('submission.score', 40)
            ->assertJsonPath('submission.completed', false)
            ->assertJsonPath('review.2.prompt', 'Indentation matters?')
            ->assertJsonPath('review.2.answer', 'No')
            ->assertJsonPath('review.2.correct_answer', 'Yes')
            ->assertJsonPath('review.2.is_correct', false)
            ->assertJsonPath('review.3.answer', null);

        $stored = ExerciseSubmission::sole();
        $this->assertSame(40, (int) $stored->score);
        $this->assertSame([1, 1, 1, null], $stored->answer_data['selections']);
    }

    public function test_points_weight_questions_and_missing_points_share_equally(): void
    {
        $grader = new QuizGrader;

        $weighted = ['questions' => [
            ['options' => ['a', 'b'], 'correct' => 0, 'points' => 30],
            ['options' => ['a', 'b'], 'correct' => 0, 'points' => 10],
        ]];
        $this->assertSame(75, $grader->grade($weighted, ['selections' => [0, 1]], 100)['score']);

        $unweighted = ['questions' => [
            ['options' => ['a', 'b'], 'correct' => 0],
            ['options' => ['a', 'b'], 'correct' => 0],
            ['options' => ['a', 'b'], 'correct' => 0],
            ['options' => ['a', 'b'], 'correct' => 0],
        ]];
        $this->assertSame(25, $grader->grade($unweighted, ['selections' => [0]], 100)['score']);
        $this->assertSame(0, $grader->grade(['questions' => []], ['selections' => [0]], 100)['score']);
    }

    private function submit(array $answer)
    {
        return $this->actingAs($this->user)->postJson(
            "/lessons/{$this->lesson->lesson_id}/exercises/api/{$this->quiz->exercise_id}/submit",
            ['answer' => $answer, 'time_spent' => 30]
        );
    }
}
