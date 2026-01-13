import React from 'react';
import { Sparkles, Zap, Stars } from 'lucide-react';
import TitlePreview from '@/Components/Rewards/Title/TitlePreview';

/**
 * Title Configuration Panel with Preview
 * Responsibility: Configure title text, color, gradient, effects and icon
 */
export default function TitleConfigPanel({ titleConfig, onChange }) {
  const handleChange = (key, value) => {
    onChange(key, value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Configuration */}
      <div className="space-y-4">

        {/* Title Text */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Title Text *
          </label>
          <input
            type="text"
            value={titleConfig.title_text}
            onChange={(e) => handleChange('title_text', e.target.value)}
            placeholder="e.g.: Python Master"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            required
          />
        </div>

        {/* Text Color */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Text Color
          </label>
          <div className="flex gap-3">
            <input
              type="color"
              value={titleConfig.text_color}
              onChange={(e) => handleChange('text_color', e.target.value)}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={titleConfig.text_color}
              onChange={(e) => handleChange('text_color', e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
          </div>
        </div>

        {/* Gradient Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={titleConfig.gradient.enabled}
            onChange={(e) =>
              handleChange('gradient', {
                ...titleConfig.gradient,
                enabled: e.target.checked,
              })
            }
            className="w-4 h-4 rounded"
          />
          <label className="text-sm font-medium text-gray-900">
            Enable gradient
          </label>
        </div>

        {/* Gradient Config */}
        {titleConfig.gradient.enabled && (
          <div className="grid grid-cols-2 gap-4 pl-7">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Start Color
              </label>
              <input
                type="color"
                value={titleConfig.gradient.from}
                onChange={(e) =>
                  handleChange('gradient', {
                    ...titleConfig.gradient,
                    from: e.target.value,
                  })
                }
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                End Color
              </label>
              <input
                type="color"
                value={titleConfig.gradient.to}
                onChange={(e) =>
                  handleChange('gradient', {
                    ...titleConfig.gradient,
                    to: e.target.value,
                  })
                }
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Effects - Basic */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Basic Effects
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.glow || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    glow: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">✨ Glow</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.sparkle || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    sparkle: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">✨ Sparkle</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.wave || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    wave: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">🌊 Wave</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.pulse || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    pulse: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">💓 Pulse</span>
            </label>
          </div>
        </div>

        {/* Effects - Advanced */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Advanced Effects
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 p-2 rounded bg-purple-50 hover:bg-purple-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.neon || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    neon: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">💡 Neon</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-purple-50 hover:bg-purple-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.rainbow || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    rainbow: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">🌈 Rainbow</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-purple-50 hover:bg-purple-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.three_d || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    three_d: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">🎲 3D</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-purple-50 hover:bg-purple-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.rotate_glow || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    rotate_glow: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">🌀 Rotate</span>
            </label>
          </div>
        </div>

        {/* Effects - Decorative */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Stars className="w-4 h-4" />
            Decorative Effects
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 p-2 rounded bg-yellow-50 hover:bg-yellow-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.shadow_stack || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    shadow_stack: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">📚 Shadows</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-yellow-50 hover:bg-yellow-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.glitter || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    glitter: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">⭐ Glitter</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-yellow-50 hover:bg-yellow-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.shine || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    shine: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">✨ Shine</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-yellow-50 hover:bg-yellow-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.confetti || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    confetti: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">🎉 Confetti</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-yellow-50 hover:bg-yellow-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.particles || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    particles: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">✨ Particles</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-yellow-50 hover:bg-yellow-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.shimmer || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    shimmer: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">💫 Shimmer</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-yellow-50 hover:bg-yellow-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.fireworks || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    fireworks: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">🎆 Fireworks</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded bg-yellow-50 hover:bg-yellow-100 cursor-pointer">
              <input
                type="checkbox"
                checked={titleConfig.effects?.bubbles || false}
                onChange={(e) =>
                  handleChange('effects', {
                    ...titleConfig.effects,
                    bubbles: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">🫧 Bubbles</span>
            </label>
          </div>
        </div>

        {/* Icon */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Decoration Icon
          </label>
          <select
            value={titleConfig.icon}
            onChange={(e) => handleChange('icon', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          >
            <option value="none">None</option>
            <option value="crown">👑 Crown</option>
            <option value="star">⭐ Star</option>
            <option value="sparkle">✨ Sparkle</option>
            <option value="zap">⚡ Zap</option>
            <option value="fire">🔥 Fire</option>
            <option value="gem">💎 Gem</option>
            <option value="trophy">🏆 Trophy</option>
            <option value="medal">🏅 Medal</option>
          </select>
        </div>

        {/* Quick Presets */}
        <div className="pt-4 border-t-2 border-gray-200">
          <label className="text-sm font-semibold text-gray-700 mb-3 block">
            Quick Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                handleChange('gradient', { enabled: true, from: '#FFD700', to: '#FFA500' });
                handleChange('effects', { glow: true, sparkle: true, shadow_stack: true });
                handleChange('icon', 'crown');
              }}
              className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
            >
              👑 Royal Gold
            </button>
            <button
              type="button"
              onClick={() => {
                handleChange('gradient', { enabled: true, from: '#8B5CF6', to: '#EC4899' });
                handleChange('effects', { neon: true, rainbow: true, glitter: true });
                handleChange('icon', 'sparkle');
              }}
              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
            >
              ✨ Cyber Punk
            </button>
            <button
              type="button"
              onClick={() => {
                handleChange('gradient', { enabled: true, from: '#3B82F6', to: '#06B6D4' });
                handleChange('effects', { three_d: true, shadow_stack: true, wave: true });
                handleChange('icon', 'gem');
              }}
              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
            >
              💎 Ice Crystal
            </button>
            <button
              type="button"
              onClick={() => {
                handleChange('gradient', { enabled: true, from: '#EF4444', to: '#F59E0B' });
                handleChange('effects', { glow: true, pulse: true, rotate_glow: true });
                handleChange('icon', 'fire');
              }}
              className="px-3 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
            >
              🔥 Flame
            </button>
          </div>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div>
        <TitlePreview titleConfig={titleConfig} />
      </div>
    </div>
  );
}