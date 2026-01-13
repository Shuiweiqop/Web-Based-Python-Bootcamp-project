<?php

namespace Database\Factories;

use App\Models\ExerciseSubmission;
use App\Models\InteractiveExercise;
use App\Models\StudentProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExerciseSubmission>
 */
class ExerciseSubmissionFactory extends Factory
{
    protected $model = ExerciseSubmission::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $exercise = InteractiveExercise::inRandomOrder()->first();
        $maxScore = $exercise ? $exercise->max_score : 100;
        $score = fake()->numberBetween(0, $maxScore);

        return [
            'exercise_id' => $exercise ? $exercise->exercise_id : InteractiveExercise::factory(),
            'student_id' => StudentProfile::inRandomOrder()->first()?->student_id ?? StudentProfile::factory(),
            'score' => $score,
            'time_taken' => fake()->numberBetween(30, 600), // 30秒到10分钟
            'completed' => $score >= ($maxScore * 0.7), // 70% 以上算完成
            'answer_data' => $this->generateAnswerData($exercise),
            'submitted_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }

    /**
     * 生成答案数据（根据 exercise 类型）
     */
    private function generateAnswerData($exercise)
    {
        if (!$exercise) {
            return ['answer' => 'Sample answer'];
        }

        switch ($exercise->exercise_type) {
            case 'drag_drop':
                return [
                    'item_1' => 'zone_a',
                    'item_2' => 'zone_b',
                    'item_3' => 'zone_a',
                ];

            case 'adventure_game':
                return [
                    'scenario_1' => 0,
                    'scenario_2' => 1,
                    'scenario_3' => 0,
                ];

            case 'maze_game':
                return [
                    'completed' => true,
                    'steps' => fake()->numberBetween(20, 100),
                    'time' => fake()->numberBetween(60, 300),
                ];

            default:
                return ['answer' => 'Generic answer'];
        }
    }

    /**
     * 表示提交已完成
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $exercise = InteractiveExercise::find($attributes['exercise_id']);
            $maxScore = $exercise ? $exercise->max_score : 100;

            return [
                'score' => fake()->numberBetween((int)($maxScore * 0.7), $maxScore),
                'completed' => true,
            ];
        });
    }

    /**
     * 表示提交未完成
     */
    public function incomplete(): static
    {
        return $this->state(function (array $attributes) {
            $exercise = InteractiveExercise::find($attributes['exercise_id']);
            $maxScore = $exercise ? $exercise->max_score : 100;

            return [
                'score' => fake()->numberBetween(0, (int)($maxScore * 0.69)),
                'completed' => false,
            ];
        });
    }

    /**
     * 满分提交
     */
    public function perfect(): static
    {
        return $this->state(function (array $attributes) {
            $exercise = InteractiveExercise::find($attributes['exercise_id']);
            $maxScore = $exercise ? $exercise->max_score : 100;

            return [
                'score' => $maxScore,
                'completed' => true,
            ];
        });
    }

    /**
     * 指定特定学生
     */
    public function forStudent($studentId): static
    {
        return $this->state([
            'student_id' => $studentId,
        ]);
    }

    /**
     * 指定特定 exercise
     */
    public function forExercise($exerciseId): static
    {
        return $this->state([
            'exercise_id' => $exerciseId,
        ]);
    }

    /**
     * 最近提交的
     */
    public function recent(): static
    {
        return $this->state([
            'submitted_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);
    }
}
