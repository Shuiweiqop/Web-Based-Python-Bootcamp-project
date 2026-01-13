/**
 * Backgrounds Configuration
 * 
 * 定义所有可用背景的元数据
 * 包括：静态图片、渐变、动画效果等
 */

export const BACKGROUND_TYPES = {
  GRADIENT: 'gradient',
  IMAGE: 'image',
  ANIMATED: 'animated'
};

export const RARITY_LEVELS = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

/**
 * 背景配置数据
 */
export const backgrounds = [
  // ==================== GRADIENTS ====================
  {
    id: 'gradient_default',
    name: 'Default Gradient',
    type: BACKGROUND_TYPES.GRADIENT,
    rarity: RARITY_LEVELS.COMMON,
    description: 'The classic LearnHub gradient background',
    gradient: {
      type: 'linear',
      colors: ['#0f172a', '#166534', '#0f172a'], // slate-900, green-900, slate-900
      direction: 'to bottom right'
    },
    animated: false,
    thumbnail: '/images/backgrounds/thumbnails/gradient-default.jpg',
    price: 0,
    metadata: {
      category: 'gradient',
      tags: ['default', 'green', 'dark']
    }
  },
  {
    id: 'gradient_ocean',
    name: 'Ocean Depths',
    type: BACKGROUND_TYPES.GRADIENT,
    rarity: RARITY_LEVELS.RARE,
    description: 'Deep blue ocean gradient with mysterious vibes',
    gradient: {
      type: 'linear',
      colors: ['#1e3a8a', '#0c4a6e', '#1e3a8a'], // blue-900, cyan-900
      direction: 'to bottom right'
    },
    animated: false,
    thumbnail: '/images/backgrounds/thumbnails/gradient-ocean.jpg',
    price: 500,
    metadata: {
      category: 'gradient',
      tags: ['blue', 'ocean', 'calm']
    }
  },
  {
    id: 'gradient_sunset',
    name: 'Sunset Dreams',
    type: BACKGROUND_TYPES.GRADIENT,
    rarity: RARITY_LEVELS.RARE,
    description: 'Warm sunset colors for a cozy learning experience',
    gradient: {
      type: 'linear',
      colors: ['#7c2d12', '#ea580c', '#f59e0b', '#fbbf24'], // orange to yellow
      direction: 'to top'
    },
    animated: false,
    thumbnail: '/images/backgrounds/thumbnails/gradient-sunset.jpg',
    price: 500,
    metadata: {
      category: 'gradient',
      tags: ['warm', 'sunset', 'orange']
    }
  },
  {
    id: 'gradient_aurora',
    name: 'Aurora Borealis',
    type: BACKGROUND_TYPES.GRADIENT,
    rarity: RARITY_LEVELS.EPIC,
    description: 'Mystical northern lights gradient',
    gradient: {
      type: 'radial',
      colors: ['#1e3a8a', '#10b981', '#8b5cf6', '#1e3a8a'],
      direction: 'circle at center'
    },
    animated: false,
    thumbnail: '/images/backgrounds/thumbnails/gradient-aurora.jpg',
    price: 1000,
    metadata: {
      category: 'gradient',
      tags: ['aurora', 'purple', 'green', 'mystical']
    }
  },

  // ==================== ANIMATED GRADIENTS ====================
  {
    id: 'animated_meteor_rain',
    name: 'Meteor Rain',
    type: BACKGROUND_TYPES.ANIMATED,
    rarity: RARITY_LEVELS.EPIC,
    description: 'Dynamic meteor shower animation with shooting stars',
    gradient: {
      type: 'linear',
      colors: ['#0f172a', '#1e1b4b', '#0f172a'], // slate-900, indigo-900
      direction: 'to bottom right'
    },
    animated: true,
    animationComponent: 'MeteorRain',
    animationConfig: {
      intensity: 'medium',
      palette: ['#60a5fa', '#93c5fd', '#dbeafe'], // blue shades
      rate: 50,
      trailLength: 100
    },
    thumbnail: '/images/backgrounds/thumbnails/animated-meteor.jpg',
    previewVideo: '/videos/backgrounds/meteor-rain-preview.mp4',
    price: 1500,
    metadata: {
      category: 'animated',
      tags: ['meteor', 'stars', 'night', 'dynamic'],
      performanceImpact: 'medium'
    }
  },
  {
    id: 'animated_starfield',
    name: 'Starfield Voyage',
    type: BACKGROUND_TYPES.ANIMATED,
    rarity: RARITY_LEVELS.LEGENDARY,
    description: 'Fly through a mesmerizing field of stars',
    gradient: {
      type: 'radial',
      colors: ['#000000', '#0f172a', '#1e1b4b'],
      direction: 'circle at center'
    },
    animated: true,
    animationComponent: 'Starfield',
    animationConfig: {
      starCount: 200,
      speed: 2,
      depth: 3
    },
    thumbnail: '/images/backgrounds/thumbnails/animated-starfield.jpg',
    previewVideo: '/videos/backgrounds/starfield-preview.mp4',
    price: 3000,
    metadata: {
      category: 'animated',
      tags: ['stars', 'space', 'voyage', 'hypnotic'],
      performanceImpact: 'high'
    }
  },

  // ==================== STATIC IMAGES ====================
  {
    id: 'image_library',
    name: 'Ancient Library',
    type: BACKGROUND_TYPES.IMAGE,
    rarity: RARITY_LEVELS.RARE,
    description: 'A cozy ancient library filled with wisdom',
    imageUrl: '/images/backgrounds/library.jpg',
    animated: false,
    thumbnail: '/images/backgrounds/thumbnails/library.jpg',
    price: 800,
    metadata: {
      category: 'scenic',
      tags: ['library', 'books', 'cozy', 'wisdom']
    }
  },
  {
    id: 'image_mountain',
    name: 'Mountain Peak',
    type: BACKGROUND_TYPES.IMAGE,
    rarity: RARITY_LEVELS.EPIC,
    description: 'Reach new heights with this inspiring mountain view',
    imageUrl: '/images/backgrounds/mountain.jpg',
    animated: false,
    thumbnail: '/images/backgrounds/thumbnails/mountain.jpg',
    price: 1200,
    metadata: {
      category: 'nature',
      tags: ['mountain', 'nature', 'inspiring', 'peak']
    }
  },
  {
    id: 'image_space_station',
    name: 'Space Station',
    type: BACKGROUND_TYPES.IMAGE,
    rarity: RARITY_LEVELS.LEGENDARY,
    description: 'Study among the stars in this futuristic space station',
    imageUrl: '/images/backgrounds/space-station.jpg',
    animated: false,
    thumbnail: '/images/backgrounds/thumbnails/space-station.jpg',
    price: 2500,
    metadata: {
      category: 'futuristic',
      tags: ['space', 'futuristic', 'sci-fi', 'station']
    }
  },

  // ==================== SPECIAL/SEASONAL ====================
  {
    id: 'special_winter_wonderland',
    name: 'Winter Wonderland',
    type: BACKGROUND_TYPES.ANIMATED,
    rarity: RARITY_LEVELS.LEGENDARY,
    description: 'Gentle snowfall in a magical winter scene',
    gradient: {
      type: 'linear',
      colors: ['#1e3a8a', '#e0f2fe', '#bae6fd'],
      direction: 'to bottom'
    },
    animated: true,
    animationComponent: 'SnowFall',
    animationConfig: {
      snowflakeCount: 100,
      windSpeed: 1,
      fallSpeed: 1
    },
    thumbnail: '/images/backgrounds/thumbnails/winter-wonderland.jpg',
    previewVideo: '/videos/backgrounds/winter-preview.mp4',
    price: 2000,
    metadata: {
      category: 'seasonal',
      tags: ['winter', 'snow', 'seasonal', 'magical'],
      availableFrom: '12-01',
      availableTo: '02-28',
      performanceImpact: 'medium'
    }
  }
];

/**
 * 根据 ID 获取背景
 */
export function getBackgroundById(id) {
  return backgrounds.find(bg => bg.id === id);
}

/**
 * 根据稀有度过滤背景
 */
export function getBackgroundsByRarity(rarity) {
  return backgrounds.filter(bg => bg.rarity === rarity);
}

/**
 * 根据类型过滤背景
 */
export function getBackgroundsByType(type) {
  return backgrounds.filter(bg => bg.type === type);
}

/**
 * 根据分类过滤背景
 */
export function getBackgroundsByCategory(category) {
  return backgrounds.filter(bg => bg.metadata.category === category);
}

/**
 * 获取所有动画背景
 */
export function getAnimatedBackgrounds() {
  return backgrounds.filter(bg => bg.animated === true);
}

/**
 * 获取默认背景
 */
export function getDefaultBackground() {
  return backgrounds.find(bg => bg.id === 'gradient_default');
}

/**
 * 搜索背景
 */
export function searchBackgrounds(query) {
  const lowerQuery = query.toLowerCase();
  return backgrounds.filter(bg => 
    bg.name.toLowerCase().includes(lowerQuery) ||
    bg.description.toLowerCase().includes(lowerQuery) ||
    bg.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export default backgrounds;