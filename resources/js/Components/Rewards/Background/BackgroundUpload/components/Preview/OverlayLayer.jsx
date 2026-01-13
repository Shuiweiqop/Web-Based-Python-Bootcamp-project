import React from 'react';

/**
 * OverlayLayer Component
 * Renders a solid color overlay on top of the background
 * 
 * @param {Object} props
 * @param {String} props.color - Hex color code (e.g., '#000000')
 * @param {Number} props.opacity - Opacity value (0-1)
 */
const OverlayLayer = ({ color, opacity }) => {
  // Don't render if opacity is 0
  if (opacity <= 0) return null;

  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: color,
        opacity,
      }}
    />
  );
};

export default OverlayLayer;