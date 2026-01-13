import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, ChevronRight, CheckCircle, Lock, Code, Award, TrendingUp } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function CurriculumSection({ lessons = [], auth = null }) {
  const [visibleLessons, setVisibleLessons] = useState([]);

  // 根据难度返回颜色
  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'from-blue-500 to-cyan-500',
      intermediate: 'from-purple-500 to-pink-500',
      advanced: 'from-pink-500 to-rose-500',
      expert: 'from-orange-500 to-red-500',
    };
    return colors[difficulty?.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  // 根据难度返回图标
  const getDifficultyIcon = (difficulty) => {
    const icons = {
      beginner: '📚',
      intermediate: '🎯',
      advanced: '🚀',
      expert: '⚡',
    };
    return icons[difficulty?.toLowerCase()] || '📖';
  };

  // 根据难度返回显示文本
  const getDifficultyLabel = (difficulty) => {
    if (!difficulty) return 'Beginner';
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  // 计算课程统计
  const getLessonStats = (lesson) => {
    const exercisesCount = lesson.exercises_count || 0;
    const testsCount = lesson.tests_count || 0;
    const rewardPoints = lesson.completion_reward_points || 100;
    
    return { exercisesCount, testsCount, rewardPoints };
  };

  // 动画效果
  useEffect(() => {
    if (lessons && lessons.length > 0) {
      lessons.forEach((_, index) => {
        setTimeout(() => {
          setVisibleLessons(prev => [...prev, index]);
        }, index * 150);
      });
    }
  }, [lessons]);

  // 如果没有课程数据，显示占位符
  if (!lessons || lessons.length === 0) {
    return (
      <section id="curriculum" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 border border-purple-200 rounded-full px-6 py-3 mb-6">
              <BookOpen className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-purple-600 text-sm font-semibold">Comprehensive Curriculum</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Complete <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Learning Path</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Progressive curriculum designed to take you from beginner to professional Python developer
            </p>
          </div>
          
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
            <p className="text-gray-500 text-lg">Loading courses...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="curriculum" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 border border-purple-200 rounded-full px-6 py-3 mb-6">
            <BookOpen className="w-5 h-5 text-purple-600 mr-3" />
            <span className="text-purple-600 text-sm font-semibold">Comprehensive Curriculum</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Featured <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Lessons</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Progressive learning path designed to take you from beginner to professional developer
          </p>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {lessons.map((lesson, index) => {
            const stats = getLessonStats(lesson);
            const isRegistered = lesson.is_registered || false;
            const difficultyColor = getDifficultyColor(lesson.difficulty);
            const difficultyIcon = getDifficultyIcon(lesson.difficulty);
            const difficultyLabel = getDifficultyLabel(lesson.difficulty);

            return (
              <div
                key={lesson.lesson_id}
                className={`transform transition-all duration-700 ${
                  visibleLessons.includes(index) 
                    ? 'translate-x-0 opacity-100' 
                    : index % 2 === 0 ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'
                }`}
              >
                <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all group relative overflow-hidden h-full flex flex-col">
                  
                  {/* Registration Badge */}
                  {isRegistered && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Enrolled
                      </div>
                    </div>
                  )}

                  {/* Module Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${difficultyColor} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {difficultyIcon}
                    </div>
                    <span className="bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-sm font-semibold">
                      {difficultyLabel}
                    </span>
                  </div>

                  {/* Module Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3 flex-grow">
                    {lesson.description || 'Master essential programming concepts and build real-world projects.'}
                  </p>

                  {/* Module Stats */}
                  <div className="flex items-center flex-wrap gap-4 mb-6 text-sm">
                    {stats.exercisesCount > 0 && (
                      <div className="flex items-center text-gray-500">
                        <Code className="w-4 h-4 mr-1.5" />
                        <span className="font-medium">{stats.exercisesCount} exercises</span>
                      </div>
                    )}
                    {stats.testsCount > 0 && (
                      <div className="flex items-center text-gray-500">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        <span className="font-medium">{stats.testsCount} tests</span>
                      </div>
                    )}
                    {stats.rewardPoints > 0 && (
                      <div className="flex items-center text-amber-600">
                        <Award className="w-4 h-4 mr-1.5" />
                        <span className="font-medium">{stats.rewardPoints} pts</span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Link
                      href={`/lessons/${lesson.lesson_id}`}
                      className="text-purple-600 font-semibold flex items-center group-hover:translate-x-2 transition-transform"
                    >
                      {isRegistered ? 'Continue Learning' : 'View Details'}
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Link>
                    {!isRegistered && (
                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Free
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-10 border-2 border-purple-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to start your learning journey?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {auth?.user 
                ? 'Browse all available lessons and start learning Python today'
                : 'Sign up now to get instant access to all courses and our AI tutor support'
              }
            </p>
            <Link
              href="/lessons"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all transform hover:scale-105 inline-flex items-center"
            >
              {auth?.user ? 'Browse All Lessons' : 'Get Started Free'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}