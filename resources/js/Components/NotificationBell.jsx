// resources/js/Components/NotificationBell.jsx

import { useState, useRef, useEffect } from 'react';
import { 
    Bell, 
    X, 
    CheckCheck, 
    Trash2,
    Gift,              // ✅ 添加
    BookOpen,          // ✅ 添加
    Trophy,            // ✅ 添加
    Sparkles,          // ✅ 添加
    MessageCircle,     // ✅ 添加
    AlertCircle,       // ✅ 添加
    Heart,             // ✅ 添加
    AtSign,            // ✅ 添加
    Info,              // ✅ 添加
    Megaphone,         // ✅ 添加
    ShoppingCart,      // ✅ 添加
} from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import { useNotificationsContext } from '@/Contexts/NotificationsContext';

export default function NotificationBell() {
    const { auth } = usePage().props;

    // ✅ 提前检查角色，在调用 Hook 之前
    if (!auth?.user || auth.user.role !== 'student') {
        return null;
    }

    // ✅ 现在才调用 Context Hook（只有 student 角色会走到这里）
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh,
    } = useNotificationsContext();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Refresh notifications when opening dropdown
    const handleToggle = () => {
        if (!isOpen) {
            refresh();
        }
        setIsOpen(!isOpen);
    };

    // Mark as read and navigate
    const handleNotificationClick = async (notification) => {
        try {
            await markAsRead(notification.notification_id);
            
            if (notification.action_url) {
                router.visit(notification.action_url);
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Delete notification
    const handleDelete = async (notificationId, e) => {
        e.stopPropagation();
        
        try {
            await deleteNotification(notificationId);
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // 🎨 Icon mapping
    const getIcon = (iconName) => {
        const icons = {
            bell: Bell,
            gift: Gift,
            'book-open': BookOpen,
            trophy: Trophy,
            sparkles: Sparkles,
            'message-circle': MessageCircle,
            'alert-circle': AlertCircle,
            'check-circle': CheckCheck,
            heart: Heart,
            'at-sign': AtSign,
            info: Info,
            megaphone: Megaphone,
            'shopping-cart': ShoppingCart,
        };
        return icons[iconName] || Bell;
    };

    // 🎨 Color mapping
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
        <div className="relative" ref={dropdownRef}>
            {/* 🔔 Bell button */}
            <button
                onClick={handleToggle}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Notifications"
                title="Notifications"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* 📋 Notification dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Notification list content */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Bell className="w-16 h-16 mb-3 text-gray-300" />
                                <p className="text-sm">No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map(notification => {
                                    const IconComponent = getIcon(notification.display_icon);
                                    return (
                                        <div
                                            key={notification.notification_id}
                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                !notification.is_read ? 'bg-blue-50/50' : ''
                                            }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                {/* Icon */}
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColorClass(notification.display_color)}`}>
                                                    <IconComponent className="w-5 h-5" />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.is_read && (
                                                            <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-2 mt-1 leading-snug">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-gray-500">
                                                            {notification.time_ago}
                                                        </span>
                                                        <button
                                                            onClick={(e) => handleDelete(notification.notification_id, e)}
                                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer - View all */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    router.visit('/student/notifications');
                                    setIsOpen(false);
                                }}
                                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}