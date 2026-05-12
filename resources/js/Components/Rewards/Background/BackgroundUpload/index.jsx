import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

// Components
import ImageUpload from './ImageUpload';
import Preview from './components/Preview/Index';
import EffectsInspector from './components/EffectsInspector';
import ImageInfo from './ImageInfo';
import ImageCropModal from './ImageCropModal';

// Hooks
import { useImageAnalysis, DEFAULT_EFFECTS } from "./components/hooks/useImageEffects";

/**
 * BackgroundUpload Component
 * Main container for background image upload with effects and crop
 * 
 * @param {Object} props
 * @param {Object} props.value - Initial value with url, file, info, effects
 * @param {Function} props.onChange - Callback when image or effects change
 * @param {String} props.error - Error message to display
 * @param {String} props.existingImageUrl - URL of existing image (for editing mode)
 * @param {Boolean} props.isEditing - Whether in editing mode
 */
const BackgroundUpload = ({ 
  value, 
  onChange, 
  error,
  existingImageUrl = null,
  isEditing = false
}) => {
  const [preview, setPreview] = useState(value?.url || existingImageUrl || null);
  const [imageInfo, setImageInfo] = useState(value?.info || null);
  const [imageFile, setImageFile] = useState(value?.file || null);
  const [effects, setEffects] = useState(value?.effects || DEFAULT_EFFECTS);
  const [isUploading, setIsUploading] = useState(false);
  
  // Crop modal state
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);

  const { analyzeImage } = useImageAnalysis();
  
  // Use ref to track if we should call onChange
  const isInitialMount = useRef(true);

  // Initialize with existing data in edit mode
  useEffect(() => {
    if (isEditing && existingImageUrl && !preview) {
      setPreview(existingImageUrl);
      setOriginalImage(existingImageUrl);
    }
  }, [isEditing, existingImageUrl, preview]);

  // Call onChange when data changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (preview && imageInfo) {
      onChange?.({
        type: 'image',
        url: preview,
        file: imageFile,
        info: imageInfo,
        effects
      });
    } else if (!preview) {
      onChange?.(null);
    }
  }, [preview, imageInfo, imageFile, effects, onChange]);

  /**
   * Update effects
   */
const updateEffects = (category, newValues) => {
  setEffects(prev => {
    const updated = {
      ...prev,
      [category]: {
        ...prev[category],
        ...newValues
      }
    };
    
    // ✅ 立即通知父组件
    
    if (preview) {
      onChange?.({
        type: 'image',
        url: preview,
        file: imageFile,
        info: imageInfo || {},  // ✅ 编辑模式可能没有 imageInfo
        effects: updated
      });
    }
    
    return updated;
  });
};
  /**
   * Handle file selection - opens crop modal
   */
  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Only JPG, PNG, or WebP supported');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('❌ File too large — maximum 20MB');
      return;
    }

    setIsUploading(true);

    try {
      // Read file as data URL for cropping
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setOriginalImage(imageUrl);
        setTempImage(imageUrl);
        setPendingFile(file);
        setShowCropModal(true);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('❌ Image processing failed: ' + err.message);
      setIsUploading(false);
    }
  };

  /**
   * Handle crop completion - process cropped image
   */
  const handleCropComplete = async ({ url, blob }) => {
    setIsUploading(true);

    try {
      // Create File from cropped Blob
      const croppedFile = new File(
        [blob], 
        pendingFile?.name || 'cropped-background.jpg',
        { type: 'image/jpeg' }
      );

      // Analyze cropped image
      const info = await analyzeImage(croppedFile);
      setImageInfo(info);
      setPreview(url);
      setImageFile(croppedFile);

      // Clean up
      setPendingFile(null);
      setTempImage(null);
    } catch (err) {
      alert('❌ Image processing failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle re-crop - open crop modal with ORIGINAL image
   */
  const handleReCrop = () => {
    if (originalImage) {
      setTempImage(originalImage);
      setShowCropModal(true);
    } else {
      alert('⚠️ Original image not available. Please upload a new image.');
    }
  };

  /**
   * Handle clear/remove image
   */
  const handleClear = () => {
    setPreview(null);
    setImageInfo(null);
    setImageFile(null);
    setOriginalImage(null);
    setTempImage(null);
    setPendingFile(null);
    setEffects(DEFAULT_EFFECTS);
  };

  /**
   * Trigger file input click for replace
   */
  const handleReplace = () => {
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.click();
    }
  };

  /**
   * Handle crop modal close
   */
  const handleCropModalClose = () => {
    setShowCropModal(false);
    setTempImage(null);
    if (pendingFile && !preview) {
      setPendingFile(null);
    }
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <ImageUpload onFileSelect={handleFileSelect} isUploading={isUploading} />
      ) : (
        <>
          <Preview preview={preview} effects={effects} />
          
          <div className="flex gap-2">
            <button
              onClick={handleReCrop}
              disabled={!originalImage}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                originalImage
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!originalImage ? 'Original image not available' : 'Re-crop image'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Re-crop
            </button>

            {isEditing && (
              <button
                onClick={handleReplace}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Replace Image
              </button>
            )}
            
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {isEditing ? 'Remove' : 'Clear'}
            </button>
          </div>

          {originalImage && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Original image saved - you can re-crop anytime
            </div>
          )}

          {imageInfo && <ImageInfo imageInfo={imageInfo} />}
          
          <EffectsInspector effects={effects} updateEffects={updateEffects} />
        </>
      )}

      <ImageCropModal
        isOpen={showCropModal}
        onClose={handleCropModalClose}
        imageSrc={tempImage}
        onCropComplete={handleCropComplete}
        aspect="16:9"
      />

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Processing image...</span>
        </div>
      )}
    </div>
  );
};

export default BackgroundUpload;
