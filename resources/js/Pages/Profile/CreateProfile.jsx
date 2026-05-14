import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function CreateProfile() {
  return (
    <StudentLayout>
      <Head title="Student Profile Required" />

      <div className="mx-auto max-w-2xl rounded-2xl border border-white/20 bg-black/50 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl">
          <UserPlus className="h-8 w-8" />
        </div>

        <h1 className="text-3xl font-bold text-white">Student Profile Needed</h1>
        <p className="mt-3 text-gray-300">
          Your account does not have a student profile yet. Please return to the dashboard so the system can refresh your account setup.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={route('dashboard')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition hover:from-blue-700 hover:to-purple-700"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={route('profile.edit')}
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-gray-200 transition hover:bg-white/10"
          >
            Account Settings
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
