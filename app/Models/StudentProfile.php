<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\TestSubmission;
use App\Models\LessonProgress;
use Illuminate\Support\Facades\Log;

class StudentProfile extends Model
{
    use HasFactory;

    protected $table = 'student_profiles';
    protected $primaryKey = 'student_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_Id',
        'current_points',
        'total_lessons_completed',
        'total_tests_taken',
        'average_score',
        'streak_days',
        'last_activity_date',
        'equipped_snapshot',
    ];

    protected $casts = [
        'current_points' => 'integer',
        'total_lessons_completed' => 'integer',
        'total_tests_taken' => 'integer',
        'average_score' => 'decimal:2',
        'streak_days' => 'integer',
        'last_activity_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'equipped_snapshot' => 'array',
    ];

    /* -------------------------
       关系定义 (Relationships)
       ------------------------- */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_Id', 'user_Id');
    }

    public function lessons(): BelongsToMany
    {
        return $this->belongsToMany(
            Lesson::class,
            'lesson_registrations',
            'student_id',
            'lesson_id'
        )->withPivot(['registration_id', 'registration_status', 'exercises_completed', 'tests_passed', 'completion_points_awarded', 'completed_at'])
            ->withTimestamps();
    }

    public function lessonRegistrations(): HasMany
    {
        return $this->hasMany(LessonRegistration::class, 'student_id', 'student_id');
    }

    public function exerciseSubmissions(): HasMany
    {
        return $this->hasMany(ExerciseSubmission::class, 'student_id', 'student_id');
    }

    public function testSubmissions(): HasMany
    {
        return $this->hasMany(TestSubmission::class, 'student_id', 'student_id');
    }

    public function rewardInventory(): HasMany
    {
        return $this->hasMany(StudentRewardInventory::class, 'student_id', 'student_id');
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class, 'student_id', 'student_id');
    }

    // ==================== NEW: Learning Path Relationships ====================

    /**
     * All learning paths assigned to this student
     */
    public function learningPaths(): HasMany
    {
        return $this->hasMany(StudentLearningPath::class, 'student_id', 'student_id');
    }
    /**
     * Active learning paths
     */
    public function activeLearningPaths(): HasMany
    {
        return $this->learningPaths()->where('status', 'active');
    }

    /**
     * Primary learning path (main path the student is following)
     */
    public function primaryLearningPath(): HasMany
    {
        return $this->learningPaths()
            ->where('is_primary', true)
            ->where('status', 'active');
    }

    /**
     * Completed learning paths
     */
    public function completedLearningPaths(): HasMany
    {
        return $this->hasMany(StudentLearningPath::class, 'student_id', 'student_id')
            ->where('student_learning_paths.status', 'completed');
    }


    /**
     * Placement test submissions
     */
    public function placementTestSubmissions(): HasMany
    {
        return $this->testSubmissions()
            ->whereHas('test', function ($query) {
                $query->where('test_type', 'placement');
            });
    }

    // ==================== NEW: Learning Path Methods ====================

    /**
     * Get the student's primary learning path
     */
    public function getPrimaryPath(): ?StudentLearningPath
    {
        return $this->primaryLearningPath()->first();
    }

    /**
     * Check if student has completed placement test
     */
    public function hasCompletedPlacementTest(): bool
    {
        return $this->placementTestSubmissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->exists();
    }

    /**
     * Get latest placement test submission
     */
    public function getLatestPlacementTest(): ?TestSubmission
    {
        return $this->placementTestSubmissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->latest('submitted_at')
            ->first();
    }

    /**
     * Check if student has a learning path assigned
     */
    public function hasLearningPath(): bool
    {
        return $this->learningPaths()->exists();
    }

    /**
     * Check if student has an active learning path
     */
    public function hasActiveLearningPath(): bool
    {
        return StudentLearningPath::where('student_id', $this->student_id)
            ->where('status', 'active')
            ->exists();
    }

    /**
     * Get recommended learning path based on placement test
     */
    public function getRecommendedPath(): ?LearningPath
    {
        $placementTest = $this->getLatestPlacementTest();

        return $placementTest?->recommendedPath;
    }

    /**
     * Assign a learning path to this student
     * 
     * @param int $pathId The learning path ID
     * @param string $assignedBy Who assigned it ('system', 'admin', 'self')
     * @param array $additionalData Additional data (submission_id, notes, etc.)
     * @return StudentLearningPath
     */
    public function assignLearningPath(
        int $pathId,
        string $assignedBy = 'system',
        array $additionalData = []
    ): StudentLearningPath {
        // Check if already assigned (使用直接查询)
        $existing = StudentLearningPath::where('student_id', $this->student_id)
            ->where('path_id', $pathId)
            ->whereIn('status', ['active', 'paused'])
            ->first();

        if ($existing) {
            return $existing;
        }

        // Check if student has any active paths (for is_primary logic)
        $hasActivePaths = StudentLearningPath::where('student_id', $this->student_id)
            ->where('status', 'active')
            ->exists();

        // Create new assignment
        return StudentLearningPath::create([
            'student_id' => $this->student_id,
            'path_id' => $pathId,
            'assigned_by' => $assignedBy,
            'assigned_at' => now(),
            'status' => 'active',
            'is_primary' => $additionalData['is_primary'] ?? !$hasActivePaths,
            'placement_test_submission_id' => $additionalData['placement_test_submission_id'] ?? null,
            'assigned_by_user_id' => $additionalData['assigned_by_user_id'] ?? null,
            'recommendation_score' => $additionalData['recommendation_score'] ?? null,
            'recommendation_reason' => $additionalData['recommendation_reason'] ?? null,
            'target_completion_date' => $additionalData['target_completion_date'] ?? null,
        ]);
    }

    /**
     * Accept recommended learning path from placement test
     */
    public function acceptRecommendedPath(): ?StudentLearningPath
    {
        $placementTest = $this->getLatestPlacementTest();

        if (!$placementTest || !$placementTest->recommended_path_id) {
            return null;
        }

        // Check if already accepted
        if ($placementTest->hasAcceptedRecommendation()) {
            return $placementTest->getAcceptedPathAssignment();
        }

        return $this->assignLearningPath(
            $placementTest->recommended_path_id,
            'system',
            [
                'placement_test_submission_id' => $placementTest->submission_id,
                'recommendation_score' => $placementTest->recommendation_confidence,
                'recommendation_reason' => $placementTest->recommendation_message,
                'is_primary' => true,
            ]
        );
    }
    /**
     * Get learning path progress summary
     */
    public function getLearningPathProgress(): array
    {
        // 使用直接查询而不是关系
        $activePaths = StudentLearningPath::where('student_id', $this->student_id)
            ->where('status', 'active')
            ->with('learningPath')
            ->get();

        if ($activePaths->isEmpty()) {
            return [
                'has_active_path' => false,
                'paths' => [],
                'overall_progress' => 0,
            ];
        }

        return [
            'has_active_path' => true,
            'paths' => $activePaths->map(function ($studentPath) {
                return [
                    'id' => $studentPath->student_path_id,
                    'path_id' => $studentPath->path_id,
                    'title' => $studentPath->learningPath->title,
                    'difficulty' => $studentPath->learningPath->difficulty_level,
                    'progress_percent' => $studentPath->progress_percent,
                    'status' => $studentPath->status,
                    'is_primary' => $studentPath->is_primary,
                    'started_at' => $studentPath->started_at?->format('Y-m-d'),
                    'last_activity' => $studentPath->last_activity_at?->diffForHumans(),
                    'days_in_path' => $studentPath->days_in_path,
                    'next_lesson' => $studentPath->getNextLesson()?->title,
                ];
            }),
            'overall_progress' => round($activePaths->avg('progress_percent'), 2),
        ];
    }

    /**
     * Get next lesson in primary learning path
     */
    public function getNextPathLesson(): ?Lesson
    {
        $primaryPath = $this->getPrimaryPath();

        return $primaryPath?->getNextLesson();
    }

    /**
     * Update all learning path progress
     */
    public function updateAllPathProgress(): void
    {
        // 使用直接查询
        $activePaths = StudentLearningPath::where('student_id', $this->student_id)
            ->where('status', 'active')
            ->get();

        foreach ($activePaths as $studentPath) {
            $studentPath->updateProgress();
        }
    }

    /**
     * Get learning path statistics
     */
    public function getLearningPathStats(): array
    {
        // 使用 Eloquent 查询而不是关系属性
        $allPaths = StudentLearningPath::where('student_id', $this->student_id)->get();

        return [
            'total_paths' => $allPaths->count(),
            'active_paths' => $allPaths->where('status', 'active')->count(),
            'completed_paths' => $allPaths->where('status', 'completed')->count(),
            'paused_paths' => $allPaths->where('status', 'paused')->count(),
            'abandoned_paths' => $allPaths->where('status', 'abandoned')->count(),
            'average_path_progress' => round($allPaths->avg('progress_percent'), 2),
            'has_completed_placement' => $this->hasCompletedPlacementTest(),
            'placement_test_score' => $this->getLatestPlacementTest()?->score,
        ];
    }
    /* -------------------------
       保持所有原有方法不变
       ------------------------- */

    public function getCompletedExercisesCount($lessonId = null): int
    {
        $query = $this->exerciseSubmissions()
            ->where('completed', true)
            ->distinct('exercise_id');

        if ($lessonId) {
            $query->whereHas('exercise', function ($q) use ($lessonId) {
                $q->where('lesson_id', $lessonId);
            });
        }

        return $query->count('exercise_id');
    }

    public function getBestScoreForExercise($exerciseId): ?int
    {
        return $this->exerciseSubmissions()
            ->where('exercise_id', $exerciseId)
            ->where('completed', true)
            ->max('score');
    }

    public function hasCompletedExercise($exerciseId): bool
    {
        return $this->exerciseSubmissions()
            ->where('exercise_id', $exerciseId)
            ->where('completed', true)
            ->whereRaw('score >= (SELECT max_score * 0.7 FROM interactive_exercises WHERE exercise_id = ?)', [$exerciseId])
            ->exists();
    }

    public function getExerciseHistory(int $limit = 10)
    {
        return $this->exerciseSubmissions()
            ->with(['exercise.lesson'])
            ->where('completed', true)
            ->latest('submitted_at')
            ->limit($limit)
            ->get();
    }

    public function getExerciseStats(): array
    {
        $submissions = $this->exerciseSubmissions()->where('completed', true);
        $totalSubmissions = $submissions->count();

        if ($totalSubmissions === 0) {
            return [
                'total_exercises' => 0,
                'completed_exercises' => 0,
                'average_score' => 0,
                'total_time_spent' => 0,
            ];
        }

        return [
            'total_exercises' => $totalSubmissions,
            'completed_exercises' => $submissions->distinct('exercise_id')->count('exercise_id'),
            'average_score' => round($submissions->avg('score'), 2),
            'total_time_spent' => $submissions->sum('time_taken'),
        ];
    }

    public function getOverallStats(): array
    {
        return [
            'exercises' => $this->getExerciseStats(),
            'tests' => $this->getTestProgressStats(),
            'learning_paths' => $this->getLearningPathStats(), // ← 新增
            'total_points' => $this->current_points,
            'level' => $this->points_level,
            'streak_days' => $this->streak_days,
            'streak_status' => $this->streak_status,
            'lessons_completed' => $this->total_lessons_completed,
            'last_activity' => $this->last_activity_date?->diffForHumans(),
        ];
    }

    public function addPoints(int $points): self
    {
        $this->increment('current_points', $points);
        $this->updateLastActivity();
        $this->refresh();
        return $this;
    }

    public function deductPoints(int $points): self
    {
        $this->current_points = max(0, $this->current_points - $points);
        $this->save();
        $this->refresh();
        return $this;
    }

    public function completedLesson(): self
    {
        $this->increment('total_lessons_completed');
        $this->updateLastActivity();

        // ← 新增：更新学习路径进度
        $this->updateAllPathProgress();

        $this->refresh();
        return $this;
    }

    public function updateStreak(): self
    {
        $today = now()->toDateString();
        $lastActivity = $this->last_activity_date?->toDateString();

        if ($lastActivity === $today) {
            return $this;
        } elseif ($lastActivity === now()->subDay()->toDateString()) {
            $this->increment('streak_days');
        } else {
            $this->streak_days = 1;
            $this->save();
        }

        $this->updateLastActivity();
        $this->refresh();
        return $this;
    }

    private function updateLastActivity(): void
    {
        $this->last_activity_date = now()->toDateString();
        $this->save();
    }

    public function updateTestStats(): self
    {
        $submissions = $this->testSubmissions()->whereIn('status', ['submitted', 'timeout']);

        $this->update([
            'total_tests_taken' => $submissions->count(),
            'average_score' => $submissions->avg('score') ?? 0.00
        ]);

        return $this;
    }

    public function completedTest(float $percentageScore): self
    {
        $previousCount = (int) $this->total_tests_taken;
        $previousAvg = (float) $this->average_score;

        $newCount = $previousCount + 1;
        $newTotalScore = ($previousAvg * $previousCount) + $percentageScore;
        $this->total_tests_taken = $newCount;
        $this->average_score = round($newTotalScore / $newCount, 2);

        $this->updateLastActivity();
        $this->save();
        $this->refresh();
        return $this;
    }

    public function processTestCompletion($testSubmission): self
    {
        if (!$testSubmission || !$testSubmission->is_completed) {
            return $this;
        }

        $this->completedTest($testSubmission->score);

        $averageDifficulty = $testSubmission->test->questions()
            ->avg('difficulty_level') ?? 1;
        $rewardPoints = $this->calculateTestRewardPoints(
            $testSubmission->score,
            (int) round($averageDifficulty)
        );
        $this->addPoints($rewardPoints);

        $this->updateStreak();

        return $this;
    }

    public function canTakeTest($testId): bool
    {
        $test = \App\Models\Test::find($testId);
        if (!$test) return false;

        return $test->canStudentTakeTest($this->student_id);
    }

    public function getTestAttemptsForTest($testId): int
    {
        return $this->testSubmissions()
            ->where('test_id', $testId)
            ->whereIn('status', ['submitted', 'timeout'])
            ->count();
    }

    public function getBestScoreForTest($testId): ?float
    {
        return $this->testSubmissions()
            ->where('test_id', $testId)
            ->whereIn('status', ['submitted', 'timeout'])
            ->max('score');
    }

    public function getLatestTestSubmission()
    {
        return $this->testSubmissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->latest('submitted_at')
            ->first();
    }

    public function hasInProgressTest(): bool
    {
        return $this->testSubmissions()
            ->where('status', 'in_progress')
            ->exists();
    }

    public function getCurrentTestSubmission()
    {
        return $this->testSubmissions()
            ->where('status', 'in_progress')
            ->latest('started_at')
            ->first();
    }

    public function calculateTestRewardPoints(float $score, int $testDifficulty = 1): int
    {
        $basePoints = match (true) {
            $score >= 95 => 60,
            $score >= 90 => 50,
            $score >= 80 => 40,
            $score >= 70 => 30,
            $score >= 60 => 20,
            default => 10,
        };

        $difficultyMultiplier = match ($testDifficulty) {
            3 => 1.5,
            2 => 1.2,
            default => 1.0,
        };

        $streakBonus = match (true) {
            $this->streak_days >= 7 => 1.2,
            $this->streak_days >= 3 => 1.1,
            default => 1.0,
        };

        return (int) round($basePoints * $difficultyMultiplier * $streakBonus);
    }

    public function getTestHistory(int $limit = 10)
    {
        return $this->testSubmissions()
            ->with(['test'])
            ->whereIn('status', ['submitted', 'timeout'])
            ->latest('submitted_at')
            ->limit($limit)
            ->get();
    }

    public function getTestProgressStats(): array
    {
        $submissions = $this->testSubmissions()->whereIn('status', ['submitted', 'timeout']);
        $totalSubmissions = $submissions->count();

        if ($totalSubmissions === 0) {
            return [
                'total_tests' => 0,
                'passed_tests' => 0,
                'failed_tests' => 0,
                'average_score' => 0,
                'highest_score' => 0,
                'lowest_score' => 0,
                'recent_improvement' => 0,
                'pass_rate' => 0,
                'total_time_spent' => 0,
            ];
        }

        $passedTests = $submissions->where('score', '>=', 70)->count();
        $scores = $submissions->pluck('score');

        return [
            'total_tests' => $totalSubmissions,
            'passed_tests' => $passedTests,
            'failed_tests' => $totalSubmissions - $passedTests,
            'average_score' => round($scores->avg(), 2),
            'highest_score' => $scores->max(),
            'lowest_score' => $scores->min(),
            'recent_improvement' => $this->calculateRecentImprovement(),
            'pass_rate' => round(($passedTests / $totalSubmissions) * 100, 2),
            'total_time_spent' => $this->getTotalTestTimeSpent(),
        ];
    }

    private function calculateRecentImprovement(): float
    {
        $recentSubmissions = $this->testSubmissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->latest('submitted_at')
            ->limit(6)
            ->pluck('score');

        if ($recentSubmissions->count() < 4) return 0;

        $recent = $recentSubmissions->take(3)->avg();
        $earlier = $recentSubmissions->skip(3)->avg();

        return round($recent - $earlier, 2);
    }

    private function getTotalTestTimeSpent(): int
    {
        return $this->testSubmissions()
            ->whereIn('status', ['submitted', 'timeout'])
            ->sum('time_spent') ?? 0;
    }

    public function getQuestionTypeStats(): array
    {
        $submissions = $this->testSubmissions()
            ->with(['answers.question'])
            ->whereIn('status', ['submitted', 'timeout'])
            ->get();

        $stats = [
            'mcq' => ['total' => 0, 'correct' => 0],
            'coding' => ['total' => 0, 'correct' => 0],
            'true_false' => ['total' => 0, 'correct' => 0],
            'short_answer' => ['total' => 0, 'correct' => 0],
        ];

        foreach ($submissions as $submission) {
            foreach ($submission->answers as $answer) {
                $type = $answer->question->type;
                if (isset($stats[$type])) {
                    $stats[$type]['total']++;
                    if ($answer->is_correct) {
                        $stats[$type]['correct']++;
                    }
                }
            }
        }

        foreach ($stats as $type => &$data) {
            $data['accuracy'] = $data['total'] > 0
                ? round(($data['correct'] / $data['total']) * 100, 2)
                : 0;
        }

        return $stats;
    }

    public function getPointsLevelAttribute(): string
    {
        return match (true) {
            $this->current_points >= 10000 => 'Expert',
            $this->current_points >= 5000 => 'Advanced',
            $this->current_points >= 2000 => 'Intermediate',
            $this->current_points >= 500 => 'Beginner',
            default => 'Newbie',
        };
    }

    public function getCompletionPercentageAttribute(): int
    {
        $totalLessons = \Illuminate\Support\Facades\Cache::remember(
            'active_lesson_count', 300, fn () => Lesson::where('is_active', true)->count()
        );
        if ($totalLessons === 0) return 0;
        return min(100, (int) round(($this->total_lessons_completed / $totalLessons) * 100));
    }

    public function getStreakStatusAttribute(): string
    {
        return match (true) {
            $this->streak_days >= 30 => 'On Fire!',
            $this->streak_days >= 7 => 'Great Streak!',
            $this->streak_days >= 3 => 'Building Momentum!',
            $this->streak_days > 0 => 'Getting Started!',
            default => 'Ready to Start!',
        };
    }

    public function getTestPerformanceLevelAttribute(): string
    {
        $avgScore = (float) $this->average_score;
        return match (true) {
            $avgScore >= 90 => 'Excellent',
            $avgScore >= 80 => 'Very Good',
            $avgScore >= 70 => 'Good',
            $avgScore >= 60 => 'Fair',
            $avgScore > 0 => 'Needs Improvement',
            default => 'Not Started',
        };
    }

    public function isActiveToday(): bool
    {
        return $this->last_activity_date?->isToday() ?? false;
    }

    public function scopeHighAchievers($query)
    {
        return $query->where('current_points', '>=', 5000);
    }

    public function scopeActiveStudents($query)
    {
        return $query->where('last_activity_date', '>=', now()->subDays(7));
    }

    public function scopeGoodStreak($query)
    {
        return $query->where('streak_days', '>=', 7);
    }

    public function scopeTopPerformers($query, int $limit = 10)
    {
        return $query->orderBy('average_score', 'desc')
            ->orderBy('current_points', 'desc')
            ->limit($limit);
    }

    public function scopeTestTakers($query)
    {
        return $query->where('total_tests_taken', '>', 0);
    }

    public function scopeHighScorers($query, float $minScore = 80.0)
    {
        return $query->where('average_score', '>=', $minScore);
    }

    public function scopeRecentlyActive($query, int $days = 3)
    {
        return $query->where('last_activity_date', '>=', now()->subDays($days));
    }

    public function rewards(): BelongsToMany
    {
        return $this->belongsToMany(
            Reward::class,
            'student_reward_inventory',
            'student_id',
            'reward_id',
            'student_id',
            'reward_id'
        )->withPivot(['quantity', 'obtained_at', 'is_equipped', 'equipped_at'])
            ->withTimestamps();
    }

    public function rewardRecords(): HasMany
    {
        return $this->hasMany(RewardRecord::class, 'student_id', 'student_id');
    }

    public function getEquippedAvatarFrame()
    {
        return $this->rewardInventory()
            ->where('is_equipped', true)
            ->whereHas('reward', function ($q) {
                $q->where('reward_type', 'avatar_frame');
            })
            ->with('reward')
            ->first();
    }

    public function getEquippedBackground()
    {
        return $this->rewardInventory()
            ->where('is_equipped', true)
            ->whereHas('reward', function ($q) {
                $q->where('reward_type', 'profile_background');
            })
            ->with('reward')
            ->first();
    }

    public function getEquippedTitle()
    {
        return $this->rewardInventory()
            ->where('is_equipped', true)
            ->whereHas('reward', function ($q) {
                $q->where('reward_type', 'profile_title');
            })
            ->with('reward')
            ->first();
    }

    public function getEquippedBadges()
    {
        return $this->rewardInventory()
            ->where('is_equipped', true)
            ->whereHas('reward', function ($q) {
                $q->where('reward_type', 'badge');
            })
            ->with('reward')
            ->get();
    }

    public function getEquippedRewards()
    {
        return $this->rewardInventory()
            ->where('is_equipped', true)
            ->with('reward')
            ->get();
    }

    public function getEquippedSnapshot(): array
    {
        $snapshot = $this->equipped_snapshot;

        if (empty($snapshot) || !is_array($snapshot)) {
            return [
                'avatar_frame' => null,
                'background' => null,
                'title' => null,
                'badges' => [],
                'updated_at' => null,
            ];
        }

        return [
            'avatar_frame' => $snapshot['avatar_frame'] ?? null,
            'background' => $snapshot['background'] ?? null,
            'title' => $snapshot['title'] ?? null,
            'badges' => $snapshot['badges'] ?? [],
            'updated_at' => $snapshot['updated_at'] ?? null,
        ];
    }

    public function updateEquippedSnapshot(): void
    {
        $avatarFrame = $this->getEquippedAvatarFrame();
        $background = $this->getEquippedBackground();
        $title = $this->getEquippedTitle();
        $badges = $this->getEquippedBadges();

        $snapshot = [
            'avatar_frame' => $avatarFrame ? [
                'id' => $avatarFrame->reward->reward_id,
                'name' => $avatarFrame->reward->name,
                'image_url' => $avatarFrame->reward->image_url,
                'reward_type' => $avatarFrame->reward->reward_type,
                'rarity' => $avatarFrame->reward->rarity,
                'metadata' => is_string($avatarFrame->reward->metadata)
                    ? json_decode($avatarFrame->reward->metadata, true)
                    : ($avatarFrame->reward->metadata ?? []),
            ] : null,

            'background' => $background ? [
                'id' => $background->reward->reward_id,
                'name' => $background->reward->name,
                'image_url' => $background->reward->image_url,
                'reward_type' => $background->reward->reward_type,
                'rarity' => $background->reward->rarity,
                'metadata' => is_string($background->reward->metadata)
                    ? json_decode($background->reward->metadata, true)
                    : ($background->reward->metadata ?? []),
            ] : null,

            'title' => $title ? [
                'id' => $title->reward->reward_id,
                'name' => $title->reward->name,
                'image_url' => $title->reward->image_url,
                'reward_type' => $title->reward->reward_type,
                'rarity' => $title->reward->rarity,
                'metadata' => is_string($title->reward->metadata)
                    ? json_decode($title->reward->metadata, true)
                    : ($title->reward->metadata ?? []),
            ] : null,

            'badges' => $badges->map(function ($badge) {
                return [
                    'id' => $badge->reward->reward_id,
                    'name' => $badge->reward->name,
                    'image_url' => $badge->reward->image_url,
                    'reward_type' => $badge->reward->reward_type,
                    'rarity' => $badge->reward->rarity,
                    'metadata' => is_string($badge->reward->metadata)
                        ? json_decode($badge->reward->metadata, true)
                        : ($badge->reward->metadata ?? []),
                ];
            })->toArray(),

            'updated_at' => now()->timestamp,
        ];

        $this->update(['equipped_snapshot' => $snapshot]);
        $this->refresh();

        Log::info('📸 Snapshot updated:', [
            'student_id' => $this->student_id,
            'has_avatar_frame' => $snapshot['avatar_frame'] !== null,
            'has_background' => $snapshot['background'] !== null,
            'has_title' => $snapshot['title'] !== null,
            'badges_count' => count($snapshot['badges']),
        ]);
    }

    public function getProgressForLesson($lessonId): ?LessonProgress
    {
        return $this->lessonProgress()
            ->where('lesson_id', $lessonId)
            ->first();
    }

    public function getOrCreateProgress($lessonId): LessonProgress
    {
        return $this->lessonProgress()
            ->firstOrCreate(
                ['lesson_id' => $lessonId],
                [
                    'status' => 'not_started',
                    'progress_percent' => 0,
                    'reward_granted' => false,
                    'exercise_completed' => false,
                    'test_completed' => false,
                ]
            );
    }

    public function getInProgressLessons()
    {
        return $this->lessonProgress()
            ->with('lesson')
            ->where('status', 'in_progress')
            ->orderBy('last_updated_at', 'desc')
            ->get();
    }

    public function getCompletedLessons()
    {
        return $this->lessonProgress()
            ->with('lesson')
            ->where('status', 'completed')
            ->orderBy('completed_at', 'desc')
            ->get();
    }

    public function getLessonCompletionRate(): float
    {
        $total = $this->lessonProgress()->count();

        if ($total === 0) {
            return 0;
        }

        $completed = $this->lessonProgress()->where('status', 'completed')->count();

        return round(($completed / $total) * 100, 2);
    }

    public function getProgressSummary(): array
    {
        $progress = $this->lessonProgress();

        return [
            'total_lessons' => $progress->count(),
            'completed' => $progress->where('status', 'completed')->count(),
            'in_progress' => $progress->where('status', 'in_progress')->count(),
            'not_started' => $progress->where('status', 'not_started')->count(),
            'completion_rate' => $this->getLessonCompletionRate(),
            'average_progress' => round($progress->avg('progress_percent') ?? 0, 2),
            'total_rewards_earned' => $progress->where('reward_granted', true)->count(),
        ];
    }

    public function updateLessonProgress($lessonId): void
    {
        $progress = $this->getProgressForLesson($lessonId);

        if (!$progress) {
            Log::warning('No progress record found for lesson', [
                'student_id' => $this->student_id,
                'lesson_id' => $lessonId,
            ]);
            return;
        }

        $progress->updateCompletionFlags();
        $calculatedProgress = $progress->calculateProgress();
        $progress->updateProgress($calculatedProgress);

        Log::info('Lesson progress updated', [
            'student_id' => $this->student_id,
            'lesson_id' => $lessonId,
            'progress_percent' => $calculatedProgress,
            'status' => $progress->status,
        ]);
    }

    public function canCompleteLesson($lessonId): array
    {
        $progress = $this->getProgressForLesson($lessonId);

        if (!$progress) {
            return [
                'can_complete' => false,
                'reason' => 'Progress record not found.',
                'details' => [],
            ];
        }

        $lesson = $progress->lesson;

        $totalExercises = $lesson->interactiveExercises()->where('is_active', true)->count();
        $completedExercises = 0;

        if ($totalExercises > 0) {
            $exerciseIds = $lesson->interactiveExercises()->where('is_active', true)->pluck('exercise_id');

            foreach ($exerciseIds as $exerciseId) {
                if ($this->hasCompletedExercise($exerciseId)) {
                    $completedExercises++;
                }
            }
        }

        $totalTests = $lesson->tests()->where('status', 'active')->count();
        $passedTests = 0;

        if ($totalTests > 0) {
            $testIds = $lesson->tests()->where('status', 'active')->pluck('test_id');

            foreach ($testIds as $testId) {
                $bestScore = $this->getBestScoreForTest($testId);
                $test = \App\Models\Test::find($testId);

                if ($bestScore !== null && $bestScore >= $test->passing_score) {
                    $passedTests++;
                }
            }
        }

        $allExercisesCompleted = $totalExercises === 0 || $completedExercises >= $totalExercises;
        $allTestsPassed = $totalTests === 0 || $passedTests >= $totalTests;

        $canComplete = $allExercisesCompleted && $allTestsPassed;

        $reason = '';
        if (!$allExercisesCompleted) {
            $reason = "Complete all exercises ({$completedExercises}/{$totalExercises} done).";
        } elseif (!$allTestsPassed) {
            $reason = "Pass all tests ({$passedTests}/{$totalTests} passed).";
        }

        return [
            'can_complete' => $canComplete,
            'reason' => $reason,
            'details' => [
                'exercises' => [
                    'total' => $totalExercises,
                    'completed' => $completedExercises,
                    'all_done' => $allExercisesCompleted,
                ],
                'tests' => [
                    'total' => $totalTests,
                    'passed' => $passedTests,
                    'all_done' => $allTestsPassed,
                ],
            ],
        ];
    }
}
