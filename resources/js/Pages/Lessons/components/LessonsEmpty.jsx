import React from 'react';

const LessonsEmpty = ({ hasFilters, onClearFilters }) => {
  return (
    <div className="py-20">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center max-w-md mx-auto">
        <div className="text-5xl mb-4">🎓</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No lessons found</h3>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          {hasFilters
            ? "Try adjusting your search or filter criteria to find what you're looking for."
            : "No lessons are currently available. Check back soon for new content!"}
        </p>
        
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonsEmpty;