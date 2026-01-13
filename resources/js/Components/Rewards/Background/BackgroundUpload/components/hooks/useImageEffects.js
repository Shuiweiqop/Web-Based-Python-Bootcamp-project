import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Default Effects Schema
 */
export const DEFAULT_EFFECTS = {
  basic: { 
    blur: 0, 
    opacity: 1 
  },
  transform: {
    scale: 1,
    positionX: 50,
    positionY: 50,
    objectFit: 'cover'
  },
  overlay: { 
    color: '#000000', 
    opacity: 0 
  },
  animation: { 
    enabled: false, 
    type: 'none', 
    duration: 20, 
    intensity: 1 
  },
  filters: {
    blur: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    saturate: 100
  },
  layers: {
    particles: false,
    particleColor: '#ffffff',
    particleCount: 50,
    particleSpeed: 5,
    badge: false,
    badgePosition: 'top-right'
  }
};

/**
 * Deep merge function to combine default effects with initial effects
 */
const deepMerge = (target, source) => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Hook to manage image effects
 * 
 * @param {Function} onChange - Callback when effects change
 * @param {String} preview - Current preview URL
 * @param {Object} imageInfo - Current image info
 * @param {Object} initialEffects - Initial effects for edit mode (optional)
 * @returns {Object} { effects, updateEffects }
 */
export const useImageEffects = (onChange, preview, imageInfo, initialEffects = null) => {
  const [effects, setEffects] = useState(() => {
    if (initialEffects) {
      console.log('🎨 [INIT] Initializing with existing effects:', initialEffects);
      const merged = deepMerge(DEFAULT_EFFECTS, initialEffects);
      console.log('🎨 [INIT] Merged effects:', merged);
      return merged;
    }
    console.log('🎨 [INIT] Initializing with DEFAULT_EFFECTS');
    return DEFAULT_EFFECTS;
  });

  const isFirstRender = useRef(true);
  const prevInitialEffectsRef = useRef(null);

  useEffect(() => {
    const currentSerialized = JSON.stringify(initialEffects);
    const prevSerialized = JSON.stringify(prevInitialEffectsRef.current);
    
    if (!isFirstRender.current && initialEffects && currentSerialized !== prevSerialized) {
      console.log('🔄 [UPDATE] initialEffects changed!');
      const merged = deepMerge(DEFAULT_EFFECTS, initialEffects);
      console.log('🔄 [UPDATE] Setting new effects:', merged);
      setEffects(merged);
    }
    
    prevInitialEffectsRef.current = initialEffects;
  }, [initialEffects]);

  // ✅ 关键修复：编辑模式下放宽条件
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      console.log('🏁 [MOUNT] First render completed');
      
      // ✅ 编辑模式：只需要 preview 和 onChange
      if (preview && onChange) {
        console.log('📤 [MOUNT] Sending initial effects to parent (edit mode)');
        console.log('📤 [MOUNT] Has imageInfo:', !!imageInfo);
        console.log('📤 [MOUNT] Effects:', effects);
        onChange({
          type: 'image',
          url: preview,
          info: imageInfo || {},
          effects
        });
      }
      return;
    }
    
    // ✅ 后续更新：只需要 preview 和 onChange
    if (preview && onChange) {
      console.log('📤 [NOTIFY] Sending effects to parent');
      console.log('📤 [NOTIFY] Animation state:', effects.animation);
      onChange({
        type: 'image',
        url: preview,
        info: imageInfo || {},
        effects
      });
    }
  }, [effects, preview, onChange]); // ✅ 移除 imageInfo 依赖

  const updateEffects = useCallback((category, newValues) => {
    console.log('🔧 [UPDATE_EFFECTS] Called with:', { category, newValues });
    
    setEffects(prev => {
      console.log('📦 [UPDATE_EFFECTS] Previous effects:', prev);
      
      const updated = {
        ...prev,
        [category]: {
          ...prev[category],
          ...newValues
        }
      };
      
      console.log('✅ [UPDATE_EFFECTS] Updated effects:', updated);
      console.log('🎬 [UPDATE_EFFECTS] Animation section:', updated.animation);
      return updated;
    });
  }, []);

  return { effects, updateEffects };
};

/**
 * Hook to analyze uploaded images
 * @returns {Object} { analyzeImage }
 */
export const useImageAnalysis = () => {
  const analyzeImage = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const info = {
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          aspectRatio: (img.width / img.height).toFixed(2),
          sizeFormatted: formatFileSize(file.size)
        };
        
        // Clean up
        URL.revokeObjectURL(img.src);
        
        resolve(info);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  return { analyzeImage };
};

/**
 * Helper function to format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}