import React, { useState } from 'react';
import { X, Sparkles, Crown, Zap, Star, Award } from 'lucide-react';

/**
 * Template Selector Component
 * Responsibility: Show a library of preset templates and allow the user to pick one to apply to the create form
 */
export default function TemplateSelector({ rewardType, onSelectTemplate, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // 🎨 Template library - categorized by reward type
  const templates = {
    avatar_frame: [
      {
        id: 'golden_dragon',
        name: 'Golden Dragon Frame',
        description: 'Mythic ornate avatar frame with a golden glow',
        rarity: 'legendary',
        point_cost: 5000,
        preview: 'https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Golden+Dragon',
        metadata: {
          frame_dimensions: { width: 200, height: 200 },
          animation: { enabled: true, type: 'rotate', duration: '3s' },
        },
      },
      {
        id: 'cyber_neon',
        name: 'Cyber Neon Frame',
        description: 'Epic, techy neon frame — ideal for coding pros',
        rarity: 'epic',
        point_cost: 3000,
        preview: 'https://via.placeholder.com/200x200/9333EA/FFFFFF?text=Cyber+Neon',
        metadata: {
          frame_dimensions: { width: 200, height: 200 },
          animation: { enabled: true, type: 'pulse', duration: '2s' },
        },
      },
      {
        id: 'blue_flame',
        name: 'Blue Flame Frame',
        description: 'Rare dynamic flame effect',
        rarity: 'rare',
        point_cost: 1500,
        preview: 'https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=Blue+Flame',
        metadata: {
          frame_dimensions: { width: 200, height: 200 },
          animation: { enabled: false },
        },
      },
      {
        id: 'simple_silver',
        name: 'Silver Frame',
        description: 'Common minimalist frame',
        rarity: 'common',
        point_cost: 500,
        preview: 'https://via.placeholder.com/200x200/D1D5DB/FFFFFF?text=Silver',
        metadata: {
          frame_dimensions: { width: 200, height: 200 },
          animation: { enabled: false },
        },
      },
    ],

    profile_background: [
      {
        id: 'matrix_code',
        name: 'Matrix Code Background',
        description: 'Falling code background in a Matrix-style aesthetic',
        rarity: 'legendary',
        point_cost: 4500,
        backgroundType: 'gradient',
        metadata: {
          background_type: 'gradient',
          gradient: {
            type: 'linear',
            angle: '180deg',
            colors: [
              { color: '#0f172a', stop: 0 },
              { color: '#1e293b', stop: 50 },
              { color: '#0f172a', stop: 100 },
            ],
          },
          effects: {
            blur: 0,
            opacity: 1,
            overlayColor: '#10b981',
            overlayOpacity: 0.1,
          },
        },
      },
      {
        id: 'sunset_gradient',
        name: 'Sunset Gradient',
        description: 'Warm orange–pink gradient background',
        rarity: 'epic',
        point_cost: 2500,
        backgroundType: 'gradient',
        metadata: {
          background_type: 'gradient',
          gradient: {
            type: 'linear',
            angle: '135deg',
            colors: [
              { color: '#ff6b6b', stop: 0 },
              { color: '#ffa500', stop: 50 },
              { color: '#ffd700', stop: 100 },
            ],
          },
          effects: {
            blur: 2,
            opacity: 0.9,
            overlayColor: '#000000',
            overlayOpacity: 0.1,
          },
        },
      },
      {
        id: 'ocean_blue',
        name: 'Deep Ocean Blue',
        description: 'Calming blue gradient',
        rarity: 'rare',
        point_cost: 1200,
        backgroundType: 'gradient',
        metadata: {
          background_type: 'gradient',
          gradient: {
            type: 'linear',
            angle: '180deg',
            colors: [
              { color: '#1e40af', stop: 0 },
              { color: '#3b82f6', stop: 100 },
            ],
          },
          effects: {
            blur: 0,
            opacity: 1,
          },
        },
      },
      {
        id: 'simple_white',
        name: 'Pure White Background',
        description: 'Clean, minimal white background',
        rarity: 'common',
        point_cost: 300,
        backgroundType: 'gradient',
        metadata: {
          background_type: 'gradient',
          gradient: {
            type: 'linear',
            angle: '180deg',
            colors: [
              { color: '#ffffff', stop: 0 },
              { color: '#f3f4f6', stop: 100 },
            ],
          },
          effects: {
            blur: 0,
            opacity: 1,
          },
        },
      },
    ],

    badge: [
      {
        id: 'python_master',
        name: 'Python Master Badge',
        description: 'Awarded after completing 100 Python challenges',
        rarity: 'legendary',
        point_cost: 10000,
        preview: 'https://via.placeholder.com/150x150/FFD700/000000?text=🐍',
        metadata: {
          shape: 'hexagon',
          glow_color: '#FFD700',
          background_color: null,
          icon_dimensions: { width: 150, height: 150 },
        },
      },
      {
        id: 'code_warrior',
        name: 'Code Warrior',
        description: '30-day coding streak',
        rarity: 'epic',
        point_cost: 6000,
        preview: 'https://via.placeholder.com/150x150/9333EA/FFFFFF?text=⚔️',
        metadata: {
          shape: 'shield',
          glow_color: '#9333EA',
          background_color: null,
          icon_dimensions: { width: 150, height: 150 },
        },
      },
      {
        id: 'quick_learner',
        name: 'Quick Learner',
        description: 'Complete 10 courses',
        rarity: 'rare',
        point_cost: 2000,
        preview: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=📚',
        metadata: {
          shape: 'circle',
          glow_color: '#3B82F6',
          background_color: null,
          icon_dimensions: { width: 150, height: 150 },
        },
      },
      {
        id: 'beginner',
        name: 'Beginner',
        description: 'Complete your first exercise',
        rarity: 'common',
        point_cost: 100,
        preview: 'https://via.placeholder.com/150x150/9CA3AF/FFFFFF?text=🎯',
        metadata: {
          shape: 'circle',
          glow_color: '#9CA3AF',
          background_color: null,
          icon_dimensions: { width: 150, height: 150 },
        },
      },
    ],

    title: [
      {
        id: 'supreme_coder',
        name: 'Supreme Coder',
        description: 'Top honor title',
        rarity: 'legendary',
        point_cost: 15000,
        metadata: {
          title_text: 'Supreme Coder',
          text_color: '#FFD700',
          gradient: {
            enabled: true,
            from: '#FFD700',
            to: '#FFA500',
          },
          effects: {
            glow: true,
            sparkle: true,
            wave: true,
          },
          icon: 'crown',
        },
      },
      {
        id: 'python_grandmaster',
        name: 'Python Grandmaster',
        description: 'Expert in the Python domain',
        rarity: 'epic',
        point_cost: 8000,
        metadata: {
          title_text: 'Python Grandmaster',
          text_color: '#9333EA',
          gradient: {
            enabled: true,
            from: '#9333EA',
            to: '#EC4899',
          },
          effects: {
            glow: true,
            sparkle: true,
            wave: false,
          },
          icon: 'star',
        },
      },
      {
        id: 'algo_expert',
        name: 'Algorithm Expert',
        description: 'Proficient in data structures & algorithms',
        rarity: 'rare',
        point_cost: 3500,
        metadata: {
          title_text: 'Algorithm Expert',
          text_color: '#3B82F6',
          gradient: {
            enabled: false,
            from: '#3B82F6',
            to: '#8B5CF6',
          },
          effects: {
            glow: true,
            sparkle: false,
            wave: false,
          },
          icon: 'zap',
        },
      },
      {
        id: 'code_enthusiast',
        name: 'Code Enthusiast',
        description: 'Entry-level title for coding lovers',
        rarity: 'common',
        point_cost: 800,
        metadata: {
          title_text: 'Code Enthusiast',
          text_color: '#6B7280',
          gradient: {
            enabled: false,
            from: '#6B7280',
            to: '#9CA3AF',
          },
          effects: {
            glow: false,
            sparkle: false,
            wave: false,
          },
          icon: 'sparkle',
        },
      },
    ],
  };

  const currentTemplates = templates[rewardType] || [];

  const rarityConfig = {
    common: { color: 'bg-gray-100 border-gray-300', text: 'text-gray-800', icon: '⚪', label: 'Common' },
    rare: { color: 'bg-blue-100 border-blue-300', text: 'text-blue-800', icon: '💙', label: 'Rare' },
    epic: { color: 'bg-purple-100 border-purple-300', text: 'text-purple-800', icon: '💜', label: 'Epic' },
    legendary: { color: 'bg-yellow-100 border-yellow-300', text: 'text-yellow-800', icon: '🌟', label: 'Legendary' },
  };

  const handleSelect = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'avatar_frame': return <Crown className="w-6 h-6" />;
      case 'profile_background': return <Sparkles className="w-6 h-6" />;
      case 'badge': return <Award className="w-6 h-6" />;
      case 'title': return <Star className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
              {getIconForType(rewardType)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Choose Template</h2>
              <p className="text-sm text-gray-600">Quickly create rewards from preset templates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentTemplates.map((template) => {
                const rarity = rarityConfig[template.rarity];
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelect(template)}
                    className={`text-left p-6 rounded-xl border-2 hover:shadow-xl transition-all duration-200 ${rarity.color} ${
                      selectedTemplate?.id === template.id
                        ? 'ring-4 ring-purple-500 ring-offset-2'
                        : ''
                    }`}
                  >
                    {/* Preview */}
                    {template.preview && (
                      <div className="mb-4 flex items-center justify-center bg-gray-50 rounded-lg p-4 h-40">
                        {rewardType === 'profile_background' ? (
                          <div
                            className="w-full h-full rounded-lg"
                            style={{
                              background:
                                template.backgroundType === 'gradient' &&
                                template.metadata.gradient
                                  ? `linear-gradient(${template.metadata.gradient.angle || '180deg'}, ${template.metadata.gradient.colors.map((c) => `${c.color} ${c.stop}%`).join(', ')})`
                                  : '#f3f4f6',
                            }}
                          />
                        ) : (
                          <img
                            src={template.preview}
                            alt={template.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        )}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`text-lg font-bold ${rarity.text} mb-1`}>
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {template.description}
                        </p>
                      </div>
                      <span className="text-2xl">{rarity.icon}</span>
                    </div>

                    {/* Points */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        {rarity.label}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                        {template.point_cost} pts
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No templates available for this type</p>
              <p className="text-sm mt-2">Please configure the reward manually</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              💡 Tip: After selecting a template you can still modify all settings
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
