import React from 'react';
import {
  Frame,
  Image,
  Award,
  Crown,
  Palette,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

const REWARD_TYPE_CONFIG = {
  avatar_frame: {
    label: 'Avatar Frame',
    icon: Frame,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    emoji: '🖼️',
    description: 'Decorate the border around your avatar.',
  },
  profile_background: {
    label: 'Profile Background',
    icon: Image,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    emoji: '🎨',
    description: 'Customize your profile page background.',
  },
  badge: {
    label: 'Badge',
    icon: Award,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    emoji: '🏅',
    description: 'Show off your achievement badges.',
  },
  title: {
    label: 'Title',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    emoji: '👑',
    description: 'A standout title for your profile.',
  },
  theme: {
    label: 'UI Theme',
    icon: Palette,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    emoji: '🎨',
    description: 'Change your interface theme colors.',
  },
  effect: {
    label: 'Effect',
    icon: Sparkles,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    emoji: '✨',
    description: 'Add dynamic visual effects.',
  },
  trophy: {
    label: 'Trophy',
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    emoji: '🏆',
    description: 'A rare trophy that shows off your honor.',
  },
  power_up: {
    label: 'Power-Up',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    emoji: '⚡',
    description: 'Useful boosts for your learning journey.',
  },
};

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

  const renderContent = () => {
    switch (variant) {
      case 'emoji':
        return <span className={`${sizeClass.emoji} ${className}`}>{config.emoji}</span>;

      case 'badge':
        return (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.color} ${className}`}
          >
            <Icon className={sizeClass.icon} />
            <span className={`font-medium ${sizeClass.text}`}>{config.label}</span>
          </div>
        );

      case 'full':
        return (
          <div className={`flex items-center gap-2 ${className}`}>
            <div
              className={`flex items-center justify-center rounded-lg ${sizeClass.container} ${sizeClass.padding} ${
                showBackground ? config.bgColor : ''
              }`}
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
            className={`flex items-center justify-center rounded-lg ${sizeClass.container} ${sizeClass.padding} ${config.bgColor} ${className}`}
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

export function TypeLabel({
  type = 'avatar_frame',
  size = 'sm',
  showIcon = true,
  className = '',
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
      <span className={`font-medium ${sizeClass.text}`}>{config.label}</span>
    </span>
  );
}

export function TypeCard({
  type = 'avatar_frame',
  onClick = null,
  selected = false,
  className = '',
}) {
  const config = REWARD_TYPE_CONFIG[type] || REWARD_TYPE_CONFIG.avatar_frame;
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200
        ${
          selected
            ? `${config.bgColor} border-current ${config.color} shadow-lg`
            : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
        }
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
    >
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-lg ${
          selected ? 'bg-white/50' : config.bgColor
        }`}
      >
        <Icon className={`w-6 h-6 ${config.color}`} />
      </div>
      <div className="text-center">
        <p className="font-semibold text-sm">{config.label}</p>
        <p className="text-xs text-gray-600 mt-1">{config.description}</p>
      </div>
    </button>
  );
}

export function TypeFilter({
  types = Object.keys(REWARD_TYPE_CONFIG),
  selectedType = null,
  onTypeChange = () => {},
  className = '',
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        onClick={() => onTypeChange(null)}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all
          ${
            selectedType === null
              ? 'bg-gray-800 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        All
      </button>
      {types.map((type) => {
        const config = REWARD_TYPE_CONFIG[type];
        const Icon = config.icon;

        return (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                selectedType === type
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

export function getRewardTypeConfig(type) {
  return REWARD_TYPE_CONFIG[type] || REWARD_TYPE_CONFIG.avatar_frame;
}

export function getAllRewardTypes() {
  return Object.keys(REWARD_TYPE_CONFIG);
}
