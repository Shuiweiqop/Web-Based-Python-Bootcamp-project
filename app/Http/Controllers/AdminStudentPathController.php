<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use App\Models\StudentLearningPath;
use App\Models\StudentProfile;
use App\Models\User;
use App\Services\PathProgressService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminStudentPathController extends Controller
{
    protected $pathProgressService;

    public function __construct(PathProgressService $pathProgressService)
    {
        $this->middleware(['auth', 'role:administrator']);
        $this->pathProgressService = $pathProgressService;
    }

    /**
     * Display all student learning path assignments
     */
    public function index(Request $request)
    {
        $query = StudentLearningPath::with([
            'student.user',
            'learningPath',
            'assignedByUser'
        ])->withTrashed();

        // Search by student name or email
        if ($search = $request->input('search')) {
            $query->whereHas('student.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
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

        // Filter by progress range
        if ($request->has('progress_min')) {
            $query->where('progress_percent', '>=', $request->input('progress_min'));
        }
        if ($request->has('progress_max')) {
            $query->where('progress_percent', '<=', $request->input('progress_max'));
        }

        // Filter overdue
        if ($request->boolean('overdue_only')) {
            $query->whereNotNull('target_completion_date')
                ->where('target_completion_date', '<', now())
                ->where('status', '!=', 'completed');
        }

        // Sort
        $sortBy = $request->input('sort_by', 'assigned_at');
        $sortOrder = $request->input('sort_order', 'desc');

        if ($sortBy === 'student_name') {
            $query->join('student_profiles', 'student_learning_paths.student_id', '=', 'student_profiles.student_id')
                ->join('users', 'student_profiles.user_id', '=', 'users.user_Id')
                ->orderBy('users.name', $sortOrder)
                ->select('student_learning_paths.*');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $assignments = $query->paginate(20)->withQueryString();

        // Transform data
        $assignments->getCollection()->transform(function ($assignment) {
            return [
                'student_path_id' => $assignment->student_path_id,
                'student' => [
                    'student_id' => $assignment->student->student_id,
                    'name' => $assignment->student->user->name,
                    'email' => $assignment->student->user->email,
                ],
                'path' => [
                    'path_id' => $assignment->learningPath->path_id,
                    'title' => $assignment->learningPath->title,
                    'difficulty_level' => $assignment->learningPath->difficulty_level,
                ],
                'status' => $assignment->status,
                'progress_percent' => $assignment->progress_percent,
                'is_primary' => $assignment->is_primary,
                'assigned_by' => $assignment->assigned_by,
                'assigned_at' => $assignment->assigned_at->format('M d, Y'),
                'started_at' => $assignment->started_at?->format('M d, Y'),
                'completed_at' => $assignment->completed_at?->format('M d, Y'),
                'target_completion_date' => $assignment->target_completion_date?->format('M d, Y'),
                'days_in_path' => $assignment->days_in_path,
                'is_overdue' => $assignment->is_overdue,
                'last_activity_at' => $assignment->last_activity_at?->diffForHumans(),
            ];
        });

        // Get statistics
        $stats = [
            'total_assignments' => StudentLearningPath::count(),
            'active' => StudentLearningPath::where('status', 'active')->count(),
            'completed' => StudentLearningPath::where('status', 'completed')->count(),
            'paused' => StudentLearningPath::where('status', 'paused')->count(),
            'abandoned' => StudentLearningPath::where('status', 'abandoned')->count(),
            'average_progress' => round(StudentLearningPath::where('status', 'active')->avg('progress_percent'), 1),
            'overdue' => StudentLearningPath::whereNotNull('target_completion_date')
                ->where('target_completion_date', '<', now())
                ->where('status', '!=', 'completed')
                ->count(),
        ];

        // Get all paths for filter dropdown
        $paths = LearningPath::where('is_active', true)
            ->orderBy('title')
            ->get(['path_id', 'title']);

        return Inertia::render('Admin/StudentPath/Index', [
            'assignments' => $assignments,
            'stats' => $stats,
            'paths' => $paths,
            'filters' => $request->only([
                'search',
                'path_id',
                'status',
                'assigned_by',
                'progress_min',
                'progress_max',
                'overdue_only',
                'sort_by',
                'sort_order'
            ]),
            'statusOptions' => [
                'active' => 'Active',
                'completed' => 'Completed',
                'paused' => 'Paused',
                'abandoned' => 'Abandoned',
            ],
            'assignedByOptions' => [
                'manual' => 'Manual Assignment',
                'placement_test' => 'Placement Test',
                'auto_recommendation' => 'Auto Recommendation',
            ],
        ]);
    }

    /**
     * Show detailed view of a student's path assignment
     */
    public function show($studentPathId)
    {
        $assignment = StudentLearningPath::with([
            'student.user',
            'learningPath.lessons',
            'assignedByUser',
            'placementTestSubmission'
        ])->findOrFail($studentPathId);

        // Get progress details
        $progressDetails = $assignment->getProgressDetails();

        // Get lesson progress breakdown
        $lessonProgress = $assignment->learningPath->lessons->map(function ($lesson) use ($assignment) {
            $progress = \App\Models\LessonProgress::where('student_id', $assignment->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            $canAccess = $assignment->canAccessLesson($lesson->lesson_id);

            return [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
                'sequence_order' => $lesson->pivot->sequence_order,
                'is_required' => $lesson->pivot->is_required,
                'unlock_after_previous' => $lesson->pivot->unlock_after_previous,
                'status' => $progress?->status ?? 'not_started',
                'progress_percent' => $progress?->progress_percent ?? 0,
                'time_spent_minutes' => $progress?->time_spent_minutes ?? 0,
                'last_accessed_at' => $progress?->last_accessed_at?->format('M d, Y h:i A'),
                'can_access' => $canAccess,
                'is_locked' => !$canAccess,
            ];
        });

        // Get activity timeline
        $activityTimeline = $this->getActivityTimeline($assignment);

        return Inertia::render('Admin/StudentPath/Show', [
            'assignment' => [
                'student_path_id' => $assignment->student_path_id,
                'student' => [
                    'student_id' => $assignment->student->student_id,
                    'name' => $assignment->student->user->name,
                    'email' => $assignment->student->user->email,
                    'user_id' => $assignment->student->user_id,
                ],
                'path' => [
                    'path_id' => $assignment->learningPath->path_id,
                    'title' => $assignment->learningPath->title,
                    'description' => $assignment->learningPath->description,
                    'difficulty_level' => $assignment->learningPath->difficulty_level,
                    'total_lessons' => $assignment->learningPath->total_lessons,
                ],
                'status' => $assignment->status,
                'progress_percent' => $assignment->progress_percent,
                'is_primary' => $assignment->is_primary,
                'assigned_by' => $assignment->assigned_by,
                'assigned_by_user' => $assignment->assignedByUser?->name,
                'assigned_at' => $assignment->assigned_at->format('M d, Y h:i A'),
                'started_at' => $assignment->started_at?->format('M d, Y h:i A'),
                'completed_at' => $assignment->completed_at?->format('M d, Y h:i A'),
                'last_activity_at' => $assignment->last_activity_at?->format('M d, Y h:i A'),
                'target_completion_date' => $assignment->target_completion_date?->format('M d, Y'),
                'days_in_path' => $assignment->days_in_path,
                'active_days' => $assignment->active_days,
                'activity_rate' => $assignment->activity_rate,
                'is_overdue' => $assignment->is_overdue,
                'days_until_target' => $assignment->days_until_target,
                'recommendation_score' => $assignment->recommendation_score,
                'recommendation_reason' => $assignment->recommendation_reason,
                'student_notes' => $assignment->student_notes,
            ],
            'progressDetails' => $progressDetails,
            'lessonProgress' => $lessonProgress,
            'activityTimeline' => $activityTimeline,
        ]);
    }

    /**
     * Show form to assign a path to a student
     */
    public function create(Request $request)
    {
        // Get student if pre-selected
        $selectedStudent = null;
        if ($studentId = $request->input('student_id')) {
            $student = StudentProfile::with('user')->find($studentId);
            if ($student) {
                $selectedStudent = [
                    'student_id' => $student->student_id,
                    'name' => $student->user->name,
                    'email' => $student->user->email,
                ];
            }
        }

        // Get all students
        $students = StudentProfile::with('user')
            ->get()
            ->map(function ($student) {
                return [
                    'student_id' => $student->student_id,
                    'name' => $student->user->name,
                    'email' => $student->user->email,
                ];
            });

        // Get all active paths
        $paths = LearningPath::where('is_active', true)
            ->with('lessons')
            ->orderBy('title')
            ->get()
            ->map(function ($path) {
                return [
                    'path_id' => $path->path_id,
                    'title' => $path->title,
                    'description' => $path->description,
                    'difficulty_level' => $path->difficulty_level,
                    'total_lessons' => $path->total_lessons,
                    'estimated_duration_hours' => $path->estimated_duration_hours,
                ];
            });

        return Inertia::render('Admin/StudentPath/Create', [
            'students' => $students,
            'paths' => $paths,
            'selectedStudent' => $selectedStudent,
        ]);
    }

    /**
     * Store a new path assignment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:student_profiles,student_id',
            'path_id' => 'required|exists:learning_paths,path_id',
            'is_primary' => 'boolean',
            'target_completion_date' => 'nullable|date|after:today',
            'student_notes' => 'nullable|string|max:1000',
        ]);

        // Check if student already has this path
        $existing = StudentLearningPath::where('student_id', $validated['student_id'])
            ->where('path_id', $validated['path_id'])
            ->whereIn('status', ['active', 'paused'])
            ->first();

        if ($existing) {
            return back()->withErrors([
                'path_id' => 'This student already has an active assignment for this learning path.'
            ])->setStatusCode(303);
        }

        DB::beginTransaction();
        try {
            // Create assignment
            $assignment = StudentLearningPath::create([
                'student_id' => $validated['student_id'],
                'path_id' => $validated['path_id'],
                'assigned_by' => 'manual',
                'assigned_at' => now(),
                'assigned_by_user_id' => Auth::user()->user_Id,
                'status' => 'active',
                'progress_percent' => 0,
                'is_primary' => $request->boolean('is_primary', false),
                'target_completion_date' => $validated['target_completion_date'] ?? null,
                'student_notes' => $validated['student_notes'] ?? null,
            ]);

            // Set as primary if requested
            if ($request->boolean('is_primary')) {
                $assignment->setAsPrimary();
            }

            DB::commit();

            return redirect()
                ->route('admin.student-paths.show', $assignment->student_path_id)
                ->with('success', 'Learning path assigned successfully!')
                ->setStatusCode(303);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withErrors(['error' => 'Failed to assign path: ' . $e->getMessage()])
                ->withInput()
                ->setStatusCode(303);
        }
    }

    /**
     * Show form to edit assignment settings
     */
    public function edit($studentPathId)
    {
        $assignment = StudentLearningPath::with(['student.user', 'learningPath'])
            ->findOrFail($studentPathId);

        return Inertia::render('Admin/StudentPath/Edit', [
            'assignment' => [
                'student_path_id' => $assignment->student_path_id,
                'student' => [
                    'student_id' => $assignment->student->student_id,
                    'name' => $assignment->student->user->name,
                ],
                'path' => [
                    'path_id' => $assignment->learningPath->path_id,
                    'title' => $assignment->learningPath->title,
                ],
                'status' => $assignment->status,
                'is_primary' => $assignment->is_primary,
                'target_completion_date' => $assignment->target_completion_date?->format('Y-m-d'),
                'student_notes' => $assignment->student_notes,
            ],
            'statusOptions' => [
                'active' => 'Active',
                'paused' => 'Paused',
                'completed' => 'Completed',
                'abandoned' => 'Abandoned',
            ],
        ]);
    }

    /**
     * Update assignment settings - ✅ 添加 303 状态码
     */
    public function update(Request $request, $studentPathId)
    {
        $assignment = StudentLearningPath::findOrFail($studentPathId);

        $validated = $request->validate([
            'status' => 'required|in:active,paused,completed,abandoned',
            'is_primary' => 'boolean',
            'target_completion_date' => 'nullable|date',
            'student_notes' => 'nullable|string|max:1000',
        ]);

        try {
            $assignment->update([
                'status' => $validated['status'],
                'is_primary' => $request->boolean('is_primary'),
                'target_completion_date' => $validated['target_completion_date'] ?? null,
                'student_notes' => $validated['student_notes'] ?? null,
            ]);

            // Set as primary if requested
            if ($request->boolean('is_primary') && !$assignment->is_primary) {
                $assignment->setAsPrimary();
            }

            // Update completion date if status changed to completed
            if ($validated['status'] === 'completed' && !$assignment->completed_at) {
                $assignment->update(['completed_at' => now()]);
            }

            return redirect()
                ->route('admin.student-paths.show', $assignment->student_path_id)
                ->with('success', 'Assignment updated successfully!')
                ->setStatusCode(303);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to update assignment: ' . $e->getMessage()])
                ->withInput()
                ->setStatusCode(303);
        }
    }

    /**
     * Pause a path assignment - ✅ 添加 303 状态码
     */
    public function pause(Request $request, $studentPathId)
    {
        $assignment = StudentLearningPath::findOrFail($studentPathId);

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            $assignment->pause($request->input('reason'));

            return back()
                ->with('success', 'Learning path paused successfully!')
                ->setStatusCode(303);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to pause path: ' . $e->getMessage()])
                ->setStatusCode(303);
        }
    }

    /**
     * Resume a paused path assignment - ✅ 添加 303 状态码
     */
    public function resume($studentPathId)
    {
        $assignment = StudentLearningPath::findOrFail($studentPathId);

        if ($assignment->status !== 'paused') {
            return back()
                ->withErrors(['error' => 'Only paused paths can be resumed.'])
                ->setStatusCode(303);
        }

        try {
            $assignment->resume();

            return back()
                ->with('success', 'Learning path resumed successfully!')
                ->setStatusCode(303);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to resume path: ' . $e->getMessage()])
                ->setStatusCode(303);
        }
    }

    /**
     * Manually update progress for a student - ✅ 添加 303 状态码
     */
    public function updateProgress($studentPathId)
    {
        $assignment = StudentLearningPath::findOrFail($studentPathId);

        try {
            $assignment->updateProgress();

            return back()
                ->with('success', 'Progress updated successfully!')
                ->setStatusCode(303);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to update progress: ' . $e->getMessage()])
                ->setStatusCode(303);
        }
    }

    /**
     * Delete (soft delete) a path assignment - ✅ 添加 303 状态码
     */
    public function destroy($studentPathId)
    {
        $assignment = StudentLearningPath::findOrFail($studentPathId);

        // Warn if student has made progress
        if ($assignment->progress_percent > 0) {
            return back()->withErrors([
                'error' => 'This student has already made progress. Consider pausing or abandoning instead.'
            ])->setStatusCode(303);
        }

        try {
            $assignment->delete();

            return redirect()
                ->route('admin.student-paths.index')
                ->with('success', 'Path assignment deleted successfully.')
                ->setStatusCode(303);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to delete assignment: ' . $e->getMessage()])
                ->setStatusCode(303);
        }
    }

    /**
     * Bulk assign paths to multiple students - ✅ 添加 303 状态码
     */
    public function bulkAssign(Request $request)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'required|exists:student_profiles,student_id',
            'path_id' => 'required|exists:learning_paths,path_id',
            'target_completion_date' => 'nullable|date|after:today',
        ]);

        DB::beginTransaction();
        try {
            $assigned = 0;
            $skipped = 0;

            foreach ($validated['student_ids'] as $studentId) {
                // Check if already assigned
                $existing = StudentLearningPath::where('student_id', $studentId)
                    ->where('path_id', $validated['path_id'])
                    ->whereIn('status', ['active', 'paused'])
                    ->exists();

                if ($existing) {
                    $skipped++;
                    continue;
                }

                StudentLearningPath::create([
                    'student_id' => $studentId,
                    'path_id' => $validated['path_id'],
                    'assigned_by' => 'manual',
                    'assigned_at' => now(),
                    'assigned_by_user_id' => Auth::user()->user_Id,
                    'status' => 'active',
                    'progress_percent' => 0,
                    'target_completion_date' => $validated['target_completion_date'],
                ]);

                $assigned++;
            }

            DB::commit();

            $message = "Successfully assigned path to {$assigned} student(s).";
            if ($skipped > 0) {
                $message .= " Skipped {$skipped} student(s) with existing assignments.";
            }

            return redirect()
                ->route('admin.student-paths.index')
                ->with('success', $message)
                ->setStatusCode(303);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withErrors(['error' => 'Bulk assignment failed: ' . $e->getMessage()])
                ->setStatusCode(303);
        }
    }

    /**
     * Get analytics for all student paths
     */
    public function analytics()
    {
        // Overall statistics
        $totalAssignments = StudentLearningPath::count();
        $activeAssignments = StudentLearningPath::where('status', 'active')->count();

        // Progress distribution
        $progressDistribution = StudentLearningPath::where('status', 'active')
            ->selectRaw('
                CASE
                    WHEN progress_percent = 0 THEN "Not Started"
                    WHEN progress_percent <= 25 THEN "1-25%"
                    WHEN progress_percent <= 50 THEN "26-50%"
                    WHEN progress_percent <= 75 THEN "51-75%"
                    WHEN progress_percent < 100 THEN "76-99%"
                    ELSE "Completed"
                END as range,
                COUNT(*) as count
            ')
            ->groupBy('range')
            ->get()
            ->pluck('count', 'range');

        // Average completion time by path
        $avgCompletionByPath = LearningPath::withCount([
            'completedStudents' => function ($query) {
                $query->whereNotNull('completed_at');
            }
        ])
            ->with(['completedStudents' => function ($query) {
                $query->whereNotNull('started_at')
                    ->whereNotNull('completed_at');
            }])
            ->where('is_active', true)
            ->get()
            ->map(function ($path) {
                $completedPaths = $path->completedStudents;

                if ($completedPaths->isEmpty()) {
                    return null;
                }

                $avgDays = $completedPaths->avg(function ($sp) {
                    return $sp->started_at->diffInDays($sp->completed_at);
                });

                return [
                    'path_id' => $path->path_id,
                    'title' => $path->title,
                    'completed_count' => $completedPaths->count(),
                    'avg_completion_days' => round($avgDays, 1),
                ];
            })
            ->filter();

        // Monthly assignment trends
        $monthlyTrends = StudentLearningPath::selectRaw('
                DATE_FORMAT(assigned_at, "%Y-%m") as month,
                COUNT(*) as total,
                SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed
            ')
            ->where('assigned_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return Inertia::render('Admin/StudentPath/Analytics', [
            'stats' => [
                'total_assignments' => $totalAssignments,
                'active_assignments' => $activeAssignments,
                'completion_rate' => $totalAssignments > 0
                    ? round((StudentLearningPath::where('status', 'completed')->count() / $totalAssignments) * 100, 1)
                    : 0,
            ],
            'progressDistribution' => $progressDistribution,
            'avgCompletionByPath' => $avgCompletionByPath,
            'monthlyTrends' => $monthlyTrends,
        ]);
    }

    /**
     * Get activity timeline for a student path
     */
    private function getActivityTimeline($assignment)
    {
        $events = [];

        // Assignment
        $events[] = [
            'type' => 'assigned',
            'date' => $assignment->assigned_at,
            'description' => 'Path assigned' . ($assignment->assigned_by === 'manual' ? ' by admin' : ' automatically'),
        ];

        // Started
        if ($assignment->started_at) {
            $events[] = [
                'type' => 'started',
                'date' => $assignment->started_at,
                'description' => 'Student started the path',
            ];
        }

        // Lesson completions
        $lessonCompletions = \App\Models\LessonProgress::where('student_id', $assignment->student_id)
            ->whereIn('lesson_id', $assignment->learningPath->lessons->pluck('lesson_id'))
            ->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->with('lesson')
            ->get();

        foreach ($lessonCompletions as $completion) {
            $events[] = [
                'type' => 'lesson_completed',
                'date' => $completion->completed_at,
                'description' => 'Completed lesson: ' . $completion->lesson->title,
            ];
        }

        // Completed
        if ($assignment->completed_at) {
            $events[] = [
                'type' => 'completed',
                'date' => $assignment->completed_at,
                'description' => 'Path completed',
            ];
        }

        // Sort by date descending
        usort($events, function ($a, $b) {
            return $b['date'] <=> $a['date'];
        });

        // Format dates
        return array_map(function ($event) {
            $event['date'] = $event['date']->format('M d, Y h:i A');
            $event['relative_time'] = $event['date'];
            return $event;
        }, array_slice($events, 0, 20)); // Limit to 20 most recent
    }
}
