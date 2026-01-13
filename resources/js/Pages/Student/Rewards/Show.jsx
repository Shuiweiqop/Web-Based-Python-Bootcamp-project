import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { 
  ArrowLeft,
  Sparkles,
  ShoppingCart,
  Package,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Minus,
  Plus,
  Clock,
  Award,
  Zap
} from 'lucide-react';

/**
 * ✅ Reward Show Page - simplified reward detail & purchase page
 * Focused on purchase experience; minimal meta
 */
export default function RewardShow({ reward, studentPoints, studentProfile }) {
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Rarity config
  const rarityConfig = {
    common: { 
      color: 'from-gray-400 to-gray-600',
      bg: 'from-gray-50 to-gray-100',
      icon: '⚪', 
      label: 'Common',
      glow: 'shadow-gray-300'
    },
    rare: { 
      color: 'from-blue-400 to-blue-600',
      bg: 'from-blue-50 to-blue-100',
      icon: '💙', 
      label: 'Rare',
      glow: 'shadow-blue-300'
    },
    epic: { 
      color: 'from-purple-400 to-purple-600',
      bg: 'from-purple-50 to-purple-100',
      icon: '💜', 
      label: 'Epic',
      glow: 'shadow-purple-300'
    },
    legendary: { 
      color: 'from-yellow-400 to-yellow-600',
      bg: 'from-yellow-50 to-yellow-100',
      icon: '🌟', 
      label: 'Legendary',
      glow: 'shadow-yellow-300'
    },
  };

  // Type icons & labels
  const typeIcons = {
    avatar_frame: { icon: '🖼️', label: 'Avatar Frame' },
    profile_background: { icon: '🎨', label: 'Profile Background' },
    background: { icon: '🎨', label: 'Background' },
    badge: { icon: '🏅', label: 'Badge' },
    title: { icon: '✨', label: 'Title' },
    profile_title: { icon: '✨', label: 'Title' },
    theme: { icon: '🎭', label: 'Theme' },
    effect: { icon: '⚡', label: 'Effect' },
  };

  const rarity = rarityConfig[reward.rarity] || rarityConfig.common;
  const typeInfo = typeIcons[reward.reward_type] || { icon: '🎁', label: 'Reward' };

  // Calculations
  const totalCost = reward.point_cost * quantity;
  const canAfford = studentPoints >= totalCost;
  const remainingPoints = studentPoints - totalCost;

  // Maximum purchasable quantity
  const maxQuantity = Math.min(
    reward.stock_quantity > 0 ? reward.stock_quantity : 10,
    reward.max_owned > 0 && reward.owned_quantity >= 0 
      ? reward.max_owned - reward.owned_quantity 
      : 10,
    Math.floor(studentPoints / reward.point_cost) || 1
  );

  // Handle purchase
  const handlePurchase = () => {
    if (!canAfford || isPurchasing || !reward.can_purchase) return;

    if (confirm(`Confirm purchase of ${quantity} x ${reward.name}? Total ${totalCost.toLocaleString()} points.`)) {
      setIsPurchasing(true);

      router.post(
        route('student.rewards.purchase', reward.reward_id),
        { quantity },
        {
          onSuccess: () => {
            setQuantity(1);
          },
          onError: (errors) => {
            console.error('Purchase failed:', errors);
            alert('Purchase failed, please try again.');
          },
          onFinish: () => {
            setIsPurchasing(false);
          },
        }
      );
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <StudentLayout
      header={
        <div className="flex items-center gap-4">
          <Link
            href={route('student.rewards.index')}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6 text-white drop-shadow-lg" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Reward Details
            </h1>
            <p className="text-sm text-white/90 mt-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
              View details and purchase
            </p>
          </div>
        </div>
      }
    >
      <Head title={reward.name} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image and Basic Info */}
        <div className="lg:col-span-1">
          {/* Image Card */}
          <div className={`
            bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl 
            border-2 ${rarity.glow.replace('shadow', 'border')}
            overflow-hidden mb-6
          `}>
            {/* Rarity Banner */}
            <div className={`
              bg-gradient-to-r ${rarity.color} 
              px-6 py-3 text-white font-bold text-center
            `}>
              {rarity.icon} {rarity.label} · {typeInfo.icon} {typeInfo.label}
            </div>

            {/* Image */}
            <div className={`bg-gradient-to-br ${rarity.bg} p-8 flex items-center justify-center min-h-[300px]`}>
              {reward.image_url ? (
                <img
                  src={reward.image_url}
                  alt={reward.name}
                  className="max-w-full max-h-[400px] object-contain rounded-xl shadow-2xl"
                />
              ) : (
                <div className="text-8xl">{typeInfo.icon}</div>
              )}
            </div>

            {/* Owned Badge */}
            {reward.owned_quantity > 0 && (
              <div className="bg-green-50 border-t-2 border-green-200 px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-bold">
                    Owned x{reward.owned_quantity}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              icon={Star}
              label="Rarity"
              value={rarity.label}
              color="amber"
            />
            <StatBox
              icon={Package}
              label="Type"
              value={typeInfo.label}
              color="blue"
            />
          </div>
        </div>

        {/* Right Column - Details and Purchase */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Description */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/50 p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {reward.name}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {reward.description}
            </p>
          </div>

          {/* Availability Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stock */}
            <InfoCard
              icon={Package}
              label="Stock"
              value={
                reward.stock_quantity === null || reward.stock_quantity === -1
                  ? 'Unlimited'
                  : reward.stock_quantity
              }
              status={
                reward.stock_quantity > 10 || reward.stock_quantity === null
                  ? 'success'
                  : reward.stock_quantity > 0
                  ? 'warning'
                  : 'error'
              }
            />

            {/* Max Owned */}
            {reward.max_owned > 0 && (
              <InfoCard
                icon={Award}
                label="Max Owned"
                value={`${reward.owned_quantity}/${reward.max_owned}`}
                status={reward.owned_quantity >= reward.max_owned ? 'error' : 'success'}
              />
            )}

            {/* Purchase Status */}
            <InfoCard
              icon={reward.can_purchase ? CheckCircle : XCircle}
              label="Purchase Status"
              value={reward.can_purchase ? 'Purchasable' : 'Not Purchasable'}
              status={reward.can_purchase ? 'success' : 'error'}
            />
          </div>

          {/* Purchase Section */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl border-2 border-purple-200 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
              Purchase Info
            </h3>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-12 h-12 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                >
                  <Minus className="w-6 h-6 text-gray-700" />
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
                  className="flex-1 text-center text-2xl font-bold py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
                
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= maxQuantity}
                  className="w-12 h-12 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                >
                  <Plus className="w-6 h-6 text-gray-700" />
                </button>

                <div className="text-right">
                  <div className="text-xs text-gray-600">Max</div>
                  <div className="text-sm font-bold text-gray-900">{maxQuantity} pcs</div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white rounded-xl p-4 mb-6 border-2 border-purple-200">
              <div className="space-y-3">
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
                  <span className="font-bold text-gray-900">x {quantity}</span>
                </div>
                <div className="border-t-2 border-purple-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
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
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-gray-200">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current Points</span>
                  <span className="font-bold text-gray-900">
                    {studentPoints.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Remaining After Purchase</span>
                  <span className={`font-bold ${remainingPoints >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {remainingPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {!canAfford && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-red-900 mb-1">Insufficient Points</div>
                  <div className="text-sm text-red-700">
                    You need {(totalCost - studentPoints).toLocaleString()} more points to complete this purchase.
                  </div>
                </div>
              </div>
            )}

            {!reward.can_purchase && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-red-900 mb-1">Not Purchasable</div>
                  <div className="text-sm text-red-700">
                    {reward.stock_quantity === 0 
                      ? 'This reward is sold out.' 
                      : reward.owned_quantity >= reward.max_owned
                      ? 'You have reached the ownership limit.'
                      : 'This reward is temporarily unavailable for purchase.'}
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={!canAfford || isPurchasing || !reward.can_purchase}
              className={`
                w-full py-4 font-bold text-lg rounded-xl transition-all
                ${canAfford && reward.can_purchase && !isPurchasing
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-xl hover:shadow-2xl hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isPurchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 animate-spin" />
                  Purchasing...
                </span>
              ) : !reward.can_purchase ? (
                'Not Purchasable'
              ) : !canAfford ? (
                'Insufficient Points'
              ) : (
                `Confirm Purchase (${totalCost.toLocaleString()} pts)`
              )}
            </button>
          </div>

          {/* Back & Inventory Buttons */}
          <div className="flex gap-3">
            <Link
              href={route('student.rewards.index')}
              className="flex-1 px-6 py-3 bg-white/90 backdrop-blur-xl border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-white transition-all text-center hover:scale-105"
            >
              Back to Shop
            </Link>
            <Link
              href={route('student.inventory.index')}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all text-center hover:scale-105 shadow-lg"
            >
              View Inventory
            </Link>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

/**
 * ✅ StatBox - small stat card
 */
function StatBox({ icon: Icon, label, value, color }) {
  const colors = {
    amber: 'from-amber-400 to-amber-600',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    green: 'from-green-400 to-green-600',
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border-2 border-white/50 p-4">
      <div className={`w-10 h-10 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-sm font-bold text-gray-900">{value}</div>
    </div>
  );
}

/**
 * ✅ InfoCard - information card with status
 */
function InfoCard({ icon: Icon, label, value, status }) {
  const statusColors = {
    success: 'bg-green-50 border-green-300 text-green-700',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    error: 'bg-red-50 border-red-300 text-red-700',
  };

  return (
    <div className={`${statusColors[status]} backdrop-blur-xl rounded-xl shadow-lg border-2 p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
