<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitExerciseRequest;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Services\ExerciseSubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ExerciseController extends Controller
{
    public function __construct(private ExerciseSubmissionService $service)
    {
        $this->middleware(['auth', 'verified']);
    }

    public function submit(SubmitExerciseRequest $request, Lesson $lesson, InteractiveExercise $exercise): JsonResponse
    {
        $student = Auth::user()->studentProfile;

        if (!$student) {
            Log::error('Student profile not found', ['user_id' => Auth::id()]);
            return response()->json(['success' => false, 'message' => 'Student profile not found.'], 404);
        }

        if ($exercise->lesson_id !== $lesson->lesson_id) {
            return response()->json(['success' => false, 'message' => 'Invalid exercise for this lesson.'], 400);
        }

        $progress = LessonProgress::where('student_id', $student->student_id)
            ->where('lesson_id', $lesson->lesson_id)
            ->first();

        if (!$progress || !$progress->content_completed) {
            return response()->json([
                'success' => false,
                'message' => 'Please review the lesson content before starting exercises.',
            ], 403);
        }

        try {
            $result = $this->service->submit(
                $student,
                $lesson,
                $exercise,
                $request->validated()['answer'],
                (int) ($request->validated()['time_spent'] ?? 0)
            );

            return response()->json([
                'success' => true,
                'message' => 'Exercise completed successfully!',
                ...$result,
            ]);
        } catch (\Exception $e) {
            Log::error('Error submitting exercise', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit exercise: ' . $e->getMessage(),
            ], 500);
        }
    }
}
