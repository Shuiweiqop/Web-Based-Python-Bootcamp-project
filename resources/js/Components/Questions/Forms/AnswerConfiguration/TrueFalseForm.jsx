// resources/js/Components/Questions/Forms/AnswerConfiguration/TrueFalseForm.jsx
import React from 'react';

export default function TrueFalseForm({ 
  correctAnswer, 
  onAnswerChange, 
  errors = {} 
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Correct Answer *
      </label>
      
      <div className="space-y-3">
        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name="true_false_answer"
            value="true"
            checked={correctAnswer === 'true'}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 mr-3"
          />
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">True</span>
          </div>
        </label>

        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="radio"
            name="true_false_answer"
            value="false"
            checked={correctAnswer === 'false'}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 mr-3"
          />
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">False</span>
          </div>
        </label>
      </div>

      {errors.correct_answer && (
        <p className="mt-2 text-sm text-red-600">{errors.correct_answer}</p>
      )}

      {!correctAnswer && (
        <p className="mt-2 text-sm text-amber-600">Please select the correct answer</p>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Select whether the statement in the question is true or false
      </p>
    </div>
  );
}