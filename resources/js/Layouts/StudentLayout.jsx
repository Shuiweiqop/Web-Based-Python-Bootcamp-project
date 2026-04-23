import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import BackgroundContainer from './Components/BackgroundContainer';
import GameControlPanel from '@/Components/GameControlPanel';
import SearchBar from '@/Components/SearchBar';
import NotificationBell from '@/Components/NotificationBell';
import ProvidersWrapper from './ProvidersWrapper';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
  Search, 
  User, 
  Home,
  BookOpen,
  Trophy,
  Calendar,
  TrendingUp,
  Star,
  GraduationCap,
  Menu,
  X,
  ShoppingBag,
  Package,
  Sparkles,
  BarChart3,
  History,
  MessageCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useEquip } from '@/Contexts/EquipContext';
import { useSFX } from '@/Contexts/SFXContext';

/**
 * ✅ AvatarDisplay Component - 显示装备的头像框
 */
function AvatarDisplay({ size = 'default', className = '' }) {
  const { auth } = usePage().props;
  const { equipped } = useEquip();
  const user = auth?.user;

  const equippedAvatar = equipped?.avatar_frame;
  
  const sizeClasses = {
    small: 'w-10 h-10',
    default: 'w-10 h-10',
    large: 'w-12 h-12',
  };

  const iconSizes = {
    small: 'w-5 h-5',
    default: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  // ✅ 如果有装备的图片头像框 - 只显示头像框，不显示 User icon
  if (equippedAvatar?.image_url) {
    return (
      <div 
        className={`${sizeClasses[size]} ${className} rounded-full bg-cover bg-center transition-transform duration-200 hover:scale-110 animate-float shadow-xl ring-2 ring-white/30`}
        style={{
          backgroundImage: `url(${equippedAvatar.image_url})`,
        }}
      />
    );
  }

  // ✅ 如果有装备的 emoji/icon 头像框 - 只显示 emoji，不显示 User icon
  if (equippedAvatar?.icon) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-xl animate-float ring-2 ring-white/30`}>
        <span className="text-2xl drop-shadow-lg">{equippedAvatar.icon}</span>
      </div>
    );
  }

  // ✅ 默认状态 - 显示 User icon（没有装备时）
  return (
    <div className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-xl animate-float ring-2 ring-white/30`}>
      <User className={`${iconSizes[size]} text-white drop-shadow-lg`} />
    </div>
  );
}

/**
 * ✅ StudentLayoutContent - 实际的布局内容
 * 这个组件在 Providers 内部，可以使用所有 Contexts
 */
function StudentLayoutContent({ header, children }) {
  const { auth } = usePage().props;
  const { equipped } = useEquip();
  const { playSFX } = useSFX();
  const user = auth?.user;
  
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

  const isAuthenticated = Boolean(user && (user.id || user.user_Id));
  const studentPoints = user?.student_profile?.current_points || 0;

  // ✅ Navigation items configuration
  const mainNavItems = [
    { 
      href: 'dashboard', 
      label: 'Dashboard', 
      icon: Home,
      current: 'dashboard'
    },
    { 
      href: 'lessons.index', 
      label: 'Lessons', 
      icon: BookOpen,
      current: 'lessons.*'
    },
    { 
      href: 'forum.index',
      label: 'Community', 
      icon: MessageCircle,
      current: 'forum.*',
      badge: '💬'
    },
    { 
      href: 'student.rewards.index', 
      label: 'Rewards', 
      icon: ShoppingBag,
      current: 'student.rewards.*',
      badge: '🆕'
    },
    { 
      href: 'student.inventory.index', 
      label: 'Inventory', 
      icon: Package,
      current: 'student.inventory.*'
    },
    { 
      href: 'student.paths.index',
      label: 'Learning Paths', 
      icon: GraduationCap,
      current: 'student.paths.*'
    },
  ];

  return (
    <>
      {/* ✅ Layer 1: 全屏背景（-z-50）- 包含装备背景系统 */}
      <BackgroundContainer />

      {/* ✅ Layer 2: 导航栏（z-50） */}
      <nav className="fixed top-0 w-full z-50">
        <div className="bg-black/70 backdrop-blur-xl border-b border-white/20 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              
              {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                <Link 
                  href="/" 
                  className="flex items-center space-x-3 group"
                  onMouseEnter={() => playSFX('hover')}
                  onClick={() => playSFX('click')}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl hover-lift ripple-effect">
                    <ApplicationLogo className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <div className="hidden lg:block">
                    <span className="text-lg font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      LearnHub
                    </span>
                    <div className="text-xs text-gray-200 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                      Student Portal
                    </div>
                  </div>
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center justify-center flex-1 px-8">
                <div className="flex items-center space-x-1">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = route().current(item.current);
                    
                    return (
                      <Link
                        key={item.href}
                        href={route(item.href)}
                        onMouseEnter={() => playSFX('hover')}
                        onClick={() => playSFX('nav')}
                        className={`
                          flex items-center space-x-2 px-4 py-2.5 rounded-xl
                          transition-all duration-200 font-bold relative
                          overflow-visible
                          ripple-effect button-press-effect
                          ${isActive
                            ? 'bg-white/30 text-white shadow-xl backdrop-blur-sm ring-2 ring-white/30'
                            : 'text-white/95 hover:text-white hover:bg-white/20 glow-on-hover'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />
                        <span className="text-sm whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                          {item.label}
                        </span>
                        
                        {/* ✅ Badge - 只保留 emoji 动画 */}
                        {item.badge && (
                          <span className="
                            absolute -top-1 -right-1 
                            text-base
                            drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]
                            animate-bounce
                            z-50
                            pointer-events-none
                          ">
                            {item.badge}
                          </span>
                        )}
                        
                        {/* ✅ Shimmer 底部条 - 青色渐变高对比度 */}
                        {isActive && (
                          <span className="
                            absolute -bottom-1 left-1/2 -translate-x-1/2 
                            w-16 h-1 
                            bg-gradient-to-r from-transparent via-cyan-400 to-transparent
                            rounded-full shadow-xl shadow-cyan-400/50
                            animate-shimmer
                            z-10
                          " />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                
                {/* Search Bar */}
                <SearchBar />

                {isAuthenticated ? (
                  <>
                    {/* Points Display */}
                    <Link
                      href={route('student.rewards.index')}
                      onMouseEnter={() => playSFX('hover')}
                      onClick={() => playSFX('points')}
                      className="
                        flex items-center gap-2 
                        bg-gradient-to-r from-yellow-500 to-orange-500 
                        px-4 py-2 rounded-lg 
                        hover:from-yellow-600 hover:to-orange-600 
                        transition-all duration-200 
                        shadow-xl hover:shadow-2xl hover:scale-105
                        flex-shrink-0
                        ripple-effect button-press-effect
                        animate-rainbowGradient
                        ring-2 ring-yellow-400/50 hover:ring-yellow-300/70
                      "
                    >
                      <Sparkles className="w-4 h-4 text-white drop-shadow-lg animate-spin-slow" />
                      <span className="text-white font-bold text-sm drop-shadow-lg">
                        {studentPoints.toLocaleString()}
                      </span>
                    </Link>

                    {/* Notification Bell */}
                    <NotificationBell />

                    {/* Game Control Panel */}
                    <GameControlPanel />

                    {/* User Avatar Dropdown */}
                    <div className="hidden lg:block">
                      <Dropdown>
                        <Dropdown.Trigger>
                          <button
                            type="button"
                            onMouseEnter={() => playSFX('hover')}
                            onClick={() => playSFX('dropdown')}
                            className="
                              focus:outline-none focus:ring-2 focus:ring-white/70
                              transition-all duration-200 
                              flex-shrink-0 rounded-full
                              ripple-effect
                            "
                          >
                            <AvatarDisplay size="default" />
                          </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content className="w-72 bg-white/95 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-2xl overflow-hidden">
                          {/* User Info Header */}
                          <div className="p-6 border-b border-white/40 bg-gradient-to-r from-purple-700/80 to-pink-700/70">
                            <div className="flex items-center space-x-4">
                              <AvatarDisplay size="large" className="shadow-xl ring-2 ring-purple-500/50" />
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-bold text-lg truncate">{user.name}</div>
                                <div className="text-sm text-purple-100 truncate">{user.email}</div>
                              </div>
                            </div>
                            
                            {/* Points Badge */}
                            <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-yellow-100/90 to-orange-100/90 border border-yellow-300/70 rounded-xl px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                <span className="text-amber-900 font-bold text-lg">
                                  {studentPoints.toLocaleString()}
                                </span>
                              </div>
                              <span className="text-xs text-amber-700 font-semibold">Points</span>
                            </div>
                            
                            {equipped?.avatar_frame && (
                              <div className="mt-3 px-3 py-2 bg-purple-100/70 border border-purple-300/70 rounded-lg">
                                <p className="text-xs text-purple-700 text-center font-medium">
                                  🖼️ {equipped.avatar_frame.name}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Menu Items */}
                          <div className="p-2">
                            <Dropdown.Link 
                              href={route('student.profile.show')}
                              onMouseEnter={() => playSFX('hover')}
                              onClick={() => playSFX('click')}
                              className="group flex items-center justify-between px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 rounded-xl"
                            >
                              <div className="flex items-center space-x-3">
                                <User className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">My Profile</span>
                              </div>
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Dropdown.Link>

                            <Dropdown.Link 
                              href={route('student.inventory.index')}
                              onMouseEnter={() => playSFX('hover')}
                              onClick={() => playSFX('click')}
                              className="group flex items-center justify-between px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 rounded-xl"
                            >
                              <div className="flex items-center space-x-3">
                                <Package className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">My Inventory</span>
                              </div>
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Dropdown.Link>

                            <div className="my-2 border-t border-slate-200"></div>

                            <Dropdown.Link 
                              href={route('forum.index')}
                              onMouseEnter={() => playSFX('hover')}
                              onClick={() => playSFX('click')}
                              className="group flex items-center justify-between px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-200 rounded-xl"
                            >
                              <div className="flex items-center space-x-3">
                                <MessageCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">Community Forum</span>
                              </div>
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Dropdown.Link>

                            <Dropdown.Link 
                              href={route('student.rewards.index')}
                              onMouseEnter={() => playSFX('hover')}
                              onClick={() => playSFX('click')}
                              className="group flex items-center justify-between px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 rounded-xl"
                            >
                              <div className="flex items-center space-x-3">
                                <ShoppingBag className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">Rewards Shop</span>
                              </div>
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Dropdown.Link>
                            
                            <div className="my-2 border-t border-slate-200"></div>
                            
                            <Dropdown.Link 
                              href={route('logout')} 
                              method="post" 
                              as="button"
                              onMouseEnter={() => playSFX('hover')}
                              onClick={() => playSFX('click')}
                              className="group flex items-center justify-between px-4 py-3 text-red-500 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-200 w-full text-left rounded-xl"
                            >
                              <div className="flex items-center space-x-3">
                                <LogOut className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium">Log Out</span>
                              </div>
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Dropdown.Link>
                          </div>
                        </Dropdown.Content>
                      </Dropdown>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <Link 
                      href={route('login')}
                      onMouseEnter={() => playSFX('hover')}
                      onClick={() => playSFX('click')}
                      className="text-white/95 hover:text-white px-4 py-2 rounded-lg hover:bg-white/25 backdrop-blur-sm transition-all duration-200 font-bold text-sm whitespace-nowrap shadow-lg ripple-effect button-press-effect"
                    >
                      Log In
                    </Link>
                    <Link 
                      href={route('register')}
                      onMouseEnter={() => playSFX('hover')}
                      onClick={() => playSFX('success')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-bold shadow-xl hover:shadow-2xl hover:scale-105 text-sm whitespace-nowrap ripple-effect ring-2 ring-blue-400/50"
                    >
                      Start Learning
                    </Link>
                  </div>
                )}

                {/* Mobile Menu Button */}
                <button 
                  className="lg:hidden text-white p-2 rounded-lg hover:bg-white/25 backdrop-blur-sm transition-all duration-200 flex-shrink-0 shadow-lg ripple-effect button-press-effect"
                  onClick={() => {
                    playSFX('click');
                    setShowingNavigationDropdown(!showingNavigationDropdown);
                  }}
                >
                  {showingNavigationDropdown ? 
                    <X className="w-6 h-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] animate-spin" /> : 
                    <Menu className="w-6 h-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />
                  }
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {showingNavigationDropdown && (
              <div className="lg:hidden bg-black/85 backdrop-blur-xl rounded-2xl my-4 p-4 border border-white/20 shadow-2xl animate-slideDown">
                {isAuthenticated && (
                  <div className="mb-4 pb-4 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                      <AvatarDisplay size="large" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold truncate">{user.name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                          <span className="text-sm text-gray-300 font-bold">
                            {studentPoints.toLocaleString()} Points
                          </span>
                        </div>
                      </div>
                    </div>
                    {equipped?.avatar_frame && (
                      <div className="mt-2 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg ring-2 ring-purple-400/30">
                        <p className="text-xs text-purple-300 text-center font-medium">
                          🖼️ {equipped.avatar_frame.name}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-2">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = route().current(item.current);
                    
                    return (
                      <Link
                        key={item.href}
                        href={route(item.href)}
                        onClick={() => playSFX('nav')}
                        className={`
                          flex items-center space-x-3 px-4 py-3 rounded-lg
                          transition-all duration-200 relative
                          ripple-effect
                          ${isActive
                            ? 'bg-white/30 text-white ring-2 ring-white/30'
                            : 'text-white/90 hover:bg-white/20'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto text-base drop-shadow-lg animate-bounce">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                  
                  {/* Mobile - User Menu Items */}
                  {isAuthenticated && (
                    <>
                      <div className="my-2 border-t border-white/20"></div>
                      
                      <Link
                        href={route('student.profile.show')}
                        onClick={() => playSFX('click')}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/90 hover:bg-white/20 transition-all duration-200 ripple-effect"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">My Profile</span>
                      </Link>
                      
                      <Link
                        href={route('student.inventory.index')}
                        onClick={() => playSFX('click')}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-white/90 hover:bg-white/20 transition-all duration-200 ripple-effect"
                      >
                        <Package className="w-5 h-5" />
                        <span className="font-medium">My Inventory</span>
                      </Link>
                      
                      <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        onClick={() => playSFX('click')}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-600/30 transition-all duration-200 w-full text-left ripple-effect"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Log Out</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ✅ Layer 3: 内容层（z-0） */}
      <div className="relative z-0 min-h-screen">
        {/* Header */}
        {header && (
          <header className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {header}
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={`${header ? '' : 'pt-24'} px-4 sm:px-6 lg:px-8 pb-12`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

/**
 * ✅ StudentLayout - 外层包裹器
 * 用 ProvidersWrapper 包裹内容，确保所有 Contexts 可用
 */
export default function StudentLayout({ header, children }) {
  return (
    <ProvidersWrapper>
      <StudentLayoutContent header={header} children={children} />
    </ProvidersWrapper>
  );
}
