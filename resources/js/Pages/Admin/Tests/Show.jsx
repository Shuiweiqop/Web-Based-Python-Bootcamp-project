// resources/js/Pages/Admin/Tests/Show.jsx
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  ChevronLeftIcon, 
  PencilIcon, 
  TrashIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function Show(props) {
  // defensive defaults for props from Inertia\
  // In your Show.jsx, add this at the top of the component
console.log('All props:', { lesson, test, previousSubmissions, studentStats });
console.log('Flash from usePage:', usePage().props.flash);
  const {
    auth = {},
    lesson = null,
    test = {},
    flash = {},
  } = props || {};

  // safe helper to resolve a named route
  const safeRoute = (name, params = {}) => {
    try {
      return route(name, params);
    } catch (err) {
      console.warn(`Ziggy route not found: ${name}`, err);
      // try manual fallbacks for common patterns
      if (name === 'admin.lessons.tests.index' && params) {
        return `/admin/lessons/${params}/tests`;
      }
      if (name === 'admin.lessons.tests.edit' && Array.isArray(params)) {
        return `/admin/lessons/${params[0]}/tests/${params[1]}/edit`;
      }
      if (name === 'admin.lessons.tests.destroy' && Array.isArray(params)) {
        return `/admin/lessons/${params[0]}/tests/${params[1]}`;
      }
      return null;
    }
  };

  // handlers
  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return;
    }

    const deleteUrl = safeRoute('admin.lessons.tests.destroy', [lesson?.lesson_id, test?.test_id]) || 
                     `/admin/lessons/${lesson?.lesson_id}/tests/${test?.test_id}`;
    
    router.delete(deleteUrl, {
      onSuccess: () => {
        // Redirect will be handled by controller
      },
      onError: (errors) => {
        console.error('Delete failed:', errors);
        alert('Failed to delete test. Please try again.');
      }
    });
  };

  // helper functions
  const getStatusBadge = (status) => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${classes[status] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'active' && <CheckCircleIcon className="w-4 h-4 mr-1" />}
        {status === 'inactive' && <XCircleIcon className="w-4 h-4 mr-1" />}
        {test.type_display || status || '—'}
      </span>
    );
  };

  const getDifficultyBadge = (level) => {
    const classes = { 
      1: 'bg-blue-100 text-blue-800', 
      2: 'bg-orange-100 text-orange-800', 
      3: 'bg-red-100 text-red-800' 
    };
    const labels = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${classes[level] || 'bg-gray-100 text-gray-800'}`}>
        <AcademicCapIcon className="w-4 h-4 mr-1" />
        {labels[level] || test.difficulty_text || (level ? `Level ${level}` : 'Not set')}
      </span>
    );
  };

  const getTypeDisplay = (type) => {
    const typeLabels = {
      'mcq': 'Multiple Choice',
      'coding': 'Coding Exercise',
      'true_false': 'True/False',
      'short_answer': 'Short Answer',
    };
    return typeLabels[type] || type || '—';
  };

  const formatOptions = (options) => {
    if (!options || !Array.isArray(options)) return null;
    
    return (
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-start">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-700 text-xs font-medium rounded-full mr-3 mt-0.5">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="text-gray-900">{option}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AuthenticatedLayout user={auth?.user} header={<h2>Test Details - {test?.title || 'Untitled'}</h2>}>
      <Head title={`Test: ${test?.title || 'Untitled'} - ${lesson?.title || ''}`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Link 
                href={safeRoute('admin.lessons.tests.index', lesson?.lesson_id) || `/admin/lessons/${lesson?.lesson_id}/tests`}
                className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back to Tests
              </Link>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{test?.title || 'Untitled Test'}</h1>
                <p className="text-gray-600">
                  Lesson: <span className="font-medium">{lesson?.title || '—'}</span>
                </p>
              </div>

              <div className="flex space-x-3">
                <Link
                  href={safeRoute('admin.lessons.tests.edit', [lesson?.lesson_id, test?.test_id]) || 
                        `/admin/lessons/${lesson?.lesson_id}/tests/${test?.test_id}/edit`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <PencilIcon className="w-5 h-5 mr-2" />
                  Edit Test
                </Link>
                
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <TrashIcon className="w-5 h-5 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {flash?.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {flash.success}
            </div>
          )}

          {/* Test Details */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Basic Info */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Order</label>
                  <p className="text-lg font-semibold text-gray-900">#{test?.order || '—'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                  <p className="text-lg font-semibold text-gray-900">{getTypeDisplay(test?.type)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Max Score</label>
                  <p className="text-lg font-semibold text-gray-900">{test?.max_score || '—'} points</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Time Limit</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    {test?.time_limit ? (
                      <>
                        <ClockIcon className="w-5 h-5 mr-1 text-gray-400" />
                        {test.time_limit} minutes
                      </>
                    ) : '—'}
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
                  {getStatusBadge(test?.status)}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Difficulty</label>
                  {getDifficultyBadge(test?.difficulty_level)}
                </div>
              </div>
            </div>

            {/* Description */}
            {test?.description && (
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{test.description}</p>
                </div>
              </div>
            )}

            {/* Options (for MCQ) */}
            {test?.options && Array.isArray(test.options) && test.options.length > 0 && (
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Answer Options</h3>
                {formatOptions(test.options)}
              </div>
            )}

            {/* Correct Answer */}
            {test?.correct_answer && (
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Correct Answer</h3>
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-800 font-medium">{test.correct_answer}</p>
                </div>
              </div>
            )}

            {/* Explanation */}
            {test?.explanation && (
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Explanation</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-blue-800 whitespace-pre-wrap">{test.explanation}</p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Test ID:</span>
                  <span className="ml-2 text-gray-900">{test?.test_id || '—'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Lesson ID:</span>
                  <span className="ml-2 text-gray-900">{test?.lesson_id || '—'}</span>
                </div>
                {test?.created_at && (
                  <div>
                    <span className="font-medium text-gray-500">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(test.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {test?.updated_at && (
                  <div>
                    <span className="font-medium text-gray-500">Last Updated:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(test.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}