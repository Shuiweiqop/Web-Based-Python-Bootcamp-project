import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

/**
 * ImageInfo Component
 * Displays analyzed image information with quality indicators
 * 
 * @param {Object} props
 * @param {Object} props.imageInfo - Image analysis data
 */
const ImageInfo = ({ imageInfo }) => {
  // Safe access to imageInfo properties with defaults
  if (!imageInfo) {
    return null;
  }

  const info = {
    width: imageInfo.width || 0,
    height: imageInfo.height || 0,
    aspectRatio: imageInfo.aspectRatio || '0',
    size: imageInfo.size || 0,
    type: imageInfo.type || 'image/jpeg',
    sizeFormatted: imageInfo.sizeFormatted || '0 KB'
  };

  // Calculate quality indicators
  const isWidescreen = parseFloat(info.aspectRatio) >= 1.6;
  const isOptimalSize = info.width >= 1920 && info.width <= 3840;
  const fileSizeMB = info.size / (1024 * 1024);
  const isLargeFile = fileSizeMB > 5;

  // Extract file type safely
  const fileTypeDisplay = info.type.includes('/') 
    ? info.type.split('/')[1].toUpperCase() 
    : info.type.toUpperCase();

  /**
   * CheckItem - Individual info row with status indicator
   */
  const CheckItem = ({ label, value, isGood }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
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
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
          <Check className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Auto-detected results</h3>
          <p className="text-xs text-gray-500">The system analyzed the image</p>
        </div>
      </div>

      {/* Info Items */}
      <div className="space-y-1">
        <CheckItem
          label="Image dimensions"
          value={`${info.width} × ${info.height} px`}
          isGood={isOptimalSize}
        />
        <CheckItem
          label="Aspect ratio"
          value={`${info.aspectRatio}:1 ${isWidescreen ? '(Widescreen ✨)' : ''}`}
          isGood={isWidescreen}
        />
        <CheckItem
          label="File size"
          value={info.sizeFormatted}
          isGood={!isLargeFile}
        />
        <CheckItem
          label="File type"
          value={fileTypeDisplay}
          isGood={true}
        />
      </div>

      {/* Optimization Suggestions */}
      {(!isWidescreen || !isOptimalSize || isLargeFile) && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-orange-900 mb-1">💡 Optimization suggestions:</p>
              <ul className="text-orange-800 space-y-1">
                {!isWidescreen && (
                  <li>• Prefer widescreen ratios (16:9 or 16:10)</li>
                )}
                {!isOptimalSize && (
                  <li>• Recommended size: 1920×1080 to 3840×2160</li>
                )}
                {isLargeFile && (
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

export default ImageInfo;