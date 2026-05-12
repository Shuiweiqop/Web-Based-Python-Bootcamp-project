import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';

const EquipContext = createContext(null);

/**
 * ✅ EquipProvider - 装备状态管理（Inertia 版本）
 */
export function EquipProvider({ children }) {
  const { props } = usePage();
  
  // ✅ 直接使用 Inertia props
  const [equipped, setEquipped] = useState(props.equipped || {
    background: null,
    avatar_frame: null,
    title: null,
    badges: [],
    updated_at: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [themeVariant, setThemeVariant] = useState('dark');
  
  const prevRef = useRef(equipped);
  const pendingRef = useRef(false);

  // ✅ 监听 props.equipped 变化
  useEffect(() => {
    if (props.equipped) {
      setEquipped(props.equipped);
      prevRef.current = props.equipped;
    }
  }, [props.equipped?.updated_at]); // 监听 timestamp 变化

  // ✅ 监听 flash 消息中的 equipped
  useEffect(() => {
    if (props.flash?.equipped) {
      setEquipped(props.flash.equipped);
      prevRef.current = props.flash.equipped;
    }
  }, [props.flash?.equipped]);

  /**
   * ✅ 装备物品（使用 Inertia router.post）
   */
  const equipItem = useCallback(async (item) => {
    if (!item || pendingRef.current) {
      console.warn('❌ [EquipContext] Invalid equip or operation in progress');
      return;
    }

    const inventoryId = item.inventory_id || item.id;
    const type = item?.reward?.reward_type || item?.reward_type || item?.type;
    
    if (!inventoryId || !type) {
      console.warn('❌ [EquipContext] Missing parameters:', { inventoryId, type });
      setError('Missing required parameters');
      return;
    }

    pendingRef.current = true;
    setLoading(true);
    setError(null);

    // ✅ Optimistic update
    prevRef.current = equipped;
    const typeKey = type === 'profile_background' ? 'background' : type;
    
    const optimisticPayload = {
      id: item.reward?.reward_id ?? item.reward_id ?? item.id,
      name: item.reward?.name ?? item.name,
      image_url: item.reward?.image_url ?? item.image_url,
      reward_type: type,
      rarity: item.reward?.rarity ?? item.rarity,
      metadata: item.reward?.metadata ?? item.metadata ?? {},
    };

    setEquipped(prev => ({
      ...prev,
      [typeKey]: optimisticPayload,
      updated_at: Date.now(),
    }));

    try {
      // ✅ 使用 Inertia router（会自动重定向）
      router.post(
        `/student/inventory/${inventoryId}/equip`,
        {},
        {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => {
            pendingRef.current = false;
            setLoading(false);
            
            // ✅ Inertia 会自动更新 props，触发上面的 useEffect
          },
          onError: (errors) => {
            console.error('❌ [EquipContext] Equip failed:', errors);
            
            // 回滚 optimistic update
            setEquipped(prevRef.current);
            setError(errors.equip || 'Failed to equip item');
            pendingRef.current = false;
            setLoading(false);
          },
        }
      );
    } catch (err) {
      console.error('❌ [EquipContext] Equip exception:', err);
      setEquipped(prevRef.current);
      setError(err.message || 'Failed to equip item');
      pendingRef.current = false;
      setLoading(false);
    }
  }, [equipped]);

  /**
   * ✅ 卸载物品（使用 Inertia router.post）
   */
  const unequipItem = useCallback(async (inventoryId, type) => {
    if (!inventoryId || pendingRef.current) {
      console.warn('❌ [EquipContext] Invalid unequip or operation in progress');
      return;
    }

    pendingRef.current = true;
    setLoading(true);
    setError(null);
    
    prevRef.current = equipped;

    // ✅ Optimistic update - 设置为 null
    const typeKey = type === 'profile_background' ? 'background' : type;
    
    setEquipped(prev => ({
      ...prev,
      [typeKey]: null,
      updated_at: Date.now(),
    }));

    try {
      router.post(
        `/student/inventory/${inventoryId}/unequip`,
        {},
        {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => {
            pendingRef.current = false;
            setLoading(false);
          },
          onError: (errors) => {
            console.error('❌ [EquipContext] Unequip failed:', errors);
            
            setEquipped(prevRef.current);
            setError(errors.unequip || 'Failed to unequip item');
            pendingRef.current = false;
            setLoading(false);
          },
        }
      );
    } catch (err) {
      console.error('❌ [EquipContext] Unequip exception:', err);
      setEquipped(prevRef.current);
      setError(err.message || 'Failed to unequip item');
      pendingRef.current = false;
      setLoading(false);
    }
  }, [equipped]);

  /**
   * 获取装备状态（从服务器刷新）- 使用 fetch（返回 JSON）
   */
  const fetchEquipped = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/student/inventory/equipped', {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.equipped) {
        setEquipped(data.equipped);
        prevRef.current = data.equipped;
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ [EquipContext] Fetch failed:', err);
      setError(err.message || 'Failed to fetch equipped state');
      setLoading(false);
    }
  }, []);

  /**
   * 回滚到上一个状态
   */
  const rollbackEquipped = useCallback(() => {
    if (prevRef.current) {
      setEquipped(prevRef.current);
      setError(null);
    }
  }, []);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 检查是否已装备
   */
  const isEquipped = useCallback((type, itemId) => {
    const typeKey = type === 'profile_background' ? 'background' : type;
    const equippedItem = equipped[typeKey];
    if (!equippedItem) return false;
    return equippedItem.id === itemId || equippedItem.reward_id === itemId;
  }, [equipped]);

  /**
   * 更新主题变量
   */
  const updateThemeVariant = useCallback((variant) => {
    if (variant === 'light' || variant === 'dark') {
      setThemeVariant(prev => prev === variant ? prev : variant);
    }
  }, []);

  /**
   * 强制刷新
   */
  const forceRefresh = useCallback(() => {
    fetchEquipped();
  }, [fetchEquipped]);

  return (
    <EquipContext.Provider value={{
      equipped,
      loading,
      error,
      themeVariant,
      updateThemeVariant,
      equipItem,
      unequipItem,
      fetchEquipped,
      rollbackEquipped,
      clearError,
      isEquipped,
      forceRefresh,
      isPending: pendingRef.current,
    }}>
      {children}
    </EquipContext.Provider>
  );
}

/**
 * useEquip Hook
 */
export function useEquip() {
  const ctx = useContext(EquipContext);
  if (!ctx) {
    throw new Error('useEquip must be used inside EquipProvider');
  }
  return ctx;
}

export default EquipContext;
