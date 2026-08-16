<?php

namespace Tests\Feature;

use App\Jobs\UpdateConceptMastery;
use App\Models\Concept;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\StudentConceptMastery;
use App\Models\StudentProfile;
use App\Models\SubmissionAnswer;
use App\Models\Test;
use App\Models\TestSubmission;
use App\Models\User;
use App\Services\Mastery\ConceptMasteryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * Regression tests for placement-test evidence being counted twice.
 *
 * A placement submission travels through two paths that both feed the ability
 * model: StudentTestController::complete() (the generic submit route, which
 * placement tests also use — the onboarding group has no submit route of its
 * own) and OnboardingController::result() (which dispatches the placement job).
 *
 * Counting the same answers twice inflates `attempts` and, worse, runs before
 * snapshotAsBaseline() — so `initial_mastery` records a value the student never
 * actually started from, and every learning-gain figure is understated.
 *
 * These tests pin the contract: placement evidence is applied exactly once, by
 * the placement flow, which owns the ordering of record-then-baseline.
 */
class PlacementMasteryDoubleCountTest extends TestCase
{
    use RefreshDatabase;

    private function makeStudent(): StudentProfile
    {
        return User::factory()->student()->create()->studentProfile;
    }

    /**
     * A placement test with one concept-tagged Python question.
     *
     * @return array{0: Test, 1: Question, 2: Concept}
     */
    private function makePlacementTest(): array
    {
        $concept = Concept::create(['slug' => 'loops', 'name' => 'Loops', 'display_order' => 10]);

        $lesson = Lesson::create([
            'title' => 'L', 'description' => 'd', 'content' => 'c',
            'difficulty' => 'beginner', 'status' => 'active',
        ]);

        $test = Test::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Placement',
            'description' => 'Placement',
            'status' => 'active',
            'test_type' => 'placement',
        ]);

        $question = Question::create([
            'test_id' => $test->test_id,
            'type' => 'mcq',
            'question_text' => 'Which loop iterates a sequence?',
            'correct_answer' => 'for',
            'points' => 10,
            'difficulty_level' => 2,
            'status' => 'active',
        ]);
        $question->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        return [$test, $question, $concept];
    }

    private function makePlacementSubmission(StudentProfile $student, Test $test, Question $question): TestSubmission
    {
        $submission = TestSubmission::create([
            'test_id' => $test->test_id,
            'student_id' => $student->student_id,
            'attempt_number' => 1,
            'score' => 100,
            'total_questions' => 1,
            'correct_answers' => 1,
            'status' => 'submitted',
            'is_placement_test' => true,
            'started_at' => now()->subMinutes(5),
            'submitted_at' => now(),
        ]);

        SubmissionAnswer::create([
            'submission_id' => $submission->submission_id,
            'question_id' => $question->question_id,
            'answer_text' => 'for',
            'is_correct' => true,
            'points_earned' => 10,
            'answered_at' => now(),
        ]);

        return $submission->fresh();
    }

    /**
     * The generic submit route must not feed placement evidence to the model —
     * the placement flow owns that, so it can order record-then-baseline.
     */
    public function test_completing_a_placement_test_does_not_dispatch_the_generic_test_job(): void
    {
        Queue::fake();

        $student = $this->makeStudent();
        [$test, $question] = $this->makePlacementTest();
        $submission = $this->makePlacementSubmission($student, $test, $question);

        $user = $student->user;
        $submission->update(['status' => 'in_progress']);

        $this->actingAs($user)
            ->post(route('student.submissions.complete', $submission->submission_id));

        Queue::assertNotPushed(UpdateConceptMastery::class);
    }

    /**
     * A normal (non-placement) test must still feed the model — the fix above
     * must not silence ordinary quizzes.
     */
    public function test_completing_a_normal_test_still_dispatches_the_mastery_job(): void
    {
        Queue::fake();

        $student = $this->makeStudent();
        [$test, $question] = $this->makePlacementTest();

        // Same fixture, but an ordinary lesson quiz.
        $test->update(['test_type' => 'lesson']);

        $submission = $this->makePlacementSubmission($student, $test, $question);
        $submission->update(['is_placement_test' => false, 'status' => 'in_progress']);

        $this->actingAs($student->user)
            ->post(route('student.submissions.complete', $submission->submission_id));

        Queue::assertPushed(UpdateConceptMastery::class);
    }

    /**
     * The core defect: applying the same answers through both paths counts the
     * evidence twice and leaves the baseline above the student's real start.
     */
    public function test_placement_evidence_is_counted_exactly_once(): void
    {
        $student = $this->makeStudent();
        [$test, $question, $concept] = $this->makePlacementTest();
        $submission = $this->makePlacementSubmission($student, $test, $question);

        $service = app(ConceptMasteryService::class);

        // Only the placement job runs — the generic one is now suppressed.
        UpdateConceptMastery::forPlacement(
            (int) $student->student_id,
            (int) $submission->submission_id
        )->handle($service);

        $row = StudentConceptMastery::where('student_id', $student->student_id)
            ->where('concept_id', $concept->concept_id)
            ->first();

        $this->assertSame(1, $row->attempts, 'One answered question must produce exactly one attempt.');
        $this->assertSame(1, $row->correct);
    }

    /**
     * The baseline must record where the student STARTED. If placement evidence
     * is applied twice before the snapshot, initial_mastery captures an inflated
     * value and getLearningGain() understates every later improvement.
     */
    public function test_baseline_is_not_inflated_by_double_counted_evidence(): void
    {
        $student = $this->makeStudent();
        [$test, $question, $concept] = $this->makePlacementTest();
        $submission = $this->makePlacementSubmission($student, $test, $question);

        $service = app(ConceptMasteryService::class);

        UpdateConceptMastery::forPlacement(
            (int) $student->student_id,
            (int) $submission->submission_id
        )->handle($service);

        $row = StudentConceptMastery::where('student_id', $student->student_id)
            ->where('concept_id', $concept->concept_id)
            ->first();

        // One correct medium mcq from the 0.30 prior lands at ~0.6657 (see
        // BktEngineTest's hand-computed case). Two applications would reach
        // roughly 0.87 — well outside this bound.
        $this->assertLessThan(
            0.75,
            $row->initial_mastery,
            'Baseline is above what a single correct answer can produce — evidence was applied twice.'
        );
        $this->assertEqualsWithDelta(0.665730, $row->initial_mastery, 0.001);
    }

    /**
     * onboarding.result is a GET route, so a page refresh re-runs the flow.
     * Re-running must not keep piling evidence onto the same answers.
     */
    public function test_replaying_the_placement_job_does_not_re_apply_evidence(): void
    {
        $student = $this->makeStudent();
        [$test, $question, $concept] = $this->makePlacementTest();
        $submission = $this->makePlacementSubmission($student, $test, $question);

        $service = app(ConceptMasteryService::class);
        $job = fn () => UpdateConceptMastery::forPlacement(
            (int) $student->student_id,
            (int) $submission->submission_id
        )->handle($service);

        $job();
        $first = StudentConceptMastery::where('student_id', $student->student_id)
            ->where('concept_id', $concept->concept_id)->first();
        $attemptsAfterFirst = $first->attempts;
        $masteryAfterFirst = $first->mastery;

        $job();
        $second = $first->fresh();

        $this->assertSame(
            $attemptsAfterFirst,
            $second->attempts,
            'Replaying the same submission must not add attempts.'
        );
        $this->assertEqualsWithDelta($masteryAfterFirst, $second->mastery, 0.0001);
    }
}
