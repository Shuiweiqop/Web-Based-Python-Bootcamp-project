import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Edit,
  FileText,
  Info,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Video,
  Zap,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { safeRoute } from '@/utils/routeHelpers';

const steps = [
  {
    id: 1,
    title: 'Lesson Foundation',
    description: 'Title, content, delivery format, and core teaching material.',
  },
  {
    id: 2,
    title: 'Structure & Publishing',
    description: 'Sections, release status, and completion requirements.',
  },
];

export default function Create({ auth }) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    content: '',
    content_type: 'markdown',
    video_url: '',
    difficulty: 'beginner',
    estimated_duration: 30,
    status: 'draft',
    completion_reward_points: 100,
    required_exercises: 0,
    required_tests: 0,
    min_exercise_score_percent: 70,
    sections: [],
  });

  const [showPreview, setShowPreview] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [isDark, setIsDark] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateTheme();
    window.addEventListener('theme-changed', updateTheme);
    return () => window.removeEventListener('theme-changed', updateTheme);
  }, []);

  const contentTypes = [
    { value: 'text', label: 'Plain Text', icon: 'DOC', description: 'Simple text without formatting' },
    { value: 'markdown', label: 'Markdown', icon: 'MD', description: 'Formatted text with markdown syntax' },
    { value: 'html', label: 'HTML', icon: 'HTML', description: 'Rich HTML content (sanitized)' },
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner', icon: 'Starter' },
    { value: 'intermediate', label: 'Intermediate', icon: 'Builder' },
    { value: 'advanced', label: 'Advanced', icon: 'Expert' },
  ];

  const statuses = [
    { value: 'draft', label: 'Draft', description: 'Not visible to students yet' },
    { value: 'active', label: 'Active', description: 'Ready for students to access' },
    { value: 'inactive', label: 'Inactive', description: 'Temporarily hidden from students' },
  ];

  const canContinueToStepTwo = data.title.trim().length > 0 && data.content.trim().length > 0;
  const stepOneComplete = canContinueToStepTwo;
  const stepTwoReady = data.status && data.estimated_duration > 0;

  const summaryItems = [
    { label: 'Content type', value: contentTypes.find((type) => type.value === data.content_type)?.label || 'Not set' },
    { label: 'Sections', value: data.sections.length > 0 ? `${data.sections.length} added` : 'No sections yet' },
    { label: 'Status', value: statuses.find((status) => status.value === data.status)?.label || 'Not set' },
    { label: 'Points', value: `${data.completion_reward_points || 0} pts` },
  ];

  const goToStep = (step) => {
    if (step === 2 && !canContinueToStepTwo) {
      return;
    }

    setCurrentStep(step);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(safeRoute('admin.lessons.store'), {
      preserveScroll: true,
      onSuccess: () => {
        console.log('Lesson created successfully');
      },
      onError: (submitErrors) => {
        if (
          Object.keys(submitErrors).some((key) =>
            ['title', 'content', 'content_type', 'video_url', 'difficulty', 'estimated_duration'].includes(key)
          )
        ) {
          setCurrentStep(1);
        } else {
          setCurrentStep(2);
        }
      },
    });
  };

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: '',
      content: '',
      order_index: data.sections.length + 1,
    };

    setData('sections', [...data.sections, newSection]);
    setExpandedSections(new Set([...expandedSections, newSection.id]));
    setCurrentStep(2);
  };

  const removeSection = (index) => {
    const nextSections = data.sections.filter((_, i) => i !== index);
    nextSections.forEach((section, i) => {
      section.order_index = i + 1;
    });
    setData('sections', nextSections);
  };

  const updateSection = (index, field, value) => {
    const nextSections = [...data.sections];
    nextSections[index][field] = value;
    setData('sections', nextSections);
  };

  const moveSection = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === data.sections.length - 1)
    ) {
      return;
    }

    const nextSections = [...data.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [nextSections[index], nextSections[targetIndex]] = [nextSections[targetIndex], nextSections[index]];

    nextSections.forEach((section, i) => {
      section.order_index = i + 1;
    });

    setData('sections', nextSections);
  };

  const toggleSection = (id) => {
    const nextExpanded = new Set(expandedSections);
    if (nextExpanded.has(id)) {
      nextExpanded.delete(id);
    } else {
      nextExpanded.add(id);
    }
    setExpandedSections(nextExpanded);
  };

  return (
    <AuthenticatedLayout user={auth?.user}>
      <Head title="Create Lesson" />

      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 animate-fadeIn">
            <Link
              href={safeRoute('admin.lessons.index')}
              className={cn(
                'mb-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all hover-lift ripple-effect',
                isDark ? 'text-cyan-400 hover:bg-white/10 hover:text-cyan-300' : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
              )}
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Lessons
            </Link>

            <div className="mb-4 flex items-center gap-4">
              <div className="animate-glowPulse rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg shadow-blue-500/30">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1
                  className={cn(
                    'bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent',
                    isDark ? 'from-blue-400 to-indigo-400' : 'from-blue-600 to-indigo-600'
                  )}
                >
                  Create New Lesson
                </h1>
                <p className={cn('mt-2 text-sm', isDark ? 'text-gray-300' : 'text-gray-600')}>
                  Turn the long admin form into a guided two-step flow so the important release settings are harder to miss.
                </p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'mb-6 rounded-2xl border-2 p-6 animate-fadeIn animation-delay-200 card-hover-effect',
              isDark
                ? 'glassmorphism-enhanced border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10'
                : 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
            )}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <Zap className={cn('h-6 w-6', isDark ? 'text-purple-400' : 'text-purple-600')} />
                  <h3 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                    Try AI-Assisted Lesson Creation
                  </h3>
                </div>
                <p className={cn('mb-4 text-sm', isDark ? 'text-gray-300' : 'text-gray-600')}>
                  Start with AI when you want a draft fast, or stay here for a more deliberate manual setup.
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  {[
                    { text: 'Saves 60-70% time', tone: isDark ? 'text-green-400' : 'text-green-600' },
                    { text: 'Structured content', tone: isDark ? 'text-blue-400' : 'text-blue-600' },
                    { text: 'Fully editable', tone: isDark ? 'text-purple-400' : 'text-purple-600' },
                  ].map((item) => (
                    <span
                      key={item.text}
                      className={cn('inline-flex items-center rounded-lg px-3 py-1.5 font-medium', isDark ? 'bg-white/10' : 'bg-white', item.tone)}
                    >
                      {item.text}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href={safeRoute('admin.ai-lessons.create')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover-lift hover:from-purple-600 hover:to-pink-600 hover:shadow-xl"
              >
                <Sparkles className="h-5 w-5" />
                Create with AI
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={cn(
                'rounded-2xl border-2 p-6 animate-fadeIn animation-delay-400',
                isDark ? 'glassmorphism-enhanced border-blue-500/30' : 'border-blue-200 bg-white shadow-lg'
              )}
            >
              <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
                <div>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className={cn('text-xs font-semibold uppercase tracking-[0.18em]', isDark ? 'text-cyan-300' : 'text-blue-600')}>
                        Guided Admin Flow
                      </p>
                      <h2 className={cn('mt-2 text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                        Build first, publish second
                      </h2>
                      <p className={cn('mt-2 text-sm', isDark ? 'text-gray-300' : 'text-gray-600')}>
                        Step 1 focuses on the teaching material. Step 2 collects sections and release rules so admins do not overlook them.
                      </p>
                    </div>
                    <div className={cn('rounded-xl px-4 py-3 text-sm font-semibold', isDark ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-700')}>
                      Step {currentStep} of {steps.length}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {steps.map((step) => {
                      const isActive = currentStep === step.id;
                      const isLocked = step.id === 2 && !canContinueToStepTwo;
                      const isDone = step.id === 1 ? stepOneComplete : stepTwoReady;

                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => goToStep(step.id)}
                          disabled={isLocked}
                          className={cn(
                            'rounded-2xl border-2 p-4 text-left transition-all',
                            isActive
                              ? isDark
                                ? 'border-cyan-400 bg-cyan-500/10'
                                : 'border-blue-500 bg-blue-50'
                              : isDark
                                ? 'border-white/10 bg-white/5 hover:border-white/20'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300',
                            isLocked && 'cursor-not-allowed opacity-60'
                          )}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                              0{step.id}. {step.title}
                            </span>
                            <span
                              className={cn(
                                'rounded-full px-2.5 py-1 text-xs font-semibold',
                                isDone
                                  ? isDark
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-emerald-100 text-emerald-700'
                                  : isDark
                                    ? 'bg-white/10 text-gray-300'
                                    : 'bg-white text-gray-600'
                              )}
                            >
                              {isDone ? 'Ready' : isLocked ? 'Locked' : 'In Progress'}
                            </span>
                          </div>
                          <p className={cn('text-sm', isDark ? 'text-gray-300' : 'text-gray-600')}>{step.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  className={cn(
                    'rounded-2xl border p-5',
                    isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                  )}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Target className={cn('h-5 w-5', isDark ? 'text-orange-300' : 'text-orange-600')} />
                    <h3 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                      Admin Summary
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {summaryItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{item.label}</span>
                        <span className={cn('font-semibold text-right', isDark ? 'text-white' : 'text-gray-900')}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className={cn(
                      'mt-5 rounded-xl border p-4 text-sm',
                      isDark
                        ? 'border-orange-400/30 bg-orange-400/12 text-white shadow-[0_0_0_1px_rgba(251,146,60,0.08)]'
                        : 'border-orange-200 bg-orange-50 text-orange-900'
                    )}
                  >
                    Review Step 2 before publishing. That is where admins usually miss reward points, required tests, or draft status.
                  </div>
                </div>
              </div>
            </div>

            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div
                  className={cn(
                    'rounded-2xl border-2 p-8 card-hover-effect',
                    isDark ? 'glassmorphism-enhanced border-blue-500/30' : 'border-blue-200 bg-white shadow-lg'
                  )}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white shadow-md">
                      1
                    </div>
                    <div>
                      <h2 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                        Lesson Foundation
                      </h2>
                      <p className={cn('mt-1 text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                        Give admins one place to finish the actual lesson material before they think about publishing rules.
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
                        placeholder="e.g., Introduction to Python Programming"
                        required
                      />
                      {errors.title && (
                        <p className="mt-2 animate-shake text-sm text-red-400">{errors.title}</p>
                      )}
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
                              <span className={cn('font-bold', isDark ? 'text-white' : 'text-gray-900')}>{type.label}</span>
                            </div>
                            <p className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>{type.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className={cn('block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                          Lesson Content <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPreview(!showPreview)}
                          className={cn(
                            'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                            isDark
                              ? 'text-cyan-400 hover:bg-white/10 hover:text-cyan-300'
                              : 'text-blue-600 hover:bg-blue-100 hover:text-blue-800'
                          )}
                        >
                          {showPreview ? (
                            <>
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              Preview
                            </>
                          )}
                        </button>
                      </div>

                      {!showPreview ? (
                        <textarea
                          value={data.content}
                          onChange={(e) => setData('content', e.target.value)}
                          rows={14}
                          className={cn(
                            'w-full rounded-xl border-2 px-4 py-3 font-mono text-sm transition-all focus:outline-none',
                            isDark
                              ? 'border-blue-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:bg-white/10'
                              : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
                            errors.content && (isDark ? 'border-red-500/50' : 'border-red-500')
                          )}
                          placeholder={
                            data.content_type === 'markdown'
                              ? '# Write your lesson content here\n\nSupports headings, lists, code, and emphasis.'
                              : data.content_type === 'html'
                                ? '<h1>Write HTML here</h1>\n<p>Content will be sanitized for security.</p>'
                                : 'Write your lesson content here...'
                          }
                          required
                        />
                      ) : (
                        <div
                          className={cn(
                            'min-h-[320px] rounded-xl border-2 p-6',
                            isDark ? 'border-blue-500/30 bg-white/5' : 'border-gray-300 bg-gray-50'
                          )}
                        >
                          {data.content ? (
                            <div className={cn('whitespace-pre-wrap text-sm', isDark ? 'text-gray-300' : 'text-gray-700')}>
                              {data.content}
                            </div>
                          ) : (
                            <p className={cn('italic', isDark ? 'text-gray-500' : 'text-gray-400')}>
                              Preview will appear here once content is added.
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {data.content_type === 'markdown'
                            ? 'Markdown is recommended for admin-friendly editing.'
                            : data.content_type === 'html'
                              ? 'HTML will still be sanitized for safety.'
                              : 'Plain text keeps the lesson simple.'}
                        </span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {data.content.length} characters
                        </span>
                      </div>

                      {errors.content && <p className="mt-2 text-sm text-red-400">{errors.content}</p>}
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    'rounded-2xl border-2 p-8 card-hover-effect',
                    isDark ? 'glassmorphism-enhanced border-green-500/30' : 'border-green-200 bg-white shadow-lg'
                  )}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 font-bold text-white shadow-md">
                      A
                    </div>
                    <div>
                      <h2 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                        Delivery Details
                      </h2>
                      <p className={cn('mt-1 text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                        Keep the teaching setup together so admins can sanity-check the lesson before moving on.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className={cn('mb-2 flex items-center gap-1 text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                        <Video className="h-4 w-4" />
                        Video URL
                      </label>
                      <input
                        type="url"
                        value={data.video_url}
                        onChange={(e) => setData('video_url', e.target.value)}
                        className={cn(
                          'w-full rounded-xl border-2 px-4 py-3 transition-all focus:outline-none',
                          isDark
                            ? 'border-green-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-emerald-400'
                            : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-green-500'
                        )}
                        placeholder="https://www.youtube.com/embed/..."
                      />
                      {errors.video_url && <p className="mt-2 text-sm text-red-400">{errors.video_url}</p>}
                    </div>

                    <div>
                      <label className={cn('mb-2 flex items-center gap-1 text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                        <Clock className="h-4 w-4" />
                        Estimated Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={data.estimated_duration}
                        onChange={(e) => setData('estimated_duration', parseInt(e.target.value, 10) || 0)}
                        className={cn(
                          'w-full rounded-xl border-2 px-4 py-3 transition-all focus:outline-none',
                          isDark
                            ? 'border-green-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-emerald-400'
                            : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-green-500'
                        )}
                        min="1"
                        max="1440"
                        placeholder="30"
                      />
                      {errors.estimated_duration && <p className="mt-2 text-sm text-red-400">{errors.estimated_duration}</p>}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className={cn('mb-3 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                      Difficulty Level <span className="text-red-500">*</span>
                    </label>
                    <div className="grid gap-3 md:grid-cols-3">
                      {difficulties.map((diff) => {
                        const isSelected = data.difficulty === diff.value;
                        return (
                          <button
                            key={diff.value}
                            type="button"
                            onClick={() => setData('difficulty', diff.value)}
                            className={cn(
                              'rounded-xl border-2 p-4 text-left transition-all',
                              isSelected
                                ? isDark
                                  ? 'border-emerald-400 bg-emerald-500/15 text-white'
                                  : 'border-emerald-500 bg-emerald-50 text-emerald-900'
                                : isDark
                                  ? 'border-white/10 text-gray-300 hover:border-green-500/50 hover:bg-white/5'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            )}
                          >
                            <div className="text-sm font-bold">{diff.label}</div>
                            <div className={cn('mt-1 text-xs', isSelected ? 'opacity-90' : isDark ? 'text-gray-400' : 'text-gray-500')}>
                              {diff.icon}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {errors.difficulty && <p className="mt-2 text-sm text-red-400">{errors.difficulty}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div
                  className={cn(
                    'rounded-2xl border-2 p-8 card-hover-effect',
                    isDark ? 'glassmorphism-enhanced border-purple-500/30' : 'border-purple-200 bg-white shadow-lg'
                  )}
                >
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 font-bold text-white shadow-md">
                        2
                      </div>
                      <div>
                        <h2 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                          Lesson Sections
                        </h2>
                        <p className={cn('mt-1 text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                          Optional, but useful when admins want a clear section-by-section teaching flow.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={addSection}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-semibold text-white shadow-md transition-all hover-lift hover:from-purple-600 hover:to-pink-600"
                    >
                      <Plus className="h-4 w-4" />
                      Add Section
                    </button>
                  </div>

                  {data.sections.length === 0 ? (
                    <div
                      className={cn(
                        'rounded-xl border-2 border-dashed py-12 text-center',
                        isDark ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-300 bg-purple-50'
                      )}
                    >
                      <FileText className={cn('mx-auto mb-4 h-14 w-14', isDark ? 'text-purple-400' : 'text-purple-500')} />
                      <p className={cn('mb-2 font-semibold', isDark ? 'text-gray-300' : 'text-gray-700')}>
                        No sections yet
                      </p>
                      <p className={cn('mb-4 text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                        Keep it simple with one lesson body, or add sections to guide admins and students through smaller chunks.
                      </p>
                      <button
                        type="button"
                        onClick={addSection}
                        className={cn('font-semibold', isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-700 hover:text-purple-900')}
                      >
                        Add your first section
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.sections.map((section, index) => (
                        <div
                          key={section.id}
                          className={cn('overflow-hidden rounded-xl border-2', isDark ? 'border-purple-500/30' : 'border-purple-200')}
                        >
                          <div
                            className={cn(
                              'flex cursor-pointer items-center justify-between p-4 transition-all',
                              isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-purple-50 hover:bg-purple-100'
                            )}
                            onClick={() => toggleSection(section.id)}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <span className={cn('font-bold', isDark ? 'text-purple-300' : 'text-purple-700')}>
                                Section {index + 1}
                              </span>
                              <span className={cn('truncate text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                                {section.title || 'Untitled Section'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveSection(index, 'up');
                                }}
                                disabled={index === 0}
                                className={cn(
                                  'rounded p-1 transition-all',
                                  index === 0
                                    ? 'cursor-not-allowed opacity-30'
                                    : isDark
                                      ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                                      : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                                )}
                              >
                                <ChevronUp className="h-5 w-5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveSection(index, 'down');
                                }}
                                disabled={index === data.sections.length - 1}
                                className={cn(
                                  'rounded p-1 transition-all',
                                  index === data.sections.length - 1
                                    ? 'cursor-not-allowed opacity-30'
                                    : isDark
                                      ? 'text-gray-400 hover:bg-white/10 hover:text-white'
                                      : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                                )}
                              >
                                <ChevronDown className="h-5 w-5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Delete this section?')) {
                                    removeSection(index);
                                  }
                                }}
                                className={cn('rounded p-1 text-red-500 transition-all', isDark ? 'hover:bg-red-500/10 hover:text-red-400' : 'hover:bg-red-50 hover:text-red-600')}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>

                          {expandedSections.has(section.id) && (
                            <div className={cn('space-y-4 p-4', isDark ? 'bg-white/5' : 'bg-white')}>
                              <div>
                                <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-300' : 'text-gray-700')}>
                                  Section Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={section.title}
                                  onChange={(e) => updateSection(index, 'title', e.target.value)}
                                  className={cn(
                                    'w-full rounded-xl border-2 px-4 py-2 transition-all focus:outline-none',
                                    isDark
                                      ? 'border-purple-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-pink-400'
                                      : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-purple-500'
                                  )}
                                  placeholder="e.g., Introduction, Demo, Wrap-up"
                                  required
                                />
                                {errors[`sections.${index}.title`] && <p className="mt-2 text-sm text-red-400">{errors[`sections.${index}.title`]}</p>}
                              </div>

                              <div>
                                <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-300' : 'text-gray-700')}>
                                  Section Content <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                  value={section.content}
                                  onChange={(e) => updateSection(index, 'content', e.target.value)}
                                  rows={6}
                                  className={cn(
                                    'w-full rounded-xl border-2 px-4 py-2 font-mono text-sm transition-all focus:outline-none',
                                    isDark
                                      ? 'border-purple-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-pink-400'
                                      : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-purple-500'
                                  )}
                                  placeholder="Write the content for this section..."
                                  required
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

                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                  <div
                    className={cn(
                      'rounded-2xl border-2 p-8 card-hover-effect',
                      isDark ? 'glassmorphism-enhanced border-green-500/30' : 'border-green-200 bg-white shadow-lg'
                    )}
                  >
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 font-bold text-white shadow-md">
                        3
                      </div>
                      <div>
                        <h2 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                          Publishing Settings
                        </h2>
                        <p className={cn('mt-1 text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                          Keep the release controls together so admin checks happen right before submit.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className={cn('mb-3 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                          Status <span className="text-red-500">*</span>
                        </label>
                        <div className="grid gap-3 md:grid-cols-3">
                          {statuses.map((status) => (
                            <button
                              key={status.value}
                              type="button"
                              onClick={() => setData('status', status.value)}
                              className={cn(
                                'rounded-xl border-2 p-4 text-left transition-all',
                                data.status === status.value
                                  ? isDark
                                    ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/20'
                                    : 'border-blue-500 bg-blue-50'
                                  : isDark
                                    ? 'border-white/10 hover:border-green-500/50 hover:bg-white/5'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              )}
                            >
                              <div className={cn('font-bold', isDark ? 'text-white' : 'text-gray-900')}>{status.label}</div>
                              <div className={cn('mt-2 text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>
                                {status.description}
                              </div>
                            </button>
                          ))}
                        </div>
                        {errors.status && <p className="mt-2 text-sm text-red-400">{errors.status}</p>}
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                            Completion Reward Points
                          </label>
                          <input
                            type="number"
                            value={data.completion_reward_points}
                            onChange={(e) => setData('completion_reward_points', parseInt(e.target.value, 10) || 0)}
                            className={cn(
                              'w-full rounded-xl border-2 px-4 py-3 transition-all focus:outline-none',
                              isDark
                                ? 'border-green-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-emerald-400'
                                : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-green-500'
                            )}
                            min="0"
                            max="10000"
                          />
                          {errors.completion_reward_points && <p className="mt-2 text-sm text-red-400">{errors.completion_reward_points}</p>}
                        </div>

                        <div>
                          <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                            Minimum Exercise Score (%)
                          </label>
                          <input
                            type="number"
                            value={data.min_exercise_score_percent}
                            onChange={(e) => setData('min_exercise_score_percent', parseFloat(e.target.value) || 0)}
                            className={cn(
                              'w-full rounded-xl border-2 px-4 py-3 transition-all focus:outline-none',
                              isDark
                                ? 'border-green-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-emerald-400'
                                : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-green-500'
                            )}
                            min="0"
                            max="100"
                            step="0.01"
                          />
                          {errors.min_exercise_score_percent && <p className="mt-2 text-sm text-red-400">{errors.min_exercise_score_percent}</p>}
                        </div>

                        <div>
                          <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                            Required Exercises
                          </label>
                          <input
                            type="number"
                            value={data.required_exercises}
                            onChange={(e) => setData('required_exercises', parseInt(e.target.value, 10) || 0)}
                            className={cn(
                              'w-full rounded-xl border-2 px-4 py-3 transition-all focus:outline-none',
                              isDark
                                ? 'border-green-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-emerald-400'
                                : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-green-500'
                            )}
                            min="0"
                          />
                          {errors.required_exercises && <p className="mt-2 text-sm text-red-400">{errors.required_exercises}</p>}
                        </div>

                        <div>
                          <label className={cn('mb-2 block text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-900')}>
                            Required Tests
                          </label>
                          <input
                            type="number"
                            value={data.required_tests}
                            onChange={(e) => setData('required_tests', parseInt(e.target.value, 10) || 0)}
                            className={cn(
                              'w-full rounded-xl border-2 px-4 py-3 transition-all focus:outline-none',
                              isDark
                                ? 'border-green-500/30 bg-white/5 text-white placeholder:text-gray-400 focus:border-emerald-400'
                                : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-green-500'
                            )}
                            min="0"
                          />
                          {errors.required_tests && <p className="mt-2 text-sm text-red-400">{errors.required_tests}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'rounded-2xl border-2 p-8 card-hover-effect',
                      isDark ? 'glassmorphism-enhanced border-orange-500/30' : 'border-orange-200 bg-white shadow-lg'
                    )}
                  >
                    <div className="mb-6 flex items-center gap-3">
                      <Info className={cn('h-6 w-6', isDark ? 'text-orange-300' : 'text-orange-600')} />
                      <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                        Final Admin Check
                      </h2>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className={cn('rounded-xl p-4', isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-50 text-gray-700')}>
                        <p className="font-semibold">Before you create this lesson</p>
                        <ul className="mt-3 space-y-2">
                          <li>Make sure the status is still `Draft` if the lesson is not ready for students.</li>
                          <li>Double-check reward points and score thresholds so students are gated correctly.</li>
                          <li>Use sections only if they help the learning flow feel clearer.</li>
                        </ul>
                      </div>

                      <div
                        className={cn(
                          'rounded-xl border p-4',
                          isDark
                            ? 'border-orange-400/30 bg-orange-400/12 text-white shadow-[0_0_0_1px_rgba(251,146,60,0.08)]'
                            : 'border-orange-200 bg-orange-50 text-orange-900'
                        )}
                      >
                        Students will now follow your guided lesson flow, so these completion settings affect what unlocks next.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              className={cn(
                'sticky bottom-6 z-10 rounded-2xl border-2 p-6 shadow-2xl animate-slideUp',
                isDark
                  ? 'glassmorphism-enhanced border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10'
                  : 'border-gray-200 bg-white'
              )}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className={cn('text-sm', isDark ? 'text-gray-300' : 'text-gray-600')}>
                  {currentStep === 1
                    ? 'Finish the lesson foundation first, then continue to publishing rules.'
                    : 'This is the final admin check before the lesson is created.'}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={safeRoute('admin.lessons.index')}
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
                      type="button"
                      onClick={() => setCurrentStep(2)}
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
                      type="submit"
                      disabled={processing}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-10 py-4 font-bold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50',
                        isDark
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 glow-on-hover'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700'
                      )}
                    >
                      <BookOpen className="h-5 w-5" />
                      {processing ? 'Creating...' : 'Create Lesson'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }

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

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }

        .animate-glowPulse {
          animation: glowPulse 2s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .glassmorphism-enhanced {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .hover-lift {
          transition: transform 0.2s ease;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }

        .card-hover-effect {
          transition: all 0.3s ease;
        }

        .card-hover-effect:hover {
          transform: translateY(-2px);
        }

        .ripple-effect {
          position: relative;
          overflow: hidden;
        }

        .ripple-effect:active::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out;
        }

        @keyframes ripple {
          to {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        .glow-on-hover:hover {
          box-shadow: 0 0 30px rgba(34, 211, 238, 0.4);
        }
      `}</style>
    </AuthenticatedLayout>
  );
}
