<?php

namespace Tests\Unit;

use App\Models\InteractiveExercise;
use App\Services\DailyChallengeService;
use App\Services\ExerciseSubmissionService;
use Tests\TestCase;

class ExerciseControllerCompletionTest extends TestCase
{
    private function invokeDetermineCompletionStatus(InteractiveExercise $exercise, array $answer, int $score): bool
    {
        $service = new ExerciseSubmissionService($this->createMock(DailyChallengeService::class));
        $method = new \ReflectionMethod(ExerciseSubmissionService::class, 'determineCompletionStatus');
        $method->setAccessible(true);

        return $method->invoke($service, $exercise, $answer, $score);
    }

    public function test_coding_exercise_with_no_test_results_is_not_completed(): void
    {
        $exercise = new InteractiveExercise();
        $exercise->exercise_type = 'coding';

        $result = $this->invokeDetermineCompletionStatus($exercise, [
            'completed' => true,
            'score' => 100,
            'test_results' => [],
        ], 100);

        $this->assertFalse($result);
    }

    public function test_coding_exercise_with_all_tests_passed_is_completed(): void
    {
        $exercise = new InteractiveExercise();
        $exercise->exercise_type = 'coding';

        $result = $this->invokeDetermineCompletionStatus($exercise, [
            'completed' => false,
            'score' => 100,
            'test_results' => [
                ['passed' => true],
                ['passed' => true],
            ],
        ], 100);

        $this->assertTrue($result);
    }

    public function test_non_coding_exercise_requires_passing_score(): void
    {
        $exercise = new InteractiveExercise();
        $exercise->exercise_type = 'drag_drop';
        $exercise->max_score = 100;

        $result = $this->invokeDetermineCompletionStatus($exercise, [
            'completed' => true,
            'score' => 69,
        ], 69);

        $this->assertFalse($result);
    }

    public function test_non_coding_exercise_completed_when_client_completed_and_score_is_passing(): void
    {
        $exercise = new InteractiveExercise();
        $exercise->exercise_type = 'drag_drop';
        $exercise->max_score = 100;

        $result = $this->invokeDetermineCompletionStatus($exercise, [
            'completed' => true,
            'score' => 70,
        ], 70);

        $this->assertTrue($result);
    }

    public function test_submit_flow_uses_create_instead_of_update_or_create(): void
    {
        $source = file_get_contents(app_path('Services/ExerciseSubmissionService.php'));

        $this->assertStringContainsString('ExerciseSubmission::create(', $source);
        $this->assertStringNotContainsString('ExerciseSubmission::updateOrCreate(', $source);
    }
}
