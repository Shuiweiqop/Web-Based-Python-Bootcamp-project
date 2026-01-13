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
  History
} from 'lucide-react';

export default function StudentLayout({ header, children }) {
  const { auth } = usePage().props;
  const user = auth?.user;
  
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAuthenticated = Boolean(user && (user.id || user.user_Id));
  const studentPoints = user?.student_profile?.current_points || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  // Navigation items configuration
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
      href: 'student.rewards.index', 
      label: 'Rewards', 
      icon: ShoppingBag,
      current: 'student.rewards.*',
      badge: '🆕' // Optional: mark as new feature
    },
    { 
      href: 'student.inventory.index', 
      label: 'Inventory', 
      icon: Package,
      current: 'student.inventory.*'
    },
  ];

  // Additional nav items (to be implemented)
  const additionalNavItems = [
    { label: 'Progress', icon: TrendingUp, href: '#', disabled: true },
    { label: 'Achievements', icon: Trophy, href: '#', disabled: true },
    { label: 'Schedule', icon: Calendar, href: '#', disabled: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-lg z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Logo */}
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
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-2">
                {/* Main Nav Items */}
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = route().current(item.current);
                  
                  return (
                    <Link
                      key={item.href}
                      href={route(item.href)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium relative ${
                        isActive
                          ? 'text-white bg-white/20'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 text-xs">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* Additional Nav Items (Coming Soon) */}
                {additionalNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      disabled={item.disabled}
                      className="flex items-center space-x-2 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed opacity-50"
                      title="Coming Soon"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center justify-end space-x-6 w-80">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 w-48 backdrop-blur-sm transition-all duration-300"
                />
              </div>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Points Display */}
                  <Link
                    href={route('student.rewards.index')}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-white font-bold">{studentPoints.toLocaleString()}</span>
                  </Link>

                  <button 
                    className="text-gray-400 hover:text-white transition-colors duration-300 p-2 rounded-lg hover:bg-white/10"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>

                  <Dropdown>
                    <Dropdown.Trigger>
                      <button
                        type="button"
                        className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50"
                      >
                        <User className="w-5 h-5 text-white" />
                      </button>
                    </Dropdown.Trigger>

                    <Dropdown.Content className="w-64 bg-black/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                      {/* User Info Header */}
                      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-blue-500/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium text-lg truncate">{user.name}</div>
                            <div className="text-sm text-gray-400 truncate">{user.email}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-gray-400">
                                {studentPoints.toLocaleString()} Points
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <Dropdown.Link 
                        href={route('student.profile.show')}
                        className="flex items-center space-x-4 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">My Profile</span>
                      </Dropdown.Link>

                      <Dropdown.Link 
                        href={route('student.profile.rewards.index')}
                        className="flex items-center space-x-4 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                      >
                        <Package className="w-5 h-5" />
                        <span className="font-medium">My Inventory</span>
                      </Dropdown.Link>

                      <Dropdown.Link 
                        href={route('student.profile.statistics')}
                        className="flex items-center space-x-4 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                      >
                        <BarChart3 className="w-5 h-5" />
                        <span className="font-medium">Statistics</span>
                      </Dropdown.Link>

                      <Dropdown.Link 
                        href={route('student.profile.history')}
                        className="flex items-center space-x-4 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                      >
                        <History className="w-5 h-5" />
                        <span className="font-medium">Learning History</span>
                      </Dropdown.Link>

                      <div className="border-t border-white/10 my-2"></div>

                      <Dropdown.Link 
                        href={route('student.rewards.index')}
                        className="flex items-center space-x-4 px-6 py-4 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span className="font-medium">Rewards Shop</span>
                      </Dropdown.Link>
                      
                      <button
                        disabled
                        className="flex items-center space-x-4 px-6 py-4 text-gray-500 cursor-not-allowed w-full text-left opacity-50"
                        title="Coming Soon"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                      </button>
                      
                      <button
                        disabled
                        className="flex items-center space-x-4 px-6 py-4 text-gray-500 cursor-not-allowed w-full text-left opacity-50"
                        title="Coming Soon"
                      >
                        <GraduationCap className="w-5 h-5" />
                        <span className="font-medium">My Certificates</span>
                      </button>
                      
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
              ) : (
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
            <div className="lg:hidden bg-black/50 backdrop-blur-lg rounded-2xl mt-4 mb-4 p-6 border border-white/10">
              {/* Mobile Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="bg-white/10 border border-white/20 rounded-xl pl-12 pr-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 w-full backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>
              
              {/* Mobile Navigation Links */}
              <div className="space-y-3 mb-8">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = route().current(item.current);
                  
                  return (
                    <Link
                      key={item.href}
                      href={route(item.href)}
                      className={`flex items-center space-x-4 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                        isActive
                          ? 'text-white bg-white/20'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-xs">{item.badge}</span>
                      )}
                    </Link>
                  );
                })}

                {additionalNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      disabled
                      className="flex items-center space-x-4 text-gray-500 px-6 py-4 rounded-xl w-full text-left opacity-50 cursor-not-allowed"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      <span className="ml-auto text-xs">Soon</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile User Section */}
              <div className="border-t border-white/10 pt-6">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-4 px-6 py-4 mb-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl border border-green-500/20">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-lg truncate">{user.name}</div>
                        <div className="text-sm text-gray-400 flex items-center space-x-3 mt-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{studentPoints.toLocaleString()} Points</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Link
                        href={route('student.profile.show')}
                        className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                      >
                        <User className="w-5 h-5" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href={route('student.profile.rewards.index')}
                        className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                      >
                        <Package className="w-5 h-5" />
                        <span>My Inventory</span>
                      </Link>

                      <Link
                        href={route('student.profile.statistics')}
                        className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                      >
                        <BarChart3 className="w-5 h-5" />
                        <span>Statistics</span>
                      </Link>

                      <Link
                        href={route('student.profile.history')}
                        className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                      >
                        <History className="w-5 h-5" />
                        <span>Learning History</span>
                      </Link>

                      <div className="border-t border-white/10 my-2"></div>

                      <Link
                        href={route('student.rewards.index')}
                        className="flex items-center space-x-4 text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span>Rewards Shop</span>
                      </Link>
                      
                      <button
                        disabled
                        className="flex items-center space-x-4 text-gray-500 px-6 py-4 rounded-xl w-full text-left opacity-50 cursor-not-allowed"
                      >
                        <GraduationCap className="w-5 h-5" />
                        <span>My Certificates</span>
                        <span className="ml-auto text-xs">Soon</span>
                      </button>
                      
                      <Link
                        method="post" 
                        href={route('logout')} 
                        as="button"
                        className="flex items-center space-x-4 text-red-400 hover:text-red-300 px-6 py-4 rounded-xl hover:bg-red-500/20 transition-all duration-300 w-full text-left"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                        </svg>
                        <span>Log Out</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Link
                      href={route('login')}
                      className="flex items-center justify-center text-gray-300 hover:text-white px-6 py-4 rounded-xl hover:bg-white/10 transition-all duration-300 font-medium"
                    >
                      Log In
                    </Link>
                    
                    <Link
                      href={route('register')}
                      className="flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 font-medium"
                    >
                      Start Learning
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Header */}
      {header && (
        <header className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
              {header}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`${header ? '' : 'pt-28'} px-4 sm:px-6 lg:px-8 pb-12`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}