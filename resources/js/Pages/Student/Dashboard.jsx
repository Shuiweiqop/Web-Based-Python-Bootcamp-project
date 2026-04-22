import React, { useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import { cn } from '@/utils/cn';
import { 
  Trophy, BookOpen, Target, Flame, ArrowRight, Play, Users, 
  TrendingUp, Clock, Brain, Code, Zap, CheckCircle, Star, Calendar,
  MessageCircle, Search, Bell, User, Settings, Sparkles, Lock
} from 'lucide-react';

export default function StudentDashboard({ 
    auth, 
    studentProfile, 
    availableLessons = [],
    recentLessons = [],
    learningPathProgress = null,
    nextLesson = null
}) {
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

    const quickActions = [
        {
            icon: "📖",
            title: "Continue Learning",
            description: "Pick up where you left off",
            color: "from-blue-500 to-purple-600",
            hoverColor: "hover:from-blue-600 hover:to-purple-700",
            href: '/lessons'
        },
        {
            icon: "✏️", 
            title: "Take a Quiz",
            description: "Test your knowledge",
            color: "from-purple-500 to-indigo-600",
            hoverColor: "hover:from-purple-600 hover:to-indigo-700",
            href: '/tests'
        },
        {
            icon: "💬",
            title: "Join Discussion",
            description: "Connect with peers",
            color: "from-indigo-500 to-blue-600", 
            hoverColor: "hover:from-indigo-600 hover:to-blue-700",
            href: '/discussions'
        },
        {
            icon: "🎯",
            title: "Practice Problems",
            description: "Sharpen coding skills",
            color: "from-orange-500 to-red-600",
            hoverColor: "hover:from-orange-600 hover:to-red-700",
            href: '/practice'
        }
    ];

    // Difficulty badge styling
    const getDifficultyBadge = (difficulty) => {
        const styles = {
            beginner: "bg-green-500/20 text-green-300 border-green-500/40",
            intermediate: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
            advanced: "bg-red-500/20 text-red-300 border-red-500/40"
        };
        return styles[difficulty?.toLowerCase()] || styles.beginner;
    };

    const dashboardHeader = (
        <div className="bg-black/70 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl">
            <div data-sfx className="inline-flex items-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40 rounded-full px-6 py-3 mb-6 backdrop-blur-sm animate-fadeIn">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
                <span className="text-blue-300 text-sm font-medium drop-shadow-lg">Active Learning Session</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full mx-3"></div>
                <span className="text-purple-300 text-sm font-medium drop-shadow-lg">{profile.streak_status}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] animate-bounceIn">
                Welcome back,
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> {auth.user.name}! </span>
                👋
            </h1>
            
            <p className="text-lg text-gray-100 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-fadeIn">
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
                    <div 
                        key={index} 
                        data-sfx
                        className={cn(
                            "text-center bg-black/70 backdrop-blur-md rounded-2xl p-6",
                            "border border-white/30 hover:bg-black/80 hover:border-white/50",
                            "transition-all group shadow-2xl",
                            "hover-lift animate-fadeIn"
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/40">
                                <stat.icon className={cn("w-6 h-6 drop-shadow-lg", stat.accent)} />
                            </div>
                        </div>
                        <div className={cn(
                            "text-3xl md:text-4xl font-bold mb-2",
                            "group-hover:scale-110 transition-transform",
                            "drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]",
                            stat.accent
                        )}>
                            {stat.number}
                        </div>
                        <div className="text-gray-100 font-medium mb-1 drop-shadow-lg">{stat.label}</div>
                        <div className="text-sm text-gray-300 drop-shadow-lg">{stat.subtitle}</div>
                    </div>
                ))}
            </div>

            {/* Progress Section */}
            <div className={cn(
                "bg-black/70 backdrop-blur-md rounded-2xl p-8",
                "border border-white/30 hover:bg-black/80 hover:border-white/50",
                "transition-all mb-12 shadow-2xl animate-slideDown"
            )} data-sfx>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <TrendingUp className="w-6 h-6 text-blue-400 mr-3 drop-shadow-lg" />
                        <h3 className="text-2xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Learning Progress</h3>
                    </div>
                    <div className="text-blue-300 font-medium drop-shadow-lg">
                        {profile.completion_percentage}% Complete
                    </div>
                </div>
                
                <div className="w-full bg-gray-800/80 rounded-full h-3 mb-4 border border-gray-700/50 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden" 
                        style={{ width: `${profile.completion_percentage}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                </div>
                <p className="text-gray-100 drop-shadow-lg">
                    You're making excellent progress on your Python journey. Keep up the momentum!
                </p>
            </div>

            {/* Quick Actions */}
            <div className={cn(
                "bg-black/70 backdrop-blur-md rounded-3xl p-8",
                "border border-white/30 mb-12 shadow-2xl animate-fadeIn"
            )} data-sfx>
                <div className="text-center">
                    <div className="inline-flex items-center bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-purple-500/50 rounded-full px-6 py-3 mb-6 backdrop-blur-sm">
                        <Zap className="w-5 h-5 text-purple-300 mr-3 drop-shadow-lg animate-pulse-slow" />
                        <span className="text-purple-200 text-sm font-medium drop-shadow-lg">Quick Actions</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                        Jump Back Into Learning
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                href={action.href}
                                className={cn(
                                    "bg-gradient-to-r text-white p-8 rounded-2xl font-semibold",
                                    "transition-all duration-300 transform hover:scale-105 hover:shadow-2xl",
                                    "group relative overflow-hidden border border-white/30 shadow-xl",
                                    "ripple-effect active-scale",
                                    action.color,
                                    action.hoverColor
                                )}
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10">
                                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 drop-shadow-xl animate-float">
                                        {action.icon}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xl font-bold mb-2 flex items-center drop-shadow-lg">
                                            {action.title}
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                        <div className="text-white text-sm drop-shadow-lg font-medium">
                                            {action.description}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Available Lessons Section */}
            <div className={cn(
                "bg-black/70 backdrop-blur-md rounded-3xl p-8",
                "border border-white/30 mb-12 shadow-2xl animate-slideDown"
            )} data-sfx>
                <div className="flex items-center mb-6">
                    <Sparkles className="w-6 h-6 text-purple-400 mr-3 drop-shadow-lg" />
                    <h3 className="text-2xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        Discover New Lessons
                    </h3>
                </div>
                
                {availableLessons.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-gray-300 text-lg mb-2">You've registered for all available lessons!</p>
                        <p className="text-gray-400">Check back soon for new content</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {availableLessons.map((lesson, index) => (
                            <Link
                                key={lesson.lesson_id}
                                href={`/lessons/${lesson.lesson_id}`}
                                className={cn(
                                    "p-6 bg-black/50 rounded-xl border border-white/20",
                                    "hover:bg-black/70 hover:border-purple-400/50",
                                    "transition-all shadow-lg group relative overflow-hidden",
                                    "hover-lift animate-fadeIn"
                                )}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* New Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse-slow">
                                        NEW
                                    </span>
                                </div>
                                
                                <div className="mb-4">
                                    <h4 className="font-semibold text-white text-lg mb-2 drop-shadow-lg group-hover:text-purple-300 transition-colors pr-16">
                                        {lesson.title}
                                    </h4>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                                        {lesson.description}
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={cn(
                                        "text-xs px-2 py-1 rounded border capitalize",
                                        getDifficultyBadge(lesson.difficulty)
                                    )}>
                                        {lesson.difficulty}
                                    </span>
                                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs px-2 py-1 rounded flex items-center gap-1">
                                        <Trophy className="w-3 h-3" />
                                        {lesson.completion_reward_points} pts
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                                    <span className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {lesson.duration}
                                    </span>
                                    <span className="flex items-center gap-3">
                                        <span className="flex items-center">
                                            <Code className="w-4 h-4 mr-1" />
                                            {lesson.exercises_count}
                                        </span>
                                        <span className="flex items-center">
                                            <Target className="w-4 h-4 mr-1" />
                                            {lesson.tests_count}
                                        </span>
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-purple-300 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
                                        Start Learning <ArrowRight className="w-4 h-4 ml-1" />
                                    </span>
                                    <Lock className="w-5 h-5 text-gray-500 group-hover:text-purple-400 group-hover:scale-110 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
                
                {availableLessons.length > 0 && (
                    <div className="text-center mt-8">
                        <Link
                            href="/lessons"
                            className={cn(
                                "inline-flex items-center gap-2",
                                "text-purple-300 hover:text-purple-200",
                                "font-medium transition-colors group"
                            )}
                        >
                            View All Lessons
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Bottom CTA */}
            <div className={cn(
                "bg-black/70 backdrop-blur-md rounded-3xl p-8",
                "border border-white/30 shadow-2xl animate-fadeIn"
            )} data-sfx>
                <div className="text-center">
                    <div className="inline-flex items-center bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-500/50 rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
                        <Users className="w-5 h-5 text-blue-200 mr-3 drop-shadow-lg" />
                        <span className="text-blue-200 text-sm font-medium drop-shadow-lg">Join 5,000+ Python learners</span>
                        <div className="w-2 h-2 bg-blue-400 rounded-full mx-3"></div>
                        <span className="text-purple-200 text-sm font-medium drop-shadow-lg">24/7 AI Support Available</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            href="/lessons"
                            className={cn(
                                "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
                                "px-10 py-5 rounded-xl font-semibold text-lg",
                                "hover:from-blue-600 hover:to-purple-700",
                                "transition-all transform hover:scale-105",
                                "flex items-center justify-center group shadow-2xl",
                                "border border-white/30 ripple-effect"
                            )}
                        >
                            <span className="drop-shadow-lg">🚀 Continue Your Journey</span>
                            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform drop-shadow-lg" />
                        </Link>
                        <Link
                            href="/community"
                            className={cn(
                                "border-2 border-blue-400 bg-black/60 backdrop-blur-sm text-white",
                                "px-10 py-5 rounded-xl font-semibold text-lg",
                                "hover:bg-blue-500/30 hover:border-blue-300",
                                "transition-all flex items-center justify-center group shadow-xl"
                            )}
                        >
                            <MessageCircle className="mr-3 w-5 h-5 text-blue-300 drop-shadow-lg" />
                            <span className="drop-shadow-lg">Join Community</span>
                        </Link>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
