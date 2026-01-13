<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class CodeExecutionController extends Controller
{
    private $client;
    private $judge0BaseUrl = 'https://judge0-ce.p.rapidapi.com';
    private $judge0ApiKey;
    private $judge0ApiHost = 'judge0-ce.p.rapidapi.com';

    public function __construct()
    {
        $this->judge0BaseUrl = config('services.judge0.url', 'https://judge0-ce.p.rapidapi.com');
        $this->judge0ApiKey = config('services.judge0.key');

        if (!$this->judge0ApiKey) {
            throw new \Exception('Judge0 API key not configured. Please set JUDGE0_API_KEY in .env');
        }

        $this->client = new Client([
            'base_uri' => $this->judge0BaseUrl,
            'timeout' => 30,
        ]);
    }

    /**
     * Execute code using Judge0 API
     * 
     * POST /api/code/execute
     */
    public function execute(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'language' => 'required|string|in:python,python3,javascript,java,cpp,c',
            'test_cases' => 'sometimes|array',
            'test_cases.*.input' => 'nullable|string',
            'test_cases.*.expected' => 'nullable|string',
        ]);

        $code = $validated['code'];
        $language = $validated['language'];
        $testCases = $validated['test_cases'] ?? [];

        try {
            // Get language ID
            $languageId = $this->getLanguageId($language);

            if (!$languageId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unsupported language: ' . $language,
                ], 400);
            }

            if (!empty($testCases)) {
                // Run with test cases
                return $this->executeWithTestCases($code, $languageId, $testCases);
            } else {
                // Just run the code
                return $this->executeCode($code, $languageId);
            }
        } catch (\Exception $e) {
            Log::error('Code execution error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Code execution failed: ' . $e->getMessage(),
                'output' => '',
                'test_results' => [],
            ], 500);
        }
    }

    /**
     * Execute code without test cases
     */
    private function executeCode(string $code, int $languageId)
    {
        try {
            $response = $this->client->post('/submissions', [
                'headers' => $this->getHeaders(),
                'json' => [
                    'source_code' => $code,
                    'language_id' => $languageId,
                    'stdin' => '',
                ],
                'query' => [
                    'base64_encoded' => 'false',
                    'wait' => 'true',
                ]
            ]);

            $result = json_decode($response->getBody());

            $output = $result->stdout ?? $result->stderr ?? 'No output';

            return response()->json([
                'success' => true,
                'output' => $output,
                'test_results' => [],
            ]);
        } catch (RequestException $e) {
            Log::error('Judge0 API error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Execute code with test cases
     */
    private function executeWithTestCases(string $code, int $languageId, array $testCases)
    {
        $testResults = [];
        $allPassed = true;

        foreach ($testCases as $testCase) {
            $input = $testCase['input'] ?? '';
            $expected = trim($testCase['expected'] ?? '');

            try {
                // Submit code with test input
                $response = $this->client->post('/submissions', [
                    'headers' => $this->getHeaders(),
                    'json' => [
                        'source_code' => $code,
                        'language_id' => $languageId,
                        'stdin' => $input,
                    ],
                    'query' => [
                        'base64_encoded' => 'false',
                        'wait' => 'true',
                    ]
                ]);

                $result = json_decode($response->getBody());

                // Get output
                $actual = trim($result->stdout ?? $result->stderr ?? '');

                // Compare results
                $passed = $this->compareOutputs($expected, $actual);

                if (!$passed) {
                    $allPassed = false;
                }

                $testResults[] = [
                    'input' => $input,
                    'expected' => $expected,
                    'actual' => $actual,
                    'passed' => $passed,
                ];
            } catch (\Exception $e) {
                $allPassed = false;
                $testResults[] = [
                    'input' => $input,
                    'expected' => $expected,
                    'actual' => 'Error: ' . $e->getMessage(),
                    'passed' => false,
                ];
            }
        }

        // Build output summary
        $passed = count(array_filter($testResults, fn($r) => $r['passed']));
        $total = count($testResults);

        $output = "Test Results: {$passed}/{$total} passed\n\n";

        foreach ($testResults as $i => $result) {
            $status = $result['passed'] ? '✓' : '✗';
            $output .= "Test " . ($i + 1) . ": {$status}\n";
            if (!$result['passed']) {
                $output .= "  Input: {$result['input']}\n";
                $output .= "  Expected: {$result['expected']}\n";
                $output .= "  Got: {$result['actual']}\n";
            }
        }

        return response()->json([
            'success' => true,
            'output' => $output,
            'test_results' => $testResults,
        ]);
    }

    /**
     * Get language ID from language name
     */
    private function getLanguageId(string $language): ?int
    {
        $languageMap = [
            'python' => 71,      // Python 3
            'python3' => 71,
            'javascript' => 63,  // JavaScript (Node.js)
            'java' => 62,        // Java
            'cpp' => 54,         // C++
            'c' => 50,           // C
        ];

        return $languageMap[$language] ?? null;
    }

    /**
     * Get headers for Judge0 API
     */
    private function getHeaders(): array
    {
        return [
            'x-rapidapi-key' => $this->judge0ApiKey,
            'x-rapidapi-host' => $this->judge0ApiHost,
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * Compare expected vs actual output
     */
    private function compareOutputs(string $expected, string $actual): bool
    {
        if (empty($expected) && empty($actual)) {
            return true;
        }

        // Normalize whitespace
        $expected = preg_replace('/\s+/', ' ', trim($expected));
        $actual = preg_replace('/\s+/', ' ', trim($actual));

        // Direct comparison
        if ($expected === $actual) {
            return true;
        }

        // Try numeric comparison (for floating point)
        if (is_numeric($expected) && is_numeric($actual)) {
            return abs(floatval($expected) - floatval($actual)) < 0.0001;
        }

        // Case-insensitive comparison
        if (strtolower($expected) === strtolower($actual)) {
            return true;
        }

        return false;
    }
}
