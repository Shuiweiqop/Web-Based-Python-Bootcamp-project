import React from 'react';
import { Slider, ColorPicker } from '../shared';

/**
 * BasicTab Component
 * Controls basic effects: blur, opacity, and overlay
 * 
 * @param {Object} props
 * @param {Object} props.effects - Current effects state
 * @param {Function} props.updateEffects - Function to update effects
 */
const BasicTab = ({ effects, updateEffects }) => {
  // Provide default values if effects structure is incomplete
  const basicEffects = effects?.basic || { blur: 0, opacity: 1 };
  const overlayEffects = effects?.overlay || { color: '#000000', opacity: 0 };

  return (
    <div className="space-y-4">
      {/* Blur Control */}
      <Slider
        label="Blur"
        value={basicEffects.blur}
        unit="px"
        min={0}
        max={10}
        step={1}
        onChange={(val) => updateEffects('basic.blur', val)}
      />

      {/* Opacity Control */}
      <Slider
        label="Opacity"
        value={Math.round(basicEffects.opacity * 100)}
        unit="%"
        min={0}
        max={100}
        step={10}
        onChange={(val) => updateEffects('basic.opacity', val / 100)}
      />

      {/* Overlay Color Picker */}
      <ColorPicker
        label="Overlay Color"
        value={overlayEffects.color}
        onChange={(val) => updateEffects('overlay.color', val)}
      />

      {/* Overlay Opacity Control */}
      <Slider
        label="Overlay Opacity"
        value={Math.round(overlayEffects.opacity * 100)}
        unit="%"
        min={0}
        max={100}
        step={10}
        onChange={(val) => updateEffects('overlay.opacity', val / 100)}
      />
    </div>
  );
};

export default BasicTab;