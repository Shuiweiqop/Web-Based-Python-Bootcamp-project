import React, { useState, useEffect } from 'react';
import { Target, Package } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function CharacterCard({ 
  user, 
  profile, 
  equipped,
  inventoryItems,
  onEquipmentChange 
}) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    updateTheme();
    window.addEventListener('theme-changed', updateTheme);
    return () => window.removeEventListener('theme-changed', updateTheme);
  }, []);

  // 从 equipped 数据中获取装备的物品
  const equippedAvatar = equipped?.avatar_frame;
  const equippedBackground = equipped?.background || equipped?.profile_background;
  const equippedTitle = equipped?.title;
  const equippedBadges = equipped?.badges || [];

  // 获取头像 URL
  const getAvatarUrl = () => {
    // 1. 如果有装备的头像框，使用它
    if (equippedAvatar?.image_url) {
      return equippedAvatar.image_url;
    }
    // 2. 使用用户的头像（Controller 传递的是 'avatar' 字段）
    if (user?.avatar) {
      return user.avatar;
    }
    // 3. 后备：profile_picture（兼容其他可能的数据源）
    if (user?.profile_picture) {
      return user.profile_picture;
    }
    return null;
  };

  // 获取背景图片 URL
  const getBackgroundUrl = () => {
    if (equippedBackground?.image_url) {
      return equippedBackground.image_url;
    }
    return null;
  };

  // 生成用户首字母
  const getInitials = () => {
    if (!user?.name) return '?';
    
    const names = user.name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const avatarUrl = getAvatarUrl();
  const backgroundUrl = getBackgroundUrl();

  return (
    <div className={cn(
      "rounded-2xl border-2 p-6 card-hover-effect overflow-hidden relative animate-fadeIn",
      isDark 
        ? "glassmorphism-enhanced border-purple-500/30" 
        : "bg-white border-purple-200 shadow-lg"
    )}>
      {/* 背景图片 */}
      {backgroundUrl && (
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      )}

      {/* 内容 */}
      <div className="relative z-10">
        {/* 头像区域 */}
        <div className="flex flex-col items-center mb-6">
          {/* 头像 + 头像框 */}
          <div className="relative mb-4">
            {/* 外圈发光效果 */}
            <div className={cn(
              "absolute inset-0 rounded-full animate-glowPulse",
              equippedAvatar 
                ? "bg-gradient-to-br from-purple-500 to-pink-500" 
                : "bg-gradient-to-br from-blue-500 to-cyan-500"
            )} style={{ padding: '4px' }}>
              <div className={cn(
                "w-full h-full rounded-full",
                isDark ? "bg-slate-900" : "bg-white"
              )} />
            </div>

            {/* 头像 */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={cn(
                  "w-full h-full flex items-center justify-center text-4xl font-bold",
                  "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                )}>
                  {getInitials()}
                </div>
              )}
            </div>
          </div>

          {/* 用户名 */}
          <h2 className={cn(
            "text-2xl font-bold text-center mb-1",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {user?.name}
          </h2>

          {/* 装备的称号 */}
          {equippedTitle && (
            <div className={cn(
              "px-4 py-1.5 rounded-full text-sm font-bold mb-2",
              "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md"
            )}>
              {equippedTitle.name}
            </div>
          )}

          {/* 🎓 学生徽章（可选：如果你想显示） */}
          {user?.role === 'student' && (
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold",
              isDark 
                ? "bg-blue-500/20 text-blue-300" 
                : "bg-blue-100 text-blue-800"
            )}>
              🎓 Student
            </div>
          )}
        </div>

        {/* 装备的徽章(们) - 只显示第一个徽章 */}
        {equippedBadges.length > 0 && (
          <div className={cn(
            "mb-4 p-3 rounded-xl text-center",
            isDark 
              ? "bg-purple-500/20 border border-purple-500/30" 
              : "bg-purple-50 border border-purple-200"
          )}>
            <div className="text-3xl mb-1">
              {equippedBadges[0].icon || equippedBadges[0].metadata?.icon || '🏆'}
            </div>
            <div className={cn(
              "text-sm font-bold",
              isDark ? "text-purple-300" : "text-purple-700"
            )}>
              {equippedBadges[0].name}
            </div>
            {equippedBadges.length > 1 && (
              <div className={cn(
                "text-xs mt-1",
                isDark ? "text-purple-400" : "text-purple-600"
              )}>
                +{equippedBadges.length - 1} more
              </div>
            )}
          </div>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3">
          {/* Streak Days */}
          <div className={cn(
            "p-4 rounded-xl text-center",
            isDark 
              ? "bg-white/5 border border-white/10" 
              : "bg-gray-50 border border-gray-200"
          )}>
            <div className="text-3xl mb-2">🔥</div>
            <div className={cn(
              "text-2xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {profile?.streak_days || 0}
            </div>
            <div className={cn(
              "text-xs mt-1",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>
              Day Streak
            </div>
          </div>

          {/* Items Count */}
          <div className={cn(
            "p-4 rounded-xl text-center",
            isDark 
              ? "bg-white/5 border border-white/10" 
              : "bg-gray-50 border border-gray-200"
          )}>
            <Package className={cn(
              "w-6 h-6 mx-auto mb-2",
              isDark ? "text-cyan-400" : "text-cyan-600"
            )} />
            <div className={cn(
              "text-2xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {inventoryItems?.length || 0}
            </div>
            <div className={cn(
              "text-xs mt-1",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>
              Items
            </div>
          </div>
        </div>

        {/* 装备预览 */}
        <div className={cn(
          "mt-4 p-3 rounded-xl",
          isDark 
            ? "bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20" 
            : "bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-200"
        )}>
          <div className={cn(
            "text-xs font-semibold mb-2 flex items-center gap-2",
            isDark ? "text-gray-300" : "text-gray-700"
          )}>
            <Target className="w-3 h-3" />
            Equipped Items
          </div>
          <div className="space-y-1">
            <EquipSlot 
              label="Avatar Frame" 
              item={equippedAvatar} 
              isDark={isDark}
            />
            <EquipSlot 
              label="Background" 
              item={equippedBackground} 
              isDark={isDark}
            />
            <EquipSlot 
              label="Title" 
              item={equippedTitle} 
              isDark={isDark}
            />
            {equippedBadges.length > 0 && (
              <div className={cn(
                "text-xs py-1 px-2 rounded flex justify-between",
                isDark ? "bg-white/5" : "bg-white"
              )}>
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                  Badges
                </span>
                <span className={cn(
                  "font-medium",
                  isDark ? "text-purple-300" : "text-purple-600"
                )}>
                  {equippedBadges.length} equipped
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes glowPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-glowPulse {
          animation: glowPulse 2s ease-in-out infinite;
        }
        
        .glassmorphism-enhanced {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        .card-hover-effect {
          transition: all 0.3s ease;
        }
        
        .card-hover-effect:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

// 装备槽位组件
function EquipSlot({ label, item, isDark }) {
  return (
    <div className={cn(
      "text-xs py-1 px-2 rounded flex justify-between",
      isDark ? "bg-white/5" : "bg-white"
    )}>
      <span className={isDark ? "text-gray-400" : "text-gray-500"}>
        {label}
      </span>
      <span className={cn(
        "font-medium truncate ml-2",
        item 
          ? (isDark ? "text-purple-300" : "text-purple-600")
          : (isDark ? "text-gray-600" : "text-gray-400")
      )}>
        {item?.name || 'None'}
      </span>
    </div>
  );
}