import React from 'react';
import { ClockIcon, TrophyIcon } from '@heroicons/react/24/outline';

// 适配 Inertia.js 的组件 - 可放在 resources/js/Components/Games/

/**
 * 游戏状态面板 - 显示分数、时间等信息
 * @param {number} currentScore - 当前分数
 * @param {number} maxScore - 最大分数
 * @param {string} formattedTime - 格式化的时间字符串
 * @param {boolean} isTimeUp - 是否时间到
 * @param {boolean} hasTimeLimit - 是否有时间限制
 * @param {string} className - 自定义样式类
 */
const GameStatusPanel = ({
  currentScore = 0,
  maxScore = 100,
  formattedTime = "0:00",
  isTimeUp = false,
  hasTimeLimit = true,
  className = "",
}) => {
  const scorePercentage = Math.round((currentScore / maxScore) * 100);
  
  // 根据分数百分比确定颜色
  const getScoreColor = () => {
    if (scorePercentage >= 80) return 'text-green-600';
    if (scorePercentage >= 60) return 'text-yellow-600';
    return 'text-blue-600';
  };

  // 根据时间状态确定时间颜色
  const getTimeColor = () => {
    if (isTimeUp) return 'text-red-600';
    if (formattedTime.startsWith('0:') && parseInt(formattedTime.split(':')[1]) <= 30) {
      return 'text-orange-600';
    }
    return 'text-blue-600';
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 min-w-[200px] ${className}`}>
      <div className="text-center">
        {/* 分数显示 */}
        <div className="mb-4">
          <div className={`text-2xl font-bold mb-1 ${getScoreColor()}`}>
            {currentScore}/{maxScore}
          </div>
          <div className="text-sm text-gray-600 mb-2">Score</div>
          
          {/* 分数进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">{scorePercentage}%</div>
        </div>
        
        {/* 时间显示 */}
        {hasTimeLimit && (
          <div className={`flex items-center justify-center gap-2 ${getTimeColor()}`}>
            <ClockIcon className="w-4 h-4" />
            {isTimeUp ? (
              <span className="font-semibold">Time's Up!</span>
            ) : (
              <span className="font-mono font-bold">{formattedTime}</span>
            )}
          </div>
        )}

        {/* 完成状态 */}
        {currentScore === maxScore && (
          <div className="mt-3 flex items-center justify-center gap-2 text-green-600">
            <TrophyIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">Perfect!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStatusPanel;