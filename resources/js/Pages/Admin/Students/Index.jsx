// resources/js/Pages/Admin/Students/Index.jsx
import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  getStatusBadge, 
  getDifficultyBadge, 
  getScoreBadge,
  getPercentageBadge 
} from '@/Pages/Admin/Lessons/components/BadgeHelpers';

export default function StudentIndex({ students, stats, filters }) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [selectedFilter, setSelectedFilter] = useState(filters?.filter || 'all');
  const [sortBy, setSortBy] = useState(filters?.sort || 'recent');
  const [viewMode, setViewMode] = useState('grid'); // grid or table

  // ✅ 辅助函数：获取头像 URL
  const getAvatarUrl = (user) => {
    if (!user) {
      return 'https://api.dicebear.com/7.x/avataaars/svg?seed=unknown&backgroundColor=3B82F6';
    }
    
    if (user.avatar) {
      return user.avatar;
    }
    
    if (user.profile_picture) {
      return user.profile_picture;
    }
    
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || user.email || 'default')}&backgroundColor=3B82F6`;
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('admin.students.index'), {
      search: searchTerm,
      filter: selectedFilter,
      sort: sortBy,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    router.get(route('admin.students.index'), {
      search: searchTerm,
      filter: filter,
      sort: sortBy,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Handle sort change
  const handleSortChange = (sort) => {
    setSortBy(sort);
    router.get(route('admin.students.index'), {
      search: searchTerm,
      filter: selectedFilter,
      sort: sort,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Get level info
  const getLevelInfo = (points) => {
    if (points >= 10000) return { level: 'Expert', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (points >= 5000) return { level: 'Advanced', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (points >= 2000) return { level: 'Intermediate', color: 'text-green-600', bg: 'bg-green-100' };
    if (points >= 500) return { level: 'Beginner', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Newbie', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  // Get activity status
  const getActivityStatus = (lastActivityDate) => {
    if (!lastActivityDate) return { status: 'Never', color: 'text-gray-500' };
    
    const now = new Date();
    const lastActivity = new Date(lastActivityDate);
    const diffDays = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { status: 'Today', color: 'text-green-600' };
    if (diffDays === 1) return { status: 'Yesterday', color: 'text-blue-600' };
    if (diffDays <= 7) return { status: `${diffDays} days ago`, color: 'text-yellow-600' };
    if (diffDays <= 30) return { status: `${diffDays} days ago`, color: 'text-orange-600' };
    return { status: `${diffDays} days ago`, color: 'text-red-600' };
  };

  return (
    <AuthenticatedLayout>
      <Head title="Student Management" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">👥 Student Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and monitor all student accounts, progress, and performance
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold mt-2">{stats.total_students.toLocaleString()}</p>
                </div>
                <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                  <span className="text-3xl">👥</span>
                </div>
              </div>
              <div className="mt-4 text-blue-100 text-sm">
                +{stats.new_this_month} this month
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Students</p>
                  <p className="text-3xl font-bold mt-2">{stats.active_students.toLocaleString()}</p>
                </div>
                <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                  <span className="text-3xl">✅</span>
                </div>
              </div>
              <div className="mt-4 text-green-100 text-sm">
                {((stats.active_students / stats.total_students) * 100).toFixed(1)}% of total
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Avg. Score</p>
                  <p className="text-3xl font-bold mt-2">{stats.average_score.toFixed(1)}%</p>
                </div>
                <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
                  <span className="text-3xl">📊</span>
                </div>
              </div>
              <div className="mt-4 text-yellow-100 text-sm">
                Across all students
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Points</p>
                  <p className="text-3xl font-bold mt-2">{stats.total_points.toLocaleString()}</p>
                </div>
                <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                  <span className="text-3xl">⭐</span>
                </div>
              </div>
              <div className="mt-4 text-purple-100 text-sm">
                Earned by all students
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
              </form>

              {/* Filter Dropdown */}
              <select
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Students</option>
                <option value="active">Active (7 days)</option>
                <option value="inactive">Inactive (30+ days)</option>
                <option value="high_achievers">High Achievers (5000+ points)</option>
                <option value="beginners">Beginners</option>
                <option value="streak">Good Streak (7+ days)</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Recently Active</option>
                <option value="points_high">Points (High to Low)</option>
                <option value="points_low">Points (Low to High)</option>
                <option value="score_high">Avg Score (High to Low)</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  📱 Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  📋 Table
                </button>
              </div>
            </div>
          </div>

          {/* Students List - Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.data.map((student) => {
                const levelInfo = getLevelInfo(student.current_points);
                const activityStatus = getActivityStatus(student.last_activity_date);
                const avatarUrl = getAvatarUrl(student.user); // ✅ 使用辅助函数

                return (
                  <div
                    key={student.student_id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
                    onClick={() => router.visit(route('admin.students.show', student.student_id))}
                  >
                    {/* Header with Background */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-24 relative">
                      {student.equipped_snapshot?.background && (
                        <img 
                          src={student.equipped_snapshot.background.image_url} 
                          alt="Background"
                          className="w-full h-full object-cover opacity-50"
                        />
                      )}
                      
                      {/* Avatar */}
                      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                        <div className="relative">
                          <img
                            src={avatarUrl}
                            alt={student.user?.name || 'Student'}
                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                            onError={(e) => {
                              e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback&backgroundColor=3B82F6';
                            }}
                          />
                          {student.equipped_snapshot?.avatar_frame && (
                            <img
                              src={student.equipped_snapshot.avatar_frame.image_url}
                              alt="Frame"
                              className="absolute inset-0 w-24 h-24"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pt-14 pb-6 px-6">
                      {/* Name and Title */}
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          {student.user?.name || 'Unknown'}
                        </h3>
                        {student.equipped_snapshot?.title && (
                          <p className="text-sm text-purple-600 font-medium mt-1">
                            {student.equipped_snapshot.title.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">{student.user?.email}</p>
                      </div>

                      {/* Level Badge */}
                      <div className="flex justify-center mb-4">
                        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${levelInfo.bg} ${levelInfo.color}`}>
                          ⭐ {levelInfo.level}
                        </span>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {student.current_points.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Points</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {student.average_score?.toFixed(1) || 0}%
                          </p>
                          <p className="text-xs text-gray-500">Avg Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {student.total_lessons_completed}
                          </p>
                          <p className="text-xs text-gray-500">Lessons</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">
                            {student.streak_days}
                          </p>
                          <p className="text-xs text-gray-500">Day Streak</p>
                        </div>
                      </div>

                      {/* Badges Display */}
                      {student.equipped_snapshot?.badges && student.equipped_snapshot.badges.length > 0 && (
                        <div className="flex justify-center gap-2 mb-4 flex-wrap">
                          {student.equipped_snapshot.badges.slice(0, 3).map((badge, idx) => (
                            <img
                              key={idx}
                              src={badge.image_url}
                              alt={badge.name}
                              title={badge.name}
                              className="w-8 h-8 object-contain"
                            />
                          ))}
                          {student.equipped_snapshot.badges.length > 3 && (
                            <span className="text-xs text-gray-500 self-center">
                              +{student.equipped_snapshot.badges.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Activity Status */}
                      <div className="text-center pt-4 border-t border-gray-200">
                        <p className={`text-sm font-medium ${activityStatus.color}`}>
                          🕒 Last active: {activityStatus.status}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Students List - Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Streak
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.data.map((student) => {
                      const levelInfo = getLevelInfo(student.current_points);
                      const activityStatus = getActivityStatus(student.last_activity_date);
                      const avatarUrl = getAvatarUrl(student.user); // ✅ 使用辅助函数

                      return (
                        <tr 
                          key={student.student_id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.visit(route('admin.students.show', student.student_id))}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="relative flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={avatarUrl}
                                  alt={student.user?.name || 'Student'}
                                  onError={(e) => {
                                    e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback&backgroundColor=3B82F6';
                                  }}
                                />
                                {student.equipped_snapshot?.avatar_frame && (
                                  <img
                                    src={student.equipped_snapshot.avatar_frame.image_url}
                                    alt="Frame"
                                    className="absolute inset-0 w-10 h-10"
                                  />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.user?.name || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {student.user?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${levelInfo.bg} ${levelInfo.color}`}>
                              {levelInfo.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-semibold">
                              {student.current_points.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getPercentageBadge(student.average_score || 0, 'sm')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <span className="mr-2">{student.total_lessons_completed}</span>
                              <span className="text-gray-400">lessons</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-orange-500 mr-1">🔥</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {student.streak_days} days
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm ${activityStatus.color}`}>
                              {activityStatus.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.visit(route('admin.students.show', student.student_id));
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.visit(route('admin.students.edit', student.student_id));
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {students.data.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <span className="text-6xl mb-4 block">😔</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-md">
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">{students.from}</span> to{' '}
                <span className="font-semibold">{students.to}</span> of{' '}
                <span className="font-semibold">{students.total}</span> students
              </div>
              
              <div className="flex gap-2">
                {students.links.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (link.url) {
                        router.visit(link.url, {
                          preserveState: true,
                          preserveScroll: true,
                        });
                      }
                    }}
                    disabled={!link.url}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      link.active
                        ? 'bg-blue-600 text-white'
                        : link.url
                        ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </AuthenticatedLayout>
  );
}