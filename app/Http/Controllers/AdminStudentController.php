<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class AdminStudentController extends Controller
{
    /**
     * Display a listing of students.
     */
    public function index(Request $request)
    {
        $query = User::with(['studentProfile'])
            ->where('role', 'student')
            ->notLocked();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by level
        if ($request->filled('level') && $request->level !== 'all') {
            $query->whereHas('studentProfile', function ($q) use ($request) {
                $points = match ($request->level) {
                    'Expert' => 10000,
                    'Advanced' => 5000,
                    'Intermediate' => 2000,
                    'Beginner' => 500,
                    'Newbie' => 0,
                    default => 0,
                };
                $maxPoints = match ($request->level) {
                    'Expert' => PHP_INT_MAX,
                    'Advanced' => 9999,
                    'Intermediate' => 4999,
                    'Beginner' => 1999,
                    'Newbie' => 499,
                    default => PHP_INT_MAX,
                };
                $q->whereBetween('current_points', [$points, $maxPoints]);
            });
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            switch ($request->status) {
                case 'verified':
                    $query->whereNotNull('email_verified_at');
                    break;
                case 'unverified':
                    $query->whereNull('email_verified_at');
                    break;
                case 'active':
                    $query->whereHas('studentProfile', function ($q) {
                        $q->where('last_activity_date', '>=', now()->subDays(7));
                    });
                    break;
            }
        }

        $students = $query->latest()->paginate(10)->withQueryString();

        // Calculate stats
        $stats = [
            'total' => User::where('role', 'student')->count(),
            'active' => User::where('role', 'student')
                ->whereHas('studentProfile', function ($q) {
                    $q->where('last_activity_date', '>=', now()->subDays(7));
                })->count(),
            'avg_score' => round(StudentProfile::avg('average_score') ?? 0, 1),
            'total_points' => StudentProfile::sum('current_points') ?? 0,
        ];

        return Inertia::render('Admin/StudentManagement/Index', [  // ✅ 改成 StudentManagement
            'students' => $students,
            'stats' => $stats,
            'filters' => $request->only(['search', 'level', 'status']),
        ]);
    }

    /**
     * Show student details.
     */
    public function show(User $student)
    {
        if ($student->role !== 'student') {
            abort(404);
        }

        $student->load(['studentProfile']);
        $profile = $student->studentProfile;

        $stats = null;
        if ($profile) {
            $stats = [
                'overview' => [
                    'points' => $profile->current_points,
                    'level' => $profile->points_level,
                    'streak' => $profile->streak_days,
                    'lessons_completed' => $profile->total_lessons_completed,
                    'tests_taken' => $profile->total_tests_taken,
                    'average_score' => $profile->average_score,
                ],
                'learning_path' => $profile->getLearningPathProgress(),
                'exercise_stats' => $profile->getExerciseStats(),
                'test_stats' => $profile->getTestProgressStats(),
            ];
        }

        return Inertia::render('Admin/StudentManagement/Show', [  // ✅ 改成 StudentManagement
            'student' => $student,
            'stats' => $stats,
        ]);
    }

    /**
     * Show edit form.
     */
    public function edit(User $student)
    {
        if ($student->role !== 'student') {
            abort(404);
        }

        return Inertia::render('Admin/StudentManagement/Edit', [  // ✅ 改成 StudentManagement
            'student' => $student->load('studentProfile'),
        ]);
    }

    /**
     * Update student.
     */
    public function update(Request $request, User $student)
    {
        if ($student->role !== 'student') {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $student->user_Id . ',user_Id',
            'phone_number' => 'nullable|string|max:20',
        ]);

        $student->update($validated);

        return redirect()->route('admin.students.show', $student)
            ->with('success', 'Student updated successfully.');
    }

    /**
     * Delete student.
     */
    public function destroy(User $student)
    {
        if ($student->role !== 'student') {
            abort(404);
        }

        $name = $student->name;
        $student->delete();

        return redirect()->route('admin.students.index')
            ->with('success', "Student {$name} deleted successfully.");
    }

    /**
     * Adjust points.
     */
    public function adjustPoints(Request $request, User $student)
    {
        $validated = $request->validate([
            'action' => 'required|in:add,deduct,set',
            'points' => 'required|integer|min:0',
            'reason' => 'nullable|string|max:500',
        ]);

        $profile = $student->studentProfile;
        if (!$profile) {
            return back()->withErrors(['error' => 'Student profile not found.']);
        }

        switch ($validated['action']) {
            case 'add':
                $profile->addPoints($validated['points']);
                break;
            case 'deduct':
                $profile->deductPoints($validated['points']);
                break;
            case 'set':
                $profile->update(['current_points' => $validated['points']]);
                break;
        }

        return back()->with('success', 'Points adjusted successfully.');
    }
    public function resetPassword(Request $request, User $student)
    {
        if ($student->role !== 'student') {
            abort(404);
        }

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $student->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password reset successfully.');
    }
}
