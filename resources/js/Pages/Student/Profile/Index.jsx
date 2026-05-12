// resources/js/Pages/Student/Profile/Index.jsx
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout'; 
import CharacterCard from './Components/Dashboard/CharacterCard';
import SectionNavigation from './Components/Dashboard/SectionNavigation';
import OverviewSection from './Components/Dashboard/OverviewSection';
import RewardsSection from './Components/Dashboard/RewardsSection';
import ActivitySection from './Components/Dashboard/ActivitySection';
import LearningPathsSection from './Components/Dashboard/LearningPathsSection';

function Index({ 
  auth,
  user,
  profile,
  equipped,
  stats,
  recent_activity,
  achievements,
  learning_paths: learningPathsFromProps = [],
  learningPaths: learningPathsCamelCase = [],
  inventory,      // ✅ 接收后端传递的 inventory 数据
  rewardTypes     // ✅ 接收后端传递的 rewardTypes 映射
}) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isDark, setIsDark] = useState(true);

  // 监听主题变化
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    updateTheme();
    window.addEventListener('theme-changed', updateTheme);
    return () => window.removeEventListener('theme-changed', updateTheme);
  }, []);

  const recentAchievements = achievements?.filter(a => a.unlocked)?.slice(0, 8) || [];
  const topActivities = [
    ...(recent_activity?.tests?.slice(0, 5) || []),
    ...(recent_activity?.exercises?.slice(0, 5) || [])
  ].slice(0, 6);

  const totalXP = profile.current_points || 0;

  // ✅ 直接使用后端传递的分类数据
  const backgrounds = inventory?.backgrounds || [];
  const avatarFrames = inventory?.avatarFrames || [];
  const titles = inventory?.titles || [];
  const badges = inventory?.badges || [];

  // 智能选择使用哪个版本的 learning paths
  const learningPaths = learningPathsCamelCase.length > 0 
    ? learningPathsCamelCase 
    : learningPathsFromProps;

  return (
    <>
      <Head title="My Profile" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar - Character Card */}
          <aside className="lg:w-80 flex-shrink-0">
            <CharacterCard
              user={user}
              profile={profile}
              equipped={equipped}
              inventoryItems={[...backgrounds, ...avatarFrames, ...titles, ...badges]}
              totalXP={totalXP}
            />
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 space-y-6">
            
            {/* Section Navigation */}
            <SectionNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />

            {/* Dynamic Content */}
            {activeSection === 'overview' && (
              <OverviewSection
                profile={profile}
                stats={stats}
                topActivities={topActivities}
                recentAchievements={recentAchievements}
                inventoryItems={[...backgrounds, ...avatarFrames, ...titles, ...badges]}
                equipped={equipped}
              />
            )}

            {activeSection === 'rewards' && (
              <RewardsSection 
                backgrounds={backgrounds}
                avatarFrames={avatarFrames}
                titles={titles}
                badges={badges}
                equipped={equipped}
                loading={false}
                rewardTypes={rewardTypes}
              />
            )}

            {activeSection === 'activity' && (
              <ActivitySection topActivities={topActivities} />
            )}

            {activeSection === 'paths' && (
              <LearningPathsSection 
                learningPaths={learningPaths}
                profile={profile} 
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

Index.layout = page => <StudentLayout children={page} />;

export default Index;
