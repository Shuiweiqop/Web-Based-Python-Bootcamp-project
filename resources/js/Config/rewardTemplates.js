/**
 * 奖励模板配置文件
 * 存储位置: resources/js/Config/rewardTemplates.js
 */

export const rewardTemplates = {
  // ==================== 头像框模板 ====================
  avatar_frame: [
    {
      id: 'golden_dragon',
      name: '金龙头像框',
      description: '华丽的金龙装饰头像框，展现王者风范',
      rarity: 'legendary',
      point_cost: 1000,
      preview: '/templates/frames/golden-dragon.png', // 预览图
      metadata: {
        frame_dimensions: { width: 512, height: 512 },
        animation: { enabled: true, type: 'rotate', duration: '5s' },
      },
    },
    {
      id: 'cyber_neon',
      name: '赛博霓虹框',
      description: '未来科技感的霓虹边框',
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
      name: '樱花绽放框',
      description: '浪漫的粉色樱花装饰框',
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
      name: '简约银框',
      description: '低调奢华的银色边框',
      rarity: 'common',
      point_cost: 100,
      preview: '/templates/frames/silver.png',
      metadata: {
        frame_dimensions: { width: 300, height: 300 },
      },
    },
  ],

  // ==================== 背景模板 ====================
  profile_background: [
    {
      id: 'tech_matrix',
      name: '科技矩阵背景',
      description: '黑客帝国风格的数字雨背景',
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
      name: '星云银河',
      description: '璀璨的银河星云背景',
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
      name: '日落渐变',
      description: '温暖的橙红色渐变背景',
      rarity: 'rare',
      point_cost: 200,
      preview: null, // 渐变不需要图片
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
      name: '海洋蓝渐变',
      description: '清新的蓝色渐变背景',
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

  // ==================== 徽章模板 ====================
  badge: [
    {
      id: 'python_master',
      name: 'Python 大师',
      description: '完成所有 Python 课程的终极徽章',
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
      name: '代码战士',
      description: '完成 100 道编程练习',
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
      name: '快速学习者',
      description: '3天内完成一门课程',
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
      name: '第一步',
      description: '完成第一次练习',
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

  // ==================== 称号模板 ====================
  title: [
    {
      id: 'supreme_coder',
      name: '至尊编程者',
      description: '顶级编程称号，代表最高荣誉',
      rarity: 'legendary',
      point_cost: 2000,
      preview: null,
      metadata: {
        title_text: '至尊编程者',
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
      name: '算法专家',
      description: '精通各类算法的称号',
      rarity: 'epic',
      point_cost: 1000,
      preview: null,
      metadata: {
        title_text: '算法专家',
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
      name: 'Python 忍者',
      description: 'Python 编程高手',
      rarity: 'rare',
      point_cost: 500,
      preview: null,
      metadata: {
        title_text: 'Python 忍者',
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
      name: '编程新手',
      description: '刚开始编程之旅',
      rarity: 'common',
      point_cost: 50,
      preview: null,
      metadata: {
        title_text: '编程新手',
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

/**
 * 获取指定类型的模板列表
 * @param {string} type - 奖励类型
 * @returns {Array} 模板列表
 */
export const getTemplatesByType = (type) => {
  return rewardTemplates[type] || [];
};

/**
 * 根据 ID 获取模板
 * @param {string} type - 奖励类型
 * @param {string} id - 模板 ID
 * @returns {Object|null} 模板对象
 */
export const getTemplateById = (type, id) => {
  const templates = rewardTemplates[type] || [];
  return templates.find(t => t.id === id) || null;
};

/**
 * 获取稀有度配置
 */
export const rarityConfig = {
  common: { 
    color: 'bg-gray-100', 
    text: 'text-gray-800', 
    border: 'border-gray-300',
    icon: '⚪', 
    label: '普通' 
  },
  rare: { 
    color: 'bg-blue-100', 
    text: 'text-blue-800', 
    border: 'border-blue-300',
    icon: '💙', 
    label: '稀有' 
  },
  epic: { 
    color: 'bg-purple-100', 
    text: 'text-purple-800', 
    border: 'border-purple-300',
    icon: '💜', 
    label: '史诗' 
  },
  legendary: { 
    color: 'bg-yellow-100', 
    text: 'text-yellow-800', 
    border: 'border-yellow-300',
    icon: '🌟', 
    label: '传说' 
  },
};