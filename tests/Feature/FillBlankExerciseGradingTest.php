<?php

namespace Tests\Feature;

use App\Models\ExerciseSubmission;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\User;
use App\Services\Grading\FillBlankGrader;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Fill-in-the-blank exercises are graded on the server.
 *
 * The page used to receive every blank's correct answer and alternatives,
 * check the student's input itself and post the score. Now the answers stay
 * on the server and the grade is worked out from what was typed.
 */
class FillBlankExerciseGradingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Lesson $lesson;

    private InteractiveExercise $exercise;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'name' => 'Blank Tester',
            'email' => 'blank-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);
        $this->user->forceFill(['email_verified_at' => now()])->save();
        $this->user = $this->user->fresh();

        $this->lesson = Lesson::create([
            'title' => 'Basics',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 1,
            'required_tests' => 0,
        ]);

        $this->exercise = InteractiveExercise::create([
            'lesson_id' => $this->lesson->lesson_id,
            'title' => 'Fill the gaps',
            'exercise_type' => 'fill_blank',
            'max_score' => 100,
            'is_active' => true,
            'content' => [
                'sentences' => [
                    [
                        'text' => '___ is used to show output',
                        'blanks' => [['correctAnswer' => 'print', 'alternativeAnswers' => ['print()'], 'hint' => 'A built-in']],
                    ],
                    [
                        'text' => 'A ___ loop repeats while a ___ holds',
                        'blanks' => [['correctAnswer' => 'while'], ['correctAnswer' => 'condition']],
                    ],
                    [
                        'text' => 'Constants are written in ___',
                        'caseSensitive' => true,
                        'blanks' => [['correctAnswer' => 'UPPER_CASE']],
                    ],
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

    public function test_the_page_does_not_receive_the_answers(): void
    {
        $this->actingAs($this->user)
            ->get("/lessons/{$this->lesson->lesson_id}/exercises/{$this->exercise->exercise_id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('exercise.content.sentences.0.text', '___ is used to show output')
                ->where('exercise.content.sentences.0.blanks.0.hint', 'A built-in')
                ->missing('exercise.content.sentences.0.blanks.0.correctAnswer')
                ->missing('exercise.content.sentences.0.blanks.0.alternativeAnswers')
                ->missing('exercise.content.sentences.1.blanks.1.correctAnswer')
            );
    }

    public function test_a_forged_score_is_ignored(): void
    {
        $this->submit(['answers' => [['echo'], ['for', 'flag'], ['lower']], 'completed' => true, 'score' => 100])
            ->assertOk()
            ->assertJsonPath('submission.score', 0)
            ->assertJsonPath('submission.completed', false)
            ->assertJsonPath('lesson_progress.lesson_completed', false);
    }

    public function test_correct_answers_and_alternatives_complete_the_lesson(): void
    {
        $this->submit(['answers' => [['  Print() '], ['WHILE', 'Condition'], ['UPPER_CASE']], 'completed' => false, 'score' => 0])
            ->assertOk()
            ->assertJsonPath('submission.score', 100)
            ->assertJsonPath('submission.completed', true)
            ->assertJsonPath('lesson_progress.lesson_completed', true);
    }

    public function test_case_sensitive_sentences_and_review_lines(): void
    {
        // 3 of 4 blanks: the case-sensitive one is wrong in lower case.
        $this->submit(['answers' => [['print'], ['while', 'condition'], ['upper_case']], 'completed' => true, 'score' => 100])
            ->assertOk()
            ->assertJsonPath('submission.score', 75)
            ->assertJsonPath('submission.completed', true)
            ->assertJsonPath('review.0.correct_answer', 'print / print()')
            ->assertJsonPath('review.2.prompt', 'A ___ loop repeats while a ___ holds (blank 2)')
            ->assertJsonPath('review.3.answer', 'upper_case')
            ->assertJsonPath('review.3.is_correct', false);

        $stored = ExerciseSubmission::sole();
        $this->assertSame(75, (int) $stored->score);
        $this->assertSame('upper_case', $stored->answer_data['results'][3]['answer']);
    }

    public function test_empty_and_missing_answers_score_nothing(): void
    {
        $grader = new FillBlankGrader;
        $content = $this->exercise->content;

        $this->assertSame(0, $grader->grade($content, [], 100)['score']);
        $this->assertSame(0, $grader->grade($content, ['answers' => [['   ']]], 100)['score']);
        $this->assertSame(25, $grader->grade($content, ['answers' => [['print']]], 100)['score']);
        $this->assertSame(0, $grader->grade(['sentences' => []], ['answers' => []], 100)['score']);
    }

    private function submit(array $answer)
    {
        return $this->actingAs($this->user)->postJson(
            "/lessons/{$this->lesson->lesson_id}/exercises/api/{$this->exercise->exercise_id}/submit",
            ['answer' => $answer, 'time_spent' => 30]
        );
    }
}
