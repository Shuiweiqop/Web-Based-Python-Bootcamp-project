import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Search, Bell, Settings, User, Clock, Mail, ArrowRight, 
  Play, Code, BookOpen, Bot, Trophy, TrendingUp, Zap, CheckCircle,
  Sparkles, Rocket, Award, ChevronRight, Star
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import Navigation from './components/Navigation';
import CurriculumSection from './components/CurriculumSection';

// Hero Section with Typing Animation
function HeroSection({ auth }) {
  const [email, setEmail] = useState('');
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Master Python';
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  const stats = [
    { number: "10K+", label: "Active Students", icon: "👥" },
    { number: "95%", label: "Success Rate", icon: "🎯" },
    { number: "8 Weeks", label: "To Mastery", icon: "⚡" },
    { number: "24/7", label: "AI Support", icon: "🤖" }
  ];

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full px-6 py-3 mb-8 shadow-lg">
          <Sparkles className="w-5 h-5 text-purple-600 mr-3" />
          <span className="text-purple-600 text-sm font-semibold">AI-Powered Bootcamp</span>
          <div className="w-2 h-2 bg-purple-500 rounded-full mx-3 animate-pulse"></div>
          <span className="text-blue-600 text-sm font-semibold">100% Online</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {displayText}
          </span>
          <span className="animate-pulse">|</span>
          <br />
          <span className="text-gray-800">from Zero to Hero</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
          Transform your career with our comprehensive Python bootcamp. Learn coding fundamentals, 
          build real projects, and launch your tech career with cutting-edge AI guidance.
        </p>

        {/* Email signup for non-authenticated users */}
        {!auth?.user && (
          <div className="max-w-md mx-auto mb-10">
            <div className="bg-white rounded-2xl p-2 flex shadow-xl border border-gray-200">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none w-full"
                />
              </div>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-2">Join 10,000+ students learning Python</p>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          {auth?.user ? (
            <>
              <Link
                href="/lessons"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center group"
              >
                <Rocket className="mr-3 w-6 h-6" />
                Browse Lessons
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="bg-white border-2 border-purple-300 text-purple-600 px-10 py-5 rounded-2xl font-semibold text-lg hover:bg-purple-50 transition-all flex items-center justify-center group shadow-lg"
              >
                <Trophy className="mr-3 w-5 h-5" />
                My Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center group"
              >
                <Rocket className="mr-3 w-6 h-6" />
                Start Your Journey
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/lessons"
                className="bg-white border-2 border-purple-300 text-purple-600 px-10 py-5 rounded-2xl font-semibold text-lg hover:bg-purple-50 transition-all flex items-center justify-center group shadow-lg"
              >
                <Play className="mr-3 w-5 h-5" />
                Preview Lessons
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all group hover:scale-105">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section with Cards
function FeaturesSection() {
  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Interactive Coding",
      description: "Practice Python with real-time code execution and instant feedback",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Tutor",
      description: "Get personalized help and debugging assistance 24/7",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Achievements",
      description: "Earn badges and track your progress through gamification",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Analytics",
      description: "Monitor your learning journey with detailed insights",
      color: "from-green-500 to-teal-500"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white border border-blue-200 rounded-full px-6 py-3 mb-6 shadow-lg">
            <Zap className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-blue-600 text-sm font-semibold">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Succeed</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-3xl p-8 h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-gray-200 hover:border-purple-300">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
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

// Process Section
function ProcessSection() {
  const steps = [
    {
      step: "01",
      title: "Start Learning",
      description: "Browse lessons and register for courses that match your level",
      icon: "🎯",
      color: "from-blue-500 to-cyan-500"
    },
    {
      step: "02",
      title: "Practice Daily",
      description: "Complete interactive exercises and coding challenges",
      icon: "💻",
      color: "from-purple-500 to-pink-500"
    },
    {
      step: "03",
      title: "Build Projects",
      description: "Pass tests, earn points, and build your portfolio",
      icon: "🚀",
      color: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 rounded-full px-6 py-3 mb-6">
            <Award className="w-5 h-5 text-pink-600 mr-3" />
            <span className="text-pink-600 text-sm font-semibold">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Journey</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {steps.map((item, index) => (
            <React.Fragment key={index}>
              <div className="flex-1 max-w-sm">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border-2 border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all group">
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl`}>
                    <div className="text-4xl">{item.icon}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block">
                  <ChevronRight className="w-8 h-8 text-purple-300" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ auth }) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-7xl mb-6 animate-bounce">🎓</div>
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Ready to Start Your Python Journey?
        </h2>
        <p className="text-xl text-blue-100 mb-10 leading-relaxed">
          {auth?.user 
            ? 'Continue your learning journey and master Python with our comprehensive courses.'
            : 'Join thousands of students who transformed their careers through our AI-powered bootcamp.'
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          {auth?.user ? (
            <>
              <Link
                href="/lessons"
                className="bg-white text-purple-600 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center group shadow-2xl"
              >
                <BookOpen className="mr-3 w-6 h-6" />
                Browse All Lessons
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-white/30 transition-all"
              >
                View Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="bg-white text-purple-600 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center group shadow-2xl"
              >
                <Rocket className="mr-3 w-6 h-6" />
                Enroll Now
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/lessons"
                className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-white/30 transition-all"
              >
                View Sample Lessons
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 text-white flex-wrap">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-300 fill-yellow-300 mr-2" />
            <span className="font-semibold">Free to Start</span>
          </div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-300 mr-2" />
            <span className="font-semibold">No Credit Card Required</span>
          </div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 text-pink-300 mr-2" />
            <span className="font-semibold">AI-Powered Learning</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">🐍</span>
            </div>
            <div>
              <span className="text-xl font-bold">PythonBootcamp</span>
              <div className="text-xs text-purple-400">AI-Powered Learning</div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/lessons" className="text-gray-400 hover:text-white transition-colors">Lessons</Link>
            <Link href="/student/rewards" className="text-gray-400 hover:text-white transition-colors">Rewards</Link>
            <Link href="/forum" className="text-gray-400 hover:text-white transition-colors">Forum</Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">Account</Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2025 PythonBootcamp. All rights reserved. Empowering the next generation of developers.</p>
        </div>
      </div>
    </footer>
  );
}

// Main App
export default function LandingPage({ auth, featuredLessons = [] }) {
  return (
    <div className="min-h-screen bg-white">
      <Navigation auth={auth} />
      <HeroSection auth={auth} />
      <CurriculumSection lessons={featuredLessons} auth={auth} />
      <FeaturesSection />
      <ProcessSection />
      <CTASection auth={auth} />
      <Footer />
    </div>
  );
}