import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Crown, Gift, Save, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

import BasicInfo from './Components/RewardForm/BasicInfo';
import Economics from './Components/RewardForm/Economics';
import TypeConfig from './Components/RewardForm/TypeConfig';
import TemplateSelector from './Components/TemplateSelector/TemplateSelector';

export default function CreateReward({ auth, rewardTypes, rarities }) {
  const [isDark, setIsDark] = useState(true);

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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateTheme();
    window.addEventListener('theme-changed', updateTheme);
    return () => window.removeEventListener('theme-changed', updateTheme);
  }, []);

  const handleFormChange = ({ name, value }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTitleConfigChange = (key, value) => {
    setTitleConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyTemplate = (template) => {
    const currentRewardType = formData.reward_type;

    setFormData((prev) => ({
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
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const submitData = new FormData();

    Object.keys(formData).forEach((key) => {
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
      onError: (submitErrors) => {
        setErrors(submitErrors);
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
    <AuthenticatedLayout
      user={auth?.user}
      header={
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent">
              Create New Reward
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Configure reward details, shop rules, and the visual asset students can earn.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTemplateSelector(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 font-bold text-white shadow-lg shadow-purple-500/40 transition-all hover-lift hover:from-purple-700 hover:to-cyan-700 hover:shadow-xl"
          >
            <Sparkles className="h-5 w-5" />
            Choose Template
          </button>
        </div>
      }
    >
      <Head title="Create New Reward" />

      {showTemplateSelector && (
        <TemplateSelector
          rewardType={formData.reward_type}
          onSelectTemplate={handleApplyTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 animate-fadeIn">
            <Link
              href="/admin/rewards"
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all hover-lift ripple-effect',
                isDark ? 'text-cyan-400 hover:bg-white/10 hover:text-cyan-300' : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
              )}
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Rewards
            </Link>
          </div>

          <div
            className={cn(
              'mb-6 rounded-2xl border-2 p-6 animate-fadeIn animation-delay-200 card-hover-effect',
              isDark
                ? 'glassmorphism-enhanced border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10'
                : 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={cn('mb-2 text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                  Quick Creation Guide
                </h3>
                <p className={cn('mb-3 text-sm', isDark ? 'text-slate-300' : 'text-gray-700')}>
                  Use a template when you want preset reward metadata, then fine-tune the form before publishing.
                </p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className={cn('flex items-center gap-2 text-sm', isDark ? 'text-slate-300' : 'text-gray-700')}>
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span><span className="font-semibold">Golden Dragon Frame</span> - Legendary avatar decoration</span>
                  </div>
                  <div className={cn('flex items-center gap-2 text-sm', isDark ? 'text-slate-300' : 'text-gray-700')}>
                    <Zap className="h-4 w-4 text-cyan-500" />
                    <span><span className="font-semibold">Matrix Code Background</span> - Hacker-style background</span>
                  </div>
                  <div className={cn('flex items-center gap-2 text-sm', isDark ? 'text-slate-300' : 'text-gray-700')}>
                    <Gift className="h-4 w-4 text-purple-500" />
                    <span><span className="font-semibold">Python Master Badge</span> - Ultimate achievement badge</span>
                  </div>
                  <div className={cn('flex items-center gap-2 text-sm', isDark ? 'text-slate-300' : 'text-gray-700')}>
                    <Sparkles className="h-4 w-4 text-pink-500" />
                    <span><span className="font-semibold">Supreme Coder Title</span> - Highest honor title</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <BasicInfo
              formData={formData}
              errors={errors}
              onChange={handleFormChange}
              rewardTypes={rewardTypes}
              rarities={rarities}
            />

            <Economics
              formData={formData}
              errors={errors}
              onChange={handleFormChange}
            />

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

          <div
            className={cn(
              'mt-6 rounded-2xl border p-6 shadow-sm',
              isDark
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 shadow-slate-950/30'
                : 'bg-gradient-to-br from-white to-slate-50 border-gray-200 shadow-slate-200/80'
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 py-4 font-bold text-white shadow-lg transition-all hover-lift hover:from-purple-700 hover:to-cyan-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {isSubmitting ? 'Creating...' : 'Create Reward'}
              </button>

              <Link
                href="/admin/rewards"
                className={cn(
                  'inline-flex items-center justify-center rounded-xl border-2 px-8 py-4 font-bold transition-all hover-lift',
                  isDark
                    ? 'border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </AuthenticatedLayout>
  );
}
