<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Services\Mastery\MasteryAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MasteryController extends Controller
{
    public function __construct(private readonly MasteryAnalyticsService $analytics) {}

    /**
     * The student's own skill report: per-concept mastery, progress since the
     * placement baseline, and what to work on next.
     */
    public function index(Request $request): Response
    {
        $profile = $this->resolveStudentProfile($request);

        return Inertia::render('Student/Mastery/Index', [
            'report' => $this->analytics->studentReport($profile),
            'thresholds' => [
                'weak' => (float) config('mastery.weak_concept_threshold'),
                'mastered' => (float) config('mastery.mastered_threshold'),
            ],
        ]);
    }

    private function resolveStudentProfile(Request $request): StudentProfile
    {
        $user = $request->user();

        if (! $user || $user->role !== 'student') {
            abort(403, 'Only students can view their skill report.');
        }

        $profile = $user->studentProfile;

        if (! $profile) {
            abort(404, 'Student profile not found.');
        }

        return $profile;
    }
}
