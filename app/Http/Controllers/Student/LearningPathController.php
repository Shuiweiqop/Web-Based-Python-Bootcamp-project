<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use App\Models\StudentLearningPath;
use App\Models\LessonProgress;
use App\Services\PathProgressService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LearningPathController extends Controller
{
    protected $pathProgressService;

    public function __construct(PathProgressService $pathProgressService)
    {
        $this->middleware(['auth']);
        $this->pathProgressService = $pathProgressService;
    }

    /**
     * Display student's learning paths (Index page)
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return redirect()->route('dashboard')
                ->with('error', 'Only students can access learning paths.');
        }

        $student = $user->studentProfile;

        if (!$student) {
            return redirect()->route('dashboard')
                ->with('error', 'Student profile not found.');
        }

        // Get all student's learning paths
        $studentPaths = $student->learningPaths()
            ->with('learningPath')
            ->orderByDesc('is_primary')
            ->orderByDesc('last_activity_at')
            ->get()
            ->map(function ($studentPath) {
                $path = $studentPath->learningPath;

                return [
                    'student_path_id' => $studentPath->student_path_id,
                    'path_id' => $path->path_id,
                    'title' => $path->title,
                    'description' => $path->description,
                    'difficulty_level' => $path->difficulty_level,
                    'icon' => $path->icon,
                    'color' => $path->color,
                    'status' => $studentPath->status,
                    'progress_percent' => $studentPath->progress_percent,
                    'is_primary' => $studentPath->is_primary,
                    'started_at' => $studentPath->started_at?->format('M d, Y'),
                    'completed_at' => $studentPath->completed_at?->format('M d, Y'),
                    'last_activity_at' => $studentPath->last_activity_at?->diffForHumans(),
                    'total_lessons' => $path->total_lessons,
                    'days_in_path' => $studentPath->days_in_path,
                    'is_overdue' => $studentPath->is_overdue,
                ];
            });

        // Get primary path details if exists
        $primaryPath = $student->getPrimaryPath();
        $primaryPathDetails = null;

        if ($primaryPath) {
            $nextLesson = $primaryPath->getNextLesson();

            $primaryPathDetails = [
                'student_path_id' => $primaryPath->student_path_id,
                'path_id' => $primaryPath->path_id,
                'title' => $primaryPath->learningPath->title,
                'progress_percent' => $primaryPath->progress_percent,
                'next_lesson' => $nextLesson ? [
                    'lesson_id' => $nextLesson->lesson_id,
                    'title' => $nextLesson->title,
                    'difficulty' => $nextLesson->difficulty,
                ] : null,
            ];
        }

        return Inertia::render('Student/LearningPath/Index', [
            'studentPaths' => $studentPaths,
            'primaryPath' => $primaryPathDetails,
            'hasActivePath' => $student->hasActiveLearningPath(),
        ]);
    }

    /**
     * Show specific learning path details
     * 🔥 使用 student_path_id 参数
     */
    public function show($studentPathId)
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return redirect()->route('dashboard')
                ->with('error', 'Unauthorized access.');
        }

        $student = $user->studentProfile;

        if (!$student) {
            return redirect()->route('dashboard')
                ->with('error', 'Student profile not found.');
        }

        // 🔥 根据 student_path_id 获取学习路径
        $studentPath = StudentLearningPath::with([
            'learningPath.lessons' => function ($query) {
                $query->orderBy('learning_path_lessons.sequence_order');
            }
        ])
            ->where('student_path_id', $studentPathId)
            ->where('student_id', $student->student_id)
            ->firstOrFail();

        // 🔥 重新计算进度
        try {
            $studentPath->updateProgress();
            $studentPath->refresh();
        } catch (\Exception $e) {
            Log::error('Failed to update progress', [
                'error' => $e->getMessage(),
                'student_path_id' => $studentPathId,
            ]);
        }

        // 🔥 获取进度详情
        $progressDetails = $studentPath->getProgressDetails();

        // 🔥 获取下一课程
        $nextLesson = $studentPath->getNextLesson();

        // 🔥 格式化课程列表
        $lessons = $studentPath->learningPath->lessons->map(function ($lesson) use ($student, $studentPath) {
            $progress = LessonProgress::where('student_id', $student->student_id)
                ->where('lesson_id', $lesson->lesson_id)
                ->first();

            return [
                'lesson_id' => $lesson->lesson_id,
                'title' => $lesson->title,
                'sequence_order' => $lesson->pivot->sequence_order,
                'status' => $progress ? $progress->status : 'not_started',
                'progress_percent' => $progress ? $progress->progress_percent : 0,
                'is_locked' => !$studentPath->canAccessLesson($lesson->lesson_id),
                'estimated_duration_minutes' => $lesson->estimated_duration_minutes,
                'completed_at' => $progress && $progress->completed_at
                    ? $progress->completed_at->format('M d, Y')
                    : null,
            ];
        });

        // 🔥 格式化 studentPath 数据
        $formattedStudentPath = [
            'student_path_id' => $studentPath->student_path_id,
            'path_id' => $studentPath->path_id,
            'title' => $studentPath->learningPath->title,
            'description' => $studentPath->learningPath->description,
            'icon' => $studentPath->learningPath->icon,
            'difficulty_level' => $studentPath->learningPath->difficulty_level,
            'status' => $studentPath->status,
            'progress_percent' => $studentPath->progress_percent ?? 0,
            'is_primary' => (bool) $studentPath->is_primary,
            'started_at' => $studentPath->started_at
                ? $studentPath->started_at->format('M d, Y')
                : null,
            'completed_at' => $studentPath->completed_at
                ? $studentPath->completed_at->format('M d, Y')
                : null,
            'target_completion_date' => $studentPath->target_completion_date
                ? $studentPath->target_completion_date->format('M d, Y')
                : null,
            'estimated_duration_hours' => $studentPath->learningPath->estimated_duration_hours ?? 0,
            'days_in_path' => $studentPath->days_in_path ?? 0,
            'activity_rate' => $studentPath->activity_rate ?? 0,
            'is_overdue' => $studentPath->is_overdue ?? false,
            'student_notes' => $studentPath->student_notes,
            'next_lesson' => $nextLesson ? [
                'lesson_id' => $nextLesson->lesson_id,
                'title' => $nextLesson->title,
            ] : null,
        ];

        // 🔥 返回匹配React组件的数据结构
        return Inertia::render('Student/LearningPath/Show', [
            'studentPath' => $formattedStudentPath,
            'progressDetails' => $progressDetails,
            'lessons' => $lessons,
            'stats' => [
                'total_lessons' => $progressDetails['total_lessons'],
                'completed' => $progressDetails['completed'],
                'in_progress' => $progressDetails['in_progress'],
                'not_started' => $progressDetails['not_started'],
            ],
        ]);
    }

    /**
     * Browse all available learning paths
     */
    public function browse()
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return redirect()->route('dashboard')
                ->with('error', 'Only students can browse learning paths.');
        }

        $student = $user->studentProfile;

        // Get all active learning paths
        $allPaths = LearningPath::active()
            ->with(['lessons'])
            ->ordered()
            ->get()
            ->map(function ($path) use ($student) {
                // Check if student is already enrolled
                $isEnrolled = StudentLearningPath::where('student_id', $student->student_id)
                    ->where('path_id', $path->path_id)
                    ->whereIn('status', ['active', 'paused'])
                    ->exists();

                return [
                    'path_id' => $path->path_id,
                    'title' => $path->title,
                    'description' => $path->description,
                    'learning_outcomes' => $path->learning_outcomes,
                    'prerequisites' => $path->prerequisites,
                    'difficulty_level' => $path->difficulty_level,
                    'estimated_duration_hours' => $path->estimated_duration_hours,
                    'total_lessons' => $path->total_lessons,
                    'icon' => $path->icon,
                    'color' => $path->color,
                    'is_featured' => $path->is_featured,
                    'is_enrolled' => $isEnrolled,
                    'enrollment_count' => $path->enrollment_count,
                ];
            });

        return Inertia::render('Student/LearningPath/Browse', [
            'paths' => $allPaths,
            'hasActivePath' => $student->hasActiveLearningPath(),
        ]);
    }

    /**
     * Pause a learning path
     */
    public function pause($studentPathId)
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return back()->with('error', 'Unauthorized access.');
        }

        $student = $user->studentProfile;

        $studentPath = StudentLearningPath::where('student_path_id', $studentPathId)
            ->where('student_id', $student->student_id)
            ->firstOrFail();

        $studentPath->pause('Paused by student');

        return back()->with('success', 'Learning path paused.');
    }

    /**
     * Resume a learning path
     */
    public function resume($studentPathId)
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return back()->with('error', 'Unauthorized access.');
        }

        $student = $user->studentProfile;

        $studentPath = StudentLearningPath::where('student_path_id', $studentPathId)
            ->where('student_id', $student->student_id)
            ->firstOrFail();

        $studentPath->resume();

        return back()->with('success', 'Learning path resumed.');
    }

    /**
     * Set a learning path as primary
     */
    public function setAsPrimary($studentPathId)
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return back()->with('error', 'Unauthorized access.');
        }

        $student = $user->studentProfile;

        $studentPath = StudentLearningPath::where('student_path_id', $studentPathId)
            ->where('student_id', $student->student_id)
            ->firstOrFail();

        $studentPath->setAsPrimary();

        return back()->with('success', 'This learning path is now your primary path.');
    }

    /**
     * Show detailed progress for a learning path
     */
    public function progress($studentPathId)
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return redirect()->route('dashboard')
                ->with('error', 'Unauthorized access.');
        }

        $student = $user->studentProfile;

        // Get student's learning path
        $studentPath = StudentLearningPath::where('student_path_id', $studentPathId)
            ->where('student_id', $student->student_id)
            ->with('learningPath')
            ->firstOrFail();

        // Get detailed progress
        $detailedProgress = $this->pathProgressService->getDetailedProgress($studentPath);

        // Get all lessons in this path
        $lessons = $studentPath->learningPath->lessons;
        $lessonIds = $lessons->pluck('lesson_id');

        // Calculate stats
        $totalTimeSpentSeconds = \DB::table('test_submissions')
            ->join('tests', 'test_submissions.test_id', '=', 'tests.test_id')
            ->where('test_submissions.student_id', $student->student_id)
            ->whereIn('tests.lesson_id', $lessonIds)
            ->whereIn('test_submissions.status', ['submitted', 'timeout'])
            ->sum('test_submissions.time_spent');

        $testScores = \DB::table('test_submissions')
            ->join('tests', 'test_submissions.test_id', '=', 'tests.test_id')
            ->where('test_submissions.student_id', $student->student_id)
            ->whereIn('tests.lesson_id', $lessonIds)
            ->whereIn('test_submissions.status', ['submitted', 'timeout'])
            ->pluck('test_submissions.score');

        $averageScore = $testScores->count() > 0 ? round($testScores->avg(), 1) : null;

        $daysInPath = $studentPath->days_in_path;
        $completedLessons = \DB::table('lesson_progress')
            ->where('student_id', $student->student_id)
            ->whereIn('lesson_id', $lessonIds)
            ->where('status', 'completed')
            ->count();

        $weeksInPath = max(1, ceil($daysInPath / 7));
        $lessonsPerWeek = $daysInPath > 0 ? round($completedLessons / $weeksInPath, 1) : 0;

        $stats = [
            'total_time_spent' => $totalTimeSpentSeconds > 0 ? round($totalTimeSpentSeconds / 3600, 1) : 0,
            'average_score' => $averageScore,
            'completion_rate' => $studentPath->progress_percent,
            'lessons_per_week' => $lessonsPerWeek,
        ];

        $recentActivity = $student->lessonProgress()
            ->whereHas('lesson.learningPaths', function ($query) use ($studentPath) {
                $query->where('learning_paths.path_id', $studentPath->path_id);
            })
            ->whereNotNull('last_updated_at')
            ->orderBy('last_updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($progress) {
                return [
                    'lesson_title' => $progress->lesson->title ?? 'Unknown Lesson',
                    'status' => $progress->status,
                    'progress_percent' => $progress->progress_percent,
                    'updated_at' => $progress->last_updated_at->diffForHumans(),
                ];
            });

        return Inertia::render('Student/LearningPath/Progress', [
            'studentPath' => [
                'student_path_id' => $studentPath->student_path_id,
                'title' => $studentPath->learningPath->title,
                'difficulty_level' => $studentPath->learningPath->difficulty_level,
                'progress_percent' => $studentPath->progress_percent,
                'status' => $studentPath->status,
                'started_at' => $studentPath->started_at?->format('M d, Y'),
                'days_in_path' => $studentPath->days_in_path,
                'active_days' => $studentPath->active_days,
                'activity_rate' => $studentPath->activity_rate,
            ],
            'detailedProgress' => $detailedProgress,
            'stats' => $stats,
            'recentActivity' => $recentActivity,
        ]);
    }

    /**
     * Enroll in a learning path (self-enrollment)
     */
    public function enroll(Request $request, $pathId)
    {
        $user = Auth::user();

        if ($user->role !== 'student') {
            return back()->with('error', 'Only students can enroll in learning paths.');
        }

        $student = $user->studentProfile;
        $path = LearningPath::findOrFail($pathId);

        // Check if already enrolled
        $existing = StudentLearningPath::where('student_id', $student->student_id)
            ->where('path_id', $pathId)
            ->whereIn('status', ['active', 'paused'])
            ->first();

        if ($existing) {
            return redirect()->route('student.paths.show', $existing->student_path_id)
                ->with('info', 'You are already enrolled in this path.');
        }

        // Enroll student
        $studentPath = $student->assignLearningPath(
            $pathId,
            'self',
            [
                'is_primary' => !$student->hasActiveLearningPath(),
            ]
        );

        return redirect()->route('student.paths.show', $studentPath->student_path_id)
            ->with('success', "Successfully enrolled in {$path->title}!");
    }
}
