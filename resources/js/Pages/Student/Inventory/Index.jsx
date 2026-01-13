import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import InventoryGrid from './Components/InventoryGrid';
import { 
  Package, 
  Award,
  Grid3x3,
  Filter,
  X,
  Grid,
  List,
  ChevronDown,
  Zap,
  Trophy,
  Star,
  Sparkles
} from 'lucide-react';

/**
 * Student Inventory - fun enhanced version
 * Adds animations, sound/visual cues, achievement elements, etc.
 */
export default function InventoryIndex({ 
  inventory = [], 
  currentPoints = 0,
  stats = {},
  rewardTypes = {},
  filters = {}
}) {
  // Safe stats
  const safeStats = {
    total_rewards: stats?.total_rewards ?? 0,
    equipped_count: stats?.equipped_count ?? 0,
    unique_rewards: stats?.unique_rewards ?? 0,
  };

  // States
  const [selectedType, setSelectedType] = useState(filters.type || 'all');
  const [equippedFilter, setEquippedFilter] = useState(filters.equipped || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // ✨ Fun features state
  const [recentlyEquipped, setRecentlyEquipped] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [floatingPoints, setFloatingPoints] = useState([]);
  const [shakeCard, setShakeCard] = useState(null);

  // ✨ Debug logs + equip animation trigger
  useEffect(() => {
    console.log('📦 Inventory Props:', { 
      inventoryCount: inventory?.length, 
      stats, 
      currentPoints 
    });

    // Check for newly equipped item
    const equipped = inventory?.filter(item => item.is_equipped);
    if (equipped && equipped.length > 0) {
      const latest = equipped[equipped.length - 1];
      if (latest && (!recentlyEquipped || latest.inventory_id !== recentlyEquipped?.inventory_id)) {
        triggerEquipAnimation(latest);
      }
    }
  }, [inventory]);

  // ✨ Equip success animation
  const triggerEquipAnimation = (item) => {
    setRecentlyEquipped(item);
    setShowConfetti(true);
    
    // hide effects after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
      setRecentlyEquipped(null);
    }, 3000);
  };

  // ✨ Floating points animation
  const addFloatingPoint = (value, x, y) => {
    const id = Date.now();
    setFloatingPoints(prev => [...prev, { id, value, x, y }]);
    setTimeout(() => {
      setFloatingPoints(prev => prev.filter(p => p.id !== id));
    }, 2000);
  };

  // ✨ Collection progress calculation
  const collectionProgress = {
    percentage: Math.round((safeStats.unique_rewards / Math.max(inventory?.length || 1, 10)) * 100),
    isComplete: safeStats.unique_rewards >= 10,
  };

  // Filter actions
  const applyFilters = () => {
    router.get(route('student.inventory.index'), {
      type: selectedType !== 'all' ? selectedType : undefined,
      equipped: equippedFilter !== 'all' ? equippedFilter : undefined,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const resetFilters = () => {
    setSelectedType('all');
    setEquippedFilter('all');
    router.get(route('student.inventory.index'));
  };

  return (
    <StudentLayout>
      <Head title="My Inventory" />

      {/* ✨ Confetti effect */}
      {showConfetti && <ConfettiEffect />}

      {/* ✨ Floating points */}
      {floatingPoints.map(point => (
        <FloatingPoint key={point.id} {...point} />
      ))}

      <div className="space-y-6">
        {/* ✨ Equipped banner */}
        {recentlyEquipped && (
          <div className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl p-4 shadow-2xl border-2 border-white animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">Equipped!</h3>
                <p className="text-white/90 text-sm">
                  You equipped <span className="font-bold">{recentlyEquipped.name}</span>
                </p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-300 animate-spin-slow" />
            </div>
          </div>
        )}

        {/* ✨ Enhanced stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            icon={Package}
            label="Total Rewards"
            value={safeStats.total_rewards}
            color="blue"
            sparkle={safeStats.total_rewards > 0}
          />
          
          <StatCard
            icon={Award}
            label="Equipped"
            value={safeStats.equipped_count}
            color="green"
            sparkle={safeStats.equipped_count > 0}
            pulse={safeStats.equipped_count > 3}
          />
          
          <StatCard
            icon={Grid3x3}
            label="Unique Rewards"
            value={safeStats.unique_rewards}
            color="purple"
            sparkle={safeStats.unique_rewards >= 5}
            showProgress={true}
            progress={collectionProgress.percentage}
          />
        </div>

        {/* ✨ Collection progress bar */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-gray-900">Collection Progress</h3>
            </div>
            <span className="text-sm font-bold text-blue-600">
              {safeStats.unique_rewards} / {Math.max(inventory?.length || 1, 10)}
            </span>
          </div>
          
          <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${collectionProgress.percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer" />
            </div>
          </div>
          
          {collectionProgress.isComplete && (
            <div className="mt-3 flex items-center gap-2 text-sm text-yellow-600 font-medium">
              <Star className="w-4 h-4 animate-spin-slow" />
              Congratulations! You've unlocked the Collector achievement!
            </div>
          )}
        </div>

        {/* Filters bar */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 hover:scale-105"
            >
              <Filter className="w-5 h-5" />
              Filter Options
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-md text-blue-600 scale-110'
                    : 'text-gray-600 hover:text-gray-900 hover:scale-105'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white shadow-md text-blue-600 scale-110'
                    : 'text-gray-600 hover:text-gray-900 hover:scale-105'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="border-t-2 border-gray-100 pt-4 animate-slideDown">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reward Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all bg-white hover:border-gray-300"
                  >
                    <option value="all">All Types</option>
                    {Object.entries(rewardTypes).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Equipped Status
                  </label>
                  <select
                    value={equippedFilter}
                    onChange={(e) => setEquippedFilter(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all bg-white hover:border-gray-300"
                  >
                    <option value="all">All</option>
                    <option value="true">Equipped</option>
                    <option value="false">Unequipped</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    onClick={applyFilters}
                    className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    Apply
                  </button>
                  {(selectedType !== 'all' || equippedFilter !== 'all') && (
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all hover:scale-105 active:scale-95"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {(selectedType !== 'all' || equippedFilter !== 'all') && (
                <div className="flex flex-wrap gap-2 animate-fadeIn">
                  <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
                  {selectedType !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm animate-bounceIn">
                      {rewardTypes[selectedType]}
                      <button onClick={() => setSelectedType('all')} className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {equippedFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm animate-bounceIn">
                      {equippedFilter === 'true' ? '✅ Equipped' : '⭕ Unequipped'}
                      <button onClick={() => setEquippedFilter('all')} className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inventory grid */}
        <InventoryGrid
          inventory={inventory}
          viewMode={viewMode}
          rewardTypes={rewardTypes}
          onResetFilters={resetFilters}
        />
      </div>
    </StudentLayout>
  );
}

/**
 * ✨ Enhanced Stat Card
 */
function StatCard({ icon: Icon, label, value, color, sparkle, pulse, showProgress, progress }) {
  const colorClasses = {
    blue: 'from-blue-400 to-blue-600 border-blue-200',
    green: 'from-green-400 to-green-600 border-green-200',
    purple: 'from-purple-400 to-purple-600 border-purple-200',
  };

  return (
    <div className={`
      bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl 
      border-2 ${colorClasses[color].split(' ')[1]}
      hover:border-opacity-100 transition-all duration-300
      hover:scale-105 hover:shadow-2xl
      ${pulse ? 'animate-pulse-slow' : ''}
      relative overflow-hidden
    `}>
      {sparkle && <SparkleEffect />}
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="text-sm text-gray-600 font-medium mb-1">{label}</div>
          <div className="text-3xl font-bold text-gray-900 animate-countUp">{value}</div>
          {showProgress && (
            <div className="text-xs text-gray-500 mt-1">{progress}% complete</div>
          )}
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}

/**
 * ✨ Confetti effect
 */
function ConfettiEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10%',
            backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][i % 5],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * ✨ Sparkle effect
 */
function SparkleEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-2 right-2 w-4 h-4">
        <Sparkles className="w-full h-full text-yellow-400 animate-ping" />
      </div>
      <div className="absolute bottom-2 left-2 w-3 h-3">
        <Sparkles className="w-full h-full text-blue-400 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * ✨ Floating points display
 */
function FloatingPoint({ value, x, y }) {
  return (
    <div
      className="fixed z-50 pointer-events-none animate-floatUp"
      style={{ left: x, top: y }}
    >
      <div className="text-2xl font-bold text-green-500 drop-shadow-lg">
        +{value}
      </div>
    </div>
  );
}
