// resources/js/Pages/Admin/Exercises/Edit.jsx
import React from 'react';
import { useForm, Link, usePage } from '@inertiajs/react';

export default function Edit(props) {
  const page = usePage();
  const exercise = props.exercise ?? (page.props && page.props.exercise) ?? null;
  const lesson = props.lesson ?? (page.props && page.props.lesson) ?? null;
  const lessons = props.lessons ?? (page.props && page.props.lessons) ?? [];

  if (!exercise) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Exercise</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          Exercise data not found. It might have been deleted or there was an error loading data.
        </div>
        <div className="mt-4">
          <Link 
            href={lesson ? route('admin.lessons.exercises.index', { lesson: lesson.lesson_id }) : route('admin.exercises.index')} 
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            {lesson ? 'Back to Lesson Exercises' : 'Back to Exercises'}
          </Link>
        </div>
      </div>
    );
  }

  // Normalize id fields (exercise may use exercise_id or id)
  const exerciseId = exercise.exercise_id ?? exercise.id ?? null;
  const lessonId = lesson?.lesson_id ?? null;

  const { data, setData, put, processing, errors } = useForm({
    lesson_id: exercise.lesson_id ?? '',
    title: exercise.title ?? '',
    description: exercise.description ?? '',
    content: exercise.content ?? '',
    exercise_type: exercise.exercise_type ?? 'multiple_choice',
    difficulty: exercise.difficulty ?? 'beginner',
    estimated_duration: exercise.estimated_duration ?? '',
    points: exercise.points ?? 0,
    status: exercise.status ?? 'draft',
    max_score: exercise.max_score ?? '',
    time_limit_sec: exercise.time_limit_sec ?? '',
    is_active: exercise.is_active ?? true,
  });

  function submit(e) {
  e.preventDefault();

  // ensure these exist:
  const lessonId = lesson?.lesson_id ?? lesson?.id;       // may be null if non-nested
  const exerciseId = exercise?.exercise_id ?? exercise?.id;

  if (!exerciseId) {
    alert('Missing exercise id — cannot update.');
    return;
  }

  // If you're editing within lesson context, pass both; otherwise pass exercise only
  const routeParams = lessonId ? { lesson: lessonId, exercise: exerciseId } : { exercise: exerciseId };

  console.log('Resolved update URL:', route('admin.lessons.exercises.update', routeParams));

  // use put or patch depending on your route; both are fine if route is defined for PUT
  put(route('admin.lessons.exercises.update', routeParams), {
    preserveScroll: true,
    onStart: () => console.log('Updating exercise...'),
    onSuccess: () => console.log('Exercise updated'),
    onError: (errs) => console.error('Update errors', errs),
  });
}


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Edit Exercise</h1>
        {lesson && (
          <p className="text-gray-600">
            Lesson: <span className="font-medium">{lesson.title}</span>
          </p>
        )}
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* ... the form body is unchanged ... */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Link 
            href={lesson ? route('admin.lessons.exercises.index', { lesson: lesson.lesson_id }) : route('admin.exercises.index')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            ← Back to {lesson ? 'Lesson Exercises' : 'Exercises'}
          </Link>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Saving...' : 'Save Exercise Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
