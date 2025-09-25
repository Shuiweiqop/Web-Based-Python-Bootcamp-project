import React from 'react';
import { useForm, Link } from '@inertiajs/react';

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    difficulty: 'beginner',
    estimated_duration: '',
    video_url: '',
    status: 'active',
    completion_reward_points: 0,
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.lessons.store'));

  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Lesson</h1>
        <p className="text-gray-600 mt-1">Add a new lesson to the system. You can add exercises and tests after creating the lesson.</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Lesson Title *
              </label>
              <input
                id="title"
                type="text"
                className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                value={data.title}
                onChange={e => setData('title', e.target.value)}
                placeholder="Enter lesson title"
                required
                maxLength={255}
              />
              {errors.title && (
                <div className="text-red-600 text-sm mt-1">{errors.title}</div>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                value={data.description}
                onChange={e => setData('description', e.target.value)}
                placeholder="Enter lesson description, learning objectives, and what students will accomplish"
              />
              {errors.description && (
                <div className="text-red-600 text-sm mt-1">{errors.description}</div>
              )}
            </div>
          </div>
        </div>

        {/* Lesson Configuration Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lesson Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level *
              </label>
              <select
                id="difficulty"
                className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.difficulty ? 'border-red-500' : 'border-gray-300'
                }`}
                value={data.difficulty}
                onChange={e => setData('difficulty', e.target.value)}
                required
              >
                <option value="beginner">🟢 Beginner</option>
                <option value="intermediate">🟡 Intermediate</option>
                <option value="advanced">🔴 Advanced</option>
              </select>
              {errors.difficulty && (
                <div className="text-red-600 text-sm mt-1">{errors.difficulty}</div>
              )}
            </div>

            <div>
              <label htmlFor="estimated_duration" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration (minutes)
              </label>
              <input
                id="estimated_duration"
                type="number"
                min="1"
                max="1440"
                className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.estimated_duration ? 'border-red-500' : 'border-gray-300'
                }`}
                value={data.estimated_duration}
                onChange={e => setData('estimated_duration', e.target.value)}
                placeholder="30"
              />
              {errors.estimated_duration && (
                <div className="text-red-600 text-sm mt-1">{errors.estimated_duration}</div>
              )}
              <p className="text-xs text-gray-500 mt-1">How long should this lesson take to complete?</p>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                id="status"
                className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
                value={data.status}
                onChange={e => setData('status', e.target.value)}
                required
              >
                <option value="draft">📝 Draft</option>
                <option value="active">✅ Active</option>
                <option value="inactive">❌ Inactive</option>
              </select>
              {errors.status && (
                <div className="text-red-600 text-sm mt-1">{errors.status}</div>
              )}
              <p className="text-xs text-gray-500 mt-1">Draft lessons are not visible to students</p>
            </div>
          </div>
        </div>

        {/* Media and Rewards Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Media and Rewards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
                Video URL
              </label>
              <input
                id="video_url"
                type="url"
                className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.video_url ? 'border-red-500' : 'border-gray-300'
                }`}
                value={data.video_url}
                onChange={e => setData('video_url', e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
              {errors.video_url && (
                <div className="text-red-600 text-sm mt-1">{errors.video_url}</div>
              )}
              <p className="text-xs text-gray-500 mt-1">Optional: Link to instructional video</p>
            </div>

            <div>
              <label htmlFor="completion_reward_points" className="block text-sm font-medium text-gray-700 mb-1">
                Completion Reward Points
              </label>
              <input
                id="completion_reward_points"
                type="number"
                min="0"
                max="10000"
                className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.completion_reward_points ? 'border-red-500' : 'border-gray-300'
                }`}
                value={data.completion_reward_points}
                onChange={e => setData('completion_reward_points', e.target.value)}
                placeholder="0"
              />
              {errors.completion_reward_points && (
                <div className="text-red-600 text-sm mt-1">{errors.completion_reward_points}</div>
              )}
              <p className="text-xs text-gray-500 mt-1">Points students earn for completing this lesson</p>
            </div>
          </div>
        </div>

        {/* Next Steps Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">What's Next?</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>After creating this lesson, you'll be able to:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Add exercises to help students practice</li>
                  <li>Create tests to assess understanding</li>
                  <li>Organize content and set prerequisites</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Link
            href={route('admin.lessons.index')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            ← Back to Lessons
          </Link>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={processing}
              onClick={() => setData('status', 'draft')}
              className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                processing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={processing}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                processing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {processing ? 'Creating...' : 'Create Lesson'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}