import React from 'react';
import { Link } from '@inertiajs/react';
import { Target, Sparkles, Activity, ArrowRight } from 'lucide-react';
import ProgressMetric from './Cards/ProgressMetric';
import ActivityCard from './Cards/ActivityCard';

export default function OverviewSection({ profile, stats, topActivities, recentAchievements, inventoryItems }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Performance Card */}
      <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 drop-shadow-lg">
          <Target className="w-6 h-6 text-cyan-400 drop-shadow-lg" />
          Performance
        </h3>
        <div className="space-y-5">
          <ProgressMetric
            label="Accuracy"
            value={profile.average_score || 0}
            max={100}
            gradient="from-green-400 to-emerald-500"
          />
          <ProgressMetric
            label="Completion Rate"
            value={stats?.completion_rate || 0}
            max={100}
            gradient="from-cyan-400 to-blue-500"
          />
          <ProgressMetric
            label="Activity Score"
            value={85}
            max={100}
            gradient="from-blue-500 to-purple-600"
          />
        </div>
      </div>

      {/* Recent Rewards */}
      <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
            <Sparkles className="w-6 h-6 text-purple-400 drop-shadow-lg" />
            Recent Rewards
          </h3>
          <Link href={route('student.inventory.index')} className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1 drop-shadow-lg font-semibold">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {inventoryItems.slice(0, 4).map((item) => (
            <div key={item.id} className="relative group bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-purple-500/30 rounded-xl p-3 cursor-pointer">
              {item.reward?.image_url ? (
                <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                  <img 
                    src={item.reward.image_url} 
                    alt={item.reward.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <span className="text-3xl">{item.reward?.icon || '🎁'}</span>
                </div>
              )}
              <p className="text-white font-bold text-xs truncate drop-shadow-lg">{item.reward?.name || 'Reward'}</p>
              <p className="text-white/60 text-xs capitalize">{item.reward?.reward_type?.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="md:col-span-2 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
            <Activity className="w-6 h-6 text-blue-400 drop-shadow-lg" />
            Recent Activity
          </h3>
          <Link href={route('student.profile.history')} className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1 drop-shadow-lg font-semibold">
            View History
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topActivities.slice(0, 4).map((activity, i) => (
            <ActivityCard key={i} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}