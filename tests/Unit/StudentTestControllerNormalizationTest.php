<?php

namespace Tests\Unit;

use App\Http\Controllers\StudentTestController;
use Tests\TestCase;

class StudentTestControllerNormalizationTest extends TestCase
{
    private function invokePrivateMethod(string $method, ...$args)
    {
        $controller = new StudentTestController();
        $reflection = new \ReflectionMethod(StudentTestController::class, $method);
        $reflection->setAccessible(true);

        return $reflection->invoke($controller, ...$args);
    }

    public function test_true_false_normalization_accepts_common_truthy_values(): void
    {
        $this->assertSame('true', $this->invokePrivateMethod('normalizeTrueFalseAnswer', 'TRUE'));
        $this->assertSame('true', $this->invokePrivateMethod('normalizeTrueFalseAnswer', '1'));
        $this->assertSame('true', $this->invokePrivateMethod('normalizeTrueFalseAnswer', ' yes '));
    }

    public function test_true_false_normalization_accepts_common_falsy_values(): void
    {
        $this->assertSame('false', $this->invokePrivateMethod('normalizeTrueFalseAnswer', 'FALSE'));
        $this->assertSame('false', $this->invokePrivateMethod('normalizeTrueFalseAnswer', '0'));
        $this->assertSame('false', $this->invokePrivateMethod('normalizeTrueFalseAnswer', ' no '));
    }

    public function test_short_answer_normalization_collapses_whitespace_and_case(): void
    {
        $normalized = $this->invokePrivateMethod('normalizeShortAnswer', "  Hello   World  \n");
        $this->assertSame('hello world', $normalized);
    }
}

