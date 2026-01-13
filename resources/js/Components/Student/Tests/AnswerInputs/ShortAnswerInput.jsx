import React, { useState, useEffect } from 'react';
import { Type, AlertCircle } from 'lucide-react';

export default function ShortAnswerInput({ value, onChange, disabled = false, maxLength = 500 }) {
    const [answer, setAnswer] = useState(value || '');
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        setAnswer(value || '');
        setCharCount((value || '').length);
    }, [value]);

    const handleChange = (e) => {
        if (disabled) return;
        
        const newValue = e.target.value;
        setAnswer(newValue);
        setCharCount(newValue.length);
        
        if (onChange) {
            onChange(newValue);
        }
    };

    const getCharCountColor = () => {
        const percentage = (charCount / maxLength) * 100;
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 75) return 'text-yellow-600';
        return 'text-gray-500';
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Type className="w-4 h-4 mr-2" />
                    Your Answer:
                </label>
                <span className={`text-xs font-medium ${getCharCountColor()}`}>
                    {charCount} / {maxLength}
                </span>
            </div>

            {/* Text Input */}
            <div className="relative">
                <input
                    type="text"
                    value={answer}
                    onChange={handleChange}
                    disabled={disabled}
                    maxLength={maxLength}
                    placeholder="Type your answer here..."
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        answer.trim()
                            ? 'border-indigo-300 focus:border-indigo-500 focus:ring-indigo-200'
                            : 'border-gray-200 focus:border-gray-400 focus:ring-gray-200'
                    } ${
                        disabled
                            ? 'bg-gray-100 cursor-not-allowed opacity-60'
                            : 'bg-white'
                    }`}
                />
                
                {/* Check icon when answered */}
                {answer.trim() && !disabled && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Hints */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800 space-y-1">
                        <p><strong>Tips:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Be concise and specific</li>
                            <li>Check spelling and capitalization</li>
                            <li>Answer will be compared for exactness</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Answer Preview */}
            {answer.trim() && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 mb-1">Preview:</p>
                    <p className="text-sm text-gray-900 font-medium">
                        "{answer.trim()}"
                    </p>
                </div>
            )}
        </div>
    );
}