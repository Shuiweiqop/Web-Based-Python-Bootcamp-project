import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Sparkles } from 'lucide-react';

/**
 * Top Navigation Bar Component
 * Responsibility: Back button + Page title + Optional "Choose Template" button
 */
export default function HeaderBar({ 
  title = 'Create New Reward',
  backUrl = '/admin/rewards', 
  showTemplateButton = true,
  onOpenTemplate 
}) {
  return (
    <div className="flex items-center gap-4">
      <Link
        href={backUrl}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      
      {showTemplateButton && onOpenTemplate && (
        <button
          type="button"
          onClick={onOpenTemplate}
          className="ml-auto inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Sparkles className="h-5 w-5" />
          Choose Template
        </button>
      )}
    </div>
  );
}
