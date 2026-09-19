<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Move coding test cases out of the content blob and into the test_cases
 * column, normalising expected_output to expected on the way.
 *
 * The authoring form wrote them into content while the grader read the column,
 * so every coding exercise was graded with an empty test list — which scores 0
 * and can never be marked complete, however correct the submission is.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('interactive_exercises')
            ->where('exercise_type', 'coding')
            ->orderBy('exercise_id')
            ->each(function ($row) {
                $content = json_decode($row->content ?? '', true);

                if (! is_array($content) || empty($content['test_cases'])) {
                    return;
                }

                $existing = json_decode($row->test_cases ?? '', true);

                // The column wins if something already populated it.
                if (is_array($existing) && $existing !== []) {
                    return;
                }

                $moved = [];

                foreach ($content['test_cases'] as $case) {
                    if (! is_array($case)) {
                        continue;
                    }

                    $expected = $case['expected'] ?? $case['expected_output'] ?? '';
                    unset($case['expected_output']);

                    if (trim((string) $expected) === '' && trim((string) ($case['input'] ?? '')) === '') {
                        continue;
                    }

                    $case['expected'] = (string) $expected;
                    $moved[] = $case;
                }

                if ($moved === []) {
                    return;
                }

                // content keeps its copy: this migration is reversible without
                // it, and nothing reads it once the column is populated.
                DB::table('interactive_exercises')
                    ->where('exercise_id', $row->exercise_id)
                    ->update(['test_cases' => json_encode($moved)]);
            });
    }

    public function down(): void
    {
        // Only clears what up() filled. content still holds the originals, so
        // no test cases are lost by rolling back.
        DB::table('interactive_exercises')
            ->where('exercise_type', 'coding')
            ->orderBy('exercise_id')
            ->each(function ($row) {
                $content = json_decode($row->content ?? '', true);

                if (is_array($content) && ! empty($content['test_cases'])) {
                    DB::table('interactive_exercises')
                        ->where('exercise_id', $row->exercise_id)
                        ->update(['test_cases' => null]);
                }
            });
    }
};
