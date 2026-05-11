// resources/js/Pages/Admin/Exercises/Edit.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
  ArrowLeft, 
  Save, 
  Info,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/utils/cn';
import exerciseTypeRegistry from '@/Config/exerciseTypeRegistry';

export default function Edit(props) {
  const page = usePage();
  const exercise = props.exercise ?? page.props?.exercise ?? null;
  const lesson = props.lesson ?? page.props?.lesson ?? null;

  const [isDark, setIsDark] = useState(true);
  const [showTypeInfo, setShowTypeInfo] = useState(false);

  // 监听主题变化
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    updateTheme();
    window.addEventListener('theme-changed', updateTheme);
    return () => window.removeEventListener('theme-changed', updateTheme);
  }, []);

  // Parse content if it's a string
  const parsedContent = exercise?.content 
    ? (typeof exercise.content === 'string' ? JSON.parse(exercise.content) : exercise.content)
    : {};

  const { data, setData, put, processing, errors } = useForm({
    lesson_id: exercise?.lesson_id ?? '',
    title: exercise?.title ?? '',
    description: exercise?.description ?? '',
    content: parsedContent,
    exercise_type: exercise?.exercise_type ?? 'drag_drop',
    difficulty: exercise?.difficulty ?? 'beginner',
    estimated_duration: exercise?.estimated_duration ?? '',
    points: exercise?.points ?? 0,
    status: exercise?.status ?? 'draft',
    max_score: exercise?.max_score ?? 100,
    time_limit_sec: exercise?.time_limit_sec ?? null,
    is_active: exercise?.is_active ?? true,
    starter_code: exercise?.starter_code ?? '',
    solution: exercise?.solution ?? '',
    enable_live_editor: exercise?.enable_live_editor ?? false,
    coding_instructions: exercise?.coding_instructions ?? '',
    test_cases: exercise?.test_cases ?? [],
  });

  const [selectedType] = useState(exercise?.exercise_type ?? 'drag_drop');

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

  function submit(e) {
    e.preventDefault();

    if (!exerciseId) {
      alert('Missing exercise id — cannot update.');
      return;
    }

    let finalData = { ...data };
    
    if (typeof data.content === 'object') {
      finalData.content = JSON.stringify(data.content);
    }

    const isNestedLessonRoute = lessonId && window.location.pathname.startsWith(`/admin/lessons/${lessonId}/exercises/`);
    const updateUrl = isNestedLessonRoute
      ? route('admin.lessons.exercises.update', { lesson: lessonId, exercise: exerciseId })
      : route('admin.exercises.update', { exercise: exerciseId });

    put(updateUrl, {
      preserveScroll: true,
    });
  }

  const selectedTypeInfo = exerciseTypeRegistry.getExerciseType(selectedType);

  const renderTypeConfig = () => {
    const TypeComponent = exerciseTypeRegistry.getTypeComponent(selectedType);
    if (!TypeComponent) return <div className="text-gray-500">No configuration needed for this type.</div>;
    return <TypeComponent data={data} setData={setData} errors={errors} exerciseType={selectedType} />;
  };

  const statusConfig = {
    draft: { 
      color: isDark ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-gray-100 text-gray-800 border-gray-300', 
      label: '📝 Draft' 
    },
    published: { 
      color: isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-800 border-green-300', 
      label: '✅ Published' 
    },
    archived: { 
      color: isDark ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-orange-100 text-orange-800 border-orange-300', 
      label: '📦 Archived' 
    },
  };

  return (
    <AuthenticatedLayout user={props.auth?.user}>
      <Head title={`Edit Exercise - ${exercise.title}`} />

      <div className="py-12 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 animate-fadeIn">
            <Link
              href={lesson ? route('admin.lessons.show', lesson.lesson_id) : route('admin.exercises.index')}
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

            {/* Status Info Card */}
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
                    {selectedTypeInfo?.icon} {selectedTypeInfo?.label}
                  </span>
                </div>
                
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border",
                  isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                )}>
                  <span className={cn("font-semibold", isDark ? "text-gray-300" : "text-gray-700")}>Status:</span>
                  <span className={cn("px-2 py-1 rounded font-medium text-xs border", statusConfig[data.status].color)}>
                    {statusConfig[data.status].label}
                  </span>
                </div>
                
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border",
                  isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"
                )}>
                  <span className={cn("font-semibold", isDark ? "text-gray-300" : "text-gray-700")}>Active:</span>
                  <span className={cn(
                    "px-2 py-1 rounded inline-flex items-center gap-1 font-medium text-xs border",
                    data.is_active 
                      ? isDark ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-green-100 text-green-800 border-green-300"
                      : isDark ? "bg-slate-700 text-slate-300 border-slate-600" : "bg-gray-100 text-gray-800 border-gray-300"
                  )}>
                    {data.is_active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {data.is_active ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6">
            {/* Basic Information */}
            <div className={cn(
              "rounded-2xl border-2 p-8 card-hover-effect animate-fadeIn",
              isDark 
                ? "glassmorphism-enhanced border-purple-500/20" 
                : "bg-white border-purple-200 shadow-lg"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-500/30">
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
                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-2",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    Exercise Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all",
                      isDark
                        ? "bg-white/5 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:bg-white/10"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                      errors.title && (isDark ? "border-red-500/50" : "border-red-500")
                    )}
                    placeholder="e.g., Python Variables Practice"
                    required
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1 animate-shake">
                      <span>⚠️</span> {errors.title}
                    </p>
                  )}
                  <p className={cn(
                    "text-xs mt-2",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    💡 Give a clear, descriptive title that tells students what they'll practice
                  </p>
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-2",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    Description
                  </label>
                  <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all resize-vertical",
                      isDark
                        ? "bg-white/5 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:bg-white/10"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    )}
                    rows="4"
                    placeholder="Describe what students will learn and practice in this exercise..."
                  />
                  <p className={cn(
                    "text-xs mt-2",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    💡 Optional but recommended: Explain the learning objectives
                  </p>
                </div>
              </div>
            </div>

            {/* Exercise Type Info (Read-only) */}
            <div className={cn(
              "rounded-2xl border-2 p-8 card-hover-effect animate-fadeIn animation-delay-200",
              isDark 
                ? "glassmorphism-enhanced border-purple-500/20" 
                : "bg-white border-purple-200 shadow-lg"
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-purple-500/30">
                    2
                  </div>
                  <h2 className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    Exercise Type (Read-only)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTypeInfo(!showTypeInfo)}
                  className={cn(
                    "text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-lg transition-all ripple-effect",
                    isDark
                      ? "text-cyan-400 hover:text-cyan-300 hover:bg-white/10"
                      : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  )}
                >
                  <Info className="h-4 w-4" />
                  {showTypeInfo ? 'Hide' : 'Show'} Type Info
                </button>
              </div>

              {showTypeInfo && selectedTypeInfo && (
                <div className={cn(
                  "mb-6 rounded-xl p-6 border-2 animate-slideDown",
                  isDark 
                    ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/30"
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                )}>
                  <div className="flex items-start gap-4">
                    <div className="text-5xl animate-bounceIn">{selectedTypeInfo.icon}</div>
                    <div className="flex-1">
                      <h3 className={cn(
                        "font-bold text-xl mb-2",
                        isDark ? "text-white" : "text-gray-900"
                      )}>
                        {selectedTypeInfo.label}
                      </h3>
                      <p className={cn(
                        "text-sm mb-3",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>
                        {selectedTypeInfo.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className={cn(
                          "px-3 py-1 text-xs font-bold rounded-full",
                          isDark
                            ? "bg-blue-500/30 text-cyan-300"
                            : "bg-blue-100 text-blue-800"
                        )}>
                          {selectedTypeInfo.category}
                        </span>
                        {selectedTypeInfo.features.map((feature, idx) => (
                          <span key={idx} className={cn(
                            "px-3 py-1 text-xs font-medium rounded-full",
                            isDark
                              ? "bg-white/10 text-gray-300"
                              : "bg-gray-100 text-gray-700"
                          )}>
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className={cn(
                "p-4 rounded-lg border-2",
                isDark 
                  ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30" 
                  : "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300"
              )}>
                <p className={cn(
                  "text-sm flex items-start gap-2",
                  isDark ? "text-yellow-300" : "text-yellow-800"
                )}>
                  <span className="text-lg">ℹ️</span>
                  <span>
                    Exercise type cannot be changed after creation. Current type: <span className="font-bold">{selectedTypeInfo?.label}</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Exercise Settings */}
            <div className={cn(
              "rounded-2xl border-2 p-8 card-hover-effect animate-fadeIn animation-delay-400",
              isDark 
                ? "glassmorphism-enhanced border-purple-500/20" 
                : "bg-white border-purple-200 shadow-lg"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-green-500/30">
                  3
                </div>
                <h2 className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  Exercise Settings
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-2",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    Max Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={data.max_score}
                    onChange={(e) => setData('max_score', parseInt(e.target.value))}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all",
                      isDark
                        ? "bg-white/5 border-purple-500/30 text-white focus:border-green-400 focus:bg-white/10"
                        : "bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    )}
                    min="1"
                    required
                  />
                  <p className={cn(
                    "text-xs mt-2",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Points students can earn
                  </p>
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-2",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    Time Limit (seconds)
                  </label>
                  <input
                    type="number"
                    value={data.time_limit_sec || ''}
                    onChange={(e) => setData('time_limit_sec', e.target.value ? parseInt(e.target.value) : null)}
                    className={cn(
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all",
                      isDark
                        ? "bg-white/5 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-green-400 focus:bg-white/10"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    )}
                    placeholder="No limit"
                    min="1"
                  />
                  <p className={cn(
                    "text-xs mt-2",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    0 or empty = no time limit
                  </p>
                </div>

                <div>
                  <label className={cn(
                    "block text-sm font-bold mb-2",
                    isDark ? "text-gray-200" : "text-gray-900"
                  )}>
                    Status
                  </label>
                  <div className="h-[52px] flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={cn(
                        "w-14 h-7 rounded-full peer transition-all peer-focus:outline-none peer-focus:ring-4",
                        "peer-checked:after:translate-x-full peer-checked:after:border-white",
                        "after:content-[''] after:absolute after:top-0.5 after:left-[4px]",
                        "after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all",
                        isDark
                          ? "bg-gray-600 peer-focus:ring-cyan-500/30 peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500 after:border-gray-600"
                          : "bg-gray-200 peer-focus:ring-blue-300 peer-checked:bg-green-600 after:border-gray-300"
                      )}></div>
                      <span className={cn(
                        "ml-3 text-sm font-bold",
                        isDark ? "text-white" : "text-gray-900"
                      )}>
                        {data.is_active ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </label>
                  </div>
                  <p className={cn(
                    "text-xs mt-2",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Students can {data.is_active ? 'see and attempt' : 'not see'} this
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Type Configuration */}
            <div className={cn(
              "rounded-2xl border-2 p-2 animate-fadeIn animation-delay-600",
              isDark
                ? "border-dashed border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5"
                : "border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white"
            )}>
              <div className={cn(
                "rounded-xl p-6",
                isDark ? "glassmorphism-enhanced" : "bg-white"
              )}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-orange-500/30">
                    4
                  </div>
                  <h2 className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    Configure: {selectedTypeInfo?.label}
                  </h2>
                  <ChevronRight className={cn(
                    "h-5 w-5",
                    isDark ? "text-gray-400" : "text-gray-400"
                  )} />
                  <span className={cn(
                    "text-sm",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    {selectedTypeInfo?.icon} {selectedTypeInfo?.description}
                  </span>
                </div>
                
                {renderTypeConfig()}
              </div>
            </div>

            {/* Submit Section */}
            <div className={cn(
              "sticky bottom-6 rounded-2xl border-2 p-6 z-10 shadow-2xl animate-slideUp",
              isDark
                ? "glassmorphism-enhanced border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-cyan-500/10"
                : "bg-white border-gray-200"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link
                    href={lesson ? route('admin.lessons.show', lesson.lesson_id) : route('admin.exercises.index')}
                    className={cn(
                      "px-6 py-3 border-2 font-bold rounded-xl transition-all ripple-effect hover-lift",
                      isDark
                        ? "border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    Cancel
                  </Link>
                  
                  <div className={cn(
                    "text-sm",
                    isDark ? "text-gray-300" : "text-gray-600"
                  )}>
                    <div className="font-semibold">Editing: {selectedTypeInfo?.label}</div>
                    <div className="text-xs">For: {lesson?.title || 'Selected Lesson'}</div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={processing}
                  className={cn(
                    "group relative px-10 py-4 font-bold rounded-xl transition-all shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed button-press-effect",
                    isDark
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white glow-on-hover"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transform hover:-translate-y-0.5"
                  )}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-5 w-5" />
                      Save Changes
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
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
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
        
        @keyframes bounceIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
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
        
        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
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
