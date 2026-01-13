import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { createPortal } from 'react-dom';

/**
 * Helper to create image element
 */
const createImage = (url) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
};

/**
 * Create cropped image from canvas
 */
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      resolve({ url, blob });
    }, 'image/jpeg', 0.95);
  });
};

/**
 * Convert aspect string to number
 */
const getAspectValue = (aspectStr) => {
  const aspectMap = {
    '16:9': 16 / 9,
    '4:3': 4 / 3,
    '1:1': 1,
    '3:2': 3 / 2,
    '2:3': 2 / 3,
    'free': undefined
  };
  return aspectMap[aspectStr] || 16 / 9;
};

/**
 * ImageCropModal Component
 * Modal for cropping uploaded images
 * 
 * @param {Object} props
 * @param {Boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {String} props.imageSrc - Original image URL
 * @param {Function} props.onCropComplete - Callback with cropped image
 * @param {String} props.aspect - Aspect ratio (e.g., '16:9', '4:3', '1:1', 'free')
 */
const ImageCropModal = ({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropComplete,
  aspect = '16:9' 
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(getAspectValue(aspect));

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset crop when modal opens
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setAspectRatio(getAspectValue(aspect));
    }
  }, [isOpen, aspect]);

  // Called when crop area changes
  const onCropChange = (location) => {
    setCrop(location);
  };

  // Called when zoom changes
  const onZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  // Called when user completes cropping
  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Generate cropped image
  const createCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  }, [imageSrc, croppedAreaPixels, onCropComplete, onClose]);

  // Handle aspect ratio change
  const handleAspectChange = (newAspect) => {
    setAspectRatio(getAspectValue(newAspect));
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-800">Crop Image</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative h-96 bg-gray-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
            style={{
              containerStyle: {
                position: 'relative',
                width: '100%',
                height: '100%'
              }
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4 border-t bg-white">
          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspect Ratio
            </label>
            <div className="flex gap-2 flex-wrap">
              {['16:9', '4:3', '1:1', '3:2', '2:3', 'free'].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => handleAspectChange(ratio)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    (ratio === 'free' && aspectRatio === undefined) ||
                    getAspectValue(ratio) === aspectRatio
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {ratio === 'free' ? 'Free' : ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-white rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={createCroppedImage}
            disabled={!croppedAreaPixels}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render at document body level
  return createPortal(modalContent, document.body);
};

export default ImageCropModal;