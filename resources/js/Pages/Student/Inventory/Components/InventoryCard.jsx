import React from 'react';
import { router } from '@inertiajs/react';
import { Check, X, Package } from 'lucide-react';

/**
 * InventoryCard Component
 * Display a single inventory item
 */
export default function InventoryCard({
  item,
  viewMode,
  rewardTypes,
}) {
  // Rarity configuration
  const rarityConfig = {
    common: {
      color: 'from-gray-400 to-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      icon: '⚪',
      label: 'Common',
    },
    rare: {
      color: 'from-blue-400 to-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: '💙',
      label: 'Rare',
    },
    epic: {
      color: 'from-purple-400 to-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      icon: '💜',
      label: 'Epic',
    },
    legendary: {
      color: 'from-yellow-400 to-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '🌟',
      label: 'Legendary',
    },
  };

  // Reward type icons
  const typeIcons = {
    avatar_frame: '🖼️',
    profile_background: '🎨',
    badge: '🏅',
    title: '✨',
    theme: '🎭',
    effect: '⚡',
  };

  const reward = item.reward;
  const rarity = rarityConfig[reward.rarity] || rarityConfig.common;

  // Equip / Unequip
  const handleQuickToggle = () => {
    router.post(
      route('student.inventory.toggle', item.inventory_id),
      {},
      { preserveScroll: true }
    );
  };

  /* =========================
     Grid View
  ========================= */
  if (viewMode === 'grid') {
    return (
      <div
        className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${rarity.border} group relative`}
      >
        {/* Equipped badge */}
        {item.is_equipped && (
          <div className="absolute top-0 left-0 px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-br-xl z-10 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Equipped
          </div>
        )}

        {/* Rarity banner */}
        <div className={`absolute top-0 right-0 px-4 py-1 bg-gradient-to-r ${rarity.color} text-white text-xs font-bold rounded-bl-xl z-10`}>
          {rarity.icon} {rarity.label}
        </div>

        {/* Image */}
        <div className={`${rarity.bg} h-48 flex items-center justify-center relative overflow-hidden`}>
          {reward.image_url ? (
            <img
              src={reward.image_url}
              alt={reward.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="text-6xl">{typeIcons[reward.reward_type]}</div>
          )}

          {/* Quantity */}
          {item.quantity > 1 && (
            <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Package className="w-3 h-3" />
              x{item.quantity}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
              {reward.name}
            </h3>
            <span className="text-xs text-gray-500 ml-2">
              {rewardTypes[reward.reward_type]}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
            {reward.description}
          </p>

          <div className="text-xs text-gray-500 mb-4">
            Obtained on: {new Date(item.obtained_at).toLocaleDateString()}
          </div>

          {/* Equip button */}
          {item.is_equipped ? (
            <button
              onClick={handleQuickToggle}
              className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-600 transition-all text-sm flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" />
              Unequip
            </button>
          ) : (
            <button
              onClick={handleQuickToggle}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-sm flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" />
              Equip
            </button>
          )}
        </div>
      </div>
    );
  }

  /* =========================
     List View
  ========================= */
  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 ${rarity.border} p-4 flex items-center gap-4`}
    >
      {/* Image */}
      <div className={`w-20 h-20 ${rarity.bg} rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden`}>
        {reward.image_url ? (
          <img
            src={reward.image_url}
            alt={reward.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-3xl">{typeIcons[reward.reward_type]}</div>
        )}
        {item.quantity > 1 && (
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-tl">
            x{item.quantity}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-lg truncate">
            {reward.name}
          </h3>
          <span className={`px-2 py-0.5 bg-gradient-to-r ${rarity.color} text-white text-xs font-bold rounded`}>
            {rarity.label}
          </span>
          {item.is_equipped && (
            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded flex items-center gap-1">
              <Check className="w-3 h-3" />
              Equipped
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 line-clamp-1 mb-2">
          {reward.description}
        </p>

        <div className="text-xs text-gray-500 flex gap-4">
          <span>{rewardTypes[reward.reward_type]}</span>
          <span>Obtained on: {new Date(item.obtained_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action */}
      {item.is_equipped ? (
        <button
          onClick={handleQuickToggle}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-pink-600 transition-all text-sm flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Unequip
        </button>
      ) : (
        <button
          onClick={handleQuickToggle}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-sm flex items-center gap-1"
        >
          <Check className="w-4 h-4" />
          Equip
        </button>
      )}
    </div>
  );
}
