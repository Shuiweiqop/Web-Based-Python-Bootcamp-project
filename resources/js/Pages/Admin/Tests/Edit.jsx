// resources/js/Pages/Admin/Tests/Edit.jsx
import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
  ChevronLeftIcon, 
  PlusIcon, 
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Edit(props) {
  // defensive defaults for props from Inertia
  const {
    auth = {},
    lesson = null,
    test = {},
    typeOptions = {},
    statusOptions = {},
    difficultyOptions = {},
    errors = {},
    flash = {},
  } = props || {};

  // form state using Inertia's useForm
  const { data, setData, put, processing, errors: formErrors, reset } = useForm({
    title: test?.title || '',
    description: test?.description || '',
    type: test?.type || 'mcq',
    options: test?.options || ['', ''],
    correct_answer: test?.correct_answer || '',
    explanation: test?.explanation || '',
    max_score: test?.max_score || 10,
    time_limit: test?.time_limit || '',
    difficulty_level: test?.difficulty_level || 1,
    status: test?.status || 'draft',
    order: test?.order || '',
  });

  // local state for dynamic options management
  const [optionErrors, setOptionErrors] = useState({});

  // safe helper to resolve a named route
  const safeRoute = (name, params = {}) => {
    try {
      return route(name, params);
    } catch (err) {
      console.warn(`Ziggy route not found: ${name}`, err);
      if (name === 'admin.lessons.tests.index' && params) {
        return `/admin/lessons/${params}/tests`;
      }
      if (name === 'admin.lessons.tests.show' && Array.isArray(params)) {
        return `/admin/lessons/${params[0]}/tests/${params[1]}`;
      }
      return null;
    }
  };

  // ensure options array has at least 2 empty options for MCQ
  useEffect(() => {
    if (data.type === 'mcq' && (!data.options || data.options.length < 2)) {
      setData('options', ['', '']);
    }
  }, [data.type]);

  // handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // validate MCQ options
    if (data.type === 'mcq') {
      const errors = {};
      let hasErrors = false;
      
      data.options.forEach((option, index) => {
        if (!option || option.trim() === '') {
          errors[index] = 'This option is required';
          hasErrors = true;
        }
      });
      
      setOptionErrors(errors);
      if (hasErrors) return;
    }

    // clean up data before submission
    const submitData = { ...data };
    
    // remove options if not MCQ
    if (data.type !== 'mcq') {
      delete submitData.options;
    }
    
    // convert empty strings to null for optional fields
    if (!submitData.description?.trim()) submitData.description = null;
    if (!submitData.explanation?.trim()) submitData.explanation = null;
    if (!submitData.correct_answer?.trim()) submitData.correct_answer = null;
    if (!submitData.time_limit) submitData.time_limit = null;
    if (!submitData.order) submitData.order = null;

    const updateUrl = safeRoute('admin.lessons.tests.update', [lesson?.lesson_id, test?.test_id]) || 
                     `/admin/lessons/${lesson?.lesson_id}/tests/${test?.test_id}`;

    put(updateUrl, {
      onSuccess: () => {
        // Success redirect handled by controller
      },
      onError: (errors) => {
        console.error('Update failed:', errors);
      }
    });
  };

  const addOption = () => {
    setData('options', [...data.options, '']);
  };

  const removeOption = (index) => {
    if (data.options.length > 2) {
      const newOptions = data.options.filter((_, i) => i !== index);
      setData('options', newOptions);
      
      // clear error for removed option
      const newErrors = { ...optionErrors };
      delete newErrors[index];
      setOptionErrors(newErrors);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...data.options];
    newOptions[index] = value;
    setData('options', newOptions);
    
    // clear error when user starts typing
    if (optionErrors[index]) {
      const newErrors = { ...optionErrors };
      delete newErrors[index];
      setOptionErrors(newErrors);
    }
  };

  const getFieldError = (field) => {
    return formErrors[field] || errors[field];
  };

  return (
    <AuthenticatedLayout user={auth?.user} header={<h2>Edit Test - {test?.title || 'Untitled'}</h2>}>
      <Head title={`Edit Test: ${test?.title || 'Untitled'} - ${lesson?.title || ''}`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Link 
                href={safeRoute('admin.lessons.tests.show', [lesson?.lesson_id, test?.test_id]) || 
                      `/admin/lessons/${lesson?.lesson_id}/tests/${test?.test_id}`}
                className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back to Test Details
              </Link>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Test</h1>
                <p className="text-gray-600">
                  Lesson: <span className="font-medium">{lesson?.title || '—'}</span>
                </p>
              </div>
            </div>
          </div>

          {flash?.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {flash.success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      getFieldError('title') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter test title"
                  />
                  {getFieldError('title') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter test description (optional)"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      getFieldError('type') ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {Object.entries(typeOptions).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                  {getFieldError('type') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('type')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(statusOptions).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty_level"
                    value={data.difficulty_level}
                    onChange={(e) => setData('difficulty_level', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(difficultyOptions).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    min="0"
                    value={data.order}
                    onChange={(e) => setData('order', e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Auto-assigned if empty"
                  />
                </div>
              </div>
            </div>

            {/* MCQ Options */}
            {data.type === 'mcq' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Answer Options</h3>
                  <button
                    type="button"
                    onClick={addOption}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md flex items-center text-sm"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Option
                  </button>
                </div>

                <div className="space-y-4">
                  {data.options.map((option, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 text-sm font-medium rounded-full mt-1">
                        {String.fromCharCode(65 + index)}
                      </span>
                      
                      <div className="flex-1">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            optionErrors[index] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                        {optionErrors[index] && (
                          <p className="mt-1 text-sm text-red-600">{optionErrors[index]}</p>
                        )}
                      </div>

                      {data.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {getFieldError('options') && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <p className="text-sm text-red-600">{getFieldError('options')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Answer & Explanation */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Answer & Explanation</h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="correct_answer" className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <textarea
                    id="correct_answer"
                    rows={2}
                    value={data.correct_answer}
                    onChange={(e) => setData('correct_answer', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the correct answer"
                  />
                </div>

                <div>
                  <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation
                  </label>
                  <textarea
                    id="explanation"
                    rows={4}
                    value={data.explanation}
                    onChange={(e) => setData('explanation', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain why this is the correct answer (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Scoring & Timing */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Scoring & Timing</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="max_score" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Score (points)
                  </label>
                  <input
                    type="number"
                    id="max_score"
                    min="1"
                    max="1000"
                    value={data.max_score}
                    onChange={(e) => setData('max_score', parseInt(e.target.value) || 10)}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      getFieldError('max_score') ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('max_score') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('max_score')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="time_limit" className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    id="time_limit"
                    min="1"
                    max="999"
                    value={data.time_limit}
                    onChange={(e) => setData('time_limit', e.target.value ? parseInt(e.target.value) : '')}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      getFieldError('time_limit') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="No time limit"
                  />
                  {getFieldError('time_limit') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('time_limit')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link
                href={safeRoute('admin.lessons.tests.show', [lesson?.lesson_id, test?.test_id]) || 
                      `/admin/lessons/${lesson?.lesson_id}/tests/${test?.test_id}`}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={processing}
                className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md ${
                  processing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {processing ? 'Updating...' : 'Update Test'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}