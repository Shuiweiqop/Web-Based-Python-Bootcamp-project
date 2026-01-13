// resources/js/hooks/useNotifications.js

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * 通知管理 Hook（Inertia-safe）
 *
 * @param {Object} options
 * @param {boolean} options.autoRefresh
 * @param {number} options.refreshInterval
 * @param {number} options.limit
 */
export function useNotifications(options = {}) {
    const {
        autoRefresh = false,
        refreshInterval = 30000,
        limit = 10,
    } = options;

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 防止并发 & 竞态
    const isFetchingRef = useRef(false);
    const mountedRef = useRef(false);

    /**
     * 拉取未读通知（稳定函数，不进依赖）
     */
    const fetchNotifications = async () => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.get(
                `/student/notifications/unread?limit=${limit}`
            );

            if (data?.success) {
                setNotifications(data.notifications ?? []);
                setUnreadCount(data.unread_count ?? 0);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch notifications');
            console.error('[Notifications] fetch failed:', err);
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
        }
    };

    /**
     * 仅在首次 mount 时加载一次
     */
    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;

        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * 自动刷新（明确、可控）
     */
    useEffect(() => {
        if (!autoRefresh) return;

        const id = setInterval(() => {
            fetchNotifications();
        }, refreshInterval);

        return () => clearInterval(id);
    }, [autoRefresh, refreshInterval]);

    /**
     * 标记单条已读
     */
    const markAsRead = async (notificationId) => {
        await axios.post(`/student/notifications/${notificationId}/read`);

        setNotifications(prev =>
            prev.map(n =>
                n.notification_id === notificationId
                    ? { ...n, is_read: true, read_at: new Date().toISOString() }
                    : n
            )
        );

        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    /**
     * 标记全部已读
     */
    const markAllAsRead = async () => {
        await axios.post('/student/notifications/read-all');

        setNotifications(prev =>
            prev.map(n => ({
                ...n,
                is_read: true,
                read_at: new Date().toISOString(),
            }))
        );

        setUnreadCount(0);
    };

    /**
     * 删除通知（无闭包陷阱）
     */
    const deleteNotification = async (notificationId) => {
        await axios.delete(`/student/notifications/${notificationId}`);

        setNotifications(prev => {
            const target = prev.find(n => n.notification_id === notificationId);

            if (target && !target.is_read) {
                setUnreadCount(count => Math.max(0, count - 1));
            }

            return prev.filter(n => n.notification_id !== notificationId);
        });
    };

    return {
        notifications,
        unreadCount,
        loading,
        error,

        // actions
        refresh: fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    };
}
