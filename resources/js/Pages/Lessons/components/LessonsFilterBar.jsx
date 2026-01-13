import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const LessonsFilterBar = ({
  searchTerm,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  hasActiveFilters,
  onClearFilters,
  stats
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
      {/* Search & Difficulty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search Input */}
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-blue-500" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="relative group">
          <Filter className="absolute left-4 top-4 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-blue-500" />
          <select
            value={difficultyFilter}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none bg-white transition-all outline-none cursor-pointer"
          >
            <option value="all">All Levels</option>
            <option value="beginner">🌱 Beginner</option>
            <option value="intermediate">🔥 Intermediate</option>
            <option value="advanced">⚡ Advanced</option>
          </select>
        </div>
      </div>

      {/* Stats & Clear Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-gray-200 gap-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-bold text-gray-900">{stats.showing}</span> lesson{stats.showing !== 1 ? 's' : ''}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {stats.beginner > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
              🌱 {stats.beginner}
            </span>
          )}
          {stats.intermediate > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
              🔥 {stats.intermediate}
            </span>
          )}
          {stats.advanced > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-medium rounded-full border border-rose-200">
              ⚡ {stats.advanced}
            </span>
          )}
          
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium rounded-full border border-gray-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonsFilterBar;