// resources/js/Pages/Admin/Exercises/Show.jsx
import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    FileText,
    Clock,
    Code,
    GraduationCap,
    Play,
    CheckCircle,
    XCircle,
    AlertCircle,
    Info,
    Calendar,
    Award,
    Eye,
    Sparkles
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Show({ auth, exercise, lesson }) {
    const { props: pageProps } = usePage();
    const flash = pageProps?.flash ?? {};
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

    // Safe route resolver
    const safeRoute = (name, params) => {
        try {
            return route(name, params);
        } catch (err) {
            if (name === 'admin.lessons.exercises.edit' && Array.isArray(params)) {
                return `/admin/lessons/${params[0]}/exercises/${params[1]}/edit`;
            }
            if (name === 'admin.lessons.exercises.index') {
                return `/admin/lessons/${params}/exercises`;
            }
            if (name === 'admin.lessons.exercises.destroy' && Array.isArray(params)) {
                return `/admin/lessons/${params[0]}/exercises/${params[1]}`;
            }
            if (name === 'admin.lessons.show') {
                return `/admin/lessons/${params}`;
            }
            if (name === 'admin.exercises.edit') {
                return `/admin/exercises/${params}/edit`;
            }
            if (name === 'admin.exercises.index') {
                return `/admin/exercises`;
            }
            return null;
        }
    };

    const handleDelete = async () => {
        if (!exercise?.exercise_id) {
            alert('Exercise ID missing — cannot delete.');
            return;
        }

        if (!confirm('Are you sure you want to delete this exercise? This action cannot be undone.')) {
            return;
        }

        const routeName = lesson ? 'admin.lessons.exercises.destroy' : 'admin.exercises.destroy';
        const routeParams = lesson 
            ? [lesson.lesson_id, exercise.exercise_id]
            : exercise.exercise_id;
        
        const url = safeRoute(routeName, routeParams) || 
            (lesson ? `/admin/lessons/${lesson.lesson_id}/exercises/${exercise.exercise_id}` 
                   : `/admin/exercises/${exercise.exercise_id}`);

        router.delete(url, {
            onStart: () => console.debug('Deleting exercise', exercise.exercise_id),
            onSuccess: () => {
                console.debug('Delete success');
                if (lesson) {
                    router.visit(safeRoute('admin.lessons.show', lesson.lesson_id));
                } else {
                    router.visit(safeRoute('admin.exercises.index'));
                }
            },
            onError: (errors) => {
                console.error('Delete failed', errors);
                alert('Failed to delete exercise. Check console for details.');
            },
        });
    };

    const getStatusBadge = (isActive) => {
        return (
            <span className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full border-2",
                isActive 
                    ? isDark 
                        ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                        : 'bg-green-100 text-green-800 border-green-300'
                    : isDark 
                        ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' 
                        : 'bg-gray-100 text-gray-800 border-gray-300'
            )}>
                {isActive ? (
                    <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Active
                    </>
                ) : (
                    <>
                        <XCircle className="w-3.5 h-3.5" />
                        Inactive
                    </>
                )}
            </span>
        );
    };

    const getDifficultyBadge = (difficulty) => {
        const configs = {
            beginner: { 
                color: isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-300',
                icon: '🌱'
            },
            intermediate: { 
                color: isDark ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-orange-100 text-orange-800 border-orange-300',
                icon: '⚡'
            },
            advanced: { 
                color: isDark ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-red-100 text-red-800 border-red-300',
                icon: '🔥'
            },
            easy: { 
                color: isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-300',
                icon: '🌱'
            },
            medium: { 
                color: isDark ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'bg-orange-100 text-orange-800 border-orange-300',
                icon: '⚡'
            },
            hard: { 
                color: isDark ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-red-100 text-red-800 border-red-300',
                icon: '🔥'
            },
        };

        const config = configs[difficulty] || { 
            color: isDark ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-gray-100 text-gray-800 border-gray-300',
            icon: '❓'
        };

        return (
            <span className={cn("inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full border-2", config.color)}>
                <span>{config.icon}</span>
                {difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Unknown'}
            </span>
        );
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'coding':
                return <Code className="w-4 h-4" />;
            case 'multiple_choice':
                return <GraduationCap className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    if (!exercise) {
        return (
            <AuthenticatedLayout user={auth?.user}>
                <Head title="Exercise not found" />
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className={cn(
                        "rounded-xl p-6 border-2 animate-shake",
                        isDark 
                            ? "bg-red-500/10 border-red-500/30 text-red-300" 
                            : "bg-red-50 border-red-200 text-red-700"
                    )}>
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold mb-1">Exercise Not Found</h3>
                                <p className="text-sm">Exercise data not found. It may have been deleted or failed to load.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link 
                            href={lesson ? safeRoute('admin.lessons.show', lesson.lesson_id) : safeRoute('admin.exercises.index')} 
                            className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ripple-effect hover-lift",
                                isDark
                                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {lesson ? 'Back to Lesson' : 'Back to Exercises'}
                        </Link>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title={exercise?.title ?? 'Exercise Details'} />

            <div className="py-12 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className={cn(
                            "mb-6 rounded-xl p-4 border-2 animate-slideDown",
                            isDark
                                ? "bg-green-500/10 border-green-500/30 text-green-300"
                                : "bg-green-100 border-green-300 text-green-800"
                        )}>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                {flash.success}
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-8 animate-fadeIn">
                        <Link 
                            href={lesson 
                                ? safeRoute('admin.lessons.show', lesson.lesson_id) 
                                : safeRoute('admin.exercises.index')
                            } 
                            className={cn(
                                "inline-flex items-center gap-2 font-medium mb-6 transition-all hover-lift ripple-effect px-4 py-2 rounded-lg",
                                isDark 
                                    ? "text-cyan-400 hover:text-cyan-300 hover:bg-white/10" 
                                    : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            )}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            {lesson ? `Back to ${lesson.title}` : 'Back to Exercises'}
                        </Link>

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/30 animate-glowPulse">
                                        <Eye className="h-7 w-7 text-white" />
                                    </div>
                                    <h1 className={cn(
                                        "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                                        isDark 
                                            ? "from-purple-400 to-pink-400" 
                                            : "from-purple-600 to-pink-600"
                                    )}>
                                        {exercise?.title ?? 'Untitled Exercise'}
                                    </h1>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {getStatusBadge(exercise?.is_active)}
                                    {exercise?.difficulty && getDifficultyBadge(exercise.difficulty)}
                                    {exercise?.exercise_type && (
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full border-2",
                                            isDark
                                                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                                : "bg-indigo-100 text-indigo-800 border-indigo-300"
                                        )}>
                                            {getTypeIcon(exercise.exercise_type)}
                                            <span className="ml-1">
                                                {exercise.exercise_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </span>
                                    )}
                                    {exercise?.time_limit_sec && (
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full border-2",
                                            isDark
                                                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                                : "bg-yellow-100 text-yellow-800 border-yellow-300"
                                        )}>
                                            <Clock className="w-3.5 h-3.5" />
                                            {exercise.time_limit_sec}s
                                        </span>
                                    )}
                                </div>

                                {lesson && (
                                    <div className={cn(
                                        "inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2",
                                        isDark
                                            ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                                            : "bg-blue-50 border-blue-200 text-blue-800"
                                    )}>
                                        <Info className="w-4 h-4" />
                                        <span className="text-sm">
                                            Part of: <Link 
                                                href={safeRoute('admin.lessons.show', lesson.lesson_id)} 
                                                className="font-bold hover:underline"
                                            >
                                                {lesson.title}
                                            </Link>
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Link 
                                    href={lesson 
                                        ? safeRoute('admin.lessons.exercises.edit', [lesson.lesson_id, exercise.exercise_id]) 
                                        : safeRoute('admin.exercises.edit', exercise.exercise_id)
                                    } 
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl ripple-effect hover-lift",
                                        isDark
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                    )}
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit
                                </Link>

                                <button 
                                    onClick={handleDelete} 
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl ripple-effect hover-lift",
                                        "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                                    )}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Description */}
                            {exercise?.description && (
                                <div className={cn(
                                    "rounded-2xl border-2 p-6 card-hover-effect animate-fadeIn",
                                    isDark 
                                        ? "glassmorphism-enhanced border-purple-500/20" 
                                        : "bg-white border-purple-200 shadow-lg"
                                )}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className={cn(
                                            "w-5 h-5",
                                            isDark ? "text-cyan-400" : "text-purple-600"
                                        )} />
                                        <h3 className={cn(
                                            "text-xl font-bold",
                                            isDark ? "text-white" : "text-gray-900"
                                        )}>
                                            Description
                                        </h3>
                                    </div>
                                    <p className={cn(
                                        "whitespace-pre-wrap leading-relaxed",
                                        isDark ? "text-gray-300" : "text-gray-700"
                                    )}>
                                        {exercise.description}
                                    </p>
                                </div>
                            )}

                            {/* Starter Code */}
                            {exercise?.starter_code && (
                                <div className={cn(
                                    "rounded-2xl border-2 p-6 card-hover-effect animate-fadeIn animation-delay-200",
                                    isDark 
                                        ? "glassmorphism-enhanced border-purple-500/20" 
                                        : "bg-white border-purple-200 shadow-lg"
                                )}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Code className={cn(
                                            "w-5 h-5",
                                            isDark ? "text-green-400" : "text-green-600"
                                        )} />
                                        <h3 className={cn(
                                            "text-xl font-bold",
                                            isDark ? "text-white" : "text-gray-900"
                                        )}>
                                            Starter Code
                                        </h3>
                                    </div>
                                    <pre className={cn(
                                        "p-4 rounded-xl overflow-x-auto border-2",
                                        isDark
                                            ? "bg-slate-900/50 border-green-500/30"
                                            : "bg-gray-50 border-gray-300"
                                    )}>
                                        <code className={cn(
                                            "text-sm font-mono",
                                            isDark ? "text-green-300" : "text-gray-800"
                                        )}>
                                            {exercise.starter_code}
                                        </code>
                                    </pre>
                                </div>
                            )}

                            {/* Solution */}
                            {exercise?.solution && (
                                <div className={cn(
                                    "rounded-2xl border-2 p-6 card-hover-effect animate-fadeIn animation-delay-400",
                                    isDark 
                                        ? "glassmorphism-enhanced border-purple-500/20" 
                                        : "bg-white border-purple-200 shadow-lg"
                                )}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle className={cn(
                                            "w-5 h-5",
                                            isDark ? "text-emerald-400" : "text-emerald-600"
                                        )} />
                                        <h3 className={cn(
                                            "text-xl font-bold",
                                            isDark ? "text-white" : "text-gray-900"
                                        )}>
                                            Solution / Expected Output
                                        </h3>
                                    </div>
                                    <pre className={cn(
                                        "p-4 rounded-xl overflow-x-auto border-2",
                                        isDark
                                            ? "bg-emerald-500/10 border-emerald-500/30"
                                            : "bg-green-50 border-green-300"
                                    )}>
                                        <code className={cn(
                                            "text-sm font-mono",
                                            isDark ? "text-emerald-300" : "text-gray-800"
                                        )}>
                                            {exercise.solution}
                                        </code>
                                    </pre>
                                </div>
                            )}

                            {/* Asset */}
                            {exercise?.asset_url && (
                                <div className={cn(
                                    "rounded-2xl border-2 p-6 card-hover-effect animate-fadeIn animation-delay-600",
                                    isDark 
                                        ? "glassmorphism-enhanced border-purple-500/20" 
                                        : "bg-white border-purple-200 shadow-lg"
                                )}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className={cn(
                                            "w-5 h-5",
                                            isDark ? "text-blue-400" : "text-blue-600"
                                        )} />
                                        <h3 className={cn(
                                            "text-xl font-bold",
                                            isDark ? "text-white" : "text-gray-900"
                                        )}>
                                            Additional Resources
                                        </h3>
                                    </div>
                                    <a 
                                        href={exercise.asset_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ripple-effect hover-lift",
                                            isDark
                                                ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                                                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                        )}
                                    >
                                        <Play className="w-4 h-4" />
                                        View Resource
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Exercise Information */}
                            <div className={cn(
                                "rounded-2xl border-2 p-6 card-hover-effect animate-fadeIn animation-delay-200",
                                isDark 
                                    ? "glassmorphism-enhanced border-purple-500/20" 
                                    : "bg-white border-purple-200 shadow-lg"
                            )}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Info className={cn(
                                        "w-5 h-5",
                                        isDark ? "text-purple-400" : "text-purple-600"
                                    )} />
                                    <h3 className={cn(
                                        "text-lg font-bold",
                                        isDark ? "text-white" : "text-gray-900"
                                    )}>
                                        Exercise Information
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    <div className={cn(
                                        "flex justify-between items-center p-3 rounded-lg",
                                        isDark ? "bg-white/5" : "bg-gray-50"
                                    )}>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            isDark ? "text-gray-400" : "text-gray-600"
                                        )}>Type:</span>
                                        <span className={cn(
                                            "text-sm font-bold",
                                            isDark ? "text-white" : "text-gray-900"
                                        )}>
                                            {exercise?.exercise_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "flex justify-between items-center p-3 rounded-lg",
                                        isDark ? "bg-white/5" : "bg-gray-50"
                                    )}>
                                        <span className={cn(
                                            "text-sm font-medium flex items-center gap-1",
                                            isDark ? "text-gray-400" : "text-gray-600"
                                        )}>
                                            <Award className="w-4 h-4" />
                                            Max Score:
                                        </span>
                                        <span className={cn(
                                            "text-sm font-bold",
                                            isDark ? "text-yellow-400" : "text-yellow-600"
                                        )}>
                                            {exercise?.max_score ?? 0} pts
                                        </span>
                                    </div>
                                    {exercise?.time_limit_sec && (
                                        <div className={cn(
                                            "flex justify-between items-center p-3 rounded-lg",
                                            isDark ? "bg-white/5" : "bg-gray-50"
                                        )}>
                                            <span className={cn(
                                                "text-sm font-medium flex items-center gap-1",
                                                isDark ? "text-gray-400" : "text-gray-600"
                                            )}>
                                                <Clock className="w-4 h-4" />
                                                Time Limit:
                                            </span>
                                            <span className={cn(
                                                "text-sm font-bold",
                                                isDark ? "text-white" : "text-gray-900"
                                            )}>
                                                {exercise.time_limit_sec}s
                                            </span>
                                        </div>
                                    )}
                                    <div className={cn(
                                        "flex justify-between items-center p-3 rounded-lg",
                                        isDark ? "bg-white/5" : "bg-gray-50"
                                    )}>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            isDark ? "text-gray-400" : "text-gray-600"
                                        )}>Status:</span>
                                        <span className={cn(
                                            "text-sm font-bold",
                                            exercise?.is_active 
                                                ? isDark ? "text-green-400" : "text-green-600"
                                                : isDark ? "text-gray-400" : "text-gray-600"
                                        )}>
                                            {exercise?.is_active ? '✅ Active' : '❌ Inactive'}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "flex justify-between items-center p-3 rounded-lg",
                                        isDark ? "bg-white/5" : "bg-gray-50"
                                    )}>
                                        <span className={cn(
                                            "text-sm font-medium flex items-center gap-1",
                                            isDark ? "text-gray-400" : "text-gray-600"
                                        )}>
                                            <Calendar className="w-4 h-4" />
                                            Created:
                                        </span>
                                        <span className={cn(
                                            "text-sm font-bold",
                                            isDark ? "text-white" : "text-gray-900"
                                        )}>
                                            {exercise?.created_at 
                                                ? new Date(exercise.created_at).toLocaleDateString() 
                                                : 'Unknown'
                                            }
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "flex justify-between items-center p-3 rounded-lg",
                                        isDark ? "bg-white/5" : "bg-gray-50"
                                    )}>
                                        <span className={cn(
                                            "text-sm font-medium flex items-center gap-1",
                                            isDark ? "text-gray-400" : "text-gray-600"
                                        )}>
                                            <Calendar className="w-4 h-4" />
                                            Updated:
                                        </span>
                                        <span className={cn(
                                            "text-sm font-bold",
                                            isDark ? "text-white" : "text-gray-900"
                                        )}>
                                            {exercise?.updated_at 
                                                ? new Date(exercise.updated_at).toLocaleDateString() 
                                                : 'Unknown'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className={cn(
                                "rounded-2xl border-2 p-6 card-hover-effect animate-fadeIn animation-delay-400",
                                isDark 
                                    ? "glassmorphism-enhanced border-purple-500/20" 
                                    : "bg-white border-purple-200 shadow-lg"
                            )}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className={cn(
                                        "w-5 h-5",
                                        isDark ? "text-yellow-400" : "text-yellow-600"
                                    )} />
                                    <h3 className={cn(
                                        "text-lg font-bold",
                                        isDark ? "text-white" : "text-gray-900"
                                    )}>
                                        Quick Actions
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    <Link 
                                        href={lesson 
                                            ? safeRoute('admin.lessons.exercises.edit', [lesson.lesson_id, exercise.exercise_id]) 
                                            : safeRoute('admin.exercises.edit', exercise.exercise_id)
                                        } 
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg ripple-effect",
                                            isDark
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                        )}
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit Exercise
                                    </Link>
                                    {lesson && (
                                        <Link 
                                            href={safeRoute('admin.lessons.show', lesson.lesson_id)} 
                                            className={cn(
                                                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg ripple-effect",
                                                isDark
                                                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                                            )}
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Lesson
                                        </Link>
                                    )}
                                    <Link 
                                        href={lesson 
                                            ? safeRoute('admin.lessons.exercises.index', lesson.lesson_id) 
                                            : safeRoute('admin.exercises.index')
                                        } 
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg ripple-effect",
                                            isDark
                                                ? "bg-white/10 hover:bg-white/20 text-gray-300 border-2 border-white/20"
                                                : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-gray-300"
                                        )}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        {lesson ? 'All Lesson Exercises' : 'All Exercises'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
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
                
                @keyframes glowPulse {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
                    }
                    50% {
                        box-shadow: 0 0 30px rgba(168, 85, 247, 0.5);
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
                
                .animate-slideDown {
                    animation: slideDown 0.4s ease-out;
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
            `}</style>
        </AuthenticatedLayout>
    );
}