import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { BarChart3, BookOpen, CheckCircle2, Clock, Trophy } from 'lucide-react';

export default function Statistics({
  profile = {},
  test_stats = {},
  exercise_stats = {},
  lesson_progress = [],
}) {
  const cards = [
    { label: 'Current Points', value: profile.current_points || 0, icon: Trophy },
    { label: 'Streak Days', value: profile.streak_days || 0, icon: Clock },
    { label: 'Tests Taken', value: test_stats.total_tests || 0, icon: BarChart3 },
    { label: 'Exercises Completed', value: exercise_stats.completed_exercises || 0, icon: CheckCircle2 },
  ];

  return (
    <StudentLayout>
      <Head title="Learning Statistics" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/20 bg-black/50 p-6 shadow-2xl backdrop-blur-xl">
          <h1 className="text-3xl font-bold text-white">Learning Statistics</h1>
          <p className="mt-2 text-gray-300">A compact view of your lesson, exercise, and test progress.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-white/15 bg-white/95 p-5 shadow-lg">
              <Icon className="mb-4 h-6 w-6 text-purple-600" />
              <div className="text-2xl font-bold text-slate-900">{Number(value || 0).toLocaleString()}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/95 p-6 shadow-xl">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Lesson Progress
          </h2>

          {lesson_progress.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-slate-500">
                  <tr>
                    <th className="py-3 pr-4">Lesson</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Exercises</th>
                    <th className="py-3 pr-4">Tests</th>
                    <th className="py-3">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson_progress.map((lesson, index) => (
                    <tr key={`${lesson.lesson_name}-${index}`} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-900">{lesson.lesson_name}</td>
                      <td className="py-3 pr-4 capitalize text-slate-600">{lesson.status}</td>
                      <td className="py-3 pr-4 text-slate-600">{lesson.exercises_completed}</td>
                      <td className="py-3 pr-4 text-slate-600">{lesson.tests_passed}</td>
                      <td className="py-3 text-slate-600">{lesson.completion_points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-600">No lesson progress has been recorded yet.</p>
          )}
        </div>

        <Link href={route('student.profile.show')} className="inline-block rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-gray-100">
          Back to Profile
        </Link>
      </div>
    </StudentLayout>
  );
}
