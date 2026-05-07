// resources/js/config/exerciseTypeRegistry.js

// ⚠️ 正确的导入路径 - Admin 配置组件
import CodingExerciseConfig from '@/Pages/Lessons/Exercises/components/CodingExerciseConfig';
import DragDropConfig from '@/Pages/Lessons/Exercises/components/DragDropConfig';
import AdventureGameConfig from '@/Pages/Lessons/Exercises/components/AdventureGameConfig';
import MazeGameConfig from '@/Pages/Lessons/Exercises/components/GeneralGameConfig';
import FillBlankConfig from '@/Pages/Lessons/Exercises/components/FillBlankConfig';
// ❌ 已删除: import MatchingConfig from '@/Pages/Lessons/Exercises/components/MatchingConfig';
import SortingConfig from '@/Pages/Lessons/Exercises/components/SortingConfig';
import SimulationConfig from '@/Pages/Lessons/Exercises/components/SimulationConfig';
import MemoryMatchConfig from '@/Pages/Lessons/Exercises/components/MemoryMatchConfig';

/**
 * 🎮 练习类型注册中心
 * 
 * 统一管理所有练习类型的配置、组件和元数据
 * 添加新类型只需在这里添加一个配置对象
 */

export const EXERCISE_TYPES = {
  // 💻 编程挑战
  coding: {
    value: 'coding',
    label: 'Coding Challenge',
    icon: '💻',
    emoji: '💻',
    description: 'Write and execute real Python code',
    color: 'purple',
    category: 'advanced',
    component: CodingExerciseConfig,
    requiresSpecialConfig: true,
    defaultContent: {},
    features: ['live_editor', 'auto_grading', 'test_cases'],
    recommendedFor: ['programming', 'algorithms', 'problem_solving'],
  },

  // 🎯 拖拽匹配
  drag_drop: {
    value: 'drag_drop',
    label: 'Drag & Drop',
    icon: '🎯',
    emoji: '🎯',
    description: 'Match items by dragging',
    color: 'blue',
    category: 'basic',
    component: DragDropConfig,
    requiresSpecialConfig: true,
    defaultContent: {
      zones: [],
      items: [],
    },
    features: ['interactive', 'visual', 'instant_feedback'],
    recommendedFor: ['matching', 'classification', 'categorization'],
  },

  // 🗺️ 冒险游戏
  adventure_game: {
    value: 'adventure_game',
    label: 'Adventure Game',
    icon: '🗺️',
    emoji: '🗺️',
    description: 'Story-based decision making',
    color: 'green',
    category: 'intermediate',
    component: AdventureGameConfig,
    requiresSpecialConfig: true,
    defaultContent: {
      scenarios: [],
    },
    features: ['narrative', 'choices', 'branching'],
    recommendedFor: ['decision_making', 'scenarios', 'critical_thinking'],
  },

  // 🧩 迷宫游戏
  maze_game: {
    value: 'maze_game',
    label: 'Maze Game',
    icon: '🧩',
    emoji: '🧩',
    description: 'Navigate through challenges',
    color: 'orange',
    category: 'intermediate',
    component: MazeGameConfig,
    requiresSpecialConfig: true,
    defaultContent: {
      gridSize: { rows: 5, cols: 5 },
      startPosition: { row: 0, col: 0 },
      endPosition: { row: 4, col: 4 },
      walls: [],
      obstacles: [],
      collectibles: [],
      timeLimit: 0,
    },
    features: ['navigation', 'logic', 'problem_solving'],
    recommendedFor: ['algorithms', 'pathfinding', 'logic'],
  },

  // 📝 填空题
  fill_blank: {
    value: 'fill_blank',
    label: 'Fill in the Blank',
    icon: '📝',
    emoji: '📝',
    description: 'Complete missing text',
    color: 'gray',
    category: 'basic',
    component: FillBlankConfig,
    requiresSpecialConfig: true,
    defaultContent: {
      sentences: [],
    },
    features: ['text_input', 'completion', 'auto_detect'],
    recommendedFor: ['vocabulary', 'syntax', 'recall'],
  },

  // ❌ 已删除: matching 配对题

  // 🔢 排序题
  sorting: {
    value: 'sorting',
    label: 'Sorting',
    icon: '🔢',
    emoji: '🔢',
    description: 'Arrange items in order',
    color: 'indigo',
    category: 'basic',
    component: SortingConfig,
    requiresSpecialConfig: true,
    defaultContent: {
      items: [],
      instruction: 'Arrange the items in the correct order',
    },
    features: ['sequencing', 'ordering', 'drag_to_reorder'],
    recommendedFor: ['procedures', 'steps', 'chronology'],
  },

  // 🎮 模拟器
  memory_match: {
    value: 'memory_match',
    label: 'Memory Match',
    icon: 'Memory',
    emoji: 'Memory',
    description: 'Flip cards and match concepts with answers',
    color: 'violet',
    category: 'basic',
    component: MemoryMatchConfig,
    requiresSpecialConfig: true,
    defaultContent: {
      instructions: 'Match each card with its correct partner.',
      pairs: [],
    },
    features: ['memory', 'matching', 'instant_feedback'],
    recommendedFor: ['vocabulary', 'concepts', 'data_types', 'syntax'],
  },

  simulation: {
    value: 'simulation',
    label: 'Simulation',
    icon: '🎮',
    emoji: '🎮',
    description: 'Interactive code simulation',
    color: 'teal',
    category: 'advanced',
    component: SimulationConfig,
    requiresSpecialConfig: true,
    defaultContent: {
      simulationType: 'code_execution',
      variables: [],
      steps: [],
    },
    features: ['interactive', 'step_by_step', 'visual_learning'],
    recommendedFor: ['code_execution', 'debugging', 'understanding_flow'],
  },
};

/**
 * 🎨 颜色配置映射
 */
export const COLOR_SCHEMES = {
  purple: {
    bg: 'from-purple-50 to-blue-50',
    border: 'border-purple-200',
    button: 'bg-purple-600 hover:bg-purple-700',
    text: 'text-purple-900',
    badge: 'bg-purple-100 text-purple-800',
  },
  blue: {
    bg: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    button: 'bg-blue-600 hover:bg-blue-700',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-800',
  },
  green: {
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    button: 'bg-green-600 hover:bg-green-700',
    text: 'text-green-900',
    badge: 'bg-green-100 text-green-800',
  },
  orange: {
    bg: 'from-orange-50 to-red-50',
    border: 'border-orange-200',
    button: 'bg-orange-600 hover:bg-orange-700',
    text: 'text-orange-900',
    badge: 'bg-orange-100 text-orange-800',
  },
  gray: {
    bg: 'from-gray-50 to-slate-50',
    border: 'border-gray-200',
    button: 'bg-gray-600 hover:bg-gray-700',
    text: 'text-gray-900',
    badge: 'bg-gray-100 text-gray-800',
  },
  indigo: {
    bg: 'from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    text: 'text-indigo-900',
    badge: 'bg-indigo-100 text-indigo-800',
  },
  teal: {
    bg: 'from-teal-50 to-cyan-50',
    border: 'border-teal-200',
    button: 'bg-teal-600 hover:bg-teal-700',
    text: 'text-teal-900',
    badge: 'bg-teal-100 text-teal-800',
  },
  violet: {
    bg: 'from-violet-50 to-sky-50',
    border: 'border-violet-200',
    button: 'bg-violet-600 hover:bg-violet-700',
    text: 'text-violet-900',
    badge: 'bg-violet-100 text-violet-800',
  },
};

/**
 * 📊 辅助函数
 */

// 获取所有练习类型（数组格式）
export const getAllExerciseTypes = () => {
  return Object.values(EXERCISE_TYPES);
};

// 根据 value 获取类型配置
export const getExerciseType = (value) => {
  return EXERCISE_TYPES[value] || null;
};

// 根据分类过滤
export const getExerciseTypesByCategory = (category) => {
  return getAllExerciseTypes().filter(type => type.category === category);
};

// 获取推荐的类型（基于标签）
export const getRecommendedTypes = (tags = []) => {
  return getAllExerciseTypes().filter(type => 
    type.recommendedFor.some(rec => tags.includes(rec))
  );
};

// 获取类型的配置组件
export const getTypeComponent = (value) => {
  const type = getExerciseType(value);
  if (!type) {
    console.error(`Unknown exercise type: ${value}`);
    return null;
  }
  return type.component;
};

// 获取类型的默认内容
export const getDefaultContent = (value) => {
  const type = getExerciseType(value);
  return type ? type.defaultContent : {};
};

// 检查是否需要特殊配置
export const requiresSpecialConfig = (value) => {
  const type = getExerciseType(value);
  return type ? type.requiresSpecialConfig : false;
};

// 获取颜色方案
export const getColorScheme = (color) => {
  return COLOR_SCHEMES[color] || COLOR_SCHEMES.gray;
};

// 导出默认对象（方便直接导入）
export default {
  EXERCISE_TYPES,
  COLOR_SCHEMES,
  getAllExerciseTypes,
  getExerciseType,
  getExerciseTypesByCategory,
  getRecommendedTypes,
  getTypeComponent,
  getDefaultContent,
  requiresSpecialConfig,
  getColorScheme,
};
