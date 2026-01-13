import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Mail, Lock, Eye, EyeOff, UserPlus, Sparkles, AlertCircle, User, ArrowRight, LogIn, Shield, CheckCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    }
  });

  // Password strength checker
  useEffect(() => {
    const password = formData.password;
    
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&#]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    let label = '';
    let color = '';

    if (score === 0) {
      label = '';
      color = '';
    } else if (score <= 2) {
      label = 'Weak';
      color = 'bg-red-500';
    } else if (score <= 3) {
      label = 'Fair';
      color = 'bg-yellow-500';
    } else if (score <= 4) {
      label = 'Good';
      color = 'bg-blue-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }

    setPasswordStrength({ score, label, color, requirements });
  }, [formData.password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    router.post(route('register'), formData, {
      onError: (errs) => {
        setErrors(errs);
        setIsLoading(false);
      },
      onSuccess: () => {
        console.log('Registration successful');
      },
      onFinish: () => {
        setIsLoading(false);
      }
    });
  };

  const passwordsMatch = formData.password_confirmation && formData.password === formData.password_confirmation;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - Same as Login */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl animate-float">
              <Sparkles className="w-10 h-10 text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Join LearnHub
            </h1>
            <p className="text-gray-100 drop-shadow-lg text-lg">
              Create your account and start learning today
            </p>
          </div>

          {/* Register Card */}
          <div className="bg-black/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            
            {/* Form */}
            <div onSubmit={handleSubmit} className="p-8">
              
              {/* Name Field */}
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-semibold text-white mb-2 drop-shadow-lg">
                  Username
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-purple-400 transition-colors drop-shadow-lg z-10" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    autoComplete="name"
                    className={`
                      w-full pl-12 pr-4 py-4
                      bg-white/10 border-2 rounded-xl
                      text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-purple-500/50
                      transition-all duration-200
                      ${errors.name ? 'border-red-500/50' : 'border-white/20 focus:border-purple-500/50'}
                      backdrop-blur-sm
                      font-medium text-base
                      shadow-lg
                    `}
                    placeholder="Choose a username"
                    autoFocus
                    required
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.name}</span>
                  </p>
                )}
                {formData.name && !errors.name && (
                  <p className="mt-2 text-xs text-green-400 flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Username looks good (3-50 characters)</span>
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2 drop-shadow-lg">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-purple-400 transition-colors drop-shadow-lg z-10" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    autoComplete="username"
                    className={`
                      w-full pl-12 pr-4 py-4
                      bg-white/10 border-2 rounded-xl
                      text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-purple-500/50
                      transition-all duration-200
                      ${errors.email ? 'border-red-500/50' : 'border-white/20 focus:border-purple-500/50'}
                      backdrop-blur-sm
                      font-medium text-base
                      shadow-lg
                    `}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2 drop-shadow-lg">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-purple-400 transition-colors drop-shadow-lg z-10" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    autoComplete="new-password"
                    className={`
                      w-full pl-12 pr-12 py-4
                      bg-white/10 border-2 rounded-xl
                      text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-purple-500/50
                      transition-all duration-200
                      ${errors.password ? 'border-red-500/50' : 'border-white/20 focus:border-purple-500/50'}
                      backdrop-blur-sm
                      font-medium text-base
                      shadow-lg
                    `}
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-purple-400 transition-colors z-10 drop-shadow-lg"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </p>
                )}

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-200 drop-shadow-lg">Password Strength:</span>
                      <span className={`text-xs font-bold drop-shadow-lg ${
                        passwordStrength.score <= 2 ? 'text-red-400' :
                        passwordStrength.score <= 3 ? 'text-yellow-400' :
                        passwordStrength.score <= 4 ? 'text-blue-400' :
                        'text-green-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength.score
                              ? passwordStrength.color
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Password Requirements */}
                    <div className="space-y-1.5">
                      <RequirementItem
                        met={passwordStrength.requirements.length}
                        text="At least 8 characters"
                      />
                      <RequirementItem
                        met={passwordStrength.requirements.uppercase}
                        text="One uppercase letter (A-Z)"
                      />
                      <RequirementItem
                        met={passwordStrength.requirements.lowercase}
                        text="One lowercase letter (a-z)"
                      />
                      <RequirementItem
                        met={passwordStrength.requirements.number}
                        text="One number (0-9)"
                      />
                      <RequirementItem
                        met={passwordStrength.requirements.special}
                        text="One special character (@$!%*?&#)"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Password Confirmation Field */}
              <div className="mb-6">
                <label htmlFor="password_confirmation" className="block text-sm font-semibold text-white mb-2 drop-shadow-lg">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-purple-400 transition-colors drop-shadow-lg z-10" />
                  <input
                    id="password_confirmation"
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                    autoComplete="new-password"
                    className={`
                      w-full pl-12 pr-12 py-4
                      bg-white/10 border-2 rounded-xl
                      text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-purple-500/50
                      transition-all duration-200
                      ${errors.password_confirmation ? 'border-red-500/50' : 
                        passwordsMatch ? 'border-green-500/50' : 'border-white/20 focus:border-purple-500/50'}
                      backdrop-blur-sm
                      font-medium text-base
                      shadow-lg
                    `}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-purple-400 transition-colors z-10 drop-shadow-lg"
                  >
                    {showPasswordConfirmation ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password_confirmation}</span>
                  </p>
                )}
                {passwordsMatch && (
                  <p className="mt-2 text-sm text-green-400 flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Passwords match</span>
                  </p>
                )}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="
                  w-full py-4 rounded-xl font-bold text-white text-lg
                  bg-gradient-to-r from-blue-500 to-purple-600
                  hover:from-blue-600 hover:to-purple-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-xl hover:shadow-2xl
                  transition-all duration-200
                  hover:scale-105 active:scale-95
                  flex items-center justify-center space-x-2
                  relative overflow-hidden
                  group
                  border border-white/30
                "
              >
                <span className="relative z-10 flex items-center space-x-2 drop-shadow-lg">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                
                {/* Button shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                              translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black/70 text-gray-300 font-medium drop-shadow-lg">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <a
                href={route('login')}
                className="
                  w-full py-4 rounded-xl font-bold text-lg
                  bg-white/10 hover:bg-white/15
                  border-2 border-white/20 hover:border-white/30
                  text-white
                  transition-all duration-200
                  hover:scale-105 active:scale-95
                  flex items-center justify-center space-x-2
                  group
                  shadow-lg
                  block
                "
              >
                <LogIn className="w-5 h-5 drop-shadow-lg" />
                <span className="drop-shadow-lg">Sign In Instead</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform drop-shadow-lg" />
              </a>
            </div>

            {/* Security Notice */}
            <div className="px-8 pb-8">
              <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-blue-500/40">
                    <Shield className="w-5 h-5 text-purple-300 drop-shadow-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-2 drop-shadow-lg">Account Security</p>
                    <ul className="space-y-2 text-xs text-gray-300">
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-400 mt-0.5 font-bold">•</span>
                        <span className="font-medium drop-shadow-lg">Choose a unique username (cannot be changed)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-400 mt-0.5 font-bold">•</span>
                        <span className="font-medium drop-shadow-lg">Email verification required</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-400 mt-0.5 font-bold">•</span>
                        <span className="font-medium drop-shadow-lg">Your data is encrypted and secure</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-300 font-medium drop-shadow-lg">
              Protected by enterprise-grade security • <a href="/terms" className="text-purple-400 hover:text-purple-300">Terms</a> • <a href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy</a>
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Helper component for password requirements
function RequirementItem({ met, text }) {
  return (
    <div className={`flex items-center text-xs transition-colors ${met ? 'text-green-400' : 'text-gray-400'}`}>
      {met ? (
        <CheckCircle className="w-3.5 h-3.5 mr-2 flex-shrink-0 drop-shadow-lg" />
      ) : (
        <div className="w-3.5 h-3.5 mr-2 flex-shrink-0 rounded-full border border-gray-400" />
      )}
      <span className="font-medium drop-shadow-lg">{text}</span>
    </div>
  );
}