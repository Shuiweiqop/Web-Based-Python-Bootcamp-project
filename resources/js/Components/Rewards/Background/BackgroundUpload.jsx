import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Sliders,
  Wand2,
  Palette,
  Layers,
} from 'lucide-react';

// ✅ 导入正确的 hook 和 DEFAULT_EFFECTS
import { useImageEffects, DEFAULT_EFFECTS } from '@/Components/Rewards/Background/BackgroundUpload/components/hooks';

// ==================== Sub-Components ====================

// Image Upload Component
const ImageUpload = ({ onFileSelect, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-xl transition-all ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => onFileSelect(e.target.files[0])}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />

      <div className="p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isUploading ? 'Uploading...' : 'Upload background image'}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Drag & drop a file here, or click to select
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
          <Sparkles className="w-4 h-4" />
          Supports JPG, PNG, WebP — max 20MB
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Recommended: 1920×1080 or higher
        </p>
      </div>
    </div>
  );
};

// Preview Component
const Preview = ({ preview, effects }) => {
  // Build animation class
  const getAnimationClass = () => {
    if (!effects.animation.enabled) return '';
    
    const animationMap = {
      scale: 'animate-bg-scale',
      rotate: 'animate-bg-rotate',
      float: 'animate-bg-float',
      'Ken-Burns': 'animate-ken-burns',
    };
    
    return animationMap[effects.animation.type] || '';
  };

  // Build filter string
  const getFilterString = () => {
    const filters = [];
    
    if (effects.filters.blur > 0) filters.push(`blur(${effects.filters.blur}px)`);
    if (effects.filters.brightness !== 100) filters.push(`brightness(${effects.filters.brightness}%)`);
    if (effects.filters.contrast !== 100) filters.push(`contrast(${effects.filters.contrast}%)`);
    if (effects.filters.grayscale > 0) filters.push(`grayscale(${effects.filters.grayscale}%)`);
    if (effects.filters.saturate !== 100) filters.push(`saturate(${effects.filters.saturate}%)`);
    
    return filters.length > 0 ? filters.join(' ') : undefined;
  };

  return (
    <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Live Preview
        </h3>
      </div>

      <div className="relative h-64 rounded-lg overflow-hidden">
        {/* Background layer with animations */}
        <div
          className={`absolute inset-0 ${getAnimationClass()}`}
          style={{
            backgroundImage: `url(${preview})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: getFilterString(),
            opacity: effects.basic.opacity,
            animationDuration: effects.animation.enabled ? `${effects.animation.duration}s` : undefined,
          }}
        />

        {/* Overlay layer */}
        {effects.overlay.opacity > 0 && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: effects.overlay.color,
              opacity: effects.overlay.opacity,
            }}
          />
        )}

        {/* Particle layer */}
        {effects.layers.particles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(effects.layers.particleCount)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-particle-float"
                style={{
                  backgroundColor: effects.layers.particleColor,
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
        {effects.layers.badge && (
          <div
            className={`absolute ${
              effects.layers.badgePosition === 'top-left' ? 'top-4 left-4' :
              effects.layers.badgePosition === 'top-right' ? 'top-4 right-4' :
              effects.layers.badgePosition === 'bottom-left' ? 'bottom-4 left-4' :
              'bottom-4 right-4'
            }`}
          >
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Premium
            </div>
          </div>
        )}

        {/* Content preview */}
        <div className="relative z-10 p-6 flex items-center justify-center h-full">
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 shadow-2xl max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Student profile</h3>
            <p className="text-sm text-gray-600">This is a background preview</p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
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
        
        @keyframes particle-float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        
        .animate-bg-scale { animation: bg-scale ease-in-out infinite; }
        .animate-bg-rotate { animation: bg-rotate linear infinite; }
        .animate-bg-float { animation: bg-float ease-in-out infinite; }
        .animate-ken-burns { animation: ken-burns ease-out forwards; }
        .animate-particle-float { animation: particle-float linear infinite; }
      `}</style>
    </div>
  );
};

// Image Info Component
const ImageInfo = ({ imageInfo }) => {
  const CheckItem = ({ label, value, isGood }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${isGood ? 'text-green-600' : 'text-orange-600'}`}>
          {value}
        </span>
        {isGood ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <AlertCircle className="w-4 h-4 text-orange-600" />
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
          <Check className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Auto-detected results</h3>
          <p className="text-xs text-gray-500">The system analyzed the image</p>
        </div>
      </div>

      <div className="space-y-1">
        <CheckItem
          label="Image dimensions"
          value={`${imageInfo.width} × ${imageInfo.height} px`}
          isGood={imageInfo.isOptimalSize}
        />
        <CheckItem
          label="Aspect ratio"
          value={`${imageInfo.aspectRatio}:1 ${imageInfo.isWidescreen ? '(Widescreen ✨)' : ''}`}
          isGood={imageInfo.isWidescreen}
        />
        <CheckItem
          label="File size"
          value={`${imageInfo.fileSize} MB`}
          isGood={!imageInfo.isLargeFile}
        />
        <CheckItem
          label="File type"
          value={imageInfo.fileType.split('/')[1].toUpperCase()}
          isGood={true}
        />
      </div>

      {(!imageInfo.isWidescreen || !imageInfo.isOptimalSize || imageInfo.isLargeFile) && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-orange-900 mb-1">💡 Optimization suggestions:</p>
              <ul className="text-orange-800 space-y-1">
                {!imageInfo.isWidescreen && (
                  <li>• Prefer widescreen ratios (16:9 or 16:10)</li>
                )}
                {!imageInfo.isOptimalSize && (
                  <li>• Recommended size: 1920×1080 to 3840×2160</li>
                )}
                {imageInfo.isLargeFile && (
                  <li>• File is large — consider compressing for faster load</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Effects Inspector Component
const EffectsInspector = ({ effects, updateEffects }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Basic', icon: Sliders },
    { id: 'animation', label: 'Animation', icon: Wand2 },
    { id: 'filters', label: 'Filters', icon: Palette },
    { id: 'layers', label: 'Layers', icon: Layers },
  ];

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Effects Studio</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Basic Effects */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Blur</span>
              <span className="text-blue-600">{effects.basic.blur}px</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={effects.basic.blur}
              onChange={(e) => updateEffects('basic', { blur: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Opacity</span>
              <span className="text-blue-600">{Math.round(effects.basic.opacity * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={effects.basic.opacity}
              onChange={(e) => updateEffects('basic', { opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Overlay color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={effects.overlay.color}
                onChange={(e) => updateEffects('overlay', { color: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={effects.overlay.color}
                onChange={(e) => updateEffects('overlay', { color: e.target.value })}
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Overlay opacity</span>
              <span className="text-blue-600">{Math.round(effects.overlay.opacity * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={effects.overlay.opacity}
              onChange={(e) => updateEffects('overlay', { opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Animation Effects */}
      {activeTab === 'animation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Enable Animation</span>
            <button
              type="button"
              onClick={() => updateEffects('animation', { enabled: !effects.animation.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                effects.animation.enabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  effects.animation.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {effects.animation.enabled && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Animation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['scale', 'rotate', 'float', 'Ken-Burns'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateEffects('animation', { type })}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        effects.animation.type === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Duration</span>
                  <span className="text-blue-600">{effects.animation.duration}s</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={effects.animation.duration}
                  onChange={(e) => updateEffects('animation', { duration: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Intensity</span>
                  <span className="text-blue-600">{effects.animation.intensity}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={effects.animation.intensity}
                  onChange={(e) => updateEffects('animation', { intensity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Filter Effects */}
      {activeTab === 'filters' && (
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Brightness</span>
              <span className="text-blue-600">{effects.filters.brightness}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={effects.filters.brightness}
              onChange={(e) => updateEffects('filters', { brightness: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Contrast</span>
              <span className="text-blue-600">{effects.filters.contrast}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={effects.filters.contrast}
              onChange={(e) => updateEffects('filters', { contrast: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Grayscale</span>
              <span className="text-blue-600">{effects.filters.grayscale}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={effects.filters.grayscale}
              onChange={(e) => updateEffects('filters', { grayscale: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Saturation</span>
              <span className="text-blue-600">{effects.filters.saturate}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={effects.filters.saturate}
              onChange={(e) => updateEffects('filters', { saturate: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Layer Effects */}
      {activeTab === 'layers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Particle Layer</span>
            <button
              type="button"
              onClick={() => updateEffects('layers', { particles: !effects.layers.particles })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                effects.layers.particles ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  effects.layers.particles ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {effects.layers.particles && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Particle Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={effects.layers.particleColor}
                    onChange={(e) => updateEffects('layers', { particleColor: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={effects.layers.particleColor}
                    onChange={(e) => updateEffects('layers', { particleColor: e.target.value })}
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Particle Count</span>
                  <span className="text-purple-600">{effects.layers.particleCount}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={effects.layers.particleCount}
                  onChange={(e) => updateEffects('layers', { particleCount: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Particle Speed</span>
                  <span className="text-purple-600">{effects.layers.particleSpeed}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={effects.layers.particleSpeed}
                  onChange={(e) => updateEffects('layers', { particleSpeed: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Premium Badge</span>
            <button
              type="button"
              onClick={() => updateEffects('layers', { badge: !effects.layers.badge })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                effects.layers.badge ? 'bg-yellow-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  effects.layers.badge ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {effects.layers.badge && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Badge Position</label>
              <div className="grid grid-cols-2 gap-2">
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => updateEffects('layers', { badgePosition: pos })}
                    className={`p-3 rounded-lg text-xs font-medium transition-all ${
                      effects.layers.badgePosition === pos
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pos.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== Main Component ====================

const BackgroundUpload = ({ value, onChange, error, existingImageUrl, isEditing }) => {
  const [preview, setPreview] = useState(value?.url || existingImageUrl || null);
  
  // ✅ 关键修复：在编辑模式下，如果有 existingImageUrl，生成一个假的 imageInfo
  const [imageInfo, setImageInfo] = useState(() => {
    if (value?.info) {
      return value.info;
    }
    // 编辑模式：如果有现有图片但没有 info，创建一个占位符
    if (isEditing && existingImageUrl) {
      console.log('🔧 [BackgroundUpload] Creating placeholder imageInfo for edit mode');
      return {
        width: 1920,
        height: 1080,
        aspectRatio: '1.78',
        fileSize: '0',
        fileType: 'image/jpeg',
        isWidescreen: true,
        isOptimalSize: true,
        isLargeFile: false,
      };
    }
    return null;
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  console.log('🎨 [BackgroundUpload] Component rendered');
  console.log('🎨 [BackgroundUpload] value:', value);
  console.log('🎨 [BackgroundUpload] value.effects:', value?.effects);
  console.log('🎨 [BackgroundUpload] preview:', preview);
  console.log('🎨 [BackgroundUpload] imageInfo:', imageInfo);
  console.log('🎨 [BackgroundUpload] isEditing:', isEditing);

  // ✅ 使用 hook
  const { effects, updateEffects } = useImageEffects(
    onChange,
    preview,
    imageInfo,
    value?.effects || null
  );

  // ✅ 监听 effects 变化
  useEffect(() => {
    console.log('🔄 [BackgroundUpload] Effects changed!');
    console.log('🔄 [BackgroundUpload] New effects:', effects);
    console.log('🔄 [BackgroundUpload] Animation enabled:', effects.animation?.enabled);
    console.log('🔄 [BackgroundUpload] Animation type:', effects.animation?.type);
  }, [effects]);

  const detectImageProperties = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const info = {
          width: img.width,
          height: img.height,
          aspectRatio: (img.width / img.height).toFixed(2),
          fileSize: (file.size / 1024 / 1024).toFixed(2),
          fileType: file.type,
          isWidescreen: img.width / img.height >= 1.5,
          isOptimalSize: img.width >= 1920 && img.width <= 3840,
          isLargeFile: file.size > 10 * 1024 * 1024,
        };

        URL.revokeObjectURL(url);
        resolve(info);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Unable to load image'));
      };

      img.src = url;
    });
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Only JPG, PNG or WebP are supported!');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('❌ File too large — maximum 20MB');
      return;
    }

    setIsUploading(true);

    try {
      const info = await detectImageProperties(file);
      setImageInfo(info);

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setPreview(imageUrl);

        console.log('📤 [BackgroundUpload] New image uploaded, notifying parent');
        console.log('📤 [BackgroundUpload] Effects:', effects);

        if (onChange) {
          onChange({
            type: 'image',
            url: imageUrl,
            file: file,
            info: info,
            effects: effects,
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('❌ Image processing failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setImageInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <ImageUpload 
          onFileSelect={handleFileSelect} 
          isUploading={isUploading}
        />
      ) : (
        <div className="space-y-4">
          <Preview 
            preview={preview} 
            effects={effects}
          />
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Background
            </button>
          </div>
          
          {imageInfo && <ImageInfo imageInfo={imageInfo} />}
          
          <EffectsInspector 
            effects={effects} 
            updateEffects={updateEffects} 
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default BackgroundUpload;
