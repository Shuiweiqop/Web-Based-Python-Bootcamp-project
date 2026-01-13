import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { cn } from '@/utils/cn';
import {
  Users,
  Search,
  Filter,
  Activity,
  Eye,
  Edit,
  Trash2,
  X,
  Plus,
  Minus,
  Trophy,
  Check,
  Zap,
  Target,
} from 'lucide-react';

export default function Index({ students = null, stats = null, filters = {} }) {
  const studentsData = students?.data || [];
  const studentsLinks = students?.links || [];
  const studentsFrom = students?.from || 0;
  const studentsTo = students?.to || 0;
  const studentsTotal = students?.total || 0;
  
  const [searchQuery, setSearchQuery] = useState(filters?.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pointsAction, setPointsAction] = useState('add');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    window.addEventListener('theme-changed', checkDarkMode);
    
    return () => window.removeEventListener('theme-changed', checkDarkMode);
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
    
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      router.get(route('admin.students.index'), {
        search: value,
        status: selectedStatus,
      }, {
        preserveState: true,
        preserveScroll: true,
      });
    }, 300);
  };

  const handleFilterChange = (filterType, value) => {
    const params = {
      search: searchQuery,
      status: value,
    };
    
    setSelectedStatus(value);
    
    router.get(route('admin.students.index'), params, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleDelete = (student) => {
    if (confirm(`Are you sure you want to delete ${student.name}?`)) {
      router.delete(route('admin.students.destroy', student.user_Id), {
        preserveScroll: true,
      });
    }
  };

  const handlePointsSubmit = () => {
    if (!selectedStudent || !pointsAmount) return;
    
    router.post(route('admin.students.adjust-points', selectedStudent.user_Id), {
      action: pointsAction,
      points: parseInt(pointsAmount),
      reason: pointsReason,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setShowPointsModal(false);
        setPointsAmount('');
        setPointsReason('');
        setSelectedStudent(null);
      },
    });
  };

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className={cn(
      "relative overflow-hidden rounded-xl border transition-all card-hover-effect",
      isDark 
        ? "glassmorphism-enhanced border-white/10" 
        : "bg-white border-purple-200 shadow-sm"
    )}>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-5",
        color
      )} />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-3 rounded-lg",
            isDark ? "bg-white/10" : "bg-purple-100"
          )}>
            <Icon className={cn(
              "w-6 h-6",
              isDark ? "text-cyan-400" : "text-purple-600"
            )} />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              trend > 0
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            )}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        
        <p className={cn(
          "text-2xl font-bold mb-1",
          isDark ? "text-white" : "text-slate-900"
        )}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className={cn(
          "text-sm",
          isDark ? "text-slate-400" : "text-slate-600"
        )}>
          {label}
        </p>
      </div>
    </div>
  );

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Student Management</h1>
            <p className={cn(
              "text-sm",
              isDark ? "text-slate-400" : "text-slate-600"
            )}>
              Manage and monitor student accounts
            </p>
          </div>
        </div>
      }
    >
      <Head title="Student Management" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats?.total || 0}
          color="from-purple-500 to-cyan-500"
        />
        <StatCard
          icon={Activity}
          label="Active Students"
          value={stats?.active || 0}
          trend={12}
          color="from-green-500 to-teal-500"
        />
        <StatCard
          icon={Trophy}
          label="Total Points"
          value={stats?.total_points || 0}
          color="from-yellow-500 to-orange-500"
        />
      </div>

      {/* Main Content Card */}
      <div className={cn(
        "rounded-xl border overflow-hidden animate-fadeIn",
        isDark
          ? "glassmorphism-enhanced border-white/10"
          : "bg-white border-purple-200 shadow-sm"
      )}>
        {/* Header with Search and Filters */}
        <div className={cn(
          "p-6 border-b",
          isDark ? "border-white/10" : "border-purple-200"
        )}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative group">
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-all",
                isDark 
                  ? "text-slate-400 group-focus-within:text-cyan-400" 
                  : "text-slate-500 group-focus-within:text-purple-600"
              )} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-lg transition-all focus:outline-none",
                  isDark
                    ? "bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:bg-white/10 focus:border-cyan-400/50"
                    : "bg-gray-50 border border-purple-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-400"
                )}
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ripple-effect",
                showFilters
                  ? isDark
                    ? "bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-cyan-400/50 text-white"
                    : "bg-gradient-to-r from-purple-100 to-cyan-100 border border-purple-400 text-purple-700"
                  : isDark
                    ? "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                    : "bg-gray-50 border border-purple-200 text-slate-700 hover:bg-purple-50"
              )}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              {selectedStatus !== 'all' && (
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className={cn(
              "mt-4 p-4 rounded-lg border animate-fadeIn",
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-gray-50 border-purple-200"
            )}>
              <div className="grid grid-cols-1 gap-4">
                {/* Status Filter */}
                <div>
                  <label className={cn(
                    "block text-sm font-medium mb-2",
                    isDark ? "text-slate-300" : "text-slate-700"
                  )}>
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg transition-all focus:outline-none",
                      isDark
                        ? "bg-white/5 border border-white/10 text-white focus:border-cyan-400/50"
                        : "bg-white border border-purple-200 text-slate-900 focus:border-purple-400"
                    )}
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                    <option value="active">Active (7 days)</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {selectedStatus !== 'all' && (
                <button
                  onClick={() => {
                    setSelectedStatus('all');
                    router.get(route('admin.students.index'), {
                      search: searchQuery,
                    });
                  }}
                  className={cn(
                    "mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all ripple-effect",
                    isDark
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                  )}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn(
              "border-b",
              isDark ? "border-white/10" : "border-purple-200"
            )}>
              <tr>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider",
                  isDark ? "text-slate-400" : "text-slate-600"
                )}>
                  Student
                </th>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider",
                  isDark ? "text-slate-400" : "text-slate-600"
                )}>
                  Points
                </th>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider",
                  isDark ? "text-slate-400" : "text-slate-600"
                )}>
                  Status
                </th>
                <th className={cn(
                  "px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider",
                  isDark ? "text-slate-400" : "text-slate-600"
                )}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {studentsData.length > 0 ? (
                studentsData.map((student, index) => (
                  <tr
                    key={student.user_Id}
                    className={cn(
                      "transition-colors animate-fadeIn",
                      isDark ? "hover:bg-white/5" : "hover:bg-purple-50/50"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Student Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="text-sm font-bold text-white">
                            {student.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className={cn(
                            "font-medium truncate",
                            isDark ? "text-white" : "text-slate-900"
                          )}>
                            {student.name || 'Unknown'}
                          </p>
                          <p className={cn(
                            "text-sm truncate",
                            isDark ? "text-slate-400" : "text-slate-600"
                          )}>
                            {student.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Points */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Trophy className={cn(
                          "w-4 h-4",
                          isDark ? "text-yellow-400" : "text-yellow-500"
                        )} />
                        <span className={cn(
                          "font-semibold",
                          isDark ? "text-white" : "text-slate-900"
                        )}>
                          {(student.student_profile?.current_points || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs",
                          student.email_verified_at
                            ? isDark
                              ? "text-green-400"
                              : "text-green-600"
                            : isDark
                              ? "text-yellow-400"
                              : "text-yellow-600"
                        )}>
                          <Check className="w-3 h-3" />
                          {student.email_verified_at ? 'Verified' : 'Unverified'}
                        </span>
                        {student.student_profile?.streak_days > 0 && (
                          <span className={cn(
                            "inline-flex items-center gap-1 text-xs",
                            isDark ? "text-orange-400" : "text-orange-600"
                          )}>
                            <Zap className="w-3 h-3" />
                            {student.student_profile.streak_days} day streak
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={route('admin.students.show', student.user_Id)}
                          className={cn(
                            "p-2 rounded-lg transition-all ripple-effect",
                            isDark
                              ? "hover:bg-white/10 text-slate-400 hover:text-cyan-400"
                              : "hover:bg-purple-100 text-slate-600 hover:text-purple-600"
                          )}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        <Link
                          href={route('admin.students.edit', student.user_Id)}
                          className={cn(
                            "p-2 rounded-lg transition-all ripple-effect",
                            isDark
                              ? "hover:bg-white/10 text-slate-400 hover:text-blue-400"
                              : "hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                          )}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowPointsModal(true);
                          }}
                          className={cn(
                            "p-2 rounded-lg transition-all ripple-effect",
                            isDark
                              ? "hover:bg-white/10 text-slate-400 hover:text-yellow-400"
                              : "hover:bg-yellow-100 text-slate-600 hover:text-yellow-600"
                          )}
                          title="Adjust Points"
                        >
                          <Target className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(student)}
                          className={cn(
                            "p-2 rounded-lg transition-all ripple-effect",
                            isDark
                              ? "hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                              : "hover:bg-red-100 text-slate-600 hover:text-red-600"
                          )}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className={cn(
                        "w-12 h-12",
                        isDark ? "text-slate-600" : "text-slate-400"
                      )} />
                      <p className={cn(
                        "text-sm",
                        isDark ? "text-slate-400" : "text-slate-600"
                      )}>
                        No students found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {studentsLinks.length > 3 && (
          <div className={cn(
            "px-6 py-4 border-t",
            isDark ? "border-white/10" : "border-purple-200"
          )}>
            <div className="flex items-center justify-between">
              <p className={cn(
                "text-sm",
                isDark ? "text-slate-400" : "text-slate-600"
              )}>
                Showing <span className="font-medium">{studentsFrom}</span> to{' '}
                <span className="font-medium">{studentsTo}</span> of{' '}
                <span className="font-medium">{studentsTotal}</span> students
              </p>
              
              <div className="flex gap-2">
                {studentsLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    disabled={!link.url}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all ripple-effect",
                      link.active
                        ? isDark
                          ? "bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-white border border-cyan-400/50"
                          : "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                        : !link.url
                          ? isDark
                            ? "bg-white/5 text-slate-600 cursor-not-allowed"
                            : "bg-gray-100 text-slate-400 cursor-not-allowed"
                          : isDark
                            ? "bg-white/5 text-slate-300 hover:bg-white/10"
                            : "bg-gray-100 text-slate-700 hover:bg-purple-100"
                    )}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Points Adjustment Modal */}
      {showPointsModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className={cn(
            "w-full max-w-md rounded-xl border overflow-hidden animate-bounceIn",
            isDark
              ? "glassmorphism-enhanced border-white/10"
              : "bg-white border-purple-200 shadow-2xl"
          )}>
            {/* Header */}
            <div className={cn(
              "px-6 py-4 border-b flex items-center justify-between",
              isDark
                ? "border-white/10 bg-gradient-to-r from-purple-500/10 to-cyan-500/10"
                : "border-purple-200 bg-gradient-to-r from-purple-50 to-cyan-50"
            )}>
              <div>
                <h3 className={cn(
                  "text-lg font-bold",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  Adjust Points
                </h3>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-slate-400" : "text-slate-600"
                )}>
                  {selectedStudent.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPointsModal(false);
                  setSelectedStudent(null);
                  setPointsAmount('');
                  setPointsReason('');
                }}
                className={cn(
                  "p-2 rounded-lg transition-all ripple-effect",
                  isDark
                    ? "hover:bg-white/10 text-slate-400"
                    : "hover:bg-gray-100 text-slate-600"
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Current Points */}
              <div className={cn(
                "p-4 rounded-lg",
                isDark ? "bg-white/5" : "bg-gray-50"
              )}>
                <p className={cn(
                  "text-sm mb-1",
                  isDark ? "text-slate-400" : "text-slate-600"
                )}>
                  Current Points
                </p>
                <p className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  {(selectedStudent.student_profile?.current_points || 0).toLocaleString()}
                </p>
              </div>

              {/* Action Type */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? "text-slate-300" : "text-slate-700"
                )}>
                  Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['add', 'deduct', 'set'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => setPointsAction(action)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all ripple-effect capitalize",
                        pointsAction === action
                          ? isDark
                            ? "bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-white border border-cyan-400/50"
                            : "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                          : isDark
                            ? "bg-white/5 text-slate-300 hover:bg-white/10"
                            : "bg-gray-100 text-slate-700 hover:bg-purple-100"
                      )}
                    >
                      {action === 'add' && <Plus className="w-4 h-4 inline mr-1" />}
                      {action === 'deduct' && <Minus className="w-4 h-4 inline mr-1" />}
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* Points Amount */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? "text-slate-300" : "text-slate-700"
                )}>
                  Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  required
                  className={cn(
                    "w-full px-4 py-2 rounded-lg transition-all focus:outline-none",
                    isDark
                      ? "bg-white/5 border border-white/10 text-white focus:border-cyan-400/50"
                      : "bg-white border border-purple-200 text-slate-900 focus:border-purple-400"
                  )}
                  placeholder="Enter amount"
                />
              </div>

              {/* Reason */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? "text-slate-300" : "text-slate-700"
                )}>
                  Reason (Optional)
                </label>
                <textarea
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  rows={3}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg transition-all focus:outline-none resize-none",
                    isDark
                      ? "bg-white/5 border border-white/10 text-white focus:border-cyan-400/50"
                      : "bg-white border border-purple-200 text-slate-900 focus:border-purple-400"
                  )}
                  placeholder="Enter reason for adjustment..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPointsModal(false);
                    setSelectedStudent(null);
                    setPointsAmount('');
                    setPointsReason('');
                  }}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg font-medium transition-all ripple-effect",
                    isDark
                      ? "bg-white/5 text-slate-300 hover:bg-white/10"
                      : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePointsSubmit}
                  disabled={!pointsAmount}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg font-medium transition-all ripple-effect",
                    pointsAmount
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/50"
                      : isDark
                        ? "bg-white/5 text-slate-600 cursor-not-allowed"
                        : "bg-gray-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}