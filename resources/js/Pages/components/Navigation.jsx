import React, { useState } from 'react';
import { Menu, X, Search, Bell, Settings, User } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    // Add search logic here
  };

  return (
    <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-lg z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🐍</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">PythonBootcamp</span>
              <div className="text-xs text-green-400 font-medium">for Beginners</div>
            </div>
          </div>
          
          {/* Desktop Search and Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search lessons, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 w-64"
                />
              </div>
            </form>

            {/* Navigation Links */}
            <a href="#curriculum" className="text-gray-300 hover:text-white transition-colors">Curriculum</a>
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#community" className="text-gray-300 hover:text-white transition-colors">Community</a>
            
            {/* User Actions */}
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
                        <div className="text-green-400 text-sm font-medium">New Lesson Available</div>
                        <div className="text-gray-300 text-sm">Python Functions & Parameters</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-blue-400 text-sm font-medium">Achievement Unlocked</div>
                        <div className="text-gray-300 text-sm">Completed 10 coding challenges!</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <button className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            
            <a
              href="/login"
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              Start Bootcamp
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-black/50 backdrop-blur-lg rounded-lg mt-2 p-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search lessons, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 w-full"
                />
              </div>
            </form>
            
            <div className="flex flex-col space-y-4">
              <a href="#curriculum" className="text-gray-300 hover:text-white transition-colors">Curriculum</a>
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#community" className="text-gray-300 hover:text-white transition-colors">Community</a>
              <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg w-full">
                Start Bootcamp
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}