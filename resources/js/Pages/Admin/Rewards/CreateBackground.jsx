// resources/js/Pages/Admin/Rewards/CreateBackground.jsx

import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BackgroundUpload from '@/Components/Rewards/Background/BackgroundUpload';
import BackgroundPreview from '@/Components/Rewards/Background/BackgroundPreview.jsx';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';

export default function CreateBackground({ rarities }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rarity: 'common',
    point_cost: 100,
    metadata: null, // 期望是对象，可能包含 file, effects 等
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackgroundChange = (backgroundData) => {
    console.log('📦 Background data received:', backgroundData);
    setFormData(prev => ({
      ...prev,
      metadata: backgroundData,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // 如果 metadata 包含文件，我们必须用 FormData 发出 multipart/form-data
    const payload = new FormData();
    payload.append('name', formData.name || '');
    payload.append('description', formData.description || '');
    payload.append('rarity', formData.rarity || 'common');
    // 确保 number
    const pointCost = Number.isNaN(Number(formData.point_cost)) ? 0 : Number(formData.point_cost);
    payload.append('point_cost', pointCost);

    // 处理 metadata：既支持文件也支持纯 JSON
    if (formData.metadata) {
      // 约定 metadata 里的文件字段名为 file / image / imageFile（根据你的 BackgroundUpload 实现）
      // 如果有文件，append 文件为单独字段；其余 metadata 字段 JSON.stringify 上传为 metadata_json
      const md = formData.metadata;

      // 如果上传组件把文件放在 md.file 或 md.imageFile
      const possibleFile = md.file || md.imageFile || md.image;
      if (possibleFile instanceof File) {
        payload.append('background_file', possibleFile);
      } else if (Array.isArray(possibleFile) && possibleFile[0] instanceof File) {
        // 支持多文件
        possibleFile.forEach((f, idx) => payload.append(`background_files[${idx}]`, f));
      }

      // 其余 metadata（滤掉文件）以 JSON 形式上传，后端解析
      const mdCopy = { ...md };
      delete mdCopy.file;
      delete mdCopy.imageFile;
      delete mdCopy.image;
      if (Object.keys(mdCopy).length) {
        payload.append('metadata_json', JSON.stringify(mdCopy));
      }
    }

    // Inertia 支持传 FormData
    router.post(route('admin.rewards.background.store'), payload, {
      preserveScroll: false,
      // 必须设置配置让 Axios/Fetch 发送 multipart (Inertia 会处理 FormData 类型)
      onError: (err) => {
        console.error('❌ 创建失败:', err);
        setErrors(err);
        setIsSubmitting(false);
      },
      onSuccess: () => {
        console.log('✅ 创建成功！');
      },
      onFinish: () => {
        console.log('🏁 请求完成');
        setIsSubmitting(false);
      },
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Create Background Reward" />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* 修正：缺少 <a> 开头 */}
                <a
                  href={route('admin.rewards.index')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </a>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                    Create Background Reward
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Design and configure a new profile background
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Form */}
              <div className="space-y-6">
                {/* Basic Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h2>

                  {/* Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reward Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Sunset Beach Background"
                      required
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Describe this background..."
                      required
                    />
                    {errors.description && (
                      <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>

                  {/* Rarity */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rarity *
                    </label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData(prev => ({ ...prev, rarity: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(rarities).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {errors.rarity && (
                      <p className="text-red-600 text-sm mt-1">{errors.rarity}</p>
                    )}
                  </div>

                  {/* Point Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Point Cost *
                    </label>
                    <input
                      type="number"
                      value={formData.point_cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, point_cost: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      required
                    />
                    {errors.point_cost && (
                      <p className="text-red-600 text-sm mt-1">{errors.point_cost}</p>
                    )}
                  </div>
                </div>

                {/* Background Upload Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Background Image & Effects
                  </h2>

                  <BackgroundUpload
                    value={formData.metadata}
                    onChange={handleBackgroundChange}
                    error={errors.metadata}
                  />
                </div>

                {/* Error Display */}
                {errors.error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-red-800 text-sm font-medium">{errors.error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.metadata}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? 'Creating...' : 'Create Background Reward'}
                  </button>

                  {/* 修正：缺少 <a> 开头 */}
                  <a
                    href={route('admin.rewards.index')}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-center"
                  >
                    Cancel
                  </a>
                </div>
              </div>

              {/* Right Column: Preview */}
              <div className="lg:sticky lg:top-8 lg:self-start">
                <BackgroundPreview
                  backgroundData={formData.metadata}
                  rarity={formData.rarity}
                  rewardName={formData.name || 'Untitled Background'}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
