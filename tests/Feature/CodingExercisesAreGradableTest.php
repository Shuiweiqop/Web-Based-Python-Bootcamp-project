<?php

namespace Tests\Feature;

use App\Models\InteractiveExercise;
use Database\Seeders\CodingExerciseContentSeeder;
use Database\Seeders\InteractiveExerciseSeeder;
use Database\Seeders\LessonsTableSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Every seeded coding exercise can actually be completed.
 *
 * Fourteen shipped as placeholders with no test cases, and a fifteenth had test
 * cases its own reference solution could not pass. Either way the student is
 * stuck: the grader computes `passed === total` over an empty list, which is
 * false, so the score is 0 and the exercise never completes however correct the
 * submission.
 *
 * These assert the shape the grader needs. Whether each solution really produces
 * the expected output is checked by running it — see the note on
 * test_every_reference_solution_is_runnable_python.
 */
class CodingExercisesAreGradableTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Lessons reference a creator, so the users must exist first.
        $this->seed(UserSeeder::class);
        $this->seed(LessonsTableSeeder::class);
        $this->seed(InteractiveExerciseSeeder::class);
        $this->seed(CodingExerciseContentSeeder::class);
    }

    public function test_every_coding_exercise_has_test_cases(): void
    {
        $without = $this->codingExercises()
            ->filter(fn ($e) => ! is_array($e->test_cases) || $e->test_cases === [])
            ->map(fn ($e) => "#{$e->exercise_id} {$e->title}")
            ->values()
            ->all();

        $this->assertSame(
            [],
            $without,
            'An exercise with no test cases scores 0 and can never be completed.'
        );
    }

    public function test_every_test_case_carries_an_expectation(): void
    {
        $bad = [];

        foreach ($this->codingExercises() as $exercise) {
            foreach ($exercise->test_cases as $i => $case) {
                if (! array_key_exists('expected', $case)) {
                    $bad[] = "#{$exercise->exercise_id} case ".($i + 1);
                }
            }
        }

        $this->assertSame(
            [],
            $bad,
            "The grader reads 'expected'; a case without it is graded against an empty string."
        );
    }

    public function test_no_test_case_uses_the_old_expected_output_key(): void
    {
        $bad = [];

        foreach ($this->codingExercises() as $exercise) {
            foreach ($exercise->test_cases as $i => $case) {
                if (array_key_exists('expected_output', $case)) {
                    $bad[] = "#{$exercise->exercise_id} case ".($i + 1);
                }
            }
        }

        $this->assertSame([], $bad, 'expected_output is normalised to expected on write.');
    }

    public function test_every_coding_exercise_has_starter_code_and_a_solution(): void
    {
        $bad = $this->codingExercises()
            ->filter(fn ($e) => trim((string) $e->starter_code) === '' || trim((string) $e->solution) === '')
            ->map(fn ($e) => "#{$e->exercise_id} {$e->title}")
            ->values()
            ->all();

        $this->assertSame([], $bad);
    }

    /**
     * A placeholder solution cannot be graded against, and its exercise cannot
     * be marked complete by anyone.
     */
    public function test_no_exercise_still_carries_placeholder_content(): void
    {
        $placeholders = ['Solution will vary', 'Apply concepts from the lesson'];
        $bad = [];

        foreach ($this->codingExercises() as $exercise) {
            $haystack = $exercise->solution.' '.json_encode($exercise->content);

            foreach ($placeholders as $needle) {
                if (str_contains($haystack, $needle)) {
                    $bad[] = "#{$exercise->exercise_id} {$exercise->title}";
                    break;
                }
            }
        }

        $this->assertSame([], $bad);
    }

    /**
     * Compiles each reference solution rather than running it.
     *
     * Running them needs a Python interpreter, which the CI image is not
     * guaranteed to have, and running them through Judge0 would spend the daily
     * submission quota on every test run. Syntax is what can be checked for
     * free; the outputs were verified separately against the real grader.
     */
    public function test_every_reference_solution_is_runnable_python(): void
    {
        $python = $this->findPython();

        if (! $python) {
            $this->markTestSkipped('No Python interpreter available to compile the solutions.');
        }

        $bad = [];

        foreach ($this->codingExercises() as $exercise) {
            $file = tempnam(sys_get_temp_dir(), 'sol').'.py';
            file_put_contents($file, $exercise->solution);

            exec(escapeshellarg($python).' -m py_compile '.escapeshellarg($file).' 2>&1', $out, $code);
            @unlink($file);

            if ($code !== 0) {
                $bad[] = "#{$exercise->exercise_id} {$exercise->title}: ".implode(' ', array_slice($out, -2));
            }

            $out = [];
        }

        $this->assertSame([], $bad, 'A solution that does not compile cannot be a reference answer.');
    }

    private function codingExercises()
    {
        return InteractiveExercise::where('exercise_type', 'coding')->orderBy('exercise_id')->get();
    }

    private function findPython(): ?string
    {
        foreach (['python3', 'python'] as $candidate) {
            exec(escapeshellarg($candidate).' --version 2>&1', $out, $code);
            $out = [];

            if ($code === 0) {
                return $candidate;
            }
        }

        return null;
    }
}
