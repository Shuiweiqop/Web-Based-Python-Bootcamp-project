<?php

namespace Tests\Feature;

use App\Jobs\UpdateConceptMastery;
use App\Models\Concept;
use App\Models\ExerciseSubmission;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\StudentConceptMastery;
use App\Models\StudentProfile;
use App\Models\TestSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * Tests the wiring between the app's flows and the ability model: that the job
 * is dispatched where it should be, and that it does the right thing when it runs.
 *
 * The BKT maths lives in Tests\Unit\BktEngineTest and the persistence rules in
 * Tests\Feature\ConceptMasteryServiceTest; this file only covers the seam.
 */
class ConceptMasteryDispatchTest extends TestCase
{
    use RefreshDatabase;

    private function makeStudent(): StudentProfile
    {
        return User::factory()->student()->create()->studentProfile;
    }

    private function makeConcept(string $slug = 'loops'): Concept
    {
        return Concept::create(['slug' => $slug, 'name' => ucfirst($slug), 'display_order' => 10]);
    }

    private function makeLesson(): Lesson
    {
        return Lesson::create([
            'title' => 'Lesson',
            'description' => 'd',
            'content' => 'c',
            'difficulty' => 'beginner',
            'status' => 'active',
        ]);
    }

    // ==================== Exercise flow ====================

    public function test_exercise_submission_dispatches_the_mastery_job(): void
    {
        Queue::fake();

        $student = $this->makeStudent();
        $lesson = $this->makeLesson();
        $exercise = InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Drill',
            'exercise_type' => 'drag_drop',
            'difficulty' => 'beginner',
            'max_score' => 100,
            'is_active' => true,
        ]);

        app(\App\Services\ExerciseSubmissionService::class)->submit(
            $student,
            $lesson,
            $exercise,
            ['score' => 90, 'completed' => true],
            60
        );

        Queue::assertPushed(UpdateConceptMastery::class);
    }

    // ==================== The job itself ====================

    public function test_job_updates_mastery_for_an_exercise_submission(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();
        $lesson = $this->makeLesson();

        $exercise = InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Drill',
            'exercise_type' => 'drag_drop',
            'difficulty' => 'beginner',
            'max_score' => 100,
            'is_active' => true,
        ]);
        $exercise->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        $submission = ExerciseSubmission::create([
            'exercise_id' => $exercise->exercise_id,
            'student_id' => $student->student_id,
            'score' => 95,
            'completed' => true,
            'submitted_at' => now(),
        ]);

        UpdateConceptMastery::forExercise((int) $submission->submission_id)
            ->handle(app(\App\Services\Mastery\ConceptMasteryService::class));

        $row = StudentConceptMastery::where('student_id', $student->student_id)->first();

        $this->assertNotNull($row);
        $this->assertGreaterThan(0.30, $row->mastery);
    }

    /**
     * The placement job must cover the WHOLE taxonomy, not just the concepts the
     * placement test asked about — a concept first met later would otherwise
     * have no baseline and be excluded from learning-gain forever.
     */
    public function test_placement_job_baselines_every_concept(): void
    {
        $student = $this->makeStudent();
        $this->makeConcept('loops');
        $this->makeConcept('functions');
        $this->makeConcept('lists');

        UpdateConceptMastery::forPlacement((int) $student->student_id, 0)
            ->handle(app(\App\Services\Mastery\ConceptMasteryService::class));

        $rows = StudentConceptMastery::where('student_id', $student->student_id)->get();

        $this->assertCount(3, $rows);
        $this->assertTrue(
            $rows->every(fn ($r) => $r->initial_mastery !== null),
            'Every concept must carry a baseline after placement.'
        );
    }

    public function test_job_handles_a_missing_submission_without_throwing(): void
    {
        // A submission deleted between dispatch and execution must not kill the
        // queue worker over an analytics update.
        UpdateConceptMastery::forTest(999999)
            ->handle(app(\App\Services\Mastery\ConceptMasteryService::class));

        $this->assertSame(0, StudentConceptMastery::count());
    }

    public function test_job_handles_a_missing_student_without_throwing(): void
    {
        UpdateConceptMastery::forPlacement(999999, 0)
            ->handle(app(\App\Services\Mastery\ConceptMasteryService::class));

        $this->assertSame(0, StudentConceptMastery::count());
    }

    /**
     * Re-running placement must not move the baseline: it is the anchor every
     * learning-gain figure is measured against.
     */
    public function test_rerunning_placement_does_not_move_the_baseline(): void
    {
        $student = $this->makeStudent();
        $this->makeConcept('loops');
        $service = app(\App\Services\Mastery\ConceptMasteryService::class);

        UpdateConceptMastery::forPlacement((int) $student->student_id, 0)->handle($service);

        StudentConceptMastery::where('student_id', $student->student_id)->update(['mastery' => 0.95]);

        UpdateConceptMastery::forPlacement((int) $student->student_id, 0)->handle($service);

        $row = StudentConceptMastery::where('student_id', $student->student_id)->first();

        $this->assertEqualsWithDelta(0.30, $row->initial_mastery, 0.0001);
        $this->assertEqualsWithDelta(0.95, $row->mastery, 0.0001);
    }

    public function test_job_with_an_unknown_source_is_ignored(): void
    {
        (new UpdateConceptMastery('nonsense', 1, 1))
            ->handle(app(\App\Services\Mastery\ConceptMasteryService::class));

        $this->assertSame(0, StudentConceptMastery::count());
    }

    // ==================== Test-submission flow ====================

    public function test_job_updates_mastery_from_a_graded_test_submission(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();
        $lesson = $this->makeLesson();

        $test = \App\Models\Test::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Quiz',
            'description' => 'Quiz',
            'status' => 'active',
        ]);

        $question = \App\Models\Question::create([
            'test_id' => $test->test_id,
            'type' => 'mcq',
            'question_text' => 'Q',
            'correct_answer' => 'a',
            'points' => 10,
            'difficulty_level' => 2,
            'status' => 'active',
        ]);
        $question->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        $submission = TestSubmission::create([
            'test_id' => $test->test_id,
            'student_id' => $student->student_id,
            'attempt_number' => 1,
            'score' => 100,
            'total_questions' => 1,
            'correct_answers' => 1,
            'status' => 'submitted',
            'started_at' => now()->subMinutes(5),
            'submitted_at' => now(),
        ]);

        \App\Models\SubmissionAnswer::create([
            'submission_id' => $submission->submission_id,
            'question_id' => $question->question_id,
            'answer_text' => 'a',
            'is_correct' => true,
            'points_earned' => 10,
            'answered_at' => now(),
        ]);

        UpdateConceptMastery::forTest((int) $submission->submission_id)
            ->handle(app(\App\Services\Mastery\ConceptMasteryService::class));

        $row = StudentConceptMastery::where('student_id', $student->student_id)->first();

        $this->assertNotNull($row);
        $this->assertGreaterThan(0.30, $row->mastery);
        $this->assertSame(1, $row->attempts);
    }
}
