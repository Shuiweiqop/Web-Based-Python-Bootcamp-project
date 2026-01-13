import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  Users,
  FileQuestion,
  BarChart3,
  Star,
  Settings
} from 'lucide-react';

export default function Index({ tests, stats, filters, statusOptions }) {
  // ✅ 修复：使用 'q' 而不是 'search'
  const [search, setSearch] = useState(filters.q || '');

  const handleSearch = (e) => {
    e.preventDefault();
    // ✅ 修复：发送 'q' 参数
    router.get(route('admin.placement-tests.index'), { q: search, status: filters.status }, { preserveState: true });
  };

  const handleFilter = (key, value) => {
    router.get(route('admin.placement-tests.index'), 
      { ...filters, [key]: value }, 
      { preserveState: true }
    );
  };

  const handleDelete = (testId) => {
    if (confirm('Are you sure you want to delete this placement test?')) {
      router.delete(route('admin.placement-tests.destroy', testId));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Placement Tests Management
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage placement tests for learning path recommendations
            </p>
          </div>
          <Link href={route('admin.placement-tests.create')}>
            <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-white shadow-lg transition-all hover:shadow-xl">
              <Plus className="h-5 w-5" />
              Create Placement Test
            </button>
          </Link>
        </div>
      }
    >
      <Head title="Placement Tests" />

      <div className="py-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-purple-200 bg-white p-6 shadow-sm dark:border-purple-800 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.total_placement_tests || 0}
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                  <FileQuestion className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-white p-6 shadow-sm dark:border-green-800 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tests</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.active_tests || 0}
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                  <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-white p-6 shadow-sm dark:border-blue-800 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submissions</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.total_submissions || 0}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-white p-6 shadow-sm dark:border-yellow-800 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Default Test</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                    {stats?.default_test_id ? `ID: ${stats.default_test_id}` : 'Not Set'}
                  </p>
                </div>
                <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-slate-800">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search placement tests..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </form>

              {/* Status Filter */}
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilter('status', e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">All Status</option>
                {Object.entries(statusOptions).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tests Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Test
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Questions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tests.data && tests.data.length > 0 ? (
                    tests.data.map((test) => (
                      <tr key={test.test_id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {test.is_default && (
                              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {test.title}
                              </p>
                              {test.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {test.description.substring(0, 50)}
                                  {test.description.length > 50 && '...'}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileQuestion className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {test.questions_count}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {test.total_submissions}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {test.average_score}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(test.status)}`}>
                            {test.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {test.created_at}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Link href={route('admin.placement-tests.show', test.test_id)}>
                              <button 
                                className="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-slate-700"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </Link>
                            <Link href={route('admin.placement-tests.analytics', test.test_id)}>
                              <button 
                                className="rounded-lg border border-blue-300 p-2 text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900"
                                title="View Analytics"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </button>
                            </Link>
                            <Link href={route('admin.placement-tests.edit', test.test_id)}>
                              <button 
                                className="rounded-lg border border-purple-300 p-2 text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900"
                                title="Edit Test"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </Link>
                            {!test.is_default && (
                              <button
                                onClick={() => handleDelete(test.test_id)}
                                className="rounded-lg border border-red-300 p-2 text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900"
                                title="Delete Test"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          No placement tests found
                        </p>
                        <Link href={route('admin.placement-tests.create')}>
                          <button className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">
                            Create Your First Test
                          </button>
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {tests.links && tests.links.length > 3 && (
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {tests.from} to {tests.to} of {tests.total} results
                  </div>
                  <div className="flex gap-1">
                    {tests.links.map((link, index) => (
                      <Link
                        key={index}
                        href={link.url || '#'}
                        preserveState
                        className={`rounded px-3 py-1 text-sm ${
                          link.active
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
                        } ${!link.url && 'cursor-not-allowed opacity-50'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200">
              💡 About Placement Tests
            </h4>
            <p className="mt-2 text-sm text-blue-800 dark:text-blue-300">
              Placement tests help automatically recommend the right learning path for each student based on their skill level.
              Students take the test during onboarding, and the system suggests a path matching their score range.
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}