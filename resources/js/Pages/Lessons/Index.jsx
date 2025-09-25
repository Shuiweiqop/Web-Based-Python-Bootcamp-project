import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Search, Clock, Award, Play, BookOpen, Filter, Star, Users } from 'lucide-react';

const LessonsIndex = ({ lessons, filters = {} }) => {
  const [searchTerm, setSearchTerm] = useState(filters.q || '');
  const [difficultyFilter, setDifficultyFilter] = useState(filters.difficulty || 'all');

  // Filter lessons client-side for immediate feedback
  const filteredLessons = useMemo(() => {
    return lessons.data.filter(lesson => {
      // Only show active lessons for students
      const isActive = lesson.status === 'active';
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (lesson.description && lesson.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDifficulty = difficultyFilter === 'all' || lesson.difficulty === difficultyFilter;
      
      return isActive && matchesSearch && matchesDifficulty;
    });
  }, [lessons.data, searchTerm, difficultyFilter]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🌿';
      case 'advanced': return '🌳';
      default: return '📚';
    }
  };

  return (
    <>
      <Head title="Available Lessons" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Explore Our Lessons</h1>
              <p className="text-xl text-blue-100 mb-8">
                Discover engaging content designed to help you learn and grow
              </p>
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold">{lessons.total}</div>
                  <div className="text-blue-200">Total Lessons</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{filteredLessons.length}</div>
                  <div className="text-blue-200">Available Now</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Difficulty Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors"
                >
                  <option value="all">All Difficulty Levels</option>
                  <option value="beginner">🌱 Beginner</option>
                  <option value="intermediate">🌿 Intermediate</option>
                  <option value="advanced">🌳 Advanced</option>
                </select>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Showing {filteredLessons.length} lessons</span>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    🌱 {lessons.data.filter(l => l.difficulty === 'beginner' && l.status === 'active').length} Beginner
                  </span>
                  <span className="flex items-center gap-1">
                    🌿 {lessons.data.filter(l => l.difficulty === 'intermediate' && l.status === 'active').length} Intermediate
                  </span>
                  <span className="flex items-center gap-1">
                    🌳 {lessons.data.filter(l => l.difficulty === 'advanced' && l.status === 'active').length} Advanced
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lessons Grid */}
          {filteredLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredLessons.map((lesson) => (
                <div key={lesson.lesson_id} className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  {/* Card Header with Gradient */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">
                        {getDifficultyIcon(lesson.difficulty)}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(lesson.difficulty)} bg-white/90`}>
                        {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {lesson.title}
                    </h3>

                    {lesson.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {lesson.description}
                      </p>
                    )}

                    {/* Lesson Details */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{lesson.estimated_duration ? `${lesson.estimated_duration} min` : 'Self-paced'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                        <Award className="h-4 w-4" />
                        <span>{lesson.completion_reward_points} pts</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-3 mb-6">
                      {lesson.video_url && (
                        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <Play className="h-3 w-3" />
                          <span>Video Content</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <BookOpen className="h-3 w-3" />
                        <span>Interactive</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Lesson #{lesson.lesson_id}
                      </div>
                      
                <Link
                  href={`/lessons/${lesson.lesson_id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 group-hover:bg-blue-700"
                >
                  Start Learning
                  <Play className="h-4 w-4" />
                </Link>
                                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No Results */
            <div className="text-center py-16">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || difficultyFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No lessons are currently available. Check back soon!'}
                </p>
                {(searchTerm || difficultyFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setDifficultyFilter('all');
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Call to Action */}
          {filteredLessons.length > 0 && (
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
                <p className="text-blue-100 mb-6">
                  Join thousands of students already learning with our engaging lessons
                </p>
                <div className="flex justify-center gap-8 text-center">
                  <div>
                    <div className="text-2xl font-bold">⭐</div>
                    <div className="text-sm text-blue-200">High Quality</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">🎯</div>
                    <div className="text-sm text-blue-200">Goal Oriented</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">🏆</div>
                    <div className="text-sm text-blue-200">Rewarding</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LessonsIndex;