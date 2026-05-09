import { useCallback } from 'react';

/**
 * Hook to analyze uploaded images
 * @returns {Object} { analyzeImage }
 */
export const useImageAnalysis = () => {
  const analyzeImage = useCallback((file) => {
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
  }, []);

  return { analyzeImage };
};
