<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {


        $user = $request->user();

        if ($user->role === 'administrator') {
            // Directly render Admin dashboard
            return Inertia::render('Admin/Dashboard', [
                'auth' => [
                    'user' => [
                        'id' => $user->getKey(),
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ],
                ],
            ]);
        }

        if ($user->role === 'student') {
            // Load student profile if needed
            $user->load('studentProfile');
            $studentProfile = $user->studentProfile;

            return Inertia::render('Student/Dashboard', [
                'auth' => [
                    'user' => [
                        'id' => $user->getKey(),
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ],
                ],
                'studentProfile' => $studentProfile ? [
                    'current_points' => $studentProfile->current_points,
                    'total_lessons_completed' => $studentProfile->total_lessons_completed,
                    'total_tests_taken' => $studentProfile->total_tests_taken,
                    'average_score' => $studentProfile->average_score,
                    'streak_days' => $studentProfile->streak_days,
                    'points_level' => $studentProfile->points_level ?? 'Newbie',
                    'completion_percentage' => $studentProfile->completion_percentage ?? 0,
                    'streak_status' => $studentProfile->streak_status ?? 'Ready to Start! 🚀',
                    'last_activity_date' => $studentProfile->last_activity_date?->format('Y-m-d'),
                ] : null,
            ]);
        }

        abort(403, 'Unauthorized');
    }
}
