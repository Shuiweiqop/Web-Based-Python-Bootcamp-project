// resources/js/Pages/Admin/Exercises/Edit.jsx
import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
  ArrowLeft,
  Info,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import ExerciseForm from '@/Components/Admin/ExerciseForm';
import useIsDark from '@/Hooks/useIsDark';
import { cn } from '@/utils/cn';
import exerciseTypeRegistry from '@/Config/exerciseTypeRegistry';

export default function Edit(props) {
  const page = usePage();
  const exercise = props.exercise ?? page.props?.exercise ?? null;
  const lesson = props.lesson ?? page.props?.lesson ?? null;

  const isDark = useIsDark();

  if (!exercise) {
    return (
      <AuthenticatedLayout user={props.auth?.user}>
        <Head title="Exercise Not Found" />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className={cn(
            "rounded-xl p-6 border animate-shake",
            isDark
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : "bg-red-50 border-red-200 text-red-700"
          )}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Exercise Not Found</h3>
                <p className="text-sm">Exercise data could not be loaded. It might have been deleted.</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href={lesson ? route('admin.lessons.exercises.index', { lesson: lesson.lesson_id }) : route('admin.exercises.index')}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ripple-effect hover-lift",
                isDark
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              {lesson ? 'Back to Lesson Exercises' : 'Back to Exercises'}
            </Link>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const exerciseId = exercise.exercise_id ?? exercise.id;
  const lessonId = lesson?.lesson_id;

  const isNestedLessonRoute = lessonId && window.location.pathname.startsWith(`/admin/lessons/${lessonId}/exercises/`);
  const submitUrl = isNestedLessonRoute
    ? route('admin.lessons.exercises.update', { lesson: lessonId, exercise: exerciseId })
    : route('admin.exercises.update', { exercise: exerciseId });
  const backHref = lesson ? route('admin.lessons.show', lesson.lesson_id) : route('admin.exercises.index');

  const typeInfo = exerciseTypeRegistry.getExerciseType(exercise.exercise_type ?? 'drag_drop');

  return (
    <AuthenticatedLayout user={props.auth?.user}>
      <Head title={`Edit Exercise - ${exercise.title}`} />

      <div className="py-12 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 animate-fadeIn">
            <Link
              href={backHref}
              className={cn(
                "inline-flex items-center gap-2 font-medium mb-6 transition-all hover-lift ripple-effect px-4 py-2 rounded-lg",
                isDark
                  ? "text-cyan-400 hover:text-cyan-300 hover:bg-white/10"
                  : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30 animate-glowPulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className={cn(
                "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                isDark
                  ? "from-blue-400 to-indigo-400"
                  : "from-blue-600 to-indigo-600"
              )}>
                Edit Exercise
              </h1>
            </div>

            {lesson && (
              <div className={cn(
                "flex items-center gap-3 mt-4 rounded-xl px-5 py-4 border-2 animate-slideInRight",
                isDark
                  ? "glassmorphism-enhanced border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-indigo-500/10"
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
              )}>
                <Info className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isDark ? "text-cyan-400" : "text-blue-600"
                )} />
                <p className={cn(
                  "font-medium",
                  isDark ? "text-white" : "text-blue-900"
                )}>
                  Editing exercise for: <span className="font-bold">{lesson.title}</span>
                </p>
              </div>
            )}

            {/* Status Info Card — shows the saved state, not unsaved edits */}
            <div className={cn(
              "mt-4 rounded-xl p-5 border-2 backdrop-blur-sm animate-slideDown",
              isDark
                ? "glassmorphism-enhanced border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-cyan-500/10"
                : "bg-gradient-to-r from-purple-50 to-cyan-50 border-purple-200 shadow-lg"
            )}>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border",
                  isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                )}>
                  <span className={cn("font-semibold", isDark ? "text-gray-300" : "text-gray-700")}>Type:</span>
                  <span className={cn(
                    "px-2 py-1 rounded font-medium text-xs",
                    isDark ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-800"
                  )}>
                    {typeInfo?.icon} {typeInfo?.label}
                  </span>
                </div>

                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border",
                  isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                )}>
                  <span className={cn("font-semibold", isDark ? "text-gray-300" : "text-gray-700")}>Active:</span>
                  <span className={cn(
                    "px-2 py-1 rounded inline-flex items-center gap-1 font-medium text-xs border",
                    exercise.is_active
                      ? isDark ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-green-100 text-green-800 border-green-300"
                      : isDark ? "bg-slate-700 text-slate-300 border-slate-600" : "bg-gray-100 text-gray-800 border-gray-300"
                  )}>
                    {exercise.is_active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {exercise.is_active ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <ExerciseForm
            exercise={exercise}
            lesson={lesson}
            submitUrl={submitUrl}
            method="put"
            cancelHref={backHref}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
