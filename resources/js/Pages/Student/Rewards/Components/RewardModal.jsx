import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Sparkles, AlertCircle, ShoppingCart, Minus, Plus } from 'lucide-react';

/**
 * PurchaseModal Component
 * Purchase confirmation modal – shows details and confirms purchase
 */
export default function PurchaseModal({ 
  reward, 
  studentPoints, 
  isOpen, 
  onClose 
}) {
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  if (!isOpen || !reward) return null;

  const totalCost = reward.point_cost * quantity;
  const canAfford = studentPoints >= totalCost;
  const remainingPoints = studentPoints - totalCost;

  // Maximum purchasable quantity
  const maxQuantity = Math.min(
    reward.stock_quantity > 0 ? reward.stock_quantity : 10,
    reward.max_owned > 0 && reward.owned_quantity >= 0 
      ? reward.max_owned - reward.owned_quantity 
      : 10,
    Math.floor(studentPoints / reward.point_cost)
  );

  const handlePurchase = () => {
    if (!canAfford || isPurchasing) return;

    setIsPurchasing(true);

    router.post(
      route('student.rewards.purchase', reward.reward_id),
      { quantity },
      {
        onSuccess: () => {
          onClose();
          setQuantity(1);
        },
        onError: (errors) => {
          console.error('Purchase failed:', errors);
        },
        onFinish: () => {
          setIsPurchasing(false);
        },
      }
    );
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  // Rarity configuration
  const rarityConfig = {
    common: { color: 'from-gray-400 to-gray-600', icon: '⚪', label: 'Common' },
    rare: { color: 'from-blue-400 to-blue-600', icon: '💙', label: 'Rare' },
    epic: { color: 'from-purple-400 to-purple-600', icon: '💜', label: 'Epic' },
    legendary: { color: 'from-yellow-400 to-yellow-600', icon: '🌟', label: 'Legendary' },
  };

  const rarity = rarityConfig[reward.rarity] || rarityConfig.common;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className={`bg-gradient-to-r ${rarity.color} p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-3 text-white">
            <ShoppingCart className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Confirm Purchase</h2>
              <p className="text-sm opacity-90 mt-1">
                {rarity.icon} {rarity.label} Reward
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {/* Reward Info */}
          <div className="flex gap-4 mb-6">
            <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              {reward.image_url ? (
                <img
                  src={reward.image_url}
                  alt={reward.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-4xl">🎁</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {reward.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {reward.description}
              </p>
              {reward.owned_quantity > 0 && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Owned x{reward.owned_quantity}
                </div>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Quantity
            </label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Minus className="w-5 h-5 text-gray-700" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    if (val >= 1 && val <= maxQuantity) {
                      setQuantity(val);
                    }
                  }}
                  min="1"
                  max={maxQuantity}
                  className="w-20 text-center text-xl font-bold py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= maxQuantity}
                  className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Maximum</div>
                <div className="text-sm font-bold text-gray-900">
                  {maxQuantity} items
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Unit Price</span>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-purple-600">
                    {reward.point_cost.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Quantity</span>
                <span className="font-bold text-gray-900">
                  x {quantity}
                </span>
              </div>
              <div className="border-t-2 border-purple-200 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    Total
                  </span>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span className="text-2xl font-bold text-purple-600">
                      {totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Points Balance */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Current Points</span>
              <span className="font-bold text-gray-900">
                {studentPoints.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Remaining After Purchase</span>
              <span
                className={`font-bold ${
                  remainingPoints >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {remainingPoints.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Warnings */}
          {!canAfford && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-900 mb-1">
                  Insufficient Points
                </div>
                <div className="text-sm text-red-700">
                  You need {(totalCost - studentPoints).toLocaleString()} more
                  points to complete this purchase.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t-2 border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={!canAfford || isPurchasing}
            className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all ${
              canAfford && !isPurchasing
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isPurchasing
              ? 'Processing...'
              : canAfford
              ? 'Confirm Purchase'
              : 'Insufficient Points'}
          </button>
        </div>
      </div>
    </div>
  );
}
