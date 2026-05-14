import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import ProfileHeader from './Components/ProfileHeader';
import ProfileCustomizer from './Components/ProfileCustomizer';
import { ArrowLeft, Save, Eye, Package } from 'lucide-react';

/**
 * Profile Edit – Profile customization page
 * Allows users to equip or unequip rewards to customize their profile
 */
export default function Edit({ 
  auth,
  user,
  profile,
  equipped,
  inventory,
  current_points 
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Equip reward
  const handleEquip = (inventoryId) => {
    setIsSaving(true);
    router.post(route('student.inventory.equip', inventoryId), {}, {
      preserveScroll: true,
      onFinish: () => setIsSaving(false),
    });
  };

  // Unequip reward
  const handleUnequip = (inventoryId) => {
    setIsSaving(true);
    router.post(route('student.inventory.unequip', inventoryId), {}, {
      preserveScroll: true,
      onFinish: () => setIsSaving(false),
    });
  };

  // Calculate inventory statistics
  const inventoryStats = {
    total: Object.values(inventory).reduce((sum, items) => sum + items.length, 0),
    byType: Object.entries(inventory).reduce((acc, [type, items]) => {
      acc[type] = items.length;
      return acc;
    }, {}),
  };

  return (
    <StudentLayout user={auth.user}>
      <Head title="Customize Profile" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Top navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/student/profile"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Profile
              </Link>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <h1 className="text-2xl font-bold text-gray-900">
                Customize Profile
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-5 h-5" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </div>

          {/* Live preview */}
          {showPreview && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Live Preview
                </h2>
                <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full">
                  This is how others will see your profile
                </span>
              </div>
              <ProfileHeader
                user={user}
                profile={profile}
                equipped={equipped}
                showEditButton={false}
              />
            </div>
          )}

          {/* Inventory statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    My Inventory
                  </h2>
                  <p className="text-sm text-gray-600">
                    Total {inventoryStats.total} rewards
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <StatBadge
                  label="Avatar Frames"
                  count={inventoryStats.byType.avatar_frame || 0}
                  icon="🖼️"
                />
                <StatBadge
                  label="Backgrounds"
                  count={inventoryStats.byType.profile_background || 0}
                  icon="🎨"
                />
                <StatBadge
                  label="Titles"
                  count={inventoryStats.byType.title || 0}
                  icon="👑"
                />
                <StatBadge
                  label="Badges"
                  count={inventoryStats.byType.badge || 0}
                  icon="🏅"
                />
              </div>
            </div>
          </div>

          {/* Profile customizer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ProfileCustomizer
              inventory={inventory}
              equipped={equipped}
              onEquip={handleEquip}
              onUnequip={handleUnequip}
            />
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">💡</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Tips
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You can equip one avatar frame, background, and title at the same time</li>
                  <li>• Multiple badges can be equipped and will appear on your profile</li>
                  <li>• Equipped rewards are shown on leaderboards and comments</li>
                  <li>
                    • Want more rewards? Visit the{' '}
                    <Link href={route('student.rewards.index')} className="font-semibold underline">
                      Reward Shop
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200 sticky bottom-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Current Points:</span>
              <span className="font-bold text-blue-600 text-lg">
                {current_points?.toLocaleString()}
              </span>
            </div>

            <div className="flex gap-3">
              <Link
                href={route('student.rewards.index')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Go to Shop
              </Link>
              <Link
                href="/student/profile"
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Done
              </Link>
            </div>
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}

/**
 * StatBadge – Inventory statistic badge
 */
function StatBadge({ label, count, icon }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
      <span className="text-lg">{icon}</span>
      <div className="text-left">
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-sm font-bold text-gray-900">{count}</p>
      </div>
    </div>
  );
}

/**
 * EditSkeleton – Loading skeleton
 */
export function EditSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 bg-gray-200 rounded w-64" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
      <div className="h-32 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="aspect-square bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
