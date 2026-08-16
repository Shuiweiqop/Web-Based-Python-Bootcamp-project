<?php

namespace App\Http\Controllers;

use App\Models\StudentProfile;
use App\Services\Mastery\ConceptMasteryService;
use App\Services\Mastery\MasteryAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminMasteryController extends Controller
{
    public function __construct(
        private readonly MasteryAnalyticsService $analytics,
        private readonly ConceptMasteryService $mastery,
    ) {}

    /**
     * Learning-outcomes dashboard: which concepts the cohort struggles with,
     * which students need attention, and whether mastery is improving overall.
     */
    public function index(Request $request): Response
    {
        $this->assertAdministrator($request);

        return Inertia::render('Admin/Mastery/Index', [
            'summary' => $this->analytics->effectivenessSummary(),
            'concepts' => $this->analytics->cohortByConcept(),
            'atRisk' => $this->analytics->studentsNeedingAttention(),
            'thresholds' => [
                'weak' => (float) config('mastery.weak_concept_threshold'),
                'mastered' => (float) config('mastery.mastered_threshold'),
            ],
        ]);
    }

    /**
     * One student's ability profile, for an admin investigating a learner
     * flagged on the dashboard.
     */
    public function show(Request $request, StudentProfile $student): Response
    {
        $this->assertAdministrator($request);

        return Inertia::render('Admin/Mastery/Show', [
            'student' => [
                'student_id' => $student->student_id,
                'name' => $student->user?->name ?? 'Unknown learner',
                'email' => $student->user?->email,
            ],
            'report' => $this->analytics->studentReport($student),
            'thresholds' => [
                'weak' => (float) config('mastery.weak_concept_threshold'),
                'mastered' => (float) config('mastery.mastered_threshold'),
            ],
        ]);
    }

    private function assertAdministrator(Request $request): void
    {
        if (! $request->user()?->isAdministrator()) {
            abort(403, 'Unauthorized access.');
        }
    }
}
