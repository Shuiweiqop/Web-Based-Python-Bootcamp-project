import React from 'react';

/**
 * TransformTab Component
 * Controls image transform: scale, position, and fit mode
 * 
 * @param {Object} props
 * @param {Object} props.effects - Current effects state
 * @param {Function} props.updateEffects - Function to update effects
 */
const TransformTab = ({ effects, updateEffects }) => {
  // Default transform values
  const transform = {
    scale: 1,
    positionX: 50,
    positionY: 50,
    objectFit: 'cover',
    ...(effects?.transform || {})
  };

  const handleChange = (key, value) => {
    updateEffects('transform', {
      ...transform,
      [key]: value
    });
  };

  const handleReset = () => {
    updateEffects('transform', {
      scale: 1,
      positionX: 50,
      positionY: 50,
      objectFit: 'cover'
    });
  };

  return (
    <div className="space-y-6">
      {/* Fit Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fit Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'cover', label: 'Cover', desc: 'Fill container' },
            { value: 'contain', label: 'Contain', desc: 'Show full image' },
            { value: 'fill', label: 'Fill', desc: 'Stretch to fit' },
            { value: 'none', label: 'Original', desc: 'Original size' }
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleChange('objectFit', mode.value)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                transform.objectFit === mode.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm text-gray-800">
                {mode.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {mode.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Scale
          </label>
          <span className="text-sm text-gray-600">
            {Math.round(transform.scale * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={transform.scale}
          onChange={(e) => handleChange('scale', parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>50%</span>
          <span>100%</span>
          <span>200%</span>
        </div>
      </div>

      {/* Horizontal Position */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Horizontal Position
          </label>
          <span className="text-sm text-gray-600">
            {transform.positionX}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={transform.positionX}
          onChange={(e) => handleChange('positionX', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Left</span>
          <span>Center</span>
          <span>Right</span>
        </div>
      </div>

      {/* Vertical Position */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Vertical Position
          </label>
          <span className="text-sm text-gray-600">
            {transform.positionY}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={transform.positionY}
          onChange={(e) => handleChange('positionY', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Top</span>
          <span>Center</span>
          <span>Bottom</span>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Reset Transform
      </button>

      {/* Current Values Display */}
      <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Scale:</span>
          <span className="font-medium">{transform.scale}x</span>
        </div>
        <div className="flex justify-between">
          <span>Position:</span>
          <span className="font-medium">
            X: {transform.positionX}%, Y: {transform.positionY}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Fit Mode:</span>
          <span className="font-medium capitalize">{transform.objectFit}</span>
        </div>
      </div>
    </div>
  );
};

export default TransformTab;