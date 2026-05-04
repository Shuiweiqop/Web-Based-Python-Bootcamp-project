import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { ArrowLeft, BookOpen } from 'lucide-react';

import LessonHeader from './components/LessonHeader';
import LessonJourney from './components/LessonJourney';
import RegistrationCard from './components/RegistrationCard';
import LessonContent from './components/LessonContent';
import ExercisesSection from './components/ExercisesSection';
import TestsSection from './components/TestsSection';
import LessonCompletionModal from './components/LessonCompletionModal';

const LessonShow = ({ auth, lesson, sections = [], exercises = [], tests = [], userProgress = {}, lessonProgress = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [contentSignals, setContentSignals] = useState({
    openedSections: 0,
    totalSections: sections.length,
    contentScrolledToBottom: false,
  });

  const completedExercises = exercises.filter(
    (exercise) => userProgress.exercises?.[exercise.exercise_id]?.completed
  ).length;
  const totalExercises = exercises.length;
  const passedTests = tests.filter(
    (test) => userProgress.tests?.[test.test_id]?.latest_score >= test.passing_score
  ).length;
  const totalTests = tests.length;

  const allExercisesCompleted = totalExercises === 0 || completedExercises === totalExercises;
  const allTestsPassed = totalTests === 0 || passedTests === totalTests;
  const lessonCompleted = lesson.is_completed || lesson.registration_status === 'completed';
  const contentCompleted = lessonCompleted || (lessonProgress?.content_completed ?? false);
  const isStudent = auth?.user?.role === 'student';
  const isRegistered = lesson.is_registered;

  const guidedStepCount =
    (contentCompleted ? 1 : 0) +
    (allExercisesCompleted ? 1 : 0) +
    (allTestsPassed ? 1 : 0) +
    (lessonCompleted ? 1 : 0);
  const guidedPathProgress = Math.round((guidedStepCount / 4) * 100);
  const remainingExercises = Math.max(totalExercises - completedExercises, 0);
  const remainingTests = Math.max(totalTests - passedTests, 0);
  const nextSectionNumber =
    contentSignals.totalSections > 0 && contentSignals.openedSections < contentSignals.totalSections
      ? contentSignals.openedSections + 1
      : null;

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const offset = 100;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  };

  const handleRegister = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await router.post(`/lessons/${lesson.lesson_id}/register`, {}, {
        preserveScroll: true,
        onError: () => {
          alert('Failed to register. Please try again.');
        },
        onFinish: () => {
          setIsLoading(false);
        },
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (isLoading) return;

    const confirmed = confirm('Are you sure you want to unregister from this lesson? Your progress will be lost.');
    if (!confirmed) return;

    setIsLoading(true);

    try {
      await router.delete(`/lessons/${lesson.lesson_id}/unregister`, {
        preserveScroll: true,
        onError: () => {
          alert('Failed to unregister. Please try again.');
        },
        onFinish: () => {
          setIsLoading(false);
        },
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleCompleteLesson = () => {
    if (lessonCompleted) {
      alert('You have already completed this lesson.');
      return;
    }

    if (!contentCompleted) {
      alert('Please review the lesson content first.');
      return;
    }

    if (!allExercisesCompleted || !allTestsPassed) {
      alert('Please complete all exercises and pass all tests first.');
      return;
    }

    setShowCompletionModal(true);
  };

  const journeySteps = [
    {
      key: 'review',
      label: 'Review Content',
      anchor: 'content-section',
      state: contentCompleted ? 'done' : 'ready',
      action: contentCompleted
        ? 'Review complete. Practice is now open.'
        : nextSectionNumber
          ? `Open section ${nextSectionNumber} and keep reading to the end.`
          : contentSignals.contentScrolledToBottom
            ? 'Finish the review checkpoint to unlock practice.'
            : 'Scroll to the end of the lesson content to unlock practice.',
    },
    {
      key: 'practice',
      label: 'Practice',
      anchor: 'exercises-section',
      state: !contentCompleted ? 'locked' : allExercisesCompleted ? 'done' : 'ready',
      action: !contentCompleted
        ? 'Practice unlocks after you review the lesson.'
        : totalExercises === 0
          ? 'No practice tasks are required for this lesson.'
          : allExercisesCompleted
            ? 'Practice complete. You are ready for the checks.'
            : remainingExercises === 1
              ? 'Finish 1 more exercise to unlock the checks.'
              : `Finish ${remainingExercises} more exercises to keep momentum.`,
    },
    {
      key: 'checks',
      label: 'Checks',
      anchor: 'tests-section',
      state: !contentCompleted || (!allExercisesCompleted && totalExercises > 0)
        ? 'locked'
        : allTestsPassed
          ? 'done'
          : 'ready',
      action: !contentCompleted
        ? 'Checks unlock after content review.'
        : !allExercisesCompleted && totalExercises > 0
          ? 'Wrap up practice before the checks open.'
          : totalTests === 0
            ? 'No checks are required for this lesson.'
            : remainingTests === 1
              ? 'Pass 1 check to unlock the reward.'
              : `Pass ${remainingTests} more checks to finish strong.`,
    },
    {
      key: 'reward',
      label: 'Claim Reward',
      anchor: 'registration-card',
      state: lessonCompleted ? 'done' : contentCompleted && allExercisesCompleted && allTestsPassed ? 'ready' : 'locked',
      action: lessonCompleted
        ? `Reward claimed. You earned ${lesson.completion_reward_points} points.`
        : contentCompleted && allExercisesCompleted && allTestsPassed
          ? `Claim your ${lesson.completion_reward_points} point reward.`
          : 'Your reward unlocks after content, practice, and checks are done.',
    },
  ];

  return (
    <StudentLayout>
      <Head title={`${lesson.title} - Lesson`} />

      <div className="max-w-7xl mx-auto space-y-6">
        <button
          onClick={() => router.visit('/lessons')}
          className="inline-flex items-center space-x-2 rounded-lg border border-white/20 bg-black/40 px-4 py-2 text-gray-300 transition-colors hover:bg-black/60 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lessons</span>
        </button>

        <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-2xl backdrop-blur-xl">
          <LessonHeader lesson={lesson} exerciseProgress={guidedPathProgress} />
        </div>

        <LessonJourney steps={journeySteps} onJump={scrollToSection} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div id="content-section">
              <LessonContent
                auth={auth}
                lesson={lesson}
                sections={sections}
                isRegistered={isRegistered}
                contentCompleted={contentCompleted}
                onJourneySignalsChange={setContentSignals}
              />
            </div>

            {isRegistered && exercises.length > 0 && (
              <ExercisesSection
                lesson={lesson}
                exercises={exercises}
                userProgress={userProgress}
                contentCompleted={contentCompleted}
              />
            )}

            {isRegistered && tests.length > 0 && (
              <TestsSection
                lesson={lesson}
                tests={tests}
                userProgress={userProgress}
                passedTests={passedTests}
                totalTests={totalTests}
                contentCompleted={contentCompleted}
                exercisesCompleted={allExercisesCompleted}
                totalExercises={totalExercises}
              />
            )}

            {!isRegistered && isStudent && (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-lg">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">Ready to start this guided lesson?</h3>
                <p className="mx-auto mb-6 max-w-md text-gray-600">
                  Register to unlock the content journey, guided practice, checks, and your completion reward.
                </p>
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'Registering...' : 'Start This Lesson'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6 lg:col-span-1">
            {isStudent && (
              <div id="registration-card">
                <RegistrationCard
                  auth={auth}
                  lesson={lesson}
                  isLoading={isLoading}
                  lessonCompleted={lessonCompleted}
                  completedExercises={completedExercises}
                  totalExercises={totalExercises}
                  passedTests={passedTests}
                  totalTests={totalTests}
                  exerciseProgress={guidedPathProgress}
                  contentCompleted={contentCompleted}
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                  scrollToSection={scrollToSection}
                  onCompleteLesson={handleCompleteLesson}
                />
              </div>
            )}

            <div className="rounded-2xl border border-white/20 bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
              <h3 className="mb-4 text-xl font-bold text-white">Lesson Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white/10 p-3">
                  <span className="font-medium text-gray-300">Status</span>
                  <span className={`font-bold ${lessonCompleted ? 'text-green-400' : 'text-blue-400'}`}>
                    {lessonCompleted ? 'Completed' : lesson.status}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/10 p-3">
                  <span className="font-medium text-gray-300">Duration</span>
                  <span className="font-bold text-white">
                    {lesson.estimated_duration ? `${lesson.estimated_duration} min` : 'Self-paced'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-3">
                  <span className="font-medium text-yellow-300">Reward</span>
                  <span className="text-lg font-bold text-yellow-400">
                    {lesson.completion_reward_points} pts
                  </span>
                </div>
              </div>
            </div>

            {isRegistered && (
              <div className="rounded-2xl border border-white/20 bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
                <h3 className="mb-4 text-xl font-bold text-white">Your Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-300">Practice</span>
                      <span className="font-bold text-white">{completedExercises}/{totalExercises}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-300">Checks</span>
                      <span className="font-bold text-white">{passedTests}/{totalTests}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-500"
                        style={{ width: `${totalTests > 0 ? (passedTests / totalTests) * 100 : 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-300">Guided journey</span>
                      <span className="font-bold text-white">{guidedPathProgress}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                        style={{ width: `${guidedPathProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <LessonCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        lesson={lesson}
        rewardPoints={lesson.completion_reward_points}
        onComplete={() => {}}
      />
    </StudentLayout>
  );
};

export default LessonShow;
