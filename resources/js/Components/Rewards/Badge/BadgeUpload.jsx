import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Award,
  Sparkles,
  Circle,
  Square,
  Hexagon,
  Shield,
} from 'lucide-react';
import BadgeDisplay from './BadgeDisplay';

/**
 * BadgeUpload Component
 * Responsibilities: icon upload, shape selection, color configuration
 *
 * Props:
 * - value: existing badge value { url, shape, glowColor, backgroundColor, ... }
 * - onChange: function(updatedBadgeObject|null)
 * - error: optional error message string
 */
export default function BadgeUpload({ value, onChange, error }) {
  const [preview, setPreview] = useState(value?.url || null);
  const [imageInfo, setImageInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // badge configuration
  const [badgeConfig, setBadgeConfig] = useState({
    shape: value?.shape || 'circle',
    glowColor: value?.glowColor || null,
    backgroundColor: value?.backgroundColor || null,
  });

  const fileInputRef = useRef(null);

  // shape options
  const shapeOptions = [
    {
      id: 'circle',
      label: 'Circle',
      icon: Circle,
      description: 'Classic circular badge',
    },
    {
      id: 'square',
      label: 'Square',
      icon: Square,
      description: 'Modern square badge',
    },
    {
      id: 'hexagon',
      label: 'Hexagon',
      icon: Hexagon,
      description: 'Gaming style hexagon',
    },
    {
      id: 'shield',
      label: 'Shield',
      icon: Shield,
      description: 'Honor shield badge',
    },
  ];

  // preset glow colors
  const presetGlowColors = [
    { name: 'None', color: null },
    { name: 'Gold', color: '#EAB308' },
    { name: 'Blue', color: '#3B82F6' },
    { name: 'Purple', color: '#A855F7' },
    { name: 'Green', color: '#10B981' },
    { name: 'Red', color: '#EF4444' },
    { name: 'Teal', color: '#06B6D4' },
  ];

  // preset background colors
  const presetBackgroundColors = [
    { name: 'Transparent', color: null },
    { name: 'White', color: '#FFFFFF' },
    { name: 'Black', color: '#000000' },
    { name: 'Gold', color: '#F59E0B' },
    { name: 'Blue', color: '#3B82F6' },
    { name: 'Purple', color: '#8B5CF6' },
  ];

  // auto-detect image properties
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
        isLargeFile: file.size > 2 * 1024 * 1024,
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

  // handle file selection
  const handleFileSelect = async (file) => {
    if (!file) return;

    const validTypes = ['image/png', 'image/svg+xml', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Only PNG, SVG or JPG are supported!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('❌ File too large — maximum 2MB');
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

        if (onChange) {
          onChange({
            url: imageUrl,
            file: file,
            info: info,
            config: badgeConfig,
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

  // drag & drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // clear preview
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

  // update badge configuration
  const updateConfig = (key, value) => {
    const newConfig = { ...badgeConfig, [key]: value };
    setBadgeConfig(newConfig);

    if (onChange && preview) {
      onChange({
        url: preview,
        file: null,
        info: imageInfo,
        config: newConfig,
      });
    }
  };

  // CheckItem helper
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
    <div className="space-y-4">
      {/* upload area */}
      {!preview ? (
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
            accept="image/png,image/svg+xml,image/jpeg"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isUploading ? 'Uploading...' : 'Upload badge icon'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag & drop a file here, or click to select
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
              <Sparkles className="w-4 h-4" />
              Supports PNG, SVG, JPG — max 2MB
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Recommended: 128×128 to 512×512 (square)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* preview area */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Preview
              </h3>
              <button
                type="button"
                onClick={handleClear}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                title="Clear"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* shape previews */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Shape Previews</h4>
                <div className="grid grid-cols-4 gap-4">
                  {shapeOptions.map((shape) => {
                    const isSelected = shape.id === badgeConfig.shape;

                    return (
                      <div key={shape.id} className="text-center">
                        <p className="text-xs font-semibold text-gray-600 mb-3">
                          {shape.label}
                        </p>
                        <div className="flex justify-center">
                          <div className="relative">
                            <BadgeDisplay
                              badgeName={shape.label}
                              badgeIcon={preview}
                              description={shape.description}
                              rarity="epic"
                              shape={shape.id}
                              size="lg"
                              showTooltip={false}
                              showGlow={isSelected && !!badgeConfig.glowColor}
                              glowColor={badgeConfig.glowColor}
                              className={isSelected ? '' : 'opacity-50'}
                            />

                            {/* Selected checkmark */}
                            {isSelected && (
                              <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-20">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rarity previews */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Rarity Preview</h4>
                <div className="grid grid-cols-4 gap-4">
                  {['common', 'rare', 'epic', 'legendary'].map((rarityLevel) => (
                    <div key={rarityLevel} className="text-center">
                      <BadgeDisplay
                        badgeName={rarityLevel.charAt(0).toUpperCase() + rarityLevel.slice(1)}
                        badgeIcon={preview}
                        rarity={rarityLevel}
                        shape={badgeConfig.shape}
                        size="md"
                        showTooltip={true}
                        showGlow={true}
                        glowColor={badgeConfig.glowColor}
                      />
                      <p className="text-xs text-gray-600 mt-2 capitalize">{rarityLevel}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* auto-detected info */}
          {imageInfo && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Auto-detected results</h3>
                  <p className="text-xs text-gray-500">Image properties analyzed</p>
                </div>
              </div>
              <div className="space-y-1">
                <CheckItem
                  label="Icon dimensions"
                  value={`${imageInfo.width} × ${imageInfo.height} px`}
                  isGood={imageInfo.isOptimalSize}
                />
                <CheckItem
                  label="Aspect"
                  value={imageInfo.isSquare ? 'Square ✨' : `${imageInfo.aspectRatio}:1`}
                  isGood={imageInfo.isSquare}
                />
                <CheckItem
                  label="File size"
                  value={`${imageInfo.fileSize} KB`}
                  isGood={parseFloat(imageInfo.fileSize) < 500}
                />
                <CheckItem
                  label="File type"
                  value={imageInfo.fileType.split('/')[1].toUpperCase()}
                  isGood={true}
                />
                <CheckItem
                  label="Transparent background"
                  value={imageInfo.hasTransparency ? 'Supported ✨' : 'Not supported'}
                  isGood={imageInfo.hasTransparency}
                />
              </div>

              {/* optimization suggestions */}
              {(!imageInfo.isSquare || !imageInfo.isOptimalSize || !imageInfo.hasTransparency) && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-orange-900 mb-1">💡 Suggestions:</p>
                      <ul className="text-orange-800 space-y-1">
                        {!imageInfo.isSquare && <li>• Prefer a square icon (1:1 ratio)</li>}
                        {!imageInfo.isOptimalSize && <li>• Recommended size: 128px - 512px</li>}
                        {!imageInfo.hasTransparency && (
                          <li>• Prefer PNG to support transparent backgrounds</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* perfect badge */}
              {imageInfo.isSquare && imageInfo.isOptimalSize && imageInfo.hasTransparency && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-green-900">
                      ✨ Perfect! This icon meets all recommended standards.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* shape selection */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Badge Shape
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {shapeOptions.map((shape) => (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => updateConfig('shape', shape.id)}
                  className={`p-4 rounded-xl text-center transition-all ${
                    badgeConfig.shape === shape.id
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <shape.icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-semibold">{shape.label}</p>
                  <p className="text-xs opacity-75 mt-1">{shape.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* glow color */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Glow color (optional)</h3>
            <div className="grid grid-cols-7 gap-3">
              {presetGlowColors.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => updateConfig('glowColor', preset.color)}
                  className={`relative p-3 rounded-lg border-2 transition-all ${
                    badgeConfig.glowColor === preset.color
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={preset.name}
                >
                  <div
                    className="w-full h-12 rounded-lg"
                    style={{
                      backgroundColor: preset.color || '#F3F4F6',
                      border: !preset.color ? '2px dashed #D1D5DB' : undefined,
                    }}
                  />
                  <p className="text-xs text-center text-gray-600 mt-2">{preset.name}</p>
                  {badgeConfig.glowColor === preset.color && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* custom color */}
            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Custom:</label>
              <input
                type="color"
                value={badgeConfig.glowColor || '#3B82F6'}
                onChange={(e) => updateConfig('glowColor', e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={badgeConfig.glowColor || ''}
                onChange={(e) => updateConfig('glowColor', e.target.value)}
                placeholder="#3B82F6"
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* background color */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Background color (optional)
            </h3>
            <div className="grid grid-cols-6 gap-3">
              {presetBackgroundColors.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => updateConfig('backgroundColor', preset.color)}
                  className={`relative p-3 rounded-lg border-2 transition-all ${
                    badgeConfig.backgroundColor === preset.color
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={preset.name}
                >
                  <div
                    className="w-full h-12 rounded-lg"
                    style={{
                      backgroundColor: preset.color || '#F3F4F6',
                      border: !preset.color
                        ? '2px dashed #D1D5DB'
                        : preset.color === '#FFFFFF'
                        ? '1px solid #E5E7EB'
                        : undefined,
                    }}
                  />
                  <p className="text-xs text-center text-gray-600 mt-2">{preset.name}</p>
                  {badgeConfig.backgroundColor === preset.color && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* custom background color */}
            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Custom:</label>
              <input
                type="color"
                value={badgeConfig.backgroundColor || '#3B82F6'}
                onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={badgeConfig.backgroundColor || ''}
                onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                placeholder="#3B82F6"
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}