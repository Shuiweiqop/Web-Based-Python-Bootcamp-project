import React, { useMemo } from 'react';

/**
 * Custom Hook: Generate particles with cached positions
 * Only recalculates when count or color changes
 */
const useParticles = (count, color) => {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
      color,
    }));
  }, [count, color]);
};

/**
 * ParticleLayer Component
 * Renders floating particles with animation
 * 
 * @param {Object} props
 * @param {Boolean} props.enabled - Whether to show particles
 * @param {Number} props.count - Number of particles (5-50)
 * @param {String} props.color - Particle color (hex)
 */
const ParticleLayer = ({ enabled, count, color }) => {
  const particles = useParticles(count, color);

  // Don't render if disabled
  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full animate-particle-float"
          style={{
            backgroundColor: particle.color,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleLayer;