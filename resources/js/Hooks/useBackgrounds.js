import { useState, useEffect, useCallback, useMemo } from 'react';
import backgrounds, {
  getBackgroundById,
  getBackgroundsByRarity,
  getBackgroundsByType,
  getBackgroundsByCategory,
  getAnimatedBackgrounds,
  getDefaultBackground,
  searchBackgrounds,
  BACKGROUND_TYPES,
  RARITY_LEVELS
} from '@/Config/backgrounds';

/**
 * useBackgrounds Hook
 * 
 * 管理背景配置，支持：
 * - 获取所有背景
 * - 过滤（类型、稀有度、分类）
 * - 搜索
 * - 与用户背包数据合并
 * 
 * @param {Object} options - 配置选项
 * @param {string} options.type - 背景类型过滤
 * @param {string} options.rarity - 稀有度过滤
 * @param {string} options.category - 分类过滤
 * @param {string} options.search - 搜索关键词
 * @param {Array} options.ownedIds - 用户拥有的背景 ID 列表
 * @param {boolean} options.animatedOnly - 仅显示动画背景
 * 
 * @returns {Object} - 返回背景数据和工具方法
 */
export function useBackgrounds(options = {}) {
  const {
    type = null,
    rarity = null,
    category = null,
    search = '',
    ownedIds = [],
    animatedOnly = false
  } = options;

  // State
  const [allBackgrounds] = useState(backgrounds);
  const [filteredBackgrounds, setFilteredBackgrounds] = useState(backgrounds);

  /**
   * 应用所有过滤器
   */
  const applyFilters = useCallback(() => {
    let result = [...allBackgrounds];

    // 类型过滤
    if (type) {
      result = result.filter(bg => bg.type === type);
    }

    // 稀有度过滤
    if (rarity) {
      result = result.filter(bg => bg.rarity === rarity);
    }

    // 分类过滤
    if (category) {
      result = result.filter(bg => bg.metadata.category === category);
    }

    // 动画过滤
    if (animatedOnly) {
      result = result.filter(bg => bg.animated === true);
    }

    // 搜索过滤
    if (search && search.trim()) {
      const lowerQuery = search.toLowerCase();
      result = result.filter(bg =>
        bg.name.toLowerCase().includes(lowerQuery) ||
        bg.description.toLowerCase().includes(lowerQuery) ||
        bg.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    setFilteredBackgrounds(result);
  }, [allBackgrounds, type, rarity, category, animatedOnly, search]);

  /**
   * 获取拥有的背景
   */
  const ownedBackgrounds = useMemo(() => {
    if (!ownedIds || ownedIds.length === 0) return [];
    return filteredBackgrounds.filter(bg => ownedIds.includes(bg.id));
  }, [filteredBackgrounds, ownedIds]);

  /**
   * 获取未拥有的背景
   */
  const unownedBackgrounds = useMemo(() => {
    if (!ownedIds || ownedIds.length === 0) return filteredBackgrounds;
    return filteredBackgrounds.filter(bg => !ownedIds.includes(bg.id));
  }, [filteredBackgrounds, ownedIds]);

  /**
   * 按稀有度分组
   */
  const groupedByRarity = useMemo(() => {
    return {
      common: filteredBackgrounds.filter(bg => bg.rarity === RARITY_LEVELS.COMMON),
      rare: filteredBackgrounds.filter(bg => bg.rarity === RARITY_LEVELS.RARE),
      epic: filteredBackgrounds.filter(bg => bg.rarity === RARITY_LEVELS.EPIC),
      legendary: filteredBackgrounds.filter(bg => bg.rarity === RARITY_LEVELS.LEGENDARY)
    };
  }, [filteredBackgrounds]);

  /**
   * 按类型分组
   */
  const groupedByType = useMemo(() => {
    return {
      gradient: filteredBackgrounds.filter(bg => bg.type === BACKGROUND_TYPES.GRADIENT),
      image: filteredBackgrounds.filter(bg => bg.type === BACKGROUND_TYPES.IMAGE),
      animated: filteredBackgrounds.filter(bg => bg.type === BACKGROUND_TYPES.ANIMATED)
    };
  }, [filteredBackgrounds]);

  /**
   * 检查是否拥有某个背景
   */
  const isOwned = useCallback((backgroundId) => {
    return ownedIds.includes(backgroundId);
  }, [ownedIds]);

  /**
   * 获取背景详情
   */
  const getBackground = useCallback((backgroundId) => {
    return getBackgroundById(backgroundId);
  }, []);

  /**
   * 获取推荐背景（基于稀有度和价格）
   */
  const getRecommended = useCallback((count = 6) => {
    // 优先推荐 Epic 和 Rare，排除已拥有
    const candidates = unownedBackgrounds.filter(bg => 
      bg.rarity === RARITY_LEVELS.EPIC || bg.rarity === RARITY_LEVELS.RARE
    );

    // 按价格排序
    return candidates
      .sort((a, b) => a.price - b.price)
      .slice(0, count);
  }, [unownedBackgrounds]);

  /**
   * 获取特色背景（动画 + 高稀有度）
   */
  const getFeatured = useCallback(() => {
    return filteredBackgrounds.filter(bg => 
      bg.animated && (bg.rarity === RARITY_LEVELS.EPIC || bg.rarity === RARITY_LEVELS.LEGENDARY)
    );
  }, [filteredBackgrounds]);

  // 应用过滤器（依赖变化时重新过滤）
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    // 数据
    backgrounds: filteredBackgrounds,
    allBackgrounds,
    ownedBackgrounds,
    unownedBackgrounds,
    groupedByRarity,
    groupedByType,

    // 统计
    total: filteredBackgrounds.length,
    ownedCount: ownedBackgrounds.length,
    unownedCount: unownedBackgrounds.length,

    // 工具方法
    getBackground,
    isOwned,
    getRecommended,
    getFeatured,

    // 常量
    BACKGROUND_TYPES,
    RARITY_LEVELS
  };
}

/**
 * useBackground Hook
 * 
 * 获取单个背景详情
 * 
 * @param {string} backgroundId - 背景 ID
 * @param {Array} ownedIds - 用户拥有的背景 ID 列表
 * 
 * @returns {Object} - 返回背景详情和状态
 */
export function useBackground(backgroundId, ownedIds = []) {
  const background = useMemo(() => {
    return getBackgroundById(backgroundId);
  }, [backgroundId]);

  const isOwned = useMemo(() => {
    return ownedIds.includes(backgroundId);
  }, [backgroundId, ownedIds]);

  const isAnimated = useMemo(() => {
    return background?.animated === true;
  }, [background]);

  const rarityColor = useMemo(() => {
    if (!background) return 'gray';
    
    const colorMap = {
      [RARITY_LEVELS.COMMON]: 'gray',
      [RARITY_LEVELS.RARE]: 'blue',
      [RARITY_LEVELS.EPIC]: 'purple',
      [RARITY_LEVELS.LEGENDARY]: 'orange'
    };
    
    return colorMap[background.rarity] || 'gray';
  }, [background]);

  return {
    background,
    isOwned,
    isAnimated,
    rarityColor,
    exists: background !== undefined
  };
}

/**
 * useBackgroundPreview Hook
 * 
 * 管理背景预览状态
 * 
 * @returns {Object} - 返回预览状态和控制方法
 */
export function useBackgroundPreview() {
  const [previewBackground, setPreviewBackground] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = useCallback((background) => {
    setPreviewBackground(background);
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
    // 延迟清除，等待关闭动画完成
    setTimeout(() => {
      setPreviewBackground(null);
    }, 300);
  }, []);

  const togglePreview = useCallback((background) => {
    if (isPreviewOpen && previewBackground?.id === background?.id) {
      closePreview();
    } else {
      openPreview(background);
    }
  }, [isPreviewOpen, previewBackground, openPreview, closePreview]);

  return {
    previewBackground,
    isPreviewOpen,
    openPreview,
    closePreview,
    togglePreview
  };
}

/**
 * useDefaultBackground Hook
 * 
 * 获取默认背景
 * 
 * @returns {Object} - 返回默认背景
 */
export function useDefaultBackground() {
  return useMemo(() => getDefaultBackground(), []);
}

export default useBackgrounds;