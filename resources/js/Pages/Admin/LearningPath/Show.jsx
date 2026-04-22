import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Copy,
    GraduationCap,
    Users,
    CheckCircle,
    Clock,
    BarChart3,
    Settings,
    MoreVertical,
    BookOpen,
    TrendingUp,
    Award,
    Target,
    Sparkles,
} from 'lucide-react';

export default function Show({ auth, path, lessons, completionStats, recentEnrollments }) {
    const [processing, setProcessing] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${path.title}"? This cannot be undone.`)) {
            router.delete(route('admin.learning-paths.destroy', path.path_id));
        }
    };

    const handleClone = () => {
        if (confirm('Clone this learning path?')) {
            setProcessing(true);
            router.post(route('admin.learning-paths.clone', path.path_id), {}, {
                onFinish: () => setProcessing(false)
            });
        }
    };

    const getDifficultyConfig = (level) => {
        const configs = {
            beginner: {
                bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
                border: 'border-green-500/30',
                text: 'text-green-300',
                label: 'Beginner'
            },
            intermediate: {
                bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
                border: 'border-yellow-500/30',
                text: 'text-yellow-300',
                label: 'Intermediate'
            },
            advanced: {
                bg: 'bg-gradient-to-r from-red-500/20 to-pink-500/20',
                border: 'border-red-500/30',
                text: 'text-red-300',
                label: 'Advanced'
            },
        };
        return configs[level] || configs.beginner;
    };

    const difficultyConfig = getDifficultyConfig(path.difficulty_level);

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div className="flex flex-col gap-4 animate-fadeIn">
                    <Link
                        href={route('admin.learning-paths.index')}
                        className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors ripple-effect w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Back to Learning Paths</span>
                        <span className="sm:hidden">Back</span>
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <h2 className="font-semibold text-2xl sm:text-3xl leading-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent break-words mb-3">
                                {path.title}
                            </h2>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {path.is_active ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 text-xs font-semibold rounded-full">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/20 text-slate-400 text-xs font-semibold rounded-full">
                                        Inactive
                                    </span>
                                )}
                                {path.is_featured && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-semibold rounded-full animate-pulse-slow">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Featured
                                    </span>
                                )}
                            </div>

                            <p className="text-sm sm:text-base text-slate-300">{path.description}</p>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex gap-2 flex-shrink-0">
                            <Link
                                href={route('admin.learning-paths.edit', path.path_id)}
                                className="px-4 py-2 bg-white/5 border border-white/20 text-slate-200 font-medium rounded-lg hover:bg-white/10 hover:border-white/30 transition-all inline-flex items-center ripple-effect"
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </Link>
                            <Link
                                href={route('admin.learning-paths.lessons.manage', path.path_id)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all inline-flex items-center shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 ripple-effect button-press-effect"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Manage Lessons
                            </Link>
                            <button
                                onClick={handleClone}
                                disabled={processing}
                                className="px-4 py-2 bg-white/5 border border-white/20 text-slate-200 font-medium rounded-lg hover:bg-white/10 hover:border-white/30 transition-all inline-flex items-center disabled:opacity-50 ripple-effect"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Clone
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all inline-flex items-center shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/60 ripple-effect button-press-effect"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </button>
                        </div>

                        {/* Mobile Menu */}
                        <div className="lg:hidden relative">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="p-2 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-all ripple-effect"
                            >
                                <MoreVertical className="w-5 h-5 text-slate-200" />
                            </button>
                            
                            {showMobileMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMobileMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-56 glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 py-2 z-20 animate-slideDown">
                                        <Link 
                                            href={route('admin.learning-paths.edit', path.path_id)} 
                                            className="w-full px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 flex items-center gap-3 transition-all"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            Edit Path
                                        </Link>
                                        <Link 
                                            href={route('admin.learning-paths.lessons.manage', path.path_id)} 
                                            className="w-full px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 flex items-center gap-3 transition-all"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Manage Lessons
                                        </Link>
                                        <button 
                                            onClick={handleClone} 
                                            className="w-full px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 flex items-center gap-3 transition-all"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Clone Path
                                        </button>
                                        <div className="my-1 border-t border-white/10" />
                                        <button 
                                            onClick={handleDelete} 
                                            className="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Path
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={path.title} />

            <div className="py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 animate-fadeIn">
                        <div className="glassmorphism-enhanced rounded-xl shadow-2xl p-4 sm:p-6 border border-white/10 group hover:border-purple-500/50 transition-all card-hover-effect">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg">
                                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-slate-400 truncate">Lessons</p>
                                    <p className="text-xl sm:text-2xl font-bold text-white">{path.total_lessons}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glassmorphism-enhanced rounded-xl shadow-2xl p-4 sm:p-6 border border-white/10 group hover:border-purple-500/50 transition-all card-hover-effect">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg">
                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-slate-400 truncate">Students</p>
                                    <p className="text-xl sm:text-2xl font-bold text-white">{completionStats.total_students}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glassmorphism-enhanced rounded-xl shadow-2xl p-4 sm:p-6 border border-white/10 group hover:border-purple-500/50 transition-all card-hover-effect">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-lg">
                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-slate-400 truncate">Completed</p>
                                    <p className="text-xl sm:text-2xl font-bold text-white">{completionStats.completed}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glassmorphism-enhanced rounded-xl shadow-2xl p-4 sm:p-6 border border-white/10 group hover:border-purple-500/50 transition-all card-hover-effect">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
                                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-slate-400 truncate">Rate</p>
                                    <p className="text-xl sm:text-2xl font-bold text-white">{completionStats.completion_rate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="xl:col-span-2 space-y-6">
                            {/* Path Details */}
                            <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn" style={{animationDelay: '100ms'}}>
                                <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 px-4 sm:px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <Target className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">Path Details</h3>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6 space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-400 mb-2">Difficulty Level</p>
                                            <span className={`inline-flex items-center px-3 py-1.5 ${difficultyConfig.bg} border ${difficultyConfig.border} ${difficultyConfig.text} text-sm font-semibold rounded-lg`}>
                                                {difficultyConfig.label}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-400 mb-2">Estimated Duration</p>
                                            <p className="inline-flex items-center gap-2 text-base font-semibold text-white">
                                                <Clock className="w-5 h-5 text-cyan-400" />
                                                {path.estimated_duration_hours} hours
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {path.learning_outcomes && (
                                        <div>
                                            <p className="text-sm font-semibold text-slate-400 mb-2">Learning Outcomes</p>
                                            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                                <p className="text-sm text-cyan-100 whitespace-pre-wrap leading-relaxed">{path.learning_outcomes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lessons List */}
                            <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn" style={{animationDelay: '200ms'}}>
                                <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 px-4 sm:px-6 py-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <BookOpen className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">Lessons ({lessons.length})</h3>
                                    </div>
                                    <Link 
                                        href={route('admin.learning-paths.lessons.manage', path.path_id)} 
                                        className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors ripple-effect"
                                    >
                                        Manage →
                                    </Link>
                                </div>
                                <div className="p-4 sm:p-6">
                                    {lessons.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <BookOpen className="w-8 h-8 text-purple-400" />
                                            </div>
                                            <p className="text-slate-400 mb-4">No lessons added yet</p>
                                            <Link
                                                href={route('admin.learning-paths.lessons.manage', path.path_id)}
                                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all shadow-lg shadow-purple-500/50 ripple-effect"
                                            >
                                                Add Lessons
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {lessons.map((lesson, index) => (
                                                <div 
                                                    key={lesson.lesson_id} 
                                                    className="p-3 sm:p-4 bg-white/5 border-2 border-white/10 rounded-xl hover:border-purple-500/50 hover:bg-white/10 transition-all group"
                                                    style={{animationDelay: `${index * 50}ms`}}
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                                                        <div className="flex items-start flex-1 min-w-0 gap-3">
                                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                                                <span className="text-sm font-bold text-white">{lesson.sequence_order}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm sm:text-base font-semibold text-white break-words mb-2">{lesson.title}</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <span className="px-2.5 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold rounded-full capitalize">
                                                                        {lesson.difficulty}
                                                                    </span>
                                                                    {lesson.is_required && (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-300 text-xs font-semibold rounded-full">
                                                                            <CheckCircle className="w-3 h-3" />
                                                                            Required
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-sm text-slate-300 flex-shrink-0">
                                                            <Clock className="w-4 h-4" />
                                                            {lesson.estimated_duration_minutes || lesson.estimated_duration} min
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* Enrollment Stats */}
                            <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn" style={{animationDelay: '300ms'}}>
                                <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 px-4 sm:px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <TrendingUp className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">Enrollment Stats</h3>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6 space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-medium text-slate-200">Active Students</span>
                                        </div>
                                        <span className="text-2xl font-bold text-green-400">{completionStats.active}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-slate-200">Completed</span>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-400">{completionStats.completed}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Enrollments */}
                            <div className="glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn" style={{animationDelay: '400ms'}}>
                                <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10 px-4 sm:px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <Award className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">Recent Enrollments</h3>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6">
                                    {recentEnrollments.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-slate-400 text-sm">No enrollments yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentEnrollments.map((e, index) => (
                                                <div 
                                                    key={e.student_path_id} 
                                                    className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-purple-500/50 transition-all"
                                                    style={{animationDelay: `${index * 50}ms`}}
                                                >
                                                    <div className="flex justify-between items-start gap-3 mb-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-white truncate">{e.student_name}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">{e.assigned_at}</p>
                                                        </div>
                                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                                                            e.status === 'active' 
                                                                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300' 
                                                                : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300'
                                                        }`}>
                                                            {e.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
                                                                style={{width: `${e.progress_percent}%`}}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-white">{e.progress_percent}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}