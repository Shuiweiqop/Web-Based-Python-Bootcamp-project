import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import {
  Award,
  BookOpen,
  Search,
  Sparkles,
  Trophy,
  TrendingUp,
  X,
} from 'lucide-react';

const getDifficultyConfig = (difficulty) => {
  const map = {
    beginner: {
      color: 'from-green-500 to-emerald-600',
      badge: 'bg-green-500/20 text-green-300 border-green-500/30',
      label: 'Beginner',
    },
    intermediate: {
      color: 'from-yellow-500 to-orange-600',
      badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      label: 'Intermediate',
    },
    advanced: {
      color: 'from-red-500 to-purple-600',
      badge: 'bg-red-500/20 text-red-300 border-red-500/30',
      label: 'Advanced',
    },
  };

  return map[difficulty] || map.beginner;
};

const getBestForLabel = (lesson) => {
  const title = lesson.title.toLowerCase();

  if (lesson.difficulty === 'beginner') {
    return 'Best for first-time learners';
  }
  if (title.includes('string') || title.includes('variable') || title.includes('data type')) {
    return 'Best for core Python basics';
  }
  if ((lesson.estimated_duration || 0) <= 40) {
    return 'Best for quick review';
  }
  if (title.includes('function') || title.includes('loop')) {
    return 'Best for building coding confidence';
  }

  return 'Best for guided practice';
};

const getClickReason = (lesson) => {
  const exercises = lesson.required_exercises ?? 0;
  const tests = lesson.required_tests ?? 0;

  if (exercises > 0 || tests > 0) {
    return `${exercises} practice${exercises === 1 ? '' : 's'} + ${tests} check${tests === 1 ? '' : 's'}`;
  }

  if (lesson.completion_reward_points) {
    return `Earn ${lesson.completion_reward_points} pts`;
  }

  if (lesson.estimated_duration) {
    return `${lesson.estimated_duration} min ${lesson.difficulty || 'guided'} lesson`;
  }

  return 'Start this guided lesson';
};

const LessonCard = ({ lesson }) => {
  const config = getDifficultyConfig(lesson.difficulty);
  const bestForLabel = getBestForLabel(lesson);
  const clickReason = getClickReason(lesson);

  return (
    <Link href={route('lessons.show', lesson.lesson_id)} className="group block">
      <div className="relative h-full overflow-hidden rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/40 hover:shadow-2xl">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10 transition-opacity duration-300 group-hover:opacity-20`} />

        <div className="relative p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${config.color} shadow-lg`}>
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${config.badge}`}>
                {config.label}
              </span>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-200">
              {bestForLabel}
            </span>
          </div>

          <h3 className="mb-3 line-clamp-2 text-xl font-bold text-white transition-colors group-hover:text-blue-300">
            {lesson.title}
          </h3>

          {lesson.content && (
            <p className="mb-4 line-clamp-2 text-sm text-gray-300">
              {lesson.content.replace(/<[^>]*>/g, '').substring(0, 110)}...
            </p>
          )}

          <div className="mb-4 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Why click this lesson</p>
            <p className="mt-1 text-sm font-semibold text-white">{clickReason}</p>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              {lesson.estimated_duration && (
                <span>{lesson.estimated_duration} min</span>
              )}
              {lesson.completion_reward_points && (
                <span className="font-bold text-yellow-400">{lesson.completion_reward_points} pts</span>
              )}
            </div>
            <div className="text-sm font-semibold text-blue-400 transition-colors group-hover:text-blue-300">
              Start Lesson
            </div>
          </div>
        </div>

        <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
      </div>
    </Link>
  );
};

const FilterBar = ({
  searchTerm,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  hasActiveFilters,
  onClearFilters,
  stats,
}) => {
  const difficulties = [
    { value: 'all', label: 'All Levels', count: stats.showing },
    { value: 'beginner', label: 'Beginner', count: stats.beginner },
    { value: 'intermediate', label: 'Intermediate', count: stats.intermediate },
    { value: 'advanced', label: 'Advanced', count: stats.advanced },
  ];

  return (
    <div data-sfx className="mb-8 rounded-2xl border border-white/20 bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search lessons by title or content..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-12 pr-4 text-white placeholder-gray-400 transition-all duration-200 focus:bg-white/20 focus:outline-none focus:border-blue-500"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty.value}
            onClick={() => onDifficultyChange(difficulty.value)}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              difficultyFilter === difficulty.value
                ? 'scale-105 bg-blue-500 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <span>{difficulty.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              difficultyFilter === difficulty.value ? 'bg-white/30' : 'bg-white/20'
            }`}>
              {difficulty.count}
            </span>
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-2 rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/30"
          >
            <X className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ hasFilters, onClearFilters }) => (
  <div className="py-16 text-center">
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/20 bg-black/40 p-12 backdrop-blur-xl">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl">
        <BookOpen className="h-12 w-12 text-white" />
      </div>

      {hasFilters ? (
        <>
          <h3 className="mb-4 text-2xl font-bold text-white">No Lessons Found</h3>
          <p className="mb-6 text-gray-300">
            We could not find any lessons matching your filters.
            <br />Try adjusting your search or clearing the filters.
          </p>
          <button
            onClick={onClearFilters}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-purple-700"
          >
            Clear All Filters
          </button>
        </>
      ) : (
        <>
          <h3 className="mb-4 text-2xl font-bold text-white">No Lessons Available Yet</h3>
          <p className="text-gray-300">Check back soon. New lessons are being added regularly.</p>
        </>
      )}
    </div>
  </div>
);

const CTASection = () => (
  <div data-sfx className="rounded-3xl border border-white/20 bg-gradient-to-r from-blue-500/20 to-purple-600/20 p-8 text-center backdrop-blur-xl">
    <div className="mb-6 flex justify-center">
      <div className="flex items-center space-x-2">
        <Trophy className="h-8 w-8 text-yellow-400" />
        <Sparkles className="h-8 w-8 text-blue-400" />
        <Award className="h-8 w-8 text-purple-400" />
      </div>
    </div>

    <h3 className="mb-3 text-2xl font-bold text-white">Keep learning, keep growing!</h3>
    <p className="mx-auto mb-6 max-w-2xl text-gray-300">
      Complete more lessons to earn points, build momentum, and unlock new rewards in the shop.
    </p>

    <div className="flex flex-wrap justify-center gap-4">
      <Link
        href={route('student.rewards.index')}
        className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 px-6 py-3 font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 hover:from-yellow-600 hover:to-orange-700"
      >
        <Sparkles className="h-5 w-5" />
        <span>View Rewards</span>
      </Link>

      <Link
        href={route('student.profile.statistics')}
        className="flex items-center space-x-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition-all duration-200 hover:bg-white/20"
      >
        <TrendingUp className="h-5 w-5" />
        <span>View Progress</span>
      </Link>
    </div>
  </div>
);

const LessonsIndex = ({ lessons, filters = {} }) => {
  const [searchTerm, setSearchTerm] = useState(filters.q || '');
  const [difficultyFilter, setDifficultyFilter] = useState(filters.difficulty || 'all');

  const filteredLessons = useMemo(() => {
    return lessons.data.filter((lesson) => {
      const isActive = lesson.status === 'active';
      const matchesSearch =
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lesson.content && lesson.content.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDifficulty =
        difficultyFilter === 'all' || lesson.difficulty === difficultyFilter;

      return isActive && matchesSearch && matchesDifficulty;
    });
  }, [lessons.data, searchTerm, difficultyFilter]);

  const stats = useMemo(() => {
    const activeLessons = lessons.data.filter((lesson) => lesson.status === 'active');
    return {
      showing: filteredLessons.length,
      beginner: activeLessons.filter((lesson) => lesson.difficulty === 'beginner').length,
      intermediate: activeLessons.filter((lesson) => lesson.difficulty === 'intermediate').length,
      advanced: activeLessons.filter((lesson) => lesson.difficulty === 'advanced').length,
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
            <h1 className="mb-2 flex items-center space-x-3 text-3xl font-bold text-white">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <span>Available Lessons</span>
            </h1>
            <p className="text-gray-300">
              Explore {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''} and find your next guided win.
            </p>
          </div>

          <div className="hidden items-center space-x-6 md:flex">
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

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        difficultyFilter={difficultyFilter}
        onDifficultyChange={setDifficultyFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        stats={stats}
      />

      {filteredLessons.length > 0 ? (
        <>
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <LessonCard key={lesson.lesson_id} lesson={lesson} />
            ))}
          </div>
          <CTASection />
        </>
      ) : (
        <EmptyState hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
      )}
    </StudentLayout>
  );
};

export default LessonsIndex;
