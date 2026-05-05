import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Bell,
    Filter,
    CheckCheck,
    Trash2,
    AlertCircle,
    Gift,
    BookOpen,
    Trophy,
    Sparkles,
    MessageCircle,
    Heart,
    AtSign,
    Info,
    Megaphone,
    ShoppingCart,
    Clipboard,
} from 'lucide-react';
import axios from 'axios';

export default function NotificationIndex({ auth, notifications, stats, filters, notificationTypes }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [processing, setProcessing] = useState(false);
    const notifyBellSync = () => window.dispatchEvent(new Event('notifications:changed'));

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === notifications.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(notifications.data.map((notification) => notification.notification_id));
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/student/notifications/${notificationId}/read`);
            notifyBellSync();
            router.reload({ only: ['notifications', 'stats'] });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!confirm('Mark all notifications as read?')) return;

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

    const deleteNotification = async (notificationId) => {
        if (!confirm('Delete this notification?')) return;

        try {
            await axios.delete(`/student/notifications/${notificationId}`);
            notifyBellSync();
            router.reload({ only: ['notifications', 'stats'] });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const deleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} selected notifications?`)) return;

        setProcessing(true);
        try {
            await axios.delete('/student/notifications/bulk/delete', {
                data: { notification_ids: selectedIds }
            });
            notifyBellSync();
            setSelectedIds([]);
            router.reload({ only: ['notifications', 'stats'] });
        } catch (error) {
            console.error('Failed to delete selected notifications:', error);
        } finally {
            setProcessing(false);
        }
    };

    const clearRead = async () => {
        if (!confirm('Clear all read notifications?')) return;

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

    const handleFilter = (key, value) => {
        router.get('/student/notifications', {
            ...filters,
            [key]: value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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
            <Head title="Notification Center" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Bell className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">Unread Notifications</p>
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
                                        <p className="text-sm text-gray-600">All Notifications</p>
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
                                        <p className="text-sm text-gray-600">High Priority</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.high_priority_count}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Filter className="w-5 h-5 text-gray-400" />

                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilter('status', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="unread">Unread</option>
                                        <option value="read">Read</option>
                                    </select>

                                    <select
                                        value={filters.type}
                                        onChange={(e) => handleFilter('type', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Types</option>
                                        {Object.entries(notificationTypes).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={filters.priority}
                                        onChange={(e) => handleFilter('priority', e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Priorities</option>
                                        <option value="urgent">Urgent</option>
                                        <option value="high">High</option>
                                        <option value="normal">Normal</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    {selectedIds.length > 0 && (
                                        <>
                                            <span className="text-sm text-gray-600">
                                                {selectedIds.length} selected
                                            </span>
                                            <button
                                                onClick={markSelectedAsRead}
                                                disabled={processing}
                                                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                Mark Read
                                            </button>
                                            <button
                                                onClick={deleteSelected}
                                                disabled={processing}
                                                className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}

                                    {stats.unread_count > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            disabled={processing}
                                            className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Mark All Read
                                        </button>
                                    )}

                                    <button
                                        onClick={clearRead}
                                        disabled={processing}
                                        className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        Clear Read
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {notifications.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Bell className="w-16 h-16 text-gray-300 mb-4" />
                                    <p className="text-gray-500">No notifications yet</p>
                                </div>
                            ) : (
                                <>
                                    <div className="px-6 py-3 bg-gray-50 flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === notifications.data.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-3 text-sm text-gray-600">Select all</span>
                                    </div>

                                    {notifications.data.map((notification) => {
                                        const IconComponent = getIconComponent(notification.display_icon);
                                        return (
                                            <div
                                                key={notification.notification_id}
                                                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                                                    !notification.is_read ? 'bg-blue-50' : ''
                                                }`}
                                            >
                                                <div className="flex items-start space-x-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(notification.notification_id)}
                                                        onChange={() => toggleSelect(notification.notification_id)}
                                                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />

                                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getColorClass(notification.display_color)}`}>
                                                        <IconComponent className="w-6 h-6" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                                        {notification.title}
                                                                    </h3>
                                                                    {!notification.is_read && (
                                                                        <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                                                                            Unread
                                                                        </span>
                                                                    )}
                                                                    {notification.priority === 'urgent' && (
                                                                        <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                                                                            Urgent
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

                                                        <div className="flex items-center gap-2 mt-3">
                                                            {notification.action_url && (
                                                                <button
                                                                    onClick={() => {
                                                                        markAsRead(notification.notification_id);
                                                                        router.visit(notification.action_url);
                                                                    }}
                                                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                                >
                                                                    {notification.action_text || 'View'}
                                                                </button>
                                                            )}

                                                            {!notification.is_read && (
                                                                <button
                                                                    onClick={() => markAsRead(notification.notification_id)}
                                                                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                                >
                                                                    Mark Read
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => deleteNotification(notification.notification_id)}
                                                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                                                                title="Delete"
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

                        {notifications.data.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing {notifications.meta.from} - {notifications.meta.to} of {notifications.meta.total}
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
