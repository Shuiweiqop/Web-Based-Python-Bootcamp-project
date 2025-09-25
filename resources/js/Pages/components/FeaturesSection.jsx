import React from 'react';
import { 
  Code, 
  BookOpen, 
  Bot, 
  Trophy, 
  TrendingUp, 
  Route, 
  Puzzle, 
  Users,
  Zap
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Interactive Python Tests",
      description: "Master Python fundamentals with hands-on coding quizzes, multiple-choice questions, and real-time code execution.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Beginner-Friendly Lessons",
      description: "Step-by-step Python tutorials with embedded code editors, visual examples, and practical projects.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Python AI Tutor",
      description: "Get instant help with Python syntax, debugging assistance, and personalized coding suggestions.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Achievement System",
      description: "Unlock Python badges, earn XP for completed challenges, and celebrate your coding milestones.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Learning Analytics",
      description: "Track your Python proficiency with detailed progress reports and skill assessments.",
      color: "from-red-500 to-rose-500"
    },
    {
      icon: <Route className="w-8 h-8" />,
      title: "Adaptive Bootcamp Path",
      description: "Personalized learning sequence from Python basics to web development and data analysis.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: <Puzzle className="w-8 h-8" />,
      title: "Hands-On Projects",
      description: "Build real Python applications - games, calculators, web scrapers, and data visualizations.",
      color: "from-teal-500 to-green-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Python Community",
      description: "Connect with fellow Python beginners, share projects, and get support from experienced developers.",
      color: "from-violet-500 to-purple-500"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-purple-500/10 to-green-500/10 border border-purple-500/20 rounded-full px-6 py-3 mb-6">
            <Zap className="w-5 h-5 text-purple-400 mr-3" />
            <span className="text-purple-400 text-sm font-medium">Beginner-Focused Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose Our Python Bootcamp?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We've designed every feature with beginners in mind - from AI tutoring to hands-on projects, 
            you'll have everything needed to succeed in your Python journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full hover:from-white/10 hover:to-white/15 transition-all duration-300 hover:scale-105 hover:border-white/20">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-green-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}