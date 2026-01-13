<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\LearningPath;
use App\Models\StudentLearningPath;
use App\Models\TestSubmission;
use App\Services\LearningPathRecommendationService;
use App\Services\PathProgressService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminPathAssignmentController extends Controller
{
    protected $recommendationService;
    protected $pathProgressService;

    public function __construct(
        LearningPathRecommendationService $recommendationService,
        PathProgressService $pathProgressService
    ) {
        $this->middleware(['auth', 'role:administrator']);
        $this->recommendationService = $recommendationService;
        $this->pathProgressService = $pathProgressService;
    }

    /**
     * Display all path assignments with filters
     */
    public function index(Request $request)
    {
        $query = StudentLearningPath::with(['student.user', 'learningPath', 'assignedByUser'])
            ->orderBy('assigned_at', 'desc');

        // Filter by student
        if ($studentId = $request->input('student_id')) {
            $query->where('student_id', $studentId);
        }

        // Filter by learning path
        if ($pathId = $request->input('path_id')) {
            $query->where('path_id', $pathId);
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by assignment method
        if ($assignedBy = $request->input('assigned_by')) {
            $query->where('assigned_by', $assignedBy);
        }

        // Filter by primary path
        if ($request->has('is_primary')) {
            $query->where('is_primary', $request->boolean('is_primary'));
        }

        // Search by student name or email
        if ($search = $request->input('search')) {
            $query->whereHas('student.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $assignments = $query->paginate(20)->withQueryString();

        // Transform data
        $assignments->getCollection()->transform(function ($assignment) {
            return [
                'student_path_id' => $assignment->student_path_id,
                'student_id' => $assignment->student_id,
                'student_name' => $assignment->student->user->name ?? 'Unknown',
                'student_email' => $assignment->student->user->email ?? 'N/A',
                'path_id' => $assignment->path_id,
                'path_title' => $assignment->learningPath->title ?? 'Unknown',
                'path_difficulty' => $assignment->learningPath->difficulty_level ?? 'N/A',
                'status' => $assignment->status,
                'progress_percent' => $assignment->progress_percent,
                'is_primary' => $assignment->is_primary,
                'assigned_by' => $assignment->assigned_by,
                'assigned_by_name' => $assignment->assignedByUser?->name ?? 'System',
                'assigned_at' => $assignment->assigned_at->format('M d, Y'),
                'started_at' => $assignment->started_at?->format('M d, Y'),
                'completed_at' => $assignment->completed_at?->format('M d, Y'),
                'last_activity_at' => $assignment->last_activity_at?->diffForHumans(),
                'days_in_path' => $assignment->days_in_path,
                'is_overdue' => $assignment->is_overdue,
            ];
        });

        // Get statistics
        $stats = [
            'total_assignments' => StudentLearningPath::count(),
            'active_assignments' => StudentLearningPath::where('status', 'active')->count(),
            'completed_assignments' => StudentLearningPath::where('status', 'completed')->count(),
            'paused_assignments' => StudentLearningPath::where('status', 'paused')->count(),
            'abandoned_assignments' => StudentLearningPath::where('status', 'abandoned')->count(),
            'average_progress' => round(StudentLearningPath::avg('progress_percent'), 2),
        ];

        // Get filter options
        $students = StudentProfile::with('user:user_Id,name,email')
            ->get()
            ->map(function ($student) {
                return [
                    'student_id' => $student->student_id,
                    'name' => $student->user->name ?? 'Unknown',
                    'email' => $student->user->email ?? '',
                ];
            });

        $paths = LearningPath::active()
            ->select('path_id', 'title')
            ->orderBy('title')
            ->get();

        return Inertia::render('Admin/PathAssignment/Index', [
            'assignments' => $assignments,
            'stats' => $stats,
            'filters' => $request->only([
                'search',
                'student_id',
                'path_id',
                'status',
                'assigned_by',
                'is_primary'
            ]),
            'students' => $students,
            'paths' => $paths,
            'statusOptions' => [
                'active' => 'Active',
                'paused' => 'Paused',
                'completed' => 'Completed',
                'abandoned' => 'Abandoned',
            ],
            'assignedByOptions' => [
                'system' => 'System (Auto)',
                'admin' => 'Admin (Manual)',
                'self' => 'Self (Student Choice)',
            ],
        ]);
    }

    /**
     * Show form to assign path to student
     */
    public function create(Request $request)
    {
        // Get student if provided in query
        $studentId = $request->input('student_id');
        $selectedStudent = null;

        if ($studentId) {
            $selectedStudent = StudentProfile::with('user')->find($studentId);
            if ($selectedStudent) {
                $selectedStudent = [
                    'student_id' => $selectedStudent->student_id,
                    'name' => $selectedStudent->user->name,
                    'email' => $selectedStudent->user->email,
                    'current_paths' => $selectedStudent->learningPaths()
                        ->with('learningPath')
                        ->whereIn('status', ['active', 'paused'])
                        ->get()
                        ->map(function ($sp) {
                            return [
                                'path_title' => $sp->learningPath->title,
                                'status' => $sp->status,
                                'progress_percent' => $sp->progress_percent,
                            ];
                        }),
                ];
            }
        }

        // Get all active students
        $students = StudentProfile::with('user:user_Id,name,email')
            ->get()
            ->map(function ($student) {
                return [
                    'student_id' => $student->student_id,
                    'name' => $student->user->name ?? 'Unknown',
                    'email' => $student->user->email ?? '',
                ];
            });

        // Get all active learning paths
        $paths = LearningPath::active()
            ->orderBy('difficulty_level')
            ->orderBy('title')
            ->get()
            ->map(function ($path) {
                return [
                    'path_id' => $path->path_id,
                    'title' => $path->title,
                    'description' => $path->description,
                    'difficulty_level' => $path->difficulty_level,
                    'estimated_duration_hours' => $path->estimated_duration_hours,
                    'total_lessons' => $path->total_lessons,
                    'score_range' => "{$path->min_score_required}% - {$path->max_score_required}%",
                ];
            });

        return Inertia::render('Admin/PathAssignment/Create', [
            'selectedStudent' => $selectedStudent,
            'students' => $students,
            'paths' => $paths,
        ]);
    }

    /**
     * Assign a path to student(s)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:student_profiles,student_id',
            'path_id' => 'required|exists:learning_paths,path_id',
            'is_primary' => 'boolean',
            'reason' => 'nullable|string|max:500',
            'target_completion_date' => 'nullable|date|after:today',
        ]);

        $path = LearningPath::findOrFail($validated['path_id']);
        $successCount = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($validated['student_ids'] as $studentId) {
                $student = StudentProfile::find($studentId);

                if (!$student) {
                    $errors[] = "Student ID {$studentId} not found.";
                    continue;
                }

                // Check if already assigned
                $existing = StudentLearningPath::where('student_id', $studentId)
                    ->where('path_id', $validated['path_id'])
                    ->whereIn('status', ['active', 'paused'])
                    ->first();

                if ($existing) {
                    $errors[] = "{$student->user->name} is already enrolled in this path.";
                    continue;
                }

                // Assign the path
                StudentLearningPath::create([
                    'student_id' => $studentId,
                    'path_id' => $validated['path_id'],
                    'assigned_by' => 'admin',
                    'assigned_by_user_id' => Auth::user()->user_Id,
                    'assigned_at' => now(),
                    'status' => 'active',
                    'is_primary' => $request->boolean('is_primary', false),
                    'recommendation_reason' => $validated['reason'] ?? 'Manually assigned by admin',
                    'target_completion_date' => $validated['target_completion_date'],
                ]);

                $successCount++;
            }

            DB::commit();

            $message = $successCount > 0
                ? "Successfully assigned path to {$successCount} student(s)!"
                : "No students were assigned.";

            if (!empty($errors)) {
                $message .= " Issues: " . implode(', ', $errors);
            }

            return redirect()->route('admin.path-assignments.index')
                ->with($successCount > 0 ? 'success' : 'warning', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to assign paths: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Show specific assignment details
     */
    public function show($assignmentId)
    {
        $assignment = StudentLearningPath::with([
            'student.user',
            'learningPath.lessons',
            'placementTestSubmission',
            'assignedByUser'
        ])->findOrFail($assignmentId);

        // Get detailed progress
        $progressDetails = $this->pathProgressService->getDetailedProgress($assignment);

        // Get student's test history for this path
        $pathLessonIds = $assignment->learningPath->lessons->pluck('lesson_id');

        $testHistory = $assignment->student->testSubmissions()
            ->whereHas('test', function ($q) use ($pathLessonIds) {
                $q->whereIn('lesson_id', $pathLessonIds);
            })
            ->whereIn('status', ['submitted', 'timeout'])
            ->with('test')
            ->latest('submitted_at')
            ->limit(10)
            ->get()
            ->map(function ($submission) {
                return [
                    'test_title' => $submission->test->title,
                    'score' => $submission->score,
                    'submitted_at' => $submission->submitted_at->format('M d, Y'),
                ];
            });

        return Inertia::render('Admin/PathAssignment/Show', [
            'assignment' => [
                'student_path_id' => $assignment->student_path_id,
                'student_name' => $assignment->student->user->name,
                'student_email' => $assignment->student->user->email,
                'path_title' => $assignment->learningPath->title,
                'path_difficulty' => $assignment->learningPath->difficulty_level,
                'status' => $assignment->status,
                'progress_percent' => $assignment->progress_percent,
                'is_primary' => $assignment->is_primary,
                'assigned_by' => $assignment->assigned_by,
                'assigned_by_name' => $assignment->assignedByUser?->name ?? 'System',
                'assigned_at' => $assignment->assigned_at->format('M d, Y h:i A'),
                'started_at' => $assignment->started_at?->format('M d, Y h:i A'),
                'completed_at' => $assignment->completed_at?->format('M d, Y h:i A'),
                'last_activity_at' => $assignment->last_activity_at?->format('M d, Y h:i A'),
                'recommendation_reason' => $assignment->recommendation_reason,
                'placement_test_score' => $assignment->placementTestSubmission?->score,
                'target_completion_date' => $assignment->target_completion_date?->format('M d, Y'),
                'days_in_path' => $assignment->days_in_path,
                'is_overdue' => $assignment->is_overdue,
            ],
            'progressDetails' => $progressDetails,
            'testHistory' => $testHistory,
        ]);
    }

    /**
     * Update assignment status or settings
     */
    public function update(Request $request, $assignmentId)
    {
        $assignment = StudentLearningPath::findOrFail($assignmentId);

        $validated = $request->validate([
            'status' => 'nullable|in:active,paused,completed,abandoned',
            'is_primary' => 'nullable|boolean',
            'target_completion_date' => 'nullable|date',
            'student_notes' => 'nullable|string|max:1000',
        ]);

        try {
            if (isset($validated['status'])) {
                $assignment->update(['status' => $validated['status']]);
            }

            if (isset($validated['is_primary']) && $validated['is_primary']) {
                $assignment->setAsPrimary();
            }

            if (isset($validated['target_completion_date'])) {
                $assignment->update(['target_completion_date' => $validated['target_completion_date']]);
            }

            if (isset($validated['student_notes'])) {
                $assignment->update(['student_notes' => $validated['student_notes']]);
            }

            return back()->with('success', 'Assignment updated successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update assignment: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove a path assignment
     */
    public function destroy($assignmentId)
    {
        $assignment = StudentLearningPath::findOrFail($assignmentId);

        // Check if student has made significant progress
        if ($assignment->progress_percent > 50) {
            return back()->withErrors([
                'error' => 'Cannot delete assignment with significant progress (>50%). Consider marking as abandoned instead.'
            ]);
        }

        try {
            $assignment->delete();

            return redirect()->route('admin.path-assignments.index')
                ->with('success', 'Path assignment removed successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to remove assignment: ' . $e->getMessage()]);
        }
    }

    /**
     * Bulk assign paths to multiple students
     */
    public function bulkAssign(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:student_profiles,student_id',
            'path_id' => 'required|exists:learning_paths,path_id',
            'is_primary' => 'boolean',
        ]);

        return $this->store($request);
    }

    /**
     * Bulk update assignment statuses
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'assignment_ids' => 'required|array|min:1',
            'assignment_ids.*' => 'exists:student_learning_paths,student_path_id',
            'action' => 'required|in:pause,resume,complete,abandon',
        ]);

        $action = $validated['action'];
        $successCount = 0;

        DB::beginTransaction();
        try {
            foreach ($validated['assignment_ids'] as $assignmentId) {
                $assignment = StudentLearningPath::find($assignmentId);

                if (!$assignment) {
                    continue;
                }

                switch ($action) {
                    case 'pause':
                        if ($assignment->status === 'active') {
                            $assignment->pause('Paused by admin');
                            $successCount++;
                        }
                        break;
                    case 'resume':
                        if ($assignment->status === 'paused') {
                            $assignment->resume();
                            $successCount++;
                        }
                        break;
                    case 'complete':
                        if ($assignment->progress_percent === 100 && $assignment->status !== 'completed') {
                            $assignment->update([
                                'status' => 'completed',
                                'completed_at' => now(),
                            ]);
                            $successCount++;
                        }
                        break;
                    case 'abandon':
                        if ($assignment->status !== 'completed') {
                            $assignment->abandon('Abandoned by admin');
                            $successCount++;
                        }
                        break;
                }
            }

            DB::commit();

            return back()->with('success', "Successfully updated {$successCount} assignment(s)!");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update assignments: ' . $e->getMessage()]);
        }
    }

    /**
     * Recalculate progress for an assignment
     */
    public function recalculateProgress($assignmentId)
    {
        $assignment = StudentLearningPath::findOrFail($assignmentId);

        try {
            $result = $this->pathProgressService->updatePathProgress($assignment);

            return back()->with(
                'success',
                "Progress recalculated! Updated from {$result['previous_progress']}% to {$result['current_progress']}%"
            );
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to recalculate progress: ' . $e->getMessage()]);
        }
    }

    /**
     * View student's learning path dashboard
     */
    public function studentDashboard($studentId)
    {
        $student = StudentProfile::with('user')->findOrFail($studentId);

        // Get all paths for this student
        $assignments = $student->learningPaths()
            ->with('learningPath')
            ->get()
            ->map(function ($assignment) {
                return [
                    'student_path_id' => $assignment->student_path_id,
                    'path_title' => $assignment->learningPath->title,
                    'path_difficulty' => $assignment->learningPath->difficulty_level,
                    'status' => $assignment->status,
                    'progress_percent' => $assignment->progress_percent,
                    'is_primary' => $assignment->is_primary,
                    'assigned_at' => $assignment->assigned_at->format('M d, Y'),
                    'days_in_path' => $assignment->days_in_path,
                ];
            });

        // Get statistics
        $stats = $student->getLearningPathStats();

        // Get placement test info
        $placementTest = $student->getLatestPlacementTest();
        $placementTestInfo = null;

        if ($placementTest) {
            $placementTestInfo = [
                'score' => $placementTest->score,
                'submitted_at' => $placementTest->submitted_at->format('M d, Y'),
                'recommended_path' => $placementTest->recommendedPath?->title,
                'has_accepted' => $placementTest->hasAcceptedRecommendation(),
            ];
        }

        return Inertia::render('Admin/PathAssignment/StudentDashboard', [
            'student' => [
                'student_id' => $student->student_id,
                'name' => $student->user->name,
                'email' => $student->user->email,
                'current_points' => $student->current_points,
                'total_lessons_completed' => $student->total_lessons_completed,
                'average_score' => $student->average_score,
            ],
            'assignments' => $assignments,
            'stats' => $stats,
            'placementTestInfo' => $placementTestInfo,
        ]);
    }

    /**
     * Export assignments data
     */
    public function export(Request $request)
    {
        $query = StudentLearningPath::with(['student.user', 'learningPath']);

        // Apply same filters as index
        if ($studentId = $request->input('student_id')) {
            $query->where('student_id', $studentId);
        }

        if ($pathId = $request->input('path_id')) {
            $query->where('path_id', $pathId);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $assignments = $query->get();

        // Generate CSV
        $filename = 'path_assignments_' . now()->format('Y-m-d_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($assignments) {
            $file = fopen('php://output', 'w');

            // Header row
            fputcsv($file, [
                'Assignment ID',
                'Student Name',
                'Student Email',
                'Learning Path',
                'Difficulty',
                'Status',
                'Progress %',
                'Is Primary',
                'Assigned By',
                'Assigned At',
                'Started At',
                'Completed At',
                'Days in Path',
            ]);

            // Data rows
            foreach ($assignments as $assignment) {
                fputcsv($file, [
                    $assignment->student_path_id,
                    $assignment->student->user->name ?? 'N/A',
                    $assignment->student->user->email ?? 'N/A',
                    $assignment->learningPath->title ?? 'N/A',
                    $assignment->learningPath->difficulty_level ?? 'N/A',
                    $assignment->status,
                    $assignment->progress_percent,
                    $assignment->is_primary ? 'Yes' : 'No',
                    $assignment->assigned_by,
                    $assignment->assigned_at?->format('Y-m-d H:i:s') ?? 'N/A',
                    $assignment->started_at?->format('Y-m-d H:i:s') ?? 'N/A',
                    $assignment->completed_at?->format('Y-m-d H:i:s') ?? 'N/A',
                    $assignment->days_in_path,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
