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
     * Points leaderboard for students, ranked by lifetime (earned) XP so that
     * spending points in the reward shop never lowers a student's standing.
     */
    public function index(Request $request): Response
    {
        $profile = $this->resolveStudentProfile($request);

        $top = StudentProfile::query()
            ->with('user:user_Id,name')
            ->orderByDesc('lifetime_points')
            ->orderBy('student_id')
            ->limit(self::TOP_LIMIT)
            ->get()
            ->values()
            ->map(fn (StudentProfile $p, int $i) => [
                'rank' => $i + 1,
                'student_id' => $p->student_id,
                'name' => $p->user?->name ?? 'Unknown learner',
                'xp' => $p->lifetime_points,
                'level' => $p->levelInfo()['level'],
                'level_label' => $p->points_level,
                // Equipped avatar frame (denormalized on the profile snapshot — no extra query).
                'avatar_frame' => $p->equipped_snapshot['avatar_frame']['image_url'] ?? null,
                'is_me' => $p->student_id === $profile->student_id,
            ]);

        // Global rank for the current student, even when outside the top list.
        $rank = StudentProfile::query()
            ->where('lifetime_points', '>', $profile->lifetime_points)
            ->count() + 1;

        return Inertia::render('Student/Leaderboard/Index', [
            'leaderboard' => $top,
            'me' => array_merge($profile->levelInfo(), [
                'rank' => $rank,
                'total_players' => StudentProfile::count(),
            ]),
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
