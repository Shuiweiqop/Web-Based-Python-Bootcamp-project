import React from 'react';
import { Filter, ChevronDown, X, Grid3x3, List } from 'lucide-react';

/**
 * InventoryFilters Component
 * Inventory filters - type, rarity, equipped status, sorting
 */
export default function InventoryFilters({
  selectedType,
  setSelectedType,
  selectedRarity,
  setSelectedRarity,
  equippedFilter,
  setEquippedFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  rewardTypes,
  rarities,
  onApplyFilters,
  onResetFilters,
  showFilters,
  setShowFilters,
  viewMode,
  setViewMode,
}) {
  // Default rarity configuration (fallback if not provided)
  const rarityConfig = {
    common: { icon: '⚪', label: 'Common', color: 'text-gray-600' },
    uncommon: { icon: '🟢', label: 'Uncommon', color: 'text-green-600' },
    rare: { icon: '💙', label: 'Rare', color: 'text-blue-600' },
    epic: { icon: '💜', label: 'Epic', color: 'text-purple-600' },
    legendary: { icon: '🌟', label: 'Legendary', color: 'text-amber-600' },
  };

  // Use provided rarities or fall back to default
  const availableRarities = rarities && Object.keys(rarities).length > 0 
    ? rarities 
    : {
        common: 'Common',
        uncommon: 'Uncommon',
        rare: 'Rare',
        epic: 'Epic',
        legendary: 'Legendary',
      };

  // Default type icons (fallback if not provided)
  const typeIcons = {
    avatar_frame: '🖼️',
    profile_background: '🎨',
    badge: '🏅',
    title: '✨',
    theme: '🎭',
    effect: '⚡',
  };

  // Use provided rewardTypes or fall back to default
  const availableTypes = rewardTypes && Object.keys(rewardTypes).length > 0
    ? rewardTypes
    : {
        avatar_frame: 'Avatar Frame',
        profile_background: 'Profile Background',
        badge: 'Badge',
        title: 'Title',
        theme: 'Theme',
        effect: 'Effect',
      };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filter Options
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Grid View"
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-t-2 border-gray-100 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reward Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="all">All Types</option>
                {Object.entries(availableTypes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {typeIcons[key] || '📦'} {label}
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
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="all">All Rarities</option>
                {Object.entries(availableRarities).map(([key, label]) => (
                  <option key={key} value={key}>
                    {rarityConfig[key]?.icon || '⭐'} {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipped Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Equipped Status
              </label>
              <select
                value={equippedFilter}
                onChange={(e) => setEquippedFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="all">All Items</option>
                <option value="true">Equipped</option>
                <option value="false">Not Equipped</option>
              </select>
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
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="obtained_at-desc">Recently Obtained</option>
                <option value="obtained_at-asc">Oldest First</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
                <option value="quantity-desc">Quantity: High to Low</option>
                <option value="quantity-asc">Quantity: Low to High</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedType !== 'all' || selectedRarity !== 'all' || equippedFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
              {selectedType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {typeIcons[selectedType] || '📦'} {availableTypes[selectedType]}
                  <button
                    onClick={() => setSelectedType('all')}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedRarity !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {rarityConfig[selectedRarity]?.icon || '⭐'} {availableRarities[selectedRarity]}
                  <button
                    onClick={() => setSelectedRarity('all')}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {equippedFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {equippedFilter === 'true' ? '✅ Equipped' : '⭕ Not Equipped'}
                  <button
                    onClick={() => setEquippedFilter('all')}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Filter Actions */}
          <div className="flex gap-3">
            <button
              onClick={onApplyFilters}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
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