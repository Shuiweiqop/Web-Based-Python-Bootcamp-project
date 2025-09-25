import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function Index() {
  const { props } = usePage();
  const { lessons, filters, auth } = usePage().props;
  const [searchQuery, setSearchQuery] = useState(filters?.q || '');

  const meta = lessons?.meta || {};
  const data = lessons?.data || [];

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(
      route('admin.lessons.index'),
      searchQuery ? { q: searchQuery } : {},
      { preserveState: true, replace: true }
    );
  };

  const handleDelete = (lessonId, lessonTitle) => {
    if (!lessonId) {
      alert('Internal error: missing lesson id for "' + (lessonTitle || '') + '"');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${lessonTitle}"? This action cannot be undone.`)) {
      return;
    }

    // Resolve route via Ziggy first, fallback to manual URL
    let deleteUrl;
    try {
      deleteUrl = route('admin.lessons.destroy', { lesson: lessonId });
    } catch (error) {
      console.warn('Ziggy route() failed, falling back to manual URL:', error);
      deleteUrl = `/admin/lessons/${lessonId}`;
    }

    console.log('Deleting — resolved URL:', deleteUrl, 'lessonId:', lessonId);

    router.delete(deleteUrl, {
      onStart: () => console.log('Delete request started for', lessonId),
      onSuccess: () => {
        router.reload({ preserveScroll: true });
      },
      onError: (errs) => {
        console.error('Delete failed', errs);
        alert('Failed to delete lesson. See console/network for details.');
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <Link
          href={route('admin.lessons.create')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Lesson
        </Link>
      </div>

      {/* Search Form */}
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title..."
            className="border border-gray-300 px-3 py-2 rounded-l-md flex-1"
          />
          <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-r-md hover:bg-gray-700">
            Search
          </button>
          {filters?.q && (
            <Link
              href={route('admin.lessons.index')}
              className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {data.length === 0 && (
          <div className="text-gray-600 text-center py-8">
            {filters?.q ? `No lessons found matching "${filters.q}"` : 'No lessons found.'}
          </div>
        )}

        {data.map((lesson) => (
          <div key={lesson.lesson_id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
            <div className="flex-1">
              <h2 className="font-semibold text-lg text-gray-900">{lesson.title}</h2>
              <div className="text-sm text-gray-500 mt-1">
                <span className="inline-flex items-center">
                  Difficulty:{' '}
                  <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${
                    lesson.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    lesson.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{lesson.difficulty}</span>
                </span>
                <span className="mx-2">•</span>
                Status: <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  lesson.status === 'active' ? 'bg-green-100 text-green-800' :
                  lesson.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>{lesson.status}</span>
                {lesson.creator?.name && (
                  <>
                    <span className="mx-2">•</span>
                    Created by: {lesson.creator.name}
                  </>
                )}
              </div>
              {lesson.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{lesson.description}</p>
              )}
            </div>

            <div className="flex space-x-2 ml-4">
              <Link
                href={route('admin.lessons.show', { lesson: lesson.lesson_id })}
                className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                View
              </Link>

              <Link
                href={route('admin.lessons.edit', { lesson: lesson.lesson_id })}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Edit
              </Link>

              <button
                onClick={() => handleDelete(lesson.lesson_id, lesson.title)}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {meta.total > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            {meta.current_page > 1 && (
              <Link
                href={route('admin.lessons.index', {
                  page: meta.current_page - 1,
                  ...(filters?.q && { q: filters.q })
                })}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Previous
              </Link>
            )}

            <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded">
              Page {meta.current_page} of {meta.last_page}
            </span>

            {meta.current_page < meta.last_page && (
              <Link
                href={route('admin.lessons.index', {
                  page: meta.current_page + 1,
                  ...(filters?.q && { q: filters.q })
                })}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>

          <div className="ml-4 text-sm text-gray-600 flex items-center">
            Showing {meta.from || 0} to {meta.to || 0} of {meta.total} results
          </div>
        </div>
      )}
    </div>
  );
}
