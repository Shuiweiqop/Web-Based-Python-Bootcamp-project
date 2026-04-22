// resources/js/Pages/Student/Notifications/Index.jsx

import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Bell, 
    Filter, 
    CheckCheck, 
    Trash2, 
    AlertCircle,
    Gift,              // ✅ 添加
    BookOpen,          // ✅ 添加
    Trophy,            // ✅ 添加
    Sparkles,          // ✅ 添加
    MessageCircle,     // ✅ 添加
    Heart,             // ✅ 添加
    AtSign,            // ✅ 添加
    Info,              // ✅ 添加
    Megaphone,         // ✅ 添加
    ShoppingCart,      // ✅ 添加
    Clipboard,         // ✅ 添加 (用于 test)
} from 'lucide-react';
import axios from 'axios';

export default function NotificationIndex({ auth, notifications, stats, filters, notificationTypes }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [processing, setProcessing] = useState(false);
    const notifyBellSync = () => window.dispatchEvent(new Event('notifications:changed'));

    // 选择/取消选择通知
    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    // 全选/取消全选
    const toggleSelectAll = () => {
        if (selectedIds.length === notifications.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(notifications.data.map(n => n.notification_id));
        }
    };

    // 标记单个为已读
    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/student/notifications/${notificationId}/read`);
            notifyBellSync();
            router.reload({ only: ['notifications', 'stats'] });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // 标记所有为已读
    const markAllAsRead = async () => {
        if (!confirm('确定要标记所有通知为已读吗？')) return;
        
        setProcessing(true);
        try {
            await axios.post('/student/notifications/read-all');
            notifyBellSync();
            router.reload({ only: ['notifications', 'stats'] });
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setProcessing(false);
        }
    };

    // 批量标记为已读
    const markSelectedAsRead = async () => {
        if (selectedIds.length === 0) return;
        
        setProcessing(true);
        try {
            await axios.post('/student/notifications/read-multiple', {
                notification_ids: selectedIds
            });
            notifyBellSync();
            setSelectedIds([]);
            router.reload({ only: ['notifications', 'stats'] });
        } catch (error) {
            console.error('Failed to mark selected as read:', error);
        } finally {
            setProcessing(false);
        }
    };

    // 删除单个通知
    const deleteNotification = async (notificationId) => {
        if (!confirm('确定要删除这条通知吗？')) return;
        
        try {
            await axios.delete(`/student/notifications/${notificationId}`);
            notifyBellSync();
            router.reload({ only: ['notifications', 'stats'] });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    // 批量删除
    const deleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`确定要删除选中的 ${selectedIds.length} 条通知吗？`)) return;
        
        setProcessing(true);
        try {
            await axios.delete('/student/notifications/bulk/delete', {
                data: { notification_ids: selectedIds }
            });
            notifyBellSync();
            setSelectedIds([]);
            router.reload({ only: ['notifications', 'stats'] });
        } catch (error) {
            console.error('Failed to delete selected:', error);
        } finally {
            setProcessing(false);
        }
    };

    // 清理已读通知
    const clearRead = async () => {
        if (!confirm('确定要清理所有已读通知吗？')) return;
        
        setProcessing(true);
        try {
            await axios.delete('/student/notifications/clear/read');
            notifyBellSync();
            router.reload({ only: ['notifications', 'stats'] });
        } catch (error) {
            console.error('Failed to clear read notifications:', error);
        } finally {
            setProcessing(false);
        }
    };

    // 筛选
    const handleFilter = (key, value) => {
        router.get('/student/notifications', {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // 图标映射
    const getIconComponent = (iconName) => {
        const icons = {
            bell: Bell,
            gift: Gift,
            'book-open': BookOpen,
            trophy: Trophy,
            sparkles: Sparkles,
            'message-circle': MessageCircle,
            'alert-circle': AlertCircle,
            clipboard: Clipboard,
            heart: Heart,
            'at-sign': AtSign,
            info: Info,
            megaphone: Megaphone,
            'shopping-cart': ShoppingCart,
        };
        return icons[iconName] || Bell;
    };

    // 颜色映射
    const getColorClass = (color) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            red: 'bg-red-100 text-red-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            purple: 'bg-purple-100 text-purple-600',
            pink: 'bg-pink-100 text-pink-600',
            orange: 'bg-orange-100 text-orange-600',
            gray: 'bg-gray-100 text-gray-600',
        };
        return colors[color] || colors.blue;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="通知中心" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* 头部 */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">通知中心</h1>
                        
                        {/* 统计卡片 */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Bell className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">未读通知</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.unread_count}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-center">
                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <CheckCheck className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">全部通知</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_count}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-center">
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">高优先级</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.high_priority_count}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 筛选和操作栏 */}
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                {/* 筛选 */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <Filter className="w-5 h-5 text-gray-400" />
                                    
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilter('status', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">全部状态</option>
                                        <option value="unread">未读</option>
                                        <option value="read">已读</option>
                                    </select>

                                    <select
                                        value={filters.type}
                                        onChange={(e) => handleFilter('type', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">全部类型</option>
                                        {Object.entries(notificationTypes).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={filters.priority}
                                        onChange={(e) => handleFilter('priority', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">全部优先级</option>
                                        <option value="urgent">紧急</option>
                                        <option value="high">高</option>
                                        <option value="normal">普通</option>
                                        <option value="low">低</option>
                                    </select>
                                </div>

                                {/* 批量操作 */}
                                <div className="flex items-center gap-2">
                                    {selectedIds.length > 0 && (
                                        <>
                                            <span className="text-sm text-gray-600">
                                                已选 {selectedIds.length} 条
                                            </span>
                                            <button
                                                onClick={markSelectedAsRead}
                                                disabled={processing}
                                                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                标记已读
                                            </button>
                                            <button
                                                onClick={deleteSelected}
                                                disabled={processing}
                                                className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                            >
                                                删除
                                            </button>
                                        </>
                                    )}
                                    
                                    {stats.unread_count > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            disabled={processing}
                                            className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            全部已读
                                        </button>
                                    )}

                                    <button
                                        onClick={clearRead}
                                        disabled={processing}
                                        className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        清理已读
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 通知列表 */}
                        <div className="divide-y divide-gray-200">
                            {notifications.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Bell className="w-16 h-16 text-gray-300 mb-4" />
                                    <p className="text-gray-500">暂无通知</p>
                                </div>
                            ) : (
                                <>
                                    {/* 全选 */}
                                    <div className="px-6 py-3 bg-gray-50 flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === notifications.data.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-3 text-sm text-gray-600">全选</span>
                                    </div>

                                    {notifications.data.map(notification => {
                                        const IconComponent = getIconComponent(notification.display_icon);
                                        return (
                                            <div
                                                key={notification.notification_id}
                                                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                                                    !notification.is_read ? 'bg-blue-50' : ''
                                                }`}
                                            >
                                                <div className="flex items-start space-x-4">
                                                    {/* 选择框 */}
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(notification.notification_id)}
                                                        onChange={() => toggleSelect(notification.notification_id)}
                                                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />

                                                    {/* 图标 */}
                                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getColorClass(notification.display_color)}`}>
                                                        <IconComponent className="w-6 h-6" />
                                                    </div>

                                                    {/* 内容 */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                                        {notification.title}
                                                                    </h3>
                                                                    {!notification.is_read && (
                                                                        <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                                                                            未读
                                                                        </span>
                                                                    )}
                                                                    {notification.priority === 'urgent' && (
                                                                        <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                                                                            紧急
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    {notification.time_ago}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* 操作按钮 */}
                                                        <div className="flex items-center gap-2 mt-3">
                                                            {notification.action_url && (
                                                                <button
                                                                    onClick={() => {
                                                                        markAsRead(notification.notification_id);
                                                                        router.visit(notification.action_url);
                                                                    }}
                                                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                                >
                                                                    {notification.action_text || '查看'}
                                                                </button>
                                                            )}
                                                            
                                                            {!notification.is_read && (
                                                                <button
                                                                    onClick={() => markAsRead(notification.notification_id)}
                                                                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                                >
                                                                    标记已读
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => deleteNotification(notification.notification_id)}
                                                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                                                                title="删除"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        {/* 分页 */}
                        {notifications.data.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        显示 {notifications.meta.from} - {notifications.meta.to} 条，共 {notifications.meta.total} 条
                                    </div>
                                    <div className="flex gap-2">
                                        {notifications.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.visit(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 text-sm rounded ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
