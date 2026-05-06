<?php

namespace App\Http\Controllers;

use App\Services\StudentProfileService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentProfileController extends Controller
{
    public function __construct(private StudentProfileService $service) {}

    public function show(Request $request): Response
    {
        $user = $request->user();
        $studentProfile = $user->studentProfile()->first();

        if (!$studentProfile) {
            return Inertia::render('Profile/CreateProfile');
        }

        return Inertia::render('Student/Profile/Index', [
            'user' => [
                'name'   => $user->name,
                'email'  => $user->email,
                'avatar' => $user->avatar_url ?? null,
            ],
            'profile' => [
                'student_id'              => $studentProfile->student_id,
                'current_points'          => $studentProfile->current_points,
                'points_level'            => $studentProfile->points_level,
                'total_lessons_completed' => $studentProfile->total_lessons_completed,
                'total_tests_taken'       => $studentProfile->total_tests_taken,
                'average_score'           => $studentProfile->average_score,
                'streak_days'             => $studentProfile->streak_days,
                'streak_status'           => $studentProfile->streak_status,
                'last_activity_date'      => $studentProfile->last_activity_date?->diffForHumans(),
                'completion_percentage'   => $studentProfile->completion_percentage,
                'test_performance_level'  => $studentProfile->test_performance_level,
                'is_active_today'         => $studentProfile->isActiveToday(),
            ],
            'equipped'      => $this->service->getEquippedItems($studentProfile),
            'stats' => [
                'overall'         => $studentProfile->getOverallStats(),
                'tests'           => $studentProfile->getTestProgressStats(),
                'exercises'       => $studentProfile->getExerciseStats(),
                'question_types'  => $studentProfile->getQuestionTypeStats(),
                'completion_rate' => round($studentProfile->completion_percentage ?? 0, 1),
            ],
            'recent_activity' => [
                'tests' => $studentProfile->getTestHistory(5)->map(fn($test) => [
                    'id'           => $test->submission_id,
                    'test_name'    => $test->test->test_name ?? 'Unknown Test',
                    'score'        => $test->score,
                    'status'       => $test->status,
                    'submitted_at' => $test->submitted_at?->diffForHumans(),
                    'time_spent'   => $this->service->formatTimeSpent($test->time_spent),
                ]),
                'exercises' => $studentProfile->getExerciseHistory(5)->map(fn($exercise) => [
                    'id'             => $exercise->submission_id,
                    'exercise_title' => $exercise->exercise->title ?? 'Unknown Exercise',
                    'lesson_name'    => $exercise->exercise->lesson->lesson_name ?? 'Unknown Lesson',
                    'score'          => $exercise->score,
                    'max_score'      => $exercise->exercise->max_score ?? 100,
                    'submitted_at'   => $exercise->submitted_at?->diffForHumans(),
                ]),
            ],
            'achievements'  => $this->service->calculateAchievements($studentProfile),
            'learningPaths' => $this->service->getLearningPaths($studentProfile),
            'inventory'     => $this->service->getInventoryByType($studentProfile),
            'rewardTypes'   => [
                'avatar_frame'       => 'Avatar Frame',
                'profile_background' => 'Background',
                'background'         => 'Background',
                'badge'              => 'Badge',
                'title'              => 'Title',
                'profile_title'      => 'Title',
                'theme'              => 'Theme',
                'effect'             => 'Effect',
            ],
        ]);
    }

    public function rewards(Request $request): Response
    {
        $studentProfile = $request->user()->studentProfile;

        if (!$studentProfile) {
            return Inertia::render('Profile/CreateProfile');
        }

        return Inertia::render('Student/Profile/Rewards', [
            'current_points' => $studentProfile->current_points,
            'inventory'      => $this->service->getInventoryGrouped($studentProfile),
        ]);
    }

    public function points(Request $request): Response
    {
        $studentProfile = $request->user()->studentProfile;

        if (!$studentProfile) {
            return Inertia::render('Profile/CreateProfile');
        }

        $timeFilter = $request->get('time', 'all');
        $typeFilter = $request->get('type', 'all');

        return Inertia::render('Student/Points/Index', [
            'currentPoints' => $studentProfile->current_points,
            'pointsHistory' => $this->service->getPointsHistory($studentProfile, $timeFilter, $typeFilter),
            'pointsStats'   => $this->service->getPointsStats($studentProfile),
            'filters'       => ['time' => $timeFilter, 'type' => $typeFilter],
        ]);
    }

    public function statistics(Request $request): Response
    {
        $studentProfile = $request->user()->studentProfile;

        if (!$studentProfile) {
            return Inertia::render('Profile/CreateProfile');
        }

        $lessonProgress = $studentProfile->lessonRegistrations()->with('lesson')->get()
            ->map(fn($reg) => [
                'lesson_name'         => $reg->lesson->lesson_name ?? 'Unknown',
                'status'              => $reg->registration_status,
                'exercises_completed' => $reg->exercises_completed,
                'tests_passed'        => $reg->tests_passed,
                'completion_points'   => $reg->completion_points_awarded,
                'completed_at'        => $reg->completed_at?->format('Y-m-d'),
            ]);

        return Inertia::render('Student/Profile/Statistics', [
            'profile' => [
                'current_points' => $studentProfile->current_points,
                'points_level'   => $studentProfile->points_level,
                'streak_days'    => $studentProfile->streak_days,
            ],
            'test_stats'         => $studentProfile->getTestProgressStats(),
            'exercise_stats'     => $studentProfile->getExerciseStats(),
            'question_type_stats'=> $studentProfile->getQuestionTypeStats(),
            'progress_over_time' => $this->service->getProgressOverTime($studentProfile, 30),
            'lesson_progress'    => $lessonProgress,
        ]);
    }

    public function history(Request $request): Response
    {
        $studentProfile = $request->user()->studentProfile;

        if (!$studentProfile) {
            return Inertia::render('Profile/CreateProfile');
        }

        return Inertia::render('Student/Profile/History', [
            'test_history' => $studentProfile->getTestHistory(20)->map(fn($test) => [
                'id'              => $test->submission_id,
                'test_name'       => $test->test->test_name ?? 'Unknown Test',
                'score'           => $test->score,
                'status'          => $test->status,
                'correct_answers' => $test->correct_answers,
                'total_questions' => $test->total_questions,
                'time_spent'      => $this->service->formatTimeSpent($test->time_spent),
                'submitted_at'    => $test->submitted_at?->format('M d, Y H:i'),
            ]),
            'exercise_history' => $studentProfile->getExerciseHistory(20)->map(fn($exercise) => [
                'id'             => $exercise->submission_id,
                'exercise_title' => $exercise->exercise->title ?? 'Unknown Exercise',
                'lesson_name'    => $exercise->exercise->lesson->lesson_name ?? 'Unknown',
                'score'          => $exercise->score,
                'max_score'      => $exercise->exercise->max_score ?? 100,
                'time_taken'     => $this->service->formatTimeSpent($exercise->time_taken),
                'submitted_at'   => $exercise->submitted_at?->format('M d, Y H:i'),
            ]),
        ]);
    }
}
