import React from 'react';

const LessonsCTA = () => {
  return (
    <div className="mt-20 mb-8">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white shadow-lg border border-blue-400/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-3">
            Ready to Start Learning?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of students already growing with our interactive lessons
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-xs text-blue-200 font-semibold uppercase tracking-wide">High Quality</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-xs text-blue-200 font-semibold uppercase tracking-wide">Goal Oriented</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-xs text-blue-200 font-semibold uppercase tracking-wide">Rewarding</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonsCTA;