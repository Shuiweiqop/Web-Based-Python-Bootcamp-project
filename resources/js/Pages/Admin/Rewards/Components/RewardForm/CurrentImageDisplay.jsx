import React from 'react';
import { Image } from 'lucide-react';

/**
 * Current Image Display Component
 * Responsibility: Show the existing image + option to keep the existing image
 * Only used on Edit pages
 */
export default function CurrentImageDisplay({
  imageUrl,
  keepExistingImage,
  onKeepExistingImageChange,
}) {
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        {/* Image preview */}
        <div className="flex-shrink-0 w-20 h-20 bg-white rounded-lg border-2 border-blue-300 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Current"
              className="w-full h-full object-contain"
            />
          ) : (
            <Image className="w-8 h-8 text-gray-300" />
          )}
        </div>

        {/* Explanatory text */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900 mb-1">
            Current Image
          </p>
          <p className="text-xs text-blue-700 mb-2">
            Uploading a new image will replace the current image
          </p>
          
          {/* Keep existing option */}
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={keepExistingImage}
              onChange={(e) => onKeepExistingImageChange(e.target.checked)}
              className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-blue-800">
              Keep existing image (if no new image is uploaded)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
