import React, { useState } from 'react';

const ShortAnswer = ({ value, onChange, placeholder = "Type your answer here...", maxLength = 500 }) => {
    const [answer, setAnswer] = useState(value || '');
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setAnswer(newValue);
        if (onChange) {
            onChange({ text: newValue });
        }
    };

    const characterCount = answer.length;
    const isNearLimit = characterCount > maxLength * 0.8;

    return (
        <div className="space-y-3">
            <div className="relative">
                <textarea
                    value={answer}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    rows="4"
                    className={`
                        w-full px-4 py-3 border rounded-lg resize-none transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${isFocused ? 'border-blue-400' : 'border-gray-300'}
                        ${answer.trim() ? 'bg-blue-50' : 'bg-white'}
                        placeholder-gray-400
                    `}
                />
                {isFocused && (
                    <div className="absolute inset-0 rounded-lg ring-2 ring-blue-200 pointer-events-none"></div>
                )}
            </div>

            {/* Character count and feedback */}
            <div className="flex justify-between items-center text-sm">
                <div>
                    {answer.trim() && (
                        <span className="text-green-600">
                            ✓ Answer entered
                        </span>
                    )}
                </div>
                <div className={`${isNearLimit ? 'text-orange-600' : 'text-gray-500'}`}>
                    {characterCount}/{maxLength} characters
                </div>
            </div>

            {/* Answer preview */}
            {answer.trim() && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-2">Your answer:</p>
                    <p className="text-gray-900">{answer}</p>
                </div>
            )}

            {/* Helpful tips */}
            <div className="text-xs text-gray-500 mt-2">
                <p>Tips: Be concise and specific. Make sure your answer directly addresses the question.</p>
            </div>
        </div>
    );
};

export default ShortAnswer;