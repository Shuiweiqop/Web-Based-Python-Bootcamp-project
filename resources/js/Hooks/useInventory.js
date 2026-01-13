import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/Lib/api';

/**
 * useInventory Hook
 * 
 * Encapsulates inventory data fetching logic, supporting:
 * - Pagination
 * - Type filtering (backgrounds/avatars/titles/badges)
 * - Rarity filtering
 * - Search
 * - Auto-refresh
 * - Error handling
 * 
 * @param {Object} options - Configuration options
 */
export function useInventory(options = {}) {
  const {
    type = null,
    rarity = null,
    search = '',
    perPage = 20,
    autoLoad = true
  } = options;

  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: perPage
  });

  // Refs for tracking
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  /**
   * Generates a cache key based on parameters
   */
  const getCacheKey = useCallback((params) => {
    return JSON.stringify({
      type: params.type,
      rarity: params.rarity,
      search: params.search,
      page: params.page
    });
  }, []);

  /**
   * Fetches inventory data from the server
   */
  const fetchInventory = useCallback(async (page = 1, useCache = true) => {
    // Abort previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const params = { type, rarity, search, page, perPage };
    const cacheKey = getCacheKey(params);

    // Check cache
    if (useCache && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      setItems(cached.items);
      setPagination(cached.pagination);
      return cached;
    }

    setLoading(true);
    setError(null);

    // Create new AbortController
    abortControllerRef.current = new AbortController();

    try {
      const response = await api.get('/student/inventory', {
        params: {
          type,
          rarity,
          search,
          page,
          per_page: perPage
        },
        signal: abortControllerRef.current.signal
      });

      const data = response.data;

      // Update state
      setItems(data.items || []);
      setPagination({
        currentPage: data.current_page || 1,
        totalPages: data.last_page || 1,
        total: data.total || 0,
        perPage: data.per_page || perPage
      });

      // Cache the result
      cacheRef.current.set(cacheKey, {
        items: data.items || [],
        pagination: {
          currentPage: data.current_page || 1,
          totalPages: data.last_page || 1,
          total: data.total || 0,
          perPage: data.per_page || perPage
        }
      });

      setLoading(false);
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled, do nothing
        return;
      }

      console.error('Failed to fetch inventory:', err);
      setError(err.response?.data?.message || 'Failed to load inventory');
      setLoading(false);
      throw err;
    }
  }, [type, rarity, search, perPage, getCacheKey]);

  /**
   * Refresh the current page (bypass cache)
   */
  const refresh = useCallback(() => {
    cacheRef.current.clear();
    return fetchInventory(pagination.currentPage, false);
  }, [fetchInventory, pagination.currentPage]);

  /**
   * Load a specific page
   */
  const loadPage = useCallback((page) => {
    return fetchInventory(page, true);
  }, [fetchInventory]);

  /**
   * Load next page
   */
  const loadNextPage = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages) {
      return fetchInventory(pagination.currentPage + 1, true);
    }
  }, [fetchInventory, pagination.currentPage, pagination.totalPages]);

  /**
   * Load previous page
   */
  const loadPrevPage = useCallback(() => {
    if (pagination.currentPage > 1) {
      return fetchInventory(pagination.currentPage - 1, true);
    }
  }, [fetchInventory, pagination.currentPage]);

  /**
   * Clear all inventory cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  /**
   * Find an item within the current local items by ID
   */
  const findItemById = useCallback((itemId) => {
    return items.find(item => 
      (item.reward?.reward_id || item.id) === itemId
    );
  }, [items]);

  /**
   * Client-side filter by type
   */
  const filterByType = useCallback((itemType) => {
    return items.filter(item => 
      (item.reward?.reward_type || item.type) === itemType
    );
  }, [items]);

  /**
   * Client-side filter by rarity
   */
  const filterByRarity = useCallback((rarityLevel) => {
    return items.filter(item => 
      (item.reward?.rarity || item.rarity) === rarityLevel
    );
  }, [items]);

  // Auto-load logic
  useEffect(() => {
    if (autoLoad) {
      fetchInventory(1, true);
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoLoad, type, rarity, search]);

  return {
    items,
    loading,
    error,
    pagination,
    refresh,
    loadPage,
    loadNextPage,
    loadPrevPage,
    clearCache,
    findItemById,
    filterByType,
    filterByRarity,
    hasNextPage: pagination.currentPage < pagination.totalPages,
    hasPrevPage: pagination.currentPage > 1,
    isEmpty: !loading && items.length === 0,
  };
}

/**
 * useInventoryItem Hook
 * 
 * Fetches details for a single item
 */
export function useInventoryItem(itemId, options = {}) {
  const { autoLoad = true } = options;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItem = useCallback(async () => {
    if (!itemId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/student/inventory/${itemId}`);
      setItem(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch item:', err);
      setError(err.response?.data?.message || 'Failed to load item');
      setLoading(false);
      throw err;
    }
  }, [itemId]);

  const refresh = useCallback(() => {
    return fetchItem();
  }, [fetchItem]);

  useEffect(() => {
    if (autoLoad && itemId) {
      fetchItem();
    }
  }, [autoLoad, itemId, fetchItem]);

  return {
    item,
    loading,
    error,
    refresh
  };
}

export default useInventory;