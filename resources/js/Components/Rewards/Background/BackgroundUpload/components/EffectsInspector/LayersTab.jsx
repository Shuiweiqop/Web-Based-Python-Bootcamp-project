import React from 'react';
import { Slider, ColorPicker, ToggleSwitch } from '../shared';

/**
 * LayersTab Component
 * Controls layer effects: snow and badge
 * 
 * @param {Object} props
 * @param {Object} props.effects - Current effects state
 * @param {Function} props.updateEffects - Function to update effects
 */
const LayersTab = ({ effects, updateEffects }) => {
  // Helper function to update nested layer properties
  const updateLayer = (key, value) => {
    updateEffects('layers', { [key]: value });
  };

  const badgePositions = [
    { id: 'top-left', label: 'Top Left' },
    { id: 'top-right', label: 'Top Right' },
    { id: 'bottom-left', label: 'Bottom Left' },
    { id: 'bottom-right', label: 'Bottom Right' },
  ];

  return (
    <div className="space-y-6">
      {/* Snow Layer Section */}
      <div className="space-y-4">
        <ToggleSwitch
          label="Snow Effect ❄️"
          enabled={effects.layers.particles}
          onChange={(val) => updateLayer('particles', val)}
          bgColor="blue"
        />

        {effects.layers.particles && (
          <div className="pl-4 space-y-4 border-l-2 border-blue-200">
            {/* Snow Color */}
            <ColorPicker
              label="Snow Color"
              value={effects.layers.particleColor}
              onChange={(val) => updateLayer('particleColor', val)}
            />

            {/* Snow Intensity */}
            <Slider
              label="Snow Intensity"
              value={effects.layers.particleCount}
              min={20}
              max={100}
              step={10}
              onChange={(val) => updateLayer('particleCount', val)}
            />
            
            {/* Speed Control */}
            <Slider
              label="Snow Speed"
              value={effects.layers.particleSpeed || 5}
              min={2}
              max={10}
              step={1}
              onChange={(val) => updateLayer('particleSpeed', val)}
            />

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              ❄️ Adjust the color and intensity of falling snowflakes
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Badge Layer Section */}
      <div className="space-y-4">
        <ToggleSwitch
          label="Premium Badge"
          enabled={effects.layers.badge}
          onChange={(val) => updateLayer('badge', val)}
          bgColor="yellow"
        />

        {effects.layers.badge && (
          <div className="pl-4 space-y-4 border-l-2 border-yellow-200">
            {/* Badge Position */}
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-700">
                Badge Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                {badgePositions.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => updateLayer('badgePosition', pos.id)}
                    className={`p-3 rounded-lg text-xs font-medium transition-all ${
                      effects.layers.badgePosition === pos.id
                        ? 'bg-yellow-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
              ✨ The premium badge helps highlight special content.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayersTab;