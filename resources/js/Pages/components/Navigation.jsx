import React, { useState } from 'react';
import { 
  Menu, X, Search, Bell, Settings, User, Trophy, TrendingUp, BookOpen, LogOut
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';

export default function Navigation({ auth }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = auth?.user;
  const isStudent = auth?.user?.role === 'student';
  const isAdmin = auth?.user?.role === 'administrator';

  // Handle logout
  const handleLogout = () => {
    router.post('/logout');
  };

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.get('/lessons', { q: searchQuery });
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">🐍</span>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PythonBootcamp
              </span>
              <div className="text-xs text-purple-600 font-medium">AI-Powered Learning</div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Search Bar - Only show if authenticated */}
            {isAuthenticated && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="bg-gray-100 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 w-64 transition-all"
                />
              </div>
            )}

            {/* Navigation Links */}
            {isAuthenticated ? (
              <>
                <Link 
                  href="/lessons" 
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  Lessons
                </Link>
                
                {isStudent && (
                  <Link 
                    href="/student/rewards" 
                    className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center"
                  >
                    <Trophy className="w-4 h-4 mr-1" />
                    Rewards
                  </Link>
                )}
                
                <Link 
                  href="/forum" 
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  Forum
                </Link>
                
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <a href="#curriculum" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                  Curriculum
                </a>
                <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                  Features
                </a>
                <Link href="/lessons" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                  Browse Lessons
                </Link>
              </>
            )}
            
            {/* User Actions */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Notifications - Only for students */}
                {isStudent && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="text-gray-600 hover:text-purple-600 transition-colors relative"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></span>
                    </button>
                    
                    {showNotifications && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setShowNotifications(false)}
                        ></div>
                        
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl p-4 shadow-2xl z-20">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-gray-800 font-bold">Notifications</h3>
                            <button 
                              onClick={() => setShowNotifications(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 hover:bg-purple-100 transition-colors cursor-pointer">
                              <div className="text-purple-600 text-sm font-semibold">New Exercise Available</div>
                              <div className="text-gray-600 text-sm">Python Functions Challenge</div>
                              <div className="text-gray-400 text-xs mt-1">2 hours ago</div>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">
                              <div className="text-blue-600 text-sm font-semibold">Test Reminder</div>
                              <div className="text-gray-600 text-sm">Quiz due in 2 days</div>
                              <div className="text-gray-400 text-xs mt-1">5 hours ago</div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-3 border border-green-100 hover:bg-green-100 transition-colors cursor-pointer">
                              <div className="text-green-600 text-sm font-semibold">Reward Unlocked</div>
                              <div className="text-gray-600 text-sm">Earned 50 points!</div>
                              <div className="text-gray-400 text-xs mt-1">1 day ago</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* User Profile Dropdown */}
                <div className="relative group">
                  <button className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-105">
                    <User className="w-4 h-4 text-white" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="text-sm font-semibold text-gray-800">{auth.user.name}</div>
                      <div className="text-xs text-gray-500">{auth.user.email}</div>
                      <div className="text-xs text-purple-600 font-medium mt-1 capitalize">
                        {auth.user.role}
                      </div>
                    </div>

                    {/* Student Menu Items */}
                    {isStudent && (
                      <>
                        <Link 
                          href="/student/profile" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 mr-3" />
                          My Profile
                        </Link>
                        <Link 
                          href="/student/inventory" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                        >
                          <Trophy className="w-4 h-4 mr-3" />
                          My Inventory
                        </Link>
                        <Link 
                          href="/student/profile/statistics" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                        >
                          <TrendingUp className="w-4 h-4 mr-3" />
                          Statistics
                        </Link>
                        <Link 
                          href="/forum/user/my-posts" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                        >
                          <BookOpen className="w-4 h-4 mr-3" />
                          My Posts
                        </Link>
                      </>
                    )}

                    {/* Admin Menu Items */}
                    {isAdmin && (
                      <>
                        <Link 
                          href="/admin/lessons" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                        >
                          <BookOpen className="w-4 h-4 mr-3" />
                          Manage Lessons
                        </Link>
                        <Link 
                          href="/admin/rewards" 
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                        >
                          <Trophy className="w-4 h-4 mr-3" />
                          Manage Rewards
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-200 my-2"></div>
                    
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
                >
                  Get Started →
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white rounded-2xl mt-2 p-4 shadow-xl border border-gray-200 mb-4">
            <div className="flex flex-col space-y-4">
              {isAuthenticated ? (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="font-semibold text-gray-800">{auth.user.name}</div>
                    <div className="text-sm text-gray-600">{auth.user.email}</div>
                    <div className="text-xs text-purple-600 font-medium mt-1 capitalize">
                      {auth.user.role}
                    </div>
                  </div>

                  <Link href="/lessons" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                    Lessons
                  </Link>
                  
                  {isStudent && (
                    <Link href="/student/rewards" className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center">
                      <Trophy className="w-4 h-4 mr-2" />
                      Rewards
                    </Link>
                  )}
                  
                  <Link href="/forum" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                    Forum
                  </Link>
                  
                  <Link href="/dashboard" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                    Dashboard
                  </Link>

                  <div className="border-t border-gray-200 pt-4">
                    {isStudent && (
                      <>
                        <Link href="/student/profile" className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center mb-3">
                          <User className="w-4 h-4 mr-2" />
                          My Profile
                        </Link>
                        <Link href="/student/inventory" className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center mb-3">
                          <Trophy className="w-4 h-4 mr-2" />
                          My Inventory
                        </Link>
                      </>
                    )}
                    
                    {isAdmin && (
                      <>
                        <Link href="/admin/lessons" className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center mb-3">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Manage Lessons
                        </Link>
                        <Link href="/admin/rewards" className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center mb-3">
                          <Trophy className="w-4 h-4 mr-2" />
                          Manage Rewards
                        </Link>
                      </>
                    )}

                    <Link href="/profile" className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center mb-3">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 transition-colors font-medium flex items-center w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <a href="#curriculum" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                    Curriculum
                  </a>
                  <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                    Features
                  </a>
                  <Link href="/lessons" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                    Browse Lessons
                  </Link>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <Link href="/login" className="text-gray-700 hover:text-purple-600 transition-colors font-medium mb-3 block">
                      Login
                    </Link>
                  </div>
                  
                  <Link 
                    href="/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl w-full font-semibold text-center block"
                  >
                    Get Started →
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}