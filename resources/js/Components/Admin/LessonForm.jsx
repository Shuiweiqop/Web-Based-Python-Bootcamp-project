// resources/js/Components/Admin/LessonForm.jsx
import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { 
  DocumentTextIcon, 
  CodeBracketIcon, 
  DocumentIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

export default function LessonForm({ lesson = null, submitUrl, method = 'post' }) {
  const { data, setData, post, put, processing, errors } = useForm({
    title: lesson?.title || '',
    content: lesson?.content || '',
    content_type: lesson?.content_type || 'markdown',
    video_url: lesson?.video_url || '',
    difficulty: lesson?.difficulty || 'beginner',
    estimated_duration: lesson?.estimated_duration || 30,
    completion_reward_points: lesson?.completion_reward_points || 100,
    status: lesson?.status || 'draft',
    // ... other fields
  });

  const [showContentTypeInfo, setShowContentTypeInfo] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (method === 'put') {
      put(submitUrl);
    } else {
      post(submitUrl);
    }
  };

  const contentTypes = [
    {
      value: 'text',
      label: 'Plain Text',
      icon: DocumentIcon,
      description: 'Simple text without formatting (safest)',
      example: 'Welcome to Python Basics\n\nThis lesson covers...',
      color: 'gray',
    },
    {
      value: 'markdown',
      label: 'Markdown',
      icon: DocumentTextIcon,
      description: 'Rich text with formatting support (recommended)',
      example: '# Welcome\n\nLearn **Python** with:\n- Variables\n- Functions',
      color: 'blue',
    },
    {
      value: 'html',
      label: 'HTML',
      icon: CodeBracketIcon,
      description: 'Custom HTML (advanced, sanitized for security)',
      example: '<h1>Welcome</h1>\n<p>Learn <strong>Python</strong></p>',
      color: 'purple',
    },
  ];

  const selectedType = contentTypes.find(t => t.value === data.content_type);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lesson Title *
        </label>
        <input
          type="text"
          value={data.title}
          onChange={e => setData('title', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Introduction to Python Variables"
          required
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Content Type Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Content Type *
          </label>
          <button
            type="button"
            onClick={() => setShowContentTypeInfo(!showContentTypeInfo)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <InformationCircleIcon className="w-4 h-4 mr-1" />
            {showContentTypeInfo ? 'Hide' : 'Show'} Info
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = data.content_type === type.value;
            
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setData('content_type', type.value)}
                className={`
                  relative p-4 border-2 rounded-lg text-left transition-all
                  ${isSelected 
                    ? `border-${type.color}-500 bg-${type.color}-50 ring-2 ring-${type.color}-200` 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-${type.color}-500 flex items-center justify-center`}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                <Icon className={`w-6 h-6 mb-2 ${isSelected ? `text-${type.color}-600` : 'text-gray-400'}`} />
                <h4 className={`font-medium mb-1 ${isSelected ? `text-${type.color}-900` : 'text-gray-900'}`}>
                  {type.label}
                </h4>
                <p className="text-xs text-gray-600">
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Content Type Information Panel */}
        {showContentTypeInfo && selectedType && (
          <div className={`mt-3 p-4 bg-${selectedType.color}-50 border border-${selectedType.color}-200 rounded-lg`}>
            <h5 className={`font-medium text-${selectedType.color}-900 mb-2`}>
              {selectedType.label} Example:
            </h5>
            <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
              <code>{selectedType.example}</code>
            </pre>
            
            {selectedType.value === 'markdown' && (
              <div className="mt-3 text-xs text-gray-600">
                <p className="font-medium mb-1">Markdown Syntax Guide:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li><code className="bg-white px-1 rounded"># Heading</code> → Heading</li>
                  <li><code className="bg-white px-1 rounded">**bold**</code> → <strong>bold</strong></li>
                  <li><code className="bg-white px-1 rounded">*italic*</code> → <em>italic</em></li>
                  <li><code className="bg-white px-1 rounded">[link](url)</code> → Hyperlink</li>
                  <li><code className="bg-white px-1 rounded">- item</code> → Bullet list</li>
                  <li><code className="bg-white px-1 rounded">`code`</code> → Inline code</li>
                </ul>
              </div>
            )}
            
            {selectedType.value === 'html' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <p className="font-medium text-yellow-900 mb-1">⚠️ Security Notice:</p>
                <p className="text-yellow-800">
                  HTML content is automatically sanitized. Dangerous tags like <code>&lt;script&gt;</code>, 
                  <code>&lt;iframe&gt;</code>, and event handlers will be removed for security.
                </p>
              </div>
            )}
          </div>
        )}

        {errors.content_type && (
          <p className="mt-1 text-sm text-red-600">{errors.content_type}</p>
        )}
      </div>

      {/* Content Textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lesson Content *
        </label>
        <textarea
          value={data.content}
          onChange={e => setData('content', e.target.value)}
          rows={15}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder={selectedType?.example || 'Enter lesson content...'}
          required
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500">
            Type: <span className="font-medium">{selectedType?.label}</span>
            {data.content_type === 'markdown' && ' • Supports formatting'}
            {data.content_type === 'html' && ' • Will be sanitized'}
          </p>
          <p className="text-xs text-gray-500">
            {data.content.length} characters
          </p>
        </div>
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
      </div>

      {/* Video URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video URL (Optional)
        </label>
        <input
          type="url"
          value={data.video_url}
          onChange={e => setData('video_url', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://youtube.com/embed/..."
        />
        {errors.video_url && (
          <p className="mt-1 text-sm text-red-600">{errors.video_url}</p>
        )}
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty Level
        </label>
        <select
          value={data.difficulty}
          onChange={e => setData('difficulty', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="beginner">🟢 Beginner</option>
          <option value="intermediate">🟡 Intermediate</option>
          <option value="advanced">🔴 Advanced</option>
        </select>
        {errors.difficulty && (
          <p className="mt-1 text-sm text-red-600">{errors.difficulty}</p>
        )}
      </div>

      {/* Duration and Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Duration (minutes)
          </label>
          <input
            type="number"
            value={data.estimated_duration}
            onChange={e => setData('estimated_duration', e.target.value)}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.estimated_duration && (
            <p className="mt-1 text-sm text-red-600">{errors.estimated_duration}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Completion Reward Points
          </label>
          <input
            type="number"
            value={data.completion_reward_points}
            onChange={e => setData('completion_reward_points', e.target.value)}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.completion_reward_points && (
            <p className="mt-1 text-sm text-red-600">{errors.completion_reward_points}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={data.status}
          onChange={e => setData('status', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="draft">📝 Draft</option>
          <option value="active">✅ Active</option>
          <option value="inactive">❌ Inactive</option>
          <option value="archived">🗄️ Archived</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status}</p>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={processing}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Saving...' : lesson ? 'Update Lesson' : 'Create Lesson'}
        </button>
      </div>
    </form>
  );
}