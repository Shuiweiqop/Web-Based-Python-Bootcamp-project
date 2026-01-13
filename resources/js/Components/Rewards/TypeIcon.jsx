import React from 'react';
import { 
  Frame, 
  Image, 
  Award, 
  Crown, 
  Palette, 
  Sparkles,
  Trophy,
  Star,
  Gift,
  Zap
} from 'lucide-react';

/**
 * 奖励类型配置
 */
const REWARD_TYPE_CONFIG = {
  avatar_frame: {
    label: '头像框',
    icon: Frame,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    emoji: '🖼️',
    description: '装饰你的头像边框',
  },
  profile_background: {
    label: '个人页背景',
    icon: Image,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    emoji: '🎨',
    description: '自定义个人页面背景',
  },
  badge: {
    label: '徽章',
    icon: Award,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    emoji: '🏅',
    description: '展示你的成就徽章',
  },
  title: {
    label: '称号',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    emoji: '👑',
    description: '炫酷的个人称号',
  },
  theme: {
    label: 'UI主题',
    icon: Palette,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    emoji: '🎨',
    description: '改变界面主题颜色',
  },
  effect: {
    label: '特效',
    icon: Sparkles,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    emoji: '✨',
    description: '动态视觉特效',
  },
  trophy: {
    label: '奖杯',
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    emoji: '🏆',
    description: '稀有荣誉奖杯',
  },
  power_up: {
    label: '增益道具',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    emoji: '⚡',
    description: '学习增益道具',
  },
};

/**
 * 奖励类型图标组件
 * 
 * @param {Object} props
 * @param {string} props.type - 奖励类型
 * @param {string} props.size - 尺寸: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.variant - 变体: 'icon' | 'emoji' | 'badge' | 'full'
 * @param {boolean} props.showLabel - 是否显示标签
 * @param {boolean} props.showBackground - 是否显示背景
 * @param {string} props.className - 额外类名
 */
export default function TypeIcon({
  type = 'avatar_frame',
  size = 'md',
  variant = 'icon',
  showLabel = false,
  showBackground = false,
  className = '',
}) {
  const config = REWARD_TYPE_CONFIG[type] || REWARD_TYPE_CONFIG.avatar_frame;
  const Icon = config.icon;

  // 尺寸配置
  const sizeClasses = {
    xs: {
      icon: 'w-3 h-3',
      emoji: 'text-xs',
      container: 'w-6 h-6',
      text: 'text-xs',
      padding: 'p-1',
    },
    sm: {
      icon: 'w-4 h-4',
      emoji: 'text-sm',
      container: 'w-8 h-8',
      text: 'text-xs',
      padding: 'p-1.5',
    },
    md: {
      icon: 'w-5 h-5',
      emoji: 'text-base',
      container: 'w-10 h-10',
      text: 'text-sm',
      padding: 'p-2',
    },
    lg: {
      icon: 'w-6 h-6',
      emoji: 'text-lg',
      container: 'w-12 h-12',
      text: 'text-base',
      padding: 'p-2.5',
    },
    xl: {
      icon: 'w-8 h-8',
      emoji: 'text-2xl',
      container: 'w-16 h-16',
      text: 'text-lg',
      padding: 'p-3',
    },
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // 渲染不同变体
  const renderContent = () => {
    switch (variant) {
      case 'emoji':
        return (
          <span className={`${sizeClass.emoji} ${className}`}>
            {config.emoji}
          </span>
        );

      case 'badge':
        return (
          <div
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 rounded-full
              ${config.bgColor} ${config.color}
              ${className}
            `}
          >
            <Icon className={sizeClass.icon} />
            <span className={`font-medium ${sizeClass.text}`}>
              {config.label}
            </span>
          </div>
        );

      case 'full':
        return (
          <div className={`flex items-center gap-2 ${className}`}>
            <div
              className={`
                flex items-center justify-center rounded-lg
                ${sizeClass.container} ${sizeClass.padding}
                ${showBackground ? `${config.bgColor}` : ''}
              `}
            >
              <Icon className={`${sizeClass.icon} ${config.color}`} />
            </div>
            {showLabel && (
              <div>
                <p className={`font-semibold ${config.color} ${sizeClass.text}`}>
                  {config.label}
                </p>
              </div>
            )}
          </div>
        );

      case 'icon':
      default:
        return showBackground ? (
          <div
            className={`
              flex items-center justify-center rounded-lg
              ${sizeClass.container} ${sizeClass.padding}
              ${config.bgColor}
              ${className}
            `}
          >
            <Icon className={`${sizeClass.icon} ${config.color}`} />
          </div>
        ) : (
          <Icon className={`${sizeClass.icon} ${config.color} ${className}`} />
        );
    }
  };

  return <>{renderContent()}</>;
}

/**
 * 奖励类型标签组件（带图标和文字）
 */
export function TypeLabel({ 
  type = 'avatar_frame', 
  size = 'sm',
  showIcon = true,
  className = '' 
}) {
  const config = REWARD_TYPE_CONFIG[type] || REWARD_TYPE_CONFIG.avatar_frame;
  const Icon = config.icon;

  const sizeClasses = {
    xs: { icon: 'w-3 h-3', text: 'text-xs' },
    sm: { icon: 'w-4 h-4', text: 'text-sm' },
    md: { icon: 'w-5 h-5', text: 'text-base' },
    lg: { icon: 'w-6 h-6', text: 'text-lg' },
  };

  const sizeClass = sizeClasses[size] || sizeClasses.sm;

  return (
    <span className={`inline-flex items-center gap-1.5 ${config.color} ${className}`}>
      {showIcon && <Icon className={sizeClass.icon} />}
      <span className={`font-medium ${sizeClass.text}`}>
        {config.label}
      </span>
    </span>
  );
}

/**
 * 奖励类型卡片组件
 */
export function TypeCard({ 
  type = 'avatar_frame',
  onClick = null,
  selected = false,
  className = '' 
}) {
  const config = REWARD_TYPE_CONFIG[type] || REWARD_TYPE_CONFIG.avatar_frame;
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-3 p-4 rounded-xl
        border-2 transition-all duration-200
        ${selected 
          ? `${config.bgColor} border-current ${config.color} shadow-lg` 
          : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
        }
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
    >
      <div className={`
        flex items-center justify-center w-12 h-12 rounded-lg
        ${selected ? 'bg-white/50' : config.bgColor}
      `}>
        <Icon className={`w-6 h-6 ${config.color}`} />
      </div>
      <div className="text-center">
        <p className="font-semibold text-sm">
          {config.label}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {config.description}
        </p>
      </div>
    </button>
  );
}

/**
 * 奖励类型筛选器组件
 */
export function TypeFilter({ 
  types = Object.keys(REWARD_TYPE_CONFIG),
  selectedType = null,
  onTypeChange = () => {},
  className = '' 
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        onClick={() => onTypeChange(null)}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all
          ${selectedType === null
            ? 'bg-gray-800 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        全部
      </button>
      {types.map((type) => {
        const config = REWARD_TYPE_CONFIG[type];
        const Icon = config.icon;
        return (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full
              text-sm font-medium transition-all
              ${selectedType === type
                ? `${config.bgColor} ${config.color} shadow-lg border-2 border-current`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 获取奖励类型配置
 */
export function getRewardTypeConfig(type) {
  return REWARD_TYPE_CONFIG[type] || REWARD_TYPE_CONFIG.avatar_frame;
}

/**
 * 获取所有奖励类型
 */
export function getAllRewardTypes() {
  return Object.keys(REWARD_TYPE_CONFIG);
}