import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 🎵 创建音效上下文
const SFXContext = createContext();

// 🎯 Web Audio API 音效生成器
const generateSFX = (type) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const effects = {
      click: { freq: 800, duration: 50, type: 'sine' },
      hover: { freq: 600, duration: 30, type: 'sine' },
      toggle: { freq: 600, duration: 100, type: 'square' },
      skip: { freq: 1000, duration: 80, type: 'triangle' },
      shuffle: { freq: 700, duration: 90, type: 'sine' },
      success: { freq: 1200, duration: 120, type: 'sine' },
      error: { freq: 300, duration: 150, type: 'sawtooth' },
      nav: { freq: 1000, duration: 60, type: 'triangle' },
      dropdown: { freq: 700, duration: 80, type: 'square' },
      points: { freq: 1400, duration: 120, type: 'sine' }
    };
    
    const effect = effects[type] || effects.click;
    
    oscillator.frequency.value = effect.freq;
    oscillator.type = effect.type;
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + effect.duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + effect.duration / 1000);
  } catch (error) {
    console.warn(`SFX generation failed for ${type}:`, error);
  }
};

// 🎮 SFX Provider Component
export function SFXProvider({ children }) {
  const [sfxEnabled, setSfxEnabled] = useState(() => {
    // 从内存读取设置（生产环境可以用localStorage）
    const stored = sessionStorage.getItem('sfxEnabled');
    return stored !== null ? JSON.parse(stored) : true;
  });

  // 💾 保存设置到内存
  useEffect(() => {
    sessionStorage.setItem('sfxEnabled', JSON.stringify(sfxEnabled));
  }, [sfxEnabled]);

  // 🔊 播放音效的函数
  const playSFX = useCallback((type = 'click') => {
    if (sfxEnabled) {
      generateSFX(type);
    }
  }, [sfxEnabled]);

  // 🎚️ 切换音效开关
  const toggleSFX = useCallback(() => {
    setSfxEnabled(prev => {
      const newValue = !prev;
      // 如果开启音效，播放一个成功音效作为反馈
      if (newValue) {
        setTimeout(() => generateSFX('success'), 100);
      }
      return newValue;
    });
  }, []);

  const value = {
    sfxEnabled,
    setSfxEnabled,
    toggleSFX,
    playSFX
  };

  return (
    <SFXContext.Provider value={value}>
      {children}
    </SFXContext.Provider>
  );
}

// 🎯 Hook to use SFX
export function useSFX() {
  const context = useContext(SFXContext);
  if (!context) {
    throw new Error('useSFX must be used within SFXProvider');
  }
  return context;
}

export default SFXContext;