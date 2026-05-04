import React, { useState, useEffect, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { safeRoute, resourceRoutes } from "@/utils/routeHelpers";
import {
  ArrowLeft,
  AlertCircle,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/utils/cn";

// 导入现有组件
import LessonHeader from './components/LessonHeader';
import LessonContent from './components/LessonContent';
import LessonVideo from './components/LessonVideo';
import TestList from './components/TestList';
import ExerciseList from './components/ExerciseList';
import LessonSidebar from './components/LessonSidebar';

export default function Show({ lesson: propLesson, sections: propSections = [], exercises = [], tests = [], buildChecklist = [], statistics = {} }) {
  const [expandedSections, setExpandedSections] = useState({});
  
  // 从 localStorage 读取主题设置
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });
  
  // 监听主题变化
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('theme');
      setIsDark(saved === 'dark');
    };

    // 监听 storage 事件（跨标签页）
    window.addEventListener('storage', handleStorageChange);
    
    // 监听自定义事件（同一页面内）
    window.addEventListener('theme-changed', handleStorageChange);
    
    // 定期检查主题变化（作为备份方案）
    const interval = setInterval(() => {
      const saved = localStorage.getItem('theme');
      const currentTheme = saved === 'dark';
      if (currentTheme !== isDark) {
        setIsDark(currentTheme);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('theme-changed', handleStorageChange);
      clearInterval(interval);
    };
  }, [isDark]);
  
  // 确保 lesson 和 sections 正确更新
  const lesson = propLesson ?? null;
  const sections = propSections || [];

  // 当 sections 变化时，重置展开状态
  useEffect(() => {
    // 自动展开第一个 section
    if (sections.length > 0) {
      setExpandedSections({ 0: true });
    }
  }, [sections.length]);

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!lesson) {
    return (
      <AuthenticatedLayout
        header={
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-xl leading-tight">
              Lesson Not Found
            </h2>
          </div>
        }
      >
        <Head title="Lesson Not Found" />
        
        <div className="max-w-4xl mx-auto">
          <div className={cn(
            "rounded-xl p-6 border animate-fadeIn",
            isDark ? "bg-red-500/10 border-red-500/30 text-red-300" : "bg-red-50 border-red-200 text-red-700"
          )}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Lesson Not Found</h3>
                <p className="text-sm">The lesson data could not be loaded.</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href={safeRoute('admin.lessons.index')}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                isDark ? "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lessons
            </Link>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const lessonId = lesson?.lesson_id ?? lesson?.id ?? null;
  const completedChecklistCount = useMemo(
    () => buildChecklist.filter((item) => item.done).length,
    [buildChecklist]
  );
  const nextChecklistStep = useMemo(
    () => buildChecklist.find((item) => !item.done) ?? null,
    [buildChecklist]
  );

  // Generate resource routes
  const routes = lessonId ? {
    lesson: resourceRoutes('admin.lessons', { id: lessonId }),
    tests: resourceRoutes('admin.lessons.tests', { lessonId }),
    exercises: resourceRoutes('admin.lessons.exercises', { lessonId }),
  } : null;

  const handleDelete = async () => {
    if (!lessonId) {
      alert('Lesson ID missing — cannot delete.');
      return;
    }

    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    router.delete(routes.lesson.destroy, {
      onStart: () => console.debug('Deleting lesson', lessonId),
      onSuccess: () => {
        console.debug('Delete success');
        router.visit(safeRoute('admin.lessons.index'));
      },
      onError: (errors) => {
        console.error('Delete failed', errors);
        alert('Failed to delete lesson. Check console for details.');
      },
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title={lesson.title} />

      <div className="space-y-6">
        {/* Lesson Header with Actions */}
        <LessonHeader
          lesson={lesson}
          routes={routes}
          onDelete={handleDelete}
          isDark={isDark}
        />

        <div className={cn(
          "rounded-2xl border p-5 shadow-lg",
          isDark
            ? "border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-slate-900/70 to-blue-500/10"
            : "border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-blue-50"
        )}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={cn("text-xs font-semibold uppercase tracking-[0.22em]", isDark ? "text-cyan-300" : "text-cyan-700")}>
                Lesson Builder
              </p>
              <h3 className={cn("mt-2 text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                {lesson.status === 'draft' ? 'Keep building this draft in a clean order' : 'Your next teaching setup step is ready'}
              </h3>
              <p className={cn("mt-2 text-sm", isDark ? "text-slate-300" : "text-gray-600")}>
                {nextChecklistStep
                  ? `${completedChecklistCount} of ${buildChecklist.length} setup steps done. Next best move: ${nextChecklistStep.title}.`
                  : 'All core setup steps are done. You can keep polishing the lesson experience from here.'}
              </p>
            </div>

            {nextChecklistStep && (
              <Link
                href={nextChecklistStep.href}
                className={cn(
                  "inline-flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                  isDark
                    ? "bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"
                    : "bg-cyan-100 text-cyan-800 hover:bg-cyan-200"
                )}
              >
                {nextChecklistStep.actionLabel}
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {!lesson?.content && sections.length === 0 && (
              <div className={cn(
                "rounded-2xl border p-6",
                isDark ? "border-amber-500/20 bg-amber-500/10" : "border-amber-200 bg-amber-50"
              )}>
                <div className="flex items-start gap-3">
                  <Sparkles className={cn("mt-0.5 h-5 w-5", isDark ? "text-amber-300" : "text-amber-600")} />
                  <div>
                    <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      This draft shell is ready for content
                    </h3>
                    <p className={cn("mt-2 text-sm", isDark ? "text-slate-300" : "text-gray-700")}>
                      Start with a short lesson overview, then break the topic into sections if you want a more guided teaching flow before adding practice and final checks.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Lesson Content */}
            {lesson?.content && (
              <LessonContent
                content={lesson.content}
                contentType={lesson.content_type || 'markdown'}
                isDark={isDark}
              />
            )}

            {/* Lesson Sections */}
            {sections && sections.length > 0 && (
              <div className={cn(
                "rounded-2xl shadow-lg border backdrop-blur-sm animate-fadeIn",
                isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
              )}>
                <div className={cn(
                  "p-6 border-b bg-gradient-to-r",
                  isDark ? "border-white/10 from-purple-500/10 to-pink-500/10" : "border-gray-200 from-purple-50 to-pink-50"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shadow-lg",
                      isDark ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/50" : "bg-gradient-to-br from-purple-100 to-pink-100"
                    )}>
                      <BookOpen className={cn("w-5 h-5", isDark ? "text-pink-400" : "text-purple-600")} />
                    </div>
                    <div>
                      <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                        Lesson Sections
                      </h3>
                      <p className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-600")}>
                        {sections.length} section{sections.length !== 1 ? 's' : ''} in this lesson
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {sections.map((section, index) => {
                    const sectionId = section.id || section.lesson_section_id || index;
                    
                    return (
                      <div
                        key={sectionId}
                        className={cn(
                          "rounded-xl border transition-all card-hover-effect",
                          isDark ? "bg-slate-800/50 border-white/10 hover:border-cyan-500/50" : "bg-gray-50 border-gray-200 hover:border-blue-300"
                        )}
                      >
                        <button
                          onClick={() => toggleSection(index)}
                          className="w-full p-4 flex items-center justify-between hover:bg-opacity-80 transition-all ripple-effect"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                              isDark ? "bg-cyan-500/20 text-cyan-300" : "bg-blue-100 text-blue-700"
                            )}>
                              {index + 1}
                            </div>
                            <span className={cn("font-semibold text-left", isDark ? "text-white" : "text-gray-900")}>
                              {section.title}
                            </span>
                          </div>
                          {expandedSections[index] ? (
                            <ChevronUp className={cn("w-5 h-5", isDark ? "text-slate-400" : "text-gray-600")} />
                          ) : (
                            <ChevronDown className={cn("w-5 h-5", isDark ? "text-slate-400" : "text-gray-600")} />
                          )}
                        </button>

                        {expandedSections[index] && (
                          <div className={cn(
                            "px-4 pb-4 border-t animate-fadeIn",
                            isDark ? "border-white/10" : "border-gray-200"
                          )}>
                            <div className={cn(
                              "mt-4 prose prose-sm max-w-none",
                              isDark ? "prose-invert" : ""
                            )}>
                              <div className={cn(
                                "whitespace-pre-wrap text-sm leading-relaxed",
                                isDark ? "text-slate-300" : "text-gray-700"
                              )}>
                                {section.content}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Video Section */}
            {lesson.video_url && (
              <LessonVideo videoUrl={lesson.video_url} isDark={isDark} />
            )}

            {/* Tests Section */}
            <TestList
              tests={tests}
              lessonId={lessonId}
              createRoute={routes?.tests?.create}
              isDark={isDark}
            />

            {/* Exercises Section */}
            <ExerciseList
              exercises={exercises}
              lessonId={lessonId}
              createRoute={routes?.exercises?.create}
              isDark={isDark}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LessonSidebar
              lesson={lesson}
              exercises={exercises}
              tests={tests}
              routes={routes}
              buildChecklist={buildChecklist}
              isDark={isDark}
            />

            {/* Statistics Card */}
            <div className={cn(
              "rounded-2xl shadow-lg border backdrop-blur-sm p-6 animate-fadeIn",
              isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
            )}>
              <h3 className={cn("text-lg font-bold mb-4", isDark ? "text-white" : "text-gray-900")}>
                📊 Content Statistics
              </h3>
              <div className="space-y-4">
                {/* Sections */}
                {sections.length > 0 && (
                  <div className={cn(
                    "p-4 rounded-lg transition-all card-hover-effect",
                    isDark ? "bg-purple-500/10 hover:bg-purple-500/20" : "bg-purple-50 hover:bg-purple-100"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-gray-700")}>
                        📚 Sections
                      </span>
                      <span className={cn("text-2xl font-bold", isDark ? "text-purple-400" : "text-purple-600")}>
                        {sections.length}
                      </span>
                    </div>
                  </div>
                )}

                {/* Exercises */}
                <div className={cn(
                  "p-4 rounded-lg transition-all card-hover-effect",
                  isDark ? "bg-green-500/10 hover:bg-green-500/20" : "bg-green-50 hover:bg-green-100"
                )}>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-gray-700")}>
                      💻 Exercises
                    </span>
                    <span className={cn("text-2xl font-bold", isDark ? "text-green-400" : "text-green-600")}>
                      {exercises?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Tests */}
                <div className={cn(
                  "p-4 rounded-lg transition-all card-hover-effect",
                  isDark ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100"
                )}>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-gray-700")}>
                      📝 Tests
                    </span>
                    <span className={cn("text-2xl font-bold", isDark ? "text-blue-400" : "text-blue-600")}>
                      {tests?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
        
        .card-hover-effect {
          transition: all 0.3s ease;
        }
        
        .card-hover-effect:hover {
          transform: translateY(-2px);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </AuthenticatedLayout>
  );
}
