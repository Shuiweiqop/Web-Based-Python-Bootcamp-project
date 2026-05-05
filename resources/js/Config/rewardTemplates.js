export const rewardTemplates = {
  avatar_frame: [
    {
      id: 'golden_dragon',
      name: 'Golden Dragon Frame',
      description: 'A lavish golden dragon frame with a champion-level look.',
      rarity: 'legendary',
      point_cost: 1000,
      preview: '/templates/frames/golden-dragon.png',
      metadata: {
        frame_dimensions: { width: 512, height: 512 },
        animation: { enabled: true, type: 'rotate', duration: '5s' },
      },
    },
    {
      id: 'cyber_neon',
      name: 'Cyber Neon Frame',
      description: 'A futuristic neon frame with a high-tech vibe.',
      rarity: 'epic',
      point_cost: 600,
      preview: '/templates/frames/cyber-neon.png',
      metadata: {
        frame_dimensions: { width: 512, height: 512 },
        animation: { enabled: true, type: 'pulse', duration: '2s' },
      },
    },
    {
      id: 'sakura_bloom',
      name: 'Sakura Bloom Frame',
      description: 'A soft pink cherry blossom frame with a romantic feel.',
      rarity: 'rare',
      point_cost: 300,
      preview: '/templates/frames/sakura.png',
      metadata: {
        frame_dimensions: { width: 400, height: 400 },
        animation: { enabled: false },
      },
    },
    {
      id: 'simple_silver',
      name: 'Simple Silver Frame',
      description: 'A clean silver frame with a subtle premium look.',
      rarity: 'common',
      point_cost: 100,
      preview: '/templates/frames/silver.png',
      metadata: {
        frame_dimensions: { width: 300, height: 300 },
      },
    },
  ],

  profile_background: [
    {
      id: 'tech_matrix',
      name: 'Tech Matrix Background',
      description: 'A digital-rain background inspired by cyber worlds.',
      rarity: 'legendary',
      point_cost: 800,
      preview: '/templates/backgrounds/tech-matrix.jpg',
      backgroundType: 'image',
      metadata: {
        background_type: 'image',
        effects: {
          blur: 0,
          opacity: 0.9,
          overlayColor: '#000000',
          overlayOpacity: 0.3,
        },
      },
    },
    {
      id: 'galaxy_nebula',
      name: 'Galaxy Nebula',
      description: 'A dazzling galaxy and nebula background.',
      rarity: 'epic',
      point_cost: 500,
      preview: '/templates/backgrounds/galaxy.jpg',
      backgroundType: 'image',
      metadata: {
        background_type: 'image',
        effects: {
          blur: 2,
          opacity: 1,
          overlayColor: '#1a1a2e',
          overlayOpacity: 0.2,
        },
      },
    },
    {
      id: 'gradient_sunset',
      name: 'Sunset Gradient',
      description: 'A warm orange-red gradient background.',
      rarity: 'rare',
      point_cost: 200,
      preview: null,
      backgroundType: 'gradient',
      metadata: {
        background_type: 'gradient',
        gradient: {
          direction: 'to-br',
          from: '#FF6B6B',
          to: '#FFE66D',
        },
        effects: {
          blur: 0,
          opacity: 1,
          overlayColor: '#000000',
          overlayOpacity: 0,
        },
      },
    },
    {
      id: 'ocean_blue',
      name: 'Ocean Blue Gradient',
      description: 'A fresh blue gradient background.',
      rarity: 'common',
      point_cost: 100,
      preview: null,
      backgroundType: 'gradient',
      metadata: {
        background_type: 'gradient',
        gradient: {
          direction: 'to-br',
          from: '#4facfe',
          to: '#00f2fe',
        },
        effects: {},
      },
    },
  ],

  badge: [
    {
      id: 'python_master',
      name: 'Python Master',
      description: 'The ultimate badge for completing every Python course.',
      rarity: 'legendary',
      point_cost: 1500,
      preview: '/templates/badges/python-master.png',
      metadata: {
        shape: 'hexagon',
        glow_color: '#FFD700',
        background_color: null,
        icon_dimensions: { width: 256, height: 256 },
      },
    },
    {
      id: 'code_warrior',
      name: 'Code Warrior',
      description: 'Awarded for completing 100 coding exercises.',
      rarity: 'epic',
      point_cost: 800,
      preview: '/templates/badges/code-warrior.png',
      metadata: {
        shape: 'shield',
        glow_color: '#8B5CF6',
        background_color: '#1a1a2e',
        icon_dimensions: { width: 256, height: 256 },
      },
    },
    {
      id: 'fast_learner',
      name: 'Fast Learner',
      description: 'Complete a course within 3 days.',
      rarity: 'rare',
      point_cost: 400,
      preview: '/templates/badges/fast-learner.png',
      metadata: {
        shape: 'circle',
        glow_color: '#3B82F6',
        background_color: null,
        icon_dimensions: { width: 200, height: 200 },
      },
    },
    {
      id: 'first_step',
      name: 'First Step',
      description: 'Complete your very first exercise.',
      rarity: 'common',
      point_cost: 50,
      preview: '/templates/badges/first-step.png',
      metadata: {
        shape: 'square',
        glow_color: null,
        background_color: null,
        icon_dimensions: { width: 128, height: 128 },
      },
    },
  ],

  title: [
    {
      id: 'supreme_coder',
      name: 'Supreme Coder',
      description: 'A top-tier coding title that represents the highest honor.',
      rarity: 'legendary',
      point_cost: 2000,
      preview: null,
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
      id: 'algorithm_expert',
      name: 'Algorithm Expert',
      description: 'A title for students who excel at algorithms.',
      rarity: 'epic',
      point_cost: 1000,
      preview: null,
      metadata: {
        title_text: 'Algorithm Expert',
        text_color: '#8B5CF6',
        gradient: {
          enabled: true,
          from: '#8B5CF6',
          to: '#3B82F6',
        },
        effects: {
          glow: true,
          sparkle: false,
          wave: false,
        },
        icon: 'star',
      },
    },
    {
      id: 'python_ninja',
      name: 'Python Ninja',
      description: 'A title for highly skilled Python coders.',
      rarity: 'rare',
      point_cost: 500,
      preview: null,
      metadata: {
        title_text: 'Python Ninja',
        text_color: '#10B981',
        gradient: {
          enabled: false,
          from: '#10B981',
          to: '#059669',
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
      id: 'code_rookie',
      name: 'Code Rookie',
      description: 'For students just starting their coding journey.',
      rarity: 'common',
      point_cost: 50,
      preview: null,
      metadata: {
        title_text: 'Code Rookie',
        text_color: '#6B7280',
        gradient: {
          enabled: false,
          from: '#6B7280',
          to: '#4B5563',
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

export const getTemplatesByType = (type) => {
  return rewardTemplates[type] || [];
};

export const getTemplateById = (type, id) => {
  const templates = rewardTemplates[type] || [];
  return templates.find((template) => template.id === id) || null;
};

export const rarityConfig = {
  common: {
    color: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    icon: '⚪',
    label: 'Common',
  },
  rare: {
    color: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    icon: '💙',
    label: 'Rare',
  },
  epic: {
    color: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    icon: '💜',
    label: 'Epic',
  },
  legendary: {
    color: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    icon: '🌟',
    label: 'Legendary',
  },
};
