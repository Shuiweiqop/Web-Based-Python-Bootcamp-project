import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { formatDurationHours } from '@/utils/duration';
import { 
    CheckCircleIcon, 
    ClockIcon, 
    BookOpenIcon,
    ChartBarIcon,
    SparklesIcon,
    ArrowRightIcon 
} from '@heroicons/react/24/outline';

export default function RecommendedPath({ 
    submission, 
    recommendedPath, 
    alternativePaths = [], 
    message,
    alreadyAccepted = false,
    acceptedStudentPathId = null,
}) {
    const [selectedPath, setSelectedPath] = useState(recommendedPath.path_id);
    const [processing, setProcessing] = useState(false);
    const canViewAcceptedPath = alreadyAccepted && Boolean(acceptedStudentPathId);

    const handleAcceptPath = () => {
        setProcessing(true);

        router.post(
            route('student.onboarding.accept-path', selectedPath),
            {
                submission_id: submission.submission_id,
                set_as_primary: true,
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            }
        );
    };

    const getConfidenceColor = (confidence) => {
        if (!confidence) return 'text-gray-600 bg-gray-50';
        if (confidence >= 85) return 'text-green-600 bg-green-50';
        if (confidence >= 75) return 'text-blue-600 bg-blue-50';
        return 'text-yellow-600 bg-yellow-50';
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            beginner: 'bg-green-100 text-green-700',
            intermediate: 'bg-blue-100 text-blue-700',
            advanced: 'bg-purple-100 text-purple-700',
        };
        return colors[difficulty] || 'bg-gray-100 text-gray-700';
    };

    return (
        <>
            <Head title="Your Recommended Learning Path" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <CheckCircleIcon className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Assessment Complete! 🎉
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Based on your score of <span className="font-semibold text-blue-600">{submission.score}%</span>, 
                            we've found the perfect learning path for you.
                        </p>
                    </div>

                    {/* Test Summary Card */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Your Assessment Results
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard 
                                label="Score" 
                                value={`${submission.score}%`}
                                color="blue"
                            />
                            <StatCard 
                                label="Correct Answers" 
                                value={`${submission.correct_answers}/${submission.total_questions}`}
                                color="green"
                            />
                            <StatCard 
                                label="Time Spent" 
                                value={submission.time_spent}
                                color="purple"
                            />
                            <StatCard 
                                label="Submitted" 
                                value={submission.submitted_at}
                                color="gray"
                            />
                        </div>
                    </div>

                    {/* Recommended Path */}
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <SparklesIcon className="w-6 h-6 text-yellow-500 mr-2" />
                            <h2 className="text-2xl font-bold text-gray-900">
                                Recommended for You
                            </h2>
                        </div>

                        <PathCard
                            path={recommendedPath}
                            isRecommended={true}
                            isSelected={selectedPath === recommendedPath.path_id}
                            onSelect={() => setSelectedPath(recommendedPath.path_id)}
                            confidence={recommendedPath.confidence}
                            getDifficultyColor={getDifficultyColor}
                            getConfidenceColor={getConfidenceColor}
                        />

                        {/* Recommendation Message */}
                        {message && (
                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-900 text-sm leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Alternative Paths */}
                    {alternativePaths.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Other Options You Might Consider
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {alternativePaths.map((path) => (
                                    <PathCard
                                        key={path.path_id}
                                        path={path}
                                        isRecommended={false}
                                        isSelected={selectedPath === path.path_id}
                                        onSelect={() => setSelectedPath(path.path_id)}
                                        getDifficultyColor={getDifficultyColor}
                                        getConfidenceColor={getConfidenceColor}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        {alreadyAccepted ? (
                            <div className="text-center">
                                <p className="text-green-600 font-semibold mb-4">
                                    ✓ You've already enrolled in this path!
                                </p>
                                {canViewAcceptedPath ? (
                                    <a
                                        href={route('student.paths.show', acceptedStudentPathId)}
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        View My Learning Path
                                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                                    </a>
                                ) : (
                                    <a
                                        href={route('student.paths.index')}
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Go to My Learning Paths
                                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                                    </a>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        type="button"
                                        onClick={handleAcceptPath}
                                        disabled={processing}
                                        className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        {processing ? 'Enrolling...' : 'Start This Path'}
                                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                                    </button>

                                    <a
                                        href={route('student.paths.browse')}
                                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        Browse All Paths
                                    </a>
                                </div>

                                <p className="text-center text-sm text-gray-500 mt-4">
                                    {selectedPath !== recommendedPath.path_id 
                                        ? '💡 You\'ve selected a different path than recommended'
                                        : 'Ready to begin your Python journey?'}
                                </p>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}

// Stat Card Component
function StatCard({ label, value, color }) {
    const colorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        purple: 'text-purple-600',
        gray: 'text-gray-600',
    };

    return (
        <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className={`text-xl font-bold ${colorClasses[color]}`}>
                {value}
            </p>
        </div>
    );
}

// Path Card Component
function PathCard({ 
    path, 
    isRecommended, 
    isSelected, 
    onSelect, 
    confidence,
    getDifficultyColor,
    getConfidenceColor 
}) {
    const durationHours = path.calculated_duration_hours ?? path.estimated_duration_hours ?? 0;
    const formattedDuration = formatDurationHours(durationHours);

    return (
        <div
            onClick={onSelect}
            className={`relative bg-white rounded-xl p-6 border-2 cursor-pointer transition-all duration-200 ${
                isSelected 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
        >
            {/* Recommended Badge */}
            {isRecommended && (
                <div className="absolute -top-3 -right-3">
                    <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md">
                        ⭐ RECOMMENDED
                    </span>
                </div>
            )}

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute top-4 right-4">
                    <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                </div>
            )}

            {/* Path Info */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(path.difficulty_level)}`}>
                        {path.difficulty_level.charAt(0).toUpperCase() + path.difficulty_level.slice(1)}
                    </span>
                    {confidence && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(confidence)}`}>
                            {confidence}% Match
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {path.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    {path.description}
                </p>
            </div>

            {/* Path Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                    <BookOpenIcon className="w-4 h-4 mr-1" />
                    {path.total_lessons} Lessons
                </div>
                <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {formattedDuration}
                </div>
            </div>
        </div>
    );
}
