import React from 'react';
import RewardsSection from './Dashboard/RewardsSection';

const EMPTY_REWARD_TYPES = {};

export default function ProfileCustomizer({
  inventory,
  equipped,
}) {
  return (
    <RewardsSection
      backgrounds={inventory?.backgrounds || inventory?.profile_backgrounds || []}
      avatarFrames={inventory?.avatarFrames || inventory?.avatar_frames || []}
      titles={inventory?.titles || []}
      badges={inventory?.badges || []}
      equipped={equipped}
      loading={false}
      rewardTypes={EMPTY_REWARD_TYPES}
    />
  );
}
