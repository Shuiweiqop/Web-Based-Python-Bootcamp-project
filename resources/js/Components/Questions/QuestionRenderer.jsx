// resources/js/Components/Questions/QuestionRenderer.jsx
import React from 'react';
import MCQOptionsForm from './Forms/AnswerConfiguration/MCQOptionsForm';
import TrueFalseForm from './Forms/AnswerConfiguration/TrueFalseForm';
import ShortAnswerForm from './Forms/AnswerConfiguration/ShortAnswerForm';
import CodingAnswerForm from "./Forms/AnswerConfiguration/CodingAnswerForm.jsx";
export default function QuestionRenderer({ 
  type, 
  data, 
  onChange, 
  errors = {} 
}) {
  const handleAnswerChange = (field, value) => {
    onChange(field, value);
  };

  const handleOptionsChange = (newOptions) => {
    onChange('options', newOptions);
  };

  const handleMetadataChange = (newMetadata) => {
    onChange('metadata', newMetadata);
  };

  // Render the appropriate answer configuration component based on question type
  const renderAnswerConfiguration = () => {
    switch (type) {
      case 'mcq':
        return (
          <MCQOptionsForm
            options={data.options || [
              { label: 'A', text: '', is_correct: false },
              { label: 'B', text: '', is_correct: false },
              { label: 'C', text: '', is_correct: false },
              { label: 'D', text: '', is_correct: false },
            ]}
            onOptionsChange={handleOptionsChange}
            errors={errors}
          />
        );

      case 'true_false':
        return (
          <TrueFalseForm
            correctAnswer={data.correct_answer || ''}
            onAnswerChange={(value) => handleAnswerChange('correct_answer', value)}
            errors={errors}
          />
        );

      case 'short_answer':
        return (
          <ShortAnswerForm
            correctAnswer={data.correct_answer || ''}
            onAnswerChange={(value) => handleAnswerChange('correct_answer', value)}
            errors={errors}
          />
        );

      case 'coding':
        return (
          <CodingAnswerForm
            correctAnswer={data.correct_answer || ''}
            onAnswerChange={(value) => handleAnswerChange('correct_answer', value)}
            metadata={data.metadata || {}}
            onMetadataChange={handleMetadataChange}
            errors={errors}
          />
        );

      default:
        return (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-500">Please select a question type to configure answers</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Answer Configuration</h3>
        <p className="text-sm text-gray-600 mt-1">
          Set up the correct answer and options based on question type
        </p>
      </div>

      {renderAnswerConfiguration()}
    </div>
  );
}