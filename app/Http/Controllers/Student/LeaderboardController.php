<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardController extends Controller
{
    private const TOP_LIMIT = 50;

    /**
     * Points leaderboard for students.
     *
     * NOTE: ranking is on `current_points`, the only points metric stored today.
     * That balance drops when a student spends points in the reward shop, so the
     * ranking currently rewards hoarding. A lifetime/earned-points column would
     * be the fairer basis — see the leaderboard follow-up.
     */
    public function index(Request $request): Response
    {
        $profile = $this->resolveStudentProfile($request);

        $top = StudentProfile::query()
            ->with('user:user_Id,name')
            ->orderByDesc('current_points')
            ->orderBy('student_id')
            ->limit(self::TOP_LIMIT)
            ->get()
            ->values()
            ->map(fn (StudentProfile $p, int $i) => [
                'rank' => $i + 1,
                'student_id' => $p->student_id,
                'name' => $p->user?->name ?? 'Unknown learner',
                'points' => $p->current_points,
                'level' => $p->points_level,
                'is_me' => $p->student_id === $profile->student_id,
            ]);

        // Global rank for the current student, even when outside the top list.
        $rank = StudentProfile::query()
            ->where('current_points', '>', $profile->current_points)
            ->count() + 1;

        return Inertia::render('Student/Leaderboard/Index', [
            'leaderboard' => $top,
            'me' => [
                'rank' => $rank,
                'points' => $profile->current_points,
                'level' => $profile->points_level,
                'total_players' => StudentProfile::count(),
            ],
        ]);
    }

    private function resolveStudentProfile(Request $request): StudentProfile
    {
        $user = $request->user();

        if (! $user || $user->role !== 'student') {
            abort(403, 'Only students can access the leaderboard.');
        }

        return StudentProfile::query()
            ->where('user_Id', $user->user_Id)
            ->firstOrFail();
    }
}
