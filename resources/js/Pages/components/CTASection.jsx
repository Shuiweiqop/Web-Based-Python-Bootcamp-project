import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600/10 to-blue-600/10 border-y border-white/10">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-6xl mb-6">🐍</div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Become a Python Developer?
        </h2>
        <p className="text-xl text-gray-300 mb-10 leading-relaxed">
          Join our next Python bootcamp cohort and transform from complete beginner to confident programmer in just 8 weeks. 
          With AI guidance, hands-on projects, and community support, your Python journey starts here.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-12 py-5 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center group shadow-2xl">
            🚀 Enroll in Bootcamp
            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="border-2 border-green-400/50 text-white px-12 py-5 rounded-xl font-semibold text-lg hover:bg-green-400/10 hover:border-green-400 transition-all">
            View Sample Lessons
          </button>
        </div>
        <div className="text-sm text-gray-400">
          💡 <span className="text-green-400 font-semibold">Next Cohort Starts Soon</span> • 
          <span className="text-blue-400 font-semibold"> Early Bird Discount Available</span>
        </div>
      </div>
    </section>
  );
}