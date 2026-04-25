import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Create({ statusOptions }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    window.addEventListener('theme-changed', checkDarkMode);
    return () => window.removeEventListener('theme-changed', checkDarkMode);
  }, []);

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    instructions: '',
    time_limit: 60,
    shuffle_questions: false,
    status: 'draft',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.placement-tests.store'), {
      preserveScroll: true,
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-4">
          <Link href={route('admin.placement-tests.index')}>
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
              Create Placement Test
            </h2>
            <p className={cn(
              "text-sm",
              isDark ? "text-slate-400" : "text-gray-600"
            )}>
              Create a new placement test for student onboarding
            </p>
          </div>
        </div>
      }
    >
      <Head title="Create Placement Test" />

      <div className="py-8">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                      const value = e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0;
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
                    Shuffle Questions
                  </span>
                </label>

                <p className={cn("text-xs", isDark ? "text-slate-400" : "text-gray-600")}>
                  Placement tests use fixed guided settings: no immediate review and no passing score gate.
                </p>

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
                        ? "bg-white/5 border-white/10 text-white focus:border-cyan-400/50 focus:ring-cyan-400/20"
                        : "border-gray-300 focus:border-purple-500 focus:ring-purple-500/20"
                    )}
                  >
                    {Object.entries(statusOptions).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                  )}
                </div>
              </div>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <h4 className="font-semibold text-red-900 dark:text-red-200">
                  Please fix the following errors:
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

            <div className="flex justify-end gap-3">
              <Link href={route('admin.placement-tests.index')}>
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
                {processing ? 'Creating...' : 'Create Test'}
              </button>
            </div>
          </form>

          <div className={cn(
            "mt-6 rounded-lg border p-4",
            isDark
              ? "border-blue-500/20 bg-blue-500/10"
              : "border-blue-200 bg-blue-50"
          )}>
            <h4 className={cn(
              "font-semibold",
              isDark ? "text-blue-200" : "text-blue-900"
            )}>
              Next Steps
            </h4>
            <ol className={cn(
              "mt-2 list-decimal space-y-1 pl-5 text-sm",
              isDark ? "text-blue-300" : "text-blue-800"
            )}>
              <li>Create the test (draft mode recommended)</li>
              <li>Add questions to the test</li>
              <li>Preview the test to ensure everything works</li>
              <li>Set status to Active when ready</li>
              <li>Use Set Default (active test) from the list page when needed</li>
            </ol>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
