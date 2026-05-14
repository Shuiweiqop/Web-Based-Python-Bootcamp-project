<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\Question;
use App\Models\SubmissionAnswer;
use App\Models\Test;
use App\Models\TestSubmission;
use App\Models\User;
use App\Services\DailyChallengeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class StudentTestCompletionStateTest extends TestCase
{
    use RefreshDatabase;

    public function test_completing_student_test_marks_submission_completed_and_updates_profile(): void
    {
        $user = $this->createVerifiedStudent();
        $student = $user->studentProfile;

        $lesson = Lesson::create([
            'title' => 'Completion Lesson',
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
            'title' => 'Completion Quiz',
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

        $response = $this->actingAs($user)
            ->post("/student/submissions/{$submission->submission_id}/complete");

        $response->assertRedirect("/student/submissions/{$submission->submission_id}/result");

        $submission->refresh();
        $student->refresh();

        $this->assertTrue($submission->is_completed);
        $this->assertSame('submitted', $submission->status);
        $this->assertSame(100.0, (float) $submission->score);
        $this->assertSame(1, $student->total_tests_taken);
        $this->assertSame(100.0, (float) $student->average_score);
        $this->assertSame(60, $student->current_points);
    }

    private function createVerifiedStudent(): User
    {
        $user = User::create([
            'name' => 'Completion Tester',
            'email' => 'completion-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        return $user->fresh();
    }
}
