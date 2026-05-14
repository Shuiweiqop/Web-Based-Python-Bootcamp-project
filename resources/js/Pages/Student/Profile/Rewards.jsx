import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Gift, Package, ShoppingBag } from 'lucide-react';

export default function Rewards({ current_points = 0, inventory = {} }) {
  const groups = Object.entries(inventory || {});
  const totalItems = groups.reduce((sum, [, items]) => sum + (Array.isArray(items) ? items.length : 0), 0);

  return (
    <StudentLayout>
      <Head title="My Profile Rewards" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/20 bg-black/50 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Profile Rewards</h1>
              <p className="mt-2 text-gray-300">Rewards you can use to customize your student profile.</p>
            </div>
            <div className="rounded-xl bg-yellow-500/20 px-4 py-3 text-yellow-200">
              <span className="text-sm text-yellow-100">Current Points</span>
              <div className="text-2xl font-bold">{Number(current_points || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {totalItems > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.flatMap(([type, items]) =>
              (Array.isArray(items) ? items : []).map((item) => (
                <div key={`${type}-${item.inventory_id || item.reward_id || item.id}`} className="rounded-xl border border-white/15 bg-white/95 p-5 shadow-lg">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-slate-900">{item.name || item.reward?.name || 'Reward'}</h2>
                      <p className="text-xs capitalize text-slate-500">{String(type).replaceAll('_', ' ')}</p>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-600">{item.description || item.reward?.description || 'No description available.'}</p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/20 bg-black/40 p-10 text-center text-gray-300">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h2 className="text-xl font-bold text-white">No rewards yet</h2>
            <p className="mt-2">Complete lessons or visit the reward shop to start building your collection.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href={route('student.inventory.index')} className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-gray-100">
            View Inventory
          </Link>
          <Link href={route('student.rewards.index')} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 font-semibold text-white transition hover:from-purple-700 hover:to-pink-700">
            <ShoppingBag className="h-4 w-4" />
            Reward Shop
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
