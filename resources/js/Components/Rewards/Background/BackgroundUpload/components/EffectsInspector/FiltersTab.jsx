import React from 'react';

/**
 * FiltersTab Component
 * Controls image filters: brightness, contrast, grayscale, and saturation
 * 
 * @param {Object} props
 * @param {Object} props.effects - Current effects state
 * @param {Function} props.updateEffects - Function to update effects
 */
const FiltersTab = ({ effects, updateEffects }) => {
  // Default filter values with safe access
  const filters = {
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    saturate: 100,
    blur: 0,
    ...(effects?.filters || {})
  };

  const hasActiveFilters = 
    filters.brightness !== 100 ||
    filters.contrast !== 100 ||
    filters.grayscale > 0 ||
    filters.saturate !== 100;

  const handleChange = (key, value) => {
    updateEffects('filters', {
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    updateEffects('filters', {
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      saturate: 100,
      blur: 0
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with Reset Button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Filters active</span>
          <button
            onClick={resetFilters}
            className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Brightness Control */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Brightness
          </label>
          <span className="text-sm text-gray-600">
            {filters.brightness}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          step={10}
          value={filters.brightness}
          onChange={(e) => handleChange('brightness', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Dark (0%)</span>
          <span>Normal (100%)</span>
          <span>Bright (200%)</span>
        </div>
      </div>

      {/* Contrast Control */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Contrast
          </label>
          <span className="text-sm text-gray-600">
            {filters.contrast}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          step={10}
          value={filters.contrast}
          onChange={(e) => handleChange('contrast', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Low (0%)</span>
          <span>Normal (100%)</span>
          <span>High (200%)</span>
        </div>
      </div>

      {/* Grayscale Control */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Grayscale
          </label>
          <span className="text-sm text-gray-600">
            {filters.grayscale}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={filters.grayscale}
          onChange={(e) => handleChange('grayscale', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Color (0%)</span>
          <span>Black & White (100%)</span>
        </div>
      </div>

      {/* Saturation Control */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Saturation
          </label>
          <span className="text-sm text-gray-600">
            {filters.saturate}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          step={10}
          value={filters.saturate}
          onChange={(e) => handleChange('saturate', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Desaturated (0%)</span>
          <span>Normal (100%)</span>
          <span>Vibrant (200%)</span>
        </div>
      </div>

      {/* Current Values Display */}
      <div className="p-3 bg-gray-50 rounded-lg space-y-1 text-xs">
        <div className="font-medium text-gray-700 mb-2">Current Settings:</div>
        <div className="grid grid-cols-2 gap-2 text-gray-600">
          <div className="flex justify-between">
            <span>Brightness:</span>
            <span className="font-medium">{filters.brightness}%</span>
          </div>
          <div className="flex justify-between">
            <span>Contrast:</span>
            <span className="font-medium">{filters.contrast}%</span>
          </div>
          <div className="flex justify-between">
            <span>Grayscale:</span>
            <span className="font-medium">{filters.grayscale}%</span>
          </div>
          <div className="flex justify-between">
            <span>Saturation:</span>
            <span className="font-medium">{filters.saturate}%</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800">
        <span className="font-medium">💡 Tip:</span> Combine filters to create unique moods (e.g., low saturation + high contrast for vintage look).
      </div>
    </div>
  );
};

export default FiltersTab;