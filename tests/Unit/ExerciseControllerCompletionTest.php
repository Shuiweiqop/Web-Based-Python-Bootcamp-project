<?php

namespace Tests\Unit;

use App\Http\Controllers\ExerciseController;
use App\Models\InteractiveExercise;
use Tests\TestCase;

class ExerciseControllerCompletionTest extends TestCase
{
    private function invokeDetermineCompletionStatus(ExerciseController $controller, InteractiveExercise $exercise, array $answer): bool
    {
        $method = new \ReflectionMethod(ExerciseController::class, 'determineCompletionStatus');
        $method->setAccessible(true);

        return $method->invoke($controller, $exercise, $answer);
    }

    public function test_coding_exercise_with_no_test_results_is_not_completed(): void
    {
        $controller = new ExerciseController();
        $exercise = new InteractiveExercise();
        $exercise->exercise_type = 'coding';

        $result = $this->invokeDetermineCompletionStatus($controller, $exercise, [
            'completed' => true,
            'score' => 100,
            'test_results' => [],
        ]);

        $this->assertFalse($result);
    }

    public function test_coding_exercise_with_all_tests_passed_is_completed(): void
    {
        $controller = new ExerciseController();
        $exercise = new InteractiveExercise();
        $exercise->exercise_type = 'coding';

        $result = $this->invokeDetermineCompletionStatus($controller, $exercise, [
            'completed' => false,
            'score' => 100,
            'test_results' => [
                ['passed' => true],
                ['passed' => true],
            ],
        ]);

        $this->assertTrue($result);
    }

    public function test_non_coding_exercise_uses_client_completed_flag(): void
    {
        $controller = new ExerciseController();
        $exercise = new InteractiveExercise();
        $exercise->exercise_type = 'drag_drop';

        $result = $this->invokeDetermineCompletionStatus($controller, $exercise, [
            'completed' => true,
            'score' => 80,
        ]);

        $this->assertTrue($result);
    }

    public function test_submit_flow_uses_create_instead_of_update_or_create(): void
    {
        $source = file_get_contents(app_path('Http/Controllers/ExerciseController.php'));

        $this->assertStringContainsString('ExerciseSubmission::create(', $source);
        $this->assertStringNotContainsString('ExerciseSubmission::updateOrCreate(', $source);
    }
}
