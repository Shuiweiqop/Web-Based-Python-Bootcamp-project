import React from 'react';
import { Slider, ToggleSwitch } from '../shared';

const AnimationTab = ({ effects, updateEffects }) => {
  const animationEffects = effects?.animation || { 
    enabled: false, 
    type: 'none', 
    duration: 20,
    intensity: 1
  };

  const animationTypes = [
    { id: 'scale', label: 'Scale', description: 'Zoom in/out' },
    { id: 'rotate', label: 'Rotate', description: 'Spin 360°' },
    { id: 'float', label: 'Float', description: 'Up and down' },
    { id: 'ken-burns', label: 'Ken Burns', description: 'Cinematic zoom' },
  ];

  const handleToggle = (val) => {
    updateEffects('animation', { enabled: val });
  };

  return (
    <div className="space-y-4">
      {/* Animation Toggle */}
      <ToggleSwitch
        label="Enable Animation"
        enabled={animationEffects.enabled}
        onChange={handleToggle}
        bgColor="blue"
      />

      {/* Show controls only when animation is enabled */}
      {animationEffects.enabled && (
        <>
          {/* Animation Type Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-700">
              Animation Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {animationTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    updateEffects('animation', { type: type.id });
                  }}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    animationEffects.type === type.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-semibold">{type.label}</div>
                  <div className="text-xs opacity-75 mt-0.5">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Animation Duration Slider */}
          <Slider
            label="Duration"
            value={animationEffects.duration}
            unit="s"
            min={5}
            max={60}
            step={5}
            onChange={(val) => {
              updateEffects('animation', { duration: val });
            }}
          />

          {/* Animation Intensity Slider */}
          <Slider
            label="Intensity"
            value={animationEffects.intensity}
            unit="x"
            min={0.5}
            max={2}
            step={0.1}
            onChange={(val) => {
              updateEffects('animation', { intensity: val });
            }}
          />

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            💡 <strong>Tip:</strong> Longer durations create smoother, more subtle animations.
          </div>
        </>
      )}
    </div>
  );
};

export default AnimationTab;
