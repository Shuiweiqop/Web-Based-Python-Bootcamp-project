<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\StudentProfile;
use App\Models\Test;
use App\Models\TestSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Regression tests for onboarding dead ends.
 *
 * Reported symptom: "Start Placement Test" did nothing. Two separate causes,
 * both of which left the student on a page whose only action silently failed.
 */
class OnboardingDeadEndTest extends TestCase
{
    use RefreshDatabase;

    private function student(): User
    {
        return User::factory()->student()->create();
    }

    private function placementTest(int $questions = 3): Test
    {
        $test = Test::create([
            'title' => 'Placement',
            'description' => 'd',
            'status' => 'active',
            'test_type' => 'placement',
            'max_attempts' => 1,
            'passing_score' => 60,
        ]);

        for ($i = 0; $i < $questions; $i++) {
            Question::create([
                'test_id' => $test->test_id,
                'type' => 'mcq',
                'question_text' => "Q{$i}",
                'correct_answer' => 'a',
                'points' => 10,
                'difficulty_level' => 1,
                'status' => 'active',
            ]);
        }

        return $test;
    }

    private function submitPlacement(StudentProfile $profile, Test $test, ?int $recommendedPathId = null): TestSubmission
    {
        return TestSubmission::create([
            'test_id' => $test->test_id,
            'student_id' => $profile->student_id,
            'attempt_number' => 1,
            'score' => 70,
            'total_questions' => 3,
            'correct_answers' => 2,
            'status' => 'submitted',
            'is_placement_test' => true,
            'recommended_path_id' => $recommendedPathId,
            'started_at' => now()->subMinutes(10),
            'submitted_at' => now(),
        ]);
    }

    /**
     * The core defect. A completed placement test with no recommendation yet
     * (the recommendation is generated on the result page, so any interruption
     * before that leaves it null) used to fall through to the welcome screen,
     * whose only button refuses because the test is already taken.
     */
    public function test_completed_placement_without_a_recommendation_redirects_to_the_result(): void
    {
        $user = $this->student();
        $test = $this->placementTest();
        $submission = $this->submitPlacement($user->studentProfile, $test, recommendedPathId: null);

        $response = $this->actingAs($user)->get(route('student.onboarding.index'));

        $response->assertRedirect(route('student.onboarding.result', $submission->submission_id));
    }

    public function test_a_student_who_has_not_taken_the_test_still_sees_the_welcome_page(): void
    {
        $user = $this->student();
        $this->placementTest();

        $response = $this->actingAs($user)->get(route('student.onboarding.index'));

        $response->assertOk();
    }

    /**
     * The button was not broken — it was refusing correctly and saying so with
     * a flash message the page never rendered. Assert the refusal still carries
     * an explanation.
     */
    public function test_starting_an_already_completed_test_returns_an_explanation(): void
    {
        $user = $this->student();
        $test = $this->placementTest();
        $this->submitPlacement($user->studentProfile, $test);

        $response = $this->actingAs($user)
            ->from(route('student.onboarding.index'))
            ->get(route('student.onboarding.start-test'));

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    /**
     * A placement test with no questions must also explain itself rather than
     * appearing to do nothing.
     */
    public function test_starting_a_test_with_no_questions_returns_an_explanation(): void
    {
        $user = $this->student();
        $this->placementTest(questions: 0);

        $response = $this->actingAs($user)
            ->from(route('student.onboarding.index'))
            ->get(route('student.onboarding.start-test'));

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_starting_the_test_creates_a_submission_when_eligible(): void
    {
        $user = $this->student();
        $test = $this->placementTest();

        $response = $this->actingAs($user)->get(route('student.onboarding.start-test'));

        $this->assertDatabaseHas('test_submissions', [
            'test_id' => $test->test_id,
            'student_id' => $user->studentProfile->student_id,
            'status' => 'in_progress',
            'is_placement_test' => true,
        ]);

        $response->assertRedirect();
    }

    /**
     * The welcome page must render whatever refusal it is given, or the button
     * looks broken again.
     */
    public function test_welcome_page_renders_flash_errors(): void
    {
        $source = file_get_contents(
            resource_path('js/Pages/Student/Onboarding/Welcome.jsx')
        );

        $this->assertStringContainsString('flash', $source);
        $this->assertStringContainsString('flash?.error', $source);
    }

    /**
     * An unfinished attempt should be resumed rather than refused — otherwise
     * a student who closed the tab mid-test is locked out by max_attempts.
     */
    public function test_an_in_progress_attempt_is_resumed(): void
    {
        $user = $this->student();
        $test = $this->placementTest();

        $existing = TestSubmission::create([
            'test_id' => $test->test_id,
            'student_id' => $user->studentProfile->student_id,
            'attempt_number' => 1,
            'total_questions' => 3,
            'correct_answers' => 0,
            'status' => 'in_progress',
            'is_placement_test' => true,
            'started_at' => now()->subMinutes(2),
        ]);

        $response = $this->actingAs($user)->get(route('student.onboarding.start-test'));

        $response->assertRedirect(route('student.submissions.taking', $existing->submission_id));
    }
}
