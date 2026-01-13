// resources/js/Components/Questions/Forms/AnswerConfiguration/MCQOptionsForm.jsx
import React from 'react';
import { PlusIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function MCQOptionsForm({ 
  options = [], 
  onOptionsChange, 
  errors = {} 
}) {
  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + options.length); // A, B, C, D, E...
    const newOptions = [...options, { 
      label: nextLabel, 
      text: '', 
      is_correct: false 
    }];
    onOptionsChange(newOptions);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return; // Keep minimum 2 options
    const newOptions = options.filter((_, i) => i !== index);
    // Re-label options after removal
    const relabeledOptions = newOptions.map((option, i) => ({
      ...option,
      label: String.fromCharCode(65 + i)
    }));
    onOptionsChange(relabeledOptions);
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    };
    onOptionsChange(newOptions);
  };

  const setCorrectOption = (index) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      is_correct: i === index
    }));
    onOptionsChange(newOptions);
  };

  const hasCorrectAnswer = () => {
    return options.some(option => option.is_correct && option.text.trim());
  };

  const hasEmptyOptions = () => {
    return options.some(option => !option.text.trim());
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Answer Options *
      </label>
      
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <input
              type="radio"
              name="correct_option"
              checked={option.is_correct}
              onChange={() => setCorrectOption(index)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
              {option.label}
            </div>
            <input
              type="text"
              value={option.text}
              onChange={(e) => updateOption(index, 'text', e.target.value)}
              placeholder={`Option ${option.label}`}
              className="flex-1 border-0 bg-transparent focus:outline-none focus:ring-0 px-2"
              required
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                title="Remove option"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-3">
        <button
          type="button"
          onClick={addOption}
          disabled={options.length >= 6}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <PlusIcon className="w-4 h-4 inline mr-1" />
          Add Option
        </button>
        <span className="text-xs text-gray-500">
          Select the correct answer by clicking the radio button
        </span>
      </div>

      {/* Validation Messages */}
      {!hasCorrectAnswer() && options.length > 0 && (
        <div className="mt-2 flex items-center text-sm text-amber-600">
          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
          Please select a correct answer
        </div>
      )}

      {hasEmptyOptions() && (
        <div className="mt-2 flex items-center text-sm text-amber-600">
          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
          Please fill in all option texts
        </div>
      )}

      {errors.options && (
        <p className="mt-2 text-sm text-red-600">{errors.options}</p>
      )}

      {/* Helper Text */}
      <p className="mt-2 text-xs text-gray-500">
        Minimum 2 options required, maximum 6 options allowed
      </p>
    </div>
  );
}