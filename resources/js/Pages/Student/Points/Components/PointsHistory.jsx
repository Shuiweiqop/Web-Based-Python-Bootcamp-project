import React from 'react';
import { router } from '@inertiajs/react';
import {
  Plus,
  Minus,
  Calendar,
  Filter,
  Search,
  ChevronRight,
} from 'lucide-react';

export default function PointsHistory({
  history,
  timeFilter,
  setTimeFilter,
  typeFilter,
  setTypeFilter,
}) {
  const handleFilterChange = () => {
    router.get(
      route('student.profile.points'),
      {
        time: timeFilter,
        type: typeFilter,
      },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="year">This year</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All types</option>
            <option value="earned">Points earned</option>
            <option value="spent">Points spent</option>
          </select>
        </div>

        <button
          onClick={handleFilterChange}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          Apply filters
        </button>

        {(timeFilter !== 'all' || typeFilter !== 'all') && (
          <button
            onClick={() => {
              setTimeFilter('all');
              setTypeFilter('all');
              router.get(route('student.profile.points'));
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

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

function HistoryCard({ record }) {
  const isEarned = record.type === 'earned';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className={`
              flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
              ${
                isEarned
                  ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300'
                  : 'bg-gradient-to-br from-red-50 to-orange-100 border-2 border-red-300'
              }
            `}
          >
            {isEarned ? (
              <Plus className="w-6 h-6 text-green-600" />
            ) : (
              <Minus className="w-6 h-6 text-red-600" />
            )}
          </div>

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
                <span className="text-gray-400">#{record.reference}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 text-right ml-4">
          <div
            className={`
              text-2xl font-bold
              ${isEarned ? 'text-green-600' : 'text-red-600'}
            `}
          >
            {isEarned ? '+' : '-'}
            {record.points.toLocaleString()}
          </div>
          {record.balance !== undefined && (
            <div className="text-xs text-gray-500 mt-1">
              Balance: {record.balance.toLocaleString()}
            </div>
          )}
        </div>

        {record.details_url && (
          <button
            onClick={() => {
              window.location.href = record.details_url;
            }}
            className="ml-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Search className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No points history yet
      </h3>
      <p className="text-gray-600 text-sm mb-6">
        Complete lessons and challenges to start earning points.
      </p>
      <a
        href="/lessons"
        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
      >
        Start learning
        <ChevronRight className="w-4 h-4" />
      </a>
    </div>
  );
}

function getSourceLabel(source) {
  const labels = {
    test_completion: 'Test completed',
    test_perfect: 'Perfect test score',
    exercise_completion: 'Exercise completed',
    lesson_completion: 'Lesson completed',
    daily_streak: 'Daily streak',
    weekly_streak: 'Weekly streak',
    achievement: 'Achievement unlocked',
    reward_purchase: 'Reward purchase',
    bonus: 'Bonus reward',
    admin_adjust: 'System adjustment',
  };

  return labels[source] || source;
}

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
