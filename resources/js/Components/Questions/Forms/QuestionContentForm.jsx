// resources/js/Components/Questions/Forms/QuestionContentForm.jsx
import React from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

export default function QuestionContentForm({ 
  data = {}, // 添加默认值防止 undefined 
  onChange, 
  errors = {} 
}) {
  const handleChange = (field, value) => {
    if (onChange) {
      onChange(field, value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Question Content</h3>
        <p className="text-sm text-gray-600 mt-1">
          Enter the main question and any additional content
        </p>
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text *
        </label>
        <textarea
          value={data.question_text || ''}
          onChange={(e) => handleChange('question_text', e.target.value)}
          rows={4}
          placeholder="Enter your question here..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        {errors.question_text && (
          <p className="mt-2 text-sm text-red-600">{errors.question_text}</p>
        )}
      </div>

      {/* Code Snippet (for coding questions) */}
      {data.type === 'coding' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CodeBracketIcon className="w-4 h-4 inline mr-1" />
            Code Snippet (optional)
          </label>
          <textarea
            value={data.code_snippet || ''}
            onChange={(e) => handleChange('code_snippet', e.target.value)}
            rows={6}
            placeholder="# Starter code or example code here..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            Provide starter code or examples for students
          </p>
          {errors.code_snippet && (
            <p className="mt-2 text-sm text-red-600">{errors.code_snippet}</p>
          )}
        </div>
      )}

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explanation (optional)
        </label>
        <textarea
          value={data.explanation || ''}
          onChange={(e) => handleChange('explanation', e.target.value)}
          rows={3}
          placeholder="Explain why this answer is correct..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">
          This explanation will be shown to students when they review their answers
        </p>
        {errors.explanation && (
          <p className="mt-2 text-sm text-red-600">{errors.explanation}</p>
        )}
      </div>
    </div>
  );
}