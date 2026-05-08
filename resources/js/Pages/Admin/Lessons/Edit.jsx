import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  GripVertical,
  Info,
  Plus,
  Save,
  Settings,
  Sparkles,
  Target,
  Trash2,
  Video,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { safeRoute } from '@/utils/routeHelpers';

const steps = [
  {
    id: 1,
    title: 'Lesson Foundation',
    description: 'Title, format, core content, and delivery details.',
  },
  {
    id: 2,
    title: 'Structure & Publishing',
    description: 'Sections, completion rules, reward, and release status.',
  },
];

const contentTypes = [
  { value: 'text', label: 'Plain Text', icon: 'DOC', description: 'Simple text without formatting' },
  { value: 'markdown', label: 'Markdown', icon: 'MD', description: 'Great for readable lesson writing' },
  { value: 'html', label: 'HTML', icon: 'HTML', description: 'Rich HTML content with sanitization' },
];

const difficulties = [
  { value: 'beginner', label: 'Beginner', accent: 'from-emerald-500 to-green-500' },
  { value: 'intermediate', label: 'Intermediate', accent: 'from-amber-500 to-orange-500' },
  { value: 'advanced', label: 'Advanced', accent: 'from-rose-500 to-red-500' },
];

const statuses = [
  { value: 'draft', label: 'Draft', description: 'Keep building before students can see it.' },
  { value: 'active', label: 'Active', description: 'Ready for students to discover and take.' },
  { value: 'inactive', label: 'Inactive', description: 'Temporarily hidden without deleting it.' },
];

export default function Edit({ auth, lesson: propLesson, sections: propSections = [], current_exercises_count = 0, current_tests_count = 0 }) {
  const lesson = propLesson ?? null;
  const lessonId = lesson?.lesson_id ?? lesson?.id ?? null;
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [currentStep, setCurrentStep] = useState(1);
  const [isDark, setIsDark] = useState(true);

  const { data, setData, put, processing, errors } = useForm({
    title: lesson?.title ?? '',
    content: lesson?.content ?? '',
    content_type: lesson?.content_type ?? 'markdown',
    difficulty: lesson?.difficulty ?? 'beginner',
    estimated_duration: lesson?.estimated_duration ?? 30,
    video_url: lesson?.video_url ?? '',
    completion_reward_points: lesson?.completion_reward_points ?? 100,
    status: lesson?.status ?? 'draft',
    required_exercises: lesson?.required_exercises ?? 0,
    required_tests: lesson?.required_tests ?? 0,
    min_exercise_score_percent: lesson?.min_exercise_score_percent ?? 70,
    sections: (propSections || []).map((section, index) => ({
      id: section.id || section.lesson_section_id || `existing-${index}`,
      title: section.title ?? '',
      content: section.content ?? '',
      order_index: section.order_index || index + 1,
    })),
  });

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateTheme();
    window.addEventListener('theme-changed', updateTheme);

    return () => window.removeEventListener('theme-changed', updateTheme);
  }, []);

  useEffect(() => {
    if (data.sections.length > 0) {
      setExpandedSections(new Set([data.sections[0].id]));
    }
  }, []);

  const canContinueToStepTwo = data.title.trim().length > 0 && data.content_type.trim().length > 0;

  const summaryItems = useMemo(() => [
    {
      label: 'Current status',
      value: statuses.find((item) => item.value === data.status)?.label || 'Draft',
    },
    {
      label: 'Content type',
      value: contentTypes.find((item) => item.value === data.content_type)?.label || 'Markdown',
    },
    {
      label: 'Attached practice',
      value: `${current_exercises_count} exercise${current_exercises_count === 1 ? '' : 's'}`,
    },
    {
      label: 'Attached checks',
      value: `${current_tests_count} test${current_tests_count === 1 ? '' : 's'}`,
    },
  ], [current_exercises_count, current_tests_count, data.content_type, data.status]);

  const checklistItems = useMemo(() => {
    const items = [
      data.content.trim().length > 0,
      data.sections.length > 0,
      current_exercises_count > 0 || Number(data.required_exercises) === 0,
      current_tests_count > 0 || Number(data.required_tests) === 0,
      data.status === 'active',
    ];

    return {
      completed: items.filter(Boolean).length,
      total: items.length,
    };
  }, [current_exercises_count, current_tests_count, data.content, data.required_exercises, data.required_tests, data.sections.length, data.status]);

  if (!lesson || !lessonId) {
    return (
      <AuthenticatedLayout user={auth?.user}>
        <Head title="Lesson Not Found" />

        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className={cn(
            'rounded-2xl border p-6',
            isDark ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'
          )}>
            <h2 className="text-lg font-semibold">Lesson not found</h2>
            <p className="mt-2 text-sm">The lesson data could not be loaded for editing.</p>
          </div>

          <Link
            href={safeRoute('admin.lessons.index')}
            className={cn(
              'mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
              isDark ? 'bg-white/5 text-slate-200 hover:bg-white/10' : 'bg-white text-slate-800 hover:bg-slate-50'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lessons
          </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (currentStep !== 2) {
      setCurrentStep(2);
      return;
    }

    put(`/admin/lessons/${lessonId}`, {
      preserveScroll: true,
      onError: (submitErrors) => {
        if (Object.keys(submitErrors).some((key) => ['title', 'content', 'content_type', 'video_url', 'difficulty', 'estimated_duration'].includes(key))) {
          setCurrentStep(1);
          return;
        }

        setCurrentStep(2);
      },
    });
  };

  const addSection = () => {
    const nextSection = {
      id: `new-${Date.now()}`,
      title: '',
      content: '',
      order_index: data.sections.length + 1,
    };

    setData('sections', [...data.sections, nextSection]);
    setExpandedSections((prev) => new Set([...prev, nextSection.id]));
    setCurrentStep(2);
  };

  const updateSection = (index, field, value) => {
    const nextSections = [...data.sections];
    nextSections[index] = {
      ...nextSections[index],
      [field]: value,
    };
    setData('sections', nextSections);
  };

  const removeSection = (index) => {
    const nextSections = data.sections
      .filter((_, itemIndex) => itemIndex !== index)
      .map((section, itemIndex) => ({
        ...section,
        order_index: itemIndex + 1,
      }));

    setData('sections', nextSections);
  };

  const moveSection = (index, direction) => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;

    if (nextIndex < 0 || nextIndex >= data.sections.length) {
      return;
    }

    const nextSections = [...data.sections];
    [nextSections[index], nextSections[nextIndex]] = [nextSections[nextIndex], nextSections[index]];

    setData('sections', nextSections.map((section, itemIndex) => ({
      ...section,
      order_index: itemIndex + 1,
    })));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);

      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }

      return next;
    });
  };

  return (
    <AuthenticatedLayout user={auth?.user}>
      <Head title={`Edit Lesson - ${lesson.title}`} />

      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 animate-fadeIn">
            <Link
              href={safeRoute('admin.lessons.show', lessonId)}
              className={cn(
                'mb-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all hover-lift',
                isDark ? 'text-cyan-400 hover:bg-white/10 hover:text-cyan-300' : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
              )}
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Lesson
            </Link>

            <div className="mb-4 flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 shadow-lg shadow-cyan-500/20">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className={cn(
                  'bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent',
                  isDark ? 'from-cyan-300 to-blue-300' : 'from-cyan-700 to-blue-700'
                )}>
                  Edit Lesson Builder
                </h1>
                <p className={cn('mt-2 text-sm', isDark ? 'text-slate-300' : 'text-gray-600')}>
                  Same lesson builder flow, but tuned for quick refinements after the draft already exists.
                </p>
              </div>
            </div>
          </div>

          <div className={cn(
            'mb-6 rounded-2xl border p-6',
            isDark
              ? 'border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-slate-900/70 to-blue-500/10'
              : 'border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-blue-50 shadow-lg'
          )}>
            <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
              <div>
                <p className={cn('text-xs font-semibold uppercase tracking-[0.22em]', isDark ? 'text-cyan-300' : 'text-cyan-700')}>
                  Editing Flow
                </p>
                <h2 className={cn('mt-2 text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                  Tighten the teaching flow before you publish
                </h2>
                <p className={cn('mt-2 text-sm', isDark ? 'text-slate-300' : 'text-gray-600')}>
                  Keep the lesson foundation on one side and the release structure on the other so the page feels like the same builder, not a different system.
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {steps.map((step) => {
                    const isActive = currentStep === step.id;
                    const isLocked = step.id === 2 && !canContinueToStepTwo;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => !isLocked && setCurrentStep(step.id)}
                        disabled={isLocked}
                        className={cn(
                          'rounded-2xl border p-4 text-left transition-all',
                          isActive
                            ? isDark
                              ? 'border-cyan-400 bg-cyan-500/10'
                              : 'border-cyan-500 bg-cyan-50'
                            : isDark
                              ? 'border-white/10 bg-white/5 hover:border-white/20'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300',
                          isLocked && 'cursor-not-allowed opacity-60'
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                            0{step.id}. {step.title}
                          </span>
                          <span className={cn(
                            'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                            isActive
                              ? isDark
                                ? 'bg-cyan-500/20 text-cyan-200'
                                : 'bg-cyan-100 text-cyan-800'
                              : isDark
                                ? 'bg-white/10 text-slate-300'
                                : 'bg-white text-slate-600'
                          )}>
                            {isLocked ? 'Locked' : isActive ? 'Active' : 'Open'}
                          </span>
                        </div>
                        <p className={cn('mt-2 text-sm', isDark ? 'text-slate-300' : 'text-gray-600')}>
                          {step.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={cn(
                'rounded-2xl border p-5',
                isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
              )}>
                <div className="flex items-center gap-2">
                  <Target className={cn('h-5 w-5', isDark ? 'text-orange-300' : 'text-orange-600')} />
                  <h3 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                    Edit Snapshot
                  </h3>
                </div>

                <div className="mt-4 space-y-3">
                  {summaryItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                      <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>{item.label}</span>
                      <span className={cn('text-right font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={cn(
                  'mt-5 rounded-xl border p-4 text-sm',
                  isDark ? 'border-orange-400/30 bg-orange-400/10 text-slate-100' : 'border-orange-200 bg-orange-50 text-orange-900'
                )}>
                  {checklistItems.completed} of {checklistItems.total} lesson setup checkpoints are currently in good shape.
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] animate-fadeIn">
                <div className={cn(
                  'rounded-2xl border-2 p-8',
                  isDark ? 'border-blue-500/30 bg-slate-900/60' : 'border-blue-200 bg-white shadow-lg'
                )}>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white shadow-md">
                      1
                    </div>
                    <div>
                      <h2 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                        Lesson Foundation
                      </h2>
                      <p className={cn('mt-1 text-sm', isDark ? 'text-slate-400' : 'text-gray-500')}>
                        Refine the lesson title, core teaching material, and format before touching release rules.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                        Lesson Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className={cn(
                          'w-full rounded-xl border-2 px-4 py-3 transition-all focus:outline-none',
                          isDark
                            ? 'border-blue-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:bg-white/10'
                            : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
                          errors.title && (isDark ? 'border-red-500/50' : 'border-red-500')
                        )}
                        placeholder="e.g., Python Loops and Iteration"
                        required
                      />
                      {errors.title && <p className="mt-2 text-sm text-red-400">{errors.title}</p>}
                    </div>

                    <div>
                      <label className={cn('mb-3 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                        Content Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid gap-3 md:grid-cols-3">
                        {contentTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setData('content_type', type.value)}
                            className={cn(
                              'rounded-xl border-2 p-4 text-left transition-all',
                              data.content_type === type.value
                                ? isDark
                                  ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/20'
                                  : 'border-blue-500 bg-blue-50'
                                : isDark
                                  ? 'border-white/10 hover:border-blue-500/50 hover:bg-white/5'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            )}
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <span className={cn('rounded-md px-2 py-1 text-xs font-bold', isDark ? 'bg-white/10 text-cyan-200' : 'bg-white text-blue-700')}>
                                {type.icon}
                              </span>
                              <span className={cn('font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                                {type.label}
                              </span>
                            </div>
                            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-gray-500')}>
                              {type.description}
                            </p>
                          </button>
                        ))}
                      </div>
                      {errors.content_type && <p className="mt-2 text-sm text-red-400">{errors.content_type}</p>}
                    </div>

                    <div>
                      <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                        Lesson Content
                      </label>
                      <textarea
                        rows={14}
                        value={data.content}
                        onChange={(e) => setData('content', e.target.value)}
                        className={cn(
                          'w-full rounded-xl border-2 px-4 py-3 font-mono text-sm transition-all focus:outline-none',
                          isDark
                            ? 'border-blue-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:bg-white/10'
                            : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                        )}
                        placeholder="Write the full teaching content, examples, and explanation here..."
                      />
                      {errors.content && <p className="mt-2 text-sm text-red-400">{errors.content}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className={cn(
                    'rounded-2xl border-2 p-8',
                    isDark ? 'border-purple-500/30 bg-slate-900/60' : 'border-purple-200 bg-white shadow-lg'
                  )}>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 font-bold text-white shadow-md">
                        <Info className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                          Delivery Details
                        </h2>
                        <p className={cn('mt-1 text-sm', isDark ? 'text-slate-400' : 'text-gray-500')}>
                          Keep the support materials and level cues close to the main lesson writing.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                          Difficulty
                        </label>
                        <div className="grid gap-3">
                          {difficulties.map((difficulty) => (
                            <button
                              key={difficulty.value}
                              type="button"
                              onClick={() => setData('difficulty', difficulty.value)}
                              className={cn(
                                'rounded-xl border-2 p-4 text-left transition-all',
                                data.difficulty === difficulty.value
                                  ? isDark
                                    ? 'border-cyan-400 bg-white/10'
                                    : 'border-blue-500 bg-blue-50'
                                  : isDark
                                    ? 'border-white/10 bg-white/5 hover:border-white/20'
                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex h-3 w-3 rounded-full bg-gradient-to-r ${difficulty.accent}`} />
                                <span className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                                  {difficulty.label}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                        {errors.difficulty && <p className="mt-2 text-sm text-red-400">{errors.difficulty}</p>}
                      </div>

                      <div>
                        <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                          Estimated Duration (minutes)
                        </label>
                        <div className="relative">
                          <Clock className={cn('pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2', isDark ? 'text-slate-400' : 'text-gray-400')} />
                          <input
                            type="number"
                            min="1"
                            max="1440"
                            value={data.estimated_duration}
                            onChange={(e) => setData('estimated_duration', e.target.value)}
                            className={cn(
                              'w-full rounded-xl border-2 py-3 pl-11 pr-4 transition-all focus:outline-none',
                              isDark
                                ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400'
                                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                            )}
                            placeholder="30"
                          />
                        </div>
                        {errors.estimated_duration && <p className="mt-2 text-sm text-red-400">{errors.estimated_duration}</p>}
                      </div>

                      <div>
                        <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                          Video URL
                        </label>
                        <div className="relative">
                          <Video className={cn('pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2', isDark ? 'text-slate-400' : 'text-gray-400')} />
                          <input
                            type="url"
                            value={data.video_url}
                            onChange={(e) => setData('video_url', e.target.value)}
                            className={cn(
                              'w-full rounded-xl border-2 py-3 pl-11 pr-4 transition-all focus:outline-none',
                              isDark
                                ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400'
                                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                            )}
                            placeholder="https://..."
                          />
                        </div>
                        {errors.video_url && <p className="mt-2 text-sm text-red-400">{errors.video_url}</p>}
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    'rounded-2xl border p-6',
                    isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                  )}>
                    <div className="flex items-center gap-2">
                      <Sparkles className={cn('h-5 w-5', isDark ? 'text-amber-300' : 'text-amber-600')} />
                      <h3 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                        Foundation Notes
                      </h3>
                    </div>
                    <ul className={cn('mt-4 space-y-2 text-sm leading-6', isDark ? 'text-slate-300' : 'text-gray-600')}>
                      <li>Keep the title outcome-focused so students know what they will master.</li>
                      <li>Use markdown unless you truly need richer HTML formatting.</li>
                      <li>Video is strongest when it supports the lesson, not replaces the written walkthrough.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className={cn(
                    'rounded-2xl border-2 p-8',
                    isDark ? 'border-purple-500/30 bg-slate-900/60' : 'border-purple-200 bg-white shadow-lg'
                  )}>
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 font-bold text-white shadow-md">
                          2
                        </div>
                        <div>
                          <h2 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                            Lesson Sections
                          </h2>
                          <p className={cn('mt-1 text-sm', isDark ? 'text-slate-400' : 'text-gray-500')}>
                            Break the lesson into a clearer guided flow when the topic needs milestones.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={addSection}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600"
                      >
                        <Plus className="h-4 w-4" />
                        Add Section
                      </button>
                    </div>

                    {data.sections.length === 0 ? (
                      <div className={cn(
                        'rounded-2xl border-2 border-dashed p-10 text-center',
                        isDark ? 'border-white/10 bg-white/5 text-slate-400' : 'border-gray-300 bg-gray-50 text-gray-500'
                      )}>
                        <BookOpen className="mx-auto h-12 w-12 opacity-50" />
                        <p className="mt-3 text-sm">No sections yet. Add sections if you want the lesson to feel more guided and scannable.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {data.sections.map((section, index) => (
                          <div
                            key={section.id}
                            className={cn(
                              'rounded-2xl border transition-all',
                              isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                            )}
                          >
                            <div className="flex items-center gap-3 p-4">
                              <div className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold',
                                isDark ? 'bg-cyan-500/20 text-cyan-200' : 'bg-cyan-100 text-cyan-800'
                              )}>
                                {index + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={cn('truncate text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                                  {section.title || `Untitled section ${index + 1}`}
                                </p>
                                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-gray-500')}>
                                  Order {index + 1}
                                </p>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveSection(index, 'up')}
                                  disabled={index === 0}
                                  className={cn(
                                    'rounded-lg p-2 transition-all',
                                    index === 0
                                      ? 'cursor-not-allowed opacity-40'
                                      : isDark
                                        ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                  )}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveSection(index, 'down')}
                                  disabled={index === data.sections.length - 1}
                                  className={cn(
                                    'rounded-lg p-2 transition-all',
                                    index === data.sections.length - 1
                                      ? 'cursor-not-allowed opacity-40'
                                      : isDark
                                        ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                  )}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleSection(section.id)}
                                  className={cn(
                                    'rounded-lg p-2 transition-all',
                                    isDark ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                  )}
                                >
                                  {expandedSections.has(section.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeSection(index)}
                                  className={cn(
                                    'rounded-lg p-2 transition-all',
                                    isDark ? 'text-red-300 hover:bg-red-500/10 hover:text-red-200' : 'text-red-600 hover:bg-red-50'
                                  )}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {expandedSections.has(section.id) && (
                              <div className={cn(
                                'space-y-4 border-t p-4',
                                isDark ? 'border-white/10 bg-slate-950/20' : 'border-gray-200 bg-white'
                              )}>
                                <div>
                                  <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                                    Section Title
                                  </label>
                                  <input
                                    type="text"
                                    value={section.title}
                                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                                    className={cn(
                                      'w-full rounded-xl border-2 px-4 py-3 transition-all focus:outline-none',
                                      isDark
                                        ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400'
                                        : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                                    )}
                                    placeholder="e.g., Concept walkthrough"
                                  />
                                  {errors[`sections.${index}.title`] && <p className="mt-2 text-sm text-red-400">{errors[`sections.${index}.title`]}</p>}
                                </div>

                                <div>
                                  <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                                    Section Content
                                  </label>
                                  <textarea
                                    rows={7}
                                    value={section.content}
                                    onChange={(e) => updateSection(index, 'content', e.target.value)}
                                    className={cn(
                                      'w-full rounded-xl border-2 px-4 py-3 font-mono text-sm transition-all focus:outline-none',
                                      isDark
                                        ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400'
                                        : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                                    )}
                                    placeholder="Write the content for this section..."
                                  />
                                  {errors[`sections.${index}.content`] && <p className="mt-2 text-sm text-red-400">{errors[`sections.${index}.content`]}</p>}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className={cn(
                      'rounded-2xl border-2 p-8',
                      isDark ? 'border-emerald-500/30 bg-slate-900/60' : 'border-emerald-200 bg-white shadow-lg'
                    )}>
                      <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-md">
                          <Settings className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                            Publishing Settings
                          </h2>
                          <p className={cn('mt-1 text-sm', isDark ? 'text-slate-400' : 'text-gray-500')}>
                            Keep reward and completion logic together so release decisions stay clear.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className={cn('mb-3 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                            Status
                          </label>
                          <div className="grid gap-3">
                            {statuses.map((status) => (
                              <button
                                key={status.value}
                                type="button"
                                onClick={() => setData('status', status.value)}
                                className={cn(
                                  'rounded-xl border-2 p-4 text-left transition-all',
                                  data.status === status.value
                                    ? isDark
                                      ? 'border-cyan-400 bg-cyan-500/10'
                                      : 'border-blue-500 bg-blue-50'
                                    : isDark
                                      ? 'border-white/10 bg-white/5 hover:border-white/20'
                                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                )}
                              >
                                <div className={cn('font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                                  {status.label}
                                </div>
                                <div className={cn('mt-1 text-xs', isDark ? 'text-slate-400' : 'text-gray-500')}>
                                  {status.description}
                                </div>
                              </button>
                            ))}
                          </div>
                          {errors.status && <p className="mt-2 text-sm text-red-400">{errors.status}</p>}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <MetricField
                            icon={<Target className="h-4 w-4" />}
                            label="Reward Points"
                            value={data.completion_reward_points}
                            onChange={(value) => setData('completion_reward_points', value)}
                            isDark={isDark}
                            min="0"
                            max="10000"
                          />
                          <MetricField
                            icon={<FileText className="h-4 w-4" />}
                            label="Min Exercise Score (%)"
                            value={data.min_exercise_score_percent}
                            onChange={(value) => setData('min_exercise_score_percent', value)}
                            isDark={isDark}
                            min="0"
                            max="100"
                            step="0.01"
                          />
                          <MetricField
                            icon={<GripVertical className="h-4 w-4" />}
                            label="Required Exercises"
                            value={data.required_exercises}
                            onChange={(value) => setData('required_exercises', value)}
                            isDark={isDark}
                            min="0"
                          />
                          <MetricField
                            icon={<GripVertical className="h-4 w-4" />}
                            label="Required Tests"
                            value={data.required_tests}
                            onChange={(value) => setData('required_tests', value)}
                            isDark={isDark}
                            min="0"
                          />
                        </div>

                        {errors.completion_reward_points && <p className="text-sm text-red-400">{errors.completion_reward_points}</p>}
                        {errors.min_exercise_score_percent && <p className="text-sm text-red-400">{errors.min_exercise_score_percent}</p>}
                        {errors.required_exercises && <p className="text-sm text-red-400">{errors.required_exercises}</p>}
                        {errors.required_tests && <p className="text-sm text-red-400">{errors.required_tests}</p>}
                      </div>
                    </div>

                    <div className={cn(
                      'rounded-2xl border p-6',
                      isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                    )}>
                      <div className="flex items-center gap-2">
                        <Sparkles className={cn('h-5 w-5', isDark ? 'text-amber-300' : 'text-amber-600')} />
                        <h3 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                          Release Notes
                        </h3>
                      </div>
                      <ul className={cn('mt-4 space-y-2 text-sm leading-6', isDark ? 'text-slate-300' : 'text-gray-600')}>
                        <li>Only set the lesson live when the reward and completion gates feel intentional.</li>
                        <li>If a lesson is concept-heavy, sections make the student flow feel lighter.</li>
                        <li>Use required checks to support confidence, not just to add friction.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={cn(
              'sticky bottom-6 z-10 rounded-2xl border-2 p-6 shadow-2xl',
              isDark
                ? 'border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-xl'
                : 'border-gray-200 bg-white'
            )}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className={cn('text-sm', isDark ? 'text-slate-300' : 'text-gray-600')}>
                  {currentStep === 1
                    ? 'Refine the lesson foundation first, then confirm sections and publish rules.'
                    : 'You are on the final edit pass for sections, reward, and release settings.'}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={safeRoute('admin.lessons.show', lessonId)}
                    className={cn(
                      'rounded-xl border-2 px-6 py-3 font-bold transition-all hover-lift',
                      isDark
                        ? 'border-white/20 text-gray-300 hover:bg-white/10 hover:text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    Cancel
                  </Link>

                  {currentStep === 2 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className={cn(
                        'rounded-xl border-2 px-6 py-3 font-bold transition-all hover-lift',
                        isDark
                          ? 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10'
                          : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                      )}
                    >
                      Back to Step 1
                    </button>
                  )}

                  {currentStep === 1 ? (
                    <button
                      key="continue-btn"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentStep(2);
                      }}
                      disabled={!canContinueToStepTwo}
                      className={cn(
                        'rounded-xl px-8 py-3 font-bold text-white shadow-lg transition-all',
                        canContinueToStepTwo
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover-lift hover:from-cyan-400 hover:to-blue-400'
                          : 'cursor-not-allowed bg-gray-400 opacity-70'
                      )}
                    >
                      Continue to Step 2
                    </button>
                  ) : (
                    <button
                      key="save-btn"
                      type="submit"
                      disabled={processing}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-10 py-4 font-bold text-white shadow-lg transition-all hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                      {processing ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.45s ease-out forwards;
        }

        .hover-lift {
          transition: transform 0.2s ease;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </AuthenticatedLayout>
  );
}

function MetricField({ icon, label, value, onChange, isDark, min, max, step }) {
  return (
    <div>
      <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
        <span className="mr-1 inline-flex align-middle">{icon}</span>
        {label}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full rounded-xl border-2 px-4 py-3 transition-all focus:outline-none',
          isDark
            ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400'
            : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
        )}
      />
    </div>
  );
}
