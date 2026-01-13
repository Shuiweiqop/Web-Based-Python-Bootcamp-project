import React from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';

/**
 * RewardFilters Component
 * Reward filters - search, type, rarity, price, sorting
 */
export default function RewardFilters({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedRarity,
  setSelectedRarity,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  rewardTypes,
  rarities,
  onSearch,
  onApplyFilters,
  onResetFilters,
  showFilters,
  setShowFilters,
}) {
  // Rarity configuration
  const rarityConfig = {
    common: { icon: '⚪', label: 'Common' },
    rare: { icon: '💙', label: 'Rare' },
    epic: { icon: '💜', label: 'Epic' },
    legendary: { icon: '🌟', label: 'Legendary' },
  };

  // Type icons
  const typeIcons = {
    avatar_frame: '🖼️',
    profile_background: '🎨',
    badge: '🏅',
    title: '✨',
    theme: '🎭',
    effect: '⚡',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Search Bar */}
      <form onSubmit={onSearch} className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reward name or description..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filters
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-t-2 border-gray-100 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reward Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              >
                <option value="all">All Types</option>
                {Object.entries(rewardTypes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {typeIcons[key]} {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rarity Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rarity
              </label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              >
                <option value="all">All Rarities</option>
                {Object.entries(rarities).map(([key, label]) => (
                  <option key={key} value={key}>
                    {rarityConfig[key].icon} {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Price
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Unlimited"
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort);
                  setSortOrder(order);
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="point_cost-asc">Price: Low to High</option>
                <option value="point_cost-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="rarity-desc">Rarity: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedType !== 'all' || selectedRarity !== 'all' || maxPrice) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
              {selectedType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {typeIcons[selectedType]} {rewardTypes[selectedType]}
                  <button
                    onClick={() => setSelectedType('all')}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedRarity !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {rarityConfig[selectedRarity].icon} {rarities[selectedRarity]}
                  <button
                    onClick={() => setSelectedRarity('all')}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {maxPrice && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Max {maxPrice} points
                  <button
                    onClick={() => setMaxPrice('')}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Filter Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={onApplyFilters}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
            >
              Apply Filters
            </button>
            <button
              onClick={onResetFilters}
              className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}