import React from 'react';

/**
 * AnimatedBackground Component
 * Renders the background image with filters, animations, and transforms
 * 
 * @param {Object} props
 * @param {String} props.preview - Image URL
 * @param {Object} props.animation - Animation config { enabled, type, duration }
 * @param {Object} props.filters - Filter values { blur, brightness, contrast, grayscale, saturate }
 * @param {Object} props.transform - Transform config { scale, positionX, positionY, objectFit }
 * @param {Number} props.opacity - Overall opacity (0-1)
 */
const AnimatedBackground = ({ 
  preview, 
  animation = {}, 
  filters = {}, 
  transform = {}, 
  opacity = 1 
}) => {
  // Default values for nested objects
  const animationConfig = {
    enabled: false,
    type: 'scale',
    duration: 3,
    ...animation
  };

  const filterConfig = {
    blur: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    saturate: 100,
    ...filters
  };

  const transformConfig = {
    scale: 1,
    positionX: 50,
    positionY: 50,
    objectFit: 'cover',
    ...transform
  };

  // Map animation types to CSS classes
  const getAnimationClass = () => {
    if (!animationConfig.enabled) return '';
    
    const animationMap = {
  scale: 'animate-bg-scale',
  rotate: 'animate-bg-rotate',
  float: 'animate-bg-float',
  'ken-burns': 'animate-ken-burns',  // ✅ Now matches the ID from AnimationTab
};
    
    return animationMap[animationConfig.type] || '';
  };

  // Build CSS filter string
  const getFilterString = () => {
    const filterList = [];
    
    if (filterConfig.blur > 0) {
      filterList.push(`blur(${filterConfig.blur}px)`);
    }
    if (filterConfig.brightness !== 100) {
      filterList.push(`brightness(${filterConfig.brightness}%)`);
    }
    if (filterConfig.contrast !== 100) {
      filterList.push(`contrast(${filterConfig.contrast}%)`);
    }
    if (filterConfig.grayscale > 0) {
      filterList.push(`grayscale(${filterConfig.grayscale}%)`);
    }
    if (filterConfig.saturate !== 100) {
      filterList.push(`saturate(${filterConfig.saturate}%)`);
    }
    
    return filterList.length > 0 ? filterList.join(' ') : undefined;
  };

  // Build transform style - 只有当 scale 不等于 1 时才应用
  const getTransformStyle = () => {
    const { scale } = transformConfig;
    // 确保 scale 是有效数字且不等于 1
    if (scale && scale !== 1 && !isNaN(scale)) {
      return `scale(${scale})`;
    }
    return undefined;
  };

  // Determine background size based on objectFit
  const getBackgroundSize = () => {
    switch (transformConfig.objectFit) {
      case 'cover':
        return 'cover';
      case 'contain':
        return 'contain';
      case 'fill':
        return '100% 100%';
      case 'none':
        return 'auto';
      default:
        return 'cover';
    }
  };

  // Don't render if no preview image
  if (!preview) {
    return null;
  }

  const styleObj = {
    backgroundImage: `url(${preview})`,
    backgroundSize: getBackgroundSize(),
    backgroundPosition: `${transformConfig.positionX}% ${transformConfig.positionY}%`,
    backgroundRepeat: 'no-repeat',
    opacity,
    animationDuration: animationConfig.enabled ? `${animationConfig.duration}s` : undefined,
  };

  // 只在有 filter 或 transform 时添加这些属性
  const filterStr = getFilterString();
  if (filterStr) {
    styleObj.filter = filterStr;
  }

  const transformStr = getTransformStyle();
  if (transformStr) {
    styleObj.transform = transformStr;
  }

  return (
    <div
      className={`absolute inset-0 ${getAnimationClass()}`}
      style={styleObj}
    />
  );
};

export default AnimatedBackground;