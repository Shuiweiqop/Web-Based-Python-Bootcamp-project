import React from 'react';

/**
 * Slider Component
 * Reusable range input with label and value display
 * 
 * @param {Object} props
 * @param {String} props.label - Label text
 * @param {Number} props.value - Current value
 * @param {String} props.unit - Unit to display (e.g., 'px', '%', 's')
 * @param {Function} props.onChange - Callback when value changes
 * @param {Number} props.min - Minimum value
 * @param {Number} props.max - Maximum value
 * @param {Number} props.step - Step increment
 */
const Slider = ({ 
  label, 
  value, 
  unit = '', 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1 
}) => {
  const handleChange = (e) => {
    const newValue = step % 1 === 0 
      ? parseInt(e.target.value) 
      : parseFloat(e.target.value);
    onChange(newValue);
  };

  return (
    <div>
      <label className="text-sm font-medium flex justify-between mb-2 text-gray-700">
        <span>{label}</span>
        <span className="text-blue-600 font-semibold">
          {value}{unit}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
};

export default Slider;