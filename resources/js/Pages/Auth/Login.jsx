import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, AlertCircle, UserPlus, ArrowRight } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Login({ canResetPassword, status }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    router.post(route('login'), 
      { email, password, remember },
      {
        onError: (errs) => {
          setErrors(errs);
          setIsLoading(false);
        },
        onSuccess: () => {
          console.log('Login successful');
        },
        onFinish: () => {
          setIsLoading(false);
        }
      }
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - Same as StudentLayout */}
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
              Welcome Back
            </h1>
            <p className="text-gray-100 drop-shadow-lg text-lg">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Login Card - Same style as StudentLayout cards */}
          <div className="bg-black/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            
            {/* Status Message */}
            {status && (
              <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-b border-green-500/30 animate-slideDown">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-green-300 drop-shadow-lg">{status}</p>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {(errors.email || errors.password) && (
              <div className="p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-b border-red-500/30 animate-slideDown">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-300 mb-1 drop-shadow-lg">Login Failed</p>
                    <p className="text-sm text-red-400 drop-shadow-lg">Please check your credentials and try again.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    autoFocus
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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
                    placeholder="Enter your password"
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
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 
                             checked:bg-gradient-to-br checked:from-blue-500 checked:to-purple-600
                             focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                  />
                  <span className="text-sm text-white group-hover:text-purple-300 transition-colors font-medium drop-shadow-lg">
                    Remember me
                  </span>
                </label>
                
                {canResetPassword && (
                  <a
                    href={route('password.request')}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-semibold"
                  >
                    Forgot password?
                  </a>
                )}
              </div>

              {/* Login Button - Same gradient as StudentLayout */}
              <button
                type="submit"
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
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Log In</span>
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
                    New to LearnHub?
                  </span>
                </div>
              </div>

              {/* Register Link */}
              <a
                href={route('register')}
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
                <UserPlus className="w-5 h-5 drop-shadow-lg" />
                <span className="drop-shadow-lg">Create Account</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform drop-shadow-lg" />
              </a>
            </form>

            {/* Security Notice - Same style as StudentLayout cards */}
            <div className="px-8 pb-8">
              <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-blue-500/40">
                    <Lock className="w-5 h-5 text-purple-300 drop-shadow-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-2 drop-shadow-lg">Security Notice</p>
                    <ul className="space-y-2 text-xs text-gray-300">
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-400 mt-0.5 font-bold">•</span>
                        <span className="font-medium drop-shadow-lg">Account locked after 5 failed attempts</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-400 mt-0.5 font-bold">•</span>
                        <span className="font-medium drop-shadow-lg">Email verification required</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-400 mt-0.5 font-bold">•</span>
                        <span className="font-medium drop-shadow-lg">Use strong password (8+ characters)</span>
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
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}