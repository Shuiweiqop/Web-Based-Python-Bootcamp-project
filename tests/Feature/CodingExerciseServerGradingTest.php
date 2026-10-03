<?php

namespace Tests\Feature;

use App\Models\ExerciseSubmission;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\LessonRegistration;
use App\Models\User;
use App\Services\DailyChallengeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Mockery;
use Tests\TestCase;

/**
 * Coding exercises are graded on the server.
 *
 * The page used to run the tests itself and post the outcome — score,
 * completed, and per-case "passed" flags — which the server stored as the
 * grade. A hand-built request with "passed": true completed any exercise and
 * paid out the lesson's points. Now the server re-runs the submitted code
 * against the exercise's stored test cases and ignores what the client claims.
 */
class CodingExerciseServerGradingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Lesson $lesson;

    private InteractiveExercise $exercise;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.judge0.key' => 'test-key']);

        $mock = Mockery::mock(DailyChallengeService::class);
        $mock->shouldReceive('recordExerciseCompletion')->andReturn([
            'show_toast' => false,
            'points_earned' => 0,
            'missions_updated' => [],
            'missions_completed' => [],
            'bonuses_earned' => [],
        ]);
        $this->app->instance(DailyChallengeService::class, $mock);

        $this->user = User::create([
            'name' => 'Grading Tester',
            'email' => 'grading-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);
        $this->user->forceFill(['email_verified_at' => now()])->save();
        $this->user = $this->user->fresh();

        $this->lesson = Lesson::create([
            'title' => 'Doubling',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 1,
            'required_tests' => 0,
            'min_exercise_score_percent' => 70,
        ]);

        $this->exercise = InteractiveExercise::create([
            'lesson_id' => $this->lesson->lesson_id,
            'title' => 'Double it',
            'exercise_type' => 'coding',
            'max_score' => 100,
            'is_active' => true,
            'test_cases' => [
                ['input' => '2', 'expected' => '4'],
                ['input' => '5', 'expected' => '10'],
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

    public function test_forged_client_results_do_not_complete_the_exercise_or_pay_points(): void
    {
        // The code prints nothing useful: every case fails on Judge0.
        $this->fakeJudge0(fn (string $stdin) => $this->accepted('wrong'));

        $this->submit([
            'code' => 'print("wrong")',
            'completed' => true,
            'score' => 100,
            'test_results' => [['passed' => true], ['passed' => true]],
        ])
            ->assertOk()
            ->assertJsonPath('submission.score', 0)
            ->assertJsonPath('submission.completed', false)
            ->assertJsonPath('lesson_progress.lesson_completed', false);

        $submission = ExerciseSubmission::sole();
        $this->assertSame(0, (int) $submission->score);
        $this->assertFalse((bool) $submission->completed);
        $this->assertFalse($submission->answer_data['test_results'][0]['passed']);
        $this->assertSame(0, $this->user->studentProfile->fresh()->current_points);
    }

    public function test_correct_code_is_graded_complete_by_the_server(): void
    {
        $this->fakeJudge0(fn (string $stdin) => $this->accepted((string) ((int) $stdin * 2)));

        $this->submit(['code' => 'print(int(input()) * 2)', 'completed' => false, 'score' => 0])
            ->assertOk()
            ->assertJsonPath('submission.score', 100)
            ->assertJsonPath('submission.completed', true)
            ->assertJsonPath('test_results.1.actual', '10')
            ->assertJsonPath('lesson_progress.lesson_completed', true);

        $this->assertSame(100, $this->user->studentProfile->fresh()->current_points);
    }

    public function test_partial_pass_scores_proportionally_and_is_not_complete(): void
    {
        $this->fakeJudge0(fn (string $stdin) => $this->accepted($stdin === '2' ? '4' : '0'));

        $this->submit(['code' => 'x', 'completed' => true, 'score' => 100])
            ->assertOk()
            ->assertJsonPath('submission.score', 50)
            ->assertJsonPath('submission.completed', false);
    }

    public function test_judge0_outage_records_nothing_and_asks_to_retry(): void
    {
        Http::fake(['*' => Http::response('upstream down', 502)]);

        $this->submit(['code' => 'print(4)', 'completed' => true, 'score' => 100])
            ->assertStatus(503)
            ->assertJsonPath('success', false);

        $this->assertSame(0, ExerciseSubmission::count());
    }

    public function test_submission_without_code_scores_zero_without_calling_judge0(): void
    {
        Http::fake();

        $this->submit(['completed' => true, 'score' => 100])
            ->assertOk()
            ->assertJsonPath('submission.score', 0)
            ->assertJsonPath('submission.completed', false);

        Http::assertNothingSent();
    }

    public function test_run_endpoint_still_reports_results_through_the_shared_service(): void
    {
        $this->fakeJudge0(fn (string $stdin) => $this->accepted('4'));

        $this->actingAs($this->user)
            ->postJson('/api/code/execute', [
                'code' => 'print(4)',
                'language' => 'python',
                'test_cases' => [['input' => '2', 'expected' => '4']],
            ])
            ->assertOk()
            ->assertJsonPath('test_results.0.passed', true);

        Http::assertSent(fn (Request $request) => str_contains($request->url(), 'base64_encoded=false')
            && $request['source_code'] === 'print(4)');
    }

    public function test_runtime_error_is_not_compared_as_the_answer(): void
    {
        // A crash whose stderr happens to equal the expected output must
        // still fail: only a clean run (status 3) can pass.
        $this->fakeJudge0(fn (string $stdin) => [
            'status' => ['id' => 11, 'description' => 'Runtime Error (NZEC)'],
            'stdout' => '',
            'stderr' => $stdin === '2' ? '4' : '10',
            'compile_output' => null,
        ]);

        $this->submit(['code' => 'x', 'completed' => true, 'score' => 100])
            ->assertOk()
            ->assertJsonPath('submission.score', 0);
    }

    public function test_missing_api_key_degrades_to_a_retry_message(): void
    {
        config(['services.judge0.key' => null]);
        Http::fake();

        $this->actingAs($this->user)
            ->postJson('/api/code/execute', ['code' => 'print(1)', 'language' => 'python'])
            ->assertStatus(500)
            ->assertJsonPath('success', false);

        Http::assertNothingSent();
    }

    private function submit(array $answer)
    {
        return $this->actingAs($this->user)->postJson(
            "/lessons/{$this->lesson->lesson_id}/exercises/api/{$this->exercise->exercise_id}/submit",
            ['answer' => $answer, 'time_spent' => 30]
        );
    }

    private function fakeJudge0(callable $respond): void
    {
        Http::fake(fn (Request $request) => Http::response($respond((string) $request['stdin'])));
    }

    private function accepted(string $stdout): array
    {
        return [
            'status' => ['id' => 3, 'description' => 'Accepted'],
            'stdout' => $stdout."\n",
            'stderr' => null,
            'compile_output' => null,
        ];
    }
}
