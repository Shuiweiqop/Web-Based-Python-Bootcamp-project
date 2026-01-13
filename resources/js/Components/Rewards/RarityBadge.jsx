import React from 'react';
import { Sparkles, Star, Crown, Gem } from 'lucide-react';

/**
 * 稀有度配置
 */
const RARITY_CONFIG = {
  common: {
    label: '普通',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    glowColor: 'shadow-gray-200',
    icon: null,
  },
  uncommon: {
    label: '少见',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    glowColor: 'shadow-green-200',
    icon: Star,
  },
  rare: {
    label: '稀有',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    glowColor: 'shadow-blue-200',
    icon: Sparkles,
  },
  epic: {
    label: '史诗',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    glowColor: 'shadow-purple-200',
    icon: Crown,
  },
  legendary: {
    label: '传说',
    color: 'amber',
    bgColor: 'bg-gradient-to-r from-amber-100 to-orange-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-400',
    glowColor: 'shadow-amber-300',
    icon: Gem,
  },
};

/**
 * 稀有度徽章组件
 * 
 * @param {Object} props
 * @param {string} props.rarity - 稀有度: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
 * @param {string} props.size - 尺寸: 'xs' | 'sm' | 'md' | 'lg'
 * @param {boolean} props.showIcon - 是否显示图标
 * @param {boolean} props.showLabel - 是否显示文字标签
 * @param {boolean} props.showGlow - 是否显示光晕效果
 * @param {string} props.variant - 变体: 'default' | 'outlined' | 'minimal'
 * @param {string} props.className - 额外的类名
 */
export default function RarityBadge({
  rarity = 'common',
  size = 'sm',
  showIcon = true,
  showLabel = true,
  showGlow = false,
  variant = 'default',
  className = '',
}) {
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  const Icon = config.icon;

  // 尺寸配置
  const sizeClasses = {
    xs: {
      container: 'px-1.5 py-0.5 text-xs gap-1',
      icon: 'w-3 h-3',
    },
    sm: {
      container: 'px-2 py-1 text-xs gap-1',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'px-3 py-1.5 text-sm gap-1.5',
      icon: 'w-4 h-4',
    },
    lg: {
      container: 'px-4 py-2 text-base gap-2',
      icon: 'w-5 h-5',
    },
  };

  const sizeClass = sizeClasses[size] || sizeClasses.sm;

  // 变体样式
  const variantClasses = {
    default: `${config.bgColor} ${config.textColor} border ${config.borderColor}`,
    outlined: `bg-white ${config.textColor} border-2 ${config.borderColor}`,
    minimal: `bg-transparent ${config.textColor}`,
  };

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-full font-medium
    ${sizeClass.container}
    ${variantClasses[variant]}
    ${showGlow ? `shadow-lg ${config.glowColor}` : ''}
    ${rarity === 'legendary' ? 'animate-pulse' : ''}
    ${className}
  `.trim();

  return (
    <span className={baseClasses}>
      {showIcon && Icon && (
        <Icon 
          className={`${sizeClass.icon} ${rarity === 'legendary' ? 'animate-spin-slow' : ''}`}
        />
      )}
      {showLabel && (
        <span className="font-semibold whitespace-nowrap">
          {config.label}
        </span>
      )}
    </span>
  );
}

/**
 * 稀有度边框组件 - 用于包裹卡片
 */
export function RarityBorder({ rarity = 'common', children, className = '' }) {
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;

  const borderStyles = {
    common: 'border-2 border-gray-300',
    uncommon: 'border-2 border-green-400',
    rare: 'border-2 border-blue-400 shadow-lg shadow-blue-200',
    epic: 'border-3 border-purple-500 shadow-xl shadow-purple-300',
    legendary: 'border-3 border-amber-500 shadow-2xl shadow-amber-400 animate-pulse',
  };

  return (
    <div className={`rounded-xl ${borderStyles[rarity]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * 稀有度背景组件 - 用于卡片背景
 */
export function RarityBackground({ rarity = 'common', children, className = '' }) {
  const bgStyles = {
    common: 'bg-gray-50',
    uncommon: 'bg-gradient-to-br from-green-50 to-emerald-50',
    rare: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    epic: 'bg-gradient-to-br from-purple-50 to-fuchsia-50',
    legendary: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
  };

  return (
    <div className={`${bgStyles[rarity]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * 获取稀有度配置
 */
export function getRarityConfig(rarity) {
  return RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
}

/**
 * 稀有度图标组件（仅图标）
 */
export function RarityIcon({ rarity = 'common', size = 'md', className = '' }) {
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  if (!Icon) return null;

  return (
    <Icon 
      className={`${sizeClasses[size]} ${config.textColor} ${className}`}
    />
  );
}

/**
 * 稀有度标签（仅文字）
 */
export function RarityLabel({ rarity = 'common', className = '' }) {
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  
  return (
    <span className={`font-medium ${config.textColor} ${className}`}>
      {config.label}
    </span>
  );
}