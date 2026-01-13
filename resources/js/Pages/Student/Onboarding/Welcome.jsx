import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    RocketLaunchIcon, 
    AcademicCapIcon, 
    ChartBarIcon,
    SparklesIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function Welcome({ student }) {
    const features = [
        {
            icon: AcademicCapIcon,
            title: 'Personalized Learning',
            description: 'Get a customized learning path tailored to your current skill level'
        },
        {
            icon: ChartBarIcon,
            title: 'Track Your Progress',
            description: 'Monitor your improvement with detailed analytics and insights'
        },
        {
            icon: SparklesIcon,
            title: 'Smart Recommendations',
            description: 'Receive AI-powered suggestions to optimize your learning journey'
        }
    ];

    const steps = [
        {
            number: 1,
            title: 'Take Placement Test',
            description: 'Quick assessment to determine your current level',
            time: '10-15 mins'
        },
        {
            number: 2,
            title: 'Get Recommendations',
            description: 'Receive personalized learning path suggestions',
            time: 'Instant'
        },
        {
            number: 3,
            title: 'Start Learning',
            description: 'Begin your customized learning journey',
            time: 'Right away'
        }
    ];

    return (
        <>
            <Head title="Welcome to Your Learning Journey" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                                <RocketLaunchIcon className="relative h-20 w-20 text-blue-600" />
                            </div>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Welcome, {student.name}! 👋
                        </h1>
                        
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                            Let's start your personalized learning journey. We'll help you find the perfect path to achieve your goals.
                        </p>

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span>Account created successfully</span>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                                    <feature.icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* How It Works */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                            How It Works
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Connection Lines (hidden on mobile) */}
                            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-purple-200"></div>

                            {steps.map((step, index) => (
                                <div key={index} className="relative text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full text-2xl font-bold mb-4 shadow-lg relative z-10">
                                        {step.number}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        {step.description}
                                    </p>
                                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        {step.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <Link
                            href={route('student.onboarding.start-test')}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <span>Start Placement Test</span>
                            <RocketLaunchIcon className="h-6 w-6" />
                        </Link>

                        <p className="mt-4 text-sm text-gray-500">
                            Want to choose your own path?{' '}
                            <Link 
                                href={route('student.onboarding.skip')} 
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Skip onboarding
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}