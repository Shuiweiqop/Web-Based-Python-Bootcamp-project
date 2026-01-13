import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function ProgressBar({ 
    current, 
    total, 
    answeredCount = 0,
    showPercentage = true,
    showLabel = true 
}) {
    const percentage = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
    const currentPercentage = total > 0 ? Math.round((current / total) * 100) : 0;

    const getProgressColor = () => {
        if (percentage >= 100) return 'bg-green-600';
        if (percentage >= 75) return 'bg-blue-600';
        if (percentage >= 50) return 'bg-indigo-600';
        if (percentage >= 25) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    return (
        <div className="w-full">
            {/* Label and Stats */}
            {showLabel && (
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">
                            Progress
                        </span>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                            {answeredCount} of {total} answered
                        </span>
                    </div>
                    {showPercentage && (
                        <span className="text-sm font-bold text-gray-900">
                            {percentage}%
                        </span>
                    )}
                </div>
            )}

            {/* Progress Bar Container */}
            <div className="relative">
                {/* Background Track */}
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    {/* Progress Fill */}
                    <div 
                        className={`h-full ${getProgressColor()} transition-all duration-500 ease-out relative`}
                        style={{ width: `${percentage}%` }}
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
                    </div>
                </div>

                {/* Current Position Indicator (optional) */}
                {current !== answeredCount && (
                    <div 
                        className="absolute top-0 h-3 w-1 bg-indigo-800 transition-all duration-300"
                        style={{ left: `${currentPercentage}%` }}
                    />
                )}
            </div>

            {/* Milestone Indicators */}
            <div className="flex justify-between mt-1 px-1">
                {[0, 25, 50, 75, 100].map((milestone) => (
                    <div 
                        key={milestone}
                        className={`text-xs ${
                            percentage >= milestone 
                                ? 'text-gray-700 font-medium' 
                                : 'text-gray-400'
                        }`}
                    >
                        {milestone}%
                    </div>
                ))}
            </div>

            {/* Completion Message */}
            {percentage === 100 && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        All questions answered! Ready to submit.
                    </p>
                </div>
            )}

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}