import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Image, Frame, Award, Shield, Package, Gift, ArrowRight, CheckCircle } from 'lucide-react';
import InventoryCard from '@/Pages/Student/Inventory/Components/InventoryCard';

export default function RewardsSection({ backgrounds, avatarFrames, titles, badges, equipped, loading, rewardTypes }) {
  const [processing, setProcessing] = useState(null);

  const handleUnequip = async (rewardType) => {
    try {
      router.post(
        route('student.inventory.unequip'),
        { reward_type: rewardType },
        {
          preserveScroll: true,
        }
      );
    } catch (error) {
      console.error('Unequip error:', error);
    }
  };

  // Helper function to check if item is equipped
  const isItemEquipped = (item, type) => {
    if (!equipped || !item) return false;
    return equipped[type]?.id === item.reward_id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white drop-shadow-lg">Loading rewards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Backgrounds */}
      {backgrounds.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
              <Image className="w-7 h-7 text-cyan-400 drop-shadow-lg" />
              Backgrounds ({backgrounds.length})
            </h3>
            <Link href={route('student.profile.show')} className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1 drop-shadow-lg font-semibold">
              Customize
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {backgrounds.map((item) => (
              <InventoryCard 
                key={item.inventory_id}
                item={item}
                viewMode="grid"
                rewardTypes={rewardTypes}
              />
            ))}
          </div>
        </div>
      )}

      {/* Avatar Frames */}
      {avatarFrames.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
              <Frame className="w-7 h-7 text-purple-400 drop-shadow-lg" />
              Avatar Frames ({avatarFrames.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {avatarFrames.map((item) => (
              <InventoryCard 
                key={item.inventory_id}
                item={item}
                viewMode="grid"
                rewardTypes={rewardTypes}
              />
            ))}
          </div>
        </div>
      )}

      {/* Titles */}
      {titles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
              <Award className="w-7 h-7 text-yellow-400 drop-shadow-lg" />
              Titles ({titles.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {titles.map((item) => {
              const isEquipped = isItemEquipped(item, 'title');
              const isProcessing = processing === item.inventory_id;
              
              return (
                <button
                  key={item.inventory_id}
                  onClick={() => {
                    if (!isProcessing) {
                      if (isEquipped) {
                        handleUnequip('title');
                      } else {
                        setProcessing(item.inventory_id);
                        router.post(
                          route('student.inventory.toggle', item.inventory_id),
                          {},
                          { 
                            preserveScroll: true,
                            onFinish: () => setProcessing(null)
                          }
                        );
                      }
                    }
                  }}
                  disabled={isProcessing}
                  className={`relative group bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border rounded-2xl p-4 hover:scale-105 transition-all shadow-xl text-left ${
                    isEquipped
                      ? 'border-yellow-400/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]' 
                      : 'border-yellow-500/30'
                  } ${isProcessing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                >
                  {isEquipped && (
                    <div className="absolute top-3 right-3">
                      <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-4 h-4 text-yellow-900" />
                      </div>
                    </div>
                  )}
                  {isProcessing && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.icon || '👑'}</span>
                    <div>
                      <h4 className="text-white font-bold drop-shadow-lg">{item.name}</h4>
                      <p className="text-white/70 text-sm drop-shadow-md">{item.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-lg">
              <Shield className="w-7 h-7 text-blue-400 drop-shadow-lg" />
              Badges ({badges.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((item) => (
              <InventoryCard 
                key={item.inventory_id}
                item={item}
                viewMode="grid"
                rewardTypes={rewardTypes}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {backgrounds.length === 0 && avatarFrames.length === 0 && titles.length === 0 && badges.length === 0 && (
        <div className="text-center py-12 bg-black/40 backdrop-blur-xl rounded-2xl border-2 border-dashed border-white/20">
          <Package className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
            No Rewards Yet
          </h4>
          <p className="text-white/70 mb-6 drop-shadow-md">
            Earn points and visit the Reward Store to get awesome items!
          </p>
          <Link
            href={route('student.rewards.index')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-xl"
          >
            <Gift className="w-5 h-5" />
            Visit Reward Store
          </Link>
        </div>
      )}
    </div>
  );
}