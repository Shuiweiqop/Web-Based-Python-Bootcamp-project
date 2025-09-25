import React from 'react';
import { Target, Brain, FileText, Code, Globe, CheckCircle } from 'lucide-react';

export default function CurriculumSection() {
  const bootcampPhases = [
    {
      phase: "Week 1-2",
      title: "Python Fundamentals",
      topics: ["Variables & Data Types", "Control Structures", "Functions", "Basic I/O"],
      icon: <Brain className="w-6 h-6" />
    },
    {
      phase: "Week 3-4", 
      title: "Data Structures",
      topics: ["Lists & Tuples", "Dictionaries", "Sets", "File Handling"],
      icon: <FileText className="w-6 h-6" />
    },
    {
      phase: "Week 5-6",
      title: "Object-Oriented Python",
      topics: ["Classes & Objects", "Inheritance", "Modules & Packages", "Error Handling"],
      icon: <Code className="w-6 h-6" />
    },
    {
      phase: "Week 7-8",
      title: "Real-World Projects",
      topics: ["Web Development", "Data Analysis", "APIs", "Final Project"],
      icon: <Globe className="w-6 h-6" />
    }
  ];

  return (
    <section id="curriculum" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-full px-6 py-3 mb-6">
            <Target className="w-5 h-5 text-blue-400 mr-3" />
            <span className="text-blue-400 text-sm font-medium">8-Week Curriculum</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Your Python Learning Path
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Structured progression from Python basics to building real-world applications. 
            Each week builds upon the previous, ensuring solid understanding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bootcampPhases.map((phase, index) => (
            <div key={index} className="group relative">
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full hover:from-white/10 hover:to-white/15 transition-all duration-300 hover:scale-105 hover:border-green-400/30">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <div className="text-white">
                      {phase.icon}
                    </div>
                  </div>
                  <div>
                    <div className="text-green-400 font-semibold text-sm">{phase.phase}</div>
                    <div className="text-white font-bold text-lg group-hover:text-green-300 transition-colors">{phase.title}</div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {phase.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="flex items-center text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-sm group-hover:text-gray-200 transition-colors">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Connection line */}
              {index < bootcampPhases.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-6 h-0.5 bg-gradient-to-r from-green-400 to-blue-400 opacity-50"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}