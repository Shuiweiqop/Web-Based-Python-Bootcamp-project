import React, { useState, useRef } from 'react';
import { Upload, Sparkles } from 'lucide-react';

/**
 * ImageUpload Component
 * Handles file selection via drag-and-drop or click
 * 
 * @param {Object} props
 * @param {Function} props.onFileSelect - Callback when file is selected
 * @param {Boolean} props.isUploading - Loading state
 */
const ImageUpload = ({ onFileSelect, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
        isDragging
          ? 'border-blue-500 bg-blue-50 scale-[1.02]'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      } ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <div className="p-12 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 transition-transform hover:scale-110">
          <Upload className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isUploading ? 'Uploading...' : 'Upload background image'}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">
          Drag & drop a file here, or click to select
        </p>

        {/* File type info */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
          <Sparkles className="w-4 h-4" />
          Supports JPG, PNG, WebP — max 10MB
        </div>

        {/* Recommendation */}
        <p className="text-xs text-gray-500 mt-3">
          Recommended: 1920×1080 or higher resolution
        </p>

        {/* Loading indicator */}
        {isUploading && (
          <div className="mt-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;