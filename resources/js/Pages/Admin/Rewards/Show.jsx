// resources/js/Pages/Admin/Rewards/Show.jsx
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Power,
  Package,
  Coins,
  Users,
  Calendar,
  ShoppingCart,
  Award,
  Info,
  TrendingUp,
  Activity,
  Eye,
  Sparkles,
} from 'lucide-react';

// Import your components
import RewardPreviewCard from './Components/Preview/RewardPreviewCard';
import BadgeDisplay from '@/Components/Rewards/Badge/BadgeDisplay';
import TitleDisplay from '@/Components/Rewards/Title/TitleDisplay';

export default function ShowReward({ auth, reward, distribution_stats }) {
  const [isDeleting, setIsDeleting] = useState(false);

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
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', 
      border: 'border-gray-300 dark:border-gray-600',
      gradient: 'from-gray-400 to-gray-600',
      icon: '⚪', 
      label: 'Common'
    },
    rare: { 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', 
      border: 'border-blue-300 dark:border-blue-600',
      gradient: 'from-blue-400 to-blue-600',
      icon: '💙', 
      label: 'Rare'
    },
    epic: { 
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', 
      border: 'border-purple-300 dark:border-purple-600',
      gradient: 'from-purple-400 to-purple-600',
      icon: '💜', 
      label: 'Epic'
    },
    legendary: { 
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', 
      border: 'border-yellow-300 dark:border-yellow-600',
      gradient: 'from-yellow-400 to-orange-500',
      icon: '🌟', 
      label: 'Legendary'
    },
  };

  const rarityInfo = rarityConfig[reward.rarity] || rarityConfig.common;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Delete handler
  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete the reward "${reward.name}"? This action cannot be undone.`)) return;
    
    setIsDeleting(true);
    router.delete(`/admin/rewards/${reward.reward_id}`, {
      preserveScroll: true,
      onSuccess: () => {
        console.log('✅ Deletion successful');
      },
      onError: (errors) => {
        console.error('❌ Deletion failed:', errors);
        alert('Deletion failed: ' + (errors?.error || 'Please try again later'));
        setIsDeleting(false);
      },
    });
  };

  // Toggle active status
  const handleToggleActive = () => {
    router.post(`/admin/rewards/${reward.reward_id}/toggle-active`, {}, {
      preserveScroll: true,
      onError: (errors) => {
        alert('Operation failed, please try again later');
        console.error(errors);
      }
    });
  };


const getPreviewData = () => {
  let parsedMetadata = null;
  
  // ✅ 修复：正确解析 metadata
  if (reward.metadata) {
    try {
      // 如果是字符串，解析它
      if (typeof reward.metadata === 'string') {
        parsedMetadata = JSON.parse(reward.metadata);
        console.log('📦 [Show] Parsed metadata from string:', parsedMetadata);
      } else {
        // 如果已经是对象，直接使用
        parsedMetadata = reward.metadata;
        console.log('📦 [Show] Metadata is already object:', parsedMetadata);
      }
    } catch (error) {
      console.error('❌ [Show] Failed to parse metadata:', error);
      console.error('❌ [Show] Raw metadata:', reward.metadata);
      parsedMetadata = {};
    }
  } else {
    parsedMetadata = {};
  }

  console.log('🔍 [Show] Final parsed metadata:', parsedMetadata);
  console.log('🔍 [Show] Reward type:', reward.reward_type);

  const formData = {
    name: reward.name,
    description: reward.description,
    reward_type: reward.reward_type,
    rarity: reward.rarity,
    point_cost: reward.point_cost,
    stock_quantity: reward.stock_quantity,
    max_owned: reward.max_owned,
    is_active: reward.is_active,
  };

  let avatarFrameData = null;
  let backgroundData = null;
  let badgeData = null;
  let titleConfig = null;

  if (reward.reward_type === 'avatar_frame') {
    avatarFrameData = {
      url: reward.image_url,
      file: null,
      info: parsedMetadata?.frame_dimensions || {},
      config: parsedMetadata || {},
    };
    console.log('🖼️ [Show] Avatar frame data:', avatarFrameData);
  } else if (reward.reward_type === 'profile_background') {
    // ✅ 关键修复：兼容新旧两种格式
    let effects = null;
    
    // 新格式：直接有 effects 字段
    if (parsedMetadata?.effects) {
      effects = parsedMetadata.effects;
      console.log('✅ [Show] Using NEW format - effects found:', effects);
    } 
    // 旧格式：需要从 metadata 中转换
    else if (parsedMetadata?.animated !== undefined) {
      console.log('⚠️ [Show] Detected OLD format - converting to new format');
      
      // 从旧格式转换为新格式
      effects = {
        basic: {
          blur: parsedMetadata.blur || 0,
          opacity: parsedMetadata.opacity || 1,
        },
        transform: {
          scale: 1,
          positionX: 50,
          positionY: 50,
          objectFit: 'cover',
        },
        overlay: {
          color: parsedMetadata.overlay_color || '#000000',
          opacity: parsedMetadata.overlay_opacity || 0,
        },
        animation: {
          enabled: parsedMetadata.animated || false,
          type: parsedMetadata.animation_type || 'none',
          duration: parsedMetadata.animation_duration || 20,
          intensity: 1,
        },
        filters: parsedMetadata.filters || {
          blur: 0,
          brightness: 100,
          contrast: 100,
          grayscale: 0,
          saturate: 100,
        },
        layers: {
          particles: parsedMetadata.particles_enabled || false,
          particleColor: parsedMetadata.particle_color || '#ffffff',
          particleCount: parsedMetadata.particle_count || 50,
          particleSpeed: 5,
          badge: parsedMetadata.badge_enabled || false,
          badgePosition: parsedMetadata.badge_position || 'top-right',
        },
      };
      
      console.log('✅ [Show] Converted OLD format to NEW format:', effects);
    }
    // 完全没有配置，使用默认值
    else {
      console.log('⚠️ [Show] No effects found, using defaults');
      effects = {
        basic: { blur: 0, opacity: 1 },
        transform: { scale: 1, positionX: 50, positionY: 50, objectFit: 'cover' },
        overlay: { color: '#000000', opacity: 0 },
        animation: { enabled: false, type: 'none', duration: 20, intensity: 1 },
        filters: { blur: 0, brightness: 100, contrast: 100, grayscale: 0, saturate: 100 },
        layers: {
          particles: false,
          particleColor: '#ffffff',
          particleCount: 50,
          particleSpeed: 5,
          badge: false,
          badgePosition: 'top-right',
        },
      };
    }

    console.log('🎨 [Show] Final background effects:', effects);
    console.log('🎬 [Show] Animation state:', effects.animation);

    backgroundData = {
      type: parsedMetadata?.background_type || 'image',
      url: reward.image_url,
      file: null,
      gradient: parsedMetadata?.gradient || {},
      effects: effects,
    };
    
    console.log('✅ [Show] Final background data:', backgroundData);
  } else if (reward.reward_type === 'badge') {
    badgeData = {
      url: reward.image_url,
      file: null,
      info: parsedMetadata?.icon_dimensions || {},
      config: {
        shape: parsedMetadata?.shape || 'circle',
        glowColor: parsedMetadata?.glow_color || null,
        backgroundColor: parsedMetadata?.background_color || null,
      },
    };
    console.log('🏅 [Show] Badge data:', badgeData);
  } else if (reward.reward_type === 'title') {
    titleConfig = {
      title_text: parsedMetadata?.title_text || reward.name || 'Untitled',
      text_color: parsedMetadata?.text_color || '#3B82F6',
      gradient: parsedMetadata?.gradient || { 
        enabled: false, 
        from: '#3B82F6', 
        to: '#8B5CF6' 
      },
      effects: parsedMetadata?.effects || { 
        glow: false, 
        sparkle: false, 
        wave: false,
        neon: false,
        rainbow: false,
        pulse: false,
        rotate_glow: false,
        shadow_stack: false,
        three_d: false,
        glitter: false,
        shine: false,
        confetti: false,
        particles: false,
        shimmer: false,
        fireworks: false,
        bubbles: false,
      },
      icon: parsedMetadata?.icon || 'none',
    };
    console.log('🏆 [Show] Title config:', titleConfig);
  }

  return {
    formData,
    avatarFrameData,
    backgroundData,
    badgeData,
    titleConfig,
  };
};

  const previewData = getPreviewData();

  // Stats calculation
  const totalDistributed = distribution_stats?.total_distributed || 0;
  const bySystem = distribution_stats?.by_system || 0;
  const byAdmin = distribution_stats?.by_admin || 0;
  const byStudent = distribution_stats?.by_student || 0;

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/rewards"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white dark:text-gray-400 dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {reward.name}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {rewardTypeLabel[reward.reward_type]} • {rarityInfo.label}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleActive}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                reward.is_active
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                  : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border border-gray-500/30'
              }`}
            >
              <Power className="h-4 w-4" />
              {reward.is_active ? 'Active' : 'Disabled'}
            </button>
            
            <Link
              href={`/admin/rewards/${reward.reward_id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 border border-red-500/30 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      }
    >
      <Head title={`${reward.name} - Reward Details`} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-blue-200/50 dark:border-blue-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalDistributed}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Distributed</p>
        </div>

        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-green-200/50 dark:border-green-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{bySystem}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">System Issued</p>
        </div>

        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-200/50 dark:border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{byAdmin}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Admin Issued</p>
        </div>

        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-orange-200/50 dark:border-orange-500/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{byStudent}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Student Purchases</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Reward Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Reward Info Card */}
          <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl border-4 ${rarityInfo.border} overflow-hidden`}>
            {/* Rarity Header */}
            <div className={`bg-gradient-to-r ${rarityInfo.gradient} p-4 text-center`}>
              <div className="text-4xl mb-2">{rarityInfo.icon}</div>
              <h3 className="text-white font-bold text-lg">{rarityInfo.label}</h3>
            </div>

            {/* Reward Image */}
            {reward.image_url ? (
              <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
                <img
                  src={reward.image_url}
                  alt={reward.name}
                  className="w-full h-48 object-contain drop-shadow-2xl"
                />
              </div>
            ) : (
              <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
                <div className="w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-slate-700 rounded-xl">
                  <Package className="h-24 w-24 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{reward.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{reward.description}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {rewardTypeLabel[reward.reward_type]}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${rarityInfo.color}`}>
                  {rarityInfo.icon} {rarityInfo.label}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Point Cost
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reward.point_cost}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Stock Quantity
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {reward.stock_quantity < 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">Unlimited</span>
                    ) : (
                      <span className={reward.stock_quantity === 0 ? 'text-red-600 dark:text-red-400' : ''}>
                        {reward.stock_quantity}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Purchase Limit
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {reward.max_owned < 0 ? 'Unlimited' : `${reward.max_owned} items`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Information */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 dark:border-purple-500/20 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Time Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Created At</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(reward.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Last Updated</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(reward.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Preview and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Area */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-purple-500/20 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Reward Preview
            </h3>

            <RewardPreviewCard
              formData={previewData.formData}
              avatarFrameData={previewData.avatarFrameData}
              backgroundData={previewData.backgroundData}
              badgeData={previewData.badgeData}
              titleConfig={previewData.titleConfig}
              rarityConfig={rarityConfig}
            />
          </div>

          {/* Metadata */}
          {reward.metadata && Object.keys(reward.metadata).length > 0 && (
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-purple-500/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                Metadata Configuration
              </h3>
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 font-mono text-sm overflow-x-auto border border-gray-200 dark:border-gray-700">
                <pre className="text-gray-800 dark:text-gray-300">
                  {JSON.stringify(reward.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          {reward.apply_instructions && (
            <div className="bg-blue-50/90 dark:bg-blue-900/20 backdrop-blur-xl rounded-2xl border-2 border-blue-200 dark:border-blue-500/30 p-6">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Usage Instructions
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{reward.apply_instructions}</p>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}