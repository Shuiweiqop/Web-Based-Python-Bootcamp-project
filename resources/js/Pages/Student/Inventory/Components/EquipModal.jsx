import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Check, Loader2, AlertCircle } from 'lucide-react';
import RarityBadge from '@/Components/Rewards/RarityBadge';

/**
 * EquipModal
 * Equip / Unequip reward modal with Optimistic UI
 */
export default function EquipModal({ item, isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !item) return null;

  const reward = item.reward;
  const isEquipped = item.is_equipped;
  const itemType = reward.reward_type;

  /**
   * Handle equip
   */
  const handleEquip = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve, reject) => {
        router.post(
          route('student.inventory.equip', { id: item.inventory_id }),
          {},
          {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
              resolve();
              setTimeout(onClose, 500);
            },
            onError: (errors) => {
              setError(errors.message || 'Failed to equip. Please try again.');
              reject(errors);
            },
          }
        );
      });
    } catch (err) {
      console.error('Equip error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle unequip
   */
  const handleUnequip = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve, reject) => {
        router.post(
          route('student.inventory.unequip', { id: item.inventory_id }),
          {},
          {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
              resolve();
              setTimeout(onClose, 500);
            },
            onError: (errors) => {
              setError(errors.message || 'Failed to unequip. Please try again.');
              reject(errors);
            },
          }
        );
      });
    } catch (err) {
      console.error('Unequip error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
          {/* Close */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Reward Info */}
          <div className="text-center mb-6">
            {/* Image */}
            {reward.image_url ? (
              <img
                src={reward.image_url}
                alt={reward.name}
                className="w-32 h-32 mx-auto mb-4 rounded-xl object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-5xl">{getTypeEmoji(itemType)}</span>
              </div>
            )}

            {/* Name & Rarity */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {reward.name}
              </h3>
              <RarityBadge rarity={reward.rarity} size="md" />
            </div>

            {/* Description */}
            {reward.description && (
              <p className="text-gray-600 text-sm mb-4">
                {reward.description}
              </p>
            )}

            {/* Type */}
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {getTypeLabel(itemType)}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Status */}
          {isEquipped && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800 font-medium">
                This reward is currently equipped
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>

            {isEquipped ? (
              <button
                onClick={handleUnequip}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Unequipping...
                  </>
                ) : (
                  'Unequip'
                )}
              </button>
            ) : (
              <button
                onClick={handleEquip}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Equipping...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Equip
                  </>
                )}
              </button>
            )}
          </div>

          {!isEquipped && (
            <p className="text-xs text-gray-500 text-center mt-3">
              The reward will take effect immediately on your profile.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/* Helpers */

function getTypeEmoji(type) {
  const emojis = {
    avatar_frame: '🖼️',
    profile_background: '🎨',
    badge: '🏅',
    title: '👑',
    theme: '🎭',
    effect: '✨',
  };
  return emojis[type] || '🎁';
}

function getTypeLabel(type) {
  const labels = {
    avatar_frame: 'Avatar Frame',
    profile_background: 'Profile Background',
    badge: 'Badge',
    title: 'Title',
    theme: 'Theme',
    effect: 'Effect',
  };
  return labels[type] || type;
}
