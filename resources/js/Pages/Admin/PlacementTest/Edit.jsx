import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Edit({ test, statusOptions }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    window.addEventListener('theme-changed', checkDarkMode);
    return () => window.removeEventListener('theme-changed', checkDarkMode);
  }, []);

  const { data, setData, put, processing, errors } = useForm({
    title: test.title || '',
    description: test.description || '',
    instructions: test.instructions || '',
    time_limit: test.time_limit || 60,
    shuffle_questions: test.shuffle_questions || false,
    status: test.status || 'draft',
    skill_tags: test.skill_tags || [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('admin.placement-tests.update', test.test_id), {
      preserveScroll: true,
      onSuccess: () => {
        // Success message will be shown by the backend
      },
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-4">
          <Link href={route('admin.placement-tests.show', test.test_id)}>
            <button className={cn(
              "rounded-lg border p-2 transition-all",
              isDark 
                ? "border-white/10 hover:bg-white/10" 
                : "border-gray-300 hover:bg-gray-100"
            )}>
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h2 className={cn(
              "text-2xl font-bold",
              isDark ? "text-white" : "text-gray-800"
            )}>
              Edit Placement Test
            </h2>
            <p className={cn(
              "text-sm",
              isDark ? "text-slate-400" : "text-gray-600"
            )}>
              Update placement test settings and information
            </p>
          </div>
        </div>
      }
    >
      <Head title={`Edit - ${test.title}`} />

      <div className="py-8">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Card */}
            <div className={cn(
              "rounded-lg border p-6 shadow-sm",
              isDark 
                ? "glassmorphism-enhanced border-white/10" 
                : "bg-white border-gray-200"
            )}>
              <h3 className={cn(
                "mb-4 text-lg font-semibold",
                isDark ? "text-white" : "text-gray-900"
              )}>
                Basic Information
              </h3>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className={cn(
                    "mb-2 block text-sm font-medium",
                    isDark ? "text-slate-300" : "text-gray-700"
                  )}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2 transition-all focus:outline-none focus:ring-2",
                      isDark
                        ? "bg-white/5 border-white/10 text-white focus:border-cyan-400/50 focus:ring-cyan-400/20"
                        : "border-gray-300 focus:border-purple-500 focus:ring-purple-500/20"
                    )}
                    placeholder="e.g., Python Skill Assessment"
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className={cn(
                    "mb-2 block text-sm font-medium",
                    isDark ? "text-slate-300" : "text-gray-700"
                  )}>
                    Description
                  </label>
                  <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={3}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2 transition-all focus:outline-none focus:ring-2",
                      isDark
                        ? "bg-white/5 border-white/10 text-white focus:border-cyan-400/50 focus:ring-cyan-400/20"
                        : "border-gray-300 focus:border-purple-500 focus:ring-purple-500/20"
                    )}
                    placeholder="Brief description of the test"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Instructions */}
                <div>
                  <label className={cn(
                    "mb-2 block text-sm font-medium",
                    isDark ? "text-slate-300" : "text-gray-700"
                  )}>
                    Instructions for Students
                  </label>
                  <textarea
                    value={data.instructions}
                    onChange={(e) => setData('instructions', e.target.value)}
                    rows={4}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2 transition-all focus:outline-none focus:ring-2",
                      isDark
                        ? "bg-white/5 border-white/10 text-white focus:border-cyan-400/50 focus:ring-cyan-400/20"
                        : "border-gray-300 focus:border-purple-500 focus:ring-purple-500/20"
                    )}
                    placeholder="Instructions that students will see before starting the test"
                  />
                  {errors.instructions && (
                    <p className="mt-1 text-sm text-red-600">{errors.instructions}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Test Settings Card */}
            <div className={cn(
              "rounded-lg border p-6 shadow-sm",
              isDark 
                ? "glassmorphism-enhanced border-white/10" 
                : "bg-white border-gray-200"
            )}>
              <h3 className={cn(
                "mb-4 text-lg font-semibold",
                isDark ? "text-white" : "text-gray-900"
              )}>
                Test Settings
              </h3>

              <div className="space-y-4">
                {/* Time Limit */}
                <div>
                  <label className={cn(
                    "mb-2 block text-sm font-medium",
                    isDark ? "text-slate-300" : "text-gray-700"
                  )}>
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={data.time_limit}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : parseInt(e.target.value) || 0;
                      setData('time_limit', value);
                    }}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2 transition-all focus:outline-none focus:ring-2",
                      isDark
                        ? "bg-white/5 border-white/10 text-white focus:border-cyan-400/50 focus:ring-cyan-400/20"
                        : "border-gray-300 focus:border-purple-500 focus:ring-purple-500/20"
                    )}
                    min="1"
                  />
                  {errors.time_limit && (
                    <p className="mt-1 text-sm text-red-600">{errors.time_limit}</p>
                  )}
                </div>

                {/* Shuffle Questions */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.shuffle_questions}
                      onChange={(e) => setData('shuffle_questions', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-slate-300" : "text-gray-700"
                    )}>
                      Shuffle Questions (Recommended for placement tests)
                    </span>
                  </label>
                </div>

                {/* Status */}
                <div>
                  <label className={cn(
                    "mb-2 block text-sm font-medium",
                    isDark ? "text-slate-300" : "text-gray-700"
                  )}>
                    Status
                  </label>
                  <select
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                    className={cn(
                      "w-full rounded-lg border px-4 py-2 transition-all focus:outline-none focus:ring-2",
                      isDark
                        ? "bg-slate-800 border-slate-700 text-white focus:border-cyan-400 focus:ring-cyan-400/20 [&>option]:bg-slate-800 [&>option]:text-white"
                        : "bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500/20 [&>option]:bg-white [&>option]:text-gray-900"
                    )}
                  >
                    {Object.entries(statusOptions).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  {/* ⚠️ 激活警告提示框 */}
                  {data.status === 'active' && (
                    <div className={cn(
                      "mt-4 p-4 rounded-lg border-l-4 flex items-start gap-3",
                      isDark 
                        ? "bg-yellow-950/30 border-yellow-600" 
                        : "bg-yellow-50 border-yellow-400"
                    )}>
                      <AlertTriangle className={cn(
                        "w-5 h-5 flex-shrink-0 mt-0.5",
                        isDark ? "text-yellow-300" : "text-yellow-600"
                      )} />
                      <div className={cn(
                        isDark ? "text-yellow-300" : "text-yellow-800"
                      )}>
                        <p className="font-semibold text-sm">
                          Only One Active Test Allowed
                        </p>
                        <p className="text-sm mt-1 opacity-90">
                          Activating this test will automatically deactivate all other placement tests. 
                          Students will only see this test when they visit the placement evaluation page.
                        </p>
                      </div>
                    </div>
                  )}

                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Show all errors if any */}
            {Object.keys(errors).length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <h4 className="font-semibold text-red-900 dark:text-red-200">
                  ⚠️ Please fix the following errors:
                </h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-800 dark:text-red-300">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link href={route('admin.placement-tests.show', test.test_id)}>
                <button
                  type="button"
                  className={cn(
                    "rounded-lg border px-6 py-2 transition-all",
                    isDark
                      ? "border-white/10 text-slate-300 hover:bg-white/10"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={processing}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-6 py-2 text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
                  "bg-gradient-to-r from-purple-600 to-blue-600"
                )}
              >
                <Save className="h-4 w-4" />
                {processing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Warning Card */}
          <div className={cn(
            "mt-6 rounded-lg border p-4",
            isDark
              ? "border-yellow-500/20 bg-yellow-500/10"
              : "border-yellow-200 bg-yellow-50"
          )}>
            <h4 className={cn(
              "font-semibold",
              isDark ? "text-yellow-200" : "text-yellow-900"
            )}>
              ⚠️ Important Notes
            </h4>
            <ul className={cn(
              "mt-2 list-disc space-y-1 pl-5 text-sm",
              isDark ? "text-yellow-300" : "text-yellow-800"
            )}>
              <li>Changes to time limit will only affect future test attempts</li>
              <li>Changing status to "Inactive" will prevent new students from taking this test</li>
              <li>Students who have already started the test can still complete it</li>
              <li>To modify questions, use the "Manage Questions" section</li>
            </ul>
          </div>

          {/* Test Statistics Card */}
          {test.questions_count > 0 && (
            <div className={cn(
              "mt-6 rounded-lg border p-6 shadow-sm",
              isDark 
                ? "glassmorphism-enhanced border-white/10" 
                : "bg-white border-gray-200"
            )}>
              <h3 className={cn(
                "mb-4 text-lg font-semibold",
                isDark ? "text-white" : "text-gray-900"
              )}>
                Current Test Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className={cn(
                    "text-3xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {test.questions_count}
                  </div>
                  <div className={cn(
                    "text-sm",
                    isDark ? "text-slate-400" : "text-gray-600"
                  )}>
                    Questions
                  </div>
                </div>
                
                <div className="text-center">
                  <div className={cn(
                    "text-3xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {test.total_points}
                  </div>
                  <div className={cn(
                    "text-sm",
                    isDark ? "text-slate-400" : "text-gray-600"
                  )}>
                    Total Points
                  </div>
                </div>

                <div className="text-center">
                  <div className={cn(
                    "text-3xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {test.time_limit || 'N/A'}
                  </div>
                  <div className={cn(
                    "text-sm",
                    isDark ? "text-slate-400" : "text-gray-600"
                  )}>
                    Minutes
                  </div>
                </div>

                <div className="text-center">
                  <div className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                    test.status === 'active'
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : test.status === 'inactive'
                      ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  )}>
                    {test.status}
                  </div>
                  <div className={cn(
                    "mt-1 text-sm",
                    isDark ? "text-slate-400" : "text-gray-600"
                  )}>
                    Current Status
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <Link href={route('admin.placement-tests.questions.index', test.test_id)}>
                  <button className={cn(
                    "rounded-lg px-4 py-2 text-sm transition-all",
                    isDark
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}>
                    Manage Questions →
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}