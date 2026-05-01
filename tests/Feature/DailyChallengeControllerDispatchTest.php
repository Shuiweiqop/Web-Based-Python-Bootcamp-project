<?php

namespace Tests\Feature;

use App\Models\ForumPost;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Question;
use App\Models\SubmissionAnswer;
use App\Models\Test;
use App\Models\TestSubmission;
use App\Models\User;
use App\Services\DailyChallengeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class DailyChallengeControllerDispatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_exercise_submit_dispatches_daily_challenge_completion(): void
    {
        $user = $this->createVerifiedStudent();
        $student = $user->studentProfile;

        $lesson = Lesson::create([
            'title' => 'Exercise Lesson',
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
            'title' => 'Warm Up',
            'description' => 'Simple exercise',
            'exercise_type' => 'drag_drop',
            'content' => ['prompt' => 'Sort values'],
            'max_score' => 100,
            'is_active' => true,
        ]);

        LessonProgress::create([
            'student_id' => $student->student_id,
            'lesson_id' => $lesson->lesson_id,
            'status' => 'in_progress',
            'progress_percent' => 0,
            'content_completed' => true,
        ]);

        $mock = Mockery::mock(DailyChallengeService::class);
        $mock->shouldReceive('recordExerciseCompletion')
            ->once()
            ->with(
                $student->student_id,
                Mockery::on(fn ($submissionId) => is_int($submissionId) && $submissionId > 0)
            )
            ->andReturn([
                'show_toast' => true,
                'points_earned' => 30,
                'missions_updated' => [
                    ['title' => 'Focus Sprint', 'current_count' => 1, 'target_count' => 1],
                ],
                'missions_completed' => [],
                'bonuses_earned' => [],
            ]);
        $this->app->instance(DailyChallengeService::class, $mock);

        $response = $this->actingAs($user)->postJson(
            "/lessons/{$lesson->lesson_id}/exercises/api/{$exercise->exercise_id}/submit",
            [
                'answer' => [
                    'completed' => true,
                    'score' => 100,
                ],
                'time_spent' => 45,
            ]
        );

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'mission_progress' => [
                    'show_toast' => true,
                    'points_earned' => 30,
                ],
            ]);
    }

    public function test_student_test_complete_dispatches_test_passed_challenge(): void
    {
        $user = $this->createVerifiedStudent();
        $student = $user->studentProfile;

        $lesson = Lesson::create([
            'title' => 'Test Lesson',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 0,
            'required_tests' => 1,
            'min_exercise_score_percent' => 70,
        ]);

        $test = Test::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Checkpoint',
            'description' => 'Short quiz',
            'instructions' => 'Answer all questions',
            'time_limit' => 30,
            'max_attempts' => 3,
            'passing_score' => 70,
            'status' => 'active',
            'order' => 1,
            'test_type' => 'lesson',
        ]);

        $question = Question::create([
            'test_id' => $test->test_id,
            'type' => 'short_answer',
            'question_text' => 'Type Python',
            'correct_answer' => 'Python',
            'explanation' => 'Exact match',
            'points' => 10,
            'difficulty_level' => 1,
            'status' => 'active',
        ]);

        $submission = TestSubmission::create([
            'test_id' => $test->test_id,
            'student_id' => $student->student_id,
            'attempt_number' => 1,
            'started_at' => now()->subMinutes(5),
            'total_questions' => 1,
            'status' => 'in_progress',
            'is_completed' => false,
        ]);

        SubmissionAnswer::create([
            'submission_id' => $submission->submission_id,
            'question_id' => $question->question_id,
            'answer_text' => 'Python',
            'answered_at' => now(),
        ]);

        $mock = Mockery::mock(DailyChallengeService::class);
        $mock->shouldReceive('recordTestPassed')
            ->once()
            ->with($student->student_id, $submission->submission_id)
            ->andReturn([
                'show_toast' => true,
                'points_earned' => 45,
                'missions_updated' => [],
                'missions_completed' => [],
                'bonuses_earned' => [],
            ]);
        $this->app->instance(DailyChallengeService::class, $mock);

        $response = $this->actingAs($user)->post("/student/submissions/{$submission->submission_id}/complete");

        $response->assertRedirect("/student/submissions/{$submission->submission_id}/result");
        $this->assertSame(45, session('missionProgress.points_earned'));
    }

    public function test_forum_reply_dispatches_forum_reply_challenge_for_students(): void
    {
        $user = $this->createVerifiedStudent();
        $student = $user->studentProfile;

        $post = ForumPost::create([
            'user_id' => $user->user_Id,
            'title' => 'Need help',
            'content' => 'Can someone explain loops?',
            'category' => 'help',
        ]);

        $mock = Mockery::mock(DailyChallengeService::class);
        $mock->shouldReceive('recordForumReplyCreated')
            ->once()
            ->withArgs(function ($studentId, $replyId) use ($student) {
                return $studentId === $student->student_id
                    && is_int($replyId)
                    && $replyId > 0;
            })
            ->andReturn([
                'show_toast' => true,
                'points_earned' => 25,
                'missions_updated' => [],
                'missions_completed' => [],
                'bonuses_earned' => [],
            ]);
        $this->app->instance(DailyChallengeService::class, $mock);

        $response = $this->actingAs($user)->post("/forum/{$post->post_id}/reply", [
            'content' => 'Loops repeat a block of code.',
            'parent_reply_id' => null,
        ]);

        $response->assertRedirect();
        $this->assertSame(25, session('missionProgress.points_earned'));
    }

    private function createVerifiedStudent(): User
    {
        $user = User::create([
            'name' => 'Dispatch Tester',
            'email' => 'dispatch-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        return $user->fresh();
    }
}
