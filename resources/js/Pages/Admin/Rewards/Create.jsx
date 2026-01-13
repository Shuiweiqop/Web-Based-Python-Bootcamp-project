import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Save, Sparkles, ArrowLeft, Sun, Moon, Zap, Crown, Gift } from 'lucide-react';
import { cn } from '@/utils/cn';

// Components
import BasicInfo from './Components/RewardForm/BasicInfo';
import Economics from './Components/RewardForm/Economics';
import TypeConfig from './Components/RewardForm/TypeConfig';
import TemplateSelector from './Components/TemplateSelector/TemplateSelector';

export default function CreateReward({ rewardTypes, rarities }) {
  const [isDark, setIsDark] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reward_type: 'badge',
    rarity: 'common',
    stock_quantity: -1,
    point_cost: 0,
    max_owned: -1,
    apply_instructions: '',
    is_active: true,
  });

  // Type-specific data states
  const [avatarFrameData, setAvatarFrameData] = useState(null);
  const [backgroundData, setBackgroundData] = useState(null);
  const [badgeData, setBadgeData] = useState(null);
  const [titleConfig, setTitleConfig] = useState({
    title_text: '',
    text_color: '#3B82F6',
    gradient: { enabled: false, from: '#3B82F6', to: '#8B5CF6' },
    effects: { glow: false, sparkle: false, wave: false },
    icon: 'none',
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Event handlers
  const handleFormChange = ({ name, value }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTitleConfigChange = (key, value) => {
    setTitleConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyTemplate = (template) => {
    const currentRewardType = formData.reward_type;

    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      rarity: template.rarity,
      point_cost: template.point_cost,
    }));

    switch (currentRewardType) {
      case 'avatar_frame':
        if (template.preview) {
          setAvatarFrameData({
            url: template.preview,
            file: null,
            info: template.metadata.frame_dimensions,
            config: template.metadata,
          });
        }
        break;
      case 'profile_background':
        if (template.backgroundType === 'gradient') {
          setBackgroundData({
            type: 'gradient',
            gradient: template.metadata.gradient,
            effects: template.metadata.effects || {},
            file: null,
          });
        } else if (template.preview) {
          setBackgroundData({
            type: 'image',
            url: template.preview,
            effects: template.metadata.effects || {},
            file: null,
          });
        }
        break;
      case 'badge':
        if (template.preview) {
          setBadgeData({
            url: template.preview,
            file: null,
            config: {
              shape: template.metadata.shape,
              glowColor: template.metadata.glow_color,
              backgroundColor: template.metadata.background_color,
            },
            info: template.metadata.icon_dimensions,
          });
        }
        break;
      case 'title':
        setTitleConfig({
          title_text: template.metadata.title_text,
          text_color: template.metadata.text_color,
          gradient: template.metadata.gradient,
          effects: template.metadata.effects,
          icon: template.metadata.icon,
        });
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    let metadata = {};
    let imageFile = null;

    switch (formData.reward_type) {
      case 'profile_background':
        if (backgroundData) {
          metadata = {
            type: backgroundData.type || 'image',
            url: backgroundData.url,
            effects: backgroundData.effects || {},
            info: backgroundData.info || {},
          };
          if (backgroundData.file) {
            imageFile = backgroundData.file;
          }
        }
        break;
      case 'avatar_frame':
        if (avatarFrameData) {
          metadata = {
            frame_dimensions: {
              width: avatarFrameData.info?.width,
              height: avatarFrameData.info?.height,
            },
            animation: avatarFrameData.config?.animation || {},
          };
          imageFile = avatarFrameData.file;
        }
        break;
      case 'badge':
        if (badgeData) {
          metadata = {
            shape: badgeData.config?.shape || 'circle',
            glow_color: badgeData.config?.glowColor,
            background_color: badgeData.config?.backgroundColor,
            icon_dimensions: {
              width: badgeData.info?.width,
              height: badgeData.info?.height,
            },
          };
          imageFile = badgeData.file;
        }
        break;
      case 'title':
        metadata = {
          title_text: titleConfig.title_text,
          text_color: titleConfig.text_color,
          gradient: titleConfig.gradient,
          effects: titleConfig.effects,
          icon: titleConfig.icon,
        };
        break;
      default:
        metadata = {};
        break;
    }

    submitData.append('metadata', JSON.stringify(metadata));
    if (imageFile) {
      submitData.append('reward_image', imageFile);
    }

    router.post('/admin/rewards', submitData, {
      forceFormData: true,
      preserveScroll: false,
      onError: (errors) => {
        setErrors(errors);
        setIsSubmitting(false);
      },
      onSuccess: () => {
        setIsSubmitting(false);
      },
      onFinish: () => {
        setTimeout(() => setIsSubmitting(false), 100);
      },
    });
  };

  return (
    <>
      <Head title="Create New Reward" />

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          rewardType={formData.reward_type}
          onSelectTemplate={handleApplyTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

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
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
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
                <h1 className={cn(
                  "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                  isDark 
                    ? "from-purple-400 to-cyan-400" 
                    : "from-purple-600 to-cyan-600"
                )}>
                  Create New Reward
                </h1>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowTemplateSelector(true)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all border",
                    isDark
                      ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/30 text-cyan-300 hover:from-purple-500/30 hover:to-cyan-500/30"
                      : "bg-gradient-to-r from-purple-100 to-cyan-100 border-purple-300 text-purple-700 hover:from-purple-200 hover:to-cyan-200"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  Choose Template
                </button>
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
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Template Info Card */}
          <div className={cn(
            "mb-6 rounded-xl p-6 border backdrop-blur-sm",
            isDark 
              ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30" 
              : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
          )}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={cn("text-lg font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>
                  💡 Quick Creation Guide
                </h3>
                <p className={cn("text-sm mb-3", isDark ? "text-slate-300" : "text-gray-700")}>
                  Click the <span className={cn("font-semibold", isDark ? "text-cyan-400" : "text-purple-700")}>Choose Template</span> button above to quickly apply preset configurations:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className={cn("flex items-center gap-2 text-sm", isDark ? "text-slate-300" : "text-gray-700")}>
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span><span className="font-semibold">Golden Dragon Frame</span> - Legendary avatar decoration</span>
                  </div>
                  <div className={cn("flex items-center gap-2 text-sm", isDark ? "text-slate-300" : "text-gray-700")}>
                    <Zap className="w-4 h-4 text-cyan-500" />
                    <span><span className="font-semibold">Matrix Code Background</span> - Hacker-style background</span>
                  </div>
                  <div className={cn("flex items-center gap-2 text-sm", isDark ? "text-slate-300" : "text-gray-700")}>
                    <Gift className="w-4 h-4 text-purple-500" />
                    <span><span className="font-semibold">Python Master Badge</span> - Ultimate achievement badge</span>
                  </div>
                  <div className={cn("flex items-center gap-2 text-sm", isDark ? "text-slate-300" : "text-gray-700")}>
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    <span><span className="font-semibold">Supreme Coder Title</span> - Highest honor title</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className={cn(
              "rounded-2xl shadow-lg border p-6 backdrop-blur-sm",
              isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isDark 
                    ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/50" 
                    : "bg-gradient-to-br from-purple-100 to-cyan-100"
                )}>
                  <Gift className={cn("w-5 h-5", isDark ? "text-cyan-400" : "text-purple-600")} />
                </div>
                <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                  Basic Information
                </h2>
              </div>
              <BasicInfo
                formData={formData}
                errors={errors}
                onChange={handleFormChange}
                rewardTypes={rewardTypes}
                rarities={rarities}
              />
            </div>

            {/* Economics */}
            <div className={cn(
              "rounded-2xl shadow-lg border p-6 backdrop-blur-sm",
              isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isDark 
                    ? "bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/50" 
                    : "bg-gradient-to-br from-green-100 to-emerald-100"
                )}>
                  <span className="text-xl">💰</span>
                </div>
                <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                  Economics
                </h2>
              </div>
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
              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isDark 
                    ? "bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/50" 
                    : "bg-gradient-to-br from-blue-100 to-indigo-100"
                )}>
                  <Zap className={cn("w-5 h-5", isDark ? "text-blue-400" : "text-blue-600")} />
                </div>
                <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                  {rewardTypes[formData.reward_type]} Configuration
                </h2>
              </div>
              <TypeConfig
                rewardType={formData.reward_type}
                rewardTypeName={rewardTypes[formData.reward_type]}
                rarity={formData.rarity}
                rewardName={formData.name}
                avatarFrameData={avatarFrameData}
                backgroundData={backgroundData}
                badgeData={badgeData}
                titleConfig={titleConfig}
                onAvatarFrameChange={setAvatarFrameData}
                onBackgroundChange={setBackgroundData}
                onBadgeChange={setBadgeData}
                onTitleConfigChange={handleTitleConfigChange}
                errors={errors}
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
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Save className="h-5 w-5" />
                {isSubmitting ? 'Creating...' : 'Create Reward'}
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

      <style jsx>{`
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