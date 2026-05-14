<?php

namespace Tests\Feature;

use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\StudentLearningPath;
use App\Models\Test;
use App\Models\TestSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingAcceptRecommendationTest extends TestCase
{
    use RefreshDatabase;

    public function test_accept_recommended_path_rejects_path_that_was_not_recommended(): void
    {
        $user = $this->createVerifiedStudent();
        $student = $user->studentProfile;

        $recommendedPath = $this->createPath('Beginner Path', 0, 60);
        $otherPath = $this->createPath('Advanced Path', 61, 100);
        $test = $this->createPlacementTest();

        $submission = TestSubmission::create([
            'test_id' => $test->test_id,
            'student_id' => $student->student_id,
            'attempt_number' => 1,
            'started_at' => now()->subMinutes(10),
            'submitted_at' => now(),
            'total_questions' => 1,
            'correct_answers' => 1,
            'score' => 55,
            'status' => 'submitted',
            'is_completed' => true,
            'is_placement_test' => true,
            'recommended_path_id' => $recommendedPath->path_id,
            'recommendation_confidence' => 90,
            'recommendation_message' => 'Beginner path is recommended.',
        ]);

        $response = $this->actingAs($user)
            ->from("/student/onboarding/result/{$submission->submission_id}")
            ->post("/student/onboarding/accept-path/{$otherPath->path_id}", [
                'submission_id' => $submission->submission_id,
                'set_as_primary' => true,
            ]);

        $response->assertRedirect("/student/onboarding/result/{$submission->submission_id}");
        $response->assertSessionHasErrors('path_id');

        $this->assertDatabaseMissing('student_learning_paths', [
            'student_id' => $student->student_id,
            'path_id' => $otherPath->path_id,
            'placement_test_submission_id' => $submission->submission_id,
        ]);
    }

    public function test_accept_recommended_path_allows_the_actual_recommended_path(): void
    {
        $user = $this->createVerifiedStudent();
        $student = $user->studentProfile;

        $recommendedPath = $this->createPath('Beginner Path', 0, 60);
        $test = $this->createPlacementTest();

        $submission = TestSubmission::create([
            'test_id' => $test->test_id,
            'student_id' => $student->student_id,
            'attempt_number' => 1,
            'started_at' => now()->subMinutes(10),
            'submitted_at' => now(),
            'total_questions' => 1,
            'correct_answers' => 1,
            'score' => 55,
            'status' => 'submitted',
            'is_completed' => true,
            'is_placement_test' => true,
            'recommended_path_id' => $recommendedPath->path_id,
            'recommendation_confidence' => 90,
            'recommendation_message' => 'Beginner path is recommended.',
        ]);

        $response = $this->actingAs($user)
            ->post("/student/onboarding/accept-path/{$recommendedPath->path_id}", [
                'submission_id' => $submission->submission_id,
                'set_as_primary' => true,
            ]);

        $studentPath = StudentLearningPath::where('student_id', $student->student_id)
            ->where('path_id', $recommendedPath->path_id)
            ->where('placement_test_submission_id', $submission->submission_id)
            ->first();

        $this->assertNotNull($studentPath);
        $response->assertRedirect("/student/paths/{$studentPath->student_path_id}");
    }

    private function createVerifiedStudent(): User
    {
        $user = User::create([
            'name' => 'Recommendation Tester',
            'email' => 'recommendation-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        return $user->fresh();
    }

    private function createPath(string $title, int $minScore, int $maxScore): LearningPath
    {
        return LearningPath::create([
            'title' => $title,
            'description' => 'Path description',
            'learning_outcomes' => 'Learn Python basics',
            'prerequisites' => 'None',
            'difficulty_level' => 'beginner',
            'estimated_duration_hours' => 10,
            'min_score_required' => $minScore,
            'max_score_required' => $maxScore,
            'is_active' => true,
            'display_order' => 1,
        ]);
    }

    private function createPlacementTest(): Test
    {
        $lesson = Lesson::create([
            'title' => 'Placement Lesson',
            'content' => 'Lesson body',
            'difficulty' => 'beginner',
            'status' => 'active',
            'completion_reward_points' => 100,
            'required_exercises' => 0,
            'required_tests' => 0,
            'min_exercise_score_percent' => 70,
        ]);

        return Test::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Placement Test',
            'description' => 'Placement assessment',
            'instructions' => 'Answer all questions',
            'time_limit' => 30,
            'max_attempts' => 1,
            'passing_score' => 0,
            'status' => 'active',
            'order' => 1,
            'test_type' => 'placement',
        ]);
    }
}
