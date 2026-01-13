import React from 'react';
import { Link } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';
import RewardCard from './RewardCard';

/**
 * ✅ RewardGallery Component
 * Reward gallery grid - displays reward list and pagination
 */
export default function RewardGallery({
  rewards,
  studentPoints,
  rewardTypes,
  onResetFilters,
  onOpenPurchaseModal,
}) {
  return (
    <>
      {/* Rewards Grid */}
      {rewards.data && rewards.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rewards.data.map((reward) => (
              <RewardCard
                key={reward.reward_id}
                reward={reward}
                studentPoints={studentPoints}
                rewardTypes={rewardTypes}
                onOpenPurchaseModal={onOpenPurchaseModal}
              />
            ))}
          </div>

          {/* Pagination */}
          {rewards.links && rewards.links.length > 3 && (
            <div className="mt-8">
              {/* Pagination Info */}
              <div className="text-center text-sm text-white/90 mb-4 font-medium drop-shadow-lg">
                Showing {rewards.from || 0} - {rewards.to || 0} of {rewards.total || 0} rewards
              </div>

              {/* Pagination Links */}
              <div className="flex flex-wrap justify-center gap-2">
                {rewards.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    preserveState
                    preserveScroll
                    className={`
                      px-4 py-2 rounded-lg font-semibold transition-all
                      ${link.active
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl scale-110'
                        : link.url
                        ? 'bg-white/90 backdrop-blur-xl text-gray-700 hover:bg-white border-2 border-white/50 hover:border-purple-300 hover:scale-105 shadow-lg'
                        : 'bg-gray-200/50 text-gray-400 cursor-not-allowed backdrop-blur-sm'
                      }
                    `}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState onReset={onResetFilters} />
      )}
    </>
  );
}

/**
 * ✅ Empty State Component
 * Empty state display when there are no results
 */
function EmptyState({ onReset }) {
  return (
    <div className="text-center py-16">
      <div className="w-32 h-32 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-white/50">
        <ShoppingBag className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
        No rewards found
      </h3>
      <p className="text-white/90 mb-8 text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
        Try adjusting your filters or search keywords
      </p>
      <button
        onClick={onReset}
        className="
          px-8 py-4 
          bg-gradient-to-r from-purple-500 to-pink-500 
          text-white font-bold text-lg rounded-2xl 
          hover:from-purple-600 hover:to-pink-600 
          transition-all shadow-2xl hover:shadow-3xl 
          hover:scale-110
          active:scale-95
        "
      >
        Reset Filters
      </button>
    </div>
  );
}
