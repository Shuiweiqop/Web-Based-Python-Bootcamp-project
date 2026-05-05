<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class AdminProgressController extends Controller
{
    /**
     * Display overall progress statistics
     */
    public function index(Request $request)
    {
        $query = LessonProgress::with(['student.user', 'lesson']);

        // Filter by lesson
        if ($request->filled('lesson_id')) {
            $query->where('lesson_id', $request->lesson_id);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by student
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Search by student name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $progress = $query->orderBy('last_updated_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Get comprehensive statistics
        $stats = [
            'total_progress_records' => LessonProgress::count(),
            'completed' => LessonProgress::where('status', 'completed')->count(),
            'in_progress' => LessonProgress::where('status', 'in_progress')->count(),
            'not_started' => LessonProgress::where('status', 'not_started')->count(),
            'average_progress' => round(LessonProgress::avg('progress_percent') ?? 0, 2),
            'total_students' => StudentProfile::count(),
            'active_students' => LessonProgress::where('last_updated_at', '>=', now()->subDays(7))
                ->distinct('student_id')
                ->count('student_id'),
            'total_lessons' => Lesson::where('status', 'active')->count(),
            'completed_lessons' => LessonProgress::where('status', 'completed')->count(),
            'total_tests' => \App\Models\Test::count(),
            'completed_tests' => LessonProgress::where('test_completed', true)->count(),
            'average_score' => round(LessonProgress::where('status', 'completed')->avg('progress_percent') ?? 0, 2),
            'completion_rate' => LessonProgress::count() > 0
                ? round((LessonProgress::where('status', 'completed')->count() / LessonProgress::count()) * 100, 2)
                : 0,
        ];

        // Get filter options - Lessons
        $lessons = Lesson::where('status', 'active')
            ->select('lesson_id', 'title')
            ->orderBy('title')
            ->get();

        // Get filter options - Students
        $students = StudentProfile::with('user:user_Id,name,email')
            ->select('student_id', 'user_Id')
            ->get()
            ->map(function ($student) {
                return [
                    'student_id' => $student->student_id,
                    'name' => $student->user->name ?? 'Unknown',
                    'email' => $student->user->email ?? '',
                ];
            });

        return Inertia::render('Admin/Progress/Index', [
            'progress' => $progress,
            'stats' => $stats,
            'lessons' => $lessons,
            'students' => $students,
            'filters' => $request->only(['lesson_id', 'status', 'student_id', 'search']),
        ]);
    }

    /**
     * Show progress for a specific lesson
     */
    public function showLesson(Lesson $lesson)
    {
        $progress = LessonProgress::with(['student.user'])
            ->where('lesson_id', $lesson->lesson_id)
            ->orderBy('progress_percent', 'desc')
            ->get();

        // Calculate lesson statistics
        $stats = [
            'total_students' => $progress->count(),
            'completed' => $progress->where('status', 'completed')->count(),
            'in_progress' => $progress->where('status', 'in_progress')->count(),
            'not_started' => $progress->where('status', 'not_started')->count(),
            'average_progress' => round($progress->avg('progress_percent') ?? 0, 2),
            'completion_rate' => $progress->count() > 0
                ? round(($progress->where('status', 'completed')->count() / $progress->count()) * 100, 2)
                : 0,
            'exercises_completed' => $progress->where('exercise_completed', true)->count(),
            'tests_completed' => $progress->where('test_completed', true)->count(),
        ];

        return Inertia::render('Admin/Progress/LessonProgress', [
            'lesson' => $lesson,
            'progress' => $progress,
            'stats' => $stats,
        ]);
    }

    /**
     * Show progress for a specific student
     */
    public function showStudent(StudentProfile $student)
    {
        $progress = LessonProgress::with('lesson')
            ->where('student_id', $student->student_id)
            ->orderBy('last_updated_at', 'desc')
            ->get();

        // Calculate student statistics
        $stats = [
            'total_lessons' => $progress->count(),
            'completed' => $progress->where('status', 'completed')->count(),
            'in_progress' => $progress->where('status', 'in_progress')->count(),
            'not_started' => $progress->where('status', 'not_started')->count(),
            'average_progress' => round($progress->avg('progress_percent') ?? 0, 2),
            'completion_rate' => $progress->count() > 0
                ? round(($progress->where('status', 'completed')->count() / $progress->count()) * 100, 2)
                : 0,
            'exercises_completed' => $progress->where('exercise_completed', true)->count(),
            'tests_completed' => $progress->where('test_completed', true)->count(),
            'total_points' => $student->total_points ?? 0,
            'current_level' => $student->current_level ?? 1,
        ];

        return Inertia::render('Admin/Progress/StudentProgress', [
            'student' => $student->load('user'),
            'progress' => $progress,
            'stats' => $stats,
        ]);
    }

    /**
     * Recalculate progress for a specific record
     */
    public function recalculate(LessonProgress $progress)
    {
        try {
            // Update completion flags based on current data
            $progress->updateCompletionFlags();

            // Calculate new progress percentage
            $calculatedProgress = $progress->calculateProgress();

            // Update the progress record
            $progress->updateProgress($calculatedProgress);

            return back()->with('success', 'Progress recalculated successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to recalculate progress: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to recalculate progress: ' . $e->getMessage()]);
        }
    }

    /**
     * Recalculate all progress for a lesson
     */
    public function recalculateLesson(Lesson $lesson)
    {
        try {
            $progressRecords = LessonProgress::where('lesson_id', $lesson->lesson_id)->get();
            $successCount = 0;
            $failCount = 0;

            foreach ($progressRecords as $progress) {
                try {
                    $progress->updateCompletionFlags();
                    $calculatedProgress = $progress->calculateProgress();
                    $progress->updateProgress($calculatedProgress);
                    $successCount++;
                } catch (\Exception $e) {
                    Log::error("Failed to recalculate progress for student {$progress->student_id}: " . $e->getMessage());
                    $failCount++;
                }
            }

            $message = "Recalculated progress for {$successCount} student(s)";
            if ($failCount > 0) {
                $message .= ". {$failCount} failed.";
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Failed to recalculate lesson progress: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to recalculate progress: ' . $e->getMessage()]);
        }
    }

    /**
     * Reset progress for a student
     */
    public function reset(LessonProgress $progress)
    {
        try {
            $progress->update([
                'status' => 'not_started',
                'progress_percent' => 0,
                'reward_granted' => false,
                'exercise_completed' => false,
                'test_completed' => false,
                'started_at' => null,
                'completed_at' => null,
                'last_updated_at' => now(),
            ]);

            return back()->with('success', 'Progress reset successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to reset progress: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to reset progress: ' . $e->getMessage()]);
        }
    }

    /**
     * Export progress report as CSV
     */
    public function export(Request $request)
    {
        try {
            $query = LessonProgress::with(['student.user', 'lesson']);

            // Apply same filters as index
            if ($request->filled('lesson_id')) {
                $query->where('lesson_id', $request->lesson_id);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('student_id')) {
                $query->where('student_id', $request->student_id);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('student.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $progress = $query->orderBy('last_updated_at', 'desc')->get();

            // Generate CSV filename with timestamp
            $filename = 'lesson_progress_' . now()->format('Y-m-d_His') . '.csv';

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0',
            ];

            $callback = function () use ($progress) {
                $file = fopen('php://output', 'w');

                // Write UTF-8 BOM for Excel compatibility
                fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

                // Header row
                fputcsv($file, [
                    'Progress ID',
                    'Student ID',
                    'Student Name',
                    'Student Email',
                    'Lesson ID',
                    'Lesson Title',
                    'Status',
                    'Progress %',
                    'Exercise Completed',
                    'Test Completed',
                    'Reward Granted',
                    'Started At',
                    'Completed At',
                    'Last Updated',
                ]);

                // Data rows
                foreach ($progress as $p) {
                    fputcsv($file, [
                        $p->progress_id,
                        $p->student_id,
                        $p->student->user->name ?? 'N/A',
                        $p->student->user->email ?? 'N/A',
                        $p->lesson_id,
                        $p->lesson->title ?? 'N/A',
                        ucfirst(str_replace('_', ' ', $p->status)),
                        $p->progress_percent,
                        $p->exercise_completed ? 'Yes' : 'No',
                        $p->test_completed ? 'Yes' : 'No',
                        $p->reward_granted ? 'Yes' : 'No',
                        $p->started_at?->format('Y-m-d H:i:s') ?? 'N/A',
                        $p->completed_at?->format('Y-m-d H:i:s') ?? 'N/A',
                        $p->last_updated_at?->format('Y-m-d H:i:s') ?? 'N/A',
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            Log::error('Failed to export progress: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to export progress report: ' . $e->getMessage()]);
        }
    }
    /**
     * Display a specific progress record with details
     */
    public function show($progressId)
    {
        try {
            // 手动查找 progress（使用主键）
            $progress = LessonProgress::where('progress_id', $progressId)
                ->with([
                    'student.user',
                    'lesson',
                ])
                ->firstOrFail();

            // Get exercise submissions for this lesson and student
            $exerciseProgress = \App\Models\ExerciseSubmission::where('student_id', $progress->student_id)
                ->whereHas('exercise', function ($query) use ($progress) {
                    $query->where('lesson_id', $progress->lesson_id);
                })
                ->with(['exercise' => function ($query) {
                    $query->select('exercise_id', 'title', 'exercise_type', 'difficulty', 'max_score');
                }])
                ->select('submission_id', 'exercise_id', 'student_id', 'score', 'completed', 'submitted_at', 'time_taken')
                ->orderBy('submitted_at', 'desc')
                ->get()
                ->groupBy('exercise_id')
                ->map(function ($submissions) {
                    // Get best submission for each exercise
                    $best = $submissions->sortByDesc('score')->first();
                    $exercise = $best->exercise;

                    return [
                        'exercise_id' => $exercise->exercise_id,
                        'exercise_title' => $exercise->title,
                        'exercise_type' => $exercise->exercise_type,
                        'status' => $best->completed ? 'completed' : 'in_progress',
                        'score' => $best->score,
                        'max_score' => $exercise->max_score,
                        'percentage' => $exercise->max_score > 0 ? round(($best->score / $exercise->max_score) * 100, 2) : 0,
                        'attempts' => $submissions->count(),
                        'completed_at' => $best->submitted_at,
                        'time_taken' => $best->time_taken,
                    ];
                })
                ->values();

            // Get test submissions for this lesson and student
            $testProgress = \App\Models\TestSubmission::where('student_id', $progress->student_id)
                ->whereHas('test', function ($query) use ($progress) {
                    $query->where('lesson_id', $progress->lesson_id);
                })
                ->with(['test' => function ($query) {
                    $query->select('test_id', 'title', 'passing_score', 'max_attempts');
                }])
                ->whereIn('status', ['submitted', 'timeout'])
                ->select('submission_id', 'test_id', 'student_id', 'score', 'status', 'submitted_at', 'time_spent', 'attempt_number')
                ->orderBy('submitted_at', 'desc')
                ->get()
                ->groupBy('test_id')
                ->map(function ($submissions) {
                    // Get best submission for each test
                    $best = $submissions->sortByDesc('score')->first();
                    $test = $best->test;

                    return [
                        'test_id' => $test->test_id,
                        'test_title' => $test->title,
                        'status' => $best->score >= $test->passing_score ? 'completed' : 'in_progress',
                        'score' => $best->score,
                        'passing_score' => $test->passing_score,
                        'passed' => $best->score >= $test->passing_score,
                        'attempts' => $submissions->count(),
                        'completed_at' => $best->submitted_at,
                        'time_spent' => $best->time_spent,
                    ];
                })
                ->values();

            // Calculate additional statistics
            $stats = [
                'total_exercises' => \App\Models\InteractiveExercise::where('lesson_id', $progress->lesson_id)
                    ->where('is_active', true)
                    ->count(),
                'exercises_completed' => $exerciseProgress->where('status', 'completed')->count(),
                'total_tests' => \App\Models\Test::where('lesson_id', $progress->lesson_id)
                    ->where('status', 'active')
                    ->count(),
                'tests_completed' => $testProgress->where('passed', true)->count(),
                'average_exercise_score' => $exerciseProgress->isNotEmpty()
                    ? round($exerciseProgress->avg('percentage'), 2)
                    : 0,
                'average_test_score' => $testProgress->isNotEmpty()
                    ? round($testProgress->avg('score'), 2)
                    : 0,
            ];

            // Merge stats into progress
            $progressData = $progress->toArray();
            $progressData['exercises_completed'] = $stats['exercises_completed'];
            $progressData['total_exercises'] = $stats['total_exercises'];
            $progressData['tests_completed'] = $stats['tests_completed'];
            $progressData['total_tests'] = $stats['total_tests'];
            $progressData['average_score'] = $stats['average_test_score'];

            return Inertia::render('Admin/Progress/Show', [
                'progress' => $progressData,
                'exerciseProgress' => $exerciseProgress,
                'testProgress' => $testProgress,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching progress details: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return redirect()
                ->route('admin.progress.index')
                ->with('error', 'Failed to load progress details: ' . $e->getMessage());
        }
    }
}
