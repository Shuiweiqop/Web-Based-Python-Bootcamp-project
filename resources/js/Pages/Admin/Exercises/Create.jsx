// resources/js/Pages/Admin/Exercises/Create.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Sparkles, Info, ArrowLeft } from 'lucide-react';
import ExerciseForm from '@/Components/Admin/ExerciseForm';
import useIsDark from '@/Hooks/useIsDark';
import { cn } from '@/utils/cn';

export default function Create({ auth, lesson, lessons }) {
  const isDark = useIsDark();

  const backHref = lesson ? route('admin.lessons.show', lesson.lesson_id) : route('admin.exercises.index');
  const submitUrl = lesson
    ? route('admin.lessons.exercises.store', lesson.lesson_id)
    : route('admin.exercises.store');

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Create Exercise" />

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
              <div className="p-3 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl shadow-lg shadow-purple-500/30 animate-glowPulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className={cn(
                "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                isDark
                  ? "from-purple-400 to-cyan-400"
                  : "from-purple-600 to-cyan-600"
              )}>
                Create New Exercise
              </h1>
            </div>

            {lesson && (
              <div className={cn(
                "flex items-center gap-3 mt-4 rounded-xl px-5 py-4 border-2 animate-slideInRight",
                isDark
                  ? "glassmorphism-enhanced border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
                  : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
              )}>
                <Info className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isDark ? "text-cyan-400" : "text-blue-600"
                )} />
                <p className={cn(
                  "font-medium",
                  isDark ? "text-white" : "text-blue-900"
                )}>
                  Creating exercise for: <span className="font-bold">{lesson.title}</span>
                </p>
              </div>
            )}
          </div>

          <ExerciseForm
            lesson={lesson}
            lessons={lessons}
            submitUrl={submitUrl}
            method="post"
            cancelHref={backHref}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
