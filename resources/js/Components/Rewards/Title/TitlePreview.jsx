import React from 'react';
import { Sparkles, User, Trophy } from 'lucide-react';

/**
 * Title Preview Component
 * Shows how the title will appear in different contexts
 */
export default function TitlePreview({ titleConfig }) {
  const getTitleStyle = () => {
    const baseStyle = {
      fontWeight: 'bold',
    };

    if (titleConfig.gradient?.enabled) {
      return {
        ...baseStyle,
        background: `linear-gradient(90deg, ${titleConfig.gradient.from}, ${titleConfig.gradient.to})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      };
    }

    return {
      ...baseStyle,
      color: titleConfig.text_color || '#3B82F6',
    };
  };

  const getBorderStyle = () => {
    if (titleConfig.gradient?.enabled) {
      return {
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: titleConfig.gradient.from,
      };
    }
    return {
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: titleConfig.text_color || '#3B82F6',
    };
  };

  const getEffectClasses = () => {
    const classes = [];
    if (titleConfig.effects?.glow) classes.push('title-glow');
    if (titleConfig.effects?.sparkle) classes.push('title-sparkle');
    if (titleConfig.effects?.wave) classes.push('title-wave');
    if (titleConfig.effects?.neon) classes.push('title-neon');
    if (titleConfig.effects?.rainbow) classes.push('title-rainbow');
    if (titleConfig.effects?.pulse) classes.push('title-pulse');
    if (titleConfig.effects?.rotate_glow) classes.push('title-rotate-glow');
    if (titleConfig.effects?.shadow_stack) classes.push('title-shadow-stack');
    if (titleConfig.effects?.three_d) classes.push('title-3d');
    if (titleConfig.effects?.glitter) classes.push('title-glitter');
    if (titleConfig.effects?.shine) classes.push('title-shine');
    if (titleConfig.effects?.confetti) classes.push('title-confetti');
    if (titleConfig.effects?.particles) classes.push('title-particles');
    if (titleConfig.effects?.shimmer) classes.push('title-shimmer');
    if (titleConfig.effects?.fireworks) classes.push('title-fireworks');
    if (titleConfig.effects?.bubbles) classes.push('title-bubbles');
    return classes.join(' ');
  };

  const renderIcon = () => {
    if (!titleConfig.icon || titleConfig.icon === 'none') return null;
    
    const icons = {
      crown: '👑',
      star: '⭐',
      sparkle: '✨',
      zap: '⚡',
      fire: '🔥',
      gem: '💎',
      trophy: '🏆',
      medal: '🏅',
    };
    
    return <span className="text-lg">{icons[titleConfig.icon]}</span>;
  };

  const TitleBadge = ({ size = 'normal' }) => {
    const sizeClasses = {
      normal: 'px-4 py-2 text-base',
      small: 'px-2 py-0.5 text-xs',
      tiny: 'px-2 py-0.5 text-[0.625rem]',
    };

    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full ${sizeClasses[size]} ${getEffectClasses()}`}
        style={{ ...getTitleStyle(), ...getBorderStyle() }}
      >
        {size === 'normal' && renderIcon()}
        <span>{titleConfig.title_text}</span>
        {titleConfig.effects?.sparkle && size === 'normal' && (
          <Sparkles className="w-4 h-4 animate-pulse" />
        )}
      </div>
    );
  };

  // Count active effects
  const activeEffects = Object.entries(titleConfig.effects || {}).filter(([key, value]) => value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Title Preview</h3>
          <p className="text-sm text-gray-600">See how your title will appear</p>
        </div>
      </div>

      {/* Main Preview */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6">
        <div className="bg-white rounded-lg p-8">
          <p className="text-xs text-gray-500 mb-4 text-center">Profile Display</p>
          
          <div className="flex flex-col items-center gap-4">
            {/* User avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>

            {/* User name + Title */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xl font-semibold text-gray-900">
                Student Name
              </span>
              
              {titleConfig.title_text && <TitleBadge size="normal" />}
            </div>

            {/* User info */}
            <p className="text-sm text-gray-500">Python enthusiast · 1,234 points</p>
          </div>
        </div>
      </div>

      {/* Additional Context Previews */}
      <div className="grid grid-cols-2 gap-4">
        {/* Leaderboard Preview */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Leaderboard
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
              <span className="text-sm font-bold text-yellow-600">1</span>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">You</span>
                {titleConfig.title_text && <TitleBadge size="small" />}
              </div>
              <span className="text-sm font-semibold text-gray-700">1.2K</span>
            </div>
          </div>
        </div>

        {/* Comment/Chat Preview */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-600 mb-3">Forum Post</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">Student</span>
                  {titleConfig.title_text && <TitleBadge size="tiny" />}
                </div>
                <p className="text-xs text-gray-600">Great lesson!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title Info */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-4">Title Configuration</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Title Text</span>
            <span className="text-sm font-semibold text-gray-900">
              {titleConfig.title_text || 'Not set'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Style</span>
            <span className="text-sm font-semibold text-gray-900">
              {titleConfig.gradient?.enabled ? 'Gradient' : 'Solid Color'}
            </span>
          </div>

          {titleConfig.gradient?.enabled && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 block mb-2">Gradient Colors</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: titleConfig.gradient.from }}
                />
                <span className="text-xs text-gray-500">→</span>
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: titleConfig.gradient.to }}
                />
              </div>
            </div>
          )}

          {!titleConfig.gradient?.enabled && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 block mb-2">Text Color</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: titleConfig.text_color }}
                />
                <span className="text-xs font-mono text-gray-700">
                  {titleConfig.text_color}
                </span>
              </div>
            </div>
          )}

          {activeEffects.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 block mb-2">Active Effects ({activeEffects.length})</span>
              <div className="flex flex-wrap gap-2">
                {titleConfig.effects?.glow && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    ✨ Glow
                  </span>
                )}
                {titleConfig.effects?.sparkle && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                    ✨ Sparkle
                  </span>
                )}
                {titleConfig.effects?.wave && (
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded">
                    🌊 Wave
                  </span>
                )}
                {titleConfig.effects?.pulse && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                    💓 Pulse
                  </span>
                )}
                {titleConfig.effects?.neon && (
                  <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded">
                    💡 Neon
                  </span>
                )}
                {titleConfig.effects?.rainbow && (
                  <span className="px-2 py-1 bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 text-gray-700 text-xs rounded">
                    🌈 Rainbow
                  </span>
                )}
                {titleConfig.effects?.three_d && (
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                    🎲 3D
                  </span>
                )}
                {titleConfig.effects?.rotate_glow && (
                  <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded">
                    🌀 Rotate
                  </span>
                )}
                {titleConfig.effects?.shadow_stack && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                    📚 Shadows
                  </span>
                )}
                {titleConfig.effects?.glitter && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                    ⭐ Glitter
                  </span>
                )}
                {titleConfig.effects?.shine && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">
                    ✨ Shine
                  </span>
                )}
                {titleConfig.effects?.confetti && (
                  <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded">
                    🎉 Confetti
                  </span>
                )}
                {titleConfig.effects?.particles && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">
                    ✨ Particles
                  </span>
                )}
                {titleConfig.effects?.shimmer && (
                  <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded">
                    💫 Shimmer
                  </span>
                )}
                {titleConfig.effects?.fireworks && (
                  <span className="px-2 py-1 bg-fuchsia-100 text-fuchsia-700 text-xs rounded">
                    🎆 Fireworks
                  </span>
                )}
                {titleConfig.effects?.bubbles && (
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded">
                    🫧 Bubbles
                  </span>
                )}
              </div>
            </div>
          )}

          {titleConfig.icon && titleConfig.icon !== 'none' && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Icon</span>
              <span className="text-lg">
                {titleConfig.icon === 'crown' && '👑'}
                {titleConfig.icon === 'star' && '⭐'}
                {titleConfig.icon === 'sparkle' && '✨'}
                {titleConfig.icon === 'zap' && '⚡'}
                {titleConfig.icon === 'fire' && '🔥'}
                {titleConfig.icon === 'gem' && '💎'}
                {titleConfig.icon === 'trophy' && '🏆'}
                {titleConfig.icon === 'medal' && '🏅'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CSS for ALL effects - ENHANCED VERSION */}
      <style>{`
        /* Basic Effects */
        @keyframes glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 2px currentColor) drop-shadow(0 0 4px currentColor);
          }
          50% {
            filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 12px currentColor);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }

        /* Advanced Effects */
        @keyframes neon-flicker {
          0%, 100% {
            text-shadow: 
              0 0 10px currentColor,
              0 0 20px currentColor,
              0 0 30px currentColor,
              0 0 40px currentColor;
          }
          50% {
            text-shadow: 
              0 0 5px currentColor,
              0 0 10px currentColor,
              0 0 15px currentColor,
              0 0 20px currentColor;
          }
        }

        @keyframes rainbow-shift {
          0% { filter: hue-rotate(0deg) saturate(1.5); }
          100% { filter: hue-rotate(360deg) saturate(1.5); }
        }

        @keyframes rotate-halo {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes glitter-sparkle {
          0%, 100% { 
            opacity: 0;
            transform: scale(0.5);
          }
          50% { 
            opacity: 1;
            transform: scale(1);
          }
        }

        /* New Decorative Effects */
        @keyframes shine-sweep {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(50px) translateX(15px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes particle-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        @keyframes shimmer-wave {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes firework-burst {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--fx), var(--fy)) scale(1);
            opacity: 0;
          }
        }

        @keyframes bubble-rise {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-50px) scale(1.2);
            opacity: 0;
          }
        }

        /* Effect Classes */
        .title-glow {
          animation: glow-pulse 2s ease-in-out infinite;
        }

        .title-wave {
          animation: wave 2s ease-in-out infinite;
        }

        .title-pulse {
          animation: pulse-scale 2s ease-in-out infinite;
        }

        .title-neon {
          animation: neon-flicker 1.5s ease-in-out infinite;
        }

        .title-rainbow {
          animation: rainbow-shift 3s linear infinite;
        }

        .title-sparkle {
          position: relative;
        }

        .title-sparkle::before {
          content: '✨';
          position: absolute;
          left: -24px;
          animation: float 3s ease-in-out infinite;
        }

        .title-rotate-glow {
          position: relative;
        }

        .title-rotate-glow::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: inherit;
          background: conic-gradient(
            from 0deg,
            transparent 0deg 70deg,
            currentColor 90deg 110deg,
            transparent 180deg 250deg,
            currentColor 270deg 290deg,
            transparent 360deg
          );
          opacity: 0.4;
          animation: rotate-halo 3s linear infinite;
          pointer-events: none;
          z-index: -1;
        }

        .title-shadow-stack {
          text-shadow: 
            2px 2px 0px rgba(0,0,0,0.15),
            4px 4px 0px rgba(0,0,0,0.12),
            6px 6px 0px rgba(0,0,0,0.09),
            8px 8px 0px rgba(0,0,0,0.06),
            10px 10px 0px rgba(0,0,0,0.03);
        }

        .title-3d {
          transform: perspective(500px) rotateX(15deg);
          text-shadow: 
            1px 1px 0 rgba(0,0,0,0.25),
            2px 2px 0 rgba(0,0,0,0.22),
            3px 3px 0 rgba(0,0,0,0.19),
            4px 4px 0 rgba(0,0,0,0.16),
            5px 5px 0 rgba(0,0,0,0.13),
            6px 6px 0 rgba(0,0,0,0.10);
        }

        .title-glitter {
          position: relative;
          overflow: visible;
        }

        .title-glitter::before,
        .title-glitter::after {
          content: '⭐';
          position: absolute;
          font-size: 0.7em;
          animation: glitter-sparkle 2s ease-in-out infinite;
        }

        .title-glitter::before {
          top: -12px;
          right: -12px;
          animation-delay: 0s;
        }

        .title-glitter::after {
          bottom: -12px;
          left: -12px;
          animation-delay: 1s;
        }

        .title-shine {
          position: relative;
          overflow: hidden;
        }

        .title-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shine-sweep 3s ease-in-out infinite;
          pointer-events: none;
        }

        /* ENHANCED EFFECTS - More Visible */
        .title-confetti {
          position: relative;
        }

        .title-confetti::before,
        .title-confetti::after {
          content: '🎉';
          position: absolute;
          font-size: 1.2em;
          animation: confetti-fall 2.5s ease-in-out infinite;
        }

        .title-confetti::before {
          top: -15px;
          right: 15%;
          animation-delay: 0s;
        }

        .title-confetti::after {
          top: -15px;
          left: 15%;
          animation-delay: 1.2s;
        }

        .title-particles {
          position: relative;
        }

        .title-particles::before {
          content: '✨';
          position: absolute;
          font-size: 1.5em;
          left: -20px;
          top: 50%;
          transform: translateY(-50%);
          --tx: -40px;
          --ty: -40px;
          animation: particle-float 2s ease-out infinite;
        }

        .title-particles::after {
          content: '💫';
          position: absolute;
          font-size: 1.5em;
          right: -20px;
          top: 50%;
          transform: translateY(-50%);
          --tx: 40px;
          --ty: -40px;
          animation: particle-float 2s ease-out infinite;
          animation-delay: 1s;
        }

        .title-shimmer {
          position: relative;
          background: linear-gradient(
            90deg,
            currentColor 0%,
            currentColor 35%,
            rgba(255, 255, 255, 1) 50%,
            currentColor 65%,
            currentColor 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          animation: shimmer-wave 2s linear infinite;
        }
        
        .title-shimmer::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shine-sweep 2s ease-in-out infinite;
          pointer-events: none;
          border-radius: inherit;
        }

        .title-fireworks {
          position: relative;
        }

        .title-fireworks::before,
        .title-fireworks::after {
          content: '🎆';
          position: absolute;
          font-size: 1.3em;
          animation: firework-burst 2s ease-out infinite;
        }

        .title-fireworks::before {
          top: -10px;
          right: -20px;
          --fx: 30px;
          --fy: -30px;
          animation-delay: 0s;
        }

        .title-fireworks::after {
          bottom: -10px;
          left: -20px;
          --fx: -30px;
          --fy: 30px;
          animation-delay: 1s;
        }

        .title-bubbles {
          position: relative;
        }

        .title-bubbles::before,
        .title-bubbles::after {
          content: '🫧';
          position: absolute;
          font-size: 1.2em;
          animation: bubble-rise 3s ease-in-out infinite;
        }

        .title-bubbles::before {
          bottom: -15px;
          left: 25%;
          animation-delay: 0s;
        }

        .title-bubbles::after {
          bottom: -15px;
          right: 25%;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
}