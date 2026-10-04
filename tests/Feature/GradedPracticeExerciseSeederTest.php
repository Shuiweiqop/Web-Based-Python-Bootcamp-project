<?php

namespace Tests\Feature;

use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Services\Grading\FillBlankGrader;
use App\Services\Grading\SortingGrader;
use Database\Seeders\GradedPracticeExerciseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GradedPracticeExerciseSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['Introduction to Python Programming', 'Python Variables and Data Types', 'Working with Strings in Python'] as $title) {
            Lesson::create(['title' => $title, 'content' => 'Body', 'difficulty' => 'beginner', 'status' => 'active']);
        }
    }

    public function test_running_it_twice_leaves_one_of_each(): void
    {
        $this->seed(GradedPracticeExerciseSeeder::class);
        $this->seed(GradedPracticeExerciseSeeder::class);

        $this->assertSame(1, InteractiveExercise::where('exercise_type', 'sorting')->count());
        $this->assertSame(1, InteractiveExercise::where('exercise_type', 'fill_blank')->count());
        $this->assertSame(1, InteractiveExercise::where('exercise_type', 'memory_match')->count());
    }

    public function test_the_seeded_exercises_grade_full_marks_for_the_right_answers(): void
    {
        $this->seed(GradedPracticeExerciseSeeder::class);

        $sorting = InteractiveExercise::where('exercise_type', 'sorting')->sole();
        $grader = new SortingGrader;
        $public = array_column($grader->forStudent($sorting->content)['items'], 'id', 'text');
        $order = array_map(fn ($item) => $public[$item['text']], $sorting->content['items']);
        $this->assertSame(100, $grader->grade($sorting->content, ['order' => $order], 100)['score']);

        $blank = InteractiveExercise::where('exercise_type', 'fill_blank')->sole();
        $answers = array_map(
            fn ($sentence) => array_map(fn ($b) => $b['correctAnswer'], $sentence['blanks']),
            $blank->content['sentences']
        );
        $this->assertSame(100, (new FillBlankGrader)->grade($blank->content, ['answers' => $answers], 100)['score']);
    }

    public function test_a_missing_lesson_is_skipped(): void
    {
        Lesson::where('title', 'Python Variables and Data Types')->delete();

        $this->seed(GradedPracticeExerciseSeeder::class);

        $this->assertSame(2, InteractiveExercise::count());
    }
}
