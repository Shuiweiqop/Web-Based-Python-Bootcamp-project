import React, { useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import { cn } from '@/utils/cn';
import { 
  Trophy, BookOpen, Target, Flame, ArrowRight, Play, Users, 
  TrendingUp, Clock, Brain, Code, Zap, CheckCircle, Star, Calendar,
  MessageCircle, Search, Bell, User, Settings, Sparkles, Lock,
  ScrollText, Gem
} from 'lucide-react';

export default function StudentDashboard({ 
    auth, 
    studentProfile, 
    availableLessons = [],
    recentLessons = [],
    learningPathProgress = null,
    nextLesson = null,
    dailyChallengeBoard = { daily: [], weekly: [], summary: {} }
}) {
    const profile = studentProfile || {
        current_points: 0,
        total_lessons_completed: 0,
        total_tests_taken: 0,
        average_score: 0,
        streak_days: 0,
        points_level: 'Newbie',
        completion_percentage: 0,
        streak_status: 'Ready to Start!'
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

    const quickActions = [
        {
            icon: BookOpen,
            title: "Continue Learning",
            description: nextLesson ? `Next: ${nextLesson.title}` : "Pick up where you left off",
            color: "from-blue-500 to-purple-600",
            hoverColor: "hover:from-blue-600 hover:to-purple-700",
            href: nextLesson ? route('lessons.show', nextLesson.lesson_id) : route('student.paths.index')
        },
        {
            icon: Target,
            title: "My Learning Path",
            description: "Track progress and continue your path",
            color: "from-purple-500 to-indigo-600",
            hoverColor: "hover:from-purple-600 hover:to-indigo-700",
            href: route('student.paths.index')
        },
        {
            icon: MessageCircle,
            title: "Join Discussion",
            description: "Connect with peers in the forum",
            color: "from-indigo-500 to-blue-600",
            hoverColor: "hover:from-indigo-600 hover:to-blue-700",
            href: route('forum.index')
        },
        {
            icon: Sparkles,
            title: "Browse Paths",
            description: "Explore other available learning paths",
            color: "from-orange-500 to-red-600",
            hoverColor: "hover:from-orange-600 hover:to-red-700",
            href: route('student.paths.browse')
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

    const missionIconMap = {
        zap: Zap,
        target: Target,
        messages: MessageCircle,
        sparkles: Sparkles,
    };

    const missionAccentMap = {
        amber: {
            shell: "from-amber-500/20 via-orange-500/10 to-transparent border-amber-400/30",
            icon: "text-amber-300 bg-amber-500/20 border-amber-400/30",
            bar: "from-amber-400 to-orange-500",
            chip: "bg-amber-500/15 text-amber-200 border-amber-400/30",
        },
        blue: {
            shell: "from-blue-500/20 via-cyan-500/10 to-transparent border-blue-400/30",
            icon: "text-blue-300 bg-blue-500/20 border-blue-400/30",
            bar: "from-blue-400 to-cyan-500",
            chip: "bg-blue-500/15 text-blue-200 border-blue-400/30",
        },
        emerald: {
            shell: "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-400/30",
            icon: "text-emerald-300 bg-emerald-500/20 border-emerald-400/30",
            bar: "from-emerald-400 to-teal-500",
            chip: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
        },
        slate: {
            shell: "from-slate-500/20 via-slate-400/10 to-transparent border-slate-300/30",
            icon: "text-slate-200 bg-slate-500/20 border-slate-300/30",
            bar: "from-slate-300 to-slate-500",
            chip: "bg-slate-500/15 text-slate-100 border-slate-300/30",
        },
    };

    const renderMissionCard = (mission) => {
        const Icon = missionIconMap[mission.ui?.icon] || Sparkles;
        const accent = missionAccentMap[mission.ui?.accent] || missionAccentMap.slate;

        return (
            <div
                key={mission.id}
                className={cn(
                    "rounded-2xl border p-5 shadow-xl backdrop-blur-md bg-gradient-to-br",
                    accent.shell,
                    mission.is_completed ? "ring-1 ring-white/20" : ""
                )}
            >
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                        <div className={cn("p-3 rounded-2xl border", accent.icon)}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", accent.chip)}>
                                    {mission.ui?.badge || mission.period_label}
                                </span>
                                <span className="text-xs px-2.5 py-1 rounded-full border border-white/15 bg-white/5 text-gray-200">
                                    {mission.category}
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-white drop-shadow-lg">{mission.title}</h4>
                            <p className="text-sm text-gray-300 mt-1">{mission.description}</p>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Reward</div>
                        <div className="text-xl font-bold text-white">{mission.reward_points}</div>
                        <div className="text-xs text-yellow-300">points</div>
                    </div>
                </div>

                <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-gray-300">{mission.current_count}/{mission.target_count} completed</span>
                    <span className={cn(
                        "font-semibold",
                        mission.is_completed ? "text-emerald-300" : "text-blue-200"
                    )}>
                        {mission.status_label}
                    </span>
                </div>

                <div className="w-full bg-black/40 rounded-full h-2.5 border border-white/10 overflow-hidden mb-4">
                    <div
                        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", accent.bar)}
                        style={{ width: `${mission.progress_percent}%` }}
                    />
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                        {mission.remaining_count > 0
                            ? `${mission.remaining_count} more to clear this mission`
                            : 'Mission cleared'}
                    </span>
                    <span className="text-gray-300">{mission.period_label}</span>
                </div>
            </div>
        );
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

            <div className={cn(
                "bg-black/70 backdrop-blur-md rounded-3xl p-8",
                "border border-white/30 mb-12 shadow-2xl animate-fadeIn"
            )} data-sfx>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                    <div>
                        <div className="inline-flex items-center bg-gradient-to-r from-amber-500/20 to-blue-500/20 border border-white/15 rounded-full px-4 py-2 mb-4">
                            <ScrollText className="w-4 h-4 text-amber-300 mr-2" />
                            <span className="text-sm font-medium text-white">Mission Control</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                            Today's Missions
                        </h2>
                        <p className="text-gray-300 max-w-2xl">
                            Give each session a rhythm: warm up with practice, lock in mastery, and show up for the community.
                        </p>
                    </div>

                    <Link
                        href={route('student.missions.index')}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                        Open Mission Center
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    <div className="grid grid-cols-2 gap-4 min-w-[280px]">
                        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                            <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Daily Clear</div>
                            <div className="text-3xl font-bold text-white">
                                {dailyChallengeBoard.summary?.daily_completed || 0}
                                <span className="text-lg text-gray-400">/{dailyChallengeBoard.summary?.daily_total || 0}</span>
                            </div>
                            <div className="text-sm text-emerald-300 mt-2">missions completed</div>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                            <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Quest Pool</div>
                            <div className="text-3xl font-bold text-white">
                                {dailyChallengeBoard.summary?.total_points_available || 0}
                            </div>
                            <div className="text-sm text-yellow-300 mt-2">points on the board</div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-3 rounded-2xl border border-amber-400/30 bg-amber-500/15">
                                <Trophy className="w-5 h-5 text-amber-300" />
                            </div>
                            <div>
                                <div className="text-sm uppercase tracking-[0.2em] text-amber-200/80 mb-1">
                                    Bonus Objective
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    {dailyChallengeBoard.summary?.daily_full_clear_bonus_title || 'Full Clear Bonus'}
                                </h3>
                                <p className="text-sm text-gray-300 mt-1">
                                    Clear every daily mission in one day to unlock an extra reward drop.
                                </p>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <div className="text-3xl font-bold text-white">
                                +{dailyChallengeBoard.summary?.daily_full_clear_bonus_points || 0}
                            </div>
                            <div className={cn(
                                "text-sm font-semibold mt-1",
                                dailyChallengeBoard.summary?.daily_full_clear_bonus_earned
                                    ? "text-emerald-300"
                                    : "text-amber-200"
                            )}>
                                {dailyChallengeBoard.summary?.daily_full_clear_bonus_earned
                                    ? "Bonus claimed for today"
                                    : "Available after full clear"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 rounded-2xl border border-blue-400/20 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 p-5">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Flame className="w-5 h-5 text-orange-300" />
                                <h3 className="text-xl font-bold text-white">Mission Streak</h3>
                            </div>
                            <p className="text-sm text-gray-300 max-w-2xl">
                                Every day you full-clear your missions, this streak grows. Hit milestone days to unlock extra points.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                                <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Current</div>
                                <div className="text-3xl font-bold text-white">
                                    {dailyChallengeBoard.summary?.mission_streak?.current_streak || 0}
                                </div>
                                <div className="text-sm text-orange-300 mt-1">day streak</div>
                            </div>
                            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                                <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Best</div>
                                <div className="text-3xl font-bold text-white">
                                    {dailyChallengeBoard.summary?.mission_streak?.best_streak || 0}
                                </div>
                                <div className="text-sm text-blue-300 mt-1">best run</div>
                            </div>
                            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                                <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Next Goal</div>
                                <div className="text-3xl font-bold text-white">
                                    {dailyChallengeBoard.summary?.mission_streak?.next_milestone_days || 'Max'}
                                </div>
                                <div className="text-sm text-emerald-300 mt-1">
                                    {dailyChallengeBoard.summary?.mission_streak?.next_milestone_points
                                        ? `+${dailyChallengeBoard.summary?.mission_streak?.next_milestone_points} pts`
                                        : 'all tiers cleared'}
                                </div>
                            </div>
                            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                                <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Remaining</div>
                                <div className="text-3xl font-bold text-white">
                                    {dailyChallengeBoard.summary?.mission_streak?.days_to_next_milestone || 0}
                                </div>
                                <div className="text-sm text-yellow-300 mt-1">days to go</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                        {(dailyChallengeBoard.summary?.mission_streak?.milestones || []).map((milestone) => (
                            <div
                                key={milestone.days}
                                className={cn(
                                    "rounded-2xl border p-4",
                                    milestone.earned
                                        ? "border-emerald-400/30 bg-emerald-500/10"
                                        : "border-white/10 bg-white/5"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-lg font-bold text-white">{milestone.days}-Day Run</span>
                                    <span className={cn(
                                        "text-xs px-2.5 py-1 rounded-full border",
                                        milestone.earned
                                            ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                                            : "border-white/15 bg-white/5 text-gray-300"
                                    )}>
                                        {milestone.earned ? "Unlocked" : "Locked"}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-300">Milestone bonus</div>
                                <div className="text-2xl font-bold text-white mt-1">+{milestone.points}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {dailyChallengeBoard.daily?.length ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                        {dailyChallengeBoard.daily.map(renderMissionCard)}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-gray-300 mb-8">
                        Daily missions will appear here once challenges are active.
                    </div>
                )}

                <div className="flex items-center gap-3 mb-5">
                    <Gem className="w-5 h-5 text-blue-300" />
                    <h3 className="text-xl font-bold text-white">Weekly Quest Board</h3>
                    <span className="text-sm text-gray-400">
                        {dailyChallengeBoard.summary?.weekly_completed || 0}/{dailyChallengeBoard.summary?.weekly_total || 0} complete
                    </span>
                </div>

                {dailyChallengeBoard.weekly?.length ? (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                        {dailyChallengeBoard.weekly.map(renderMissionCard)}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-gray-300">
                        Weekly quests will appear here once they are configured.
                    </div>
                )}
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
                        {quickActions.map((action, index) => {
                            const ActionIcon = action.icon;

                            return (
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
                                        <div className="mb-4 inline-flex rounded-2xl bg-white/15 p-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-xl animate-float">
                                            <ActionIcon className="h-8 w-8" />
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
                            );
                        })}
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
                            <span className="drop-shadow-lg">Continue Your Journey</span>
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
