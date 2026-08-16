<?php

namespace Database\Seeders;

use App\Models\Concept;
use Illuminate\Database\Seeder;

/**
 * The Python concept taxonomy the knowledge-tracing layer measures against.
 *
 * Deliberately flat and small (12 concepts). A finer taxonomy spreads the same
 * amount of answer evidence over more concepts, so every mastery estimate ends
 * up low-confidence — coarse concepts with real evidence beat precise concepts
 * with none.
 *
 * Idempotent: keyed on slug via updateOrCreate, so re-seeding will not
 * duplicate rows or orphan existing question tags.
 */
class ConceptSeeder extends Seeder
{
    public function run(): void
    {
        $concepts = [
            ['slug' => 'variables', 'name' => 'Variables & Assignment', 'description' => 'Naming values, assignment, and scope basics.'],
            ['slug' => 'data_types', 'name' => 'Data Types', 'description' => 'int, float, str, bool, and type conversion.'],
            ['slug' => 'operators', 'name' => 'Operators & Expressions', 'description' => 'Arithmetic, comparison, and logical operators.'],
            ['slug' => 'conditionals', 'name' => 'Conditionals', 'description' => 'if / elif / else and branching logic.'],
            ['slug' => 'loops', 'name' => 'Loops', 'description' => 'for and while loops, break, continue, and iteration.'],
            ['slug' => 'functions', 'name' => 'Functions', 'description' => 'Defining functions, parameters, return values, and scope.'],
            ['slug' => 'lists', 'name' => 'Lists', 'description' => 'List creation, indexing, slicing, and common methods.'],
            ['slug' => 'dictionaries', 'name' => 'Dictionaries & Sets', 'description' => 'Key-value mappings, sets, and their operations.'],
            ['slug' => 'strings', 'name' => 'Strings', 'description' => 'String manipulation, formatting, and common methods.'],
            ['slug' => 'file_io', 'name' => 'File I/O', 'description' => 'Reading from and writing to files.'],
            ['slug' => 'error_handling', 'name' => 'Error Handling', 'description' => 'try / except, raising exceptions, and debugging.'],
            ['slug' => 'oop_basics', 'name' => 'OOP Basics', 'description' => 'Classes, objects, attributes, and methods.'],
        ];

        foreach ($concepts as $index => $concept) {
            Concept::updateOrCreate(
                ['slug' => $concept['slug']],
                [
                    'name' => $concept['name'],
                    'description' => $concept['description'],
                    'display_order' => ($index + 1) * 10,
                ]
            );
        }

        $this->command?->info('Seeded '.count($concepts).' Python concepts.');
    }
}
