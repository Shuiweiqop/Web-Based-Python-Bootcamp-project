import React, { useState } from 'react';
import { X, Check, Sparkles, Zap, Crown, Award } from 'lucide-react';
import { rewardTemplates } from '@/Config/rewardTemplates';

// 稀有度配置
const rarityConfig = {
  common: {
    label: '普通',
    color: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    icon: '⚪',
  },
  rare: {
    label: '稀有',
    color: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    icon: '💙',
  },
  epic: {
    label: '史诗',
    color: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    icon: '💜',
  },
  legendary: {
    label: '传说',
    color: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    icon: '🌟',
  },
};

// 根据类型获取模板
const getTemplatesByType = (rewardType) => {
  if (!rewardTemplates || !rewardTemplates[rewardType]) {
    return [];
  }
  return rewardTemplates[rewardType];
};

/**
 * 奖励模板选择器组件
 * @param {string} rewardType - 奖励类型
 * @param {function} onSelectTemplate - 选择模板回调
 * @param {function} onClose - 关闭回调
 */
const TemplateSelector = ({ rewardType, onSelectTemplate, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const templates = getTemplatesByType(rewardType);

  if (!templates || templates.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">暂无模板</h3>
          <p className="text-gray-600 mb-6">此类型暂时没有预设模板</p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  const handleSelectTemplate = () => {
    if (selectedTemplate && onSelectTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  const typeLabels = {
    avatar_frame: '头像框',
    profile_background: '个人页背景',
    badge: '徽章',
    title: '称号',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">选择{typeLabels[rewardType]}模板</h2>
              <p className="text-sm text-blue-100 mt-1">快速套用预设配置，一键创建精美奖励</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const rarity = rarityConfig[template.rarity] || rarityConfig.common;
              const isSelected = selectedTemplate?.id === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`relative text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? `${rarity.border} ${rarity.color} shadow-lg scale-105`
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {/* 选中标记 */}
                  {isSelected && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* 稀有度标签 */}
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-4 ${rarity.color} ${rarity.text}`}>
                    {rarity.icon} {rarity.label}
                  </div>

                  {/* 预览图 */}
                  {template.preview ? (
                    <div className="mb-4 aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={template.preview}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center">
                              <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mb-4 aspect-square bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      {rewardType === 'profile_background' && template.backgroundType === 'gradient' && template.metadata?.gradient && (
                        <div 
                          className="w-full h-full rounded-lg"
                          style={{
                            background: `linear-gradient(${
                              template.metadata.gradient.direction === 'to-br' ? 'to bottom right' :
                              template.metadata.gradient.direction === 'to-r' ? 'to right' :
                              template.metadata.gradient.direction === 'to-b' ? 'to bottom' : 'to bottom left'
                            }, ${template.metadata.gradient.from}, ${template.metadata.gradient.to})`
                          }}
                        />
                      )}
                      {rewardType === 'title' && template.metadata?.title_text && (
                        <div className="text-center text-white font-bold text-lg px-4">
                          {template.metadata.title_text}
                        </div>
                      )}
                      {!template.metadata && (
                        <Award className="w-16 h-16 text-white/50" />
                      )}
                    </div>
                  )}

                  {/* 信息 */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      {template.name}
                      {template.rarity === 'legendary' && <Crown className="w-5 h-5 text-yellow-500" />}
                      {template.rarity === 'epic' && <Zap className="w-5 h-5 text-purple-500" />}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">积分成本</span>
                      <span className="text-lg font-bold text-blue-600">
                        {template.point_cost}
                      </span>
                    </div>
                  </div>

                  {/* 特效标记 */}
                  {template.metadata && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {/* 头像框动画 */}
                      {rewardType === 'avatar_frame' && template.metadata.animation?.enabled && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          ✨ 动画
                        </span>
                      )}
                      {/* 背景特效 */}
                      {rewardType === 'profile_background' && template.metadata.effects?.blur > 0 && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          🌫️ 模糊
                        </span>
                      )}
                      {rewardType === 'profile_background' && template.metadata.effects?.overlayOpacity > 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          🎭 覆盖层
                        </span>
                      )}
                      {/* 徽章发光 */}
                      {rewardType === 'badge' && template.metadata.glow_color && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          💫 发光
                        </span>
                      )}
                      {/* 称号特效 */}
                      {rewardType === 'title' && template.metadata.gradient?.enabled && (
                        <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs rounded-full">
                          🌈 渐变
                        </span>
                      )}
                      {rewardType === 'title' && template.metadata.effects?.glow && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          ✨ 发光
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedTemplate ? (
              <span className="font-semibold text-gray-900">
                已选择：{selectedTemplate.name}
              </span>
            ) : (
              <span>请选择一个模板</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSelectTemplate}
              disabled={!selectedTemplate}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              应用模板
            </button>
          </div>
        </div>
      </div>
    </div>  );
};

export default TemplateSelector;