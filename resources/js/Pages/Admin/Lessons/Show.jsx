// resources/js/Pages/Admin/Lessons/Show.jsx
import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  ChevronLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ClockIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export default function Show(props) {
  // Props from Inertia
  const { auth = null } = props || {};
  // lesson may be passed as model or plain object
  const lesson = props.lesson ?? null;
  const exercises = Array.isArray(props.exercises) ? props.exercises : (props.exercises?.data ?? []);
  const tests = Array.isArray(props.tests) ? props.tests : (props.tests?.data ?? []);

  // from usePage to show flash messages if any
  const { props: pageProps } = usePage();
  const flash = pageProps?.flash ?? {};

  // resolve id (lesson_id or id)
  const lessonId = lesson?.lesson_id ?? lesson?.id ?? null;

  // safe route resolver (fallback to manual URL when route() throws)
  const safeRoute = (name, params) => {
    try {
      return route(name, params);
    } catch (err) {
      // fallback patterns used in your routes
      if (name === 'admin.lessons.edit') return `/admin/lessons/${params}`;
      if (name === 'admin.lessons.show') return `/admin/lessons/${params}`;
      if (name === 'admin.lessons.tests.create') return `/admin/lessons/${params}/tests/create`;
      if (name === 'admin.lessons.tests.show' && Array.isArray(params)) return `/admin/lessons/${params[0]}/tests/${params[1]}`;
      if (name === 'admin.lessons.exercises.create') return `/admin/lessons/${params}/exercises/create`;
      if (name === 'admin.lessons.exercises.show' && Array.isArray(params)) return `/admin/lessons/${params[0]}/exercises/${params[1]}`;
      if (name === 'admin.lessons.destroy') return `/admin/lessons/${params}`;
      return null;
    }
  };

  const handleDelete = async () => {
    if (!lessonId) {
      alert('Lesson id missing — cannot delete.');
      return;
    }

    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    // try named route first, fallback to manual url
    const url = safeRoute('admin.lessons.destroy', lessonId) || `/admin/lessons/${lessonId}`;

    // Use router.delete with callbacks: controller returns 303 -> GET show or index
    router.delete(url, {
      onStart: () => console.debug('Deleting lesson', lessonId),
      onSuccess: () => {
        console.debug('Delete success');
        router.reload({ preserveScroll: true });
      },
      onError: (errors) => {
        console.error('Delete failed', errors);
        alert('Failed to delete lesson. Check console for details.');
      },
    });
  };

  const getStatusBadge = (status) => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800',
    };

    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      draft: 'Draft',
      archived: 'Archived',
    };

    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${classes[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] ?? status ?? '—'}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const classes = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-orange-100 text-orange-800',
      advanced: 'bg-red-100 text-red-800',
      easy: 'bg-blue-100 text-blue-800',
      medium: 'bg-orange-100 text-orange-800',
      hard: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${classes[difficulty] || 'bg-gray-100 text-gray-800'}`}>
        {difficulty ?? 'Unknown'}
      </span>
    );
  };

  // If lesson missing, show friendly message
  if (!lesson) {
    return (
      <AuthenticatedLayout user={auth?.user} header={<h2 className="font-semibold text-xl">Lesson</h2>}>
        <Head title="Lesson not found" />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">Lesson data not found. It may have been deleted or failed to load.</div>
          <div className="mt-4">
            <Link href={safeRoute('admin.lessons.index') || '/admin/lessons'} className="px-4 py-2 border rounded">Back to Lessons</Link>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout user={auth?.user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{lesson?.title ?? 'Lesson Details'}</h2>}>
      <Head title={lesson?.title ?? 'Lesson Details'} />

      <div className="py-12">
        <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
          {/* flash */}
          {flash?.success && (
            <div className="mb-4 rounded bg-green-100 border border-green-300 text-green-800 px-4 py-2">
              {flash.success}
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Link href={safeRoute('admin.lessons.index') || '/admin/lessons'} className="flex items-center text-gray-500 hover:text-gray-700 mr-4">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back to Lessons
              </Link>
            </div>

            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson?.title ?? 'Untitled Lesson'}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {getStatusBadge(lesson?.status)}
                  {getDifficultyBadge(lesson?.difficulty)}
                  {lesson?.estimated_duration && (
                    <span className="inline-flex px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {lesson.estimated_duration} min
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 ml-4">


                <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center">
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {lesson?.description && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{lesson.description}</p>
                </div>
              )}

              {/* Video (if any) */}
              {lesson?.video_url && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-3">
                    <PlayIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Video</h3>
                  </div>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={lesson.video_url}
                      className="w-full h-64 rounded-md"
                      allowFullScreen
                      title="Lesson Video"
                    />
                  </div>
                </div>
              )}

              {/* Tests */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tests ({tests?.length || 0})</h3>
                  <Link href={safeRoute('admin.lessons.tests.create', lessonId) || `/admin/lessons/${lessonId}/tests/create`} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Test
                  </Link>
                </div>

                {tests && tests.length > 0 ? (
                  <div className="space-y-3">
                    {tests.map((test) => (
                      <div key={test.test_id ?? test.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{test.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {test.type} • {test.max_score} pts {test.time_limit && `• ${test.time_limit} min`}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(test.status)}
                            <Link href={safeRoute('admin.lessons.tests.show', [lessonId, test.test_id]) || `/admin/lessons/${lessonId}/tests/${test.test_id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AcademicCapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tests created yet.</p>
                    <Link href={safeRoute('admin.lessons.tests.create', lessonId) || `/admin/lessons/${lessonId}/tests/create`} className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">Create your first test</Link>
                  </div>
                )}
              </div>

                  {/* Exercises */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Exercises ({exercises?.length || 0})</h3>
                          <Link href={safeRoute('admin.lessons.exercises.create', lessonId) || `/admin/lessons/${lessonId}/exercises/create`} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm flex items-center">
                            <PlusIcon className="w-4 h-4 mr-1" />
                            Add Exercise
                          </Link>
                        </div>

                {exercises && exercises.length > 0 ? (
                  <div className="space-y-3">
                    {exercises.map((exercise) => (
                      <div key={exercise.exercise_id ?? exercise.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{exercise.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{exercise.exercise_type ?? exercise.type} • {exercise.points ?? exercise.max_score ?? 0} pts</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(exercise.status)}
                            <Link href={safeRoute('admin.lessons.exercises.show', [lessonId, exercise.exercise_id]) || `/admin/lessons/${lessonId}/exercises/${exercise.exercise_id}`} className="text-blue-600 hover:text-blue-800 text-sm">
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No exercises created yet.</p>
                    <Link href={safeRoute('admin.lessons.exercises.create', lessonId) || `/admin/lessons/${lessonId}/exercises/create`} className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">Create your first exercise</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="text-sm font-medium text-gray-900">{lesson?.estimated_duration ?? 0} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reward Points:</span>
                    <span className="text-sm font-medium text-gray-900">{lesson?.completion_reward_points ?? 0} pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm font-medium text-gray-900">{lesson?.created_at ? new Date(lesson.created_at).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Updated:</span>
                    <span className="text-sm font-medium text-gray-900">{lesson?.updated_at ? new Date(lesson.updated_at).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href={safeRoute('admin.lessons.edit', lessonId) || `/admin/lessons/${lessonId}/edit`} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-center block">Edit Lesson</Link>
                  <Link href={safeRoute('admin.lessons.tests.index', lessonId) || `/admin/lessons/${lessonId}/tests`} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-center block">Manage Tests</Link>
                  <Link href={safeRoute('admin.lessons.exercises.index', lessonId) || `/admin/lessons/${lessonId}/exercises`} className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-center block">Manage Exercises</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
