import React from 'react';

// ✅ Import all upload components here
import AvatarFrameUpload from '@/Components/Rewards/AvatarFrame/FrameUpload';
import BackgroundUpload from '@/Components/Rewards/Background/BackgroundUpload/index';
import BadgeUpload from '@/Components/Rewards/Badge/BadgeUpload';
import TitleConfigPanel from './TitleConfigPanel';
import BackgroundPreview from '@/Components/Rewards/Background/BackgroundPreview';
import TitlePreview from '@/Components/Rewards/Title/TitlePreview';
/**
 * Type Configuration Router
 * Responsibility: Render the corresponding upload/configuration component based on reward_type
 * 
 * ⚠️ Important: All upload components must return a standardized data format:
 * { file: File, url: string, info: object, config: object }
 */
export default function TypeConfig({
  rewardType,
  rewardTypeName,
  avatarFrameData,
  backgroundData,
  badgeData,
  titleConfig,
  onAvatarFrameChange,
  onBackgroundChange,
  onBadgeChange,
  onTitleConfigChange,
  errors,
  existingImageUrl = null,
  isEditing = false,
  // ⬅️ 新增：从父组件传入
  rarity = 'common',
  rewardName = '',
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {rewardTypeName} Configuration
      </h2>

      {/* Avatar Frame Upload */}
      {rewardType === 'avatar_frame' && (
        <AvatarFrameUpload
          value={avatarFrameData}
          onChange={onAvatarFrameChange}
          error={errors.reward_image}
          existingImageUrl={existingImageUrl}
          isEditing={isEditing}
        />
      )}

      {/* Background Upload & Preview */}
      {rewardType === 'profile_background' && (
  <div className="space-y-6">
    {/* Upload Section */}
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Background Image & Effects
      </h3>
      <BackgroundUpload
        value={backgroundData}
        onChange={onBackgroundChange}
        error={errors.reward_image}
        existingImageUrl={existingImageUrl}  // ✅ 现在支持
        isEditing={isEditing}                // ✅ 现在支持
      />
    </div>

    {/* Preview Section */}
    {backgroundData && (
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Live Preview
        </h3>
        <BackgroundPreview
          backgroundData={backgroundData}
          rarity={rarity}
          rewardName={rewardName || 'Untitled Background'}
        />
      </div>
    )}
  </div>
)}

      {/* Badge Upload */}
      {rewardType === 'badge' && (
        <BadgeUpload
          value={badgeData}
          onChange={onBadgeChange}
          error={errors.reward_image}
          existingImageUrl={existingImageUrl}
          isEditing={isEditing}
        />
      )}

      {/* Title Configuration */}

      {rewardType === 'title' && (
  <div className="space-y-6">
    {/* Configuration Section */}
    <div>
      <TitleConfigPanel
        titleConfig={titleConfig}
        onChange={onTitleConfigChange}
      />
    </div>

    {/* Preview Section */}
    {titleConfig?.title_text && (
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Live Preview
        </h3>
        <TitlePreview titleConfig={titleConfig} />
      </div>
    )}
  </div>
)}

      {/* Theme & Effect (Coming Soon) */}
      {(rewardType === 'theme' || rewardType === 'effect') && (
        <div className="text-center py-8 text-gray-500">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <span className="text-3xl">🚧</span>
          </div>
          <p className="text-lg font-medium">This feature is under development...</p>
          <p className="text-sm mt-2">
            {rewardTypeName} configuration coming soon
          </p>
        </div>
      )}
    </div>
  );
}