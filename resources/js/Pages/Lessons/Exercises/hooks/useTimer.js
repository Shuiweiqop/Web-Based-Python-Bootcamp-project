import { useState, useEffect, useRef } from 'react';

/**
 * 倒计时 Hook - 处理游戏计时逻辑
 * @param {number} initialTime - 初始时间（秒）
 * @param {boolean} isActive - 是否激活计时器
 * @param {function} onTimeUp - 时间到时的回调
 */
export const useTimer = (initialTime = 0, isActive = false, onTimeUp = null) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 开始计时
  const start = () => {
    setIsRunning(true);
  };

  // 暂停计时
  const pause = () => {
    setIsRunning(false);
  };

  // 重置计时器
  const reset = (newTime = initialTime) => {
    setTimeLeft(newTime);
    setIsRunning(false);
  };

  // 计时逻辑
  useEffect(() => {
    if (isActive && isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isRunning, timeLeft, onTimeUp]);

  return {
    timeLeft,
    isRunning,
    isTimeUp: timeLeft === 0,
    formattedTime: formatTime(timeLeft),
    start,
    pause,
    reset,
  };
};