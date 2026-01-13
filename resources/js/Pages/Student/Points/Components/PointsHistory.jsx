import React from 'react';
import { router } from '@inertiajs/react';
import { 
  Plus, 
  Minus, 
  Calendar,
  Filter,
  Search,
  ChevronRight
} from 'lucide-react';

/**
 * PointsHistory - 积分变动历史组件
 * 显示所有积分获得和使用的详细记录
 */
export default function PointsHistory({ 
  history,
  timeFilter,
  setTimeFilter,
  typeFilter,
  setTypeFilter
}) {
  const handleFilterChange = () => {
    router.get(route('student.points.index'), {
      time: timeFilter,
      type: typeFilter,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 时间筛选 */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">全部时间</option>
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="year">本年</option>
          </select>
        </div>

        {/* 类型筛选 */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">全部类型</option>
            <option value="earned">获得积分</option>
            <option value="spent">使用积分</option>
          </select>
        </div>

        {/* 应用筛选按钮 */}
        <button
          onClick={handleFilterChange}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          应用筛选
        </button>

        {/* 重置按钮 */}
        {(timeFilter !== 'all' || typeFilter !== 'all') && (
          <button
            onClick={() => {
              setTimeFilter('all');
              setTypeFilter('all');
              router.get(route('student.points.index'));
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            重置
          </button>
        )}
      </div>

      {/* 历史记录列表 */}
      {history && history.length > 0 ? (
        <div className="space-y-3">
          {history.map((record) => (
            <HistoryCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

/**
 * HistoryCard - 历史记录卡片
 */
function HistoryCard({ record }) {
  const isEarned = record.type === 'earned';
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        {/* 左侧：图标和信息 */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* 图标 */}
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
            ${isEarned 
              ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300' 
              : 'bg-gradient-to-br from-red-50 to-orange-100 border-2 border-red-300'
            }
          `}>
            {isEarned ? (
              <Plus className="w-6 h-6 text-green-600" />
            ) : (
              <Minus className="w-6 h-6 text-red-600" />
            )}
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getSourceEmoji(record.source)}</span>
              <p className="font-semibold text-gray-900 truncate">
                {record.description}
              </p>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{record.created_at}</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                {getSourceLabel(record.source)}
              </span>
              {record.reference && (
                <span className="text-gray-400">
                  #{record.reference}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：积分变动 */}
        <div className="flex-shrink-0 text-right ml-4">
          <div className={`
            text-2xl font-bold
            ${isEarned ? 'text-green-600' : 'text-red-600'}
          `}>
            {isEarned ? '+' : '-'}{record.points.toLocaleString()}
          </div>
          {record.balance !== undefined && (
            <div className="text-xs text-gray-500 mt-1">
              余额: {record.balance.toLocaleString()}
            </div>
          )}
        </div>

        {/* 详情箭头 */}
        {record.details_url && (
          <button
            onClick={() => window.location.href = record.details_url}
            className="ml-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * EmptyState - 空状态
 */
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Search className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        暂无积分记录
      </h3>
      <p className="text-gray-600 text-sm mb-6">
        完成学习任务开始获得积分吧！
      </p>
      <a
        href="/lessons"
        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
      >
        开始学习
        <ChevronRight className="w-4 h-4" />
      </a>
    </div>
  );
}

/**
 * 获取积分来源标签
 */
function getSourceLabel(source) {
  const labels = {
    test_completion: '完成测验',
    test_perfect: '满分测验',
    exercise_completion: '完成练习',
    lesson_completion: '完成课程',
    daily_streak: '每日连续',
    weekly_streak: '每周连续',
    achievement: '解锁成就',
    reward_purchase: '购买奖励',
    bonus: '额外奖励',
    admin_adjust: '系统调整',
  };
  return labels[source] || source;
}

/**
 * 获取积分来源emoji
 */
function getSourceEmoji(source) {
  const emojis = {
    test_completion: '📝',
    test_perfect: '🎯',
    exercise_completion: '✏️',
    lesson_completion: '📚',
    daily_streak: '🔥',
    weekly_streak: '⚡',
    achievement: '🏆',
    reward_purchase: '🎁',
    bonus: '💰',
    admin_adjust: '⚙️',
  };
  return emojis[source] || '⭐';
}