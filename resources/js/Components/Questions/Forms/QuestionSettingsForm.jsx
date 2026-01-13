// resources/js/Components/Questions/Forms/QuestionSettingsForm.jsx
import React from 'react';

export default function QuestionSettingsForm({ 
  data = {},
  onChange, 
  errors = {},
  difficultyOptions = {
    1: 'Easy',
    2: 'Medium', 
    3: 'Hard'
  },
  statusOptions = {
    'active': 'Active',
    'inactive': 'Inactive'
  }
}) {
  const handleChange = (field, value) => {
    if (onChange) {
      onChange(field, value);
    }
  };

  const safeData = {
    points: 10,
    difficulty_level: 1,
    status: 'active',
    order: '',
    ...data
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Question Settings</h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure points, difficulty, and other options
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Points *
          </label>
          <input
            type="number"
            value={safeData.points}
            onChange={(e) => handleChange('points', parseInt(e.target.value) || 10)}
            min="1"
            max="100"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Points awarded for correct answer</p>
          {errors.points && (
            <p className="mt-2 text-sm text-red-600">{errors.points}</p>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty *
          </label>
          <select
            value={safeData.difficulty_level}
            onChange={(e) => handleChange('difficulty_level', parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {Object.entries(difficultyOptions).map(([key, label]) => (
              <option key={key} value={parseInt(key)}>
                {label}
              </option>
            ))}
          </select>
          {errors.difficulty_level && (
            <p className="mt-2 text-sm text-red-600">{errors.difficulty_level}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={safeData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(statusOptions).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-2 text-sm text-red-600">{errors.status}</p>
          )}
        </div>
      </div>

      {/* Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Order (optional)
        </label>
        <input
          type="number"
          value={safeData.order}
          onChange={(e) => handleChange('order', parseInt(e.target.value) || '')}
          min="0"
          placeholder="Auto-assigned if left empty"
          className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">
          Controls the order this question appears in the test
        </p>
        {errors.order && (
          <p className="mt-2 text-sm text-red-600">{errors.order}</p>
        )}
      </div>
    </div>
  );
}