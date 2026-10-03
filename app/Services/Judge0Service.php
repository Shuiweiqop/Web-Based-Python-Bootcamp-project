<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * The one client for Judge0. Both the "Run" button and server-side grading
 * go through here, so a fix to how output is read or compared lands in both.
 */
class Judge0Service
{
    /** Judge0 verdict for a program that ran to completion. */
    private const STATUS_ACCEPTED = 3;

    private const TIMEOUT_SECONDS = 30;

    /** Judge0 language ids for the languages the Run endpoint accepts. */
    private const LANGUAGE_IDS = [
        'javascript' => 63,
        'java' => 62,
        'cpp' => 54,
        'c' => 50,
    ];

    private string $apiUrl;

    private ?string $apiKey;

    private string $apiHost;

    private int $pythonLanguageId;

    public function __construct()
    {
        $this->apiUrl = rtrim((string) config('services.judge0.url'), '/');
        $this->apiKey = config('services.judge0.key');
        $this->apiHost = (string) config('services.judge0.host');
        $this->pythonLanguageId = (int) config('services.judge0.language_id');
    }

    public function languageId(string $language): ?int
    {
        if (in_array($language, ['python', 'python3'], true)) {
            return $this->pythonLanguageId;
        }

        return self::LANGUAGE_IDS[$language] ?? null;
    }

    /**
     * Run code once.
     *
     * success=false means Judge0 could not be reached or answered with an
     * error — the code itself was never judged. ran_cleanly=false means it
     * was judged and failed (compile error, runtime error, timeout).
     */
    public function run(string $code, int $languageId, string $stdin = ''): array
    {
        $result = $this->submit($code, $languageId, $stdin);

        if ($result === null) {
            return [
                'success' => false,
                'message' => 'Code execution failed. Please try again later.',
            ];
        }

        $output = $result['ran_cleanly']
            ? ($result['stdout'] !== '' ? $result['stdout'] : 'No output')
            : ($result['compile_output'] ?: $result['stderr'] ?: $result['status']);

        return [
            'success' => true,
            'ran_cleanly' => $result['ran_cleanly'],
            'output' => $output,
        ];
    }

    /**
     * Run code against each test case.
     *
     * A case Judge0 could not run is marked 'error' => true rather than
     * simply failed, so a grader can tell "the student's code is wrong" from
     * "the sandbox was down" and not record a zero for an outage.
     */
    public function runTestCases(string $code, int $languageId, array $testCases): array
    {
        $results = [];

        foreach ($testCases as $testCase) {
            $input = (string) ($testCase['input'] ?? '');
            $expected = trim((string) ($testCase['expected'] ?? $testCase['expected_output'] ?? ''));

            $result = $this->submit($code, $languageId, $input);

            if ($result === null) {
                $results[] = [
                    'input' => $input,
                    'expected' => $expected,
                    'actual' => 'Execution error',
                    'passed' => false,
                    'error' => true,
                ];

                continue;
            }

            $actual = $result['ran_cleanly']
                ? $result['stdout']
                : ($result['stderr'] ?: $result['compile_output'] ?: $result['stdout']);

            $results[] = [
                'input' => $input,
                'expected' => $expected,
                'actual' => $actual,
                'passed' => $result['ran_cleanly'] && $this->outputsMatch($expected, $actual),
                'error' => false,
            ];
        }

        return $results;
    }

    /**
     * One submission. Returns the trimmed streams, or null if Judge0 could
     * not be reached, is not configured, or answered with an error.
     */
    private function submit(string $code, int $languageId, string $stdin): ?array
    {
        if (! $this->apiKey) {
            Log::error('judge0.submit.not_configured', ['action' => 'submit']);

            return null;
        }

        try {
            $response = Http::withHeaders([
                'x-rapidapi-key' => $this->apiKey,
                'x-rapidapi-host' => $this->apiHost,
            ])
                ->timeout(self::TIMEOUT_SECONDS)
                ->post($this->apiUrl.'/submissions?base64_encoded=false&wait=true', [
                    'source_code' => $code,
                    'language_id' => $languageId,
                    'stdin' => $stdin,
                ]);

            if (! $response->successful()) {
                Log::error('judge0.submit.failed', [
                    'action' => 'submit',
                    'language_id' => $languageId,
                    'status' => $response->status(),
                ]);

                return null;
            }

            $body = $response->json();

            // stdout is read on its own: Judge0 returns "" rather than null
            // for a program with no output, so a ?? chain would never fall
            // through, and stderr must not be mistaken for the answer.
            return [
                'ran_cleanly' => (int) ($body['status']['id'] ?? 0) === self::STATUS_ACCEPTED,
                'stdout' => trim((string) ($body['stdout'] ?? '')),
                'stderr' => trim((string) ($body['stderr'] ?? '')),
                'compile_output' => trim((string) ($body['compile_output'] ?? '')),
                'status' => (string) ($body['status']['description'] ?? 'Execution failed'),
            ];
        } catch (\Throwable $e) {
            Log::error('judge0.submit.failed', [
                'action' => 'submit',
                'language_id' => $languageId,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function outputsMatch(string $expected, string $actual): bool
    {
        if ($expected === '' && $actual === '') {
            return true;
        }

        $expected = preg_replace('/\s+/', ' ', trim($expected));
        $actual = preg_replace('/\s+/', ' ', trim($actual));

        if ($expected === $actual) {
            return true;
        }

        if (is_numeric($expected) && is_numeric($actual)) {
            return abs((float) $expected - (float) $actual) < 0.0001;
        }

        return strtolower($expected) === strtolower($actual);
    }
}
