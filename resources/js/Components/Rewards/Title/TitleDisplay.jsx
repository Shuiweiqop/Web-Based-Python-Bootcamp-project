import React from 'react';
import { Crown, Star, Sparkles, Zap } from 'lucide-react';

/**
 * 称号显示组件
 * 
 * @param {Object} props
 * @param {string} props.titleText - 称号文字
 * @param {string} props.textColor - 文字颜色
 * @param {Object} props.gradient - 渐变配置
 * @param {string} props.gradient.from - 渐变起始色
 * @param {string} props.gradient.to - 渐变结束色
 * @param {boolean} props.gradient.enabled - 是否启用渐变
 * @param {Object} props.effects - 特效配置
 * @param {boolean} props.effects.glow - 发光效果
 * @param {boolean} props.effects.sparkle - 闪光效果
 * @param {boolean} props.effects.wave - 波浪动画
 * @param {string} props.size - 尺寸: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.rarity - 稀有度
 * @param {string} props.position - 位置: 'before' | 'after' | 'above' | 'below'
 * @param {string} props.icon - 图标类型: 'crown' | 'star' | 'sparkle' | 'zap' | 'none'
 */
export default function TitleDisplay({
  titleText = '称号',
  textColor = '#3B82F6',
  gradient = {
    enabled: false,
    from: '#3B82F6',
    to: '#8B5CF6',
  },
  effects = {
    glow: false,
    sparkle: false,
    wave: false,
  },
  size = 'md',
  rarity = 'common',
  position = 'after', // before username, after username, above, below
  icon = 'none',
  className = '',
}) {
  // 尺寸配置
  const sizeConfig = {
    xs: {
      text: 'text-xs',
      icon: 'w-3 h-3',
      padding: 'px-2 py-0.5',
      gap: 'gap-1',
    },
    sm: {
      text: 'text-sm',
      icon: 'w-3.5 h-3.5',
      padding: 'px-2.5 py-1',
      gap: 'gap-1.5',
    },
    md: {
      text: 'text-base',
      icon: 'w-4 h-4',
      padding: 'px-3 py-1.5',
      gap: 'gap-2',
    },
    lg: {
      text: 'text-lg',
      icon: 'w-5 h-5',
      padding: 'px-4 py-2',
      gap: 'gap-2',
    },
    xl: {
      text: 'text-xl',
      icon: 'w-6 h-6',
      padding: 'px-5 py-2.5',
      gap: 'gap-2.5',
    },
  };

  // 稀有度配置
  const rarityConfig = {
    common: {
      borderColor: 'border-gray-300',
      bgColor: 'bg-gray-100',
      shadowColor: 'shadow-gray-400/30',
    },
    rare: {
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-50',
      shadowColor: 'shadow-blue-500/50',
    },
    epic: {
      borderColor: 'border-purple-400',
      bgColor: 'bg-purple-50',
      shadowColor: 'shadow-purple-500/50',
    },
    legendary: {
      borderColor: 'border-yellow-400',
      bgColor: 'bg-yellow-50',
      shadowColor: 'shadow-yellow-500/70',
    },
  };

  // 图标组件
  const iconComponents = {
    crown: Crown,
    star: Star,
    sparkle: Sparkles,
    zap: Zap,
    none: null,
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;
  const currentRarity = rarityConfig[rarity] || rarityConfig.common;
  const IconComponent = iconComponents[icon];

  // 构建文字样式
  const getTextStyle = () => {
    if (gradient.enabled) {
      return {
        background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      };
    }
    return {
      color: textColor,
    };
  };

  return (
    <div className={`inline-block ${className}`}>
      <div
        className={`relative inline-flex items-center ${currentSize.gap} ${currentSize.padding} rounded-full border-2 ${currentRarity.borderColor} ${currentRarity.bgColor} font-bold transition-all ${
          effects.glow ? `shadow-lg ${currentRarity.shadowColor}` : ''
        } ${effects.wave ? 'animate-wave' : ''}`}
      >
        {/* 发光背景 */}
        {effects.glow && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        )}

        {/* 图标（左侧） */}
        {IconComponent && position !== 'above' && position !== 'below' && (
          <IconComponent
            className={`${currentSize.icon} relative z-10`}
            style={getTextStyle()}
          />
        )}

        {/* 称号文字 */}
        <span
          className={`${currentSize.text} relative z-10 whitespace-nowrap`}
          style={getTextStyle()}
        >
          {titleText}
        </span>

        {/* 闪光效果 */}
        {effects.sparkle && (
          <>
            <Sparkles
              className={`absolute -top-1 -right-1 ${currentSize.icon} text-yellow-400 animate-sparkle`}
            />
            <Sparkles
              className={`absolute -bottom-1 -left-1 ${currentSize.icon} text-yellow-400 animate-sparkle animation-delay-500`}
            />
          </>
        )}

        {/* 传说级特效 */}
        {rarity === 'legendary' && (
          <>
            {/* 金色边框动画 */}
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping opacity-50" />
            
            {/* 星星装饰 */}
            <Star
              className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 text-yellow-400 animate-pulse"
              fill="currentColor"
            />
          </>
        )}
      </div>

      {/* CSS 动画 */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2px);
          }
        }

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

        .animate-wave {
          animation: wave 2s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}

/**
 * 称号 + 用户名组合显示
 */
export function TitleWithUsername({
  userName,
  title,
  titlePosition = 'after', // before, after, above, below
  size = 'md',
}) {
  const sizeConfig = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const textSize = sizeConfig[size] || sizeConfig.md;

  if (!title) {
    return <span className={`font-semibold ${textSize}`}>{userName}</span>;
  }

  // 上下排列
  if (titlePosition === 'above' || titlePosition === 'below') {
    return (
      <div className="flex flex-col items-center gap-1">
        {titlePosition === 'above' && (
          <TitleDisplay
            titleText={title.title_text}
            textColor={title.text_color}
            gradient={title.gradient}
            effects={title.effects}
            size={size === 'xl' || size === 'lg' ? 'sm' : 'xs'}
            rarity={title.rarity}
            icon={title.icon}
          />
        )}
        <span className={`font-semibold ${textSize}`}>{userName}</span>
        {titlePosition === 'below' && (
          <TitleDisplay
            titleText={title.title_text}
            textColor={title.text_color}
            gradient={title.gradient}
            effects={title.effects}
            size={size === 'xl' || size === 'lg' ? 'sm' : 'xs'}
            rarity={title.rarity}
            icon={title.icon}
          />
        )}
      </div>
    );
  }

  // 左右排列
  return (
    <div className="inline-flex items-center gap-2">
      {titlePosition === 'before' && (
        <TitleDisplay
          titleText={title.title_text}
          textColor={title.text_color}
          gradient={title.gradient}
          effects={title.effects}
          size={size}
          rarity={title.rarity}
          icon={title.icon}
        />
      )}
      <span className={`font-semibold ${textSize}`}>{userName}</span>
      {titlePosition === 'after' && (
        <TitleDisplay
          titleText={title.title_text}
          textColor={title.text_color}
          gradient={title.gradient}
          effects={title.effects}
          size={size}
          rarity={title.rarity}
          icon={title.icon}
        />
      )}
    </div>
  );
}

/**
 * 简化版称号 - 纯文字
 */
export function SimpleTitle({ titleText, textColor = '#3B82F6', size = 'sm' }) {
  return (
    <TitleDisplay
      titleText={titleText}
      textColor={textColor}
      size={size}
      effects={{ glow: false, sparkle: false, wave: false }}
      icon="none"
    />
  );
}

/**
 * 豪华版称号 - 所有特效
 */
export function PremiumTitle({
  titleText,
  gradient = { enabled: true, from: '#FFD700', to: '#FFA500' },
  size = 'lg',
}) {
  return (
    <TitleDisplay
      titleText={titleText}
      gradient={gradient}
      effects={{ glow: true, sparkle: true, wave: true }}
      size={size}
      rarity="legendary"
      icon="crown"
    />
  );
}