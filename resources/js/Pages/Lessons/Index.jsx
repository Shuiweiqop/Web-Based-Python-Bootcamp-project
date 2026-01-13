import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Trophy,
  Star,
  TrendingUp,
  Sparkles,
  X,
  Award,
  Target,
  Zap
} from 'lucide-react';

// Lesson Card Component
const LessonCard = ({ lesson }) => {
  const difficultyConfig = {
    beginner: {
      color: 'from-green-500 to-emerald-600',
      badge: 'bg-green-500/20 text-green-300 border-green-500/30',
      icon: '🌱',
      label: 'Beginner'
    },
    intermediate: {
      color: 'from-yellow-500 to-orange-600',
      badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      icon: '⚡',
      label: 'Intermediate'
    },
    advanced: {
      color: 'from-red-500 to-purple-600',
      badge: 'bg-red-500/20 text-red-300 border-red-500/30',
      icon: '🔥',
      label: 'Advanced'
    }
  };

  const config = difficultyConfig[lesson.difficulty] || difficultyConfig.beginner;

  return (
    <Link 
      href={route('lessons.show', lesson.lesson_id)}
      className="group block"
    >
      <div className="
        relative overflow-hidden
        bg-black/40 backdrop-blur-xl
        border border-white/20
        rounded-2xl
        hover:border-white/40
        transition-all duration-300
        hover:scale-105 hover:shadow-2xl
        h-full
      ">
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
        
        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.badge}`}>
                {config.icon} {config.label}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-300 transition-colors">
            {lesson.title}
          </h3>

          {/* Description */}
          {lesson.content && (
            <p className="text-gray-300 text-sm line-clamp-2 mb-4">
              {lesson.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              {lesson.duration && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration} min</span>
                </div>
              )}
              {lesson.points && (
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">{lesson.points}</span>
                </div>
              )}
            </div>
            <div className="text-blue-400 font-semibold text-sm group-hover:text-blue-300 transition-colors">
              Start Lesson →
            </div>
          </div>
        </div>

        {/* Hover Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>
    </Link>
  );
};

// Filter Bar Component
const FilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  difficultyFilter, 
  onDifficultyChange,
  hasActiveFilters,
  onClearFilters,
  stats 
}) => {
  const difficulties = [
    { value: 'all', label: 'All Levels', count: stats.showing, icon: '📚' },
    { value: 'beginner', label: 'Beginner', count: stats.beginner, icon: '🌱' },
    { value: 'intermediate', label: 'Intermediate', count: stats.intermediate, icon: '⚡' },
    { value: 'advanced', label: 'Advanced', count: stats.advanced, icon: '🔥' }
  ];

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8 shadow-2xl">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search lessons by title or content..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full bg-white/10 border border-white/20 rounded-xl
            pl-12 pr-4 py-3
            text-white placeholder-gray-400
            focus:outline-none focus:border-blue-500 focus:bg-white/20
            transition-all duration-200
          "
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Difficulty Filters */}
      <div className="flex flex-wrap gap-3">
        {difficulties.map((diff) => (
          <button
            key={diff.value}
            onClick={() => onDifficultyChange(diff.value)}
            className={`
              px-4 py-2.5 rounded-xl font-semibold text-sm
              transition-all duration-200
              flex items-center space-x-2
              ${difficultyFilter === diff.value
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }
            `}
          >
            <span>{diff.icon}</span>
            <span>{diff.label}</span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-bold
              ${difficultyFilter === diff.value ? 'bg-white/30' : 'bg-white/20'}
            `}>
              {diff.count}
            </span>
          </button>
        ))}
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="
              px-4 py-2.5 rounded-xl font-semibold text-sm
              bg-red-500/20 text-red-300 border border-red-500/30
              hover:bg-red-500/30
              transition-all duration-200
              flex items-center space-x-2
            "
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ hasFilters, onClearFilters }) => {
  return (
    <div className="text-center py-16">
      <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-12 max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <BookOpen className="w-12 h-12 text-white" />
        </div>
        
        {hasFilters ? (
          <>
            <h3 className="text-2xl font-bold text-white mb-4">
              No Lessons Found
            </h3>
            <p className="text-gray-300 mb-6">
              We couldn't find any lessons matching your filters.
              <br />Try adjusting your search criteria or clearing the filters.
            </p>
            <button
              onClick={onClearFilters}
              className="
                bg-gradient-to-r from-blue-500 to-purple-600 
                text-white px-8 py-3 rounded-xl font-bold
                hover:from-blue-600 hover:to-purple-700
                transition-all duration-200 shadow-xl
                hover:scale-105
              "
            >
              Clear All Filters
            </button>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-white mb-4">
              No Lessons Available Yet
            </h3>
            <p className="text-gray-300 mb-6">
              Check back soon! New lessons are being added regularly.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// CTA Section Component
const CTASection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-2">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <Sparkles className="w-8 h-8 text-blue-400" />
          <Award className="w-8 h-8 text-purple-400" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-3">
        Keep Learning, Keep Growing! 🚀
      </h3>
      <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
        Complete more lessons to earn points and unlock amazing rewards in the shop!
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href={route('student.rewards.index')}
          className="
            bg-gradient-to-r from-yellow-500 to-orange-600 
            text-white px-6 py-3 rounded-xl font-bold
            hover:from-yellow-600 hover:to-orange-700
            transition-all duration-200 shadow-xl
            hover:scale-105
            flex items-center space-x-2
          "
        >
          <Sparkles className="w-5 h-5" />
          <span>View Rewards</span>
        </Link>
        
        <Link
          href={route('student.profile.statistics')}
          className="
            bg-white/10 border border-white/20 
            text-white px-6 py-3 rounded-xl font-bold
            hover:bg-white/20
            transition-all duration-200
            flex items-center space-x-2
          "
        >
          <TrendingUp className="w-5 h-5" />
          <span>View Progress</span>
        </Link>
      </div>
    </div>
  );
};

// Main Component
const LessonsIndex = ({ lessons, filters = {} }) => {
  const [searchTerm, setSearchTerm] = useState(filters.q || '');
  const [difficultyFilter, setDifficultyFilter] = useState(filters.difficulty || 'all');

  // Filter logic
  const filteredLessons = useMemo(() => {
    return lessons.data.filter(lesson => {
      const isActive = lesson.status === 'active';
      const matchesSearch =
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lesson.content && lesson.content.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDifficulty =
        difficultyFilter === 'all' || lesson.difficulty === difficultyFilter;

      return isActive && matchesSearch && matchesDifficulty;
    });
  }, [lessons.data, searchTerm, difficultyFilter]);

  // Statistics
  const stats = useMemo(() => {
    const active = lessons.data.filter(l => l.status === 'active');
    return {
      showing: filteredLessons.length,
      beginner: active.filter(l => l.difficulty === 'beginner').length,
      intermediate: active.filter(l => l.difficulty === 'intermediate').length,
      advanced: active.filter(l => l.difficulty === 'advanced').length
    };
  }, [lessons.data, filteredLessons.length]);

  const hasActiveFilters = searchTerm !== '' || difficultyFilter !== 'all';

  const handleClearFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('all');
  };

  return (
    <StudentLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-400" />
              <span>Available Lessons</span>
            </h1>
            <p className="text-gray-300">
              Explore {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''} and start your learning journey
            </p>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{lessons.total}</div>
              <div className="text-sm text-gray-400">Total Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{filteredLessons.length}</div>
              <div className="text-sm text-gray-400">Available Now</div>
            </div>
          </div>
        </div>
      }
    >
      <Head title="Lessons - Learn & Grow" />

      {/* Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        difficultyFilter={difficultyFilter}
        onDifficultyChange={setDifficultyFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        stats={stats}
      />

      {/* Lessons Grid or Empty State */}
      {filteredLessons.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredLessons.map(lesson => (
              <LessonCard key={lesson.lesson_id} lesson={lesson} />
            ))}
          </div>

          {/* CTA Section */}
          <CTASection />
        </>
      ) : (
        <EmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      )}
    </StudentLayout>
  );
};

export default LessonsIndex;