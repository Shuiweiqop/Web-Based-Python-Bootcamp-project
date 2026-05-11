import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * 学生端头像框显示组件
 * 
 * @param {Object} props
 * @param {string} props.userName - 用户名字（显示首字母）
 * @param {string} props.avatarUrl - 用户头像 URL（可选）
 * @param {string} props.frameUrl - 头像框图片 URL
 * @param {string} props.size - 尺寸: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {Object} props.frameMetadata - 头像框元数据（特效配置）
 * @param {boolean} props.showGlow - 是否显示发光效果
 * @param {boolean} props.showSparkle - 是否显示闪光动画
 * @param {string} props.rarity - 稀有度（影响特效颜色）
 */
export default function AvatarFrameDisplay({
  userName = 'User',
  avatarUrl = null,
  frameUrl,
  size = 'md',
  frameMetadata = {},
  showGlow = true,
  showSparkle = false,
  rarity = 'common',
  className = '',
}) {
  // 尺寸配置
  const sizeConfig = {
    xs: {
      container: 'w-10 h-10',
      text: 'text-xs',
      sparkle: 'w-2 h-2',
    },
    sm: {
      container: 'w-16 h-16',
      text: 'text-sm',
      sparkle: 'w-3 h-3',
    },
    md: {
      container: 'w-24 h-24',
      text: 'text-xl',
      sparkle: 'w-4 h-4',
    },
    lg: {
      container: 'w-32 h-32',
      text: 'text-3xl',
      sparkle: 'w-5 h-5',
    },
    xl: {
      container: 'w-40 h-40',
      text: 'text-4xl',
      sparkle: 'w-6 h-6',
    },
  };

  // 稀有度对应的发光颜色
  const rarityGlow = {
    common: 'shadow-gray-400/50',
    rare: 'shadow-blue-500/70',
    epic: 'shadow-purple-500/70',
    legendary: 'shadow-yellow-500/90',
  };

  // 稀有度对应的闪光颜色
  const raritySparkleColor = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#EAB308',
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;
  const glowClass = showGlow ? rarityGlow[rarity] || rarityGlow.common : '';

  // 获取用户名首字母
  const getInitial = () => {
    return userName ? userName.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* 发光效果背景 */}
      {showGlow && (
        <div
          className={`absolute inset-0 rounded-full blur-xl animate-pulse ${glowClass}`}
          style={{ transform: 'scale(1.2)' }}
        />
      )}

      {/* 主容器 */}
      <div className={`relative ${currentSize.container}`}>
        {/* 基础头像 */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            // 默认头像（渐变背景 + 首字母）
            <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
              <span className={`font-bold text-white ${currentSize.text}`}>
                {getInitial()}
              </span>
            </div>
          )}
        </div>

        {/* 头像框覆盖层 */}
        {frameUrl && (
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={frameUrl}
              alt="Avatar Frame"
              className="w-full h-full object-cover"
              style={{
                mixBlendMode: frameMetadata?.blendMode || 'normal',
              }}
            />
          </div>
        )}

        {/* 动画特效层 */}
        {frameMetadata?.animation?.enabled && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              animation: `${frameMetadata.animation.type} ${frameMetadata.animation.duration || '2s'} infinite`,
            }}
          >
            {frameMetadata.animation.type === 'rotate' && (
              <div className="w-full h-full border-2 border-transparent border-t-white/30 rounded-full" />
            )}
          </div>
        )}

        {/* 闪光动画 */}
        {showSparkle && (
          <>
            {/* 顶部闪光 */}
            <div
              className={`absolute -top-1 right-1/4 ${currentSize.sparkle} animate-sparkle`}
              style={{ animationDelay: '0s' }}
            >
              <Sparkles
                className="w-full h-full"
                style={{ color: raritySparkleColor[rarity] }}
              />
            </div>

            {/* 右侧闪光 */}
            <div
              className={`absolute top-1/4 -right-1 ${currentSize.sparkle} animate-sparkle`}
              style={{ animationDelay: '0.5s' }}
            >
              <Sparkles
                className="w-full h-full"
                style={{ color: raritySparkleColor[rarity] }}
              />
            </div>

            {/* 左下闪光 */}
            <div
              className={`absolute bottom-1/4 -left-1 ${currentSize.sparkle} animate-sparkle`}
              style={{ animationDelay: '1s' }}
            >
              <Sparkles
                className="w-full h-full"
                style={{ color: raritySparkleColor[rarity] }}
              />
            </div>
          </>
        )}

        {/* 稀有度边框（仅传说级） */}
        {rarity === 'legendary' && (
          <div className="absolute inset-0 rounded-full">
            <div className="w-full h-full rounded-full border-2 border-yellow-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* CSS 动画定义 */}
      <style>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * 简化版本 - 用于快速显示（不需要特效）
 */
export function SimpleAvatarFrame({ userName, avatarUrl, frameUrl, size = 'md' }) {
  return (
    <AvatarFrameDisplay
      userName={userName}
      avatarUrl={avatarUrl}
      frameUrl={frameUrl}
      size={size}
      showGlow={false}
      showSparkle={false}
    />
  );
}

/**
 * 豪华版本 - 用于重要场合（所有特效开启）
 */
export function PremiumAvatarFrame({ userName, avatarUrl, frameUrl, size = 'lg', rarity = 'legendary' }) {
  return (
    <AvatarFrameDisplay
      userName={userName}
      avatarUrl={avatarUrl}
      frameUrl={frameUrl}
      size={size}
      rarity={rarity}
      showGlow={true}
      showSparkle={true}
      frameMetadata={{
        animation: {
          enabled: true,
          type: 'rotate',
          duration: '3s',
        },
      }}
    />
  );
}