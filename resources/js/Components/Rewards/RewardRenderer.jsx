import React from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import AvatarFrameDisplay from './AvatarFrame/FrameDisplay';
import BackgroundDisplay from './Background/BackgroundDisplay';
import BadgeDisplay from './Badge/BadgeDisplay';
import TitleDisplay from './Title/TitleDisplay';

export default function RewardRenderer({
  reward,
  context = 'profile',
  user = null,
  options = {},
}) {
  if (!reward) {
    return (
      <div className="text-center p-4 text-gray-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">No reward equipped</p>
      </div>
    );
  }

  const { reward_type, metadata = {} } = reward;

  switch (reward_type) {
    case 'avatar_frame':
      return (
        <AvatarFrameDisplay
          userName={user?.name || 'User'}
          avatarUrl={user?.avatar_url || null}
          frameUrl={reward.image_url || metadata.frame_url}
          size={options.size || (context === 'inventory' ? 'md' : 'lg')}
          rarity={reward.rarity}
          showGlow={context !== 'inventory'}
          showSparkle={reward.rarity === 'legendary' && context === 'profile'}
          frameMetadata={metadata}
        />
      );

    case 'profile_background':
      return (
        <BackgroundDisplay
          backgroundUrl={reward.image_url || metadata.background_url}
          backgroundType={metadata.background_type || 'image'}
          effects={metadata.effects || {}}
          gradient={metadata.gradient || {}}
          rarity={reward.rarity}
        >
          {options.children || null}
        </BackgroundDisplay>
      );

    case 'badge':
      return (
        <BadgeDisplay
          badgeName={reward.name}
          badgeIcon={reward.image_url || metadata.icon_url}
          description={reward.description}
          rarity={reward.rarity}
          shape={metadata.shape || 'circle'}
          size={options.size || (context === 'inventory' ? 'md' : 'lg')}
          earnedDate={options.earnedDate || null}
          showTooltip={context !== 'shop'}
          showGlow={context === 'profile'}
          isLocked={context === 'shop' && !options.owned}
        />
      );

    case 'title':
      return (
        <TitleDisplay
          titleText={metadata.title_text || reward.name}
          textColor={metadata.text_color || '#3B82F6'}
          gradient={metadata.gradient || { enabled: false }}
          effects={
            metadata.effects || {
              glow: false,
              sparkle: false,
              wave: false,
            }
          }
          size={options.size || 'md'}
          rarity={reward.rarity}
          icon={metadata.icon || 'none'}
        />
      );

    case 'theme':
      return (
        <div className="w-full">
          <div
            className="rounded-xl p-6 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${metadata.colors?.primary || '#3B82F6'}, ${metadata.colors?.secondary || '#8B5CF6'})`,
            }}
          >
            <p className="text-white font-bold text-center">{reward.name}</p>
            <p className="text-white/80 text-sm text-center mt-2">Theme preview</p>
          </div>
        </div>
      );

    case 'effect':
      return (
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
          <Sparkles className="w-12 h-12 mx-auto mb-2 text-purple-600" />
          <p className="font-semibold text-gray-900">{reward.name}</p>
          <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
          {metadata.effect_type && (
            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {metadata.effect_type} effect
            </span>
          )}
        </div>
      );

    default:
      return (
        <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
          <p className="text-sm font-semibold text-orange-900">Unknown reward type</p>
          <p className="text-xs text-orange-700 mt-1">{reward_type}</p>
        </div>
      );
  }
}

export function EquippedRewardsRenderer({ equippedRewards, user, context = 'profile' }) {
  if (!equippedRewards || Object.keys(equippedRewards).length === 0) {
    return null;
  }

  return (
    <div className="equipped-rewards">
      {equippedRewards.avatar_frame && (
        <div className="avatar-frame-container">
          <RewardRenderer reward={equippedRewards.avatar_frame} context={context} user={user} />
        </div>
      )}

      {equippedRewards.title && (
        <div className="title-container">
          <RewardRenderer reward={equippedRewards.title} context={context} user={user} />
        </div>
      )}

      {equippedRewards.badges && equippedRewards.badges.length > 0 && (
        <div className="badges-container flex flex-wrap gap-3">
          {equippedRewards.badges.map((badge) => (
            <RewardRenderer
              key={badge.reward_id}
              reward={badge}
              context={context}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RewardGridRenderer({
  rewards,
  columns = 4,
  context = 'shop',
  onSelect = null,
}) {
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {rewards.map((reward) => (
        <div
          key={reward.reward_id}
          className={`reward-item ${onSelect ? 'cursor-pointer hover:scale-105' : ''} transition-transform`}
          onClick={() => onSelect && onSelect(reward)}
        >
          <RewardRenderer
            reward={reward}
            context={context}
            options={{ owned: reward.owned || false }}
          />

          <div className="mt-2 text-center">
            <p className="font-semibold text-gray-900 text-sm line-clamp-1">{reward.name}</p>
            {context === 'shop' && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-lg font-bold text-blue-600">
                  {reward.point_cost}
                </span>
                <span className="text-xs text-gray-600">points</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export const RewardTypeIcons = {
  avatar_frame: '🖼️',
  profile_background: '🎨',
  badge: '🏅',
  title: '👑',
  theme: '🎨',
  effect: '✨',
};

export const RewardTypeLabels = {
  avatar_frame: 'Avatar Frame',
  profile_background: 'Profile Background',
  badge: 'Badge',
  title: 'Title',
  theme: 'UI Theme',
  effect: 'Effect',
};

export function getRewardTypeInfo(rewardType) {
  return {
    icon: RewardTypeIcons[rewardType] || '❓',
    label: RewardTypeLabels[rewardType] || 'Unknown Type',
  };
}
