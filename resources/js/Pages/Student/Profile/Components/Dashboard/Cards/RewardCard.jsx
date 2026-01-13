import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function RewardCard({ item, isEquipped }) {
  return (
    <div className={`group relative bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl border rounded-2xl p-4 hover:scale-105 transition-all cursor-pointer shadow-xl ${
      isEquipped 
        ? 'border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]' 
        : 'border-purple-500/30'
    }`}>
      {isEquipped && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-7 h-7 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-4 h-4 text-cyan-900" />
          </div>
        </div>
      )}
      
      {item.reward?.image_url ? (
        <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
          <img 
            src={item.reward.image_url} 
            alt={item.reward.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          />
        </div>
      ) : (
        <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
          <span className="text-5xl">{item.reward?.icon || '🎁'}</span>
        </div>
      )}
      
      <h4 className="text-white font-bold text-sm mb-1 truncate drop-shadow-lg">{item.reward?.name}</h4>
      <p className="text-white/60 text-xs capitalize truncate">{item.reward?.reward_type?.replace('_', ' ')}</p>
      {item.reward?.rarity && (
        <div className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
          item.reward.rarity === 'legendary' ? 'bg-yellow-500/30 text-yellow-300' :
          item.reward.rarity === 'epic' ? 'bg-purple-500/30 text-purple-300' :
          item.reward.rarity === 'rare' ? 'bg-blue-500/30 text-blue-300' :
          'bg-gray-500/30 text-gray-300'
        }`}>
          {item.reward.rarity}
        </div>
      )}
    </div>
  );
}