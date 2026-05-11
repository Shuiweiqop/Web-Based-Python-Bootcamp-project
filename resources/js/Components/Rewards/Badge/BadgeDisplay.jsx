import React, { useState } from 'react';
import { Award, Star, Trophy, Crown, Check } from 'lucide-react';

export default function BadgeDisplay({
  badgeName = 'Badge',
  badgeIcon = null,
  description = '',
  rarity = 'common',
  shape = 'circle',
  size = 'md',
  earnedDate = null,
  showTooltip = true,
  showGlow = true,
  isLocked = false,
  glowColor = null,
  onClick = null,
  className = '',
}) {
  const [showTooltipState, setShowTooltipState] = useState(false);

  const sizeConfig = {
    xs: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-xs',
      tooltip: 'text-xs',
    },
    sm: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8',
      text: 'text-sm',
      tooltip: 'text-xs',
    },
    md: {
      container: 'w-20 h-20',
      icon: 'w-10 h-10',
      text: 'text-base',
      tooltip: 'text-sm',
    },
    lg: {
      container: 'w-24 h-24',
      icon: 'w-12 h-12',
      text: 'text-lg',
      tooltip: 'text-sm',
    },
    xl: {
      container: 'w-32 h-32',
      icon: 'w-16 h-16',
      text: 'text-xl',
      tooltip: 'text-base',
    },
  };

  const rarityConfig = {
    common: {
      bg: 'from-gray-400 to-gray-500',
      glow: 'shadow-gray-400/50',
      border: 'border-gray-400',
      sparkle: '#9CA3AF',
      label: 'Common',
      icon: '⚪',
    },
    rare: {
      bg: 'from-blue-400 to-blue-600',
      glow: 'shadow-blue-500/70',
      border: 'border-blue-400',
      sparkle: '#3B82F6',
      label: 'Rare',
      icon: '💙',
    },
    epic: {
      bg: 'from-purple-400 to-purple-600',
      glow: 'shadow-purple-500/70',
      border: 'border-purple-400',
      sparkle: '#A855F7',
      label: 'Epic',
      icon: '💜',
    },
    legendary: {
      bg: 'from-yellow-400 to-orange-500',
      glow: 'shadow-yellow-500/90',
      border: 'border-yellow-400',
      sparkle: '#EAB308',
      label: 'Legendary',
      icon: '🌟',
    },
  };

  const shapeConfig = {
    circle: 'rounded-full',
    square: 'rounded-xl',
    hexagon: 'hexagon',
    shield: 'shield',
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;
  const currentRarity = rarityConfig[rarity] || rarityConfig.common;
  const currentShape = shapeConfig[shape] || shapeConfig.circle;

  const formatDate = (date) => {
    if (!date) {
      return '';
    }

    const parsed = new Date(date);
    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDefaultIcon = () => {
    switch (rarity) {
      case 'legendary':
        return <Crown className={`${currentSize.icon} text-white`} />;
      case 'epic':
        return <Trophy className={`${currentSize.icon} text-white`} />;
      case 'rare':
        return <Star className={`${currentSize.icon} text-white`} />;
      default:
        return <Award className={`${currentSize.icon} text-white`} />;
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {showGlow && !isLocked && (
        <div
          className={`absolute inset-0 ${currentShape} blur-xl animate-pulse ${currentRarity.glow}`}
          style={{
            transform: 'scale(1.2)',
            backgroundColor: glowColor || undefined,
          }}
        />
      )}

      <div
        className={`relative ${currentSize.container} ${
          onClick ? 'cursor-pointer transform hover:scale-110' : ''
        } transition-all duration-300`}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
        onClick={onClick}
      >
        <div
          className={`w-full h-full ${currentShape} bg-gradient-to-br ${
            isLocked ? 'from-gray-300 to-gray-400' : currentRarity.bg
          } flex items-center justify-center border-4 ${
            isLocked ? 'border-gray-300' : currentRarity.border
          } shadow-xl relative overflow-hidden`}
        >
          {badgeIcon ? (
            <img
              src={badgeIcon}
              alt={badgeName}
              className={`${currentSize.icon} object-contain ${
                isLocked ? 'opacity-50 grayscale' : ''
              }`}
            />
          ) : (
            <div className={isLocked ? 'opacity-50 grayscale' : ''}>{getDefaultIcon()}</div>
          )}

          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}

          {!isLocked && rarity === 'legendary' && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              <div className="absolute top-1 right-1">
                <Star className="w-3 h-3 text-yellow-200 animate-pulse" fill="currentColor" />
              </div>
              <div className="absolute bottom-1 left-1">
                <Star
                  className="w-2 h-2 text-yellow-200 animate-pulse animation-delay-500"
                  fill="currentColor"
                />
              </div>
            </>
          )}

          {!isLocked && rarity === 'epic' && (
            <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-ping" />
          )}
        </div>

        {!isLocked && rarity !== 'common' && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg text-xs">
            {currentRarity.icon}
          </div>
        )}

        {!isLocked && earnedDate && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {showTooltip && showTooltipState && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white rounded-lg shadow-2xl p-3 min-w-max max-w-xs">
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-8 border-transparent border-t-gray-900" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className={`font-bold ${currentSize.tooltip}`}>{badgeName}</p>
                {!isLocked && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${currentRarity.bg} text-white`}
                  >
                    {currentRarity.label}
                  </span>
                )}
              </div>

              {description && <p className="text-xs text-gray-300">{description}</p>}

              {!isLocked && earnedDate && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                  <Check className="w-3 h-3 text-green-400" />
                  <p className="text-xs text-gray-400">Earned on {formatDate(earnedDate)}</p>
                </div>
              )}

              {isLocked && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs text-gray-400">
                    You have not unlocked this badge yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .hexagon {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }

        .shield {
          clip-path: polygon(50% 0%, 100% 15%, 100% 70%, 50% 100%, 0% 70%, 0% 15%);
        }
      `}</style>
    </div>
  );
}

export function BadgeCollection({ badges, columns = 4, size = 'md' }) {
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {badges.map((badge, index) => (
        <div key={index} className="flex flex-col items-center gap-2">
          <BadgeDisplay
            badgeName={badge.name}
            badgeIcon={badge.icon_url}
            description={badge.description}
            rarity={badge.rarity}
            shape={badge.shape || 'circle'}
            size={size}
            earnedDate={badge.earned_date}
            isLocked={!badge.earned_date}
            showTooltip
            showGlow
          />
          <p className="text-xs text-center text-gray-600 font-medium line-clamp-2">
            {badge.name}
          </p>
        </div>
      ))}
    </div>
  );
}

export function BadgeWall({ badges, maxDisplay = 6, size = 'lg' }) {
  const displayedBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-4 items-center">
        {displayedBadges.map((badge, index) => (
          <BadgeDisplay
            key={index}
            badgeName={badge.name}
            badgeIcon={badge.icon_url}
            description={badge.description}
            rarity={badge.rarity}
            shape={badge.shape || 'circle'}
            size={size}
            earnedDate={badge.earned_date}
            showTooltip
            showGlow
          />
        ))}

        {remainingCount > 0 && (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-gray-200 shadow-xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">+{remainingCount}</p>
              <p className="text-xs text-gray-600">More</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SimpleBadge({ badgeName, badgeIcon, rarity = 'common', size = 'xs' }) {
  return (
    <BadgeDisplay
      badgeName={badgeName}
      badgeIcon={badgeIcon}
      rarity={rarity}
      size={size}
      showTooltip={false}
      showGlow={false}
    />
  );
}
