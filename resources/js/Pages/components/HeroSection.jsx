import React, { useState } from 'react';
import { Clock, Mail, ArrowRight, Play } from 'lucide-react';

export default function HeroSection() {
  const [email, setEmail] = useState('');

  const handleEmailSignup = () => {
    if (email) {
      console.log('Email signup:', email);
      setEmail('');
      // Add email signup logic here
    }
  };

  const stats = [
    { number: "5,000+", label: "Beginners Trained" },
    { number: "95%", label: "Completion Rate" },
    { number: "8 Weeks", label: "To Python Pro" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-full px-6 py-3 mb-8">
          <Clock className="w-5 h-5 text-green-400 mr-3" />
          <span className="text-green-400 text-sm font-medium">8-Week Intensive Bootcamp</span>
          <div className="w-2 h-2 bg-green-400 rounded-full mx-3"></div>
          <span className="text-blue-400 text-sm font-medium">100% Web-Based</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Master
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"> Python </span>
          from Zero to Hero
        </h1>
        
        <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
          Join our comprehensive web-based Python bootcamp designed specifically for beginners. 
          Learn programming fundamentals, build real projects, and launch your coding career with AI-powered guidance and community support.
        </p>

        {/* Email Signup Form */}
        <div className="max-w-md mx-auto mb-10">
          <form onSubmit={handleEmailSignup} className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-2 flex">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Enter your email for updates..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none w-full"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              Notify Me
            </button>
          </form>
          <p className="text-sm text-gray-400 mt-2">Get notified about new cohorts and early bird discounts</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-10 py-5 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center group shadow-2xl">
            🚀 Start Your Python Journey
            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="border-2 border-green-400/50 text-white px-10 py-5 rounded-xl font-semibold text-lg hover:bg-green-400/10 hover:border-green-400 transition-all flex items-center justify-center group">
            <Play className="mr-3 w-5 h-5 text-green-400" />
            Watch Preview
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all group">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform">{stat.number}</div>
              <div className="text-gray-300 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}