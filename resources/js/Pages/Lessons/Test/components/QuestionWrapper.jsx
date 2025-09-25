import React from 'react';

const QuestionWrapper = ({ title, description, maxScore, error, children }) => {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                    {title}
                </h3>
                {description && (
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            <div className="space-y-6">
                {children}
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {maxScore && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Max Score: <span className="font-medium">{maxScore} points</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default QuestionWrapper;