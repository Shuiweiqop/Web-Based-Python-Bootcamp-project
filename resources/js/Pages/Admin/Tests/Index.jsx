// resources/js/Pages/Admin/Tests/Index.jsx
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  ChevronLeftIcon, 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function Index(props) {
  // defensive defaults for props from Inertia
  const {
    auth = {},
    lesson = null,
    tests = { data: [], links: [], from: 0, to: 0, total: 0 },
    filters = {},
    statusOptions = {},
    flash = {},
  } = props || {};

  // local state
  const [searchQuery, setSearchQuery] = useState(filters?.q || '');
  const [selectedTests, setSelectedTests] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // safe helper to resolve a named route — returns string or null, doesn't throw
  const safeRoute = (name, params = {}) => {
    try {
      return route(name, params);
    } catch (err) {
      console.warn(`Ziggy route not found: ${name}`, err);
      // try manual fallbacks for common patterns
      if (name === 'admin.lessons.tests.index' && params) {
        return `/admin/lessons/${params.lesson}/tests`;
      }
      if (name === 'admin.lessons.tests.bulk-update' && params) {
        return `/admin/lessons/${params}/tests/bulk-update`;
      }
      if (name === 'admin.lessons.tests.create' && params) {
        return `/admin/lessons/${params}/tests/create`;
      }
      if (name === 'admin.lessons.tests.show' && Array.isArray(params)) {
        return `/admin/lessons/${params[0]}/tests/${params[1]}`;
      }
      if (name === 'admin.lessons.tests.edit' && Array.isArray(params)) {
        return `/admin/lessons/${params[0]}/tests/${params[1]}/edit`;
      }
      if (name === 'admin.lessons.tests.duplicate' && Array.isArray(params)) {
        return `/admin/lessons/${params[0]}/tests/${params[1]}/duplicate`;
      }
      if (name === 'admin.lessons.tests.questions.index' && Array.isArray(params)) {
        return `/admin/lessons/${params[0]}/tests/${params[1]}/questions`;
      }
      return null;
    }
  };

  // ----- handlers -----
  const handleSearch = (e) => {
    e && e.preventDefault && e.preventDefault();
    const url = safeRoute('admin.lessons.tests.index', { lesson: lesson?.lesson_id });
    if (!url) {
      router.get(`/admin/lessons/${lesson?.lesson_id}/tests`, { ...filters, q: searchQuery }, { preserveState: true, replace: true });
      return;
    }
    router.get(url, { ...filters, q: searchQuery }, { preserveState: true, replace: true });
  };

  const handleFilter = (key, value) => {
    const url = safeRoute('admin.lessons.tests.index', { lesson: lesson?.lesson_id });
    if (!url) {
      router.get(`/admin/lessons/${lesson?.lesson_id}/tests`, { ...filters, [key]: value }, { preserveState: true, replace: true });
      return;
    }
    router.get(url, { ...filters, [key]: value }, { preserveState: true, replace: true });
  };

  const clearFilters = () => {
    const url = safeRoute('admin.lessons.tests.index', { lesson: lesson?.lesson_id });
    if (!url) {
      router.get(`/admin/lessons/${lesson?.lesson_id}/tests`, {}, { preserveState: true, replace: true });
      return;
    }
    router.get(url, {}, { preserveState: true, replace: true });
  };

  const handleBulkAction = (action) => {
    if (!lesson?.lesson_id) {
      alert('Missing lesson context.');
      return;
    }
    if (selectedTests.length === 0) {
      alert('Please select tests first');
      return;
    }
    if (action === 'delete' && !confirm('Are you sure you want to delete selected tests?')) return;

    const bulkUrl = safeRoute('admin.lessons.tests.bulk-update', lesson.lesson_id) || `/admin/lessons/${lesson.lesson_id}/tests/bulk-update`;
    console.info('Submitting bulk action to', bulkUrl, { test_ids: selectedTests, action });

    router.post(bulkUrl, { test_ids: selectedTests, action }, {
      preserveState: true,
      onFinish: () => setSelectedTests([]),
      onError: (errs) => {
        console.error('Bulk action failed', errs);
        alert('Bulk action failed. Check console for details.');
      }
    });
  };

  const handleDuplicateTest = (testId) => {
    if (!confirm('Are you sure you want to duplicate this test?')) return;
    
    const duplicateUrl = safeRoute('admin.lessons.tests.duplicate', [lesson?.lesson_id, testId]) || 
                         `/admin/lessons/${lesson?.lesson_id}/tests/${testId}/duplicate`;
    
    router.post(duplicateUrl, {}, {
      preserveState: true,
      onError: (errs) => {
        console.error('Duplicate failed', errs);
        alert('Failed to duplicate test. Check console for details.');
      }
    });
  };

  const toggleTestSelection = (testId) => {
    setSelectedTests(prev => (prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]));
  };

  const toggleAllTests = () => {
    const list = Array.isArray(tests?.data) ? tests.data : [];
    setSelectedTests(prev => (prev.length === list.length ? [] : list.map(t => t.test_id)));
  };

  const getStatusBadge = (status) => {
    const classes = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {statusOptions?.[status] ?? status ?? '—'}
      </span>
    );
  };

  // safe lists
  const testsList = Array.isArray(tests?.data) ? tests.data : [];
  const links = Array.isArray(tests?.links) ? tests.links : [];

  // ----- render -----
  return (
    <AuthenticatedLayout user={auth?.user} header={<h2>Tests - {lesson?.title}</h2>}>
      <Head title={`Tests - ${lesson?.title ?? ''}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* header */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Link 
                href={safeRoute('admin.lessons.index') || '/admin/lessons'} 
                className="flex items-center text-gray-500 hover:text-gray-700 mr-4 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" /> Back to Lessons
              </Link>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Test Management</h1>
                <p className="text-gray-600 mt-1">
                  Lesson: <span className="font-medium">{lesson?.title ?? '—'}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Manage tests, questions, and student assessments
                </p>
              </div>

              <Link 
                href={safeRoute('admin.lessons.tests.create', lesson?.lesson_id) || `/admin/lessons/${lesson?.lesson_id}/tests/create`} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
              >
                <PlusIcon className="w-5 h-5 mr-2" /> Create Test
              </Link>
            </div>
          </div>

          {flash?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                {flash.success}
              </div>
            </div>
          )}

          {flash?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {flash.error}
            </div>
          )}

          {/* search & filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <form onSubmit={handleSearch} className="flex-1 max-w-md">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="Search tests..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                </form>

                <button 
                  onClick={() => setShowFilters(!showFilters)} 
                  className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FunnelIcon className="w-5 h-5 mr-2" /> Filters
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select 
                        value={filters?.status ?? ''} 
                        onChange={(e) => handleFilter('status', e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Statuses</option>
                        {Object.entries(statusOptions ?? {}).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button 
                        onClick={clearFilters} 
                        className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* bulk actions */}
          {selectedTests.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">
                  {selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''} selected
                </span>
                <div className="space-x-2">
                  <button 
                    onClick={() => handleBulkAction('activate')} 
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Activate
                  </button>
                  <button 
                    onClick={() => handleBulkAction('deactivate')} 
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Deactivate
                  </button>
                  <button 
                    onClick={() => handleBulkAction('delete')} 
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* tests grid/table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {testsList.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <EyeIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                <p className="text-gray-500 mb-6">
                  Get started by creating your first test for this lesson.
                </p>
                <Link 
                  href={safeRoute('admin.lessons.tests.create', lesson?.lesson_id) || `/admin/lessons/${lesson?.lesson_id}/tests/create`} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center font-medium transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" /> Create First Test
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input 
                          type="checkbox" 
                          checked={selectedTests.length === testsList.length && testsList.length > 0} 
                          onChange={toggleAllTests}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Questions & Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Settings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testsList.map((test) => (
                      <tr key={test.test_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" 
                            checked={selectedTests.includes(test.test_id)} 
                            onChange={() => toggleTestSelection(test.test_id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-sm font-bold text-blue-600">#{test.order ?? '—'}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 truncate">
                                {test.title ?? 'Untitled Test'}
                              </div>
                              {test.description && (
                                <div className="text-sm text-gray-500 truncate max-w-sm mt-1">
                                  {test.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center text-gray-900 font-medium">
                              <span>{test.questions_count ?? 0} questions</span>
                            </div>
                            <div className="flex items-center text-gray-500 mt-1">
                              <span>{test.total_points ?? 0} total points</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            {test.time_limit && (
                              <div className="flex items-center text-gray-600">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                <span>{test.time_limit} min</span>
                              </div>
                            )}
                            <div className="flex items-center text-gray-600">
                              <UserGroupIcon className="w-4 h-4 mr-1" />
                              <span>{test.max_attempts ?? 3} attempts</span>
                            </div>
                            <div className="text-gray-600">
                              Pass: {test.passing_score ?? 70}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(test.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Link 
                              href={safeRoute('admin.lessons.tests.show', [lesson?.lesson_id, test.test_id]) || 
                                    `/admin/lessons/${lesson?.lesson_id}/tests/${test.test_id}`} 
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="View Test"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Link>
                            
                            <Link 
                              href={safeRoute('admin.lessons.tests.questions.index', [lesson?.lesson_id, test.test_id]) || 
                                    `/admin/lessons/${lesson?.lesson_id}/tests/${test.test_id}/questions`} 
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Manage Questions"
                            >
                              <span className="text-sm font-medium">Q</span>
                            </Link>
                            
                            <Link 
                              href={safeRoute('admin.lessons.tests.edit', [lesson?.lesson_id, test.test_id]) || 
                                    `/admin/lessons/${lesson?.lesson_id}/tests/${test.test_id}/edit`} 
                              className="text-indigo-600 hover:text-indigo-900 transition-colors"
                              title="Edit Test"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                            
                            <button 
                              onClick={() => handleDuplicateTest(test.test_id)}
                              className="text-purple-600 hover:text-purple-900 transition-colors"
                              title="Duplicate Test"
                            >
                              <DocumentDuplicateIcon className="w-4 h-4" />
                            </button>
                            
                            <button 
                              onClick={() => { 
                                if (confirm('Are you sure you want to delete this test?')) { 
                                  const delUrl = safeRoute('admin.lessons.tests.destroy', [lesson?.lesson_id, test.test_id]) || 
                                                `/admin/lessons/${lesson?.lesson_id}/tests/${test.test_id}`;
                                  router.delete(delUrl); 
                                } 
                              }} 
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete Test"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* pagination */}
          {links.length > 3 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{tests?.from ?? 0}</span> to{' '}
                  <span className="font-medium">{tests?.to ?? 0}</span> of{' '}
                  <span className="font-medium">{tests?.total ?? 0}</span> results
                </div>
                <div className="flex space-x-1">
                  {links.map((link, idx) => (
                    <Link 
                      key={idx} 
                      href={link.url || '#'} 
                      className={`px-3 py-2 rounded-md text-sm transition-colors ${
                        link.active 
                          ? 'bg-blue-600 text-white' 
                          : (link.url 
                              ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                      }`} 
                      dangerouslySetInnerHTML={{ __html: link.label }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}