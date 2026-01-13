import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { cn } from '@/utils/cn';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Key,
  Edit,
  Trash2,
  Check,
  X,
  Trophy,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Show({ student }) {
  const [isDark, setIsDark] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    window.addEventListener('theme-changed', checkDarkMode);
    
    return () => window.removeEventListener('theme-changed', checkDarkMode);
  }, []);

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    if (confirm(`Are you sure you want to reset password for ${student.name}?`)) {
      router.post(route('admin.students.reset-password', student.user_Id), {
        password: newPassword,
      }, {
        preserveScroll: true,
        onSuccess: () => {
          setShowResetPassword(false);
          setNewPassword('');
          setConfirmPassword('');
        },
      });
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
      router.delete(route('admin.students.destroy', student.user_Id), {
        onSuccess: () => {
          router.visit(route('admin.students.index'));
        },
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const InfoCard = ({ icon: Icon, label, value, iconColor }) => (
    <div className={cn(
      "p-4 rounded-xl border transition-all",
      isDark
        ? "glassmorphism-enhanced border-white/10"
        : "bg-white border-purple-200 shadow-sm"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isDark ? "bg-white/10" : "bg-purple-100"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            iconColor || (isDark ? "text-cyan-400" : "text-purple-600")
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-xs mb-1",
            isDark ? "text-slate-400" : "text-slate-600"
          )}>
            {label}
          </p>
          <p className={cn(
            "font-medium truncate",
            isDark ? "text-white" : "text-slate-900"
          )}>
            {value || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={route('admin.students.index')}
              className={cn(
                "p-2 rounded-lg transition-all ripple-effect",
                isDark
                  ? "hover:bg-white/10 text-slate-400"
                  : "hover:bg-purple-100 text-slate-600"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold mb-2">Student Details</h1>
              <p className={cn(
                "text-sm",
                isDark ? "text-slate-400" : "text-slate-600"
              )}>
                View and manage student information
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={route('admin.students.edit', student.user_Id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all ripple-effect",
                isDark
                  ? "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                  : "bg-white border border-purple-200 text-slate-700 hover:bg-purple-50"
              )}
            >
              <Edit className="w-4 h-4" />
              <span className="font-medium">Edit</span>
            </Link>
            <button
              onClick={handleDelete}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all ripple-effect",
                isDark
                  ? "bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
                  : "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
              )}
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">Delete</span>
            </button>
          </div>
        </div>
      }
    >
      <Head title={`${student.name} - Student Details`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
        {/* Main Info Card */}
        <div className="lg:col-span-2">
          <div className={cn(
            "rounded-xl border overflow-hidden",
            isDark
              ? "glassmorphism-enhanced border-white/10"
              : "bg-white border-purple-200 shadow-sm"
          )}>
            {/* Header */}
            <div className={cn(
              "p-6 border-b",
              isDark
                ? "border-white/10 bg-gradient-to-r from-purple-500/10 to-cyan-500/10"
                : "border-purple-200 bg-gradient-to-r from-purple-50 to-cyan-50"
            )}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {student.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className={cn(
                    "text-2xl font-bold mb-1",
                    isDark ? "text-white" : "text-slate-900"
                  )}>
                    {student.name}
                  </h2>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-slate-400" : "text-slate-600"
                  )}>
                    Student ID: {student.user_Id}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="p-6">
              <h3 className={cn(
                "text-lg font-bold mb-4",
                isDark ? "text-white" : "text-slate-900"
              )}>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  icon={User}
                  label="Full Name"
                  value={student.name}
                />
                <InfoCard
                  icon={Mail}
                  label="Email Address"
                  value={student.email}
                />
                <InfoCard
                  icon={Phone}
                  label="Phone Number"
                  value={student.phone_number || 'Not provided'}
                />
                <InfoCard
                  icon={Calendar}
                  label="Joined Date"
                  value={formatDate(student.created_at)}
                />
              </div>
            </div>

            {/* Account Status */}
            <div className={cn(
              "p-6 border-t",
              isDark ? "border-white/10" : "border-purple-200"
            )}>
              <h3 className={cn(
                "text-lg font-bold mb-4",
                isDark ? "text-white" : "text-slate-900"
              )}>
                Account Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={cn(
                  "p-4 rounded-xl border",
                  isDark
                    ? "glassmorphism-enhanced border-white/10"
                    : "bg-gray-50 border-purple-200"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-slate-400" : "text-slate-600"
                    )}>
                      Email Verification
                    </span>
                    {student.email_verified_at ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <p className={cn(
                    "font-semibold",
                    student.email_verified_at
                      ? "text-green-500"
                      : "text-red-500"
                  )}>
                    {student.email_verified_at ? 'Verified' : 'Unverified'}
                  </p>
                  {student.email_verified_at && (
                    <p className={cn(
                      "text-xs mt-1",
                      isDark ? "text-slate-400" : "text-slate-600"
                    )}>
                      {formatDate(student.email_verified_at)}
                    </p>
                  )}
                </div>

                <div className={cn(
                  "p-4 rounded-xl border",
                  isDark
                    ? "glassmorphism-enhanced border-white/10"
                    : "bg-gray-50 border-purple-200"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-slate-400" : "text-slate-600"
                    )}>
                      Account Role
                    </span>
                    <Shield className={cn(
                      "w-5 h-5",
                      isDark ? "text-cyan-400" : "text-purple-600"
                    )} />
                  </div>
                  <p className={cn(
                    "font-semibold capitalize",
                    isDark ? "text-white" : "text-slate-900"
                  )}>
                    {student.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Password Management */}
            <div className={cn(
              "p-6 border-t",
              isDark ? "border-white/10" : "border-purple-200"
            )}>
              <h3 className={cn(
                "text-lg font-bold mb-4",
                isDark ? "text-white" : "text-slate-900"
              )}>
                Password Management
              </h3>

              {!showResetPassword ? (
                <button
                  onClick={() => setShowResetPassword(true)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all ripple-effect",
                    isDark
                      ? "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                      : "bg-gray-100 border border-purple-200 text-slate-700 hover:bg-purple-50"
                  )}
                >
                  <Key className="w-4 h-4" />
                  <span className="font-medium">Reset Password</span>
                </button>
              ) : (
                <div className={cn(
                  "p-4 rounded-xl border space-y-4",
                  isDark
                    ? "glassmorphism-enhanced border-white/10"
                    : "bg-gray-50 border-purple-200"
                )}>
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-2",
                      isDark ? "text-slate-300" : "text-slate-700"
                    )}>
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={cn(
                          "w-full px-4 py-2 pr-10 rounded-lg transition-all focus:outline-none",
                          isDark
                            ? "bg-white/5 border border-white/10 text-white focus:border-cyan-400/50"
                            : "bg-white border border-purple-200 text-slate-900 focus:border-purple-400"
                        )}
                        placeholder="Enter new password (min. 8 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-2",
                      isDark ? "text-slate-300" : "text-slate-700"
                    )}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={cn(
                          "w-full px-4 py-2 pr-10 rounded-lg transition-all focus:outline-none",
                          isDark
                            ? "bg-white/5 border border-white/10 text-white focus:border-cyan-400/50"
                            : "bg-white border border-purple-200 text-slate-900 focus:border-purple-400"
                        )}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(false);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-lg font-medium transition-all ripple-effect",
                        isDark
                          ? "bg-white/5 text-slate-300 hover:bg-white/10"
                          : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                      )}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={!newPassword || !confirmPassword}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-lg font-medium transition-all ripple-effect",
                        newPassword && confirmPassword
                          ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/50"
                          : isDark
                            ? "bg-white/5 text-slate-600 cursor-not-allowed"
                            : "bg-gray-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Student Stats */}
        <div className="space-y-6">
          {/* Points Card */}
          <div className={cn(
            "rounded-xl border overflow-hidden",
            isDark
              ? "glassmorphism-enhanced border-white/10"
              : "bg-white border-purple-200 shadow-sm"
          )}>
            <div className={cn(
              "p-6 border-b",
              isDark
                ? "border-white/10 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"
                : "border-purple-200 bg-gradient-to-r from-yellow-50 to-orange-50"
            )}>
              <h3 className={cn(
                "text-lg font-bold mb-4",
                isDark ? "text-white" : "text-slate-900"
              )}>
                Student Progress
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm",
                    isDark ? "text-slate-400" : "text-slate-600"
                  )}>
                    Total Points
                  </span>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className={cn(
                      "text-lg font-bold",
                      isDark ? "text-white" : "text-slate-900"
                    )}>
                      {(student.student_profile?.current_points || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {student.student_profile?.streak_days > 0 && (
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-slate-400" : "text-slate-600"
                    )}>
                      Current Streak
                    </span>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className={cn(
                        "text-lg font-bold",
                        isDark ? "text-white" : "text-slate-900"
                      )}>
                        {student.student_profile.streak_days} days
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={cn(
            "rounded-xl border overflow-hidden",
            isDark
              ? "glassmorphism-enhanced border-white/10"
              : "bg-white border-purple-200 shadow-sm"
          )}>
            <div className="p-6">
              <h3 className={cn(
                "text-lg font-bold mb-4",
                isDark ? "text-white" : "text-slate-900"
              )}>
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href={route('admin.students.edit', student.user_Id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all ripple-effect w-full",
                    isDark
                      ? "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                      : "bg-gray-50 border border-purple-200 text-slate-700 hover:bg-purple-50"
                  )}
                >
                  <Edit className="w-4 h-4" />
                  <span className="font-medium">Edit Information</span>
                </Link>
                <button
                  onClick={() => setShowResetPassword(true)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all ripple-effect w-full",
                    isDark
                      ? "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                      : "bg-gray-50 border border-purple-200 text-slate-700 hover:bg-purple-50"
                  )}
                >
                  <Key className="w-4 h-4" />
                  <span className="font-medium">Reset Password</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}