import React from 'react';
import CharacterCard from './Dashboard/CharacterCard';

export default function ProfileHeader({
  user,
  profile,
  equipped,
  showEditButton = false,
}) {
  return (
    <div className="max-w-sm">
      <CharacterCard
        user={user}
        profile={profile}
        equipped={equipped}
        inventoryItems={[]}
        onEquipmentChange={() => {}}
      />
    </div>
  );
}
