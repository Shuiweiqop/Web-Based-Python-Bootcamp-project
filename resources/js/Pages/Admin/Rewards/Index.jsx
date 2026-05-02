// resources/js/Pages/Admin/Rewards/Index.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { safeRoute } from '@/utils/routeHelpers';
import { cn } from '@/utils/cn';
import {
  Plus,
  Search,
  Edit,
  Power,
  Package,
  X,
  Filter,
  Eye,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function RewardIndex({ auth, rewards, filters }) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [isDark, setIsDark] = useState(true);
  const searchTimeoutRef = useRef(null);

  const rewardTypeLabel = {
    avatar_frame: 'Avatar Frame',
    profile_background: 'Profile Background',
    badge: 'Badge/Achievement',
    title: 'Title',
    theme: 'UI Theme',
    effect: 'Effect',
  };

  const rarityConfig = {
    common: { 
      color: isDark ? 'from-gray-500/20 to-slate-500/20' : 'from-gray-100 to-slate-100',
      text: isDark ? 'text-gray-300' : 'text-gray-800',
      border: isDark ? 'border-gray-500/30' : 'border-gray-300',
      icon: '⚪', 
      label: 'Common' 
    },
    rare: { 
      color: isDark ? 'from-blue-500/20 to-cyan-500/20' : 'from-blue-100 to-cyan-100',
      text: isDark ? 'text-blue-300' : 'text-blue-800',
      border: isDark ? 'border-blue-500/30' : 'border-blue-300',
      icon: '💙', 
      label: 'Rare' 
    },
    epic: { 
      color: isDark ? 'from-purple-500/20 to-pink-500/20' : 'from-purple-100 to-pink-100',
      text: isDark ? 'text-purple-300' : 'text-purple-800',
      border: isDark ? 'border-purple-500/30' : 'border-purple-300',
      icon: '💜', 
      label: 'Epic' 
    },
    legendary: { 
      color: isDark ? 'from-yellow-500/20 to-amber-500/20' : 'from-yellow-100 to-amber-100',
      text: isDark ? 'text-yellow-300' : 'text-yellow-800',
      border: isDark ? 'border-yellow-500/30' : 'border-yellow-300',
      icon: '🌟', 
      label: 'Legendary' 
    },
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm !== (filters?.search || '')) {
        router.get('/admin/rewards', {
          ...filters,
          search: searchTerm || undefined,
        }, {
          preserveState: true,
          preserveScroll: true,
        });
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters };
    
    if (value === 'all' || value === '') {
      delete newFilters[filterName];
    } else {
      newFilters[filterName] = value;
    }

    router.get('/admin/rewards', newFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    router.get('/admin/rewards', {}, {
      preserveState: true,
    });
  };

  const handleToggleActive = (rewardId) => {
    const toggleUrl = safeRoute('admin.rewards.toggleActive', rewardId);
    
    router.post(toggleUrl, {}, {
      preserveScroll: true,
      onError: (errors) => {
        alert('Operation failed, please try again later');
        console.error(errors);
      }
    });
  };

  const getRarityConfig = (rarity) => rarityConfig[rarity] || rarityConfig.common;

  const hasActiveFilters = () => {
    return searchTerm || 
           (filters?.reward_type && filters.reward_type !== 'all') ||
           (filters?.rarity && filters.rarity !== 'all') ||
           (filters?.is_active && filters.is_active !== 'all');
  };

  const stats = {
    total: rewards?.total || 0,
    active: rewards?.data?.filter(r => r.is_active)?.length || 0,
    outOfStock: rewards?.data?.filter(r => r.stock_quantity === 0)?.length || 0,
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Reward Management
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Manage and configure rewards for your students
            </p>
          </div>
          <Link
            href="/admin/rewards/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 hover-lift ripple-effect button-press-effect"
          >
            <Plus className="h-5 w-5" />
            Create Reward
          </Link>
        </div>
      }
    >
      <Head title="Reward Management" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { 
                label: 'Total Rewards', 
                value: stats.total, 
                icon: Package, 
                gradient: 'from-purple-500/20 to-cyan-500/20',
                iconColor: isDark ? 'text-purple-400' : 'text-purple-600',
                border: isDark ? 'border-purple-500/20' : 'border-purple-200/50',
              },
              { 
                label: 'Active Rewards', 
                value: stats.active, 
                icon: Sparkles, 
                gradient: 'from-emerald-500/20 to-teal-500/20',
                iconColor: isDark ? 'text-emerald-400' : 'text-emerald-600',
                border: isDark ? 'border-emerald-500/20' : 'border-emerald-200/50',
              },
              { 
                label: 'Out of Stock', 
                value: stats.outOfStock, 
                icon: TrendingUp, 
                gradient: 'from-red-500/20 to-orange-500/20',
                iconColor: isDark ? 'text-red-400' : 'text-red-600',
                border: isDark ? 'border-red-500/20' : 'border-red-200/50',
              },
            ].map((stat, index) => (
              <div 
                key={index}
                className={cn(
                  "rounded-2xl border p-6 card-hover-effect shadow-sm transition-all duration-200",
                  isDark
                    ? "bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 shadow-slate-950/40"
                    : "bg-gradient-to-br from-white to-slate-50 border-gray-200 shadow-slate-200/80",
                  stat.border
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm font-semibold", isDark ? "text-slate-400" : "text-gray-600")}>
                      {stat.label}
                    </p>
                    <p className={cn("text-4xl font-bold mt-2", isDark ? "text-white" : "text-gray-900")}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center shadow-lg",
                    `bg-gradient-to-br ${stat.gradient}`
                  )}>
                    <stat.icon className={cn("h-7 w-7", stat.iconColor)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className={cn(
            "rounded-2xl border p-6 mb-8 shadow-sm",
            isDark
              ? "bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 shadow-slate-950/30"
              : "bg-gradient-to-br from-white to-slate-50 border-gray-200 shadow-slate-200/80"
          )}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn("text-lg font-bold flex items-center gap-2", isDark ? "text-white" : "text-gray-900")}>
                <Filter className={cn("h-5 w-5", isDark ? "text-purple-400" : "text-purple-600")} />
                Filters
              </h2>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all shadow-lg ripple-effect button-press-effect hover-lift",
                    isDark
                      ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
                      : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                  )}
                >
                  <X className="h-4 w-4" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className={cn("block text-sm font-bold mb-2", isDark ? "text-slate-300" : "text-gray-700")}>
                  <Search className="inline h-4 w-4 mr-1" />
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search reward name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(
                      "w-full px-4 py-2.5 pr-10 rounded-lg border-2 transition-all outline-none",
                      isDark
                        ? "bg-slate-800 border-purple-500/30 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    )}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors",
                        isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Reward Type */}
              <div>
                <label className={cn("block text-sm font-bold mb-2", isDark ? "text-slate-300" : "text-gray-700")}>
                  Reward Type
                </label>
                <select
                  value={filters?.reward_type || 'all'}
                  onChange={(e) => handleFilterChange('reward_type', e.target.value)}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border-2 transition-all outline-none cursor-pointer",
                    isDark
                      ? "bg-slate-800 border-purple-500/30 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                      : "bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  )}
                >
                  <option value="all">All Types</option>
                  {Object.entries(rewardTypeLabel).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Rarity */}
              <div>
                <label className={cn("block text-sm font-bold mb-2", isDark ? "text-slate-300" : "text-gray-700")}>
                  Rarity
                </label>
                <select
                  value={filters?.rarity || 'all'}
                  onChange={(e) => handleFilterChange('rarity', e.target.value)}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border-2 transition-all outline-none cursor-pointer",
                    isDark
                      ? "bg-slate-800 border-purple-500/30 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                      : "bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  )}
                >
                  <option value="all">All Rarities</option>
                  {Object.entries(rarityConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.icon} {config.label}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className={cn("block text-sm font-bold mb-2", isDark ? "text-slate-300" : "text-gray-700")}>
                  <Power className="inline h-4 w-4 mr-1" />
                  Status
                </label>
                <select
                  value={filters?.is_active || 'all'}
                  onChange={(e) => handleFilterChange('is_active', e.target.value)}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-lg border-2 transition-all outline-none cursor-pointer",
                    isDark
                      ? "bg-slate-800 border-purple-500/30 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                      : "bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  )}
                >
                  <option value="all">All</option>
                  <option value="1">Active</option>
                  <option value="0">Disabled</option>
                </select>
              </div>
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters() && (
              <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-2">
                {searchTerm && (
                  <FilterTag
                    label={`Search: ${searchTerm}`}
                    onRemove={() => setSearchTerm('')}
                    isDark={isDark}
                    color="purple"
                  />
                )}
                {filters?.reward_type && filters.reward_type !== 'all' && (
                  <FilterTag
                    label={`Type: ${rewardTypeLabel[filters.reward_type]}`}
                    onRemove={() => handleFilterChange('reward_type', 'all')}
                    isDark={isDark}
                    color="indigo"
                  />
                )}
                {filters?.rarity && filters.rarity !== 'all' && (
                  <FilterTag
                    label={`Rarity: ${rarityConfig[filters.rarity].label}`}
                    onRemove={() => handleFilterChange('rarity', 'all')}
                    isDark={isDark}
                    color="purple"
                  />
                )}
                {filters?.is_active && filters.is_active !== 'all' && (
                  <FilterTag
                    label={`Status: ${filters.is_active === '1' ? 'Active' : 'Disabled'}`}
                    onRemove={() => handleFilterChange('is_active', 'all')}
                    isDark={isDark}
                    color="emerald"
                  />
                )}
              </div>
            )}
          </div>

          {/* Rewards Table */}
          <div className={cn(
            "rounded-2xl border overflow-hidden shadow-sm",
            isDark
              ? "bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 shadow-slate-950/30"
              : "bg-gradient-to-br from-white to-slate-50 border-gray-200 shadow-slate-200/80"
          )}>
            {rewards?.data && rewards.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={cn(
                    "border-b-2 bg-gradient-to-r animated-gradient",
                    isDark 
                      ? "from-purple-900/30 to-cyan-900/30 border-purple-500/20" 
                      : "from-purple-50 to-cyan-50 border-gray-200"
                  )}>
                    <tr>
                      <th className={cn("px-6 py-4 text-left text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                        Reward Name
                      </th>
                      <th className={cn("px-6 py-4 text-left text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                        Type
                      </th>
                      <th className={cn("px-6 py-4 text-left text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                        Rarity
                      </th>
                      <th className={cn("px-6 py-4 text-center text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                        Point Cost
                      </th>
                      <th className={cn("px-6 py-4 text-center text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                        <Package className="inline h-4 w-4 mr-1" />Stock
                      </th>
                      <th className={cn("px-6 py-4 text-center text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                        Status
                      </th>
                      <th className={cn("px-6 py-4 text-center text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", isDark ? "divide-gray-700" : "divide-gray-200")}>
                    {rewards.data.map((reward) => {
                      const rarityInfo = getRarityConfig(reward.rarity);
                      return (
                        <tr 
                          key={reward.reward_id} 
                          className={cn(
                            "transition-colors",
                            isDark ? "hover:bg-purple-500/10" : "hover:bg-purple-50/50"
                          )}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {reward.image_url && (
                                <img 
                                  src={reward.image_url} 
                                  alt={reward.name} 
                                  className={cn(
                                    "w-12 h-12 rounded-xl object-cover border-2 shadow-lg",
                                    isDark ? "border-purple-500/30" : "border-purple-200"
                                  )}
                                />
                              )}
                              <div>
                                <p className={cn("font-bold", isDark ? "text-white" : "text-gray-900")}>
                                  {reward.name}
                                </p>
                                <p className={cn("text-xs line-clamp-1", isDark ? "text-slate-400" : "text-gray-500")}>
                                  {reward.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-gray-700")}>
                              {rewardTypeLabel[reward.reward_type]}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg border",
                              `bg-gradient-to-r ${rarityInfo.color} ${rarityInfo.text} ${rarityInfo.border}`
                            )}>
                              {rarityInfo.icon} {rarityInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={cn(
                              "inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg",
                              isDark 
                                ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-gradient-to-r from-purple-100 to-cyan-100 text-purple-700 border border-purple-200"
                            )}>
                              {reward.point_cost}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-bold">
                              {reward.stock_quantity < 0 ? (
                                <span className={cn(isDark ? "text-emerald-400" : "text-emerald-600")}>
                                  ∞ Unlimited
                                </span>
                              ) : (
                                <>
                                  <span className={isDark ? "text-white" : "text-gray-900"}>
                                    {reward.stock_quantity}
                                  </span>
                                  {reward.stock_quantity === 0 && (
                                    <span className={cn("ml-2 text-xs", isDark ? "text-red-400" : "text-red-600")}>
                                      Out of Stock
                                    </span>
                                  )}
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggleActive(reward.reward_id)}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-lg ripple-effect button-press-effect",
                                reward.is_active
                                  ? isDark
                                    ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200"
                                  : isDark
                                    ? "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                              )}
                            >
                              <Power className="h-4 w-4" />
                              {reward.is_active ? 'Active' : 'Disabled'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                href={`/admin/rewards/${reward.reward_id}`}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg ripple-effect button-press-effect hover-lift",
                                  isDark
                                    ? "bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30"
                                    : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                                )}
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Link>

                              <Link
                                href={`/admin/rewards/${reward.reward_id}/edit`}
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg ripple-effect button-press-effect hover-lift",
                                  isDark
                                    ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30"
                                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200"
                                )}
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyStateRewards 
                hasFilters={hasActiveFilters()} 
                onClearFilters={clearFilters}
                isDark={isDark}
              />
            )}
          </div>

          {/* Pagination */}
          {rewards?.links && rewards.links.length > 3 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {rewards.links.map((link, index) => {
                if (!link.url) {
                  return (
                    <button
                      key={index}
                      disabled
                      className={cn(
                        "px-4 py-2 rounded-lg font-semibold cursor-not-allowed",
                        isDark ? "bg-slate-800 text-slate-600" : "bg-gray-100 text-gray-400"
                      )}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  );
                }

                return (
                  <Link
                    key={index}
                    href={link.url}
                    className={cn(
                      "px-4 py-2 rounded-lg font-semibold transition-all ripple-effect button-press-effect",
                      link.active
                        ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/50 scale-110 animate-glowPulse"
                        : isDark
                          ? "bg-slate-800 border-2 border-white/10 text-slate-300 hover:border-purple-500/50 hover-lift"
                          : "bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-500 hover-lift"
                    )}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

// Filter Tag Component
function FilterTag({ label, onRemove, isDark, color }) {
  const colorClasses = {
    purple: isDark ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200',
    indigo: isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-200',
    emerald: isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border shadow-lg animate-bounceIn",
      colorClasses[color] || colorClasses.purple
    )}>
      {label}
      <button
        onClick={onRemove}
        className={cn(
          "p-0.5 rounded-full transition-all ripple-effect",
          isDark ? "hover:bg-white/10" : "hover:bg-black/10"
        )}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// Empty State Component
function EmptyStateRewards({ hasFilters, onClearFilters, isDark }) {
  return (
    <div className="p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className={cn(
            "absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse-slow",
            isDark ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-gradient-to-r from-purple-300 to-cyan-300"
          )} />
          <div className={cn(
            "relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl",
            isDark
              ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border-2 border-purple-500/50"
              : "bg-gradient-to-br from-purple-200 to-cyan-200 border-2 border-purple-300"
          )}>
            <Package className={cn("h-10 w-10", isDark ? "text-purple-400" : "text-purple-600")} />
          </div>
        </div>
      </div>

      <p className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-gray-900")}>
        {hasFilters ? 'No rewards found matching the criteria' : 'No rewards yet'}
      </p>

      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/50 ripple-effect button-press-effect hover-lift"
        >
          <X className="h-5 w-5" />
          Clear Filters
        </button>
      ) : (
        <Link
          href="/admin/rewards/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 ripple-effect button-press-effect hover-lift"
        >
          <Plus className="h-5 w-5" />
          Create First Reward
        </Link>
      )}
    </div>
  );
}
