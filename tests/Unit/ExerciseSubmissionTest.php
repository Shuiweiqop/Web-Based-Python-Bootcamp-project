<?php

namespace Tests\Unit;

use App\Models\ExerciseSubmission;
use App\Models\InteractiveExercise;
use Tests\TestCase;

class ExerciseSubmissionTest extends TestCase
{
    private function makeSubmission(array $attrs = []): ExerciseSubmission
    {
        $submission = new ExerciseSubmission();
        foreach ($attrs as $key => $value) {
            $submission->$key = $value;
        }
        return $submission;
    }

    // ── Grade & percentage ───────────────────────────────────────────

    public function test_percentage_is_zero_when_no_exercise_loaded(): void
    {
        $submission = $this->makeSubmission(['score' => 80]);
        $this->assertSame(0, $submission->percentage);
    }

    public function test_percentage_is_zero_when_max_score_is_zero(): void
    {
        $exercise = new InteractiveExercise();
        $exercise->max_score = 0;

        $submission = $this->makeSubmission(['score' => 50]);
        $submission->setRelation('exercise', $exercise);

        $this->assertSame(0, $submission->percentage);
    }

    public function test_percentage_calculated_correctly(): void
    {
        $exercise = new InteractiveExercise();
        $exercise->max_score = 200;

        $submission = $this->makeSubmission(['score' => 150]);
        $submission->setRelation('exercise', $exercise);

        $this->assertSame(75.0, $submission->percentage);
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('gradeProvider')]
    public function test_grade_boundaries(int $score, int $maxScore, string $expectedGrade): void
    {
        $exercise = new InteractiveExercise();
        $exercise->max_score = $maxScore;

        $submission = $this->makeSubmission(['score' => $score]);
        $submission->setRelation('exercise', $exercise);

        $this->assertSame($expectedGrade, $submission->grade);
    }

    public static function gradeProvider(): array
    {
        return [
            'A at 90%'          => [90, 100, 'A'],
            'A at 100%'         => [100, 100, 'A'],
            'B at 80%'          => [80, 100, 'B'],
            'B at 89%'          => [89, 100, 'B'],
            'C at 70%'          => [70, 100, 'C'],
            'C at 79%'          => [79, 100, 'C'],
            'D at 60%'          => [60, 100, 'D'],
            'D at 69%'          => [69, 100, 'D'],
            'F at 59%'          => [59, 100, 'F'],
            'F at 0%'           => [0, 100, 'F'],
        ];
    }

    public function test_is_passing_at_70_percent(): void
    {
        $exercise = new InteractiveExercise();
        $exercise->max_score = 100;

        $passing = $this->makeSubmission(['score' => 70]);
        $passing->setRelation('exercise', $exercise);
        $this->assertTrue($passing->is_passing);

        $failing = $this->makeSubmission(['score' => 69]);
        $failing->setRelation('exercise', $exercise);
        $this->assertFalse($failing->is_passing);
    }

    // ── Coding submission accessors ──────────────────────────────────

    public function test_is_coding_submission_true_when_code_and_language_present(): void
    {
        $submission = $this->makeSubmission([
            'answer_data' => ['code' => 'print("hi")', 'language' => 'python'],
        ]);
        $this->assertTrue($submission->is_coding_submission);
    }

    public function test_is_coding_submission_false_when_no_code_key(): void
    {
        $submission = $this->makeSubmission([
            'answer_data' => ['answer' => 'A'],
        ]);
        $this->assertFalse($submission->is_coding_submission);
    }

    public function test_submitted_code_returns_code_from_answer_data(): void
    {
        $submission = $this->makeSubmission([
            'answer_data' => ['code' => 'x = 1', 'language' => 'python'],
        ]);
        $this->assertSame('x = 1', $submission->submitted_code);
    }

    public function test_submitted_code_returns_null_when_missing(): void
    {
        $submission = $this->makeSubmission(['answer_data' => []]);
        $this->assertNull($submission->submitted_code);
    }

    public function test_language_falls_back_to_unknown(): void
    {
        $submission = $this->makeSubmission(['answer_data' => []]);
        $this->assertSame('unknown', $submission->language);
    }

    public function test_passed_tests_count_reads_from_answer_data(): void
    {
        $submission = $this->makeSubmission([
            'answer_data' => ['passed_count' => 3, 'total_count' => 5],
        ]);
        $this->assertSame(3, $submission->passed_tests_count);
        $this->assertSame(5, $submission->total_tests_count);
    }

    public function test_test_pass_rate_calculated_correctly(): void
    {
        $submission = $this->makeSubmission([
            'answer_data' => ['passed_count' => 2, 'total_count' => 4],
        ]);
        $this->assertSame(50.0, $submission->test_pass_rate);
    }

    public function test_test_pass_rate_is_zero_when_no_tests(): void
    {
        $submission = $this->makeSubmission([
            'answer_data' => ['passed_count' => 0, 'total_count' => 0],
        ]);
        $this->assertSame(0, $submission->test_pass_rate);
    }

    public function test_all_tests_passed_true_when_counts_match_and_nonzero(): void
    {
        $submission = $this->makeSubmission([
            'answer_data' => ['passed_count' => 3, 'total_count' => 3],
        ]);
        $this->assertTrue($submission->all_tests_passed);
    }

    public function test_all_tests_passed_false_when_none_passed(): void
    {
        $submission = $this->makeSubmission([
            'answer_data' => ['passed_count' => 0, 'total_count' => 3],
        ]);
        $this->assertFalse($submission->all_tests_passed);
    }

    // ── Code line count ──────────────────────────────────────────────

    public function test_code_lines_count_ignores_blank_lines(): void
    {
        $code = "x = 1\n\ny = 2\n\nprint(x + y)\n";
        $submission = $this->makeSubmission([
            'answer_data' => ['code' => $code, 'language' => 'python'],
        ]);
        $this->assertSame(3, $submission->code_lines_count);
    }

    public function test_code_lines_count_zero_when_no_code(): void
    {
        $submission = $this->makeSubmission(['answer_data' => []]);
        $this->assertSame(0, $submission->code_lines_count);
    }

    // ── Test summary ─────────────────────────────────────────────────

    public function test_get_test_summary_returns_empty_for_non_coding(): void
    {
        $submission = $this->makeSubmission(['answer_data' => ['answer' => 'A']]);
        $this->assertSame([], $submission->getTestSummary());
    }

    public function test_get_test_summary_partitions_passed_and_failed(): void
    {
        $submission = $this->makeSubmission([
            'answer_data' => [
                'code' => 'x=1',
                'language' => 'python',
                'passed_count' => 2,
                'total_count' => 3,
                'test_results' => [
                    ['passed' => true,  'input' => '1', 'expected' => '1', 'actual' => '1'],
                    ['passed' => true,  'input' => '2', 'expected' => '2', 'actual' => '2'],
                    ['passed' => false, 'input' => '3', 'expected' => '4', 'actual' => '3'],
                ],
            ],
        ]);

        $summary = $submission->getTestSummary();

        $this->assertSame(3, $summary['total']);
        $this->assertSame(2, $summary['passed']);
        $this->assertSame(1, $summary['failed']);
        $this->assertFalse($summary['all_passed']);
        $this->assertCount(2, $summary['passed_tests']);
        $this->assertCount(1, $summary['failed_tests']);
    }

    // ── Formatted time ───────────────────────────────────────────────

    public function test_formatted_time_returns_na_when_null(): void
    {
        $submission = $this->makeSubmission(['time_taken' => null]);
        $this->assertSame('N/A', $submission->formatted_time);
    }

    public function test_formatted_time_shows_seconds_only_under_one_minute(): void
    {
        $submission = $this->makeSubmission(['time_taken' => 45]);
        $this->assertSame('45s', $submission->formatted_time);
    }

    public function test_formatted_time_shows_minutes_and_seconds(): void
    {
        $submission = $this->makeSubmission(['time_taken' => 125]);
        $this->assertSame('2m 5s', $submission->formatted_time);
    }
}
