// resources/js/Layouts/AuthenticatedLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import NotificationBell from '@/Components/NotificationBell';
import ProvidersWrapper from './ProvidersWrapper';
import { cn } from '@/utils/cn';
import {
  Menu,
  X,
  Home,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Moon,
  Sun,
  Gift,
  MessageSquare,
  AlertTriangle,
  Map,
  TrendingUp,
  Package,
  Trophy,
  Bell,
  ClipboardList,
  GraduationCap,
  UserCog, // New icon for Student Management
} from 'lucide-react';

function AuthenticatedLayoutContent({ header, children }) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 从 localStorage 读取主题设置，默认为 dark mode
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });

  // 当主题改变时，更新 DOM 和 localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // 触发自定义事件通知其他组件
    window.dispatchEvent(new Event('theme-changed'));
  }, [isDark]);

  const isAuthenticated = Boolean(user && user.id);
  const isAdmin = user?.role === 'administrator';
  const isStudent = user?.role === 'student';

  // 获取当前路径用于激活状态判断
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  // 根据角色定义导航项
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { 
          icon: Home, 
          label: 'Dashboard', 
          href: route('dashboard'), 
          badge: null, 
          pathMatch: '/dashboard' 
        },
        { 
          icon: UserCog, 
          label: 'Student Management', 
          href: route('admin.students.index'), 
          badge: null, 
          pathMatch: '/admin/students' 
        },
        { 
          icon: BookOpen, 
          label: 'Lessons', 
          href: route('admin.lessons.index'), 
          badge: null, 
          pathMatch: '/admin/lessons' 
        }, 
        { 
          icon: GraduationCap,
          label: 'Placement Tests', 
          href: route('admin.placement-tests.index'),
          badge: null, 
          pathMatch: '/admin/placement-tests' 
        },
        { 
          icon: Map, 
          label: 'Learning Paths', 
          href: route('admin.learning-paths.index'),
          badge: null, 
          pathMatch: '/admin/learning-paths' 
        },
        { 
          icon: TrendingUp, 
          label: 'Student Paths', 
          href: route('admin.student-paths.index'),
          badge: null, 
          pathMatch: '/admin/student-paths' 
        },
        { 
          icon: Gift, 
          label: 'Rewards', 
          href: route('admin.rewards.index'), 
          badge: null, 
          pathMatch: '/admin/rewards' 
        },
        { 
          icon: MessageSquare, 
          label: 'Forum', 
          href: route('forum.index'),
          badge: null, 
          pathMatch: '/forum' 
        },
        { 
          icon: BarChart3, 
          label: 'Progress', 
          href: route('admin.progress.index'),
          badge: null,
          pathMatch: '/admin/progress' 
        },
        { 
          icon: AlertTriangle, 
          label: 'Reports', 
          href: route('admin.forum.reports.index'),
          badge: null,
          pathMatch: '/admin/forum/reports' 
        },
      ];
    } else if (isStudent) {
      return [
        { 
          icon: Home, 
          label: 'Dashboard', 
          href: route('dashboard'), 
          badge: null, 
          pathMatch: '/dashboard' 
        },
        { 
          icon: BookOpen, 
          label: 'Lessons', 
          href: route('lessons.index'), 
          badge: null, 
          pathMatch: '/lessons' 
        },
        { 
          icon: Map, 
          label: 'My Paths', 
          href: route('student.paths.index'),
          badge: null, 
          pathMatch: '/student/paths' 
        },
        { 
          icon: Package, 
          label: 'Inventory', 
          href: route('student.inventory.index'),
          badge: null, 
          pathMatch: '/student/inventory' 
        },
        { 
          icon: Trophy, 
          label: 'Rewards', 
          href: route('student.rewards.index'), 
          badge: null, 
          pathMatch: '/student/rewards' 
        },
        { 
          icon: MessageSquare, 
          label: 'Forum', 
          href: route('forum.index'),
          badge: null, 
          pathMatch: '/forum' 
        },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  // 添加点击处理函数
  const handleNavClick = (e, item) => {
    e.preventDefault();
    console.log(`Navigating to ${item.label}:`, item.href);
    
    // 如果是 # 开头的链接，不做跳转
    if (item.href.startsWith('#')) {
      console.log('Placeholder link, not navigating');
      return;
    }

    // 使用 Inertia router 进行导航
    router.visit(item.href);
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500",
      isDark ? "bg-slate-950" : "bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50"
    )}>
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {isDark ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow animation-delay-4000" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000" />
          </>
        )}
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-out border-r overflow-hidden",
          isDark ? "glassmorphism-enhanced" : "bg-white shadow-xl",
          sidebarOpen ? "w-72" : "w-20",
          isDark ? "border-white/10" : "border-purple-200"
        )}
      >
        {/* Sidebar Gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b pointer-events-none",
          isDark ? "from-purple-500/5" : "from-purple-100/50",
          "to-transparent"
        )} />

        {/* Logo Section */}
        <div className={cn(
          "relative flex items-center justify-between h-20 px-4 border-b bg-gradient-to-r",
          isDark 
            ? "border-white/10 from-purple-500/10 to-cyan-500/10"
            : "border-purple-200 from-white to-purple-50/30"
        )}>
          {sidebarOpen && (
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-xl transition-all">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent shimmer-text">
                PyLearn
              </span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "p-2 rounded-lg transition-all ripple-effect button-press-effect",
              isDark
                ? "hover:bg-white/10 text-slate-400 hover:text-white"
                : "hover:bg-purple-50 text-slate-600 hover:text-slate-900"
            )}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = currentPath.startsWith(item.pathMatch);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={cn(
                  "group relative flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 border",
                  "hover-lift ripple-effect",
                  isActive
                    ? isDark
                      ? "bg-gradient-to-r from-purple-500/30 to-cyan-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20 animate-glowPulse"
                      : "bg-gradient-to-r from-purple-100 to-cyan-100 border-purple-300 shadow-lg shadow-purple-500/10"
                    : isDark
                      ? "hover:bg-white/5 border-transparent"
                      : "hover:bg-purple-50 border-transparent"
                )}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-all duration-300",
                      isActive
                        ? isDark ? "text-cyan-400" : "text-purple-600"
                        : isDark
                          ? "text-slate-400 group-hover:text-white group-hover:scale-110"
                          : "text-slate-500 group-hover:text-slate-900 group-hover:scale-110"
                    )}
                  />
                  {sidebarOpen && (
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors truncate",
                        isActive
                          ? isDark ? "text-white" : "text-slate-900"
                          : isDark
                            ? "text-slate-300 group-hover:text-white"
                            : "text-slate-600 group-hover:text-slate-900"
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
                {sidebarOpen && item.badge && (
                  <span className="inline-flex items-center justify-center px-2 h-6 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full shadow-lg shadow-purple-500/50 flex-shrink-0 animate-bounceIn">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Divider */}
        <div className={cn("border-t", isDark ? "border-white/10" : "border-purple-200/50")} />

        {/* User Section */}
        {isAuthenticated && (
          <div className={cn(
            "relative p-3 border-t bg-gradient-to-r",
            isDark
              ? "border-white/10 from-purple-500/5 to-cyan-500/5"
              : "border-purple-200 from-white to-purple-50/20"
          )}>
            <Dropdown>
              <Dropdown.Trigger>
                <button className={cn(
                  "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all card-hover-effect ripple-effect",
                  isDark ? "hover:bg-white/10" : "hover:bg-purple-100"
                )}>
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                    <span className="text-xs font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  {sidebarOpen && (
                    <div className="flex-1 text-left min-w-0 animate-fadeIn">
                      <p className={cn(
                        "text-xs font-semibold truncate",
                        isDark ? "text-white" : "text-slate-900"
                      )}>
                        {user?.name || 'User'}
                      </p>
                      <p className={cn(
                        "text-xs capitalize",
                        isDark ? "text-slate-400" : "text-slate-600"
                      )}>{user?.role || 'User'}</p>
                    </div>
                  )}
                </button>
              </Dropdown.Trigger>

              <Dropdown.Content className={cn(
                "w-56 rounded-xl shadow-2xl border panel-enter",
                isDark
                  ? "glassmorphism-enhanced border-white/10"
                  : "bg-white border-purple-200"
              )}>
                <div className={cn(
                  "px-4 py-3 border-b bg-gradient-to-r animated-gradient",
                  isDark
                    ? "border-white/10 from-purple-500/10 to-cyan-500/10"
                    : "border-purple-200 from-purple-50/50 to-white"
                )}>
                  <p className={cn(
                    "text-sm font-semibold truncate",
                    isDark ? "text-white" : "text-slate-900"
                  )}>{user?.name}</p>
                  <p className={cn(
                    "text-xs truncate",
                    isDark ? "text-slate-400" : "text-slate-600"
                  )}>{user?.email}</p>
                </div>

                <div className="py-1">
                  <Dropdown.Link
                    href={route('profile.edit')}
                    className={cn(
                      "flex items-center px-4 py-2.5 text-sm transition-all ripple-effect",
                      isDark
                        ? "text-slate-300 hover:text-white hover:bg-white/10"
                        : "text-slate-700 hover:text-slate-900 hover:bg-purple-50"
                    )}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Dropdown.Link>

                  <Dropdown.Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className={cn(
                      "flex items-center w-full px-4 py-2.5 text-sm transition-all border-t ripple-effect",
                      isDark
                        ? "text-red-400 hover:text-red-300 hover:bg-red-500/10 border-white/10"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50 border-purple-200"
                    )}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </Dropdown.Link>
                </div>
              </Dropdown.Content>
            </Dropdown>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className={cn("transition-all duration-300", sidebarOpen ? "ml-72" : "ml-20")}>
        {/* Top Navigation Bar */}
        <header className={cn(
          "sticky top-0 z-30 h-20 border-b",
          isDark ? "glassmorphism-enhanced border-white/10" : "bg-white shadow-sm border-purple-200"
        )}>
          <div className="h-full px-6 flex items-center justify-between gap-4">
            {/* Left: Mobile Menu & Title */}
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={cn(
                  "lg:hidden p-2 rounded-lg transition-all ripple-effect button-press-effect",
                  isDark
                    ? "hover:bg-white/10 text-slate-400 hover:text-white"
                    : "hover:bg-purple-100 text-slate-600 hover:text-slate-900"
                )}
              >
                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className={cn(
                "text-lg font-bold hidden sm:block animate-fadeIn",
                isDark ? "text-white" : "text-slate-900"
              )}>
                {isAdmin ? 'Admin Dashboard' : 'Student Dashboard'}
              </h1>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full group">
                <Search className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300",
                  isDark 
                    ? "text-slate-400 group-focus-within:text-cyan-400 group-focus-within:scale-110" 
                    : "text-slate-500 group-focus-within:text-purple-600 group-focus-within:scale-110"
                )} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 rounded-lg transition-all focus:outline-none card-hover-effect",
                    isDark
                      ? "bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 text-white placeholder:text-slate-400 focus:from-purple-500/20 focus:to-cyan-500/20 focus:border-cyan-400/50 focus:shadow-lg focus:shadow-cyan-500/20"
                      : "bg-white border border-purple-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20"
                  )}
                />
                <div className={cn(
                  "absolute inset-0 rounded-lg pointer-events-none transition-all",
                  isDark
                    ? "bg-gradient-to-r from-purple-500/0 to-cyan-500/0 group-focus-within:from-purple-500/10 group-focus-within:to-cyan-500/10"
                    : "bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-focus-within:from-purple-500/5 group-focus-within:to-purple-500/5"
                )} />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              {isStudent && <NotificationBell />}

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={cn(
                  "p-2 rounded-lg transition-all ripple-effect glow-on-hover button-press-effect",
                  isDark
                    ? "hover:bg-white/10 text-slate-400 hover:text-white"
                    : "hover:bg-purple-100 text-slate-600 hover:text-slate-900"
                )}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Page Header */}
        {header && (
          <div className={cn(
            "border-b py-8 animate-fadeIn",
            isDark
              ? "backdrop-blur-md bg-gradient-to-r from-slate-900/70 via-purple-900/60 to-slate-900/70 border-purple-500/20"
              : "bg-white border-purple-200"
          )}>
            <div className="mx-auto max-w-7xl px-6">
              <div className={cn(
                isDark ? "text-white [&_*]:!text-white" : "text-slate-900"
              )}>
                {header}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={cn(
          "relative p-6 min-h-screen",
          isDark ? "" : "bg-gray-50"
        )}>
          <div className="relative mx-auto max-w-7xl">
            <div className="space-y-6 animate-fadeIn">
              {children}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.05);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        
        .glassmorphism-enhanced {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
        
        .shimmer-text {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        
        @keyframes shimmer {
          to {
            background-position: 200% center;
          }
        }
        
        .ripple-effect {
          position: relative;
          overflow: hidden;
        }
        
        .ripple-effect:active::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out;
        }
        
        @keyframes ripple {
          to {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        
        .button-press-effect:active {
          transform: scale(0.95);
        }
        
        .hover-lift {
          transition: transform 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        
        .card-hover-effect {
          transition: all 0.3s ease;
        }
        
        .card-hover-effect:hover {
          transform: translateY(-2px);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(139, 92, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
          }
        }
        
        .animate-glowPulse {
          animation: glowPulse 2s ease-in-out infinite;
        }
        
        @keyframes bounceIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }
        
        .glow-on-hover:hover {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }
        
        .panel-enter {
          animation: panelEnter 0.2s ease-out;
        }
        
        @keyframes panelEnter {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animated-gradient {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}

// ✅ 主导出：用 ProvidersWrapper 包裹
export default function AuthenticatedLayout({ header, children }) {
  return (
    <ProvidersWrapper>
      <AuthenticatedLayoutContent header={header}>
        {children}
      </AuthenticatedLayoutContent>
    </ProvidersWrapper>
  );
}
