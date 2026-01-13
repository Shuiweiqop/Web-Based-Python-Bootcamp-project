import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// 🎵 本地托管的 BGM 数据库
export const BGM_DATABASE = [
  {
    id: 1,
    title: "Burgundy - Chances",
    file: "/audio/bgm/Burgundy - Chances (freetouse.com).mp3",
    mood: "chill",
    duration: "3:24"
  },
  {
    id: 2,
    title: "Happy Vibes",
    file: "/audio/bgm/happy.mp3",
    mood: "upbeat",
    duration: "2:45"
  },
  {
    id: 3,
    title: "Luke Bergs - Follow The Sun",
    file: "/audio/bgm/Luke Bergs & Waesto - Follow The Sun (freetouse.com).mp3",
    mood: "energetic",
    duration: "3:18"
  },
  {
    id: 4,
    title: "Nebulite - Breath",
    file: "/audio/bgm/Nebulite - Breath (freetouse.com).mp3",
    mood: "calm",
    duration: "4:05"
  },
  {
    id: 5,
    title: "Pufino - Rock Me Now",
    file: "/audio/bgm/Pufino - Rock Me Now (freetouse.com).mp3",
    mood: "groovy",
    duration: "3:42"
  }
];

// 🎯 全局单例音频播放器类（在 React 外部）
class GlobalAudioPlayer {
  constructor() {
    if (!GlobalAudioPlayer.instance) {
      this.audio = new Audio();
      this.audio.preload = 'metadata';
      this.listeners = new Set();
      this.state = {
        isPlaying: false,
        isLoading: false,
        error: null
      };
      
      // 设置音频事件监听
      this.audio.addEventListener('ended', () => this.notifyListeners('ended'));
      this.audio.addEventListener('error', (e) => {
        this.state.error = `Failed to load audio`;
        this.state.isLoading = false;
        this.notifyListeners('error', e);
      });
      this.audio.addEventListener('loadstart', () => {
        this.state.isLoading = true;
        this.notifyListeners('loadstart');
      });
      this.audio.addEventListener('canplay', () => {
        this.state.isLoading = false;
        this.notifyListeners('canplay');
      });
      this.audio.addEventListener('play', () => {
        this.state.isPlaying = true;
        this.notifyListeners('play');
      });
      this.audio.addEventListener('pause', () => {
        this.state.isPlaying = false;
        this.notifyListeners('pause');
      });

      // 页面可见性变化处理
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.shouldBePlaying && this.audio.paused) {
          this.audio.play().catch(console.warn);
        }
      });
      
      GlobalAudioPlayer.instance = this;
      console.log('🎵 Global Audio Player initialized');
    }
    return GlobalAudioPlayer.instance;
  }

  // 订阅状态变化
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // 通知所有订阅者
  notifyListeners(event, data) {
    this.listeners.forEach(callback => callback(event, data, this.state));
  }

  // 加载并播放歌曲
  loadSong(songFile, autoPlay = false) {
    this.state.error = null;
    this.state.isLoading = true;
    this.notifyListeners('loadstart');

    const newSrc = window.location.origin + songFile;
    if (this.audio.src !== newSrc) {
      this.audio.src = songFile;
      this.audio.load();
    }

    if (autoPlay) {
      this.shouldBePlaying = true;
      this.audio.play()
        .then(() => {
          this.state.isLoading = false;
          this.notifyListeners('play');
        })
        .catch(error => {
          console.warn('Music playback error:', error);
          this.state.error = `无法播放`;
          this.state.isLoading = false;
          this.notifyListeners('error', error);
        });
    } else {
      this.state.isLoading = false;
      this.notifyListeners('canplay');
    }
  }

  // 播放
  play() {
    this.shouldBePlaying = true;
    if (this.audio.paused) {
      return this.audio.play().catch(console.warn);
    }
  }

  // 暂停
  pause() {
    this.shouldBePlaying = false;
    if (!this.audio.paused) {
      this.audio.pause();
    }
  }

  // 设置音量
  setVolume(volume) {
    this.audio.volume = Math.max(0, Math.min(1, volume / 100));
  }

  // 获取当前状态
  getState() {
    return { ...this.state };
  }
}

// 🎯 获取全局播放器实例
const getGlobalPlayer = () => {
  if (!window.__globalAudioPlayer) {
    window.__globalAudioPlayer = new GlobalAudioPlayer();
  }
  return window.__globalAudioPlayer;
};

// 🎵 创建音乐上下文
const MusicContext = createContext();

// 🎮 Music Provider Component
export function MusicProvider({ children }) {
  // 从 sessionStorage 加载设置
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const stored = sessionStorage.getItem('musicEnabled');
    return stored !== null ? JSON.parse(stored) : false;
  });
  
  const [musicVolume, setMusicVolume] = useState(() => {
    const stored = sessionStorage.getItem('musicVolume');
    return stored !== null ? parseInt(stored) : 70;
  });
  
  const [currentSongIndex, setCurrentSongIndex] = useState(() => {
    const stored = sessionStorage.getItem('currentSongIndex');
    return stored !== null ? parseInt(stored) : 0;
  });
  
  const [isShuffleMode, setIsShuffleMode] = useState(() => {
    const stored = sessionStorage.getItem('isShuffleMode');
    return stored !== null ? JSON.parse(stored) : true;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 获取全局播放器
  const player = getGlobalPlayer();

  // 💾 保存设置到 sessionStorage
  useEffect(() => {
    sessionStorage.setItem('musicEnabled', JSON.stringify(musicEnabled));
  }, [musicEnabled]);

  useEffect(() => {
    sessionStorage.setItem('musicVolume', musicVolume.toString());
  }, [musicVolume]);

  useEffect(() => {
    sessionStorage.setItem('currentSongIndex', currentSongIndex.toString());
  }, [currentSongIndex]);

  useEffect(() => {
    sessionStorage.setItem('isShuffleMode', JSON.stringify(isShuffleMode));
  }, [isShuffleMode]);

  // 🎵 订阅全局播放器事件
  useEffect(() => {
    const handlePlayerEvent = (event, data, state) => {
      switch (event) {
        case 'ended':
          // 歌曲结束，播放下一首
          if (isShuffleMode) {
            let newIndex;
            do {
              newIndex = Math.floor(Math.random() * BGM_DATABASE.length);
            } while (newIndex === currentSongIndex && BGM_DATABASE.length > 1);
            setCurrentSongIndex(newIndex);
          } else {
            setCurrentSongIndex((prev) => (prev + 1) % BGM_DATABASE.length);
          }
          break;
        case 'error':
          setAudioError(state.error);
          setIsLoading(false);
          break;
        case 'loadstart':
          setIsLoading(true);
          setAudioError(null);
          break;
        case 'canplay':
          setIsLoading(false);
          break;
        case 'play':
          setIsPlaying(true);
          break;
        case 'pause':
          setIsPlaying(false);
          break;
      }
    };

    return player.subscribe(handlePlayerEvent);
  }, [isShuffleMode, currentSongIndex, player]);

  // 🎵 更新歌曲
  useEffect(() => {
    const currentSong = BGM_DATABASE[currentSongIndex];
    player.loadSong(currentSong.file, musicEnabled);
  }, [currentSongIndex, musicEnabled, player]);

  // 🎶 控制播放/暂停
  useEffect(() => {
    if (musicEnabled) {
      player.play();
    } else {
      player.pause();
    }
  }, [musicEnabled, player]);

  // 🎚️ 更新音量
  useEffect(() => {
    player.setVolume(musicVolume);
  }, [musicVolume, player]);

  // ✅ 使用 useCallback 避免函数重新创建
  const toggleMusic = useCallback(() => {
    setMusicEnabled(prev => !prev);
  }, []);

  const updateVolume = useCallback((volume) => {
    setMusicVolume(Math.max(0, Math.min(100, volume)));
  }, []);

  const skipSong = useCallback(() => {
    if (isShuffleMode) {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * BGM_DATABASE.length);
      } while (newIndex === currentSongIndex && BGM_DATABASE.length > 1);
      setCurrentSongIndex(newIndex);
    } else {
      setCurrentSongIndex((prev) => (prev + 1) % BGM_DATABASE.length);
    }
  }, [isShuffleMode, currentSongIndex]);

  const toggleShuffle = useCallback(() => {
    setIsShuffleMode(prev => !prev);
  }, []);

  const setSong = useCallback((index) => {
    if (index >= 0 && index < BGM_DATABASE.length) {
      setCurrentSongIndex(index);
    }
  }, []);

  const playNextSong = useCallback(() => {
    setCurrentSongIndex((prev) => (prev + 1) % BGM_DATABASE.length);
  }, []);

  const playRandomSong = useCallback(() => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * BGM_DATABASE.length);
    } while (newIndex === currentSongIndex && BGM_DATABASE.length > 1);
    setCurrentSongIndex(newIndex);
  }, [currentSongIndex]);

  // ✅ 使用 useMemo 缓存当前歌曲对象
  const currentSong = useMemo(() => {
    return BGM_DATABASE[currentSongIndex];
  }, [currentSongIndex]);

  // ✅ 使用 useMemo 缓存 value 对象
  const value = useMemo(() => ({
    musicEnabled,
    musicVolume,
    currentSongIndex,
    isShuffleMode,
    isLoading,
    audioError,
    isPlaying,
    currentSong,
    toggleMusic,
    updateVolume,
    skipSong,
    toggleShuffle,
    setSong,
    playNextSong,
    playRandomSong,
  }), [
    musicEnabled,
    musicVolume,
    currentSongIndex,
    isShuffleMode,
    isLoading,
    audioError,
    isPlaying,
    currentSong,
    toggleMusic,
    updateVolume,
    skipSong,
    toggleShuffle,
    setSong,
    playNextSong,
    playRandomSong,
  ]);

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

// 🎯 Hook to use Music
export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
}

export default MusicContext;