import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import RewardFilters from './Components/RewardFilters';
import RewardGallery from './Components/RewardGallery';
import PurchaseModal from './Components/RewardModal';
import { 
  ShoppingBag, 
  Star, 
  Sparkles,
  TrendingUp,
  Award,
  Package
} from 'lucide-react';

/**
 * ✅ Student Rewards Shop - Fixed visibility for custom backgrounds
 */
export default function RewardsIndex({ 
  rewards, 
  studentPoints, 
  studentProfile,
  rewardTypes, 
  rarities,
  filters 
}) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState(filters.type || 'all');
  const [selectedRarity, setSelectedRarity] = useState(filters.rarity || 'all');
  const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
  const [sortBy, setSortBy] = useState(filters.sort || 'created_at');
  const [sortOrder, setSortOrder] = useState(filters.order || 'desc');

  // Purchase modal state
  const [selectedReward, setSelectedReward] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Apply filters
  const applyFilters = () => {
    router.get(route('student.rewards.index'), {
      type: selectedType !== 'all' ? selectedType : undefined,
      rarity: selectedRarity !== 'all' ? selectedRarity : undefined,
      max_price: maxPrice || undefined,
      search: searchQuery || undefined,
      sort: sortBy,
      order: sortOrder,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedType('all');
    setSelectedRarity('all');
    setMaxPrice('');
    setSearchQuery('');
    setSortBy('created_at');
    setSortOrder('desc');
    router.get(route('student.rewards.index'));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Open purchase modal
  const handleOpenPurchaseModal = (reward) => {
    setSelectedReward(reward);
    setShowPurchaseModal(true);
  };

  // Close purchase modal
  const handleClosePurchaseModal = () => {
    setShowPurchaseModal(false);
    setSelectedReward(null);
  };

  return (
    <StudentLayout
      header={
        <div className="flex items-center justify-between">
          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/30">
              <ShoppingBag className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Rewards Shop
              </h1>
              <p className="text-sm text-white/90 mt-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                Redeem rewards you love using your points
              </p>
            </div>
          </div>

          {/* Points Display */}
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl px-6 py-4 shadow-xl border-2 border-white/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-white drop-shadow-lg" />
              <div className="text-right">
                <div className="text-xs text-amber-100 font-medium drop-shadow-md">
                  My Points
                </div>
                <div className="text-2xl font-bold text-white drop-shadow-lg">
                  {studentPoints.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <Head title="Rewards Shop" />

      <div className="space-y-6">
        {/* Quick Links - 增强背景 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLinkCard
            href={route('student.inventory.index')}
            icon={Package}
            title="My Inventory"
            description="View owned rewards"
            color="purple"
          />

          <QuickLinkCard
            href={route('student.rewards.history')}
            icon={TrendingUp}
            title="Purchase History"
            description="View past purchases"
            color="blue"
          />

          <StatCard
            icon={Award}
            title="Points Level"
            value={studentProfile.points_level || 'Newbie'}
            color="amber"
          />

          <StatCard
            icon={Star}
            title="Available Rewards"
            value={`${rewards.total || 0} available`}
            color="pink"
          />
        </div>

        {/* Filters */}
        <RewardFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedRarity={selectedRarity}
          setSelectedRarity={setSelectedRarity}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          rewardTypes={rewardTypes}
          rarities={rarities}
          onSearch={handleSearch}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        {/* Rewards Gallery */}
        <RewardGallery
          rewards={rewards}
          studentPoints={studentPoints}
          rewardTypes={rewardTypes}
          onResetFilters={resetFilters}
          onOpenPurchaseModal={handleOpenPurchaseModal}
        />
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedReward && (
        <PurchaseModal
          reward={selectedReward}
          studentPoints={studentPoints}
          isOpen={showPurchaseModal}
          onClose={handleClosePurchaseModal}
        />
      )}
    </StudentLayout>
  );
}

/**
 * ✅ QuickLinkCard - 增强背景版本
 */
function QuickLinkCard({ href, icon: Icon, title, description, color }) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    amber: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
  };

  const glowClasses = {
    purple: 'from-purple-500/30 to-purple-600/30',
    blue: 'from-blue-500/30 to-blue-600/30',
    green: 'from-green-500/30 to-green-600/30',
    amber: 'from-amber-500/30 to-amber-600/30',
  };

  return (
    <Link
      href={href}
      className={`
        bg-black/70 backdrop-blur-md rounded-2xl p-5 shadow-2xl 
        border-2 border-white/30 
        hover:shadow-2xl hover:scale-105 hover:border-white/50
        transition-all duration-300 
        group relative overflow-hidden
      `}
    >
      {/* Background Gradient (on hover) */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${glowClasses[color]} 
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-300
      `} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className={`
          w-12 h-12 bg-gradient-to-br ${colorClasses[color]} 
          rounded-xl flex items-center justify-center 
          shadow-xl mb-3 border border-white/30
          group-hover:scale-110 group-hover:rotate-6
          transition-transform duration-300
        `}>
          <Icon className="w-6 h-6 text-white drop-shadow-lg" />
        </div>
        <div className="font-bold text-white text-base mb-1 drop-shadow-lg group-hover:scale-105 transition-transform">
          {title}
        </div>
        <div className="text-xs text-gray-200 drop-shadow-md">
          {description}
        </div>
      </div>
    </Link>
  );
}

/**
 * ✅ StatCard - 增强背景版本
 */
function StatCard({ icon: Icon, title, value, color }) {
  const colorClasses = {
    amber: 'from-amber-500 to-amber-600',
    pink: 'from-pink-500 to-pink-600',
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
  };

  const glowClasses = {
    amber: 'from-amber-500/20 to-amber-600/20',
    pink: 'from-pink-500/20 to-pink-600/20',
    purple: 'from-purple-500/20 to-purple-600/20',
    blue: 'from-blue-500/20 to-blue-600/20',
  };

  return (
    <div data-sfx className={`
      bg-black/70 backdrop-blur-md rounded-2xl p-5 shadow-2xl 
      border-2 border-white/30 
      relative overflow-hidden
      hover:border-white/50 transition-all duration-300
    `}>
      {/* Background Glow Pattern */}
      <div className={`
        absolute top-0 right-0 w-32 h-32 
        bg-gradient-to-br ${glowClasses[color]} 
        rounded-full blur-2xl
        -translate-y-8 translate-x-8
      `} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className={`
          w-12 h-12 bg-gradient-to-br ${colorClasses[color]} 
          rounded-xl flex items-center justify-center 
          shadow-xl mb-3 border border-white/30
        `}>
          <Icon className="w-6 h-6 text-white drop-shadow-lg" />
        </div>
        <div className="font-bold text-white text-base mb-1 drop-shadow-lg">
          {title}
        </div>
        <div className="text-sm text-gray-200 font-medium drop-shadow-md">
          {value}
        </div>
      </div>
    </div>
  );
}
