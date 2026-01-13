// resources/js/Pages/Admin/Lessons/components/LessonVideo.jsx
import React, { useState } from 'react';
import { 
  Play,
  AlertTriangle,
  ExternalLink,
  Video,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Youtube,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function LessonVideo({ videoUrl, isDark = true }) {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 检测视频平台类型
  const getVideoPlatform = (url) => {
    if (!url) return null;

    const patterns = {
      youtube: /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
      vimeo: /vimeo\.com\/(?:video\/)?([0-9]+)/,
      dailymotion: /dailymotion\.com\/(?:video|embed)\/([a-zA-Z0-9]+)/,
      bilibili: /bilibili\.com\/video\/(BV[a-zA-Z0-9]+|av[0-9]+)/,
    };

    for (const [platform, pattern] of Object.entries(patterns)) {
      if (pattern.test(url)) {
        return platform;
      }
    }

    return 'generic';
  };

  // 转换为嵌入式 URL
  const getEmbedUrl = (url) => {
    if (!url) return null;

    const platform = getVideoPlatform(url);

    try {
      switch (platform) {
        case 'youtube': {
          const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
          return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : url;
        }
        
        case 'vimeo': {
          const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
          return match ? `https://player.vimeo.com/video/${match[1]}` : url;
        }
        
        case 'dailymotion': {
          const match = url.match(/dailymotion\.com\/(?:video|embed)\/([a-zA-Z0-9]+)/);
          return match ? `https://www.dailymotion.com/embed/video/${match[1]}` : url;
        }
        
        case 'bilibili': {
          const match = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+|av[0-9]+)/);
          return match ? `https://player.bilibili.com/player.html?bvid=${match[1]}` : url;
        }
        
        default:
          return url;
      }
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return url;
    }
  };

  // 获取平台图标和颜色
  const getPlatformInfo = (platform) => {
    const info = {
      youtube: {
        name: 'YouTube',
        icon: '▶️',
        gradient: 'from-red-500 to-rose-600',
      },
      vimeo: {
        name: 'Vimeo',
        icon: '🎬',
        gradient: 'from-blue-500 to-cyan-500',
      },
      dailymotion: {
        name: 'Dailymotion',
        icon: '📹',
        gradient: 'from-blue-500 to-indigo-500',
      },
      bilibili: {
        name: 'Bilibili',
        icon: '📺',
        gradient: 'from-pink-500 to-rose-500',
      },
      generic: {
        name: 'Video',
        icon: '🎥',
        gradient: 'from-purple-500 to-cyan-500',
      },
    };

    return info[platform] || info.generic;
  };

  const embedUrl = getEmbedUrl(videoUrl);
  const platform = getVideoPlatform(videoUrl);
  const platformInfo = getPlatformInfo(platform);

  // 处理加载错误
  const handleIframeError = () => {
    setLoadError(true);
    setIsLoading(false);
  };

  // 处理加载完成
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn(
      "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn card-hover-effect",
      isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
    )}>
      {/* Header */}
      <div className={cn(
        "px-6 py-4 border-b bg-gradient-to-r animated-gradient",
        isDark 
          ? "border-white/10 from-purple-500/10 to-cyan-500/10" 
          : "border-gray-200 from-purple-50 to-cyan-50"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow-lg",
              isDark 
                ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-500/50 shadow-purple-500/20" 
                : "bg-gradient-to-br from-purple-100 to-cyan-100 shadow-purple-500/10"
            )}>
              <Play className={cn("w-5 h-5", isDark ? "text-cyan-400" : "text-purple-600")} />
            </div>
            <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
              Video Lesson
            </h3>
          </div>
          
          {/* Platform Badge */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-lg",
            `bg-gradient-to-r ${platformInfo.gradient}`
          )}>
            <span>{platformInfo.icon}</span>
            {platformInfo.name}
          </div>
        </div>
      </div>
      
      {/* Video Player */}
      <div className="p-6">
        {!loadError ? (
          <div className="relative">
            {/* Loading Indicator */}
            {isLoading && (
              <div className={cn(
                "absolute inset-0 flex items-center justify-center rounded-xl z-10 backdrop-blur-sm",
                isDark ? "bg-slate-800/80" : "bg-white/80"
              )}>
                <div className="text-center animate-fadeIn">
                  <div className={cn(
                    "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg",
                    isDark 
                      ? "bg-gradient-to-br from-purple-500/30 to-cyan-500/30 shadow-purple-500/50" 
                      : "bg-gradient-to-br from-purple-100 to-cyan-100 shadow-purple-500/20"
                  )}>
                    <Loader2 className={cn(
                      "w-8 h-8 animate-spin",
                      isDark ? "text-cyan-400" : "text-purple-600"
                    )} />
                  </div>
                  <p className={cn(
                    "text-sm font-medium",
                    isDark ? "text-slate-300" : "text-gray-600"
                  )}>
                    Loading video...
                  </p>
                </div>
              </div>
            )}

            {/* Video iFrame */}
            <div className={cn(
              "aspect-video rounded-xl overflow-hidden shadow-xl border",
              isDark 
                ? "bg-slate-800/50 border-white/10 shadow-purple-500/10" 
                : "bg-gray-100 border-gray-200 shadow-gray-500/10"
            )}>
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Lesson Video"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </div>
          </div>
        ) : (
          // Error State
          <div className={cn(
            "rounded-xl p-8 text-center border-2 animate-fadeIn",
            isDark 
              ? "bg-red-500/10 border-red-500/30" 
              : "bg-red-50 border-red-200"
          )}>
            <div className={cn(
              "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
              isDark ? "bg-red-500/20" : "bg-red-100"
            )}>
              <AlertTriangle className={cn(
                "w-8 h-8",
                isDark ? "text-red-400" : "text-red-600"
              )} />
            </div>
            
            <h4 className={cn(
              "text-lg font-bold mb-2",
              isDark ? "text-red-300" : "text-red-900"
            )}>
              Failed to Load Video
            </h4>
            
            <p className={cn(
              "text-sm mb-4",
              isDark ? "text-red-400" : "text-red-700"
            )}>
              The video could not be loaded. This might be due to:
            </p>
            
            <ul className={cn(
              "text-sm text-left max-w-md mx-auto mb-6 space-y-2",
              isDark ? "text-red-300" : "text-red-700"
            )}>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                Invalid or expired video URL
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                Video privacy settings
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                Network connectivity issues
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                Content restrictions in your region
              </li>
            </ul>
            
            <a 
              href={videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ripple-effect button-press-effect hover-lift shadow-lg",
                isDark
                  ? "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-red-500/30"
                  : "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-red-500/20"
              )}
            >
              <ExternalLink className="w-4 h-4" />
              Try Opening Directly
            </a>
          </div>
        )}

        {/* Video Info */}
        {!loadError && (
          <div className="mt-6 space-y-3 animate-fadeIn">
            {/* Open in New Tab Link */}
            <div className={cn(
              "flex items-center justify-between p-4 rounded-xl border card-hover-effect",
              isDark 
                ? "bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-white/10" 
                : "bg-gradient-to-r from-white to-gray-50 border-gray-200"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center",
                  isDark ? "bg-purple-500/20" : "bg-purple-100"
                )}>
                  <Video className={cn(
                    "w-5 h-5",
                    isDark ? "text-purple-400" : "text-purple-600"
                  )} />
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isDark ? "text-slate-300" : "text-gray-700"
                )}>
                  Watch in full screen
                </span>
              </div>
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ripple-effect button-press-effect hover-lift",
                  isDark
                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-400 hover:from-blue-500/30 hover:to-cyan-500/30 border border-cyan-500/30"
                    : "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 hover:from-blue-100 hover:to-cyan-100 border border-blue-200"
                )}
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </a>
            </div>

            {/* Video URL Display */}
            <details className="group">
              <summary className={cn(
                "cursor-pointer text-xs font-medium flex items-center gap-2 transition-all hover-lift",
                isDark 
                  ? "text-slate-400 hover:text-white" 
                  : "text-gray-500 hover:text-gray-900"
              )}>
                <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                Show video URL
              </summary>
              <div className={cn(
                "mt-2 p-3 rounded-lg border animate-fadeIn",
                isDark 
                  ? "bg-slate-800/50 border-white/10" 
                  : "bg-gray-100 border-gray-200"
              )}>
                <code className={cn(
                  "text-xs break-all font-mono",
                  isDark ? "text-cyan-400" : "text-gray-700"
                )}>
                  {videoUrl}
                </code>
              </div>
            </details>

            {/* Supported Platforms Info */}
            <div className={cn(
              "text-xs p-4 rounded-xl border",
              isDark 
                ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-300" 
                : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800"
            )}>
              <div className="flex items-start gap-3">
                <CheckCircle2 className={cn(
                  "w-5 h-5 flex-shrink-0 mt-0.5",
                  isDark ? "text-blue-400" : "text-blue-600"
                )} />
                <div>
                  <p className={cn(
                    "font-semibold mb-1",
                    isDark ? "text-blue-300" : "text-blue-900"
                  )}>
                    Supported platforms
                  </p>
                  <p className={cn(
                    isDark ? "text-blue-400" : "text-blue-700"
                  )}>
                    YouTube, Vimeo, Dailymotion, Bilibili, and direct video links
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .ripple-effect {
          position: relative;
          overflow: hidden;
        }
        
        .ripple-effect:active::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out;
        }
        
        @keyframes ripple {
          to {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        
        .button-press-effect:active {
          transform: scale(0.95);
        }
        
        .hover-lift {
          transition: transform 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        
        .card-hover-effect {
          transition: all 0.3s ease;
        }
        
        .card-hover-effect:hover {
          transform: translateY(-2px);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animated-gradient {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}