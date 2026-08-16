<?php

namespace Tests\Feature;

use App\Models\Concept;
use App\Models\InteractiveExercise;
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
use Tests\TestCase;

/**
 * End-to-end tests for the ability model: a real submission goes in, persisted
 * mastery comes out.
 *
 * The BKT maths itself is pinned down in Tests\Unit\BktEngineTest — these tests
 * are about wiring, persistence, and the guarantees the rest of the app relies
 * on (baseline immutability, confidence gating, graceful degradation).
 */
class ConceptMasteryServiceTest extends TestCase
{
    use RefreshDatabase;

    private ConceptMasteryService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ConceptMasteryService::class);
    }

    // ==================== Fixtures ====================

    private function makeStudent(): StudentProfile
    {
        return User::factory()->student()->create()->studentProfile;
    }

    private function makeConcept(string $slug = 'loops'): Concept
    {
        return Concept::create([
            'slug' => $slug,
            'name' => ucfirst($slug),
            'display_order' => 10,
        ]);
    }

    private function makeLesson(): Lesson
    {
        return Lesson::create([
            'title' => 'Test Lesson',
            'description' => 'For mastery tests.',
            'content' => 'Body',
            'difficulty' => 'beginner',
            'status' => 'active',
        ]);
    }

    private function makeTest(Lesson $lesson): Test
    {
        return Test::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Quiz',
            'description' => 'Quiz',
            'status' => 'active',
        ]);
    }

    private function makeQuestion(Test $test, array $overrides = []): Question
    {
        return Question::create(array_merge([
            'test_id' => $test->test_id,
            'type' => 'mcq',
            'question_text' => 'What does range(3) produce?',
            'correct_answer' => '0 1 2',
            'points' => 10,
            'difficulty_level' => 2,
            'status' => 'active',
        ], $overrides));
    }

    /**
     * Build a submitted test whose answers are all correct/incorrect as given.
     *
     * @param  array<int, bool>  $answerFlags  One entry per question.
     */
    private function makeSubmission(StudentProfile $student, Test $test, array $questions, array $answerFlags): TestSubmission
    {
        // (test_id, student_id, attempt_number) is unique, so repeated
        // submissions in one test must each take the next attempt number.
        $attempt = TestSubmission::where('test_id', $test->test_id)
            ->where('student_id', $student->student_id)
            ->max('attempt_number') ?? 0;

        $submission = TestSubmission::create([
            'test_id' => $test->test_id,
            'student_id' => $student->student_id,
            'attempt_number' => $attempt + 1,
            'score' => 0,
            'total_questions' => count($questions),
            'correct_answers' => count(array_filter($answerFlags)),
            'status' => 'submitted',
            'started_at' => now()->subMinutes(5),
            'submitted_at' => now(),
        ]);

        foreach ($questions as $i => $question) {
            SubmissionAnswer::create([
                'submission_id' => $submission->submission_id,
                'question_id' => $question->question_id,
                'answer_text' => 'answer',
                'is_correct' => $answerFlags[$i],
                'points_earned' => $answerFlags[$i] ? 10 : 0,
                'answered_at' => now(),
            ]);
        }

        return $submission->fresh();
    }

    // ==================== Recording test submissions ====================

    public function test_correct_answers_raise_mastery_for_the_tagged_concept(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();
        $test = $this->makeTest($this->makeLesson());
        $question = $this->makeQuestion($test);
        $question->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        $submission = $this->makeSubmission($student, $test, [$question], [true]);

        $result = $this->service->recordTestSubmission($submission);

        $this->assertTrue($result['success']);
        $this->assertSame(1, $result['updated_concepts']);

        $row = StudentConceptMastery::where('student_id', $student->student_id)
            ->where('concept_id', $concept->concept_id)
            ->first();

        $this->assertNotNull($row);
        $this->assertGreaterThan(0.30, $row->mastery, 'A correct answer should raise mastery above the prior.');
        $this->assertSame(1, $row->attempts);
        $this->assertSame(1, $row->correct);
    }

    public function test_wrong_answers_lower_mastery_for_the_tagged_concept(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();
        $test = $this->makeTest($this->makeLesson());
        $question = $this->makeQuestion($test);
        $question->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        // Seed a high prior so a drop is unambiguous.
        StudentConceptMastery::create([
            'student_id' => $student->student_id,
            'concept_id' => $concept->concept_id,
            'mastery' => 0.80,
            'confidence' => 0.5,
            'attempts' => 5,
            'correct' => 4,
        ]);

        $submission = $this->makeSubmission($student, $test, [$question], [false]);
        $this->service->recordTestSubmission($submission);

        $row = StudentConceptMastery::where('student_id', $student->student_id)
            ->where('concept_id', $concept->concept_id)
            ->first();

        $this->assertLessThan(0.80, $row->mastery);
        $this->assertSame(6, $row->attempts);
        $this->assertSame(4, $row->correct, 'A wrong answer must not increment the correct count.');
    }

    public function test_one_question_updates_every_concept_it_is_tagged_with(): void
    {
        $student = $this->makeStudent();
        $loops = $this->makeConcept('loops');
        $lists = $this->makeConcept('lists');
        $test = $this->makeTest($this->makeLesson());
        $question = $this->makeQuestion($test);
        $question->concepts()->attach([
            $loops->concept_id => ['weight' => 1.0],
            $lists->concept_id => ['weight' => 0.5],
        ]);

        $submission = $this->makeSubmission($student, $test, [$question], [true]);
        $result = $this->service->recordTestSubmission($submission);

        $this->assertSame(2, $result['updated_concepts']);

        $rows = StudentConceptMastery::where('student_id', $student->student_id)
            ->pluck('mastery', 'concept_id');

        // Both rose, but the secondary concept rose less.
        $this->assertGreaterThan(0.30, $rows[$lists->concept_id]);
        $this->assertGreaterThan($rows[$lists->concept_id], $rows[$loops->concept_id]);
    }

    public function test_ungraded_answers_are_ignored(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();
        $test = $this->makeTest($this->makeLesson());
        $question = $this->makeQuestion($test, ['type' => 'coding']);
        $question->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        $submission = TestSubmission::create([
            'test_id' => $test->test_id,
            'student_id' => $student->student_id,
            'attempt_number' => 1,
            'score' => 0,
            'total_questions' => 1,
            'correct_answers' => 0,
            'status' => 'submitted',
            'started_at' => now()->subMinutes(5),
            'submitted_at' => now(),
        ]);

        // is_correct null = awaiting grading. Treating this as "wrong" would
        // penalise work that may well be right.
        SubmissionAnswer::create([
            'submission_id' => $submission->submission_id,
            'question_id' => $question->question_id,
            'code_answer' => 'print(1)',
            'is_correct' => null,
            'answered_at' => now(),
        ]);

        $result = $this->service->recordTestSubmission($submission->fresh());

        $this->assertTrue($result['success']);
        $this->assertSame(0, $result['updated_concepts']);
        $this->assertSame(0, StudentConceptMastery::where('student_id', $student->student_id)->count());
    }

    public function test_untagged_questions_produce_no_evidence_but_do_not_fail(): void
    {
        $student = $this->makeStudent();
        $test = $this->makeTest($this->makeLesson());
        $question = $this->makeQuestion($test); // no concepts attached

        $submission = $this->makeSubmission($student, $test, [$question], [true]);
        $result = $this->service->recordTestSubmission($submission);

        // Untagged content is expected during rollout — it must degrade quietly,
        // not throw.
        $this->assertTrue($result['success']);
        $this->assertSame(0, $result['updated_concepts']);
    }

    public function test_repeated_submissions_accumulate_attempts_on_one_row(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();
        $test = $this->makeTest($this->makeLesson());
        $question = $this->makeQuestion($test);
        $question->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        foreach ([true, true, false] as $flag) {
            $this->service->recordTestSubmission(
                $this->makeSubmission($student, $test, [$question], [$flag])
            );
        }

        $rows = StudentConceptMastery::where('student_id', $student->student_id)->get();

        $this->assertCount(1, $rows, 'Evidence must accumulate on one row per (student, concept).');
        $this->assertSame(3, $rows->first()->attempts);
        $this->assertSame(2, $rows->first()->correct);
    }

    public function test_confidence_grows_as_evidence_accumulates(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();
        $test = $this->makeTest($this->makeLesson());
        $question = $this->makeQuestion($test);
        $question->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        $this->service->recordTestSubmission($this->makeSubmission($student, $test, [$question], [true]));
        $after1 = StudentConceptMastery::where('student_id', $student->student_id)->first()->confidence;

        for ($i = 0; $i < 9; $i++) {
            $this->service->recordTestSubmission($this->makeSubmission($student, $test, [$question], [true]));
        }
        $after10 = StudentConceptMastery::where('student_id', $student->student_id)->first()->confidence;

        $this->assertGreaterThan($after1, $after10);
    }

    // ==================== Exercise submissions ====================

    public function test_passing_exercise_submission_raises_mastery(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();
        $lesson = $this->makeLesson();

        $exercise = InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Loop drill',
            'exercise_type' => 'coding',
            'difficulty' => 'intermediate',
            'max_score' => 100,
            'is_active' => true,
        ]);
        $exercise->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        $submission = \App\Models\ExerciseSubmission::create([
            'exercise_id' => $exercise->exercise_id,
            'student_id' => $student->student_id,
            'score' => 90,
            'completed' => true,
            'submitted_at' => now(),
        ]);

        $result = $this->service->recordExerciseSubmission($submission->fresh());

        $this->assertTrue($result['success']);
        $this->assertSame(1, $result['updated_concepts']);
        $this->assertGreaterThan(
            0.30,
            StudentConceptMastery::where('student_id', $student->student_id)->first()->mastery
        );
    }

    public function test_failing_exercise_submission_lowers_mastery(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();
        $lesson = $this->makeLesson();

        $exercise = InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Loop drill',
            'exercise_type' => 'coding',
            'difficulty' => 'intermediate',
            'max_score' => 100,
            'is_active' => true,
        ]);
        $exercise->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        StudentConceptMastery::create([
            'student_id' => $student->student_id,
            'concept_id' => $concept->concept_id,
            'mastery' => 0.80,
            'confidence' => 0.5,
            'attempts' => 5,
            'correct' => 4,
        ]);

        $submission = \App\Models\ExerciseSubmission::create([
            'exercise_id' => $exercise->exercise_id,
            'student_id' => $student->student_id,
            'score' => 20,
            'completed' => true,
            'submitted_at' => now(),
        ]);

        $this->service->recordExerciseSubmission($submission->fresh());

        $this->assertLessThan(
            0.80,
            StudentConceptMastery::where('student_id', $student->student_id)->first()->mastery
        );
    }

    // ==================== Baseline ====================

    public function test_snapshot_captures_current_mastery_as_baseline(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();

        StudentConceptMastery::create([
            'student_id' => $student->student_id,
            'concept_id' => $concept->concept_id,
            'mastery' => 0.42,
            'confidence' => 0.5,
            'attempts' => 5,
            'correct' => 2,
        ]);

        $count = $this->service->snapshotAsBaseline($student);

        $this->assertSame(1, $count);
        $this->assertEqualsWithDelta(
            0.42,
            StudentConceptMastery::where('student_id', $student->student_id)->first()->initial_mastery,
            0.0001
        );
    }

    /**
     * The baseline is the anchor for every learning-gain figure. If a later call
     * could overwrite it, measured "improvement" would silently collapse to zero.
     */
    public function test_snapshot_never_overwrites_an_existing_baseline(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();

        StudentConceptMastery::create([
            'student_id' => $student->student_id,
            'concept_id' => $concept->concept_id,
            'mastery' => 0.30,
            'initial_mastery' => 0.30,
            'confidence' => 0.5,
            'attempts' => 5,
            'correct' => 2,
        ]);

        StudentConceptMastery::where('student_id', $student->student_id)->update(['mastery' => 0.90]);

        $count = $this->service->snapshotAsBaseline($student);

        $this->assertSame(0, $count, 'An existing baseline must not be re-captured.');
        $this->assertEqualsWithDelta(
            0.30,
            StudentConceptMastery::where('student_id', $student->student_id)->first()->initial_mastery,
            0.0001
        );
    }

    public function test_learning_gain_is_measured_against_the_baseline(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();

        StudentConceptMastery::create([
            'student_id' => $student->student_id,
            'concept_id' => $concept->concept_id,
            'mastery' => 0.75,
            'initial_mastery' => 0.30,
            'confidence' => 0.6,
            'attempts' => 8,
            'correct' => 6,
        ]);

        $this->assertEqualsWithDelta(0.45, $this->service->getLearningGain($student), 0.0001);
    }

    /**
     * ensureAllConceptsTracked() gives every student a row for the whole
     * taxonomy. Averaging gain over all of them divides real progress by the
     * concepts they never touched, so a student who took one concept from 0.30
     * to 0.99 would report a ~6% gain. The headline figure must reflect what
     * they actually studied.
     */
    public function test_learning_gain_ignores_concepts_never_practised(): void
    {
        $student = $this->makeStudent();
        $practised = $this->makeConcept('loops');

        StudentConceptMastery::create([
            'student_id' => $student->student_id,
            'concept_id' => $practised->concept_id,
            'mastery' => 0.99,
            'initial_mastery' => 0.30,
            'confidence' => 0.8,
            'attempts' => 10,
            'correct' => 9,
        ]);

        // Eleven untouched concepts, baselined but never attempted.
        foreach (range(1, 11) as $i) {
            $concept = $this->makeConcept("untouched_{$i}");
            StudentConceptMastery::create([
                'student_id' => $student->student_id,
                'concept_id' => $concept->concept_id,
                'mastery' => 0.30,
                'initial_mastery' => 0.30,
                'confidence' => 0.0,
                'attempts' => 0,
                'correct' => 0,
            ]);
        }

        // Practised-only: the full 0.69 gain.
        $this->assertEqualsWithDelta(0.69, $this->service->getLearningGain($student), 0.0001);

        // Whole-curriculum view keeps the diluted figure, deliberately.
        $this->assertEqualsWithDelta(
            0.0575,
            $this->service->getLearningGainAcrossAllConcepts($student),
            0.0001
        );
    }

    public function test_learning_gain_by_concept_reports_each_concept_separately(): void
    {
        $student = $this->makeStudent();

        foreach ([['loops', 0.99, 0.30], ['lists', 0.40, 0.30]] as [$slug, $now, $start]) {
            $concept = $this->makeConcept($slug);
            StudentConceptMastery::create([
                'student_id' => $student->student_id,
                'concept_id' => $concept->concept_id,
                'mastery' => $now,
                'initial_mastery' => $start,
                'confidence' => 0.8,
                'attempts' => 10,
                'correct' => 5,
            ]);
        }

        $rows = $this->service->getLearningGainByConcept($student);

        $this->assertCount(2, $rows);
        // Sorted by gain, largest first.
        $this->assertSame('loops', $rows->first()['concept']->slug);
        $this->assertEqualsWithDelta(0.69, $rows->first()['gain'], 0.0001);
    }

    public function test_profile_is_ordered_by_the_concept_taxonomy(): void
    {
        $student = $this->makeStudent();

        // Created out of order; display_order must win.
        foreach ([['zebra', 30], ['alpha', 10], ['mid', 20]] as [$slug, $order]) {
            $concept = Concept::create(['slug' => $slug, 'name' => $slug, 'display_order' => $order]);
            StudentConceptMastery::create([
                'student_id' => $student->student_id,
                'concept_id' => $concept->concept_id,
                'mastery' => 0.5,
                'confidence' => 0.5,
                'attempts' => 5,
                'correct' => 2,
            ]);
        }

        $slugs = $this->service->getProfile($student)->map(fn ($r) => $r->concept->slug)->all();

        $this->assertSame(['alpha', 'mid', 'zebra'], $slugs);
    }

    // ==================== Idempotency ====================

    public function test_the_same_test_submission_is_never_applied_twice(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();
        $test = $this->makeTest($this->makeLesson());
        $question = $this->makeQuestion($test);
        $question->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        $submission = $this->makeSubmission($student, $test, [$question], [true]);

        $first = $this->service->recordTestSubmission($submission);
        $second = $this->service->recordTestSubmission($submission);

        $this->assertSame(1, $first['updated_concepts']);
        $this->assertTrue($second['success'], 'A replay is a no-op, not an error.');
        $this->assertTrue($second['already_applied'] ?? false);

        $row = StudentConceptMastery::where('student_id', $student->student_id)->first();
        $this->assertSame(1, $row->attempts, 'Replaying must not inflate the evidence count.');
    }

    public function test_the_same_exercise_submission_is_never_applied_twice(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();
        $lesson = $this->makeLesson();

        $exercise = InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Drill',
            'exercise_type' => 'coding',
            'difficulty' => 'beginner',
            'max_score' => 100,
            'is_active' => true,
        ]);
        $exercise->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        $submission = \App\Models\ExerciseSubmission::create([
            'exercise_id' => $exercise->exercise_id,
            'student_id' => $student->student_id,
            'score' => 90,
            'completed' => true,
            'submitted_at' => now(),
        ])->fresh();

        $this->service->recordExerciseSubmission($submission);
        $this->service->recordExerciseSubmission($submission);

        $row = StudentConceptMastery::where('student_id', $student->student_id)->first();
        $this->assertSame(1, $row->attempts);
    }

    /**
     * A test and an exercise can share a submission id — they are separate
     * tables. The ledger keys on (source, id), so one must not block the other.
     */
    public function test_ledger_does_not_confuse_test_and_exercise_submission_ids(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();
        $lesson = $this->makeLesson();

        $test = $this->makeTest($lesson);
        $question = $this->makeQuestion($test);
        $question->concepts()->attach($concept->concept_id, ['weight' => 1.0]);
        $testSubmission = $this->makeSubmission($student, $test, [$question], [true]);

        $exercise = InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Drill',
            'exercise_type' => 'coding',
            'difficulty' => 'beginner',
            'max_score' => 100,
            'is_active' => true,
        ]);
        $exercise->concepts()->attach($concept->concept_id, ['weight' => 1.0]);

        $exerciseSubmission = \App\Models\ExerciseSubmission::create([
            'exercise_id' => $exercise->exercise_id,
            'student_id' => $student->student_id,
            'score' => 90,
            'completed' => true,
            'submitted_at' => now(),
        ])->fresh();

        $this->service->recordTestSubmission($testSubmission);
        $result = $this->service->recordExerciseSubmission($exerciseSubmission);

        $this->assertSame(1, $result['updated_concepts'], 'Both sources must be applied.');
        $this->assertSame(
            2,
            StudentConceptMastery::where('student_id', $student->student_id)->first()->attempts
        );
    }

    public function test_learning_gain_is_null_without_a_baseline(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();

        StudentConceptMastery::create([
            'student_id' => $student->student_id,
            'concept_id' => $concept->concept_id,
            'mastery' => 0.75,
            'confidence' => 0.6,
            'attempts' => 8,
            'correct' => 6,
        ]);

        // Null means "unknown", which callers must render differently from 0.0.
        $this->assertNull($this->service->getLearningGain($student));
    }

    // ==================== Reading the model ====================

    /**
     * The guard that stops the UI calling a student weak off one unlucky answer.
     */
    public function test_weak_concepts_excludes_low_confidence_rows(): void
    {
        $student = $this->makeStudent();
        $thin = $this->makeConcept('thin_evidence');
        $solid = $this->makeConcept('solid_evidence');

        // Low mastery, but only one attempt behind it — not reportable.
        StudentConceptMastery::create([
            'student_id' => $student->student_id,
            'concept_id' => $thin->concept_id,
            'mastery' => 0.20,
            'confidence' => 0.17,
            'attempts' => 1,
            'correct' => 0,
        ]);

        StudentConceptMastery::create([
            'student_id' => $student->student_id,
            'concept_id' => $solid->concept_id,
            'mastery' => 0.25,
            'confidence' => 0.75,
            'attempts' => 15,
            'correct' => 3,
        ]);

        $weak = $this->service->getWeakConcepts($student);

        $this->assertCount(1, $weak);
        $this->assertSame($solid->concept_id, $weak->first()->concept_id);
    }

    public function test_weak_concepts_are_returned_weakest_first(): void
    {
        $student = $this->makeStudent();

        foreach ([['a', 0.55], ['b', 0.20], ['c', 0.40]] as [$slug, $mastery]) {
            $concept = $this->makeConcept($slug);
            StudentConceptMastery::create([
                'student_id' => $student->student_id,
                'concept_id' => $concept->concept_id,
                'mastery' => $mastery,
                'confidence' => 0.8,
                'attempts' => 20,
                'correct' => 5,
            ]);
        }

        $weak = $this->service->getWeakConcepts($student, 3)->pluck('mastery')->all();

        $this->assertEqualsWithDelta([0.20, 0.40, 0.55], $weak, 0.0001);
    }

    public function test_overall_mastery_is_null_when_nothing_is_reportable(): void
    {
        $student = $this->makeStudent();
        $concept = $this->makeConcept();

        StudentConceptMastery::create([
            'student_id' => $student->student_id,
            'concept_id' => $concept->concept_id,
            'mastery' => 0.50,
            'confidence' => 0.10,
            'attempts' => 1,
            'correct' => 0,
        ]);

        $this->assertNull($this->service->getOverallMastery($student));
    }

    public function test_ensure_all_concepts_tracked_creates_missing_rows_only(): void
    {
        $student = $this->makeStudent();
        $this->makeConcept('loops');
        $this->makeConcept('functions');
        $this->makeConcept('lists');

        $created = $this->service->ensureAllConceptsTracked($student);
        $this->assertSame(3, $created);

        // Second call is a no-op — no duplicates.
        $this->assertSame(0, $this->service->ensureAllConceptsTracked($student));
        $this->assertSame(3, StudentConceptMastery::where('student_id', $student->student_id)->count());
    }

    // ==================== Failure containment ====================

    /**
     * Knowledge tracing is an analytics side effect. A failure here must never
     * surface as a 500 on the student's submission.
     */
    public function test_submission_whose_student_profile_is_gone_fails_gracefully(): void
    {
        $student = $this->makeStudent();
        $test = $this->makeTest($this->makeLesson());
        $question = $this->makeQuestion($test);
        $submission = $this->makeSubmission($student, $test, [$question], [true]);

        // Detach the profile in memory rather than deleting the row: the FK
        // cascade would take the submission with it, and the case under test is
        // the service meeting a submission it cannot resolve a student for.
        $submission->setRelation('studentProfile', null);

        $result = $this->service->recordTestSubmission($submission);

        $this->assertFalse($result['success']);
        $this->assertSame(0, $result['updated_concepts']);
        $this->assertSame(0, StudentConceptMastery::count());
    }
}
