import React from 'react';
import { Package } from 'lucide-react';
import InventoryCard from './InventoryCard';

/**
 * InventoryGrid Component
 * Inventory grid / list display - shows all inventory items
 */
export default function InventoryGrid({
  inventory = [],
  viewMode = 'grid',
  rewardTypes = {},
  onOpenEquipModal = () => {},
  onResetFilters = () => {},
}) {
  // Safeguard: ensure inventory is always an array
  const items = Array.isArray(inventory) ? inventory : [];

  return (
    <>
      {items.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {items.map((item) => (
            <InventoryCard
              key={item.inventory_id ?? item.id}
              item={item}
              viewMode={viewMode}
              rewardTypes={rewardTypes}
              onOpenEquipModal={onOpenEquipModal}
            />
          ))}
        </div>
      ) : (
        <EmptyState onReset={onResetFilters} />
      )}
    </>
  );
}

/**
 * Empty State Component
 * Displayed when inventory is empty
 */
function EmptyState({ onReset = () => {} }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
        <Package className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Inventory is empty</h3>
      <p className="text-gray-600 mb-6">You don't have any rewards yet — check out the shop!</p>
      <div className="flex gap-3 justify-center">
        <a
          href="/student/rewards"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl"
          aria-label="Go to shop"
        >
          Go to Shop
        </a>
        <button
          type="button"
          onClick={onReset}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
          aria-label="Reset filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
