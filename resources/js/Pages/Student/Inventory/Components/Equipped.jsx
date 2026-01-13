import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Award, Package, Sparkles, ShoppingBag, ArrowLeft } from 'lucide-react';

/**
 * Equipped Rewards Page
 * Display all currently equipped rewards
 */
export default function EquippedRewards({ equippedRewards, currentPoints }) {
  // Type icons
  const typeIcons = {
    avatar_frame: '🖼️',
    profile_background: '🎨',
    badge: '🏅',
    title: '✨',
    theme: '🎭',
    effect: '⚡',
  };

  // Type names
  const typeNames = {
    avatar_frame: 'Avatar Frame',
    profile_background: 'Profile Background',
    badge: 'Badge',
    title: 'Title',
    theme: 'Theme',
    effect: 'Effect',
  };

  // Rarity config
  const rarityConfig = {
    common: { color: 'from-gray-400 to-gray-600', icon: '⚪', label: 'Common' },
    rare: { color: 'from-blue-400 to-blue-600', icon: '💙', label: 'Rare' },
    epic: { color: 'from-purple-400 to-purple-600', icon: '💜', label: 'Epic' },
    legendary: { color: 'from-yellow-400 to-yellow-600', icon: '🌟', label: 'Legendary' },
  };

  return (
    <>
      <Head title="Equipped Rewards" />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href={route('student.inventory.index')}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </Link>

                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Award className="w-7 h-7 text-white" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Equipped Rewards
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    View all currently equipped rewards
                  </p>
                </div>
              </div>

              {/* Points */}
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl px-6 py-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-white" />
                  <div className="text-right">
                    <div className="text-xs text-amber-100 font-medium">
                      Current Points
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {currentPoints.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link
              href={route('student.inventory.index')}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300 group"
            >
              <Package className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-gray-900">
                Inventory
              </div>
              <div className="text-xs text-gray-500 mt-1">
                View all rewards
              </div>
            </Link>

            <Link
              href={route('student.rewards.index')}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-300 group"
            >
              <ShoppingBag className="w-8 h-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-gray-900">
                Reward Shop
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Get more rewards
              </div>
            </Link>
          </div>

          {/* Equipped Rewards */}
          {equippedRewards.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Equipped ({equippedRewards.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equippedRewards.map((item) => {
                  const reward = item.reward;
                  const rarity =
                    rarityConfig[reward.rarity] || rarityConfig.common;

                  return (
                    <div
                      key={item.inventory_id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-green-300"
                    >
                      {/* Header */}
                      <div className={`bg-gradient-to-r ${rarity.color} p-4`}>
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm font-bold">
                            {rarity.icon} {rarity.label}
                          </span>
                          <span className="px-3 py-1 bg-white bg-opacity-20 text-white text-xs font-bold rounded-full">
                            Equipped
                          </span>
                        </div>
                      </div>

                      {/* Image */}
                      <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                        {reward.image_url ? (
                          <img
                            src={reward.image_url}
                            alt={reward.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-6xl">
                            {typeIcons[reward.reward_type]}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                            {reward.name}
                          </h3>
                          <span className="text-xs text-gray-500 ml-2">
                            {typeNames[reward.reward_type]}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {reward.description}
                        </p>

                        <div className="text-xs text-gray-500 mb-3">
                          Equipped on:{' '}
                          {new Date(item.equipped_at).toLocaleDateString()}
                        </div>

                        <Link
                          href={route('student.inventory.index')}
                          className="block w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all text-center text-sm"
                        >
                          Manage Equipment
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyEquippedState />
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Empty state
 */
function EmptyEquippedState() {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
        <Award className="w-12 h-12 text-gray-400" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        No Equipped Rewards
      </h3>

      <p className="text-gray-600 mb-6">
        Go to your inventory and equip your first reward.
      </p>

      <div className="flex gap-3 justify-center">
        <Link
          href={route('student.inventory.index')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg"
        >
          Go to Inventory
        </Link>
        <Link
          href={route('student.rewards.index')}
          className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
        >
          Go to Shop
        </Link>
      </div>
    </div>
  );
}
