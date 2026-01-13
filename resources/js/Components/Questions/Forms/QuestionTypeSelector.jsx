// resources/js/Components/Questions/Forms/QuestionTypeSelector.jsx
import React from 'react';
import { 
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

export default function QuestionTypeSelector({ 
  selectedType, 
  onTypeChange, 
  typeOptions = {
    'mcq': 'Multiple Choice',
    'coding': 'Coding Exercise', 
    'true_false': 'True/False',
    'short_answer': 'Short Answer'
  },
  error = null
}) {
  const getTypeIcon = (type) => {
    const icons = {
      mcq: <QuestionMarkCircleIcon className="w-5 h-5" />,
      coding: <CodeBracketIcon className="w-5 h-5" />,
      true_false: <CheckCircleIcon className="w-5 h-5" />,
      short_answer: <PencilIcon className="w-5 h-5" />
    };
    return icons[type] || icons.mcq;
  };

  const getTypeDescription = (type) => {
    const descriptions = {
      mcq: 'Multiple choice with selectable options',
      coding: 'Code writing and execution questions',
      true_false: 'Simple true or false questions',
      short_answer: 'Text-based short response questions'
    };
    return descriptions[type] || '';
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Question Type</h3>
        <p className="text-sm text-gray-600 mt-1">
          Select the type of question you want to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(typeOptions).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onTypeChange(key)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedType === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                selectedType === key 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {getTypeIcon(key)}
              </div>
              <span className="font-medium text-gray-900">{label}</span>
            </div>
            <p className="text-sm text-gray-500">
              {getTypeDescription(key)}
            </p>
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}