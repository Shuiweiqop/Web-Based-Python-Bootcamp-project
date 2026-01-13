import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  User,
  BookOpen,
  Sparkles,
  Zap,
  Wand2,
  Palette,
  Layers,
  Sliders,
} from 'lucide-react';

/**
 * Admin Background Preview Component
 * Shows how a background looks across scenes and devices with all effects
 */
const BackgroundPreview = ({
  backgroundData,
  rarity = 'common',
  rewardName = 'Untitled Background',
}) => {
  const [showEffects, setShowEffects] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [selectedScene, setSelectedScene] = useState('profile');

  const rarityLabels = {
    common: { label: 'Common', color: 'bg-gray-100 text-gray-800', icon: '⚪' },
    rare: { label: 'Rare', color: 'bg-blue-100 text-blue-800', icon: '💙' },
    epic: { label: 'Epic', color: 'bg-purple-100 text-purple-800', icon: '💜' },
    legendary: { label: 'Legendary', color: 'bg-yellow-100 text-yellow-800', icon: '🌟' },
  };

  const currentRarity = rarityLabels[rarity] || rarityLabels.common;

  const scenes = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'dashboard', label: 'Dashboard', icon: Monitor },
    { id: 'lesson', label: 'Lesson', icon: BookOpen },
  ];

  const devices = [
    { id: 'desktop', label: 'Desktop', icon: Monitor },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
  ];

const getAnimationClass = () => {
  // 检查新的嵌套结构
  const animation = backgroundData?.effects?.animation;
  
  console.log('Animation check:', {
    showEffects,
    animation,
    enabled: animation?.enabled,
    type: animation?.type
  });
  
  if (!showEffects || !animation?.enabled) return '';
  
  const animationMap = {
    scale: 'animate-bg-scale',
    rotate: 'animate-bg-rotate',
    float: 'animate-bg-float',
    'ken-burns': 'animate-ken-burns',
  };
  
  return animationMap[animation.type] || '';
};

  const getFilterString = () => {
    if (!showEffects || !backgroundData?.effects) return undefined;
    
    const filters = [];
    const effects = backgroundData.effects;
    
    if (effects.blur && effects.blur > 0) {
      filters.push(`blur(${effects.blur}px)`);
    }
    
    if (effects.filters) {
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

  const getBackgroundStyle = () => {
    if (!backgroundData?.url) return {};

    return {
      backgroundImage: `url(${backgroundData.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: getFilterString(),
      opacity: showEffects ? (backgroundData.effects?.opacity || 1) : 1,
      animationDuration: showEffects && backgroundData.effects?.animation?.enabled 
        ? `${backgroundData.effects.animation.duration}s` 
        : undefined,
    };
  };

  const getOverlayStyle = () => {
    if (!showEffects || !backgroundData?.effects?.overlayOpacity) return null;

    return {
      backgroundColor: backgroundData.effects.overlayColor || '#000000',
      opacity: backgroundData.effects.overlayOpacity,
    };
  };

  const hasFilters = () => {
    if (!backgroundData?.effects?.filters) return false;
    const f = backgroundData.effects.filters;
    return (
      (f.brightness !== undefined && f.brightness !== 100) ||
      (f.contrast !== undefined && f.contrast !== 100) ||
      (f.grayscale !== undefined && f.grayscale > 0) ||
      (f.saturate !== undefined && f.saturate !== 100)
    );
  };

  if (!backgroundData) {
    return (
      <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Upload a background to preview</p>
      </div>
    );
  }

  // Debug: Check if URL exists
  console.log('BackgroundPreview - backgroundData:', {
    hasUrl: !!backgroundData?.url,
    url: backgroundData?.url,
    effects: backgroundData?.effects,
    type: backgroundData?.type
  });

  // If no URL, show error message
  if (!backgroundData?.url) {
    return (
      <div className="bg-red-50 rounded-xl border-2 border-red-200 p-8 text-center">
        <Eye className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-semibold mb-2">⚠️ Background Image Missing</p>
        <p className="text-sm text-red-500">
          The background image URL is not available. Please re-upload the background image.
        </p>
        <div className="mt-4 p-3 bg-white rounded-lg text-left">
          <p className="text-xs text-gray-600 mb-1">Debug Info:</p>
          <pre className="text-xs text-gray-800 overflow-auto">
            {JSON.stringify(backgroundData, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Live Preview</h3>
            <p className="text-sm text-gray-600">See how the background appears with all effects</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full font-semibold ${currentRarity.color}`}>
          {currentRarity.icon} {currentRarity.label}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-700">Preview Settings</h4>
          <button
            type="button"
            onClick={() => setShowEffects(!showEffects)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showEffects ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {showEffects ? <><Zap className="w-4 h-4" />Effects On</> : <><EyeOff className="w-4 h-4" />Effects Off</>}
          </button>
        </div>

        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-600 mb-2 block">Scene</label>
          <div className="grid grid-cols-3 gap-2">
            {scenes.map((scene) => {
              const SceneIcon = scene.icon;
              return (
                <button
                  type="button"
                  key={scene.id}
                  onClick={() => setSelectedScene(scene.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                    selectedScene === scene.id
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <SceneIcon className="w-5 h-5" />
                  <span className="text-xs font-medium">{scene.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-2 block">Device</label>
          <div className="grid grid-cols-2 gap-2">
            {devices.map((device) => {
              const DeviceIcon = device.icon;
              return (
                <button
                  type="button"
                  key={device.id}
                  onClick={() => setSelectedDevice(device.id)}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg transition-all ${
                    selectedDevice === device.id ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <DeviceIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">{device.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preview area */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-6">
        <div className={`mx-auto transition-all ${selectedDevice === 'mobile' ? 'max-w-sm' : 'max-w-4xl'}`}>
          <div className={`bg-gray-800 rounded-2xl overflow-hidden shadow-2xl ${selectedDevice === 'mobile' ? 'p-2' : 'p-3'}`}>
            {selectedDevice === 'desktop' && (
              <div className="bg-gray-700 rounded-t-lg px-3 py-2 flex items-center gap-2 mb-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 bg-gray-600 rounded px-3 py-1 text-xs text-gray-300">
                  pylearn.com/{selectedScene}
                </div>
              </div>
            )}

            <div className="relative overflow-hidden rounded-lg" style={{ height: selectedDevice === 'mobile' ? '500px' : '400px' }}>
              <div className={`absolute inset-0 ${getAnimationClass()}`} style={getBackgroundStyle()} />
              {getOverlayStyle() && <div className="absolute inset-0" style={getOverlayStyle()} />}

              {showEffects && backgroundData.effects?.layers?.particles && (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(backgroundData.effects.layers.particleCount || 50)].map((_, i) => {
      const speed = backgroundData.effects.layers.particleSpeed || 5;
      const size = 2 + Math.random() * 3; // 随机大小 2-5px
      const delay = Math.random() * 10;
      const drift = (Math.random() - 0.5) * 100; // 左右漂移
      
      return (
        <div
          key={i}
          className="absolute rounded-full animate-snowfall"
          style={{
            backgroundColor: backgroundData.effects.layers.particleColor || '#ffffff',
            width: `${size}px`,
            height: `${size}px`,
            left: `${Math.random() * 100}%`,
            top: `-5%`,
            animationDelay: `${delay}s`,
            animationDuration: `${speed}s`,
            '--drift': `${drift}px`,
            opacity: 0.6 + Math.random() * 0.4,
            boxShadow: `0 0 ${size * 2}px ${backgroundData.effects.layers.particleColor || '#ffffff'}`,
          }}
        />
      );
    })}
  </div>
)}

              {showEffects && backgroundData.effects?.layers?.badge && (
                <div className={`absolute z-20 ${
                  backgroundData.effects.layers.badgePosition === 'top-left' ? 'top-4 left-4' :
                  backgroundData.effects.layers.badgePosition === 'top-right' ? 'top-4 right-4' :
                  backgroundData.effects.layers.badgePosition === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4'
                }`}>
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse-slow">
                    <Sparkles className="w-3 h-3" />Premium
                  </div>
                </div>
              )}

              {showEffects && rarity === 'legendary' && (
                <>
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-48 h-48 bg-yellow-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-orange-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(15)].map((_, i) => (
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

              {showEffects && rarity === 'epic' && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-15 animate-pulse-slow" />
                  <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl opacity-15 animate-pulse-slow" />
                </div>
              )}

              {showEffects && rarity === 'rare' && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse-slow" />
                </div>
              )}

              <div className="relative z-10 p-6 h-full overflow-y-auto">
                {selectedScene === 'profile' && (
                  <div className="space-y-4">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className={`font-bold text-gray-900 ${selectedDevice === 'mobile' ? 'text-lg' : 'text-2xl'}`}>Student Name</h2>
                          <p className="text-sm text-gray-600">Python learner</p>
                        </div>
                      </div>
                      <div className={`grid ${selectedDevice === 'mobile' ? 'grid-cols-3' : 'grid-cols-4'} gap-3 mt-4`}>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className={`font-bold text-blue-600 ${selectedDevice === 'mobile' ? 'text-lg' : 'text-2xl'}`}>24</p>
                          <p className="text-xs text-gray-600">Courses</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className={`font-bold text-purple-600 ${selectedDevice === 'mobile' ? 'text-lg' : 'text-2xl'}`}>1.2K</p>
                          <p className="text-xs text-gray-600">Points</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className={`font-bold text-green-600 ${selectedDevice === 'mobile' ? 'text-lg' : 'text-2xl'}`}>12</p>
                          <p className="text-xs text-gray-600">Badges</p>
                        </div>
                        {selectedDevice === 'desktop' && (
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">8</p>
                            <p className="text-xs text-gray-600">Rewards</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedDevice === 'desktop' && (
                      <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4">
                        <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <p className="text-sm text-gray-700">Completed Python basics</p>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <p className="text-sm text-gray-700">Earned badge: Novice</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedScene === 'dashboard' && (
                  <div className="space-y-4">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6">
                      <h2 className={`font-bold text-gray-900 mb-4 ${selectedDevice === 'mobile' ? 'text-lg' : 'text-2xl'}`}>Learning Dashboard</h2>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-lg p-4">
                          <p className={`font-bold ${selectedDevice === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>12</p>
                          <p className="text-xs opacity-90">In progress</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-lg p-4">
                          <p className={`font-bold ${selectedDevice === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>85%</p>
                          <p className="text-xs opacity-90">Avg completion</p>
                        </div>
                      </div>
                    </div>
                    {selectedDevice === 'desktop' && (
                      <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4">
                        <h3 className="font-bold text-gray-900 mb-3">Quick Access</h3>
                        <button type="button" className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                          <p className="font-semibold text-gray-900">Advanced Python</p>
                          <p className="text-xs text-gray-600">Continue</p>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {selectedScene === 'lesson' && (
                  <div className="space-y-4">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                        <h2 className={`font-bold text-gray-900 ${selectedDevice === 'mobile' ? 'text-lg' : 'text-xl'}`}>Python Basics</h2>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-2">Lesson preview</p>
                        <div className="space-y-2">
                          <div className="h-2 bg-blue-500 rounded-full w-3/4" />
                          <div className="h-2 bg-gray-300 rounded-full w-full" />
                          <div className="h-2 bg-gray-300 rounded-full w-5/6" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background info */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />Background Info
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Name</span>
            <span className="text-sm font-semibold text-gray-900">{rewardName}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Type</span>
            <span className="text-sm font-semibold text-gray-900">Image Background</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Rarity</span>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${currentRarity.color}`}>
              {currentRarity.icon} {currentRarity.label}
            </span>
          </div>

          {backgroundData.effects && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />Applied Effects
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(backgroundData.effects.blur > 0 || backgroundData.effects.opacity < 1 || backgroundData.effects.overlayOpacity > 0) && (
                  <div className="col-span-2 bg-white rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Sliders className="w-3 h-3" />Basic
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {backgroundData.effects.blur > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Blur: {backgroundData.effects.blur}px</span>
                      )}
                      {backgroundData.effects.opacity < 1 && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          Opacity: {Math.round(backgroundData.effects.opacity * 100)}%
                        </span>
                      )}
                      {backgroundData.effects.overlayOpacity > 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          Overlay: {Math.round(backgroundData.effects.overlayOpacity * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {backgroundData.effects.animation?.enabled && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Wand2 className="w-3 h-3" />Animation
                    </p>
                    <p className="text-xs text-gray-600">
                      {backgroundData.effects.animation.type} ({backgroundData.effects.animation.duration}s)
                    </p>
                  </div>
                )}

                {hasFilters() && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Palette className="w-3 h-3" />Filters
                    </p>
                    <div className="space-y-1 text-xs text-gray-600">
                      {backgroundData.effects.filters.brightness !== undefined && backgroundData.effects.filters.brightness !== 100 && (
                        <p>Brightness: {backgroundData.effects.filters.brightness}%</p>
                      )}
                      {backgroundData.effects.filters.contrast !== undefined && backgroundData.effects.filters.contrast !== 100 && (
                        <p>Contrast: {backgroundData.effects.filters.contrast}%</p>
                      )}
                      {backgroundData.effects.filters.grayscale !== undefined && backgroundData.effects.filters.grayscale > 0 && (
                        <p>Grayscale: {backgroundData.effects.filters.grayscale}%</p>
                      )}
                      {backgroundData.effects.filters.saturate !== undefined && backgroundData.effects.filters.saturate !== 100 && (
                        <p>Saturation: {backgroundData.effects.filters.saturate}%</p>
                      )}
                    </div>
                  </div>
                )}

                {(backgroundData.effects.layers?.particles || backgroundData.effects.layers?.badge) && (
                  <div className="col-span-2 bg-white rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Layers className="w-3 h-3" />Layers
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {backgroundData.effects.layers.particles && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          Particles ({backgroundData.effects.layers.particleCount})
                        </span>
                      )}
                      {backgroundData.effects.layers.badge && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Premium Badge</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-semibold text-gray-900 mb-1">💡 Preview Notes</p>
            <ul className="space-y-1 text-xs">
              <li>• Toggle effects on/off to compare differences</li>
              <li>• Switch scenes and devices to test responsiveness</li>
              <li>• All animations, filters, and layers are fully functional</li>
              <li>• Users will see this exact display on their profiles</li>
            </ul>
          </div>
        </div>
      </div>

<style jsx>{`
  @keyframes pulse-slow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
  }
  @keyframes bg-scale {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  @keyframes bg-rotate {
    0% { transform: rotate(0deg) scale(1.2); }
    100% { transform: rotate(360deg) scale(1.2); }
  }
  @keyframes bg-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes ken-burns {
    0% { transform: scale(1) translate(0, 0); }
    100% { transform: scale(1.2) translate(-10%, -10%); }
  }
  @keyframes sparkle-fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
  }
  @keyframes snowfall {
    0% {
      transform: translateY(0) translateX(0) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) translateX(var(--drift)) rotate(360deg);
      opacity: 0;
    }
  }
  @keyframes particle-float {
    0% { transform: translateY(0) translateX(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
  }
  .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
  .animate-bg-scale {
    animation-name: bg-scale;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
  .animate-bg-rotate { animation: bg-rotate linear infinite; }
  .animate-bg-float { animation: bg-float ease-in-out infinite; }
  .animate-ken-burns { animation: ken-burns ease-out forwards; }
  .animate-snowfall { animation: snowfall linear infinite; }
  .animate-particle-float { animation: particle-float linear infinite; }
  .animate-sparkle-fall { animation: sparkle-fall linear infinite; }
`}</style>
    </div>
  );
};

export default BackgroundPreview;