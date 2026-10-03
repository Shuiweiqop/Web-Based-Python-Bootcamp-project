<?php

namespace App\Services;

use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
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
        $testCases = array_values($testCases);
        $inputs = array_map(fn ($case) => (string) ($case['input'] ?? ''), $testCases);
        $submissions = $this->submitAll($code, $languageId, $inputs);

        $results = [];

        foreach ($testCases as $i => $testCase) {
            $input = $inputs[$i];
            $expected = trim((string) ($testCase['expected'] ?? $testCase['expected_output'] ?? ''));

            $result = $submissions[$i];

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

    private function submit(string $code, int $languageId, string $stdin): ?array
    {
        return $this->submitAll($code, $languageId, [$stdin])[0];
    }

    /**
     * One submission per stdin, sent concurrently: with wait=true each call
     * blocks until its run finishes, so sending them one after another made
     * a five-case exercise wait out five round trips. Now it waits for the
     * slowest one.
     *
     * Returns, in the same order as $stdins, the trimmed streams of each run,
     * or null for a run Judge0 could not take (unreachable, not configured,
     * or an error response).
     *
     * @param  list<string>  $stdins
     * @return list<array|null>
     */
    private function submitAll(string $code, int $languageId, array $stdins): array
    {
        if ($stdins === []) {
            return [];
        }

        if (! $this->apiKey) {
            Log::error('judge0.submit.not_configured', ['action' => 'submit']);

            return array_fill(0, count($stdins), null);
        }

        try {
            $responses = Http::pool(fn (Pool $pool) => array_map(
                fn (string $stdin) => $pool
                    ->withHeaders([
                        'x-rapidapi-key' => $this->apiKey,
                        'x-rapidapi-host' => $this->apiHost,
                    ])
                    ->timeout(self::TIMEOUT_SECONDS)
                    ->post($this->apiUrl.'/submissions?base64_encoded=false&wait=true', [
                        'source_code' => $code,
                        'language_id' => $languageId,
                        'stdin' => $stdin,
                    ]),
                $stdins
            ));
        } catch (\Throwable $e) {
            Log::error('judge0.submit.failed', [
                'action' => 'submit',
                'language_id' => $languageId,
                'error' => $e->getMessage(),
            ]);

            return array_fill(0, count($stdins), null);
        }

        return array_map(
            fn (int $i) => $this->parse($responses[$i] ?? null, $languageId),
            array_keys($stdins)
        );
    }

    /**
     * A pool hands back a connection failure as a value rather than throwing
     * it, so each slot is either a Response or the exception that replaced it.
     */
    private function parse(mixed $response, int $languageId): ?array
    {
        if (! $response instanceof Response) {
            Log::error('judge0.submit.failed', [
                'action' => 'submit',
                'language_id' => $languageId,
                'error' => $response instanceof \Throwable ? $response->getMessage() : 'no response',
            ]);

            return null;
        }

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
