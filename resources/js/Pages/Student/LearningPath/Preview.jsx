import React, { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { formatDurationHours } from '@/utils/duration';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CheckCircle,
    Clock,
    Lock,
    Sparkles,
    Target,
    Users,
} from 'lucide-react';

const iconMap = {
    book: '📚',
    code: '💻',
    rocket: '🚀',
    star: '⭐',
    fire: '🔥',
    trophy: '🏆',
    graduation: '🎓',
    lightbulb: '💡',
    chart: '📊',
    target: '🎯',
    puzzle: '🧩',
    brain: '🧠',
    tool: '🔧',
    paint: '🎨',
    music: '🎵',
    camera: '📷',
    globe: '🌍',
    science: '🔬',
    atom: '⚛️',
    dna: '🧬',
};

const levelGradients = {
    beginner: 'from-green-500 to-emerald-600',
    intermediate: 'from-blue-500 to-indigo-600',
    advanced: 'from-purple-500 to-pink-600',
};

function getIconEmoji(iconName) {
    return iconMap[iconName?.toLowerCase()] || null;
}

function getLevelGradient(level) {
    return levelGradients[level?.toLowerCase()] || 'from-gray-500 to-gray-600';
}

function splitMultilineText(value) {
    return (value || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

export default function Preview({ path, lessons = [] }) {
    const [isEnrolling, setIsEnrolling] = useState(false);

    const formattedDuration = formatDurationHours(
        path?.calculated_duration_hours ?? path?.estimated_duration_hours ?? 0
    );

    const learningOutcomes = useMemo(
        () => splitMultilineText(path?.learning_outcomes),
        [path?.learning_outcomes]
    );

    const prerequisites = useMemo(
        () => splitMultilineText(path?.prerequisites),
        [path?.prerequisites]
    );

    const handleEnroll = () => {
        setIsEnrolling(true);
        router.post(
            route('student.paths.enroll', path.path_id),
            { set_as_primary: false },
            {
                onFinish: () => setIsEnrolling(false),
            }
        );
    };

    return (
        <StudentLayout>
            <Head title={`${path.title} Preview`} />

            <div className="space-y-6">
                <div className="bg-black/70 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-start gap-4 mb-4">
                                <Link
                                    href={route('student.paths.browse')}
                                    className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 text-white flex-shrink-0 border-2 border-white/30 hover:border-white/50 shadow-lg"
                                >
                                    <ArrowLeft className="h-6 w-6" />
                                </Link>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-4xl">
                                            {getIconEmoji(path.icon) || path.icon || '📚'}
                                        </span>
                                        <div>
                                            <h1 className="text-3xl font-bold text-white">
                                                {path.title}
                                            </h1>
                                            {path.is_featured && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-lg mt-2 shadow-lg">
                                                    <Sparkles className="h-3 w-3" />
                                                    Featured Path
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        <span
                                            className={`px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${getLevelGradient(path.difficulty_level)} text-white shadow-lg border-2 border-white/30`}
                                        >
                                            {path.difficulty_level}
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full text-sm font-bold border-2 border-white/30 bg-white/10 text-white">
                                            Preview
                                        </span>
                                    </div>

                                    <p className="text-white/90 font-medium leading-relaxed">
                                        {path.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-4">
                                <button
                                    onClick={handleEnroll}
                                    disabled={isEnrolling}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    <span>{isEnrolling ? 'Enrolling...' : 'Enroll Now'}</span>
                                </button>

                                <Link
                                    href={route('student.paths.browse')}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 border-2 border-white/30 hover:border-white/50 transition-all"
                                >
                                    Back to Browse
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 min-w-[280px]">
                            <SummaryCard
                                icon={<BookOpen className="h-5 w-5" />}
                                label="Lessons"
                                value={path.total_lessons}
                            />
                            <SummaryCard
                                icon={<Clock className="h-5 w-5" />}
                                label="Duration"
                                value={formattedDuration}
                            />
                            <SummaryCard
                                icon={<Target className="h-5 w-5" />}
                                label="Required"
                                value={path.required_lessons_count}
                            />
                            <SummaryCard
                                icon={<Users className="h-5 w-5" />}
                                label="Enrolled"
                                value={path.enrollment_count}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-black/70 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-6 shadow-2xl">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <BookOpen className="h-7 w-7 text-blue-400" />
                                Path Lessons ({lessons.length})
                            </h2>

                            <div className="space-y-4">
                                {lessons.map((lesson) => (
                                    <div
                                        key={lesson.lesson_id}
                                        className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-5 shadow-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/30">
                                                {lesson.sequence_order}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white text-lg mb-2">
                                                    {lesson.title}
                                                </h3>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="px-3 py-1 rounded-lg text-xs font-bold border-2 border-blue-500/40 bg-blue-500/20 text-blue-200">
                                                        {lesson.is_required ? 'Required' : 'Optional'}
                                                    </span>
                                                    <span className="text-xs text-white/80 font-semibold flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {lesson.estimated_duration_minutes || 0} min
                                                    </span>
                                                    {lesson.unlock_after_previous && (
                                                        <span className="text-xs text-white/80 font-semibold flex items-center gap-1">
                                                            <Lock className="h-3 w-3" />
                                                            Sequential unlock
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <ArrowRight className="h-5 w-5 text-white/40 flex-shrink-0" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <InfoPanel title="What You'll Learn">
                            {learningOutcomes.length > 0 ? (
                                <div className="space-y-3">
                                    {learningOutcomes.map((outcome, index) => (
                                        <div
                                            key={`${outcome}-${index}`}
                                            className="flex items-start gap-2 text-sm text-white/90 font-medium"
                                        >
                                            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>{outcome}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-white/75 text-sm font-medium">
                                    Learning outcomes will appear here once this path is fully configured.
                                </p>
                            )}
                        </InfoPanel>

                        <InfoPanel title="Prerequisites">
                            {prerequisites.length > 0 ? (
                                <div className="space-y-3">
                                    {prerequisites.map((item, index) => (
                                        <div
                                            key={`${item}-${index}`}
                                            className="flex items-start gap-2 text-sm text-white/90 font-medium"
                                        >
                                            <ArrowRight className="h-4 w-4 text-amber-300 flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-white/75 text-sm font-medium">
                                    No prerequisites required.
                                </p>
                            )}
                        </InfoPanel>

                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 shadow-2xl border-2 border-white/40">
                            <h3 className="text-xl font-bold text-white mb-3">
                                Ready to start?
                            </h3>
                            <p className="text-white/90 text-sm font-medium leading-relaxed mb-5">
                                Once you enroll, this path will appear in your learning dashboard and you can begin from the first unlocked lesson.
                            </p>
                            <button
                                onClick={handleEnroll}
                                disabled={isEnrolling}
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl"
                            >
                                <Sparkles className="h-5 w-5" />
                                <span>{isEnrolling ? 'Enrolling...' : 'Enroll in This Path'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}

function SummaryCard({ icon, label, value }) {
    return (
        <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-4 shadow-lg">
            <div className="inline-flex p-2 rounded-xl mb-3 bg-gradient-to-br from-blue-500 to-purple-600 border border-white/30 shadow-lg">
                {React.cloneElement(icon, { className: 'text-white' })}
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-white/80 font-semibold">{label}</div>
        </div>
    );
}

function InfoPanel({ title, children }) {
    return (
        <div className="bg-black/70 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
            {children}
        </div>
    );
}
