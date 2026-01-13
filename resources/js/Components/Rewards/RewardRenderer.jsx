import React from 'react';
import AvatarFrameDisplay from './AvatarFrame/FrameDisplay';
import BackgroundDisplay from './Background/BackgroundDisplay';
import BadgeDisplay from './Badge/BadgeDisplay';
import TitleDisplay from './Title/TitleDisplay';
import { AlertCircle } from 'lucide-react';

/**
 * 通用奖励渲染器
 * 根据 reward_type 自动选择对应的组件进行渲染
 * 
 * @param {Object} props
 * @param {Object} props.reward - 奖励对象
 * @param {string} props.reward.reward_type - 奖励类型
 * @param {Object} props.reward.metadata - 奖励元数据
 * @param {string} props.context - 使用场景: 'profile' | 'inventory' | 'preview' | 'shop'
 * @param {Object} props.user - 用户对象（用于头像框和称号）
 * @param {Object} props.options - 额外配置选项
 */
export default function RewardRenderer({ reward, context = 'profile', user = null, options = {} }) {
  if (!reward) {
    return (
      <div className="text-center p-4 text-gray-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">未装备奖励</p>
      </div>
    );
  }

  const { reward_type, metadata = {} } = reward;

  // 根据 reward_type 渲染对应组件
  switch (reward_type) {
    // ==================== 头像框 ====================
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

    // ==================== 个人页背景 ====================
    case 'profile_background':
      // 背景需要包裹整个页面，这里返回配置
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

    // ==================== 徽章 ====================
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

    // ==================== 称号 ====================
    case 'title':
      return (
        <TitleDisplay
          titleText={metadata.title_text || reward.name}
          textColor={metadata.text_color || '#3B82F6'}
          gradient={metadata.gradient || { enabled: false }}
          effects={metadata.effects || { glow: false, sparkle: false, wave: false }}
          size={options.size || 'md'}
          rarity={reward.rarity}
          icon={metadata.icon || 'none'}
        />
      );

    // ==================== UI 主题 ====================
    case 'theme':
      // 主题需要全局应用，这里显示预览
      return (
        <div className="w-full">
          <div
            className="rounded-xl p-6 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${metadata.colors?.primary || '#3B82F6'}, ${metadata.colors?.secondary || '#8B5CF6'})`,
            }}
          >
            <p className="text-white font-bold text-center">
              {reward.name}
            </p>
            <p className="text-white/80 text-sm text-center mt-2">
              主题预览
            </p>
          </div>
        </div>
      );

    // ==================== 特效 ====================
    case 'effect':
      // 特效需要动态加载，这里显示说明
      return (
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
          <Sparkles className="w-12 h-12 mx-auto mb-2 text-purple-600" />
          <p className="font-semibold text-gray-900">{reward.name}</p>
          <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
          {metadata.effect_type && (
            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {metadata.effect_type} 特效
            </span>
          )}
        </div>
      );

    // ==================== 未知类型 ====================
    default:
      return (
        <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
          <p className="text-sm font-semibold text-orange-900">未知奖励类型</p>
          <p className="text-xs text-orange-700 mt-1">{reward_type}</p>
        </div>
      );
  }
}

/**
 * 装备奖励渲染器 - 渲染用户装备的多个奖励
 */
export function EquippedRewardsRenderer({ equippedRewards, user, context = 'profile' }) {
  if (!equippedRewards || Object.keys(equippedRewards).length === 0) {
    return null;
  }

  return (
    <div className="equipped-rewards">
      {/* 头像框 */}
      {equippedRewards.avatar_frame && (
        <div className="avatar-frame-container">
          <RewardRenderer
            reward={equippedRewards.avatar_frame}
            context={context}
            user={user}
          />
        </div>
      )}

      {/* 称号 */}
      {equippedRewards.title && (
        <div className="title-container">
          <RewardRenderer
            reward={equippedRewards.title}
            context={context}
            user={user}
          />
        </div>
      )}

      {/* 徽章（显示在个人页面） */}
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

/**
 * 奖励网格渲染器 - 用于商店、背包等
 */
export function RewardGridRenderer({ rewards, columns = 4, context = 'shop', onSelect = null }) {
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
            options={{
              owned: reward.owned || false,
            }}
          />
          
          {/* 奖励信息 */}
          <div className="mt-2 text-center">
            <p className="font-semibold text-gray-900 text-sm line-clamp-1">
              {reward.name}
            </p>
            {context === 'shop' && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-lg font-bold text-blue-600">
                  {reward.point_cost}
                </span>
                <span className="text-xs text-gray-600">积分</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 奖励类型图标映射
 */
export const RewardTypeIcons = {
  avatar_frame: '🖼️',
  profile_background: '🎨',
  badge: '🏅',
  title: '👑',
  theme: '🎨',
  effect: '✨',
};

/**
 * 奖励类型标签映射
 */
export const RewardTypeLabels = {
  avatar_frame: '头像框',
  profile_background: '个人页背景',
  badge: '徽章',
  title: '称号',
  theme: 'UI主题',
  effect: '特效',
};

/**
 * 获取奖励类型信息
 */
export function getRewardTypeInfo(rewardType) {
  return {
    icon: RewardTypeIcons[rewardType] || '❓',
    label: RewardTypeLabels[rewardType] || '未知类型',
  };
}