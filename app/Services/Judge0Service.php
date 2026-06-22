<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Judge0Service
{
    private $apiUrl;

    private $apiKey;

    private $apiHost;

    private $languageId;

    public function __construct()
    {
        $this->apiUrl = config('services.judge0.url');
        $this->apiKey = config('services.judge0.key');
        $this->apiHost = config('services.judge0.host');
        $this->languageId = config('services.judge0.language_id');
    }

    public function executeCode($code, $stdin = '', $testCases = [])
    {
        try {
            $submission = $this->createSubmission($code, $this->languageId, $stdin);

            if (! $submission) {
                return [
                    'success' => false,
                    'output' => 'Failed to submit code',
                ];
            }

            $result = $submission;

            // 运行测试用例
            $testResults = [];
            if (! empty($testCases)) {
                $testResults = $this->runTestCases($code, $testCases);
            }

            return [
                'success' => true,
                'output' => $this->formatOutput($result),
                'test_results' => $testResults,
                'status' => $result['status']['description'] ?? 'Unknown',
            ];
        } catch (\Exception $e) {
            Log::error('Judge0 error: '.$e->getMessage());

            return [
                'success' => false,
                'output' => 'Error: '.$e->getMessage(),
            ];
        }
    }

    private function createSubmission($code, $languageId, $stdin)
    {
        $response = Http::withHeaders([
            'X-RapidAPI-Key' => $this->apiKey,
            'X-RapidAPI-Host' => $this->apiHost,
            'Content-Type' => 'application/json',
        ])->post($this->apiUrl.'/submissions?wait=true', [
            'source_code' => base64_encode($code),
            'language_id' => $languageId,
            'stdin' => base64_encode($stdin),
        ]);

        if ($response->successful()) {
            return $response->json();
        }

        return null;
    }

    private function runTestCases($code, $testCases)
    {
        $results = [];

        foreach ($testCases as $testCase) {
            $input = $testCase['input'] ?? '';
            $expected = trim($testCase['expected'] ?? '');

            $submission = $this->createSubmission($code, $this->languageId, $input);

            if (! $submission) {
                $results[] = [
                    'passed' => false,
                    'expected' => $expected,
                    'actual' => 'Submission failed',
                    'input' => $input,
                ];

                continue;
            }

            $actual = trim($this->getOutput($submission));

            $results[] = [
                'passed' => $actual === $expected,
                'expected' => $expected,
                'actual' => $actual,
                'input' => $input,
            ];
        }

        return $results;
    }

    private function formatOutput($result)
    {
        if (! empty($result['compile_output'])) {
            return base64_decode($result['compile_output']);
        }

        if (! empty($result['stderr'])) {
            return base64_decode($result['stderr']);
        }

        if (! empty($result['stdout'])) {
            return base64_decode($result['stdout']);
        }

        return $result['status']['description'] ?? 'No output';
    }

    private function getOutput($result)
    {
        if (! empty($result['stdout'])) {
            return base64_decode($result['stdout']);
        }

        if (! empty($result['stderr'])) {
            return base64_decode($result['stderr']);
        }

        return '';
    }
}
