import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { cn } from '@/utils/cn';
import { ArrowLeft, Save, User } from 'lucide-react';

export default function Edit({ student }) {
  const [isDark, setIsDark] = useState(false);
  const { data, setData, put, processing, errors } = useForm({
    name: student?.name || '',
    email: student?.email || '',
    phone_number: student?.phone_number || '',
  });

  useEffect(() => {
    const syncTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    syncTheme();
    window.addEventListener('theme-changed', syncTheme);
    return () => window.removeEventListener('theme-changed', syncTheme);
  }, []);

  const submit = (event) => {
    event.preventDefault();
    put(route('admin.students.update', student.user_Id));
  };

  const inputClass = cn(
    'w-full rounded-lg border px-4 py-3 transition focus:outline-none focus:ring-2',
    isDark
      ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-500/20'
      : 'border-purple-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-200'
  );

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-4">
          <Link
            href={route('admin.students.show', student.user_Id)}
            className={cn(
              'rounded-lg p-2 transition',
              isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-purple-100'
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Student</h1>
            <p className={cn('mt-1 text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
              Update account details for {student.name}.
            </p>
          </div>
        </div>
      }
    >
      <Head title={`Edit ${student.name}`} />

      <form
        onSubmit={submit}
        className={cn(
          'mx-auto max-w-3xl rounded-xl border p-6 shadow-sm',
          isDark ? 'glassmorphism-enhanced border-white/10' : 'border-purple-200 bg-white'
        )}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              Student Information
            </h2>
            <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-600')}>
              Role and learning records are managed separately.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <Field label="Full Name" error={errors.name} isDark={isDark}>
            <input
              className={inputClass}
              value={data.name}
              onChange={(event) => setData('name', event.target.value)}
              placeholder="Student name"
              required
            />
          </Field>

          <Field label="Email Address" error={errors.email} isDark={isDark}>
            <input
              type="email"
              className={inputClass}
              value={data.email}
              onChange={(event) => setData('email', event.target.value)}
              placeholder="student@example.com"
              required
            />
          </Field>

          <Field label="Phone Number" error={errors.phone_number} isDark={isDark}>
            <input
              className={inputClass}
              value={data.phone_number}
              onChange={(event) => setData('phone_number', event.target.value)}
              placeholder="Optional"
            />
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link
            href={route('admin.students.show', student.user_Id)}
            className={cn(
              'rounded-lg px-5 py-2.5 font-medium transition',
              isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
            )}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-5 py-2.5 font-semibold text-white shadow-lg transition hover:shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {processing ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </AuthenticatedLayout>
  );
}

function Field({ label, error, isDark, children }) {
  return (
    <label className="block">
      <span className={cn('mb-2 block text-sm font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-500">{error}</span>}
    </label>
  );
}
