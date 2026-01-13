import React from 'react';

/**
 * ToggleSwitch Component
 * Reusable iOS-style toggle switch
 * 
 * @param {Object} props
 * @param {String} props.label - Label text
 * @param {Boolean} props.enabled - Current state
 * @param {Function} props.onChange - Callback when toggled
 * @param {String} props.bgColor - Color theme ('blue', 'purple', 'yellow')
 */
const ToggleSwitch = ({ label, enabled, onChange, bgColor = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    yellow: 'bg-yellow-600',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? colors[bgColor] : 'bg-gray-300'
        }`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;