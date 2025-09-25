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
  BarChart3,
  BookOpen,
  Users,
  Zap
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
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
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ApplicationLogo className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white group-hover:text-green-300 transition-colors">Dashboard</span>
                  <div className="text-xs text-green-400 font-medium">Admin Panel</div>
                </div>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              
              
              <a href="#analytics" className="flex items-center space-x-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </a>
              
              <a href="#courses" className="flex items-center space-x-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                <BookOpen className="w-4 h-4" />
                <span>Lessons</span>
              </a>
              
              <a href="#users" className="flex items-center space-x-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                <Users className="w-4 h-4" />
                <span>Users</span>
              </a>
            </div>

            {/* Desktop Search and User Actions */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Search Bar */}
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 w-64"
                  />
                </div>
              </form>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="text-gray-400 hover:text-white transition-colors relative"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    </button>
                    
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-2xl">
                        <h3 className="text-white font-semibold mb-3">Notifications</h3>
                        <div className="space-y-3">
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-green-400 text-sm font-medium">System Update</div>
                            <div className="text-gray-300 text-sm">New features available</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-blue-400 text-sm font-medium">New Message</div>
                            <div className="text-gray-300 text-sm">You have unread messages</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Settings */}
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>

                  {/* User Dropdown */}
                  <div className="relative ms-3">
                    <Dropdown>
                      <Dropdown.Trigger>
                        <span className="inline-flex rounded-md">
                          <button
                            type="button"
                            className="inline-flex items-center bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-green-400 transition-all group"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            
                            <div className="text-left mr-3">
                              <div className="text-white font-medium">
                                {user?.name || user?.email || 'User'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {user?.email}
                              </div>
                            </div>

                            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                          </button>
                        </span>
                      </Dropdown.Trigger>

                      <Dropdown.Content className="w-56 bg-black/90 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl">
                        <Dropdown.Link 
                          href={route('profile.edit')}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Dropdown.Link>
                        <Dropdown.Link 
                          href={route('logout')} 
                          method="post" 
                          as="button"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-red-500/20 transition-all w-full text-left border-t border-white/10"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Log Out</span>
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
                    className="text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all font-medium"
                  >
                    Log In
                  </Link>
                  <Link 
                    href={route('register')} 
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-white"
              onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
            >
              {showingNavigationDropdown ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showingNavigationDropdown && (
            <div className="lg:hidden bg-black/50 backdrop-blur-lg rounded-lg mt-2 p-4">
              {/* Mobile Search */}
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 w-full"
                  />
                </div>
              </form>
              
              {/* Mobile Navigation Links */}
              <div className="space-y-2 mb-6">
                <ResponsiveNavLink 
                  href={route('dashboard')} 
                  active={route().current('dashboard')}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    route().current('dashboard') 
                      ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-300 border border-green-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </ResponsiveNavLink>
                
                <a href="#analytics" className="flex items-center space-x-3 text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </a>
                
                <a href="#courses" className="flex items-center space-x-3 text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all">
                  <BookOpen className="w-4 h-4" />
                  <span>Courses</span>
                </a>
                
                <a href="#users" className="flex items-center space-x-3 text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all">
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </a>
              </div>

              {/* Mobile User Section */}
              <div className="border-t border-white/10 pt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 px-4 py-3 mb-4 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user?.name || 'User'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <ResponsiveNavLink 
                        href={route('profile.edit')}
                        className="flex items-center space-x-3 text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </ResponsiveNavLink>
                      
                      <ResponsiveNavLink 
                        method="post" 
                        href={route('logout')} 
                        as="button"
                        className="flex items-center space-x-3 text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-red-500/20 transition-all w-full text-left"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Log Out</span>
                      </ResponsiveNavLink>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="px-4 py-3 mb-4 bg-white/5 rounded-lg">
                      <div className="text-white font-medium">Guest</div>
                      <div className="text-sm text-gray-400">请先登录以访问完整功能</div>
                    </div>
                    
                    <ResponsiveNavLink 
                      href={route('login')}
                      className="flex items-center justify-center text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
                    >
                      Log In
                    </ResponsiveNavLink>
                    
                    <ResponsiveNavLink 
                      href={route('register')}
                      className="flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all"
                    >
                      Register
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
        <header className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              {header}
            </div>
          </div>
        </header>
      )}

      {/* Main Content with padding adjustment for fixed nav */}
      <main className={`${header ? '' : 'pt-24'} px-4 sm:px-6 lg:px-8 pb-8`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}