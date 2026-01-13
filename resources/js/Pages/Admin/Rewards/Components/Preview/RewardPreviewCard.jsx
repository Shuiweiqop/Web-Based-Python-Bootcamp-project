import React from 'react';

// ✅ Import all preview components here
import AvatarFramePreview from '@/Components/Rewards/AvatarFrame/FramePreview';
import BackgroundPreview from '@/Components/Rewards/Background/BackgroundPreview';
import TitlePreview from '@/Components/Rewards/Title/TitlePreview';

/**
 * Reward Preview Card
 * Responsibility: Right-side preview area — show different preview components based on type
 */
export default function RewardPreviewCard({
  formData,
  avatarFrameData,
  backgroundData,
  badgeData,
  titleConfig,
  rarityConfig,
}) {
  const currentRarityConfig = rarityConfig[formData.rarity] || rarityConfig.common;

  return (
    <>
      {/* Avatar frame preview */}
      {formData.reward_type === 'avatar_frame' && avatarFrameData && (
        <AvatarFramePreview
          frameUrl={avatarFrameData.url}
          rarity={formData.rarity}
          frameName={formData.name || 'Untitled Frame'}
          metadata={avatarFrameData.info}
        />
      )}

      {/* Background preview - Full component, no extra wrapper */}
      {formData.reward_type === 'profile_background' && backgroundData && (
        <BackgroundPreview
          backgroundData={backgroundData}
          rarity={formData.rarity}
          rewardName={formData.name || 'Untitled Background'}
        />
      )}

      {/* Badge preview */}
      {formData.reward_type === 'badge' && badgeData && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-600 mb-4">Badge Preview</p>
          <div className="inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl">
              <img
                src={badgeData.url}
                alt="Badge Preview"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <p className="mt-4 font-bold text-gray-900">
            {formData.name || 'Badge Name'}
          </p>
          <p className="text-sm text-gray-600">
            {currentRarityConfig.icon} {currentRarityConfig.label}
          </p>
        </div>
      )}

      {/* Title preview - Full TitlePreview component */}
      {formData.reward_type === 'title' && titleConfig?.title_text && (
        <TitlePreview titleConfig={titleConfig} />
      )}

      {/* Theme/effect preview placeholder */}
      {(formData.reward_type === 'theme' || formData.reward_type === 'effect') && (
        <div className="text-center py-8 text-gray-400">
          <p>Preview coming soon...</p>
        </div>
      )}

      {/* Basic info preview card - Only show for non-background types */}
      {formData.reward_type !== 'profile_background' && (
        <div
          className={`mt-6 p-4 rounded-xl border-2 ${currentRarityConfig.color}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{currentRarityConfig.icon}</span>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {formData.point_cost} points
              </div>
            </div>
          </div>
          <h3 className={`text-xl font-bold ${currentRarityConfig.text} mb-1`}>
            {formData.name || 'Reward Name'}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {formData.reward_type}
          </p>
          <p className="text-sm text-gray-700">
            {formData.description || 'Reward description'}
          </p>
        </div>
      )}
    </>
  );
}