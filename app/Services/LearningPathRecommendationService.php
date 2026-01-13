<?php

namespace App\Services;

use App\Models\LearningPath;
use App\Models\StudentProfile;
use App\Models\TestSubmission;
use App\Models\StudentLearningPath;
use App\Models\LessonProgress;
use Illuminate\Support\Facades\Log;

class LearningPathRecommendationService
{
    /**
     * Recommend a learning path based on placement test score
     *
     * @param TestSubmission $submission
     * @return array
     */
    public function recommendFromPlacementTest(TestSubmission $submission): array
    {
        // Validate this is a placement test
        if (!$submission->test || $submission->test->test_type !== 'placement') {
            return [
                'success' => false,
                'message' => 'This is not a placement test submission.',
            ];
        }

        $score = $submission->score;

        // Find the best matching path based on score
        $recommendedPath = LearningPath::active()
            ->forScore($score)
            ->orderBy('min_score_required', 'desc')
            ->first();

        if (!$recommendedPath) {
            // Fallback to beginner path if no match found
            $recommendedPath = LearningPath::active()
                ->where('difficulty_level', 'beginner')
                ->first();
        }

        if (!$recommendedPath) {
            return [
                'success' => false,
                'message' => 'No suitable learning path found. Please contact support.',
            ];
        }

        // Update submission with recommended path
        $submission->update([
            'recommended_path_id' => $recommendedPath->path_id,
        ]);

        // Calculate confidence score
        $confidence = $this->calculateConfidence($score, $recommendedPath);

        // Get alternative paths
        $alternatives = $this->getAlternativePaths($score, $recommendedPath->path_id);

        Log::info('Path recommended from placement test', [
            'student_id' => $submission->student_id,
            'submission_id' => $submission->submission_id,
            'score' => $score,
            'recommended_path_id' => $recommendedPath->path_id,
            'confidence' => $confidence,
        ]);

        return [
            'success' => true,
            'recommended_path' => $recommendedPath,
            'score' => $score,
            'confidence' => $confidence,
            'alternative_paths' => $alternatives,
            'message' => $this->getRecommendationMessage($score, $recommendedPath, $confidence),
        ];
    }

    /**
     * Re-evaluate student's current path based on recent performance
     *
     * @param StudentProfile $student
     * @return array
     */
    public function reevaluateStudentPath(StudentProfile $student): array
    {
        $primaryPath = $student->getPrimaryLearningPath();

        if (!$primaryPath) {
            return [
                'success' => false,
                'message' => 'Student has no active learning path.',
            ];
        }

        // Get recent lesson completions
        $recentLessons = $this->getRecentCompletedLessons($student);

        if ($recentLessons->count() < config('recommendation.min_lessons_for_reevaluation', 3)) {
            return [
                'success' => false,
                'message' => 'Not enough data for re-evaluation. Need at least ' .
                    config('recommendation.min_lessons_for_reevaluation', 3) . ' completed lessons.',
            ];
        }

        // Calculate average performance
        $averageScore = $this->calculateAveragePerformance($student, $recentLessons);

        // Determine if path change is recommended
        $recommendation = $this->analyzePerformanceAndRecommend(
            $student,
            $primaryPath,
            $averageScore
        );

        Log::info('Student path re-evaluated', [
            'student_id' => $student->student_id,
            'current_path_id' => $primaryPath->path_id,
            'average_score' => $averageScore,
            'recommendation' => $recommendation,
        ]);

        return $recommendation;
    }

    /**
     * Calculate confidence score for a recommendation
     *
     * @param float $score
     * @param LearningPath $path
     * @return int
     */
    private function calculateConfidence(float $score, LearningPath $path): int
    {
        $range = $path->max_score_required - $path->min_score_required;

        if ($range === 0) {
            return 100;
        }

        $position = $score - $path->min_score_required;
        $centerPosition = $range / 2;
        $distanceFromCenter = abs($centerPosition - $position);

        // Confidence is higher when closer to center
        $penalty = ($distanceFromCenter / $centerPosition) * 30;
        $confidence = 100 - $penalty;

        return max(70, min(100, round($confidence)));
    }

    /**
     * Get alternative learning paths
     *
     * @param float $score
     * @param int $excludePathId
     * @return \Illuminate\Support\Collection
     */
    private function getAlternativePaths(float $score, int $excludePathId)
    {
        $marginOfError = 10; // ±10 points

        return LearningPath::active()
            ->where('path_id', '!=', $excludePathId)
            ->where(function ($query) use ($score, $marginOfError) {
                $query->where(function ($q) use ($score, $marginOfError) {
                    $q->where('min_score_required', '<=', $score)
                        ->where('max_score_required', '>=', $score - $marginOfError);
                })->orWhere(function ($q) use ($score, $marginOfError) {
                    $q->where('min_score_required', '<=', $score + $marginOfError)
                        ->where('max_score_required', '>=', $score);
                });
            })
            ->orderBy('display_order')
            ->limit(3)
            ->get();
    }

    /**
     * Get recommendation message based on score and path
     *
     * @param float $score
     * @param LearningPath $path
     * @param int $confidence
     * @return string
     */
    private function getRecommendationMessage(float $score, LearningPath $path, int $confidence): string
    {
        if ($confidence >= 85) {
            return "Excellent! Based on your test score of {$score}%, we strongly recommend the \"{$path->title}\" learning path. This path is perfectly suited to your current skill level.";
        } elseif ($confidence >= 75) {
            return "Based on your score of {$score}%, we recommend the \"{$path->title}\" learning path. This should be a good match for your skill level.";
        } else {
            return "Your score of {$score}% suggests starting with the \"{$path->title}\" learning path. Don't worry if it feels challenging at first - you'll improve as you learn!";
        }
    }

    /**
     * Get recent completed lessons for a student
     *
     * @param StudentProfile $student
     * @return \Illuminate\Support\Collection
     */
    private function getRecentCompletedLessons(StudentProfile $student)
    {
        return $student->lessonProgress()
            ->with('lesson')
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->limit(config('recommendation.auto_recommend_after_lessons', 3))
            ->get();
    }

    /**
     * Calculate average performance from recent lessons
     *
     * @param StudentProfile $student
     * @param \Illuminate\Support\Collection $recentLessons
     * @return float
     */
    private function calculateAveragePerformance(StudentProfile $student, $recentLessons): float
    {
        $totalScore = 0;
        $count = 0;

        foreach ($recentLessons as $lessonProgress) {
            $lesson = $lessonProgress->lesson;

            // Get test scores for this lesson
            $testScores = $student->testSubmissions()
                ->whereHas('test', function ($q) use ($lesson) {
                    $q->where('lesson_id', $lesson->lesson_id);
                })
                ->whereIn('status', ['submitted', 'timeout'])
                ->pluck('score');

            if ($testScores->isNotEmpty()) {
                $totalScore += $testScores->avg();
                $count++;
            }
        }

        return $count > 0 ? round($totalScore / $count, 2) : 0;
    }

    /**
     * Analyze performance and recommend path changes
     *
     * @param StudentProfile $student
     * @param StudentLearningPath $currentPath
     * @param float $averageScore
     * @return array
     */
    private function analyzePerformanceAndRecommend(
        StudentProfile $student,
        StudentLearningPath $currentPath,
        float $averageScore
    ): array {
        $upgradeThreshold = config('recommendation.upgrade_threshold', 85);
        $downgradeThreshold = config('recommendation.downgrade_threshold', 60);

        // Student is excelling - recommend upgrade
        if ($averageScore >= $upgradeThreshold) {
            $nextPath = $this->findNextDifficultyPath($currentPath->learningPath, 'up');

            if ($nextPath) {
                return [
                    'success' => true,
                    'action' => 'upgrade',
                    'current_path' => $currentPath->learningPath,
                    'recommended_path' => $nextPath,
                    'average_score' => $averageScore,
                    'message' => "🎉 Excellent progress! Your average score of {$averageScore}% shows you're ready for more advanced content. Consider upgrading to the \"{$nextPath->title}\" learning path.",
                ];
            }

            return [
                'success' => true,
                'action' => 'stay',
                'message' => "Great job! You're excelling in your current path with an average score of {$averageScore}%. Keep up the excellent work!",
            ];
        }

        // Student is struggling - recommend support or downgrade
        if ($averageScore < $downgradeThreshold) {
            $previousPath = $this->findNextDifficultyPath($currentPath->learningPath, 'down');

            if ($previousPath) {
                return [
                    'success' => true,
                    'action' => 'downgrade',
                    'current_path' => $currentPath->learningPath,
                    'recommended_path' => $previousPath,
                    'average_score' => $averageScore,
                    'message' => "Your average score of {$averageScore}% suggests you might benefit from additional foundational training. Consider switching to the \"{$previousPath->title}\" path to strengthen your skills.",
                ];
            }

            return [
                'success' => true,
                'action' => 'support',
                'message' => "Your average score of {$averageScore}% indicates you may need extra support. Consider reviewing previous lessons or reaching out for help. You can do this!",
            ];
        }

        // Student is doing fine - stay on current path
        return [
            'success' => true,
            'action' => 'stay',
            'message' => "You're making good progress with an average score of {$averageScore}%. Keep going on your current path!",
        ];
    }

    /**
     * Find next difficulty path (upgrade or downgrade)
     *
     * @param LearningPath $currentPath
     * @param string $direction ('up' or 'down')
     * @return LearningPath|null
     */
    private function findNextDifficultyPath(LearningPath $currentPath, string $direction): ?LearningPath
    {
        $difficultyOrder = ['beginner', 'intermediate', 'advanced'];
        $currentIndex = array_search($currentPath->difficulty_level, $difficultyOrder);

        if ($currentIndex === false) {
            return null;
        }

        if ($direction === 'up') {
            $nextIndex = $currentIndex + 1;
        } else {
            $nextIndex = $currentIndex - 1;
        }

        if (!isset($difficultyOrder[$nextIndex])) {
            return null; // Already at highest/lowest level
        }

        return LearningPath::active()
            ->where('difficulty_level', $difficultyOrder[$nextIndex])
            ->first();
    }

    /**
     * Auto-assign recommended path to student
     *
     * @param StudentProfile $student
     * @param LearningPath $path
     * @param TestSubmission|null $submission
     * @return StudentLearningPath
     */
    public function assignPathToStudent(
        StudentProfile $student,
        LearningPath $path,
        ?TestSubmission $submission = null
    ): StudentLearningPath {
        // Check if already enrolled
        $existing = StudentLearningPath::where('student_id', $student->student_id)
            ->where('path_id', $path->path_id)
            ->whereIn('status', ['active', 'paused'])
            ->first();

        if ($existing) {
            return $existing;
        }

        // Create new path assignment
        return StudentLearningPath::create([
            'student_id' => $student->student_id,
            'path_id' => $path->path_id,
            'assigned_by' => 'system',
            'placement_test_submission_id' => $submission?->submission_id,
            'status' => 'active',
            'is_primary' => !$student->learningPaths()->where('is_primary', true)->exists(),
            'recommendation_score' => $submission ?
                $this->calculateConfidence($submission->score, $path) : null,
            'recommendation_reason' => $submission ?
                $this->getRecommendationMessage(
                    $submission->score,
                    $path,
                    $this->calculateConfidence($submission->score, $path)
                ) :
                'Manually assigned',
        ]);
    }
}
