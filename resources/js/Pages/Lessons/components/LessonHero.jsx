import React from 'react';

const LessonHero = ({ totalLessons, availableLessons }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-black mb-4">
            Learn <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">Anything</span>
          </h1>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover engaging, interactive lessons designed to help you learn and grow at your own pace.
          </p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-black">{totalLessons}</div>
              <div className="text-xs text-blue-200 uppercase tracking-wider">Total Lessons</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-black">{availableLessons}</div>
              <div className="text-xs text-blue-200 uppercase tracking-wider">Available Now</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonHero;