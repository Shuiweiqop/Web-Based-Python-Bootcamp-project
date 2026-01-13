import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { ArrowLeft, BookOpen } from 'lucide-react';

// Import Components
import LessonHeader from './components/LessonHeader';
import RegistrationCard from './components/RegistrationCard';
import LessonContent from './components/LessonContent';
import ExercisesSection from './components/ExercisesSection';
import TestsSection from './components/TestsSection';
import LessonCompletionModal from './components/LessonCompletionModal';
const LessonShow = ({ auth, lesson, sections = [], exercises = [], tests = [], userProgress = {} }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const exercisesSectionRef = useRef(null);
  const testsSectionRef = useRef(null);

  // Calculate progress
  const completedExercises = exercises.filter(
    ex => userProgress.exercises?.[ex.exercise_id]?.completed
  ).length;
  const totalExercises = exercises.length;
  const exerciseProgress = totalExercises > 0 
    ? Math.round((completedExercises / totalExercises) * 100) 
    : 0;

  const passedTests = tests.filter(
    test => userProgress.tests?.[test.test_id]?.latest_score >= test.passing_score
  ).length;
  const totalTests = tests.length;

  const allExercisesCompleted = completedExercises === totalExercises && totalExercises > 0;
  const allTestsPassed = passedTests === totalTests && totalTests > 0;
  const lessonCompleted = lesson.is_completed || lesson.registration_status === 'completed';

  // Debug logging
  useEffect(() => {
    console.log('🎯 Lesson Show State:', {
      lessonCompleted,
      allExercisesCompleted,
      allTestsPassed,
      completedExercises,
      totalExercises,
      passedTests,
      totalTests,
      'lesson.is_completed': lesson.is_completed,
      'lesson.registration_status': lesson.registration_status
    });
  }, [lessonCompleted, allExercisesCompleted, allTestsPassed]);

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle register
  const handleRegister = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await router.post(
        `/lessons/${lesson.lesson_id}/register`,
        {},
        {
          preserveScroll: true,
          onSuccess: () => {
            console.log('✅ Registration successful');
          },
          onError: (errors) => {
            console.error('❌ Registration failed:', errors);
            alert('Failed to register. Please try again.');
          },
          onFinish: () => {
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('❌ Registration error:', error);
      setIsLoading(false);
    }
  };

  // Handle unregister
  const handleUnregister = async () => {
    if (isLoading) return;
    
    const confirmed = confirm('Are you sure you want to unregister from this lesson? Your progress will be lost.');
    if (!confirmed) return;

    setIsLoading(true);

    try {
      await router.delete(
        `/lessons/${lesson.lesson_id}/unregister`,
        {
          preserveScroll: true,
          onSuccess: () => {
            console.log('✅ Unregistration successful');
          },
          onError: (errors) => {
            console.error('❌ Unregistration failed:', errors);
            alert('Failed to unregister. Please try again.');
          },
          onFinish: () => {
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('❌ Unregistration error:', error);
      setIsLoading(false);
    }
  };

  // Handle complete lesson
  const handleCompleteLesson = () => {
    if (lessonCompleted) {
      alert('You have already completed this lesson.');
      return;
    }

    if (!allExercisesCompleted || !allTestsPassed) {
      alert('Please complete all exercises and pass all tests first.');
      return;
    }

    setShowCompletionModal(true);
  };

  const isStudent = auth?.user?.role === 'student';
  const isRegistered = lesson.is_registered;

  return (
    <StudentLayout>
      <Head title={`${lesson.title} - Lesson`} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.visit('/lessons')}
          className="inline-flex items-center space-x-2 text-gray-300 hover:text-white transition-colors bg-black/40 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-lg hover:bg-black/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lessons</span>
        </button>

        {/* Lesson Header */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
          <LessonHeader 
            lesson={lesson} 
            exerciseProgress={exerciseProgress} 
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Content */}
            <LessonContent lesson={lesson} sections={sections} />

            {/* Exercises Section */}
            {isRegistered && exercises.length > 0 && (
              <div ref={exercisesSectionRef}>
                <ExercisesSection
                  lesson={lesson}
                  exercises={exercises}
                  userProgress={userProgress}
                />
              </div>
            )}

            {/* Tests Section */}
            {isRegistered && tests.length > 0 && (
              <div ref={testsSectionRef}>
                <TestsSection
                  lesson={lesson}
                  tests={tests}
                  userProgress={userProgress}
                  passedTests={passedTests}
                  totalTests={totalTests}
                  exercisesCompleted={allExercisesCompleted}
                  totalExercises={totalExercises}
                />
              </div>
            )}

            {/* Empty State for Non-Registered Users */}
            {!isRegistered && isStudent && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Ready to Start Learning?
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Register for this lesson to access exercises, tests, and earn points upon completion!
                </p>
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Registering...' : 'Register Now'}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Registration Card */}
            {isStudent && (
              <RegistrationCard
                auth={auth}
                lesson={lesson}
                isLoading={isLoading}
                lessonCompleted={lessonCompleted}
                completedExercises={completedExercises}
                totalExercises={totalExercises}
                passedTests={passedTests}
                totalTests={totalTests}
                exerciseProgress={exerciseProgress}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
                scrollToSection={scrollToSection}
                onCompleteLesson={handleCompleteLesson}
              />
            )}

            {/* Lesson Info Card */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Lesson Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-gray-300 font-medium">Status</span>
                  <span className={`font-bold ${lessonCompleted ? 'text-green-400' : 'text-blue-400'}`}>
                    {lessonCompleted ? '✓ Completed' : lesson.status}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                  <span className="text-gray-300 font-medium">Duration</span>
                  <span className="font-bold text-white">
                    {lesson.estimated_duration ? `${lesson.estimated_duration} min` : 'Self-paced'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                  <span className="text-yellow-300 font-medium">Reward</span>
                  <span className="font-bold text-yellow-400 text-lg">
                    {lesson.completion_reward_points} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Stats Card */}
            {isRegistered && (
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Your Progress</h3>
                <div className="space-y-4">
                  {/* Exercise Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Exercises</span>
                      <span className="text-white font-bold">
                        {completedExercises}/{totalExercises}
                      </span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${exerciseProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Test Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Tests</span>
                      <span className="text-white font-bold">
                        {passedTests}/{totalTests}
                      </span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-500"
                        style={{ width: `${totalTests > 0 ? (passedTests / totalTests) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Overall Progress */}
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Overall</span>
                      <span className="text-white font-bold">{exerciseProgress}%</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                        style={{ width: `${exerciseProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      <LessonCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        lesson={lesson}
        rewardPoints={lesson.completion_reward_points}
        onComplete={() => {
          // Modal will handle the completion
        }}
      />
    </StudentLayout>
  );
};

export default LessonShow;