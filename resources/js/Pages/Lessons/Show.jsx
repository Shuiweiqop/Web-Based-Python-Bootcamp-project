import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
  ArrowLeft, 
  Clock, 
  Award, 
  Play, 
  BookOpen, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User,
  FileText,
  Target,
  Star,
  Video
} from 'lucide-react';

const LessonShow = ({ lesson, auth }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { flash, errors } = usePage().props;

  // Show flash messages
  useEffect(() => {
    if (flash?.success) {
      // You can replace this with a toast notification
      alert(flash.success);
    }
    if (errors?.error) {
      alert(errors.error);
    }
  }, [flash, errors]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🌿';
      case 'advanced': return '🌳';
      default: return '📚';
    }
  };

  const getRegistrationStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRegistrationStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getRegistrationStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Registration Pending';
      case 'approved': return 'Registration Approved';
      case 'rejected': return 'Registration Rejected';
      case 'cancelled': return 'Registration Cancelled';
      default: return '';
    }
  };

  const handleRegister = () => {
    if (!auth?.user) {
      router.visit('/login');
      return;
    }

    // Prevent double requests
    if (isLoading) {
      console.log('Already loading, ignoring request');
      return;
    }

    setIsLoading(true);
    
    const registerUrl = `/lessons/${lesson.lesson_id}/register`;
    console.log('Registering at URL:', registerUrl);
    console.log('Lesson object:', lesson);
    
    router.post(registerUrl, {}, {
      onSuccess: (page) => {
        console.log('Registration successful:', page);
        // Success - page will refresh with updated registration status
      },
      onError: (errors) => {
        console.error('Registration failed with errors:', errors);
        alert('Registration failed. Please try again.');
      },
      onFinish: () => {
        console.log('Registration request finished');
        setIsLoading(false);
      }
    });
  };

  const handleUnregister = () => {
    if (!confirm('Are you sure you want to unregister from this lesson?')) {
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    
    const unregisterUrl = `/lessons/${lesson.lesson_id}/unregister`;
    console.log('Unregistering at URL:', unregisterUrl);
    
    router.delete(unregisterUrl, {
      onSuccess: () => {
        console.log('Unregistration successful');
      },
      onError: (errors) => {
        console.error('Unregistration failed:', errors);
        alert('Unregistration failed. Please try again.');
      },
      onFinish: () => {
        setIsLoading(false);
      }
    });
  };

  const renderRegistrationSection = () => {
    const isStudent = auth?.user?.role === 'student';
    const isRegistered = lesson.is_registered;

    if (!auth?.user) {
      return (
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Ready to Start Learning?</h3>
          <p className="text-blue-700 mb-4">Register for an account to enroll in this lesson and track your progress.</p>
          <button
            onClick={() => router.visit('/login')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <User className="h-5 w-5" />
            Login to Register
          </button>
        </div>
      );
    }

    if (!isStudent) {
      return (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Lesson Overview</h3>
          <p className="text-gray-700">You are viewing this lesson as an administrator.</p>
        </div>
      );
    }

    // Student not registered
    if (!isRegistered) {
      return (
        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Enroll in This Lesson</h3>
          <p className="text-green-700 mb-4">
            Click to instantly register for this lesson and start learning immediately!
          </p>
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Registering...
              </>
            ) : (
              <>
                <BookOpen className="h-5 w-5" />
                Register for This Lesson
              </>
            )}
          </button>
        </div>
      );
    }

    // Student registered
    return (
      <div className="bg-green-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">You're Enrolled!</h3>
        </div>
        <p className="text-green-700 mb-4">
          You are registered for this lesson. Start learning with exercises and tests!
        </p>
        <div className="flex gap-3 mb-4">
          <Link
            href={`/lessons/${lesson.lesson_id}/exercises`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Play className="h-5 w-5" />
            Start Exercises
          </Link>
            <Link
              href={`/lessons/${lesson.lesson_id}/tests`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Target className="h-5 w-5" />
              Take Tests
            </Link>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleUnregister();
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 text-sm"
        >
          {isLoading ? 'Unregistering...' : 'Unregister from Lesson'}
        </button>
      </div>
    );
  };

  return (
    <>
      <Head title={`${lesson.title} - Lesson Details`} />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/lessons"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to All Lessons
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Lesson Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">
                          {getDifficultyIcon(lesson.difficulty)}
                        </span>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getDifficultyColor(lesson.difficulty)} bg-white/90`}>
                          {lesson.difficulty?.charAt(0).toUpperCase() + lesson.difficulty?.slice(1)}
                        </span>
                      </div>
                      <h1 className="text-3xl font-bold text-white mb-2">{lesson.title}</h1>
                      <p className="text-blue-100">Lesson #{lesson.lesson_id}</p>
                    </div>
                  </div>
                </div>

                {/* Lesson Stats */}
                <div className="px-8 py-6 bg-gray-50">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-semibold">
                        {lesson.estimated_duration ? `${lesson.estimated_duration} min` : 'Self-paced'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                        <Award className="h-5 w-5" />
                      </div>
                      <div className="text-sm text-gray-600">Reward</div>
                      <div className="font-semibold">{lesson.completion_reward_points} points</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                        <Star className="h-5 w-5" />
                      </div>
                      <div className="text-sm text-gray-600">Level</div>
                      <div className="font-semibold">{lesson.difficulty}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lesson Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Lesson</h2>
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {lesson.description || 'This lesson will provide you with comprehensive knowledge and practical skills.'}
                  </p>
                </div>
              </div>

              {/* Lesson Content Preview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Interactive Exercises</h3>
                      <p className="text-gray-600 text-sm">
                        Hands-on activities to reinforce your learning
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-lg p-2">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Knowledge Tests</h3>
                      <p className="text-gray-600 text-sm">
                        Assess your understanding with quizzes
                      </p>
                    </div>
                  </div>

                  {lesson.video_url && (
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 rounded-lg p-2">
                        <Video className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Video Content</h3>
                        <p className="text-gray-600 text-sm">
                          Visual learning materials and demonstrations
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-lg p-2">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Progress Tracking</h3>
                      <p className="text-gray-600 text-sm">
                        Monitor your learning journey and achievements
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Registration Section */}
              {renderRegistrationSection()}

              {/* Additional Info */}
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="font-medium">{lesson.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {lesson.estimated_duration ? `${lesson.estimated_duration} min` : 'Self-paced'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reward:</span>
                    <span className="font-medium text-blue-600">{lesson.completion_reward_points} pts</span>
                  </div>
                </div>
              </div>

              {/* My Registrations Link */}
              {auth?.user?.role === 'student' && (
                <div className="mt-6">
                  <Link
                    href="/my-registrations"
                    className="block w-full text-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    View My Registrations
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonShow;