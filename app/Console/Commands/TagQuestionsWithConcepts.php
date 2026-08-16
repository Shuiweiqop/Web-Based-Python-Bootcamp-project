<?php

namespace App\Console\Commands;

use App\Models\InteractiveExercise;
use App\Models\Question;
use App\Services\Mastery\ConceptTaggingService;
use Illuminate\Console\Command;

/**
 * Bulk-tags the question bank with concepts via Gemini, so the knowledge-tracing
 * layer has evidence to work with.
 *
 * Untagged items are invisible to the ability model — they generate no evidence
 * at all — so this is what switches the feature on for existing content.
 */
class TagQuestionsWithConcepts extends Command
{
    protected $signature = 'concepts:tag
        {--exercises : Tag interactive exercises instead of questions}
        {--retag : Include items that already have concepts}
        {--force : Replace existing tags instead of adding to them (discards admin corrections)}
        {--limit=0 : Stop after this many items (0 = no limit)}
        {--dry-run : Show what would be tagged without writing anything}';

    protected $description = 'Tag questions or exercises with Python concepts using Gemini';

    public function handle(ConceptTaggingService $tagger): int
    {
        $isExercises = (bool) $this->option('exercises');
        $dryRun = (bool) $this->option('dry-run');
        $replace = (bool) $this->option('force');
        $limit = (int) $this->option('limit');

        if ($replace && ! $dryRun) {
            $this->warn('--force will DISCARD existing concept tags, including any an admin corrected by hand.');
        }

        $items = $this->fetchItems($isExercises, (bool) $this->option('retag'), $limit);

        if ($items->isEmpty()) {
            $this->info('Nothing to tag. (Use --retag to re-tag items that already have concepts.)');

            return self::SUCCESS;
        }

        $label = $isExercises ? 'exercise(s)' : 'question(s)';
        $this->info("Tagging {$items->count()} {$label}".($dryRun ? ' [DRY RUN]' : '').'...');
        $this->newLine();

        $tagged = 0;
        $skipped = 0;
        $failed = 0;

        $bar = $this->output->createProgressBar($items->count());
        $bar->start();

        foreach ($items as $item) {
            $result = $isExercises
                ? $tagger->suggestForExercise($item)
                : $tagger->suggestForQuestion($item);

            if (! $result['success']) {
                $failed++;
                $this->recordProblem($item, $isExercises, $result['message']);
                $bar->advance();

                continue;
            }

            if (empty($result['tags'])) {
                $skipped++;
                $bar->advance();

                continue;
            }

            if (! $dryRun) {
                $isExercises
                    ? $tagger->applyToExercise($item, $result['tags'], $replace)
                    : $tagger->applyToQuestion($item, $result['tags'], $replace);
            }

            $tagged++;
            $this->recordTagged($item, $isExercises, $result['tags']);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->renderSummary();

        $this->table(
            ['Tagged', 'No match', 'Failed'],
            [[$tagged, $skipped, $failed]]
        );

        if ($dryRun) {
            $this->warn('Dry run — nothing was written. Re-run without --dry-run to apply.');
        }

        // A partial failure is still a useful run; only report failure if every
        // single item failed, which usually means a missing/invalid API key.
        return ($failed > 0 && $tagged === 0) ? self::FAILURE : self::SUCCESS;
    }

    /** @var array<int, array{id: int, label: string, tags: string}> */
    private array $taggedRows = [];

    /** @var array<int, array{id: int, label: string, problem: string}> */
    private array $problemRows = [];

    private function fetchItems(bool $isExercises, bool $retag, int $limit)
    {
        $query = $isExercises
            ? InteractiveExercise::query()->with('concepts')
            : Question::query()->with('concepts');

        if (! $retag) {
            $query->whereDoesntHave('concepts');
        }

        if ($limit > 0) {
            $query->limit($limit);
        }

        return $query->get();
    }

    private function recordTagged($item, bool $isExercises, array $tags): void
    {
        $this->taggedRows[] = [
            'id' => $isExercises ? $item->exercise_id : $item->question_id,
            'label' => \Illuminate\Support\Str::limit(
                $isExercises ? $item->title : $item->question_text,
                50
            ),
            'tags' => implode(', ', array_map(
                fn ($t) => "{$t['slug']}({$t['weight']})",
                $tags
            )),
        ];
    }

    private function recordProblem($item, bool $isExercises, string $message): void
    {
        $this->problemRows[] = [
            'id' => $isExercises ? $item->exercise_id : $item->question_id,
            'label' => \Illuminate\Support\Str::limit(
                $isExercises ? $item->title : $item->question_text,
                50
            ),
            'problem' => $message,
        ];
    }

    private function renderSummary(): void
    {
        if (! empty($this->taggedRows)) {
            $this->table(['ID', 'Item', 'Concepts'], $this->taggedRows);
        }

        if (! empty($this->problemRows)) {
            $this->newLine();
            $this->error('Items that could not be tagged:');
            $this->table(['ID', 'Item', 'Problem'], $this->problemRows);
        }
    }
}
