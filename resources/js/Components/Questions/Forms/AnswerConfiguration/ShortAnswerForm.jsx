// resources/js/Components/Questions/Forms/AnswerConfiguration/ShortAnswerForm.jsx
import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function ShortAnswerForm({ 
  correctAnswer, 
  onAnswerChange, 
  errors = {} 
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Correct Answer *
      </label>
      
      <textarea
        value={correctAnswer || ''}
        onChange={(e) => onAnswerChange(e.target.value)}
        rows={3}
        placeholder="Expected answer text..."
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />

      {errors.correct_answer && (
        <p className="mt-2 text-sm text-red-600">{errors.correct_answer}</p>
      )}

      {/* Grading Information */}
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Grading Information</p>
            <p>
              Short answer questions require manual grading by instructors. 
              The answer you provide will be used as a reference for grading.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm text-gray-600">
        <p><strong>Grading Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Provide a comprehensive model answer</li>
          <li>Include key points that should be present</li>
          <li>Consider multiple acceptable variations</li>
          <li>Be clear about required vs. optional elements</li>
        </ul>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        This answer will be shown to instructors during manual grading
      </p>
    </div>
  );
}