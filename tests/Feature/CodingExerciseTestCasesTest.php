<?php

namespace Tests\Feature;

use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Where a coding exercise keeps its test cases, and in what shape.
 *
 * Every coding exercise was ungradable: the authoring form wrote test cases
 * into the content blob under 'expected_output', while the grader read the
 * test_cases column looking for 'expected'. The column was empty for all 17
 * exercises, so the grader ran zero tests — and zero tests means a score of 0
 * and a completion flag that can never turn true, whatever the student submits.
 *
 * These tests pin the column as the single home and 'expected' as the single
 * key, including for data that still arrives with the old spelling.
 */
class CodingExerciseTestCasesTest extends TestCase
{
    use RefreshDatabase;

    public function test_test_cases_are_stored_in_their_own_column(): void
    {
        $exercise = $this->createCodingExercise([
            ['input' => '2 3', 'expected' => '5'],
        ]);

        $this->assertDatabaseMissing('interactive_exercises', [
            'exercise_id' => $exercise->exercise_id,
            'test_cases' => null,
        ]);

        $this->assertCount(1, $exercise->fresh()->test_cases);
    }

    /**
     * The authoring form wrote expected_output. Anything saved that way was
     * graded against an empty string, so a correct answer never matched.
     */
    public function test_expected_output_is_normalised_to_expected(): void
    {
        $exercise = $this->createCodingExercise([
            ['input' => '', 'expected_output' => 'Hello, World!'],
        ]);

        $stored = $exercise->fresh()->test_cases;

        $this->assertSame('Hello, World!', $stored[0]['expected']);
        $this->assertArrayNotHasKey(
            'expected_output',
            $stored[0],
            'Only one spelling survives, so the grader has one key to read.'
        );
    }

    public function test_a_mix_of_both_spellings_normalises_to_one(): void
    {
        $exercise = $this->createCodingExercise([
            ['input' => 'a', 'expected' => 'A'],
            ['input' => 'b', 'expected_output' => 'B'],
        ]);

        $stored = $exercise->fresh()->test_cases;

        $this->assertSame(['A', 'B'], array_column($stored, 'expected'));
    }

    /**
     * The form starts with one blank row. Saved as-is it used to fail
     * validation outright, and a blank row is not a test in any case.
     */
    public function test_blank_rows_from_the_authoring_form_are_dropped(): void
    {
        $exercise = $this->createCodingExercise([
            ['input' => '', 'expected' => '', 'description' => 'Test case 1'],
            ['input' => '2 3', 'expected' => '5'],
        ]);

        $stored = $exercise->fresh()->test_cases;

        $this->assertCount(1, $stored);
        $this->assertSame('5', $stored[0]['expected']);
    }

    public function test_an_exercise_with_no_test_cases_stores_an_empty_list(): void
    {
        $exercise = $this->createCodingExercise([]);

        $this->assertSame([], $exercise->fresh()->test_cases);
    }

    /**
     * The runtime reads $exercise->test_cases, so the payload the player gets
     * must carry them. It sent an always-empty column before.
     */
    public function test_the_exercise_payload_carries_the_test_cases(): void
    {
        $student = $this->createStudent();
        $exercise = $this->createCodingExercise([
            ['input' => '2 3', 'expected' => '5'],
        ]);

        // Exercises are gated behind reviewing the lesson content first.
        $profile = StudentProfile::firstOrCreate(['user_Id' => $student->user_Id]);
        LessonProgress::create([
            'student_id' => $profile->student_id,
            'lesson_id' => $exercise->lesson_id,
            'content_completed' => true,
        ]);

        $response = $this->actingAs($student)->getJson(
            "/lessons/{$exercise->lesson_id}/exercises/api/{$exercise->exercise_id}"
        );

        $response->assertOk();

        $payload = $response->json('exercise');

        $this->assertCount(1, $payload['test_cases']);
        $this->assertSame('5', $payload['test_cases'][0]['expected']);
    }

    private function createCodingExercise(array $testCases): InteractiveExercise
    {
        $lesson = Lesson::create([
            'title' => 'Python basics',
            'description' => 'A lesson.',
            'content' => 'Body.',
            'difficulty' => 'beginner',
            'is_active' => true,
        ]);

        return InteractiveExercise::create([
            'lesson_id' => $lesson->lesson_id,
            'title' => 'Add two numbers',
            'description' => 'Read two ints and print the sum.',
            'exercise_type' => 'coding',
            'max_score' => 100,
            'is_active' => true,
            'starter_code' => "# your code here\n",
            'test_cases' => $testCases,
            'content' => ['instructions' => 'Print the sum.'],
        ]);
    }

    private function createStudent(): User
    {
        $user = User::create([
            'name' => 'Student',
            'email' => 'student-'.uniqid().'@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();

        return $user->fresh();
    }
}
