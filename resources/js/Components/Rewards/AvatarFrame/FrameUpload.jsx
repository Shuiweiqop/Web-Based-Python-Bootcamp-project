import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function AvatarFrameUpload({ 
  value, 
  onChange, 
  error,
  existingImageUrl = null, // ✅ NEW: 现有图片 URL
  isEditing = false // ✅ NEW: 是否为编辑模式
}) {
  const [preview, setPreview] = useState(value?.url || null);
  const [imageInfo, setImageInfo] = useState(value?.info || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasNewImage, setHasNewImage] = useState(false); // ✅ 追踪是否上传了新图片
  const fileInputRef = useRef(null);

  // ✅ 在编辑模式下加载现有图片
  useEffect(() => {
    if (isEditing && existingImageUrl && !value?.file) {
      setPreview(existingImageUrl);
      setHasNewImage(false);
      
      // 尝试检测现有图片的属性
      detectImagePropertiesFromUrl(existingImageUrl);
    }
  }, [isEditing, existingImageUrl, value]);

  // ✅ 从 URL 检测图片属性
  const detectImagePropertiesFromUrl = (url) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 处理跨域问题
    
    img.onload = () => {
      const info = {
        width: img.naturalWidth || 512,
        height: img.naturalHeight || 512,
        aspectRatio: img.naturalWidth && img.naturalHeight 
          ? (img.naturalWidth / img.naturalHeight).toFixed(2) 
          : '1.00',
        fileSize: 'N/A', // 无法从 URL 获取文件大小
        fileType: 'image/png', // 默认假设为 PNG
        hasTransparency: true, // 默认假设有透明度
        isSquare: img.naturalWidth === img.naturalHeight,
        isOptimalSize: img.naturalWidth >= 200 && img.naturalWidth <= 512,
        isExisting: true, // ✅ 标记为现有图片
      };
      setImageInfo(info);
    };
    
    img.onerror = () => {
      console.warn('Failed to load existing image for detection');
      // 设置默认信息，避免 undefined 错误
      setImageInfo({
        width: 512,
        height: 512,
        aspectRatio: '1.00',
        fileSize: 'N/A',
        fileType: 'image/png',
        hasTransparency: true,
        isSquare: true,
        isOptimalSize: true,
        isExisting: true,
      });
    };
    
    img.src = url;
  };

  // Auto-detect image properties from file
  const detectImageProperties = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const info = {
          width: img.width,
          height: img.height,
          aspectRatio: (img.width / img.height).toFixed(2),
          fileSize: (file.size / 1024).toFixed(2), // KB
          fileType: file.type,
          hasTransparency: file.type === 'image/png' || file.type === 'image/svg+xml',
          isSquare: img.width === img.height,
          isOptimalSize: img.width >= 200 && img.width <= 512,
          isExisting: false, // ✅ 标记为新图片
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

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Only PNG, SVG or GIF are supported!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ File too large — maximum 5MB');
      return;
    }

    setIsUploading(true);
    setHasNewImage(true); // ✅ 标记已上传新图片

    try {
      // Detect image properties
      const info = await detectImageProperties(file);
      setImageInfo(info);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setPreview(imageUrl);

        // Pass to parent
        if (onChange) {
          onChange({
            url: imageUrl,
            file: file,
            info: info,
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

  // Drag & drop handlers
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

  // Clear image
  const handleClear = () => {
    setPreview(null);
    setImageInfo(null);
    setHasNewImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) {
      onChange(null);
    }
  };

  // Check item subcomponent
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
      {/* Upload area */}
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
            accept="image/png,image/svg+xml,image/gif"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isUploading ? 'Uploading...' : 'Upload avatar frame image'}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Drag & drop your file here, or click to select
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
              <Sparkles className="w-4 h-4" />
              Supports PNG, SVG, GIF — max 5MB
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview area */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Preview
                </h3>
                {/* ✅ 显示图片状态标签 */}
                {isEditing && !hasNewImage && (
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                    Current Image
                  </span>
                )}
                {hasNewImage && (
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    ✓ New Image
                  </span>
                )}
              </div>
              <button
                onClick={handleClear}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                title="Clear"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* three-size preview */}
            <div className="grid grid-cols-3 gap-6">
              {/* small */}
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 mb-3">Small (64px)</p>
                <div className="relative inline-block">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    U
                  </div>
                  <img
                    src={preview}
                    alt="Frame Preview"
                    className="absolute inset-0 w-16 h-16 object-cover pointer-events-none"
                  />
                </div>
              </div>

              {/* medium */}
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 mb-3">Medium (96px)</p>
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                    U
                  </div>
                  <img
                    src={preview}
                    alt="Frame Preview"
                    className="absolute inset-0 w-24 h-24 object-cover pointer-events-none"
                  />
                </div>
              </div>

              {/* large */}
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 mb-3">Large (128px)</p>
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                    U
                  </div>
                  <img
                    src={preview}
                    alt="Frame Preview"
                    className="absolute inset-0 w-32 h-32 object-cover pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* ✅ 更换图片按钮 */}
            <div className="mt-6 text-center">
              <label className="inline-block cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/gif"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <span className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors inline-block">
                  {isEditing && !hasNewImage ? 'Change Image' : 'Upload Different Image'}
                </span>
              </label>
            </div>
          </div>

          {/* Auto-detected info */}
          {imageInfo && (
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
                  label="Aspect"
                  value={imageInfo.isSquare ? 'Square ✨' : `${imageInfo.aspectRatio}:1`}
                  isGood={imageInfo.isSquare}
                />
                {imageInfo.fileSize !== 'N/A' && (
                  <CheckItem
                    label="File size"
                    value={`${imageInfo.fileSize} KB`}
                    isGood={parseFloat(imageInfo.fileSize) < 1024}
                  />
                )}
                <CheckItem
                  label="File type"
                  value={imageInfo.fileType ? imageInfo.fileType.split('/')[1].toUpperCase() : 'PNG'}
                  isGood={true}
                />
                <CheckItem
                  label="Transparency"
                  value={imageInfo.hasTransparency ? 'Supported ✨' : 'Not supported'}
                  isGood={imageInfo.hasTransparency}
                />
              </div>

              {/* Suggestions */}
              {(!imageInfo.isSquare || !imageInfo.isOptimalSize || !imageInfo.hasTransparency) && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-orange-900 mb-1">💡 Optimization suggestions:</p>
                      <ul className="text-orange-800 space-y-1">
                        {!imageInfo.isSquare && (
                          <li>• Prefer a square image (1:1 ratio)</li>
                        )}
                        {!imageInfo.isOptimalSize && (
                          <li>• Recommended size: between 200px and 512px</li>
                        )}
                        {!imageInfo.hasTransparency && (
                          <li>• Prefer PNG to support transparent backgrounds</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Perfect badge */}
              {imageInfo.isSquare && imageInfo.isOptimalSize && imageInfo.hasTransparency && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-green-900">
                      ✨ Perfect! This avatar frame meets all best-practice standards!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}