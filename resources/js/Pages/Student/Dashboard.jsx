import React, { useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import { 
  Trophy, 
  BookOpen, 
  Target, 
  Flame, 
  ArrowRight, 
  Play, 
  Users, 
  Award, 
  TrendingUp,
  Clock,
  Brain,
  Code,
  Zap,
  CheckCircle,
  Star,
  Calendar,
  MessageCircle,
  Search,
  Bell,
  User,
  Settings
} from 'lucide-react';

export default function StudentDashboard({ auth, studentProfile }) {
    const profile = studentProfile || {
        current_points: 0,
        total_lessons_completed: 0,
        total_tests_taken: 0,
        average_score: 0,
        streak_days: 0,
        points_level: 'Newbie',
        completion_percentage: 0,
        streak_status: 'Ready to Start! 🚀'
    };

    const stats = [
        {
            number: profile.current_points.toLocaleString(),
            label: "Current Points",
            subtitle: profile.points_level,
            icon: Trophy,
            accent: "text-blue-400"
        },
        {
            number: profile.total_lessons_completed,
            label: "Lessons Completed", 
            subtitle: `${profile.completion_percentage}% Complete`,
            icon: BookOpen,
            accent: "text-purple-400"
        },
        {
            number: profile.total_tests_taken,
            label: "Tests Taken",
            subtitle: `Avg: ${profile.average_score}%`,
            icon: Target,
            accent: "text-indigo-400"
        },
        {
            number: profile.streak_days,
            label: "Learning Streak",
            subtitle: "days in a row",
            icon: Flame,
            accent: "text-orange-400"
        }
    ];

    const recentAchievements = [
        { title: "Python Basics Master", description: "Completed fundamental concepts", icon: "🏆", color: "text-yellow-400" },
        { title: "Code Warrior", description: "Solved 50+ practice problems", icon: "⚔️", color: "text-blue-400" },
        { title: "Streak Legend", description: "7-day learning streak", icon: "🔥", color: "text-red-400" }
    ];

    const upcomingLessons = [
        { title: "Functions & Parameters", duration: "45 min", difficulty: "Beginner", progress: 0 },
        { title: "Data Structures: Lists", duration: "60 min", difficulty: "Intermediate", progress: 25 },
        { title: "Object-Oriented Programming", duration: "90 min", difficulty: "Advanced", progress: 0 }
    ];

    const quickActions = [
        {
            icon: "📖",
            title: "Continue Learning",
            description: "Pick up where you left off",
            color: "from-blue-500 to-purple-600",
            hoverColor: "hover:from-blue-600 hover:to-purple-700"
        },
        {
            icon: "✏️", 
            title: "Take a Quiz",
            description: "Test your knowledge",
            color: "from-purple-500 to-indigo-600",
            hoverColor: "hover:from-purple-600 hover:to-indigo-700"
        },
        {
            icon: "💬",
            title: "Join Discussion",
            description: "Connect with peers",
            color: "from-indigo-500 to-blue-600", 
            hoverColor: "hover:from-indigo-600 hover:to-blue-700"
        },
        {
            icon: "🎯",
            title: "Practice Problems",
            description: "Sharpen coding skills",
            color: "from-orange-500 to-red-600",
            hoverColor: "hover:from-orange-600 hover:to-red-700"
        }
    ];

    // Custom header for the student dashboard
    const dashboardHeader = (
        <div className="text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-3 mb-6">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-blue-400 text-sm font-medium">Active Learning Session</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full mx-3"></div>
                <span className="text-purple-400 text-sm font-medium">{profile.streak_status}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Welcome back,
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> {auth.user.name}! </span>
                👋
            </h1>
            
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Continue your Python mastery journey with personalized learning paths, 
                AI-powered guidance, and track your progress as you level up your coding skills.
            </p>
        </div>
    );

    return (
        <StudentLayout header={dashboardHeader}>
            <Head title="Student Dashboard" />
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
                {stats.map((stat, index) => (
                    <div key={index} className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all group">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/20">
                                <stat.icon className={`w-6 h-6 ${stat.accent}`} />
                            </div>
                        </div>
                        <div className={`text-3xl md:text-4xl font-bold ${stat.accent} mb-2 group-hover:scale-110 transition-transform`}>
                            {stat.number}
                        </div>
                        <div className="text-gray-300 font-medium mb-1">{stat.label}</div>
                        <div className="text-sm text-gray-400">{stat.subtitle}</div>
                    </div>
                ))}
            </div>

            {/* Progress Section */}
            <div id="progress" className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <TrendingUp className="w-6 h-6 text-blue-400 mr-3" />
                        <h3 className="text-2xl font-bold text-white">Learning Progress</h3>
                    </div>
                    <div className="text-blue-400 font-medium">
                        {profile.completion_percentage}% Complete
                    </div>
                </div>
                
                <div className="w-full bg-gray-200/20 rounded-full h-3 mb-4">
                    <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-1000" 
                        style={{ width: `${profile.completion_percentage}%` }}
                    ></div>
                </div>
                <p className="text-gray-300">
                    You're making excellent progress on your Python journey. Keep up the momentum!
                </p>
            </div>

            {/* Quick Actions */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full px-6 py-3 mb-6">
                    <Zap className="w-5 h-5 text-purple-400 mr-3" />
                    <span className="text-purple-400 text-sm font-medium">Quick Actions</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Jump Back Into Learning
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {quickActions.map((action, index) => (
                        <button 
                            key={index}
                            className={`bg-gradient-to-r ${action.color} ${action.hoverColor} text-white p-8 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {action.icon}
                                </div>
                                <div className="text-left">
                                    <div className="text-xl font-bold mb-2 flex items-center">
                                        {action.title}
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    <div className="text-white/80 text-sm">
                                        {action.description}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Achievements & Upcoming Lessons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Recent Achievements */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-center mb-6">
                        <Award className="w-6 h-6 text-yellow-400 mr-3" />
                        <h3 className="text-2xl font-bold text-white">Recent Achievements</h3>
                    </div>
                    <div className="space-y-4">
                        {recentAchievements.map((achievement, index) => (
                            <div key={index} className="flex items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                                <div className="text-2xl mr-4">{achievement.icon}</div>
                                <div>
                                    <div className={`font-semibold ${achievement.color}`}>{achievement.title}</div>
                                    <div className="text-gray-400 text-sm">{achievement.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Lessons */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-center mb-6">
                        <Calendar className="w-6 h-6 text-blue-400 mr-3" />
                        <h3 className="text-2xl font-bold text-white">Upcoming Lessons</h3>
                    </div>
                    <div className="space-y-4">
                        {upcomingLessons.map((lesson, index) => (
                            <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-semibold text-white">{lesson.title}</div>
                                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">{lesson.difficulty}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                                    <span className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {lesson.duration}
                                    </span>
                                    <span>{lesson.progress}% complete</span>
                                </div>
                                <div className="w-full bg-gray-700/50 rounded-full h-2">
                                    <div 
                                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all"
                                        style={{ width: `${lesson.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom CTA Section */}
            <div className="text-center">
                <div className="inline-flex items-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-3 mb-8">
                    <Users className="w-5 h-5 text-blue-400 mr-3" />
                    <span className="text-blue-400 text-sm font-medium">Join 5,000+ Python learners</span>
                    <div className="w-2 h-2 bg-blue-400 rounded-full mx-3"></div>
                    <span className="text-purple-400 text-sm font-medium">24/7 AI Support Available</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                        href="/lessons"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-5 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center group shadow-2xl"
                    >
                        🚀 Continue Your Journey
                        <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button className="border-2 border-blue-400/50 text-white px-10 py-5 rounded-xl font-semibold text-lg hover:bg-blue-400/10 hover:border-blue-400 transition-all flex items-center justify-center group">
                        <MessageCircle className="mr-3 w-5 h-5 text-blue-400" />
                        Join Community
                    </button>
                </div>
            </div>
        </StudentLayout>
    );
}