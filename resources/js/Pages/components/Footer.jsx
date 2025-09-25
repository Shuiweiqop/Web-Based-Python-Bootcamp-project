import React from 'react';

export default function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black/30 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">🐍</span>
            </div>
            <div>
              <span className="text-xl font-bold text-white">PythonBootcamp</span>
              <div className="text-xs text-green-400">for Beginners</div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Curriculum</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>&copy; 2025 PythonBootcamp. All rights reserved. Empowering beginners to master Python programming.</p>
        </div>
      </div>
    </footer>
  );
}