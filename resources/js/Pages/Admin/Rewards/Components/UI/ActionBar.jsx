import React from 'react';
import { Link } from '@inertiajs/react';
import { Save } from 'lucide-react';

/**
 * Bottom Action Bar Component
 * Responsibility: Submit button + Cancel button
 */
export default function ActionBar({ isSubmitting, cancelUrl = '/admin/rewards' }) {
  return (
    <div className="flex gap-4 mt-8">
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Save className="h-5 w-5" />
        {isSubmitting ? 'Saving...' : 'Create Reward'}
      </button>

      <Link
        href={cancelUrl}
        className="py-4 px-8 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
      >
        Cancel
      </Link>
    </div>
  );
}
