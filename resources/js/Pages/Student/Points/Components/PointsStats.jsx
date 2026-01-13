import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Award,
  ShoppingBag,
  Target,
  Zap
} from 'lucide-react';

/**
 * PointsStats - 积分统计组件
 * 显示积分获得、使用、来源分布等统计数据
 */
export default function PointsStats({ stats }) {
  const {
    totalEarned = 0,
    totalSpent = 0,
    thisWeek = 0,
    thisMonth = 0,
    sourceBreakdown = {},
    topSource = null,
  } = stats || {};

  return (
    <div className="space-y-6">
      {/* 主要统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="总获得积分"
          value={totalEarned.toLocaleString()}
          color="green"
          trend="+100%"
        />
        
        <StatCard
          icon={ShoppingBag}
          label="总使用积分"
          value={totalSpent.toLocaleString()}
          color="orange"
        />
        
        <StatCard
          icon={Zap}
          label="本周获得"
          value={thisWeek.toLocaleString()}
          color="blue"
        />
        
        <StatCard
          icon={Target}
          label="本月获得"
          value={thisMonth.toLocaleString()}
          color="purple"
        />
      </div>

      {/* 积分来源分析 */}
      {Object.keys(sourceBreakdown).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            积分来源分析
          </h3>
          
          <div className="space-y-3">
            {Object.entries(sourceBreakdown).map(([source, data]) => (
              <SourceBar
                key={source}
                source={source}
                points={data.points}
                percentage={data.percentage}
                color={getSourceColor(source)}
              />
            ))}
          </div>

          {/* 最佳来源提示 */}
          {topSource && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">
                    你的主要积分来源
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {getSourceLabel(topSource)} - {sourceBreakdown[topSource].points.toLocaleString()} 积分
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 积分使用分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UsageCard
          title="可用积分"
          value={totalEarned - totalSpent}
          icon="💰"
          color="green"
        />
        <UsageCard
          title="使用率"
          value={`${Math.round((totalSpent / totalEarned) * 100)}%`}
          icon="📊"
          color="blue"
        />
      </div>
    </div>
  );
}

/**
 * StatCard - 统计卡片
 */
function StatCard({ icon: Icon, label, value, color, trend }) {
  const colorClasses = {
    green: 'from-green-50 to-emerald-50 border-green-200',
    orange: 'from-orange-50 to-amber-50 border-orange-200',
    blue: 'from-blue-50 to-cyan-50 border-blue-200',
    purple: 'from-purple-50 to-fuchsia-50 border-purple-200',
  };

  const iconColors = {
    green: 'text-green-600',
    orange: 'text-orange-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
  };

  return (
    <div className={`
      bg-gradient-to-br p-5 rounded-xl border-2 shadow-sm
      ${colorClasses[color]}
    `}>
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-6 h-6 ${iconColors[color]}`} />
        {trend && (
          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

/**
 * SourceBar - 积分来源进度条
 */
function SourceBar({ source, points, percentage, color }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{getSourceEmoji(source)}</span>
          <span className="font-medium text-gray-900 text-sm">
            {getSourceLabel(source)}
          </span>
        </div>
        <div className="text-right">
          <span className="font-bold text-gray-900">{points.toLocaleString()}</span>
          <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
        </div>
      </div>
      
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * UsageCard - 使用统计卡片
 */
function UsageCard({ title, value, icon, color }) {
  const colorClasses = {
    green: 'from-green-50 to-emerald-100 border-green-300',
    blue: 'from-blue-50 to-cyan-100 border-blue-300',
  };

  return (
    <div className={`
      bg-gradient-to-br p-6 rounded-xl border-2 shadow-sm
      ${colorClasses[color]}
    `}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

/**
 * 获取积分来源颜色
 */
function getSourceColor(source) {
  const colors = {
    test: 'bg-gradient-to-r from-blue-400 to-blue-600',
    exercise: 'bg-gradient-to-r from-green-400 to-green-600',
    lesson: 'bg-gradient-to-r from-purple-400 to-purple-600',
    streak: 'bg-gradient-to-r from-orange-400 to-orange-600',
    achievement: 'bg-gradient-to-r from-pink-400 to-pink-600',
    bonus: 'bg-gradient-to-r from-amber-400 to-amber-600',
  };
  return colors[source] || 'bg-gradient-to-r from-gray-400 to-gray-600';
}

/**
 * 获取积分来源标签
 */
function getSourceLabel(source) {
  const labels = {
    test: '完成测验',
    exercise: '完成练习',
    lesson: '完成课程',
    streak: '连续学习',
    achievement: '解锁成就',
    bonus: '额外奖励',
  };
  return labels[source] || source;
}

/**
 * 获取积分来源emoji
 */
function getSourceEmoji(source) {
  const emojis = {
    test: '📝',
    exercise: '✏️',
    lesson: '📚',
    streak: '🔥',
    achievement: '🏆',
    bonus: '🎁',
  };
  return emojis[source] || '⭐';
}