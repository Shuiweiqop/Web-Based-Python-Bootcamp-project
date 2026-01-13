import React, { useMemo } from 'react';
import AnimatedBackground from './AnimatedBackground';
import OverlayLayer from './OverlayLayer';
import ParticleLayer from './ParticleLayer';
import BadgeLayer from './BadgeLayer';

/**
 * Preview Component
 * Main preview container that combines all layers
 * 
 * @param {Object} props
 * @param {String} props.preview - Image URL
 * @param {Object} props.effects - All effects configuration
 */
const Preview = ({ preview, effects }) => {
  // Safely extract effects with defaults
  const safeEffects = useMemo(() => ({
    basic: effects?.basic || { blur: 0, opacity: 1 },
    transform: effects?.transform || { scale: 1, positionX: 50, positionY: 50, objectFit: 'cover' },
    filters: effects?.filters || { blur: 0, brightness: 100, contrast: 100, grayscale: 0, saturate: 100 },
    animation: effects?.animation || { enabled: false, type: 'none', duration: 20 },
    layers: effects?.layers || {
      overlay: { enabled: false, color: '#000000', opacity: 0 },
      particles: { enabled: false, type: 'snow', density: 50, speed: 1 }
    }
  }), [effects]);

  // Don't render if no preview
  if (!preview) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No image selected</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      {/* Background Image Layer */}
      <AnimatedBackground
        preview={preview}
        animation={safeEffects.animation}
        filters={safeEffects.filters}
        transform={safeEffects.transform}
        opacity={safeEffects.basic.opacity}
      />

      {/* Overlay Layer */}
      {safeEffects.layers.overlay?.enabled && (
        <OverlayLayer
          color={safeEffects.layers.overlay.color}
          opacity={safeEffects.layers.overlay.opacity}
        />
      )}

      {/* Particle Layer */}
      {safeEffects.layers.particles?.enabled && (
        <ParticleLayer
          type={safeEffects.layers.particles.type}
          density={safeEffects.layers.particles.density}
          speed={safeEffects.layers.particles.speed}
        />
      )}

      {/* Badge Layer - Always shown for preview */}
      <BadgeLayer />
    </div>
  );
};

export default Preview;