import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Check, 
  Lock, 
  Eye, 
  Sparkles,
  Image as ImageIcon,
  Frame,
  Award,
  Star
} from 'lucide-react';

/**
 * RewardCard - 展示奖励物品卡片
 * 
 * 功能:
 * 1. 多模式布局（grid/list/compact）
 * 2. 完整状态支持（owned/equipped/locked）
 * 3. 多层稀有度效果（光晕+粒子+动画）
 * 4. 悬停详细预览面板
 * 5. 类型差异化渲染
 * 6. 价格显示
 */
export default function RewardCard({
  // 数据
  item,
  
  // 模式
  mode = 'grid', // 'grid'|'list'|'compact'
  
  // 状态
  owned = false,
  equipped = false,
  locked = false,
  canAfford = true,
  
  // 操作
  onBuy = null,
  onEquip = null,
  onPreview = null,
  onClick = null,
  
  // 显示控制
  showRarity = true,
  showPrice = true,
  showDescription = true,
  showPreviewButton = true,
  
  // 交互
  clickable = true,
  
  // 额外样式
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 解析物品数据
  const itemData = useMemo(() => {
    const metadata = item?.metadata || {};
    
    return {
      id: item?.id || item?.reward_id,
      name: item?.name || item?.reward_name || 'Unknown Item',
      imageUrl: item?.image_url,
      type: item?.reward_type || item?.type || 'item',
      rarity: item?.rarity || 'common',
      cost: item?.points_cost || item?.cost || 0,
      description: item?.description || '',
      animated: metadata.animated === true,
      effects: metadata.effects || [],
      unlockLevel: metadata.unlock_level,
      metadata
    };
  }, [item]);

  // 稀有度配置
  const rarityConfig = useMemo(() => {
    const configs = {
      legendary: {
        color: '#fbbf24',
        gradient: 'from-yellow-500 to-orange-500',
        bgGradient: 'from-yellow-500/20 to-orange-500/20',
        textColor: 'text-yellow-400',
        label: 'Legendary',
        glow: 'shadow-yellow-500/50'
      },
      epic: {
        color: '#a855f7',
        gradient: 'from-purple-500 to-pink-500',
        bgGradient: 'from-purple-500/20 to-pink-500/20',
        textColor: 'text-purple-400',
        label: 'Epic',
        glow: 'shadow-purple-500/50'
      },
      rare: {
        color: '#3b82f6',
        gradient: 'from-blue-500 to-cyan-500',
        bgGradient: 'from-blue-500/20 to-cyan-500/20',
        textColor: 'text-blue-400',
        label: 'Rare',
        glow: 'shadow-blue-500/50'
      },
      uncommon: {
        color: '#10b981',
        gradient: 'from-green-500 to-emerald-500',
        bgGradient: 'from-green-500/20 to-emerald-500/20',
        textColor: 'text-green-400',
        label: 'Uncommon',
        glow: 'shadow-green-500/50'
      },
      common: {
        color: '#6b7280',
        gradient: 'from-gray-500 to-gray-600',
        bgGradient: 'from-gray-500/20 to-gray-600/20',
        textColor: 'text-gray-400',
        label: 'Common',
        glow: 'shadow-gray-500/50'
      }
    };
    return configs[itemData.rarity] || configs.common;
  }, [itemData.rarity]);

  // 类型图标
  const TypeIcon = useMemo(() => {
    const icons = {
      background: ImageIcon,
      avatar_frame: Frame,
      title: Award,
      badge: Star
    };
    return icons[itemData.type] || Sparkles;
  }, [itemData.type]);

  // 处理点击
  const handleCardClick = () => {
    if (clickable && onClick) {
      onClick(item);
    }
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    if (action) action(item);
  };

  // 渲染稀有度粒子
  const renderParticles = () => {
    if (itemData.rarity !== 'legendary' || !isHovered) return null;

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-yellow-400 animate-ping"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1.5s'
            }}
          />
        ))}
      </div>
    );
  };

  // 渲染光晕效果
  const renderGlow = () => {
    if (itemData.rarity === 'common' || !showRarity) return null;

    return (
      <>
        <div 
          className={`absolute -inset-1 rounded-lg blur-md opacity-30 transition-opacity duration-300 ${
            isHovered ? 'opacity-50' : 'opacity-30'
          } ${itemData.rarity === 'legendary' ? 'animate-pulse' : ''}`}
          style={{
            background: `linear-gradient(135deg, ${rarityConfig.color}, transparent)`
          }}
        />
        {isHovered && itemData.rarity !== 'common' && (
          <div 
            className="absolute -inset-2 rounded-lg blur-xl opacity-20 animate-pulse"
            style={{ background: rarityConfig.color }}
          />
        )}
      </>
    );
  };

  // 渲染操作按钮
  const renderActionButton = () => {
    if (locked) {
      return (
        <button
          disabled
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed"
        >
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {itemData.unlockLevel ? `Level ${itemData.unlockLevel}` : 'Locked'}
          </span>
        </button>
      );
    }

    if (equipped) {
      return (
        <button
          disabled
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30"
        >
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Equipped</span>
        </button>
      );
    }

    if (owned) {
      return (
        <button
          onClick={(e) => handleActionClick(e, onEquip)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Equip</span>
        </button>
      );
    }

    return (
      <button
        onClick={(e) => handleActionClick(e, onBuy)}
        disabled={!canAfford}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
          canAfford
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ShoppingCart className="w-4 h-4" />
        <span>{canAfford ? 'Buy' : 'Insufficient Points'}</span>
      </button>
    );
  };

  // 渲染悬停预览面板
  const renderHoverPanel = () => {
    if (!isHovered || mode === 'compact' || !showDescription) return null;

    return (
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm rounded-lg p-4 flex flex-col justify-between z-20 animate-in fade-in duration-200">
        {/* 顶部信息 */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm line-clamp-2">
                {itemData.name}
              </h4>
              {showRarity && (
                <span className={`text-xs font-medium ${rarityConfig.textColor}`}>
                  {rarityConfig.label}
                </span>
              )}
            </div>
            <TypeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>

          {itemData.description && (
            <p className="text-gray-300 text-xs line-clamp-3">
              {itemData.description}
            </p>
          )}

          {itemData.animated && (
            <div className="flex items-center space-x-1 text-yellow-400">
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-medium">Animated</span>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="space-y-2">
          {showPreviewButton && onPreview && (
            <button
              onClick={(e) => handleActionClick(e, onPreview)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-xs font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          )}
          
          {showPrice && !owned && (
            <div className="flex items-center justify-center space-x-1 text-amber-400">
              <Sparkles className="w-3 h-3" />
              <span className="text-sm font-bold">{itemData.cost.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染图片区域
  const renderImage = () => {
    const sizeClass = mode === 'compact' ? 'h-20' : mode === 'list' ? 'h-24' : 'h-40';
    
    return (
      <div className={`relative ${sizeClass} overflow-hidden rounded-lg bg-gradient-to-br ${rarityConfig.bgGradient}`}>
        {!imageError && itemData.imageUrl ? (
          <img
            src={itemData.imageUrl}
            alt={itemData.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* 稀有度标签 */}
        {showRarity && itemData.rarity !== 'common' && (
          <div 
            className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold text-white shadow-lg ${
              itemData.rarity === 'legendary' ? 'animate-pulse' : ''
            }`}
            style={{ backgroundColor: rarityConfig.color }}
          >
            {itemData.rarity[0].toUpperCase()}
          </div>
        )}

        {/* 装备标识 */}
        {equipped && (
          <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
            <Check className="w-3 h-3" />
          </div>
        )}

        {/* 锁定标识 */}
        {locked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* 动画标识 */}
        {itemData.animated && !locked && (
          <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-white font-medium">Animated</span>
          </div>
        )}
      </div>
    );
  };

  // Grid 模式（默认）
  if (mode === 'grid') {
    return (
      <div
        className={`relative group ${clickable ? 'cursor-pointer' : ''} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* 光晕效果 */}
        {renderGlow()}
        
        {/* 主卡片 */}
        <div className={`relative bg-black/40 backdrop-blur-sm border-2 rounded-lg overflow-hidden transition-all duration-300 ${
          isHovered 
            ? `scale-105 ${rarityConfig.glow} shadow-2xl border-${rarityConfig.color}` 
            : 'border-white/10 shadow-lg'
        }`}
        style={{
          borderColor: isHovered ? rarityConfig.color : undefined
        }}>
          {/* 图片区域 */}
          {renderImage()}

          {/* 信息区域 */}
          <div className="p-3 space-y-2">
            {/* 名称和类型 */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-white font-bold text-sm line-clamp-2 flex-1">
                {itemData.name}
              </h3>
              <TypeIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            </div>

            {/* 稀有度 */}
            {showRarity && (
              <div className={`text-xs font-medium ${rarityConfig.textColor}`}>
                {rarityConfig.label}
              </div>
            )}

            {/* 价格 */}
            {showPrice && !owned && (
              <div className="flex items-center space-x-1 text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-bold">{itemData.cost.toLocaleString()}</span>
              </div>
            )}

            {/* 操作按钮 */}
            {renderActionButton()}
          </div>

          {/* 悬停预览面板 */}
          {renderHoverPanel()}
        </div>

        {/* 粒子效果 */}
        {renderParticles()}
      </div>
    );
  }

  // List 模式（横向布局）
  if (mode === 'list') {
    return (
      <div
        className={`relative group ${clickable ? 'cursor-pointer' : ''} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {renderGlow()}
        
        <div className={`relative bg-black/40 backdrop-blur-sm border-2 rounded-lg overflow-hidden transition-all duration-300 flex ${
          isHovered 
            ? `${rarityConfig.glow} shadow-xl` 
            : 'border-white/10 shadow-lg'
        }`}
        style={{
          borderColor: isHovered ? rarityConfig.color : undefined
        }}>
          {/* 左侧图片 */}
          <div className="w-32 flex-shrink-0">
            {renderImage()}
          </div>

          {/* 右侧信息 */}
          <div className="flex-1 p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <TypeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <h3 className="text-white font-bold text-base truncate">
                  {itemData.name}
                </h3>
              </div>
              
              {showRarity && (
                <span className={`text-xs font-medium ${rarityConfig.textColor}`}>
                  {rarityConfig.label}
                </span>
              )}

              {showDescription && itemData.description && (
                <p className="text-gray-400 text-xs line-clamp-2">
                  {itemData.description}
                </p>
              )}
            </div>

            {/* 价格和按钮 */}
            <div className="flex items-center gap-4">
              {showPrice && !owned && (
                <div className="flex items-center space-x-1 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-lg font-bold whitespace-nowrap">
                    {itemData.cost.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="w-32">
                {renderActionButton()}
              </div>
            </div>
          </div>
        </div>

        {renderParticles()}
      </div>
    );
  }

  // Compact 模式（最小化）
  if (mode === 'compact') {
    return (
      <div
        className={`relative group ${clickable ? 'cursor-pointer' : ''} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {renderGlow()}
        
        <div className={`relative bg-black/40 backdrop-blur-sm border-2 rounded-lg overflow-hidden transition-all duration-300 ${
          isHovered 
            ? `scale-105 ${rarityConfig.glow} shadow-xl` 
            : 'border-white/10 shadow-md'
        }`}
        style={{
          borderColor: isHovered ? rarityConfig.color : undefined
        }}>
          {renderImage()}
          
          <div className="p-2">
            <h4 className="text-white font-medium text-xs truncate">
              {itemData.name}
            </h4>
            {equipped && (
              <div className="flex items-center space-x-1 text-green-400 mt-1">
                <Check className="w-3 h-3" />
                <span className="text-xs">Equipped</span>
              </div>
            )}
          </div>
        </div>

        {renderParticles()}
      </div>
    );
  }

  return null;
}