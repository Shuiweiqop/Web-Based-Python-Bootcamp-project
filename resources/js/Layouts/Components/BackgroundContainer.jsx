import React, { useState, useEffect, useMemo } from 'react';
import { useEquip } from '@/Contexts/EquipContext';
import MeteorRain from './MeteorRain';
import { Sparkles } from 'lucide-react';

/**
 * ✅ 完整版 BackgroundContainer - 保留所有装备背景功能
 * 
 * 架构改动：
 * 1. fixed inset-0 w-screen h-screen（锚定 viewport，不再包裹内容）
 * 2. -z-50（永远在最底层）
 * 3. 不接收 children（children 由 StudentLayout 直接管理）
 */
export default function BackgroundContainer({ equippedBackground: propBackground }) {
  const { equipped, updateThemeVariant } = useEquip();
  
  const equippedBackground = propBackground !== undefined ? propBackground : equipped?.background;
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    console.log('🎨 BackgroundContainer state:', {
      propBackground,
      contextBackground: equipped?.background,
      finalBackground: equippedBackground,
      isNull: equippedBackground === null,
      isUndefined: equippedBackground === undefined,
      timestamp: equipped?.updated_at,
      refreshKey,
    });
  }, [propBackground, equipped, equippedBackground, refreshKey]);

  useEffect(() => {
    console.log('🔄 Background changed:', {
      current: equippedBackground,
      timestamp: equipped?.updated_at,
    });
    
    if (equippedBackground === null || equippedBackground === undefined) {
      console.log('✅ Background is null/undefined, showing default');
      setImageLoaded(false);
      setImageError(false);
      setInitialLoading(false);
      setRefreshKey(prev => prev + 1);
    } else {
      setImageLoaded(false);
      setImageError(false);
      setInitialLoading(true);
      setRefreshKey(prev => prev + 1);
    }
  }, [equippedBackground, equipped?.updated_at]);

  useEffect(() => {
    const analyzeBackgroundBrightness = () => {
      if (!equippedBackground) {
        updateThemeVariant('dark');
        console.log('🎨 No equipped background, using dark theme');
        return;
      }

      const metadata = equippedBackground.metadata || {};
      
      if (metadata.theme_variant) {
        updateThemeVariant(metadata.theme_variant);
        console.log('🎨 Using metadata theme:', metadata.theme_variant);
        return;
      }

      const bgType = metadata.background_type || 'image';
      
      if (bgType === 'gradient') {
        updateThemeVariant('dark');
        console.log('🎨 Gradient background detected, using dark theme');
      } else if (bgType === 'solid') {
        const color = metadata.solid_color || '#1a1a2e';
        const brightness = getBrightnessFromHex(color);
        const variant = brightness > 128 ? 'light' : 'dark';
        updateThemeVariant(variant);
        console.log('🎨 Solid color brightness:', brightness, '→', variant);
      } else {
        if (metadata.is_bright !== undefined) {
          updateThemeVariant(metadata.is_bright ? 'light' : 'dark');
          console.log('🎨 Using metadata is_bright:', metadata.is_bright);
        } else {
          updateThemeVariant('dark');
          console.log('🎨 Image background, defaulting to dark theme');
        }
      }
    };

    analyzeBackgroundBrightness();
  }, [equippedBackground, updateThemeVariant]);

  const getBrightnessFromHex = (hex) => {
    const cleanHex = hex.replace('#', '');
    const rgb = parseInt(cleanHex, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const backgroundData = useMemo(() => {
    if (equippedBackground === null || equippedBackground === undefined) {
      console.log('🌟 Using default animated background');
      return {
        type: 'gradient',
        gradient: 'from-slate-900 via-purple-900 to-slate-900',
        animated: true,
        animationIntensity: 'medium',
        animationPalette: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
        rarity: 'common',
        isDefault: true,
      };
    }

    const metadata = equippedBackground.metadata || {};
    const effects = metadata.effects || {};
    const animation = effects.animation || {};
    const basic = effects.basic || {};
    const overlay = effects.overlay || {};
    const filters = effects.filters || {};
    const layers = effects.layers || {};
    
    console.log('🎬 Animation data:', {
      enabled: animation.enabled,
      type: animation.type,
      duration: animation.duration,
      intensity: animation.intensity,
    });
    
    return {
      type: metadata.background_type || 'image',
      imageUrl: equippedBackground.image_url || metadata.url,
      gradient: metadata.gradient_class || 'from-gray-900 via-gray-800 to-gray-900',
      solidColor: metadata.solid_color || '#1a1a2e',
      
      animated: animation.enabled === true,
      animationIntensity: metadata.animation_intensity || 'medium',
      animationType: animation.type,
      animationDuration: animation.duration || 20,
      animationScale: animation.intensity || 1.2,
      animationPalette: metadata.animation_palette || ['#10b981', '#3b82f6', '#8b5cf6'],
      
      blur: basic.blur || 0,
      opacity: basic.opacity !== undefined ? basic.opacity : 1,
      
      overlayColor: overlay.color || '#000000',
      overlayOpacity: overlay.opacity || 0,
      
      filters: {
        brightness: filters.brightness || 100,
        contrast: filters.contrast || 100,
        grayscale: filters.grayscale || 0,
        saturate: filters.saturate || 100,
      },
      
      particlesEnabled: layers.particles === true,
      particleColor: layers.particleColor || '#ffffff',
      particleCount: layers.particleCount || 20,
      particleSpeed: layers.particleSpeed || 5,
      
      badgeEnabled: layers.badge === true,
      badgePosition: layers.badgePosition || 'top-right',
      
      rarity: equippedBackground.rarity || 'common',
      isDefault: false,
    };
  }, [equippedBackground, refreshKey]);

  useEffect(() => {
    if (backgroundData.type === 'image' && backgroundData.imageUrl) {
      setImageLoaded(false);
      setImageError(false);
      setInitialLoading(true);

      const img = new Image();
      img.src = backgroundData.imageUrl;
      
      img.onload = () => {
        setImageLoaded(true);
        setInitialLoading(false);
        console.log('✅ Background image loaded:', backgroundData.imageUrl);
      };
      
      img.onerror = () => {
        setImageError(true);
        setInitialLoading(false);
        console.error('❌ Failed to load background image:', backgroundData.imageUrl);
      };
    } else {
      setInitialLoading(false);
      setImageLoaded(true);
    }
  }, [backgroundData.type, backgroundData.imageUrl, refreshKey]);

  const shouldShowAnimation = backgroundData.animated && 
                             !prefersReducedMotion && 
                             (imageLoaded || backgroundData.isDefault) &&
                             !backgroundData.animationType &&
                             backgroundData.isDefault;

  const getIntensityParams = () => {
    const intensityMap = {
      low: { meteorCount: 15, speed: 0.5, rate: 0.3 },
      medium: { meteorCount: 25, speed: 1, rate: 0.5 },
      high: { meteorCount: 40, speed: 1.5, rate: 0.8 },
      legendary: { meteorCount: 60, speed: 2, rate: 1.2 }
    };
    return intensityMap[backgroundData.animationIntensity] || intensityMap.medium;
  };

  const getFilterString = () => {
    const filters = [];
    
    if (backgroundData.blur > 0) {
      filters.push(`blur(${backgroundData.blur}px)`);
    }
    
    if (backgroundData.filters.brightness !== 100) {
      filters.push(`brightness(${backgroundData.filters.brightness}%)`);
    }
    
    if (backgroundData.filters.contrast !== 100) {
      filters.push(`contrast(${backgroundData.filters.contrast}%)`);
    }
    
    if (backgroundData.filters.grayscale > 0) {
      filters.push(`grayscale(${backgroundData.filters.grayscale}%)`);
    }
    
    if (backgroundData.filters.saturate !== 100) {
      filters.push(`saturate(${backgroundData.filters.saturate}%)`);
    }
    
    return filters.length > 0 ? filters.join(' ') : undefined;
  };

  const getCustomAnimationClass = () => {
    if (!backgroundData.animated || !backgroundData.animationType) {
      console.log('❌ No animation:', { animated: backgroundData.animated, type: backgroundData.animationType });
      return '';
    }
    
    const type = backgroundData.animationType.toLowerCase();
    
    console.log('🎬 Getting animation class for type:', type);
    
    const animationMap = {
      'scale': 'animate-bg-scale',
      'rotate': 'animate-bg-rotate',
      'float': 'animate-bg-float',
      'ken-burns': 'animate-ken-burns',
      'kenburns': 'animate-ken-burns',
    };
    
    const animClass = animationMap[type] || '';
    console.log('✅ Animation class:', animClass);
    return animClass;
  };

  const getAnimationStyle = () => {
    const style = {
      filter: getFilterString(),
      opacity: backgroundData.opacity,
    };
    
    if (backgroundData.animationType && backgroundData.animationDuration) {
      const duration = `${backgroundData.animationDuration}s`;
      
      if (backgroundData.animationType.toLowerCase().includes('ken')) {
        style['--scale-end'] = backgroundData.animationScale || 1.2;
        style.animation = `ken-burns ${duration} ease-in-out infinite`;
        console.log('🎬 Ken Burns config:', { 
          scale: style['--scale-end'], 
          duration,
          mode: 'infinite loop'
        });
      } else {
        style.animationDuration = duration;
      }
    }
    
    return style;
  };

  const renderBackground = () => {
    if (backgroundData.isDefault) {
      console.log('🎨 Rendering default gradient background (key:', refreshKey, ')');
      return (
        <div 
          key={`default-bg-${refreshKey}`}
          className={`absolute inset-0 bg-gradient-to-br ${backgroundData.gradient} transition-opacity duration-500`}
        />
      );
    }

    switch (backgroundData.type) {
      case 'image':
        if (imageError) {
          console.log('🎨 Image failed, using fallback gradient');
          return (
            <div 
              key={`fallback-bg-${refreshKey}`}
              className={`absolute inset-0 bg-gradient-to-br ${backgroundData.gradient}`} 
            />
          );
        }
        
        const animClass = getCustomAnimationClass();
        console.log('🎨 Rendering image with animation class:', animClass);
        
        return (
          <React.Fragment key={`image-bg-${refreshKey}`}>
            {!imageLoaded && (
              <div className={`absolute inset-0 bg-gradient-to-br ${backgroundData.gradient}`} />
            )}
            
            {backgroundData.imageUrl && (
              <div
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${animClass}`}
                style={{
                  backgroundImage: `url(${backgroundData.imageUrl})`,
                  ...getAnimationStyle(),
                }}
              />
            )}
            
            {backgroundData.overlayOpacity > 0 && (
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  backgroundColor: backgroundData.overlayColor,
                  opacity: backgroundData.overlayOpacity,
                }}
              />
            )}
            
            {backgroundData.particlesEnabled && imageLoaded && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(backgroundData.particleCount)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full animate-particle-float"
                    style={{
                      backgroundColor: backgroundData.particleColor,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                      animationDuration: `${5 + Math.random() * 5}s`,
                    }}
                  />
                ))}
              </div>
            )}
            
            {backgroundData.badgeEnabled && imageLoaded && (
              <div
                className={`absolute z-20 ${
                  backgroundData.badgePosition === 'top-left' ? 'top-4 left-4' :
                  backgroundData.badgePosition === 'top-right' ? 'top-4 right-4' :
                  backgroundData.badgePosition === 'bottom-left' ? 'bottom-4 left-4' :
                  'bottom-4 right-4'
                }`}
              >
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Premium
                </div>
              </div>
            )}
          </React.Fragment>
        );

      case 'gradient':
        console.log('🎨 Rendering gradient background');
        return (
          <div 
            key={`gradient-bg-${refreshKey}`}
            className={`absolute inset-0 bg-gradient-to-br ${backgroundData.gradient}`} 
          />
        );

      case 'solid':
        console.log('🎨 Rendering solid color background');
        return (
          <div 
            key={`solid-bg-${refreshKey}`}
            className="absolute inset-0"
            style={{ backgroundColor: backgroundData.solidColor }}
          />
        );

      default:
        console.log('🎨 Rendering default fallback background');
        return (
          <div 
            key={`default-fallback-${refreshKey}`}
            className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" 
          />
        );
    }
  };

  useEffect(() => {
    console.log('🎨 Render decision:', {
      isDefault: backgroundData.isDefault,
      animated: backgroundData.animated,
      animationType: backgroundData.animationType,
      shouldShowAnimation,
      imageLoaded,
      hasCustomAnimation: !!backgroundData.animationType,
      equippedBackground: !!equippedBackground,
    });
  }, [backgroundData, shouldShowAnimation, imageLoaded, equippedBackground]);

  return (
    <>
      {/* ✅ 主背景层：固定定位，锚定 viewport，最底层 */}
      <div 
        className="fixed overflow-hidden" 
        style={{ 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          width: '100vw', 
          height: '100vh',
          zIndex: -50 
        }}
      >
        {renderBackground()}

        {/* 流星雨动画（只在默认背景显示）*/}
        {shouldShowAnimation && backgroundData.isDefault && (
          <MeteorRain
            key={`meteor-${refreshKey}`}
            enabled={true}
            palette={backgroundData.animationPalette}
            {...getIntensityParams()}
          />
        )}

        {/* 稀有度光晕效果 */}
        {!backgroundData.isDefault && 
         equippedBackground && 
         backgroundData.rarity !== 'common' && 
         imageLoaded && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${
                backgroundData.rarity === 'legendary' ? '#fbbf24' :
                backgroundData.rarity === 'epic' ? '#a855f7' :
                backgroundData.rarity === 'rare' ? '#3b82f6' : 'transparent'
              } 0%, transparent 70%)`
            }}
          />
        )}
      </div>

      {/* ✅ 加载动画层：固定定位，在背景之上 */}
      {initialLoading && !backgroundData.isDefault && (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-40">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg font-medium">Loading background...</p>
          </div>
        </div>
      )}
    </>
  );
}