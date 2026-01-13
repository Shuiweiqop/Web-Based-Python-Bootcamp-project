// resources/js/Pages/Admin/Lessons/Create.jsx
import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  ArrowLeft,
  FileText,
  Clock,
  GraduationCap,
  Video,
  Info,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Eye,
  Edit,
  BookOpen,
  Award,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { safeRoute } from '@/utils/routeHelpers';

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

  // 监听主题变化
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    updateTheme();
    window.addEventListener('theme-changed', updateTheme);
    return () => window.removeEventListener('theme-changed', updateTheme);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(safeRoute('admin.lessons.store'), {
      preserveScroll: true,
      onSuccess: () => {
        console.log('Lesson created successfully');
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
      },
    });
  };

  // Section 管理函数
  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: '',
      content: '',
      order_index: data.sections.length + 1,
    };
    setData('sections', [...data.sections, newSection]);
    setExpandedSections(new Set([...expandedSections, newSection.id]));
  };

  const removeSection = (index) => {
    const newSections = data.sections.filter((_, i) => i !== index);
    newSections.forEach((section, i) => {
      section.order_index = i + 1;
    });
    setData('sections', newSections);
  };

  const updateSection = (index, field, value) => {
    const newSections = [...data.sections];
    newSections[index][field] = value;
    setData('sections', newSections);
  };

  const moveSection = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === data.sections.length - 1)
    ) {
      return;
    }

    const newSections = [...data.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];

    newSections.forEach((section, i) => {
      section.order_index = i + 1;
    });

    setData('sections', newSections);
  };

  const toggleSection = (id) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const contentTypes = [
    { value: 'text', label: 'Plain Text', icon: '📄', description: 'Simple text without formatting' },
    { value: 'markdown', label: 'Markdown', icon: '📝', description: 'Formatted text with markdown syntax' },
    { value: 'html', label: 'HTML', icon: '💻', description: 'Rich HTML content (sanitized)' },
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner', icon: '🌱' },
    { value: 'intermediate', label: 'Intermediate', icon: '⚡' },
    { value: 'advanced', label: 'Advanced', icon: '🔥' },
  ];

  const statuses = [
    { value: 'draft', label: 'Draft', icon: '📝', description: 'Not visible to students' },
    { value: 'active', label: 'Active', icon: '✅', description: 'Visible and accessible' },
    { value: 'inactive', label: 'Inactive', icon: '❌', description: 'Hidden from students' },
  ];

  return (
    <AuthenticatedLayout user={auth?.user}>
      <Head title="Create Lesson" />

      <div className="py-12 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 animate-fadeIn">
            <Link
              href={safeRoute('admin.lessons.index')}
              className={cn(
                "inline-flex items-center gap-2 font-medium mb-6 transition-all hover-lift ripple-effect px-4 py-2 rounded-lg",
                isDark 
                  ? "text-cyan-400 hover:text-cyan-300 hover:bg-white/10" 
                  : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Lessons
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30 animate-glowPulse">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className={cn(
                "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                isDark 
                  ? "from-blue-400 to-indigo-400" 
                  : "from-blue-600 to-indigo-600"
              )}>
                Create New Lesson
              </h1>
            </div>
          </div>

          {/* AI Banner */}
          <div className={cn(
            "mb-6 rounded-2xl border-2 p-6 card-hover-effect animate-fadeIn animation-delay-200",
            isDark
              ? "glassmorphism-enhanced border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
              : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-lg"
          )}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className={cn(
                    "h-6 w-6",
                    isDark ? "text-purple-400" : "text-purple-600"
                  )} />
                  <h3 className={cn(
                    "text-xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    Try AI-Assisted Lesson Creation
                  </h3>
                </div>
                <p className={cn(
                  "text-sm mb-4",
                  isDark ? "text-gray-300" : "text-gray-600"
                )}>
                  Let AI generate a structured lesson draft in seconds. You can review and edit before saving.
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  {[
                    { icon: '⏱️', text: 'Saves 60-70% time', color: isDark ? 'text-green-400' : 'text-green-600' },
                    { icon: '📋', text: 'Structured content', color: isDark ? 'text-blue-400' : 'text-blue-600' },
                    { icon: '✏️', text: 'Fully editable', color: isDark ? 'text-purple-400' : 'text-purple-600' },
                  ].map((item, idx) => (
                    <span key={idx} className={cn(
                      "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium",
                      isDark ? "bg-white/10" : "bg-white",
                      item.color
                    )}>
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href={safeRoute('admin.ai-lessons.create')}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl ripple-effect hover-lift",
                  "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                )}
              >
                <Sparkles className="w-5 h-5" />
                Create with AI
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className={cn(
              "rounded-2xl border-2 p-8 card-hover-effect animate-fadeIn animation-delay-400",
              isDark 
                ? "glassmorphism-enhanced border-blue-500/30" 
                : "bg-white border-blue-200 shadow-lg"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                  1
                </div>
                <h2 className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  Basic Information
                </h2>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-2",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    Lesson Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all",
                      isDark
                        ? "bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:bg-white/10"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                      errors.title && (isDark ? "border-red-500/50" : "border-red-500")
                    )}
                    placeholder="e.g., Introduction to Python Programming"
                    required
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-shake">
                      <span>⚠️</span> {errors.title}
                    </p>
                  )}
                </div>

                {/* Content Type */}
                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-3",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    Content Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {contentTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setData('content_type', type.value)}
                        className={cn(
                          "p-4 border-2 rounded-xl text-left transition-all card-hover-effect ripple-effect",
                          data.content_type === type.value
                            ? isDark
                              ? "border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                              : "border-blue-500 bg-blue-50"
                            : isDark
                              ? "border-white/10 hover:border-blue-500/50 hover:bg-white/5"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{type.icon}</span>
                          <div className={cn(
                            "font-bold",
                            isDark ? "text-white" : "text-gray-900"
                          )}>
                            {type.label}
                          </div>
                        </div>
                        <div className={cn(
                          "text-xs",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          {type.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={cn(
                      "block text-sm font-bold",
                      isDark ? "text-gray-200" : "text-gray-900"
                    )}>
                      Lesson Content
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={cn(
                        "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ripple-effect",
                        isDark
                          ? "text-cyan-400 hover:text-cyan-300 hover:bg-white/10"
                          : "text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                      )}
                    >
                      {showPreview ? (
                        <>
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Preview
                        </>
                      )}
                    </button>
                  </div>

                  {!showPreview ? (
                    <textarea
                      value={data.content}
                      onChange={(e) => setData('content', e.target.value)}
                      rows={12}
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl focus:outline-none font-mono text-sm transition-all",
                        isDark
                          ? "bg-white/5 border-blue-500/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:bg-white/10"
                          : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                        errors.content && (isDark ? "border-red-500/50" : "border-red-500")
                      )}
                      placeholder={
                        data.content_type === 'markdown'
                          ? '# Write your lesson content here\n\nSupports **bold**, *italic*, `code`, and more!'
                          : data.content_type === 'html'
                          ? '<h1>Write HTML here</h1>\n<p>Content will be sanitized for security.</p>'
                          : 'Write your lesson content here...'
                      }
                    />
                  ) : (
                    <div className={cn(
                      "border-2 rounded-xl p-6 min-h-[300px]",
                      isDark
                        ? "bg-white/5 border-blue-500/30"
                        : "bg-gray-50 border-gray-300"
                    )}>
                      <div className="prose prose-sm max-w-none">
                        {data.content ? (
                          data.content_type === 'markdown' ? (
                            <div className={cn(
                              "whitespace-pre-wrap",
                              isDark ? "text-gray-300" : "text-gray-700"
                            )}>
                              {data.content}
                            </div>
                          ) : data.content_type === 'html' ? (
                            <div 
                              className={isDark ? "text-gray-300" : "text-gray-700"}
                              dangerouslySetInnerHTML={{ __html: data.content }} 
                            />
                          ) : (
                            <div className={cn(
                              "whitespace-pre-wrap",
                              isDark ? "text-gray-300" : "text-gray-700"
                            )}>
                              {data.content}
                            </div>
                          )
                        ) : (
                          <p className={cn(
                            "italic",
                            isDark ? "text-gray-500" : "text-gray-400"
                          )}>
                            No content to preview
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {errors.content && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-shake">
                      <span>⚠️</span> {errors.content}
                    </p>
                  )}

                  <div className={cn(
                    "mt-3 flex items-start gap-2 text-xs p-3 rounded-lg border-2",
                    isDark
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                      : "bg-blue-50 border-blue-200 text-blue-800"
                  )}>
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      {data.content_type === 'markdown' && (
                        <span>Use markdown syntax: **bold**, *italic*, `code`, [links](url), etc.</span>
                      )}
                      {data.content_type === 'html' && (
                        <span>HTML will be sanitized to prevent XSS attacks. Scripts and iframes are blocked.</span>
                      )}
                      {data.content_type === 'text' && (
                        <span>Plain text will be displayed as-is without any formatting.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className={cn(
              "rounded-2xl border-2 p-8 card-hover-effect animate-fadeIn animation-delay-600",
              isDark 
                ? "glassmorphism-enhanced border-purple-500/30" 
                : "bg-white border-purple-200 shadow-lg"
            )}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                    2
                  </div>
                  <h2 className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    Lesson Sections <span className={cn(
                      "text-sm font-normal ml-2",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>(Optional)</span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addSection}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 font-semibold rounded-xl transition-all ripple-effect hover-lift shadow-md",
                    isDark
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
              </div>

              {data.sections.length === 0 ? (
                <div className={cn(
                  "text-center py-12 rounded-xl border-2 border-dashed",
                  isDark
                    ? "bg-purple-500/5 border-purple-500/30"
                    : "bg-purple-50 border-purple-300"
                )}>
                  <FileText className={cn(
                    "w-16 h-16 mx-auto mb-4",
                    isDark ? "text-purple-400" : "text-purple-400"
                  )} />
                  <p className={cn(
                    "mb-2 font-semibold",
                    isDark ? "text-gray-300" : "text-gray-600"
                  )}>
                    No sections yet
                  </p>
                  <p className={cn(
                    "text-sm mb-4",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Add sections to break your lesson into organized parts
                  </p>
                  <button
                    type="button"
                    onClick={addSection}
                    className={cn(
                      "font-semibold transition-colors",
                      isDark
                        ? "text-purple-400 hover:text-purple-300"
                        : "text-purple-600 hover:text-purple-800"
                    )}
                  >
                    Add your first section
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.sections.map((section, index) => (
                    <div
                      key={section.id}
                      className={cn(
                        "rounded-xl border-2 overflow-hidden",
                        isDark
                          ? "border-purple-500/30"
                          : "border-purple-200"
                      )}
                    >
                      {/* Section Header */}
                      <div
                        className={cn(
                          "flex items-center justify-between p-4 cursor-pointer transition-all",
                          isDark
                            ? "bg-white/5 hover:bg-white/10"
                            : "bg-purple-50 hover:bg-purple-100"
                        )}
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={cn(
                            "font-bold",
                            isDark ? "text-purple-400" : "text-purple-700"
                          )}>
                            Section {index + 1}
                          </span>
                          <span className={cn(
                            "text-sm truncate",
                            isDark ? "text-gray-400" : "text-gray-600"
                          )}>
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
                              "p-1 rounded transition-all",
                              index === 0
                                ? "opacity-30 cursor-not-allowed"
                                : isDark
                                  ? "text-gray-400 hover:text-white hover:bg-white/10"
                                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            <ChevronUp className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(index, 'down');
                            }}
                            disabled={index === data.sections.length - 1}
                            className={cn(
                              "p-1 rounded transition-all",
                              index === data.sections.length - 1
                                ? "opacity-30 cursor-not-allowed"
                                : isDark
                                  ? "text-gray-400 hover:text-white hover:bg-white/10"
                                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this section?')) {
                                removeSection(index);
                              }
                            }}
                            className={cn(
                              "p-1 rounded transition-all",
                              "text-red-500 hover:text-red-400",
                              isDark ? "hover:bg-red-500/10" : "hover:bg-red-50"
                            )}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Section Content */}
                      {expandedSections.has(section.id) && (
                        <div className={cn(
                          "p-4 space-y-4",
                          isDark ? "bg-white/5" : "bg-white"
                        )}>
                          <div>
                            <label className={cn(
                              "block text-sm font-bold mb-2",
                              isDark ? "text-gray-300" : "text-gray-700"
                            )}>
                              Section Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => updateSection(index, 'title', e.target.value)}
                              className={cn(
                                "w-full px-4 py-2 border-2 rounded-xl focus:outline-none transition-all",
                                isDark
                                  ? "bg-white/5 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-pink-400"
                                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500"
                              )}
                              placeholder="e.g., Introduction, Getting Started, etc."
                              required
                            />
                            {errors[`sections.${index}.title`] && (
                              <p className="mt-1 text-sm text-red-400">
                                {errors[`sections.${index}.title`]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className={cn(
                              "block text-sm font-bold mb-2",
                              isDark ? "text-gray-300" : "text-gray-700"
                            )}>
                              Section Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={section.content}
                              onChange={(e) => updateSection(index, 'content', e.target.value)}
                              rows={6}
                              className={cn(
                                "w-full px-4 py-2 border-2 rounded-xl focus:outline-none font-mono text-sm transition-all",
                                isDark
                                  ? "bg-white/5 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-pink-400"
                                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500"
                              )}
                              placeholder="Write the content for this section..."
                              required
                            />
                            {errors[`sections.${index}.content`] && (
                              <p className="mt-1 text-sm text-red-400">
                                {errors[`sections.${index}.content`]}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className={cn(
              "rounded-2xl border-2 p-8 card-hover-effect animate-fadeIn animation-delay-800",
              isDark 
                ? "glassmorphism-enhanced border-green-500/30" 
                : "bg-white border-green-200 shadow-lg"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                  3
                </div>
                <h2 className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  Lesson Settings
                </h2>
              </div>

              <div className="space-y-6">
                {/* Video URL */}
                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-2 flex items-center gap-1",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    <Video className="w-4 h-4" />
                    Video URL <span className={cn("font-normal", isDark ? "text-gray-400" : "text-gray-500")}>(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={data.video_url}
                    onChange={(e) => setData('video_url', e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all",
                      isDark
                        ? "bg-white/5 border-green-500/30 text-white placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white/10"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200",
                      errors.video_url && (isDark ? "border-red-500/50" : "border-red-500")
                    )}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                  {errors.video_url && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <span>⚠️</span> {errors.video_url}
                    </p>
                  )}
                </div>

                {/* Difficulty + Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={cn(
                      "block text-sm font-bold mb-3",
                      isDark ? "text-gray-200" : "text-gray-900"
                    )}>
                      Difficulty Level <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {difficulties.map((diff) => {
                        const isSelected = data.difficulty === diff.value;
                        const getGradient = () => {
                          if (!isSelected) return '';
                          if (diff.value === 'beginner') return 'from-green-500 to-emerald-500';
                          if (diff.value === 'intermediate') return 'from-yellow-500 to-orange-500';
                          if (diff.value === 'advanced') return 'from-red-500 to-pink-500';
                          return '';
                        };
                        
                        return (
                          <button
                            key={diff.value}
                            type="button"
                            onClick={() => setData('difficulty', diff.value)}
                            className={cn(
                              "flex items-center gap-2 p-3 border-2 rounded-xl text-left transition-all ripple-effect",
                              isSelected
                                ? `bg-gradient-to-r ${getGradient()} text-white border-transparent shadow-lg`
                                : isDark
                                  ? "border-white/10 hover:border-green-500/50 hover:bg-white/5 text-gray-300"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                            )}
                          >
                            <span className="text-xl">{diff.icon}</span>
                            <span className="font-semibold">{diff.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className={cn(
                      "block text-sm font-bold mb-2 flex items-center gap-1",
                      isDark ? "text-gray-200" : "text-gray-900"
                    )}>
                      <Clock className="w-4 h-4" />
                      Estimated Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={data.estimated_duration}
                      onChange={(e) => setData('estimated_duration', parseInt(e.target.value) || 0)}
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all",
                        isDark
                          ? "bg-white/5 border-green-500/30 text-white placeholder:text-gray-400 focus:border-emerald-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-500"
                      )}
                      min="1"
                      max="1440"
                      placeholder="30"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-3",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {statuses.map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => setData('status', status.value)}
                        className={cn(
                          "p-4 border-2 rounded-xl text-left transition-all card-hover-effect ripple-effect",
                          data.status === status.value
                            ? isDark
                              ? "border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                              : "border-blue-500 bg-blue-50"
                            : isDark
                              ? "border-white/10 hover:border-green-500/50 hover:bg-white/5"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{status.icon}</span>
                          <div className={cn(
                            "font-bold",
                            isDark ? "text-white" : "text-gray-900"
                          )}>
                            {status.label}
                          </div>
                        </div>
                        <div className={cn(
                          "text-xs",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          {status.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Settings */}
            <div className={cn(
              "rounded-2xl border-2 p-8 card-hover-effect animate-fadeIn animation-delay-1000",
              isDark 
                ? "glassmorphism-enhanced border-orange-500/30" 
                : "bg-white border-orange-200 shadow-lg"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                  4
                </div>
                <h2 className={cn(
                  "text-2xl font-bold flex items-center gap-2",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  <Target className="w-6 h-6" />
                  Completion Settings
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-2",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    🏆 Completion Reward Points
                  </label>
                  <input
                    type="number"
                    value={data.completion_reward_points}
                    onChange={(e) => setData('completion_reward_points', parseInt(e.target.value) || 0)}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all",
                      isDark
                        ? "bg-white/5 border-orange-500/30 text-white placeholder:text-gray-400 focus:border-red-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500"
                    )}
                    min="0"
                    max="10000"
                    placeholder="100"
                  />
                  <p className={cn(
                    "mt-1 text-xs",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Points awarded when lesson is completed
                  </p>
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-2",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    📊 Minimum Exercise Score (%)
                  </label>
                  <input
                    type="number"
                    value={data.min_exercise_score_percent}
                    onChange={(e) => setData('min_exercise_score_percent', parseFloat(e.target.value) || 0)}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all",
                      isDark
                        ? "bg-white/5 border-orange-500/30 text-white placeholder:text-gray-400 focus:border-red-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500"
                    )}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="70"
                  />
                  <p className={cn(
                    "mt-1 text-xs",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Minimum score required to pass exercises
                  </p>
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-2",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    💻 Required Exercises
                  </label>
                  <input
                    type="number"
                    value={data.required_exercises}
                    onChange={(e) => setData('required_exercises', parseInt(e.target.value) || 0)}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all",
                      isDark
                        ? "bg-white/5 border-orange-500/30 text-white placeholder:text-gray-400 focus:border-red-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500"
                    )}
                    min="0"
                    placeholder="0"
                  />
                  <p className={cn(
                    "mt-1 text-xs",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Number of exercises to complete (0 = all)
                  </p>
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-2",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    📝 Required Tests
                  </label>
                  <input
                    type="number"
                    value={data.required_tests}
                    onChange={(e) => setData('required_tests', parseInt(e.target.value) || 0)}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all",
                      isDark
                        ? "bg-white/5 border-orange-500/30 text-white placeholder:text-gray-400 focus:border-red-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500"
                    )}
                    min="0"
                    placeholder="0"
                  />
                  <p className={cn(
                    "mt-1 text-xs",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Number of tests to complete (0 = all)
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className={cn(
              "sticky bottom-6 rounded-2xl border-2 p-6 z-10 shadow-2xl animate-slideUp",
              isDark
                ? "glassmorphism-enhanced border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"
                : "bg-white border-gray-200"
            )}>
              <div className="flex items-center justify-between">
                <Link
                  href={safeRoute('admin.lessons.index')}
                  className={cn(
                    "px-6 py-3 border-2 font-bold rounded-xl transition-all ripple-effect hover-lift",
                    isDark
                      ? "border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={processing}
                  className={cn(
                    "flex items-center gap-2 px-10 py-4 font-bold rounded-xl transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed button-press-effect",
                    isDark
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white glow-on-hover"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transform hover:-translate-y-0.5"
                  )}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-5 h-5" />
                      Create Lesson
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Help Card */}
          <div className={cn(
            "mt-6 rounded-2xl border-2 p-6 animate-fadeIn animation-delay-1200",
            isDark
              ? "glassmorphism-enhanced border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-indigo-500/10"
              : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg"
          )}>
            <h4 className={cn(
              "text-lg font-bold mb-3 flex items-center gap-2",
              isDark ? "text-white" : "text-blue-900"
            )}>
              <Info className="w-5 h-5" />
              What's Next?
            </h4>
            <ul className={cn(
              "space-y-2 text-sm",
              isDark ? "text-gray-300" : "text-blue-800"
            )}>
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>After creating the lesson, you can add <strong>interactive exercises</strong> and <strong>tests</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Set the status to <strong>"Active"</strong> when ready for students</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Students will earn points when they complete all requirements</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-1200 { animation-delay: 1.2s; }
        
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
        
        .button-press-effect:active {
          transform: scale(0.95);
        }
        
        .glow-on-hover:hover {
          box-shadow: 0 0 30px rgba(34, 211, 238, 0.4);
        }
      `}</style>
    </AuthenticatedLayout>
  );
}