// resources/js/Contexts/NotificationsContext.jsx

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useNotifications } from '@/Hooks/useNotifications';

const NotificationsContext = createContext(null);

/**
 * ✅ NotificationsProvider - 优化版
 */
export function NotificationsProvider({ children }) {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({
    autoRefresh: true,
    refreshInterval: 10000, // ✅ 改为 10 秒（更快响应）
    limit: 10,
  });

  const handleMarkAsRead = useCallback(
    async (notificationId) => {
      try {
        await markAsRead(notificationId);
      } catch (err) {
        console.error('❌ [NotificationsContext] Mark as read failed:', err);
        throw err;
      }
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('❌ [NotificationsContext] Mark all failed:', err);
      throw err;
    }
  }, [markAllAsRead]);

  const handleDelete = useCallback(
    async (notificationId) => {
      try {
        await deleteNotification(notificationId);
      } catch (err) {
        console.error('❌ [NotificationsContext] Delete failed:', err);
        throw err;
      }
    },
    [deleteNotification]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      refresh,
      markAsRead: handleMarkAsRead,
      markAllAsRead: handleMarkAllAsRead,
      deleteNotification: handleDelete,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      refresh,
      handleMarkAsRead,
      handleMarkAllAsRead,
      handleDelete,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

/**
 * ✅ useNotificationsContext Hook
 */
export function useNotificationsContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotificationsContext must be used inside NotificationsProvider');
  }
  return ctx;
}

export default NotificationsContext;
