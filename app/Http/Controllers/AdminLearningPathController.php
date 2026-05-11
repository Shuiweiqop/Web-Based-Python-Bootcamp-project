<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\StudentLearningPath;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminLearningPathController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:administrator']);
    }

    /**
     * Display a listing of learning paths
     */
    public function index(Request $request)
    {
        $query = LearningPath::query()->withTrashed();

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by difficulty
        if ($difficulty = $request->input('difficulty')) {
            $query->where('difficulty_level', $difficulty);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sort
        $sortBy = $request->input('sort_by', 'display_order');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $paths = $query->paginate(15)->withQueryString();

        // Transform data for frontend
        $paths->getCollection()->transform(function ($path) {
            return [
                'path_id' => $path->path_id,
                'title' => $path->title,
                'description' => $path->description,
                'difficulty_level' => $path->difficulty_level,
                'min_score_required' => $path->min_score_required,
                'max_score_required' => $path->max_score_required,
                'estimated_duration_hours' => $path->estimated_duration_hours,
                'total_lessons' => $path->total_lessons,
                'is_active' => $path->is_active,
                'is_featured' => $path->is_featured,
                'display_order' => $path->display_order,
                'enrollment_count' => $path->enrollment_count,
                'completion_rate' => $path->completion_rate,
                'color' => $path->color,
                'created_at' => $path->created_at->format('M d, Y'),
                'deleted_at' => $path->deleted_at?->format('M d, Y'),
            ];
        });

        // Get statistics
        $stats = [
            'total_paths' => LearningPath::count(),
            'active_paths' => LearningPath::where('is_active', true)->count(),
            'total_enrollments' => StudentLearningPath::count(),
            'active_enrollments' => StudentLearningPath::where('status', 'active')->count(),
        ];

        return Inertia::render('Admin/LearningPath/Index', [
            'paths' => $paths,
            'stats' => $stats,
            'filters' => $request->only(['search', 'difficulty', 'is_active', 'sort_by', 'sort_order']),
            'difficultyOptions' => [
                'beginner' => 'Beginner',
                'intermediate' => 'Intermediate',
                'advanced' => 'Advanced',
            ],
        ]);
    }

    /**
     * Show the form for creating a new learning path
     */
    public function create()
    {
        // Get all active lessons for selection
        $lessons = Lesson::where('status', 'active')
            ->orderBy('title')
            ->get()
            ->map(function ($lesson) {
                return [
                    'lesson_id' => $lesson->lesson_id,
                    'title' => $lesson->title,
                    'difficulty' => $lesson->difficulty,
                    'estimated_duration' => $lesson->estimated_duration,
                ];
            });

        return Inertia::render('Admin/LearningPath/Create', [
            'lessons' => $lessons,
            'difficultyOptions' => [
                'beginner' => 'Beginner',
                'intermediate' => 'Intermediate',
                'advanced' => 'Advanced',
            ],
        ]);
    }

    /**
     * Store a newly created learning path
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'learning_outcomes' => 'nullable|string|max:2000',
            'prerequisites' => 'nullable|string|max:1000',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
            'estimated_duration_hours' => 'nullable|integer|min:1|max:1000',
            'min_score_required' => 'required|integer|min:0|max:100',
            'max_score_required' => 'required|integer|min:0|max:100',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'banner_image' => 'nullable|url|max:500',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
        ]);

        // Validate score range
        if ($validated['min_score_required'] > $validated['max_score_required']) {
            return back()->withErrors([
                'min_score_required' => 'Minimum score must be less than or equal to maximum score.',
            ]);
        }

        DB::beginTransaction();
        try {
            // Create the path
            $path = LearningPath::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'learning_outcomes' => $validated['learning_outcomes'],
                'prerequisites' => $validated['prerequisites'],
                'difficulty_level' => $validated['difficulty_level'],
                'estimated_duration_hours' => $validated['estimated_duration_hours'],
                'min_score_required' => $validated['min_score_required'],
                'max_score_required' => $validated['max_score_required'],
                'icon' => $validated['icon'] ?? 'book',
                'color' => $validated['color'] ?? '#3B82F6',
                'banner_image' => $validated['banner_image'] ?? null,
                'is_active' => $request->boolean('is_active', false),
                'is_featured' => $request->boolean('is_featured', false),
                'display_order' => $validated['display_order'] ?? (LearningPath::max('display_order') ?? 0) + 1,
                'created_by' => Auth::user()->user_Id,
            ]);

            DB::commit();

            return redirect()->route('admin.learning-paths.show', $path->path_id)
                ->with('success', 'Learning path created successfully! Now add lessons to complete the path.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create learning path: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified learning path
     */
    public function show($pathId)
    {
        $path = LearningPath::withTrashed()->findOrFail($pathId);

        // Get path with lessons
        $path->load(['lessons', 'studentPaths.student.user']);

        // Get completion statistics
        $completionStats = $path->getCompletionStats();

        // Get lessons with their pivot data
        $lessons = $path->lessons->map(function ($lesson) {
            return [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
                'difficulty' => $lesson->difficulty,
                'estimated_duration' => $lesson->estimated_duration,
                'sequence_order' => $lesson->pivot->sequence_order,
                'is_required' => $lesson->pivot->is_required,
                'unlock_after_previous' => $lesson->pivot->unlock_after_previous,
                'estimated_duration_minutes' => $lesson->pivot->estimated_duration_minutes,
                'path_specific_notes' => $lesson->pivot->path_specific_notes,
            ];
        });

        // Get recent enrollments
        $recentEnrollments = $path->studentPaths()
            ->with(['student.user'])
            ->latest('assigned_at')
            ->limit(10)
            ->get()
            ->map(function ($studentPath) {
                return [
                    'student_path_id' => $studentPath->student_path_id,
                    'student_name' => $studentPath->student->user->name,
                    'student_email' => $studentPath->student->user->email,
                    'status' => $studentPath->status,
                    'progress_percent' => $studentPath->progress_percent,
                    'assigned_at' => $studentPath->assigned_at->format('M d, Y'),
                    'assigned_by' => $studentPath->assigned_by,
                ];
            });

        return Inertia::render('Admin/LearningPath/Show', [
            'path' => [
                'path_id' => $path->path_id,
                'title' => $path->title,
                'description' => $path->description,
                'learning_outcomes' => $path->learning_outcomes,
                'prerequisites' => $path->prerequisites,
                'difficulty_level' => $path->difficulty_level,
                'estimated_duration_hours' => $path->estimated_duration_hours,
                'min_score_required' => $path->min_score_required,
                'max_score_required' => $path->max_score_required,
                'icon' => $path->icon,
                'color' => $path->color,
                'banner_image' => $path->banner_image,
                'is_active' => $path->is_active,
                'is_featured' => $path->is_featured,
                'display_order' => $path->display_order,
                'total_lessons' => $path->total_lessons,
                'created_at' => $path->created_at->format('M d, Y h:i A'),
                'updated_at' => $path->updated_at->format('M d, Y h:i A'),
                'deleted_at' => $path->deleted_at?->format('M d, Y h:i A'),
            ],
            'lessons' => $lessons,
            'completionStats' => $completionStats,
            'recentEnrollments' => $recentEnrollments,
        ]);
    }

    /**
     * Show the form for editing the specified learning path
     */
    public function edit($pathId)
    {
        $path = LearningPath::withTrashed()->findOrFail($pathId);

        return Inertia::render('Admin/LearningPath/Edit', [
            'path' => [
                'path_id' => $path->path_id,
                'title' => $path->title,
                'description' => $path->description,
                'learning_outcomes' => $path->learning_outcomes,
                'prerequisites' => $path->prerequisites,
                'difficulty_level' => $path->difficulty_level,
                'estimated_duration_hours' => $path->estimated_duration_hours,
                'min_score_required' => $path->min_score_required,
                'max_score_required' => $path->max_score_required,
                'icon' => $path->icon,
                'color' => $path->color,
                'banner_image' => $path->banner_image,
                'is_active' => $path->is_active,
                'is_featured' => $path->is_featured,
                'display_order' => $path->display_order,
            ],
            'difficultyOptions' => [
                'beginner' => 'Beginner',
                'intermediate' => 'Intermediate',
                'advanced' => 'Advanced',
            ],
        ]);
    }

    /**
     * Update the specified learning path
     */
    public function update(Request $request, $pathId)
    {
        $path = LearningPath::withTrashed()->findOrFail($pathId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'learning_outcomes' => 'nullable|string|max:2000',
            'prerequisites' => 'nullable|string|max:1000',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
            'estimated_duration_hours' => 'nullable|integer|min:1|max:1000',
            'min_score_required' => 'required|integer|min:0|max:100',
            'max_score_required' => 'required|integer|min:0|max:100',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'banner_image' => 'nullable|url|max:500',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
        ]);

        // Validate score range
        if ($validated['min_score_required'] > $validated['max_score_required']) {
            return back()->withErrors([
                'min_score_required' => 'Minimum score must be less than or equal to maximum score.',
            ]);
        }

        try {
            $path->update([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'learning_outcomes' => $validated['learning_outcomes'] ?? null,
                'prerequisites' => $validated['prerequisites'] ?? null,
                'difficulty_level' => $validated['difficulty_level'],
                'estimated_duration_hours' => $validated['estimated_duration_hours'] ?? null,
                'min_score_required' => $validated['min_score_required'],
                'max_score_required' => $validated['max_score_required'],
                'icon' => $validated['icon'] ?? $path->icon,
                'color' => $validated['color'] ?? $path->color,
                'banner_image' => $validated['banner_image'] ?? $path->banner_image,
                'is_active' => $request->boolean('is_active'),
                'is_featured' => $request->boolean('is_featured'),
                'display_order' => $validated['display_order'] ?? $path->display_order,
                'updated_by' => Auth::user()->user_Id,
            ]);

            return redirect()->route('admin.learning-paths.show', $path->path_id)
                ->with('success', 'Learning path updated successfully!')
                ->setStatusCode(303);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update learning path: ' . $e->getMessage()])
                ->withInput()
                ->setStatusCode(303);
        }
    }

    /**
     * Remove the specified learning path (soft delete)
     */
    public function destroy($pathId)
    {
        $path = LearningPath::findOrFail($pathId);

        // Check if there are active enrollments
        $activeEnrollments = $path->studentPaths()->where('status', 'active')->count();

        if ($activeEnrollments > 0) {
            return back()->withErrors([
                'error' => "Cannot delete path with {$activeEnrollments} active student(s). Please set it as inactive instead."
            ])->setStatusCode(303);
        }

        try {
            $path->delete();

            return redirect()
                ->route('admin.learning-paths.index')
                ->with('success', 'Learning path deleted successfully.')
                ->setStatusCode(303);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to delete learning path: ' . $e->getMessage()])
                ->setStatusCode(303);
        }
    }

    /**
     * Restore a soft-deleted learning path
     */
    public function restore($pathId)
    {
        $path = LearningPath::withTrashed()->findOrFail($pathId);

        if (!$path->trashed()) {
            return back()->with('info', 'Learning path is not deleted.');
        }

        $path->restore();

        return redirect()->route('admin.learning-paths.show', $path->path_id)
            ->with('success', 'Learning path restored successfully!');
    }

    /**
     * Show form to manage lessons in a path
     */
    public function manageLessons($pathId)
    {
        $path = LearningPath::findOrFail($pathId);
        $path->load('lessons');

        // Get all available lessons not in this path
        $availableLessons = Lesson::where('status', 'active')
            ->whereNotIn('lesson_id', $path->lessons->pluck('lesson_id'))
            ->orderBy('title')
            ->get()
            ->map(function ($lesson) {
                return [
                    'lesson_id' => $lesson->lesson_id,
                    'title' => $lesson->title,
                    'difficulty' => $lesson->difficulty,
                    'estimated_duration' => $lesson->estimated_duration,
                ];
            });

        // Get current lessons in path
        $pathLessons = $path->lessons->map(function ($lesson) {
            return [
                'path_lesson_id' => $lesson->pivot->path_lesson_id,
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
                'difficulty' => $lesson->difficulty,
                'estimated_duration' => $lesson->estimated_duration,
                'sequence_order' => $lesson->pivot->sequence_order,
                'is_required' => $lesson->pivot->is_required,
                'unlock_after_previous' => $lesson->pivot->unlock_after_previous,
                'estimated_duration_minutes' => $lesson->pivot->estimated_duration_minutes,
                'path_specific_notes' => $lesson->pivot->path_specific_notes,
            ];
        });

        return Inertia::render('Admin/LearningPath/ManageLessons', [
            'path' => [
                'path_id' => $path->path_id,
                'title' => $path->title,
                'total_lessons' => $path->total_lessons,
            ],
            'pathLessons' => $pathLessons,
            'availableLessons' => $availableLessons,
        ]);
    }

    /**
     * Add a lesson to the learning path
     */
    public function addLesson(Request $request, $pathId)
    {
        $path = LearningPath::findOrFail($pathId);

        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,lesson_id',
            'is_required' => 'boolean',
            'unlock_after_previous' => 'boolean',
            'estimated_duration_minutes' => 'nullable|integer|min:1',
            'path_specific_notes' => 'nullable|string|max:500',
        ]);

        // ✅ 修复：明确指定表名，避免 SQL 歧义
        if ($path->lessons()->where('lessons.lesson_id', $validated['lesson_id'])->exists()) {
            return back()->withErrors(['lesson_id' => 'This lesson is already in the path.']);
        }

        try {
            $path->addLesson($validated['lesson_id'], [
                'is_required' => $request->boolean('is_required', true),
                'unlock_after_previous' => $request->boolean('unlock_after_previous', true),
                'estimated_duration_minutes' => $validated['estimated_duration_minutes'],
                'path_specific_notes' => $validated['path_specific_notes'],
            ]);

            return back()->with('success', 'Lesson added to path successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to add lesson: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove a lesson from the learning path
     */
    public function removeLesson($pathId, $lessonId)
    {
        $path = LearningPath::findOrFail($pathId);

        // Check if there are students who have completed this lesson
        $affectedStudents = StudentLearningPath::where('path_id', $pathId)
            ->whereHas('student.lessonProgress', function ($query) use ($lessonId) {
                $query->where('lesson_id', $lessonId)
                    ->where('status', 'completed');
            })
            ->count();

        if ($affectedStudents > 0) {
            return back()->withErrors([
                'error' => "Cannot remove lesson. {$affectedStudents} student(s) have already completed it."
            ])->setStatusCode(303);
        }

        try {
            $path->removeLesson($lessonId);

            return back()
                ->with('success', 'Lesson removed from path successfully!')
                ->setStatusCode(303);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to remove lesson: ' . $e->getMessage()])
                ->setStatusCode(303);
        }
    }

    /**
     * Reorder lessons in the path
     */
    public function reorderLessons(Request $request, $pathId)
    {
        $path = LearningPath::findOrFail($pathId);

        $validated = $request->validate([
            'lesson_ids' => 'required|array',
            'lesson_ids.*' => 'required|exists:lessons,lesson_id',
        ]);

        try {
            $path->updateLessonOrder($validated['lesson_ids']);

            // ✅ 返回 back() 而不是 JSON，这样 Inertia 才能正确处理
            return back()->with('success', 'Lessons reordered successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to reorder lessons: ' . $e->getMessage()]);
        }
    }

    /**
     * Update lesson settings in path
     */
    public function updateLessonSettings(Request $request, $pathId, $lessonId)
    {
        $path = LearningPath::findOrFail($pathId);

        $validated = $request->validate([
            'is_required' => 'boolean',
            'unlock_after_previous' => 'boolean',
            'estimated_duration_minutes' => 'nullable|integer|min:1',
            'path_specific_notes' => 'nullable|string|max:500',
        ]);

        try {
            $path->lessons()->updateExistingPivot($lessonId, [
                'is_required' => $request->boolean('is_required'),
                'unlock_after_previous' => $request->boolean('unlock_after_previous'),
                'estimated_duration_minutes' => $validated['estimated_duration_minutes'],
                'path_specific_notes' => $validated['path_specific_notes'],
            ]);

            return back()->with('success', 'Lesson settings updated successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update settings: ' . $e->getMessage()]);
        }
    }

    /**
     * Clone a learning path
     */
    public function clone($pathId)
    {
        $path = LearningPath::findOrFail($pathId);

        try {
            $newPath = $path->clonePath($path->title . ' (Copy)');

            return redirect()->route('admin.learning-paths.edit', $newPath->path_id)
                ->with('success', 'Learning path cloned successfully! You can now modify the copy.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to clone path: ' . $e->getMessage()]);
        }
    }

    /**
     * View path statistics and analytics
     */
    public function statistics($pathId)
    {
        $path = LearningPath::findOrFail($pathId);

        $completionStats = $path->getCompletionStats();

        // Get progress distribution
        $progressDistribution = StudentLearningPath::where('path_id', $pathId)
            ->selectRaw('
                CASE
                    WHEN progress_percent = 0 THEN "0%"
                    WHEN progress_percent <= 25 THEN "1-25%"
                    WHEN progress_percent <= 50 THEN "26-50%"
                    WHEN progress_percent <= 75 THEN "51-75%"
                    WHEN progress_percent < 100 THEN "76-99%"
                    ELSE "100%"
                END as range,
                COUNT(*) as count
            ')
            ->groupBy('range')
            ->get()
            ->pluck('count', 'range')
            ->toArray();

        return Inertia::render('Admin/LearningPath/Statistics', [
            'path' => [
                'path_id' => $path->path_id,
                'title' => $path->title,
                'difficulty_level' => $path->difficulty_level,
            ],
            'completionStats' => $completionStats,
            'progressDistribution' => $progressDistribution,
        ]);
    }
}
