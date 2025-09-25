import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  ChevronDown, 
  Menu, 
  X,
  Home,
  BookOpen,
  Trophy,
  Calendar,
  MessageCircle,
  Play,
  Star,
  GraduationCap,
  TrendingUp,
  Heart
} from 'lucide-react';

export default function StudentLayout({ header, children }) {
  // 安全取 auth.user（可能为 undefined/null）
  const user = usePage().props?.auth?.user;
  
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 是否为已认证用户（用 id 判断比只判断 user 更稳）
  const isAuthenticated = Boolean(user && user.id);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    // Add search logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-lg z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Logo Section - Fixed Width */}
            <div className="flex items-center space-x-4 flex-shrink-0 w-80">
              <Link href="/" className="flex items-center space-x-4 group">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ApplicationLogo className="w-9 h-9 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white group-hover:text-green-300 transition-colors duration-300">LearnHub</span>
                  <div className="text-xs text-green-400 font-medium">Student Portal</div>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-8">
                <a href="#dashboard" className="flex items-center space-x-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300">
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </a>
                
              <Link 
                href={route('lessons.index')} 
                className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <BookOpen className="w-5 h-5" />
                <span>Lessons</span>
              </Link>
                              
                <a href="#progress" className="flex items-center space-x-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Progress</span>
                </a>
                
                <a href="#achievements" className="flex items-center space-x-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300">
                  <Trophy className="w-5 h-5" />
                  <span className="font-medium">Achievements</span>
                </a>
                
                <a href="#schedule" className="flex items-center space-x-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Schedule</span>
                </a>
              </div>
            </div>

            {/* Desktop Search and User Actions - Right Side */}
            <div className="hidden lg:flex items-center justify-end space-x-6 w-80">
              {/* Search Bar */}
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 w-48 backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </form>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Settings Button */}
                  <button 
                    className="text-gray-400 hover:text-white transition-colors duration-300 p-2 rounded-lg hover:bg-white/10"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>

                  {/* User Avatar with Dropdown */}
                  <div className="relative">
                    <Dropdown>
                      <Dropdown.Trigger>
                        <button
                          type="button"
                          className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                          title={user?.name || 'User Menu'}
                        >
                          <User className="w-5 h-5 text-white" />
                        </button>
                      </Dropdown.Trigger>

                      <Dropdown.Content className="w-64 bg-black/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-blue-500/10">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium text-lg">{user?.name || 'Student'}</div>
                              <div className="text-sm text-gray-400">{user?.email}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs text-gray-400">Level {user?.level || 1}</span>
                                <span className="text-xs text-gray-400">• {user?.xp || 0} XP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Dropdown.Link 
                          href={route('profile.edit')}
                          className="flex items-center space-x-4 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                        >
                          <User className="w-5 h-5" />
                          <span className="font-medium">My Profile</span>
                        </Dropdown.Link>
                        
                        <Dropdown.Link 
                          href="#settings"
                          className="flex items-center space-x-4 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                        >
                          <Settings className="w-5 h-5" />
                          <span className="font-medium">Settings</span>
                        </Dropdown.Link>
                        
                        <Dropdown.Link 
                          href="#certificates"
                          className="flex items-center space-x-4 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                        >
                          <GraduationCap className="w-5 h-5" />
                          <span className="font-medium">My Certificates</span>
                        </Dropdown.Link>
                        
                        <Dropdown.Link 
                          href={route('logout')} 
                          method="post" 
                          as="button"
                          className="flex items-center space-x-4 px-6 py-4 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300 w-full text-left border-t border-white/10"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                          </svg>
                          <span className="font-medium">Log Out</span>
                        </Dropdown.Link>
                      </Dropdown.Content>
                    </Dropdown>
                  </div>
                </div>
              ) : (
                // 未登录时显示登录/注册按钮
                <div className="flex items-center space-x-3">
                  <Link 
                    href={route('login')} 
                    className="text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 font-medium"
                  >
                    Log In
                  </Link>
                  <Link 
                    href={route('register')} 
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Start Learning
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
            >
              {showingNavigationDropdown ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showingNavigationDropdown && (
            <div className="lg:hidden bg-black/50 backdrop-blur-lg rounded-2xl mt-4 p-6 mx-4 border border-white/10">
              {/* Mobile Search */}
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl pl-12 pr-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 w-full backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </form>
              
              {/* Mobile Navigation Links */}
              <div className="space-y-3 mb-8">
                <ResponsiveNavLink 
                  href={route('dashboard')} 
                  active={route().current('dashboard')}
                  className={`flex items-center space-x-4 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                    route().current('dashboard') 
                      ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </ResponsiveNavLink>
                
          <Link 
            href={route('lessons.index')} 
            className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
          >
            <BookOpen className="w-5 h-5" />
            <span>Lessons</span>
          </Link>
                
                <a href="#progress" className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300">
                  <TrendingUp className="w-5 h-5" />
                  <span>Progress</span>
                </a>
                
                <a href="#achievements" className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300">
                  <Trophy className="w-5 h-5" />
                  <span>Achievements</span>
                </a>
                
                <a href="#schedule" className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300">
                  <Calendar className="w-5 h-5" />
                  <span>Schedule</span>
                </a>
              </div>

              {/* Mobile User Section */}
              <div className="border-t border-white/10 pt-6">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-4 px-6 py-4 mb-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl border border-green-500/20">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-lg">
                          {user?.name || 'Student'}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center space-x-3 mt-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>Level {user?.level || 1}</span>
                          <span>•</span>
                          <span>{user?.xp || 0} XP</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <ResponsiveNavLink 
                        href={route('profile.edit')}
                        className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                      >
                        <User className="w-5 h-5" />
                        <span>My Profile</span>
                      </ResponsiveNavLink>
                      
                      <ResponsiveNavLink 
                        href="#certificates"
                        className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                      >
                        <GraduationCap className="w-5 h-5" />
                        <span>My Certificates</span>
                      </ResponsiveNavLink>
                      
                      <ResponsiveNavLink 
                        method="post" 
                        href={route('logout')} 
                        as="button"
                        className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-red-500/20 transition-all duration-300 w-full text-left"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                        </svg>
                        <span>Log Out</span>
                      </ResponsiveNavLink>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="px-6 py-4 mb-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl border border-green-500/20">
                      <div className="text-white font-medium text-lg">Welcome!</div>
                      <div className="text-sm text-gray-400 mt-1">Join us to start your learning journey</div>
                    </div>
                    
                    <ResponsiveNavLink 
                      href={route('login')}
                      className="flex items-center justify-center text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300 font-medium"
                    >
                      Log In
                    </ResponsiveNavLink>
                    
                    <ResponsiveNavLink 
                      href={route('register')}
                      className="flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 font-medium"
                    >
                      Start Learning
                    </ResponsiveNavLink>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Header with enhanced styling */}
      {header && (
        <header className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
              {header}
            </div>
          </div>
        </header>
      )}

      {/* Main Content with padding adjustment for fixed nav */}
      <main className={`${header ? '' : 'pt-28'} px-4 sm:px-6 lg:px-8 pb-12`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}