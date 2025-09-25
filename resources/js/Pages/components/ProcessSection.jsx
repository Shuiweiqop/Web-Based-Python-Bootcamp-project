import React from 'react';
import { Award } from 'lucide-react';

export default function ProcessSection() {
  const processSteps = [
    {
      step: "START",
      title: "Assessment & Setup",
      description: "Take a quick skill assessment, get your personalized learning path, and set up your Python environment in the browser.",
      icon: "🎯"
    },
    {
      step: "LEARN", 
      title: "Code Every Day",
      description: "Follow structured lessons, complete hands-on exercises, build projects, and get instant feedback from our AI tutor.",
      icon: "💻"
    },
    {
      step: "SUCCEED",
      title: "Build & Deploy",
      description: "Create a portfolio of Python projects, connect with the community, and graduate with job-ready skills.",
      icon: "🏆"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-full px-6 py-3 mb-6">
            <Award className="w-5 h-5 text-orange-400 mr-3" />
            <span className="text-orange-400 text-sm font-medium">Bootcamp Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Your Learning Journey
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {processSteps.map((item, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex flex-col items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-2xl">
                  <div className="text-3xl mb-1">{item.icon}</div>
                  <span className="text-xs font-bold text-white">{item.step}</span>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-green-500/50 to-blue-500/50"></div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}