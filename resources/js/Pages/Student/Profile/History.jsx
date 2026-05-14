import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Code2, FileCheck2, History as HistoryIcon } from 'lucide-react';

export default function History({ test_history = [], exercise_history = [] }) {
  return (
    <StudentLayout>
      <Head title="Learning History" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/20 bg-black/50 p-6 shadow-2xl backdrop-blur-xl">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <HistoryIcon className="h-8 w-8 text-cyan-300" />
            Learning History
          </h1>
          <p className="mt-2 text-gray-300">Recent tests and exercises completed on your learning journey.</p>
        </div>

        <HistoryPanel title="Test Attempts" icon={FileCheck2} empty="No test attempts yet.">
          {test_history.map((item) => (
            <HistoryRow
              key={`test-${item.id}`}
              title={item.test_name}
              meta={`${item.status || 'submitted'} · ${item.submitted_at || 'Unknown date'}`}
              value={`${item.score ?? 0}%`}
            />
          ))}
        </HistoryPanel>

        <HistoryPanel title="Exercise Submissions" icon={Code2} empty="No completed exercises yet.">
          {exercise_history.map((item) => (
            <HistoryRow
              key={`exercise-${item.id}`}
              title={item.exercise_title}
              meta={`${item.lesson_name || 'Unknown lesson'} · ${item.submitted_at || 'Unknown date'}`}
              value={`${item.score ?? 0}/${item.max_score ?? 100}`}
            />
          ))}
        </HistoryPanel>

        <Link href={route('student.profile.show')} className="inline-block rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-gray-100">
          Back to Profile
        </Link>
      </div>
    </StudentLayout>
  );
}

function HistoryPanel({ title, icon: Icon, empty, children }) {
  const hasItems = React.Children.count(children) > 0;

  return (
    <section className="rounded-2xl border border-white/20 bg-white/95 p-6 shadow-xl">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
        <Icon className="h-5 w-5 text-purple-600" />
        {title}
      </h2>
      <div className="space-y-3">
        {hasItems ? children : <p className="text-slate-600">{empty}</p>}
      </div>
    </section>
  );
}

function HistoryRow({ title, meta, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="min-w-0">
        <h3 className="truncate font-semibold text-slate-900">{title || 'Untitled'}</h3>
        <p className="text-sm text-slate-500">{meta}</p>
      </div>
      <div className="shrink-0 rounded-lg bg-purple-100 px-3 py-1 font-bold text-purple-700">{value}</div>
    </div>
  );
}
