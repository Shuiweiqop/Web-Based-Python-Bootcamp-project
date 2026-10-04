<?php

namespace App\Http\Controllers;

use App\Exceptions\CodeGradingUnavailableException;
use App\Http\Requests\SubmitExerciseRequest;
use App\Models\InteractiveExercise;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\StudentProfile;
use App\Services\ExerciseSubmissionService;
use App\Services\Grading\MemoryMatchGrader;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        if ($refusal = $this->refuse($lesson, $exercise, $student)) {
            return $refusal;
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
        } catch (CodeGradingUnavailableException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 503);
        } catch (\Exception $e) {
            Log::error('exercise.submit.failed', [
                'action' => 'submit',
                'student_id' => $student->student_id,
                'lesson_id' => $lesson->lesson_id,
                'exercise_id' => $exercise->exercise_id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            // The exception's message stays in the log: it can carry SQL,
            // file paths or other internals the student should not see.
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong saving your answer. Please try again.',
            ], 500);
        }
    }

    /**
     * Turn over two cards in a memory match game. The server says whether
     * they match and keeps the run's tally, which grading scores.
     */
    public function flip(Request $request, Lesson $lesson, InteractiveExercise $exercise, MemoryMatchGrader $grader): JsonResponse
    {
        $validated = $request->validate([
            'run' => ['required', 'string', 'max:64', 'regex:/^[A-Za-z0-9-]+$/'],
            'first' => 'required|string|max:64',
            'second' => 'required|string|max:64',
        ]);

        $student = Auth::user()->studentProfile;

        if ($refusal = $this->refuse($lesson, $exercise, $student)) {
            return $refusal;
        }

        if ($exercise->exercise_type !== 'memory_match') {
            return response()->json(['success' => false, 'message' => 'This exercise has no cards.'], 400);
        }

        try {
            $result = $grader->flip(
                is_array($exercise->content) ? $exercise->content : [],
                (int) $student->student_id,
                (int) $exercise->exercise_id,
                $validated['run'],
                $validated['first'],
                $validated['second']
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, ...$result]);
    }

    /**
     * Why this student may not answer this exercise yet, as a response; null
     * when they may.
     */
    private function refuse(Lesson $lesson, InteractiveExercise $exercise, ?StudentProfile $student): ?JsonResponse
    {
        if (! $student) {
            Log::error('Student profile not found', ['user_id' => Auth::id()]);

            return response()->json(['success' => false, 'message' => 'Student profile not found.'], 404);
        }

        if ($exercise->lesson_id !== $lesson->lesson_id) {
            return response()->json(['success' => false, 'message' => 'Invalid exercise for this lesson.'], 400);
        }

        $progress = LessonProgress::where('student_id', $student->student_id)
            ->where('lesson_id', $lesson->lesson_id)
            ->first();

        if (! $progress || ! $progress->content_completed) {
            return response()->json([
                'success' => false,
                'message' => 'Please review the lesson content before starting exercises.',
            ], 403);
        }

        return null;
    }
}
