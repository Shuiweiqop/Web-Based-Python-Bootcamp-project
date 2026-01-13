import React, { useState, useEffect, useCallback, memo } from 'react';
import { Settings, Volume2, VolumeX, Music, Zap, X, SkipForward, Shuffle, AlertCircle } from 'lucide-react';
import { useSFX } from '@/Contexts/SFXContext';
import { useMusic, BGM_DATABASE } from '@/Contexts/MusicContext';

function GameControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  
  // ✨ 使用全局音效控制
  const { sfxEnabled, toggleSFX, playSFX } = useSFX();
  
  // 🎵 使用全局音乐播放器
  const {
    musicEnabled,
    musicVolume,
    currentSongIndex,
    isShuffleMode,
    isLoading,
    audioError,
    currentSong,
    toggleMusic,
    updateVolume,
    skipSong,
    toggleShuffle,
  } = useMusic();

  // ✅ 使用 useCallback 避免函数重新创建
  const handleToggleShuffle = useCallback(() => {
    playSFX('shuffle');
    toggleShuffle();
  }, [playSFX, toggleShuffle]);

  const handleSkipSong = useCallback(() => {
    playSFX('skip');
    skipSong();
  }, [playSFX, skipSong]);

  const handleToggleMusic = useCallback(() => {
    playSFX('toggle');
    toggleMusic();
  }, [playSFX, toggleMusic]);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseInt(e.target.value);
    updateVolume(newVolume);
  }, [updateVolume]);

  const handleOpenPanel = useCallback(() => {
    playSFX('click');
    setIsOpen(!isOpen);
  }, [playSFX, isOpen]);

  const handleClosePanel = useCallback(() => {
    playSFX('click');
    setIsOpen(false);
  }, [playSFX]);

  return (
    <>
      {/* ⚙️ Settings 按钮 */}
      <button 
        onClick={handleOpenPanel}
        className="
          relative
          text-white/95 hover:text-white
          p-2 rounded-lg hover:bg-white/25
          backdrop-blur-sm 
          transition-all duration-200
          shadow-lg
          flex-shrink-0
          active:scale-95
        "
        title="Control Center"
      >
        <Settings 
          className={`
            w-5 h-5 
            drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]
            transition-transform duration-300
            ${isOpen ? 'rotate-90' : ''}
          `}
        />
        {musicEnabled && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        )}
        {!sfxEnabled && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-red-400 rounded-full" />
        )}
      </button>

      {/* 🎛️ 控制面板弹窗 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={handleClosePanel}
          />
          
          {/* 面板主体 */}
          <div className="fixed top-20 right-4 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto bg-gray-950 backdrop-blur-xl rounded-2xl shadow-2xl z-[61] border border-gray-700">
            
            {/* 📌 头部 */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-900/95 to-pink-900/95 border-b border-gray-700 p-5 backdrop-blur-xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 relative">
                    {musicEnabled && (
                      <div className="absolute inset-0 rounded-xl bg-purple-500/50 animate-ping" />
                    )}
                    <Settings className="w-5 h-5 text-white relative z-10" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Control Center</h2>
                    <p className="text-xs text-gray-400">Audio Settings</p>
                  </div>
                </div>
                <button
                  onClick={handleClosePanel}
                  className="text-white/70 hover:text-white transition-all p-1.5 hover:bg-white/10 rounded-lg active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 🎚️ 设置项区域 */}
            <div className="p-4 space-y-3">
              
              {/* 🔊 全局音效开关 */}
              <div className={`bg-gradient-to-r border p-4 rounded-xl transition-all ${
                sfxEnabled 
                  ? 'from-blue-900/90 to-cyan-900/90 border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                  : 'from-gray-800/90 to-gray-700/90 border-gray-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      sfxEnabled ? 'bg-cyan-600/90 animate-pulse' : 'bg-gray-600/90'
                    }`}>
                      <Zap className={`w-4 h-4 ${sfxEnabled ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <span className="font-semibold text-white text-sm block">Sound Effects</span>
                      <span className="text-xs text-gray-300">Controls all UI sounds</span>
                    </div>
                  </div>
                  <button
                    onClick={toggleSFX}
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative active:scale-95 ${
                      sfxEnabled 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                        : 'bg-white/20'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                      sfxEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                {sfxEnabled && (
                  <div className="mt-2 text-xs text-cyan-200 bg-cyan-600/20 px-2 py-1 rounded">
                    ✨ All button clicks and interactions will play sounds
                  </div>
                )}
                {!sfxEnabled && (
                  <div className="mt-2 text-xs text-gray-400 bg-gray-700/30 px-2 py-1 rounded">
                    🔇 All UI sounds are muted
                  </div>
                )}
              </div>

              {/* 🎵 背景音乐控制 */}
              <div className="bg-gray-800/90 border border-gray-600 p-4 rounded-xl hover:bg-gray-800 transition-all hover:border-purple-500/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 bg-purple-900/90 rounded-lg flex items-center justify-center ${musicEnabled ? 'animate-pulse' : ''}`}>
                      <Music className="w-4 h-4 text-purple-300" />
                    </div>
                    <div>
                      <span className="font-semibold text-white text-sm block">Background Music</span>
                      <span className="text-xs text-gray-300">Continues across pages</span>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleMusic}
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative active:scale-95 ${
                      musicEnabled 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-white/20'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                      musicEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                {/* 错误提示 */}
                {audioError && (
                  <div className="mb-3 bg-red-900/80 border border-red-500/60 rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-300">{audioError}</p>
                    </div>
                  </div>
                )}

                {/* 🎶 当前播放信息 */}
                {musicEnabled && (
                  <div className="mb-3">
                    <div className="bg-gray-900/95 rounded-lg p-3 border border-purple-500/40">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-purple-300 mb-0.5">
                            {isLoading ? '⏳ Loading...' : '🎵 Now Playing'}
                          </p>
                          <p className="text-sm font-bold text-white truncate">
                            {currentSong.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-300 mt-0.5">
                            <span>#{currentSongIndex + 1} / {BGM_DATABASE.length}</span>
                            <span>•</span>
                            <span>{currentSong.mood}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 ml-2">
                          <button
                            onClick={handleToggleShuffle}
                            className={`p-1.5 rounded-lg transition-all ${
                              isShuffleMode 
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                            title={isShuffleMode ? "Shuffle On" : "Shuffle Off"}
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleSkipSong}
                            disabled={isLoading}
                            className="p-1.5 rounded-lg transition-all bg-gray-700 hover:bg-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Skip Song"
                          >
                            <SkipForward className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 🎚️ 音量条 */}
                {musicEnabled && (
                  <div className="flex items-center gap-3">
                    <VolumeX className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={handleVolumeChange}
                      onMouseDown={() => playSFX('click')}
                      className="flex-1 h-2 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                    />
                    <Volume2 className="w-4 h-4 text-purple-300 flex-shrink-0" />
                    <span className="text-xs font-bold text-white w-8 text-right">
                      {musicVolume}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 📊 底部状态栏 */}
            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-3 backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>✨ {BGM_DATABASE.length} Lo-fi Tracks</span>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${musicEnabled ? 'text-purple-400' : 'text-gray-500'}`}>
                    Music: {musicEnabled ? 'ON' : 'OFF'}
                  </span>
                  <span className={`font-semibold ${sfxEnabled ? 'text-green-400' : 'text-red-400'}`}>
                    SFX: {sfxEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ✅ 导出 memo 版本以避免不必要的重新渲染
export default memo(GameControlPanel);