import React from 'react';
import { Link } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';

/**
 * ✅ RewardCard Component (Enhanced with Purchase Status)
 * Reward card – displays a single reward in the shop page with purchase indicators
 */
export default function RewardCard({ reward, studentPoints, rewardTypes, onOpenPurchaseModal }) {
  // Rarity configuration
  const rarityConfig = {
    common: { 
      color: 'from-gray-400 to-gray-600', 
      bg: 'bg-gray-50',
      border: 'border-gray-300',
      text: 'text-gray-800', 
      icon: '⚪', 
      label: 'Common',
    },
    rare: { 
      color: 'from-blue-400 to-blue-600', 
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-800', 
      icon: '💙', 
      label: 'Rare',
    },
    epic: { 
      color: 'from-purple-400 to-purple-600', 
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      text: 'text-purple-800', 
      icon: '💜', 
      label: 'Epic',
    },
    legendary: { 
      color: 'from-yellow-400 to-yellow-600', 
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-800', 
      icon: '🌟', 
      label: 'Legendary',
    },
  };

  // Type icons
  const typeIcons = {
    avatar_frame: '🖼️',
    profile_background: '🎨',
    background: '🎨',
    badge: '🏅',
    title: '✨',
    profile_title: '✨',
    theme: '🎭',
    effect: '⚡',
  };

  const rarity = rarityConfig[reward.rarity] || rarityConfig.common;
  const isPurchased = reward.owned_quantity > 0;
  const canAfford = studentPoints >= reward.point_cost;
  const reachedMaxOwned = reward.max_owned > 0 && reward.owned_quantity >= reward.max_owned;

  // Open purchase modal
  const handlePurchaseClick = () => {
    if (onOpenPurchaseModal) {
      onOpenPurchaseModal(reward);
    }
  };

  // Check if new (within 7 days)
  const isNew = reward.created_at && 
                new Date(reward.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div
      data-sfx
      className={`
        sfx-hover
        bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl 
        hover:shadow-2xl transition-all duration-300 
        overflow-hidden border-2 ${rarity.border} 
        group relative hover:scale-105
      `}
    >
      {/* Rarity Banner */}
      <div className={`
        absolute top-0 right-0 px-4 py-1 
        bg-gradient-to-r ${rarity.color} 
        text-white text-xs font-bold rounded-bl-xl z-10
        shadow-lg
      `}>
        {rarity.icon} {rarity.label}
      </div>

      {/* Image/Icon Section */}
      <div className={`${rarity.bg} h-48 flex items-center justify-center relative overflow-hidden`}>
        {reward.image_url ? (
          <img
            src={reward.image_url}
            alt={reward.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
            {typeIcons[reward.reward_type] || '🎁'}
          </div>
        )}
        
        {/* Owned Badge */}
        {isPurchased && (
          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse flex items-center gap-1">
            ✓ Owned x{reward.owned_quantity}
          </div>
        )}

        {/* New Badge */}
        {isNew && !isPurchased && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            NEW
          </div>
        )}

        {/* Max Owned Reached Badge */}
        {reachedMaxOwned && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            MAX OWNED
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Type */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors line-clamp-1 flex-1">
            {reward.name}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2 bg-gray-100 px-2 py-1 rounded-lg">
            {rewardTypes[reward.reward_type] || reward.reward_type}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
          {reward.description}
        </p>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-xl font-bold text-purple-600">
              {reward.point_cost.toLocaleString()}
            </span>
          </div>
          
          {/* Stock */}
          {reward.stock_quantity !== null && reward.stock_quantity !== -1 && (
            <div className={`
              text-xs font-semibold px-2 py-1 rounded-lg
              ${reward.stock_quantity < 10 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              Stock: {reward.stock_quantity}
            </div>
          )}

          {/* Unlimited Stock */}
          {(reward.stock_quantity === null || reward.stock_quantity === -1) && (
            <div className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-lg">
              Unlimited Stock
            </div>
          )}
        </div>

        {/* Max Owned Progress */}
        {reward.max_owned > 0 && reward.owned_quantity >= 0 && (
          <div className="mb-3 text-xs bg-gray-100 px-3 py-2 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-600">Ownership:</span>
              <span className={`font-bold ${reachedMaxOwned ? 'text-red-600' : 'text-gray-800'}`}>
                {reward.owned_quantity}/{reward.max_owned}
              </span>
            </div>
            {reachedMaxOwned && (
              <p className="text-red-600 font-semibold mt-1">Max limit reached</p>
            )}
          </div>
        )}

        {/* Already Purchased Info */}
        {isPurchased && !reachedMaxOwned && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-700 font-medium text-center">
              ✓ You own this reward
              {reward.max_owned > 0 && reward.max_owned !== -1 && (
                <span className="block mt-0.5 text-green-600">
                  Can purchase {reward.max_owned - reward.owned_quantity} more
                </span>
              )}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={route('student.rewards.show', reward.reward_id)}
            onClick={() => {
              console.log('🔍 Clicked View Details');
              console.log('Reward ID:', reward.reward_id);
              console.log('Route:', route('student.rewards.show', reward.reward_id));
            }}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all text-center text-sm hover:scale-105"
          >
            View Details
          </Link>
          
          {/* Purchase Button with Enhanced Logic */}
          {reachedMaxOwned ? (
            <button
              disabled
              className="flex-1 px-4 py-2 bg-amber-100 text-amber-700 font-semibold rounded-lg cursor-not-allowed text-sm"
            >
              Max Owned
            </button>
          ) : reward.can_purchase ? (
            <button
              onClick={handlePurchaseClick}
              className={`
                flex-1 px-4 py-2 font-semibold rounded-lg transition-all text-sm
                ${canAfford
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
              disabled={!canAfford}
            >
              {isPurchased ? 'Buy More' : canAfford ? 'Purchase Now' : 'Not Enough Points'}
            </button>
          ) : (
            <button
              disabled
              className="flex-1 px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg cursor-not-allowed text-sm"
            >
              {reward.stock_quantity === 0 ? 'Sold Out' : 'Unavailable'}
            </button>
          )}
        </div>

        {/* Not Enough Points Warning */}
        {!canAfford && reward.can_purchase && !reachedMaxOwned && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-1 rounded-lg flex items-center justify-between">
            <span>Need:</span>
            <span className="font-bold">
              {(reward.point_cost - studentPoints).toLocaleString()} pts
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
