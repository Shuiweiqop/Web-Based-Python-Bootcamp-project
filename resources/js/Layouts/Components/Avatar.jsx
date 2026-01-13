import React, { useState, useMemo } from 'react';
import { User } from 'lucide-react';

/**
 * Avatar - 展示用户头像 + 装备的头像框
 * 
 * 功能:
 * 1. 混合尺寸系统（预设 + 自定义）
 * 2. 混合边框方式（背景层 + 覆盖层）
 * 3. 丰富的稀有度效果（粒子、光晕、动画）
 * 4. 完整交互（点击、悬停）
 * 5. 多种 Fallback 模式
 */
export default function Avatar({
  // 基础属性
  src,
  alt = 'User Avatar',
  size = 'md', // 'xs'|'sm'|'md'|'lg'|'xl' or number
  
  // 装备系统
  frame = null, // { image_url, rarity, metadata: { frame_type, effects } }
  
  // 视觉效果
  showRarityGlow = true,
  showRarityParticles = true,
  
  // 交互
  clickable = false,
  onClick = null,
  onHover = null,
  showTooltip = false,
  tooltipContent = null,
  
  // 状态指示
  showBadge = false,
  badgeStatus = 'online', // 'online'|'offline'|'busy'|'away'
  
  // Fallback
  fallback = 'initials', // 'initials'|'icon'|'empty'
  userName = '',
  
  // 额外样式
  className = '',
  borderless = false
}) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);

  // 尺寸映射（像素）
  const sizeMap = {
    xs: 32,
    sm: 40,
    md: 64,
    lg: 96,
    xl: 128,
    '2xl': 160
  };

  const avatarSize = typeof size === 'number' ? size : sizeMap[size] || 64;
  
  // 解析 Frame 数据
  const frameData = useMemo(() => {
    if (!frame) return null;

    const metadata = frame.metadata || {};
    
    return {
      imageUrl: frame.image_url,
      rarity: frame.rarity || 'common',
      frameType: metadata.frame_type || 'overlay', // 'overlay'|'background'|'both'
      backgroundUrl: metadata.background_url,
      overlayUrl: metadata.overlay_url || frame.image_url,
      glowColor: metadata.glow_color || getRarityColor(frame.rarity),
      particleColor: metadata.particle_color || getRarityColor(frame.rarity),
      animated: metadata.animated !== false,
      effects: metadata.effects || []
    };
  }, [frame]);

  // 稀有度颜色
  function getRarityColor(rarity) {
    const colorMap = {
      legendary: '#fbbf24', // 金色
      epic: '#a855f7',      // 紫色
      rare: '#3b82f6',      // 蓝色
      uncommon: '#10b981',  // 绿色
      common: '#6b7280'     // 灰色
    };
    return colorMap[rarity] || colorMap.common;
  }

  // 获取用户名首字母
  const getInitials = () => {
    if (!userName) return '?';
    const names = userName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  // 渲染 Fallback
  const renderFallback = () => {
    const bgColor = frameData?.glowColor || '#6b7280';
    
    switch (fallback) {
      case 'initials':
        return (
          <div 
            className="w-full h-full flex items-center justify-center font-bold text-white"
            style={{ 
              background: `linear-gradient(135deg, ${bgColor}dd, ${bgColor}88)`,
              fontSize: `${avatarSize * 0.35}px`
            }}
          >
            {getInitials()}
          </div>
        );
      
      case 'icon':
        return (
          <div 
            className="w-full h-full flex items-center justify-center text-white"
            style={{ 
              background: `linear-gradient(135deg, ${bgColor}dd, ${bgColor}88)`
            }}
          >
            <User size={avatarSize * 0.5} />
          </div>
        );
      
      case 'empty':
      default:
        return (
          <div 
            className="w-full h-full"
            style={{ background: '#374151' }}
          />
        );
    }
  };

  // 稀有度粒子效果（legendary）
  const renderParticles = () => {
    if (!showRarityParticles || !frameData || frameData.rarity !== 'legendary') {
      return null;
    }

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-ping"
            style={{
              background: frameData.particleColor,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
    );
  };

  // 稀有度光晕
  const renderGlow = () => {
    if (!showRarityGlow || !frameData || frameData.rarity === 'common') {
      return null;
    }

    const glowIntensity = {
      legendary: 'opacity-60',
      epic: 'opacity-40',
      rare: 'opacity-30',
      uncommon: 'opacity-20'
    }[frameData.rarity] || 'opacity-10';

    return (
      <>
        {/* 内光晕 */}
        <div 
          className={`absolute inset-0 rounded-full blur-md ${glowIntensity} ${
            frameData.animated ? 'animate-pulse' : ''
          }`}
          style={{
            background: `radial-gradient(circle, ${frameData.glowColor} 0%, transparent 70%)`,
            transform: 'scale(0.9)'
          }}
        />
        
        {/* 外光晕 */}
        <div 
          className={`absolute inset-0 rounded-full blur-xl ${glowIntensity} ${
            frameData.animated ? 'animate-pulse' : ''
          }`}
          style={{
            background: `radial-gradient(circle, ${frameData.glowColor} 0%, transparent 60%)`,
            transform: 'scale(1.2)',
            animationDelay: '0.5s'
          }}
        />
      </>
    );
  };

  // 悬停效果
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (showTooltip) setShowTooltipState(true);
    if (onHover) onHover(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltipState(false);
    if (onHover) onHover(false);
  };

  const handleClick = (e) => {
    if (onClick && clickable) {
      onClick(e);
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      style={{ width: avatarSize, height: avatarSize }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 光晕层 */}
      {renderGlow()}

      {/* 主容器 */}
      <div
        className={`relative rounded-full overflow-hidden transition-all duration-300 ${
          clickable ? 'cursor-pointer' : ''
        } ${
          isHovered && clickable ? 'scale-105 shadow-2xl' : 'shadow-lg'
        }`}
        style={{ width: avatarSize, height: avatarSize }}
        onClick={handleClick}
      >
        {/* 背景层边框（如果有） */}
        {frameData && (frameData.frameType === 'background' || frameData.frameType === 'both') && frameData.backgroundUrl && (
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${frameData.backgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}

        {/* 头像图片 */}
        <div 
          className={`absolute inset-0 z-10 rounded-full overflow-hidden ${
            !borderless ? 'border-2 border-white/20' : ''
          }`}
          style={{
            padding: frameData ? '8%' : '0' // 为边框留空间
          }}
        >
          {!imageError && src ? (
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover rounded-full"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full rounded-full overflow-hidden">
              {renderFallback()}
            </div>
          )}
        </div>

        {/* 覆盖层边框（如果有） */}
        {frameData && (frameData.frameType === 'overlay' || frameData.frameType === 'both') && frameData.overlayUrl && (
          <div 
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              backgroundImage: `url(${frameData.overlayUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}

        {/* 悬停遮罩 */}
        {clickable && (
          <div 
            className={`absolute inset-0 z-30 bg-black/30 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="text-white text-xs font-medium">View</div>
          </div>
        )}

        {/* 粒子效果 */}
        {renderParticles()}
      </div>

      {/* 状态徽章 */}
      {showBadge && (
        <div 
          className="absolute bottom-0 right-0 z-40 rounded-full border-2 border-white"
          style={{
            width: avatarSize * 0.25,
            height: avatarSize * 0.25,
            background: {
              online: '#10b981',
              offline: '#6b7280',
              busy: '#ef4444',
              away: '#f59e0b'
            }[badgeStatus]
          }}
        />
      )}

      {/* Tooltip */}
      {showTooltip && showTooltipState && tooltipContent && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 px-3 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap shadow-xl backdrop-blur-sm border border-white/10">
          {tooltipContent}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90" />
        </div>
      )}

      {/* 稀有度标识（可选，小尺寸时显示） */}
      {frameData && frameData.rarity !== 'common' && avatarSize >= 64 && (
        <div 
          className="absolute top-0 right-0 z-40 text-xs font-bold px-1.5 py-0.5 rounded-full"
          style={{
            background: frameData.glowColor,
            fontSize: avatarSize * 0.12,
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          {frameData.rarity[0].toUpperCase()}
        </div>
      )}
    </div>
  );
}