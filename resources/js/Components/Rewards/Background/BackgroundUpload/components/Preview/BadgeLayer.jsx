import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * BadgeLayer Component
 * Displays a "Premium" badge in one of four corners
 * 
 * @param {Object} props
 * @param {Boolean} props.enabled - Whether to show the badge
 * @param {String} props.position - Corner position ('top-left', 'top-right', 'bottom-left', 'bottom-right')
 */
const BadgeLayer = ({ enabled, position }) => {
  // Don't render if disabled
  if (!enabled) return null;

  // Map positions to Tailwind classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`absolute ${positionClasses[position] || positionClasses['top-right']}`}>
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
        <Sparkles className="w-3 h-3" />
        Premium
      </div>
    </div>
  );
};

export default BadgeLayer;