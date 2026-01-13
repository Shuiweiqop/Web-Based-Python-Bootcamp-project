import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Background Display Component
 * Renders background image with effects, animations, filters and rarity effects
 * 
 * @param {Object} props
 * @param {string} props.backgroundUrl - Background image URL
 * @param {Object} props.effects - Effect configuration
 * @param {number} props.effects.blur - Blur amount (0-10)
 * @param {number} props.effects.opacity - Opacity (0-1)
 * @param {string} props.effects.overlayColor - Overlay color (hex)
 * @param {number} props.effects.overlayOpacity - Overlay opacity (0-1)
 * @param {Object} props.effects.animation - Animation config
 * @param {Object} props.effects.filters - Filter config
 * @param {Object} props.effects.layers - Layer config
 * @param {string} props.rarity - Rarity level: 'common' | 'rare' | 'epic' | 'legendary'
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.className - Additional CSS classes
 */
export default function BackgroundDisplay({
  backgroundUrl,
  effects = {
    blur: 0,
    opacity: 1,
    overlayColor: '#000000',
    overlayOpacity: 0,
    animation: {
      enabled: false,
      type: 'none',
      duration: 20,
      intensity: 1,
    },
    filters: {
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      saturate: 100,
    },
    layers: {
      particles: false,
      particleColor: '#ffffff',
      particleCount: 20,
      badge: false,
      badgePosition: 'top-right',
    },
  },
  rarity = 'common',
  children,
  className = '',
}) {
  // Get animation class
  const getAnimationClass = () => {
    if (!effects?.animation?.enabled) return '';
    
    const animationMap = {
      scale: 'animate-bg-scale',
      rotate: 'animate-bg-rotate',
      float: 'animate-bg-float',
      'Ken-Burns': 'animate-ken-burns',
    };
    
    return animationMap[effects.animation.type] || '';
  };

  // Build filter string with safe checks
  const getFilterString = () => {
    const filters = [];
    
    // Check blur
    if (effects?.blur && effects.blur > 0) {
      filters.push(`blur(${effects.blur}px)`);
    }
    
    // Safely check filters object
    if (effects?.filters) {
      const f = effects.filters;
      
      if (f.brightness !== undefined && f.brightness !== 100) {
        filters.push(`brightness(${f.brightness}%)`);
      }
      if (f.contrast !== undefined && f.contrast !== 100) {
        filters.push(`contrast(${f.contrast}%)`);
      }
      if (f.grayscale !== undefined && f.grayscale > 0) {
        filters.push(`grayscale(${f.grayscale}%)`);
      }
      if (f.saturate !== undefined && f.saturate !== 100) {
        filters.push(`saturate(${f.saturate}%)`);
      }
    }
    
    return filters.length > 0 ? filters.join(' ') : undefined;
  };

  // Build background style
  const getBackgroundStyle = () => {
    return {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      filter: getFilterString(),
      opacity: effects?.opacity ?? 1,
      animationDuration: effects?.animation?.enabled ? `${effects.animation.duration}s` : undefined,
    };
  };

  // Overlay style
  const getOverlayStyle = () => {
    if (!effects?.overlayOpacity || effects.overlayOpacity === 0) return null;

    return {
      position: 'absolute',
      inset: 0,
      backgroundColor: effects.overlayColor || '#000000',
      opacity: effects.overlayOpacity,
      zIndex: 1,
    };
  };

  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Background layer with animations */}
      <div 
        style={getBackgroundStyle()} 
        className={getAnimationClass()}
      />

      {/* Overlay layer */}
      {getOverlayStyle() && <div style={getOverlayStyle()} />}

      {/* Particle layer */}
      {effects?.layers?.particles && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {[...Array(effects.layers.particleCount || 20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-particle-float"
              style={{
                backgroundColor: effects.layers.particleColor || '#ffffff',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Badge overlay */}
      {effects?.layers?.badge && (
        <div
          className={`absolute z-20 ${
            effects.layers.badgePosition === 'top-left' ? 'top-4 left-4' :
            effects.layers.badgePosition === 'top-right' ? 'top-4 right-4' :
            effects.layers.badgePosition === 'bottom-left' ? 'bottom-4 left-4' :
            'bottom-4 right-4'
          }`}
        >
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-pulse-slow">
            <Sparkles className="w-4 h-4" />
            Premium
          </div>
        </div>
      )}

      {/* Rarity effects */}
      {rarity === 'legendary' && (
        <>
          {/* Gold glow */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float-delayed" />
          </div>

          {/* Sparkle particles */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={`legendary-${i}`}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-sparkle-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {rarity === 'epic' && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-15 animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl opacity-15 animate-pulse-slow-delayed" />
        </div>
      )}

      {rarity === 'rare' && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse-slow" />
        </div>
      )}

      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(-10px) translateX(-10px);
          }
        }

        @keyframes sparkle-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes bg-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        @keyframes bg-rotate {
          0% {
            transform: rotate(0deg) scale(1.2);
          }
          100% {
            transform: rotate(360deg) scale(1.2);
          }
        }
        
        @keyframes bg-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes ken-burns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.2) translate(-10%, -10%);
          }
        }
        
        @keyframes particle-float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(20px);
            opacity: 0;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slow-delayed {
          animation: pulse-slow 4s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-sparkle-fall {
          animation: sparkle-fall linear infinite;
        }

        .animate-bg-scale {
          animation: bg-scale ease-in-out infinite;
        }

        .animate-bg-rotate {
          animation: bg-rotate linear infinite;
        }

        .animate-bg-float {
          animation: bg-float ease-in-out infinite;
        }

        .animate-ken-burns {
          animation: ken-burns ease-out forwards;
        }

        .animate-particle-float {
          animation: particle-float linear infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Simple Background - Quick display without effects
 * Perfect for performance-critical pages
 */
export function SimpleBackground({ backgroundUrl, children, className = '' }) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {backgroundUrl && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.8,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Premium Background - Legendary effects preset
 * Adds dramatic effects for special occasions
 */
export function PremiumBackground({
  backgroundUrl,
  children,
  className = '',
}) {
  return (
    <BackgroundDisplay
      backgroundUrl={backgroundUrl}
      rarity="legendary"
      effects={{
        blur: 2,
        opacity: 0.9,
        overlayColor: '#000000',
        overlayOpacity: 0.3,
        animation: {
          enabled: true,
          type: 'Ken-Burns',
          duration: 30,
        },
        filters: {
          brightness: 110,
          contrast: 110,
          grayscale: 0,
          saturate: 120,
        },
        layers: {
          particles: true,
          particleColor: '#FFD700',
          particleCount: 30,
          badge: true,
          badgePosition: 'top-right',
        },
      }}
      className={className}
    >
      {children}
    </BackgroundDisplay>
  );
}

/**
 * Animated Background - Scale animation preset
 */
export function AnimatedBackground({
  backgroundUrl,
  animationType = 'scale',
  children,
  className = '',
}) {
  return (
    <BackgroundDisplay
      backgroundUrl={backgroundUrl}
      rarity="common"
      effects={{
        blur: 0,
        opacity: 1,
        overlayColor: '#000000',
        overlayOpacity: 0,
        animation: {
          enabled: true,
          type: animationType,
          duration: 20,
        },
        filters: {
          brightness: 100,
          contrast: 100,
          grayscale: 0,
          saturate: 100,
        },
        layers: {
          particles: false,
          badge: false,
        },
      }}
      className={className}
    >
      {children}
    </BackgroundDisplay>
  );
}