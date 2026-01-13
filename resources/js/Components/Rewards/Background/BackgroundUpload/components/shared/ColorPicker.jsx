import React from 'react';

/**
 * ColorPicker Component
 * Reusable color picker with visual swatch and hex input
 * 
 * @param {Object} props
 * @param {String} props.label - Label text
 * @param {String} props.value - Current hex color value (e.g., '#000000')
 * @param {Function} props.onChange - Callback when color changes
 */
const ColorPicker = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block text-gray-700">
        {label}
      </label>
      <div className="flex gap-2">
        {/* Color Swatch */}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
        />
        
        {/* Hex Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-mono focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default ColorPicker;