import { useState, useCallback } from 'react';

/**
 * 分数管理 Hook - 处理游戏分数逻辑
 * @param {number} maxScore - 最大分数
 * @param {function} onScoreChange - 分数变化回调
 */
export const useScore = (maxScore = 100, onScoreChange = null) => {
  const [currentScore, setCurrentScore] = useState(0);
  const [scoreHistory, setScoreHistory] = useState([]);

  // 更新分数
  const updateScore = useCallback((newScore) => {
    const clampedScore = Math.max(0, Math.min(newScore, maxScore));
    setCurrentScore(clampedScore);
    setScoreHistory(prev => [...prev, { score: clampedScore, timestamp: Date.now() }]);
    
    if (onScoreChange) {
      onScoreChange(clampedScore);
    }
  }, [maxScore, onScoreChange]);

  // 增加分数
  const addScore = useCallback((points) => {
    updateScore(currentScore + points);
  }, [currentScore, updateScore]);

  // 减少分数
  const subtractScore = useCallback((points) => {
    updateScore(currentScore - points);
  }, [currentScore, updateScore]);

  // 重置分数
  const resetScore = useCallback(() => {
    setCurrentScore(0);
    setScoreHistory([]);
    if (onScoreChange) {
      onScoreChange(0);
    }
  }, [onScoreChange]);

  // 计算分数百分比
  const safeMaxScore = Number(maxScore) || 0;
  const scorePercentage = safeMaxScore > 0
    ? Math.round((currentScore / safeMaxScore) * 100)
    : 0;

  // 分数等级（可用于显示星级等）
  const getScoreRating = () => {
    if (scorePercentage >= 90) return 'excellent';
    if (scorePercentage >= 70) return 'good';
    if (scorePercentage >= 50) return 'fair';
    return 'needs-improvement';
  };

  return {
    currentScore,
    maxScore,
    scorePercentage,
    scoreHistory,
    rating: getScoreRating(),
    updateScore,
    addScore,
    subtractScore,
    resetScore,
    isComplete: currentScore === maxScore,
  };
};
