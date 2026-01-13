import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { 
  History, 
  ArrowLeft, 
  Sparkles,
  ShoppingBag,
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  Filter,
  Download
} from 'lucide-react';
import RarityBadge from '@/Components/Rewards/RarityBadge';

/**
 * Rewards History - Fixed visibility & Export功能
 */
export default function RewardsHistory({ auth, records = { data: [], links: [] }, studentPoints = 0 }) {
  const [filterType, setFilterType] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [exporting, setExporting] = useState(false);

  // Helper: get points changed
  function getPointsChanged(record) {
    let delta = null;

    if (typeof record.points_changed !== 'undefined' && record.points_changed !== null) {
      delta = Number(record.points_changed);
    } else if (typeof record.points_change !== 'undefined' && record.points_change !== null) {
      delta = Number(record.points_change);
    } else if (typeof record.points_after !== 'undefined' && typeof record.points_before !== 'undefined') {
      delta = Number(record.points_after) - Number(record.points_before);
    } else {
      delta = 0;
    }

    if (Object.is(delta, -0)) return 0;
    return delta;
  }

  // Statistics
  const totalSpent = (records.data || []).reduce((sum, r) => {
    const d = getPointsChanged(r);
    return sum + (d < 0 ? Math.abs(d) : 0);
  }, 0);

  const stats = {
    totalPurchases: (records.data || []).length,
    totalSpent: totalSpent,
    thisMonth: (records.data || []).filter(r => {
      const issued = new Date(r.issued_at);
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      return issued >= startOfMonth;
    }).length,
  };

  // ✅ 导出为 CSV
  const exportToCSV = () => {
    setExporting(true);
    
    try {
      // 准备 CSV 数据
      const headers = ['Date', 'Reward Name', 'Type', 'Rarity', 'Points Spent', 'Balance After'];
      const rows = records.data.map(record => {
        const reward = record.reward || {};
        const delta = getPointsChanged(record);
        const pointsSpent = Math.abs(delta);
        
        return [
          new Date(record.issued_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          reward.reward_name || reward.name || 'Unknown',
          getTypeLabel(reward.reward_type || 'unknown'),
          reward.rarity || 'common',
          pointsSpent,
          record.points_after || 'N/A'
        ];
      });

      // 构建 CSV 字符串
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // 创建下载链接
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `purchase_history_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => setExporting(false), 1000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export records. Please try again.');
      setExporting(false);
    }
  };

  // ✅ 导出为 JSON
  const exportToJSON = () => {
    setExporting(true);
    
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        studentName: auth.user.name,
        currentPoints: studentPoints,
        statistics: stats,
        records: records.data.map(record => ({
          date: record.issued_at,
          reward: {
            name: record.reward?.reward_name || record.reward?.name,
            type: record.reward?.reward_type,
            rarity: record.reward?.rarity,
            description: record.reward?.description || record.reward?.reward_description,
          },
          pointsSpent: Math.abs(getPointsChanged(record)),
          balanceAfter: record.points_after,
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `purchase_history_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => setExporting(false), 1000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export records. Please try again.');
      setExporting(false);
    }
  };

  return (
    <StudentLayout user={auth.user}>
      <Head title="Purchase History" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Top navigation - 增强背景 */}
          <div className="flex items-center justify-between bg-black/70 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-2xl">
            <div className="flex items-center gap-4">
              <Link
                href={route('student.rewards.index')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white drop-shadow-lg" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  <History className="w-8 h-8 text-blue-400 drop-shadow-lg" />
                  Purchase History
                </h1>
                <p className="text-sm text-gray-200 mt-1 drop-shadow-lg">
                  View all your reward purchase records
                </p>
              </div>
            </div>

            {/* Current points */}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl px-6 py-3 shadow-2xl border border-amber-300/50">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 drop-shadow-lg" />
                <div className="text-right">
                  <div className="text-xs opacity-90 drop-shadow-lg">Current Points</div>
                  <div className="text-xl font-bold drop-shadow-lg">
                    {Number(studentPoints || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics cards - 增强背景 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={ShoppingBag}
              label="Total Purchases"
              value={stats.totalPurchases}
              color="blue"
            />
            <StatCard
              icon={TrendingDown}
              label="Total Points Spent"
              value={Math.abs(stats.totalSpent).toLocaleString()}
              color="orange"
            />
            <StatCard
              icon={Calendar}
              label="Purchases This Month"
              value={stats.thisMonth}
              color="green"
            />
          </div>

          {/* Quick links - 增强背景 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <QuickLink
              href={route('student.rewards.index')}
              icon={ShoppingBag}
              label="Continue Shopping"
              color="purple"
            />
            <QuickLink
              href={route('student.inventory.index')}
              icon={Package}
              label="My Inventory"
              color="blue"
            />
            {/* ✅ 导出按钮（下拉菜单） */}
            <div className="relative group">
              <button
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 font-semibold
                  transition-all hover:scale-105 hover:shadow-xl
                  bg-black/60 text-green-300 hover:bg-black/80 border-green-500/50 backdrop-blur-sm shadow-lg"
              >
                <Download className="w-6 h-6 drop-shadow-lg" />
                <span className="drop-shadow-lg">Export Records</span>
              </button>
              
              {/* 下拉菜单 */}
              <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/30 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  onClick={exportToCSV}
                  disabled={exporting}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/20 transition-colors rounded-t-xl disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span className="font-medium drop-shadow-lg">
                      {exporting ? 'Exporting...' : 'Export as CSV'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 drop-shadow-md">
                    Excel-compatible format
                  </p>
                </button>
                
                <button
                  onClick={exportToJSON}
                  disabled={exporting}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/20 transition-colors rounded-b-xl disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span className="font-medium drop-shadow-lg">
                      {exporting ? 'Exporting...' : 'Export as JSON'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 drop-shadow-md">
                    Data interchange format
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Filters - 增强背景 */}
          <div className="bg-black/70 backdrop-blur-md rounded-xl shadow-2xl border border-white/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-blue-400 drop-shadow-lg" />
                <span className="font-semibold text-white drop-shadow-lg">Filter Records</span>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-black/60 border-2 border-white/30 text-white rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 backdrop-blur-sm shadow-lg"
                >
                  <option value="all">All Types</option>
                  <option value="avatar_frame">Avatar Frame</option>
                  <option value="badge">Badge</option>
                  <option value="title">Title</option>
                  <option value="profile_background">Profile Background</option>
                </select>

                <select
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                  className="px-4 py-2 bg-black/60 border-2 border-white/30 text-white rounded-lg focus:border-green-400 focus:ring-2 focus:ring-green-400/50 backdrop-blur-sm shadow-lg"
                >
                  <option value="all">All Rarities</option>
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
            </div>
          </div>

          {/* History list - 增强背景 */}
          <div className="bg-black/70 backdrop-blur-md rounded-xl shadow-2xl border border-white/30 overflow-hidden">
            {(records.data && records.data.length > 0) ? (
              <div className="divide-y divide-white/20">
                {records.data
                  .filter(record => {
                    const typeMatch = filterType === 'all' || record.reward?.reward_type === filterType;
                    const rarityMatch = filterRarity === 'all' || record.reward?.rarity === filterRarity;
                    return typeMatch && rarityMatch;
                  })
                  .map((record) => (
                    <HistoryCard
                      key={record.record_id}
                      record={record}
                      getPointsChanged={getPointsChanged}
                    />
                  ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>

          {/* Pagination - 增强背景 */}
          {(records.links && records.links.length > 3) && (
            <div className="flex justify-center">
              <div className="flex gap-2">
                {records.links.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => link.url && router.visit(link.url)}
                    disabled={!link.url}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-sm shadow-lg
                      ${link.active
                        ? 'bg-blue-500 text-white shadow-xl border border-blue-400'
                        : link.url
                        ? 'bg-black/60 text-white hover:bg-black/80 border border-white/30'
                        : 'bg-black/30 text-gray-500 cursor-not-allowed border border-white/20'
                      }
                    `}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </StudentLayout>
  );
}

/**
 * HistoryCard - 增强背景
 */
function HistoryCard({ record, getPointsChanged }) {
  const reward = record.reward || {};
  const delta = getPointsChanged(record);
  const pointsSpent = Math.abs(delta);
  const isSpend = delta < 0;

  return (
    <div className="p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-shrink-0">
            {reward.image_url ? (
              <img
                src={reward.image_url}
                alt={reward.reward_name || reward.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-sm">
                <Package className="w-8 h-8 text-blue-300 drop-shadow-lg" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-white text-lg drop-shadow-lg">
                {reward.reward_name || reward.name || 'Unknown Reward'}
              </h3>
              {reward.rarity && <RarityBadge rarity={reward.rarity} size="sm" />}
            </div>

            {(reward.description || reward.reward_description) && (
              <p className="text-sm text-gray-200 mb-2 line-clamp-1 drop-shadow-md">
                {reward.description || reward.reward_description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-300">
              <span className="flex items-center gap-1 drop-shadow-md">
                <Calendar className="w-3 h-3" />
                {new Date(record.issued_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {reward.reward_type && (
                <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded-full font-medium border border-blue-500/50 drop-shadow-lg">
                  {getTypeLabel(reward.reward_type)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 text-right ml-4">
          <div className={`text-2xl font-bold drop-shadow-lg ${isSpend ? 'text-red-400' : 'text-green-400'}`}>
            {isSpend ? '-' : '+'}{pointsSpent.toLocaleString()}
          </div>
          <div className="text-xs text-gray-300 mt-1 drop-shadow-md">Points</div>
          {typeof record.points_after !== 'undefined' && (
            <div className="text-xs text-gray-400 mt-1 drop-shadow-md">
              Balance: {Number(record.points_after).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * StatCard - 增强背景
 */
function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    blue: 'from-blue-500/30 to-cyan-500/30 border-blue-500/50',
    orange: 'from-orange-500/30 to-amber-500/30 border-orange-500/50',
    green: 'from-green-500/30 to-emerald-500/30 border-green-500/50',
  };

  const iconColors = {
    blue: 'text-blue-300',
    orange: 'text-orange-300',
    green: 'text-green-300',
  };

  return (
    <div className={`bg-gradient-to-br bg-black/60 backdrop-blur-md p-5 rounded-xl border-2 ${colorClasses[color]} shadow-2xl`}>
      <Icon className={`w-8 h-8 ${iconColors[color]} mb-3 drop-shadow-lg`} />
      <p className="text-sm text-gray-200 mb-1 drop-shadow-md">{label}</p>
      <p className="text-3xl font-bold text-white drop-shadow-lg">{value}</p>
    </div>
  );
}

/**
 * QuickLink - 增强背景
 */
function QuickLink({ href, icon: Icon, label, color }) {
  const colorClasses = {
    purple: 'bg-black/60 text-purple-300 hover:bg-black/80 border-purple-500/50',
    blue: 'bg-black/60 text-blue-300 hover:bg-black/80 border-blue-500/50',
    green: 'bg-black/60 text-green-300 hover:bg-black/80 border-green-500/50',
  };

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 p-4 rounded-xl border-2 font-semibold
        transition-all hover:scale-105 hover:shadow-xl backdrop-blur-sm shadow-lg
        ${colorClasses[color]}
      `}
    >
      <Icon className="w-6 h-6 drop-shadow-lg" />
      <span className="drop-shadow-lg">{label}</span>
    </Link>
  );
}

/**
 * EmptyState - 增强背景
 */
function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-24 h-24 mx-auto mb-6 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-xl">
        <History className="w-12 h-12 text-gray-300 drop-shadow-lg" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
        No Purchase Records Yet
      </h3>
      <p className="text-gray-200 mb-6 drop-shadow-md">
        Visit the reward shop and get something you like!
      </p>
      <Link
        href={route('student.rewards.index')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-2xl border border-blue-400/50"
      >
        <ShoppingBag className="w-5 h-5 drop-shadow-lg" />
        <span className="drop-shadow-lg">Go to Shop</span>
      </Link>
    </div>
  );
}

/**
 * Get reward type label
 */
function getTypeLabel(type) {
  const labels = {
    avatar_frame: 'Avatar Frame',
    profile_background: 'Profile Background',
    badge: 'Badge',
    title: 'Title',
    theme: 'Theme',
    effect: 'Effect',
  };
  return labels[type] || type;
}