// resources/js/Components/Questions/Forms/AnswerConfiguration/CodingAnswerForm.jsx
import React from 'react';
import { 
  CodeBracketIcon, 
  PlayIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export default function CodingAnswerForm({ 
  correctAnswer, 
  onAnswerChange, 
  metadata = {},
  onMetadataChange,
  errors = {} 
}) {
  const handleMetadataChange = (field, value) => {
    const newMetadata = {
      ...metadata,
      [field]: value
    };
    onMetadataChange(newMetadata);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CodeBracketIcon className="w-4 h-4 inline mr-1" />
          Expected Solution *
        </label>
        
        <textarea
          value={correctAnswer || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          rows={8}
          placeholder="# Expected code solution or output..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          required
        />

        {errors.correct_answer && (
          <p className="mt-2 text-sm text-red-600">{errors.correct_answer}</p>
        )}

        <p className="mt-1 text-sm text-gray-500">
          Provide the expected code solution or output that students should produce
        </p>
      </div>

      {/* Test Cases (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <PlayIcon className="w-4 h-4 inline mr-1" />
          Test Cases (optional)
        </label>
        
        <textarea
          value={metadata.test_cases || ''}
          onChange={(e) => handleMetadataChange('test_cases', e.target.value)}
          rows={4}
          placeholder="# Test cases to validate the solution
# Input: [1, 2, 3]
# Expected Output: 6"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
        
        <p className="mt-1 text-sm text-gray-500">
          Define test cases to automatically validate student solutions
        </p>
      </div>

      {/* Allowed Imports */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allowed Python Modules (optional)
        </label>
        
        <input
          type="text"
          value={metadata.allowed_imports || ''}
          onChange={(e) => handleMetadataChange('allowed_imports', e.target.value)}
          placeholder="os, sys, math, datetime"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <p className="mt-1 text-sm text-gray-500">
          Comma-separated list of Python modules students can import (leave empty to allow all)
        </p>
      </div>

      {/* Time Limit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Execution Time Limit (seconds)
          </label>
          
          <input
            type="number"
            value={metadata.time_limit || 5}
            onChange={(e) => handleMetadataChange('time_limit', parseInt(e.target.value) || 5)}
            min="1"
            max="30"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <p className="mt-1 text-sm text-gray-500">
            Maximum time allowed for code execution
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Memory Limit (MB)
          </label>
          
          <input
            type="number"
            value={metadata.memory_limit || 128}
            onChange={(e) => handleMetadataChange('memory_limit', parseInt(e.target.value) || 128)}
            min="16"
            max="512"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <p className="mt-1 text-sm text-gray-500">
            Maximum memory usage allowed
          </p>
        </div>
      </div>

      {/* Grading Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Grading Method
        </label>
        
        <select
          value={metadata.grading_method || 'output_match'}
          onChange={(e) => handleMetadataChange('grading_method', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="output_match">Output Matching</option>
          <option value="test_cases">Test Cases</option>
          <option value="manual">Manual Grading</option>
        </select>
        
        <p className="mt-1 text-sm text-gray-500">
          How should this coding question be evaluated?
        </p>
      </div>

      {/* Information Panel */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Coding Question Setup</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Expected Solution:</strong> Reference code for instructors</li>
              <li>• <strong>Test Cases:</strong> Auto-validation of student code</li>
              <li>• <strong>Limits:</strong> Prevent infinite loops and excessive resource usage</li>
              <li>• <strong>Grading:</strong> Choose between automated and manual evaluation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Warning for Complex Setup */}
      {(!correctAnswer || correctAnswer.trim().length < 10) && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p>Please provide a comprehensive expected solution for proper grading.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}