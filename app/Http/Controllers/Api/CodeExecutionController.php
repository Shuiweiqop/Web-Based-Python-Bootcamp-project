<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Judge0Service;
use Illuminate\Http\Request;

class CodeExecutionController extends Controller
{
    public function __construct(private Judge0Service $judge0) {}

    /**
     * Execute code using Judge0 API
     *
     * POST /api/code/execute
     *
     * This is the student's "Run" button. Its results are for display only —
     * grading re-runs the code on the server (ExerciseSubmissionService).
     */
    public function execute(Request $request)
    {
        // Caps bound abuse: each test case fans out to a separate Judge0 call,
        // so an unbounded array/payload is a cost/DoS amplification vector.
        $validated = $request->validate([
            'code' => 'required|string|max:50000',
            'language' => 'required|string|in:python,python3,javascript,java,cpp,c',
            'test_cases' => 'sometimes|array|max:20',
            'test_cases.*.input' => 'nullable|string|max:10000',
            'test_cases.*.expected' => 'nullable|string|max:10000',
        ]);

        $code = $validated['code'];
        $testCases = $validated['test_cases'] ?? [];
        $languageId = $this->judge0->languageId($validated['language']);

        if (! $languageId) {
            return response()->json([
                'success' => false,
                'message' => 'Unsupported language: '.$validated['language'],
            ], 400);
        }

        if (empty($testCases)) {
            $result = $this->judge0->run($code, $languageId);

            if (! $result['success']) {
                return $this->unavailable($result['message']);
            }

            return response()->json([
                'success' => true,
                'ran_cleanly' => $result['ran_cleanly'],
                'output' => $result['output'],
                'test_results' => [],
            ]);
        }

        $testResults = $this->judge0->runTestCases($code, $languageId, $testCases);

        return response()->json([
            'success' => true,
            'output' => $this->summarise($testResults),
            'test_results' => $testResults,
        ]);
    }

    private function summarise(array $testResults): string
    {
        $passed = count(array_filter($testResults, fn ($r) => $r['passed']));
        $total = count($testResults);

        $output = "Test Results: {$passed}/{$total} passed\n\n";

        foreach ($testResults as $i => $result) {
            $status = $result['passed'] ? '✓' : '✗';
            $output .= 'Test '.($i + 1).": {$status}\n";
            if (! $result['passed']) {
                $output .= "  Input: {$result['input']}\n";
                $output .= "  Expected: {$result['expected']}\n";
                $output .= "  Got: {$result['actual']}\n";
            }
        }

        return $output;
    }

    private function unavailable(string $message)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'output' => '',
            'test_results' => [],
        ], 500);
    }
}
