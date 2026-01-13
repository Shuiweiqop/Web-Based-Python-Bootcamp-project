// resources/js/Pages/Admin/Exercises/Create.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import exerciseTypeRegistry from '@/Config/exerciseTypeRegistry';
import { Sparkles, Info, ChevronRight, ArrowLeft } from 'lucide-react';
import ExerciseHelperTools from '@/Components/Admin/ExerciseHelperTools';
import { cn } from '@/utils/cn';

export default function Create({ auth, lesson, lessons }) {
  const { data, setData, post, processing, errors } = useForm({
    lesson_id: lesson?.lesson_id || '',
    title: '',
    description: '',
    exercise_type: 'drag_drop',
    max_score: 100,
    time_limit_sec: null,
    is_active: true,
    content: {},
    
    // Coding Exercise 特定字段
    enable_live_editor: false,
    starter_code: '',
    coding_instructions: '',
    test_cases: [],
    solution_code: '',
  });

  const [selectedType, setSelectedType] = useState('drag_drop');
  const [showTypeInfo, setShowTypeInfo] = useState(false);
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

  // 从注册中心获取所有类型
  const exerciseTypes = exerciseTypeRegistry.getAllExerciseTypes();

  const handleTypeChange = (typeValue) => {
    setSelectedType(typeValue);
    const typeConfig = exerciseTypeRegistry.getExerciseType(typeValue);
    
    setData({
      ...data,
      exercise_type: typeValue,
      content: typeConfig.defaultContent,
      enable_live_editor: typeValue === 'coding' ? false : undefined,
      starter_code: typeValue === 'coding' ? '# Write your code here\n' : '',
      coding_instructions: '',
      test_cases: [],
      solution_code: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalData = { ...data };
    
    if (data.exercise_type === 'coding' && data.enable_live_editor) {
      finalData.content = JSON.stringify({});
    } else if (typeof data.content === 'object') {
      finalData.content = JSON.stringify(data.content);
    }
    
    const url = lesson 
      ? route('admin.lessons.exercises.store', lesson.lesson_id)
      : route('admin.exercises.store');
    
    post(url, { data: finalData });
  };

  // 动态渲染配置组件
  const renderTypeConfig = () => {
    const TypeComponent = exerciseTypeRegistry.getTypeComponent(selectedType);
    return <TypeComponent data={data} setData={setData} errors={errors} exerciseType={selectedType} />;
  };

  // 按分类分组显示
  const groupedTypes = {
    basic: exerciseTypes.filter(t => t.category === 'basic'),
    intermediate: exerciseTypes.filter(t => t.category === 'intermediate'),
    advanced: exerciseTypes.filter(t => t.category === 'advanced'),
  };

  // 获取当前选中类型的详细信息
  const selectedTypeInfo = exerciseTypeRegistry.getExerciseType(selectedType);

  // 分类配置
  const categoryConfig = {
    basic: {
      color: 'green',
      label: 'Basic Types',
      description: 'Simple and quick to create',
      gradient: isDark ? 'from-green-500/20 to-emerald-500/20' : 'from-green-100 to-emerald-100',
    },
    intermediate: {
      color: 'yellow',
      label: 'Intermediate Types',
      description: 'More engaging and interactive',
      gradient: isDark ? 'from-yellow-500/20 to-orange-500/20' : 'from-yellow-100 to-orange-100',
    },
    advanced: {
      color: 'red',
      label: 'Advanced Types',
      description: 'Complex and feature-rich',
      gradient: isDark ? 'from-red-500/20 to-pink-500/20' : 'from-red-100 to-pink-100',
    },
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Create Exercise" />
      
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

          <form onSubmit={handleSubmit} className="space-y-6">
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
                {!lesson && lessons && (
                  <div>
                    <label className={cn(
                      "block text-sm font-bold mb-2",
                      isDark ? "text-gray-200" : "text-gray-900"
                    )}>
                      Lesson <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={data.lesson_id}
                      onChange={(e) => setData('lesson_id', e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all",
                        isDark
                          ? "bg-white/5 border-purple-500/30 text-white focus:border-cyan-400 focus:bg-white/10"
                          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      )}
                      required
                    >
                      <option value="">-- Select a lesson --</option>
                      {lessons.map((l) => (
                        <option key={l.lesson_id} value={l.lesson_id}>
                          {l.title}
                        </option>
                      ))}
                    </select>
                    {errors.lesson_id && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-1 animate-shake">
                        <span>⚠️</span> {errors.lesson_id}
                      </p>
                    )}
                  </div>
                )}

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
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                      "w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all",
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

            {/* Exercise Type Selection */}
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
                    Choose Exercise Type
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

              {/* Selected Type Info Banner */}
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

              {/* Type Grid by Category */}
              <div className="space-y-8">
                {Object.entries(groupedTypes).map(([category, types]) => {
                  if (types.length === 0) return null;
                  const config = categoryConfig[category];
                  
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={cn(
                          "inline-block w-3 h-3 rounded-full",
                          `bg-${config.color}-500`
                        )}></span>
                        <h3 className={cn(
                          "text-lg font-bold",
                          isDark ? "text-white" : "text-gray-900"
                        )}>
                          {config.label}
                        </h3>
                        <span className={cn(
                          "text-sm",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          • {config.description}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {types.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleTypeChange(type.value)}
                            className={cn(
                              "group relative p-5 rounded-xl border-2 transition-all text-left hover-lift ripple-effect",
                              selectedType === type.value
                                ? isDark
                                  ? "border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/20 animate-glowPulse"
                                  : "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-4 ring-blue-200"
                                : isDark
                                  ? "border-white/10 hover:border-purple-500/50 hover:bg-white/5"
                                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-md"
                            )}
                          >
                            {selectedType === type.value && (
                              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-bounceIn">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            
                            <div className="text-4xl mb-3 transition-transform group-hover:scale-110">
                              {type.icon}
                            </div>
                            <div className={cn(
                              "font-bold mb-2",
                              isDark ? "text-white" : "text-gray-900"
                            )}>
                              {type.label}
                            </div>
                            <div className={cn(
                              "text-xs leading-relaxed",
                              isDark ? "text-gray-400" : "text-gray-600"
                            )}>
                              {type.description}
                            </div>
                            
                            {type.requiresSpecialConfig && (
                              <div className={cn(
                                "mt-3 pt-3 border-t",
                                isDark ? "border-white/10" : "border-gray-200"
                              )}>
                                <span className={cn(
                                  "text-xs font-semibold flex items-center gap-1",
                                  isDark ? "text-cyan-400" : "text-blue-600"
                                )}>
                                  <Sparkles className="h-3 w-3" />
                                  Custom Config
                                </span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
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

            {/* Helper Tools */}
            <div className="animate-fadeIn animation-delay-800">
              <ExerciseHelperTools 
                exerciseType={selectedType}
                data={data}
              />
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
                    <div className="font-semibold">Creating: {selectedTypeInfo?.label}</div>
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
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Create Exercise
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
        .animation-delay-800 {
          animation-delay: 0.8s;
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
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(34, 211, 238, 0.5);
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