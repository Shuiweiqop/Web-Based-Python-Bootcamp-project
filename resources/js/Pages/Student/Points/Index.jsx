import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import PointsHistory from './Components/PointsHistory';
import PointsStats from './Components/PointsStats';
import EarningTips from './Components/EarningTips';
import { 
  Sparkles, 
  TrendingUp, 
  History,
  Lightbulb,
  ArrowLeft,
  Calendar,
  Filter
} from 'lucide-react';

/**
 * Points Index - 积分历史记录主页
 * 显示积分统计、变动历史和获得积分的提示
 */
export default function Index({ 
  auth,
  currentPoints,
  pointsHistory,
  pointsStats,
  filters
}) {
  const [activeTab, setActiveTab] = useState('history');
  const [timeFilter, setTimeFilter] = useState(filters?.time || 'all');
  const [typeFilter, setTypeFilter] = useState(filters?.type || 'all');

  return (
    <StudentLayout user={auth.user}>
      <Head title="积分中心" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* 顶部导航 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={route('student.profile.show')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">积分中心</h1>
                <p className="text-sm text-gray-600 mt-1">查看你的积分记录和获得提示</p>
              </div>
            </div>
          </div>

          {/* 积分概览卡片 */}
          <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-8 h-8" />
                  <span className="text-lg font-medium opacity-90">当前积分</span>
                </div>
                <div className="text-6xl font-bold mb-4">
                  {currentPoints.toLocaleString()}
                </div>
                <div className="flex items-center gap-6 text-sm opacity-90">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>本周 +{pointsStats?.thisWeek || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>本月 +{pointsStats?.thisMonth || 0}</span>
                  </div>
                </div>
              </div>

              {/* 积分等级 */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-5xl mb-2">{getLevelEmoji(currentPoints)}</div>
                <div className="text-white font-bold text-lg">
                  {getLevelName(currentPoints)}
                </div>
                <div className="text-white/80 text-sm mt-1">
                  {getNextLevelPoints(currentPoints)} 到下一级
                </div>
              </div>
            </div>

            {/* 进度条 */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-white/90 text-sm mb-2">
                <span>升级进度</span>
                <span>{getLevelProgress(currentPoints)}%</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${getLevelProgress(currentPoints)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 统计卡片 */}
          <PointsStats stats={pointsStats} />

          {/* 标签页导航 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <TabButton
                active={activeTab === 'history'}
                onClick={() => setActiveTab('history')}
                icon={History}
                label="积分历史"
              />
              <TabButton
                active={activeTab === 'tips'}
                onClick={() => setActiveTab('tips')}
                icon={Lightbulb}
                label="获得积分"
              />
            </div>

            {/* 标签内容 */}
            <div className="p-6">
              {activeTab === 'history' && (
                <PointsHistory
                  history={pointsHistory}
                  timeFilter={timeFilter}
                  setTimeFilter={setTimeFilter}
                  typeFilter={typeFilter}
                  setTypeFilter={setTypeFilter}
                />
              )}
              
              {activeTab === 'tips' && (
                <EarningTips currentPoints={currentPoints} />
              )}
            </div>
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}

/**
 * TabButton - 标签按钮组件
 */
function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-6 py-3 font-medium transition-all flex-1
        ${active
          ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

/**
 * 获取等级emoji
 */
function getLevelEmoji(points) {
  if (points >= 10000) return '👑';
  if (points >= 5000) return '💎';
  if (points >= 2000) return '⭐';
  if (points >= 500) return '🌟';
  return '🎯';
}

/**
 * 获取等级名称
 */
function getLevelName(points) {
  if (points >= 10000) return 'Expert';
  if (points >= 5000) return 'Advanced';
  if (points >= 2000) return 'Intermediate';
  if (points >= 500) return 'Beginner';
  return 'Newbie';
}

/**
 * 获取到下一级所需积分
 */
function getNextLevelPoints(points) {
  if (points >= 10000) return '已达最高级';
  if (points >= 5000) return (10000 - points).toLocaleString();
  if (points >= 2000) return (5000 - points).toLocaleString();
  if (points >= 500) return (2000 - points).toLocaleString();
  return (500 - points).toLocaleString();
}

/**
 * 获取升级进度百分比
 */
function getLevelProgress(points) {
  if (points >= 10000) return 100;
  if (points >= 5000) return Math.round(((points - 5000) / 5000) * 100);
  if (points >= 2000) return Math.round(((points - 2000) / 3000) * 100);
  if (points >= 500) return Math.round(((points - 500) / 1500) * 100);
  return Math.round((points / 500) * 100);
}