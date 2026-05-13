import React, { useState } from 'react';
import { X, Check, Sparkles, Zap, Crown, Award } from 'lucide-react';
import { rewardTemplates } from '@/Config/rewardTemplates';

const rarityConfig = {
  common: {
    label: 'Common',
    color: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    icon: '⚪',
  },
  rare: {
    label: 'Rare',
    color: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    icon: '💙',
  },
  epic: {
    label: 'Epic',
    color: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    icon: '💜',
  },
  legendary: {
    label: 'Legendary',
    color: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    icon: '🌟',
  },
};

const getTemplatesByType = (rewardType) => {
  if (!rewardTemplates || !rewardTemplates[rewardType]) {
    return [];
  }

  return rewardTemplates[rewardType];
};

const TemplatePreviewImage = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Award className="w-16 h-16 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
};

const TemplateSelector = ({ rewardType, onSelectTemplate, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const templates = getTemplatesByType(rewardType);

  if (!templates || templates.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-6">
            There are no preset templates for this reward type yet.
          </p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
          >
            Close
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
    avatar_frame: 'Avatar Frame',
    profile_background: 'Profile Background',
    badge: 'Badge',
    title: 'Title',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Choose a {typeLabels[rewardType]} Template
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                Apply a polished preset and create a reward much faster.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

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
                  {isSelected && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-4 ${rarity.color} ${rarity.text}`}
                  >
                    {rarity.icon} {rarity.label}
                  </div>

                  {template.preview ? (
                    <div className="mb-4 aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                      <TemplatePreviewImage
                        src={template.preview}
                        alt={template.name}
                      />
                    </div>
                  ) : (
                    <div className="mb-4 aspect-square bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      {rewardType === 'profile_background' &&
                        template.backgroundType === 'gradient' &&
                        template.metadata?.gradient && (
                          <div
                            className="w-full h-full rounded-lg"
                            style={{
                              background: `linear-gradient(${
                                template.metadata.gradient.direction === 'to-br'
                                  ? 'to bottom right'
                                  : template.metadata.gradient.direction === 'to-r'
                                    ? 'to right'
                                    : template.metadata.gradient.direction === 'to-b'
                                      ? 'to bottom'
                                      : 'to bottom left'
                              }, ${template.metadata.gradient.from}, ${template.metadata.gradient.to})`,
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

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      {template.name}
                      {template.rarity === 'legendary' && (
                        <Crown className="w-5 h-5 text-yellow-500" />
                      )}
                      {template.rarity === 'epic' && (
                        <Zap className="w-5 h-5 text-purple-500" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Point cost</span>
                      <span className="text-lg font-bold text-blue-600">
                        {template.point_cost}
                      </span>
                    </div>
                  </div>

                  {template.metadata && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {rewardType === 'avatar_frame' &&
                        template.metadata.animation?.enabled && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Animated
                          </span>
                        )}
                      {rewardType === 'profile_background' &&
                        template.metadata.effects?.blur > 0 && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            Blur effect
                          </span>
                        )}
                      {rewardType === 'profile_background' &&
                        template.metadata.effects?.overlayOpacity > 0 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            Overlay
                          </span>
                        )}
                      {rewardType === 'badge' && template.metadata.glow_color && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Glow
                        </span>
                      )}
                      {rewardType === 'title' &&
                        template.metadata.gradient?.enabled && (
                          <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs rounded-full">
                            Gradient
                          </span>
                        )}
                      {rewardType === 'title' && template.metadata.effects?.glow && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Glow
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedTemplate ? (
              <span className="font-semibold text-gray-900">
                Selected: {selectedTemplate.name}
              </span>
            ) : (
              <span>Please choose a template</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelectTemplate}
              disabled={!selectedTemplate}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Apply template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
