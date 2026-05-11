import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Save, Sparkles, ArrowLeft, Sun, Moon, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

// Components
import BasicInfo from './Components/RewardForm/BasicInfo';
import Economics from './Components/RewardForm/Economics';
import TypeConfig from './Components/RewardForm/TypeConfig';

// ✅ 导入 DEFAULT_EFFECTS
import { DEFAULT_EFFECTS } from '@/Components/Rewards/Background/BackgroundUpload/components/hooks';

export default function EditReward({ reward, rewardTypes, rarities }) {
  const [isDark, setIsDark] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: reward.name,
    description: reward.description,
    reward_type: reward.reward_type,
    rarity: reward.rarity,
    stock_quantity: reward.stock_quantity,
    point_cost: reward.point_cost,
    max_owned: reward.max_owned,
    apply_instructions: reward.apply_instructions || '',
    is_active: reward.is_active,
  });

  // Parse metadata
  const parsedMetadata = useMemo(() => {
    if (!reward.metadata) return {};
    try {
      return typeof reward.metadata === 'string' 
        ? JSON.parse(reward.metadata) 
        : reward.metadata;
    } catch (error) {
      console.error('Failed to parse metadata:', error);
      return {};
    }
  }, [reward.metadata]);

  // Type-specific data states
  const [avatarFrameData, setAvatarFrameData] = useState(
    reward.reward_type === 'avatar_frame' && reward.image_url
      ? { 
          url: reward.image_url, 
          file: null,
          info: reward.metadata?.frame_dimensions || {},
          config: reward.metadata || {},
        }
      : null
  );

  // ✅ 修复 backgroundData 初始化
  const [backgroundData, setBackgroundData] = useState(() => {
    if (reward.reward_type !== 'profile_background') return null;
    
    console.log('🎨 [Edit.jsx INIT] Starting background initialization');
    console.log('🎨 [Edit.jsx INIT] reward.metadata:', reward.metadata);
    
    // 解析 metadata
    let parsedMetadata = {};
    try {
      if (typeof reward.metadata === 'string') {
        parsedMetadata = JSON.parse(reward.metadata);
      } else if (reward.metadata && typeof reward.metadata === 'object') {
        parsedMetadata = reward.metadata;
      }
    } catch (error) {
      console.error('❌ [Edit.jsx INIT] Failed to parse metadata:', error);
    }
    
    console.log('🎨 [Edit.jsx INIT] parsedMetadata:', parsedMetadata);
    
    // 解析 effects
    let effects = parsedMetadata?.effects;
    
    console.log('🎨 [Edit.jsx INIT] Raw effects:', effects);
    console.log('🎨 [Edit.jsx INIT] Effects type:', Array.isArray(effects) ? 'array' : typeof effects);
    
    // ✅ 关键修复：验证 effects 是否为有效对象
    const isValidEffects = effects && 
                          typeof effects === 'object' && 
                          !Array.isArray(effects) && 
                          Object.keys(effects).length > 0;
    
    if (!isValidEffects) {
      console.warn('⚠️ [Edit.jsx INIT] Invalid effects detected, using DEFAULT_EFFECTS');
      console.log('⚠️ [Edit.jsx INIT] Original effects:', effects);
      console.log('⚠️ [Edit.jsx INIT] Is array?', Array.isArray(effects));
      console.log('⚠️ [Edit.jsx INIT] Keys:', effects ? Object.keys(effects) : 'null');
      effects = DEFAULT_EFFECTS;
    }
    
    console.log('✅ [Edit.jsx INIT] Final effects:', effects);
    console.log('✅ [Edit.jsx INIT] Animation state:', effects.animation);
    
    return {
      type: parsedMetadata?.background_type || 'image',
      url: reward.image_url,
      file: null,
      gradient: parsedMetadata?.gradient || {},
      effects: effects,
    };
  });

  const [badgeData, setBadgeData] = useState(
    reward.reward_type === 'badge' && reward.image_url
      ? {
          url: reward.image_url,
          file: null,
          info: reward.metadata?.icon_dimensions || {},
          config: {
            shape: reward.metadata?.shape || 'circle',
            glowColor: reward.metadata?.glow_color || null,
            backgroundColor: reward.metadata?.background_color || null,
          },
        }
      : null
  );

  const [titleConfig, setTitleConfig] = useState(
    reward.reward_type === 'title'
      ? {
          title_text: parsedMetadata?.title_text || reward.name || 'Untitled',
          text_color: parsedMetadata?.text_color || '#3B82F6',
          gradient: parsedMetadata?.gradient || { 
            enabled: false, 
            from: '#3B82F6', 
            to: '#8B5CF6' 
          },
          effects: parsedMetadata?.effects || {},
          icon: parsedMetadata?.icon || 'none',
        }
      : {}
  );

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keepExistingImage, setKeepExistingImage] = useState(true);

  // Event handlers
  const handleFormChange = ({ name, value }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTitleConfigChange = (key, value) => {
    setTitleConfig(prev => ({ ...prev, [key]: value }));
  };

  // ✅ 修复 handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrors({});

    const submitData = new FormData();
    submitData.append('_method', 'PUT');
    submitData.append('name', formData.name || '');
    submitData.append('description', formData.description || '');
    submitData.append('reward_type', formData.reward_type || '');
    submitData.append('rarity', formData.rarity || '');
    submitData.append('point_cost', String(formData.point_cost || 0));
    submitData.append('stock_quantity', String(formData.stock_quantity || 0));
    submitData.append('max_owned', String(formData.max_owned || -1));
    submitData.append('is_active', formData.is_active ? '1' : '0');
    submitData.append('apply_instructions', formData.apply_instructions || '');

    let metadata = {};
    let imageFile = null;

    switch (formData.reward_type) {
      case 'avatar_frame':
        if (avatarFrameData) {
          metadata = {
            frame_dimensions: {
              width: avatarFrameData.info?.width || 512,
              height: avatarFrameData.info?.height || 512,
            },
            animation: avatarFrameData.config?.animation || {},
          };
          if (avatarFrameData.file) imageFile = avatarFrameData.file;
        }
        break;
      
      case 'profile_background':
        if (backgroundData) {
          console.log('💾 [Edit.jsx SUBMIT] Processing profile_background');
          console.log('💾 [Edit.jsx SUBMIT] backgroundData:', backgroundData);
          console.log('💾 [Edit.jsx SUBMIT] backgroundData.effects:', backgroundData.effects);
          console.log('💾 [Edit.jsx SUBMIT] Is effects an array?', Array.isArray(backgroundData.effects));
          
          // ✅ 关键修复：验证 effects
          let effects = backgroundData.effects;
          
          // 如果 effects 无效（数组、空对象等），使用默认值
          if (!effects || Array.isArray(effects) || Object.keys(effects).length === 0) {
            console.warn('⚠️ [Edit.jsx SUBMIT] Invalid effects in backgroundData, using DEFAULT_EFFECTS');
            console.log('⚠️ [Edit.jsx SUBMIT] Original effects:', effects);
            effects = DEFAULT_EFFECTS;
          }
          
          console.log('💾 [Edit.jsx SUBMIT] Final effects to save:', effects);
          console.log('💾 [Edit.jsx SUBMIT] Animation state:', effects.animation);
          
          metadata = {
            background_type: backgroundData.type || 'image',
            effects: effects,  // ✅ 确保是对象
          };
          
          if (backgroundData.type === 'gradient') {
            metadata.gradient = backgroundData.gradient;
          } else if (backgroundData.file) {
            imageFile = backgroundData.file;
          }
          
          console.log('💾 [Edit.jsx SUBMIT] Final metadata:', metadata);
        }
        break;
      
      case 'badge':
        if (badgeData) {
          metadata = {
            shape: badgeData.config?.shape || 'circle',
            glow_color: badgeData.config?.glowColor || null,
            background_color: badgeData.config?.backgroundColor || null,
            icon_dimensions: {
              width: badgeData.info?.width || 256,
              height: badgeData.info?.height || 256,
            },
          };
          if (badgeData.file) imageFile = badgeData.file;
        }
        break;
      
      case 'title':
        metadata = {
          title_text: titleConfig.title_text || formData.name,
          text_color: titleConfig.text_color || '#3B82F6',
          gradient: titleConfig.gradient || { enabled: false, from: '#3B82F6', to: '#8B5CF6' },
          effects: titleConfig.effects || {},
          icon: titleConfig.icon || 'none',
        };
        break;
      
      default:
        metadata = reward.metadata || {};
        break;
    }

    console.log('💾 [Edit.jsx SUBMIT] Final metadata before JSON.stringify:', metadata);
    submitData.append('metadata', JSON.stringify(metadata));
    if (imageFile) submitData.append('reward_image', imageFile);

    const updateUrl = `/admin/rewards/${reward.reward_id}`;

    router.post(updateUrl, submitData, {
      preserveScroll: false,
      onError: (errors) => {
        console.error('❌ [Edit.jsx SUBMIT] Submit error:', errors);
        setErrors(errors);
        setIsSubmitting(false);
      },
      onSuccess: () => {
        console.log('✅ [Edit.jsx SUBMIT] Submit successful');
        setIsSubmitting(false);
      },
      onFinish: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <>
      <Head title={`Edit Reward - ${reward.name}`} />

      <div className={cn(
        "min-h-screen transition-colors duration-500",
        isDark ? "bg-slate-950" : "bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50"
      )}>
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
            </>
          )}
        </div>

        {/* Top Navigation Bar */}
        <header className={cn(
          "sticky top-0 z-30 backdrop-blur-xl border-b",
          isDark ? "bg-slate-900/50 border-white/10" : "bg-white/70 border-purple-200/50"
        )}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/rewards"
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    isDark 
                      ? "text-slate-300 hover:text-white hover:bg-white/10" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-purple-100"
                  )}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Rewards
                </Link>
                <div className={cn("h-6 w-px", isDark ? "bg-white/10" : "bg-purple-200")} />
                <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                  Edit Reward
                </h1>
              </div>
              
              <button
                onClick={() => setIsDark(!isDark)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isDark 
                    ? "hover:bg-white/10 text-slate-400 hover:text-white" 
                    : "hover:bg-purple-100 text-slate-600 hover:text-slate-900"
                )}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Edit Info Card */}
          <div className={cn(
            "mb-6 rounded-xl p-6 border backdrop-blur-sm",
            isDark 
              ? "bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30" 
              : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
          )}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={cn("text-lg font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>
                  📝 Edit Mode
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className={isDark ? "text-slate-300" : "text-gray-700"}>
                    <span className="font-semibold">Reward ID:</span>
                    <span className={cn(
                      "ml-2 font-mono px-2 py-1 rounded border",
                      isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
                    )}>
                      {reward.reward_id}
                    </span>
                  </div>
                  <div className={isDark ? "text-slate-300" : "text-gray-700"}>
                    <span className="font-semibold">Type:</span>
                    <span className="ml-2">{rewardTypes[reward.reward_type]}</span>
                  </div>
                  <div className={isDark ? "text-slate-300" : "text-gray-700"}>
                    <span className="font-semibold">Status:</span>
                    <span className={cn(
                      "ml-2 px-2 py-1 rounded flex items-center gap-1",
                      reward.is_active 
                        ? isDark ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-800"
                        : isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-800"
                    )}>
                      {reward.is_active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {reward.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Image Preview */}
          {reward.image_url && (
            <div className={cn(
              "mb-6 rounded-xl p-4 border",
              isDark 
                ? "bg-slate-900/50 border-white/10" 
                : "bg-blue-50 border-blue-200"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex-shrink-0 w-20 h-20 rounded-lg border-2 flex items-center justify-center overflow-hidden",
                  isDark ? "bg-slate-800 border-purple-500/30" : "bg-white border-blue-300"
                )}>
                  <img
                    src={reward.image_url}
                    alt="Current"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-semibold mb-1",
                    isDark ? "text-white" : "text-blue-900"
                  )}>
                    Current Image
                  </p>
                  <p className={cn(
                    "text-xs mb-2",
                    isDark ? "text-slate-400" : "text-blue-700"
                  )}>
                    Uploading a new image will replace the current image
                  </p>
                  <label className={cn(
                    "flex items-center gap-2 text-xs cursor-pointer",
                    isDark ? "text-slate-300" : "text-blue-800"
                  )}>
                    <input
                      type="checkbox"
                      checked={keepExistingImage}
                      onChange={(e) => setKeepExistingImage(e.target.checked)}
                      className="w-3 h-3 rounded"
                    />
                    Keep existing image (if no new image is uploaded)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className={cn(
              "rounded-2xl shadow-lg border p-6 backdrop-blur-sm",
              isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
            )}>
              <h2 className={cn("text-xl font-bold mb-6", isDark ? "text-white" : "text-gray-900")}>
                Basic Information
              </h2>
              <BasicInfo
                formData={formData}
                errors={errors}
                onChange={handleFormChange}
                rewardTypes={rewardTypes}
                rarities={rarities}
                isEditing={true}
              />
            </div>

            {/* Economics */}
            <div className={cn(
              "rounded-2xl shadow-lg border p-6 backdrop-blur-sm",
              isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
            )}>
              <Economics
                formData={formData}
                errors={errors}
                onChange={handleFormChange}
              />
            </div>

            {/* Type Config */}
            <div className={cn(
              "rounded-2xl shadow-lg border p-6 backdrop-blur-sm",
              isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
            )}>
              <TypeConfig
                rewardType={formData.reward_type}
                rewardTypeName={rewardTypes[formData.reward_type]}
                avatarFrameData={avatarFrameData}
                backgroundData={backgroundData}
                badgeData={badgeData}
                titleConfig={titleConfig}
                onAvatarFrameChange={setAvatarFrameData}
                onBackgroundChange={setBackgroundData}
                onBadgeChange={setBadgeData}
                onTitleConfigChange={handleTitleConfigChange}
                errors={errors}
                existingImageUrl={reward.image_url}
                isEditing={true}
                rarity={formData.rarity}
                rewardName={formData.name}
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className={cn(
            "mt-6 rounded-xl shadow-lg border p-6 backdrop-blur-sm",
            isDark 
              ? "bg-slate-900/80 border-white/10" 
              : "bg-white border-gray-200"
          )}>
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Save className="h-5 w-5" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>

              <Link
                href="/admin/rewards"
                className={cn(
                  "py-4 px-8 font-bold rounded-xl border-2 transition-all duration-200 flex items-center justify-center",
                  isDark 
                    ? "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700" 
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}