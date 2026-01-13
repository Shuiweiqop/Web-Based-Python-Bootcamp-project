import React from 'react';
import { Award, Code2 } from 'lucide-react';

export default function QuestionDisplay({ question, questionNumber }) {
    const getDifficultyBadge = (level) => {
        const badges = {
            1: { text: 'Easy', class: 'bg-green-100 text-green-800' },
            2: { text: 'Medium', class: 'bg-yellow-100 text-yellow-800' },
            3: { text: 'Hard', class: 'bg-red-100 text-red-800' }
        };
        
        const badge = badges[level] || badges[1];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}`}>
                {badge.text}
            </span>
        );
    };

    const getTypeDisplay = (type) => {
        const types = {
            'mcq': 'Multiple Choice',
            'true_false': 'True/False',
            'short_answer': 'Short Answer',
            'coding': 'Coding Exercise'
        };
        return types[type] || type;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Question Header */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                            Question {questionNumber}
                        </span>
                        <span className="text-sm text-gray-500">
                            {getTypeDisplay(question.type)}
                        </span>
                        {question.difficulty_level && getDifficultyBadge(question.difficulty_level)}
                    </div>
                </div>
                
                {question.points && (
                    <div className="flex items-center space-x-1 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">{question.points} pts</span>
                    </div>
                )}
            </div>

            {/* Question Text */}
            <div className="mb-6">
                <p className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap">
                    {question.question_text}
                </p>
            </div>

            {/* Code Snippet (if present) */}
            {question.code_snippet && (
                <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <Code2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Code Reference:</span>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-100 font-mono">
                            <code>{question.code_snippet}</code>
                        </pre>
                    </div>
                </div>
            )}

            {/* Instructions/Hints */}
            {question.type === 'coding' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Write your Python code in the editor below. Make sure your code is properly indented and follows Python syntax.
                    </p>
                </div>
            )}

            {question.type === 'short_answer' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700">
                        ℹ️ Provide a concise answer. Your answer will be compared for exactness.
                    </p>
                </div>
            )}
        </div>
    );
}