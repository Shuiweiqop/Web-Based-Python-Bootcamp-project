// resources/js/Pages/Admin/Lessons/components/LessonContent.jsx
import React, { useState } from 'react';
import { 
  FileText,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Code,
  FileCode,
} from 'lucide-react';
import SafeContentRenderer from '@/Components/SafeContentRenderer';
import { cn } from '@/utils/cn';

export default function LessonContent({ content, contentType = 'markdown', isDark = true }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  // 复制内容到剪贴板
  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy content');
    }
  };

  // 获取内容统计信息
  const getContentStats = () => {
    if (!content) return { characters: 0, words: 0, lines: 0 };

    const characters = content.length;
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const lines = content.split('\n').length;

    return { characters, words, lines };
  };

  const stats = getContentStats();

  // 获取内容类型信息
  const getContentTypeBadge = () => {
    const badges = {
      text: { icon: FileText, label: 'Plain Text', color: 'from-gray-500 to-gray-600' },
      markdown: { icon: FileCode, label: 'Markdown', color: 'from-blue-500 to-cyan-500' },
      html: { icon: Code, label: 'HTML', color: 'from-purple-500 to-pink-500' },
    };
    return badges[contentType] || badges.text;
  };

  // 获取内容类型描述
  const getContentTypeDescription = () => {
    const descriptions = {
      text: {
        title: 'Plain Text',
        description: 'Simple text without any formatting',
        security: 'No processing required - 100% safe',
        icon: '📄',
      },
      markdown: {
        title: 'Markdown',
        description: 'Formatted text with markdown syntax',
        security: 'Parsed and sanitized with DOMPurify',
        icon: '📝',
      },
      html: {
        title: 'HTML',
        description: 'Rich HTML content with styling',
        security: 'Sanitized - dangerous tags and scripts removed',
        icon: '💻',
      },
    };

    return descriptions[contentType] || descriptions.text;
  };

  const typeBadge = getContentTypeBadge();
  const typeInfo = getContentTypeDescription();
  const TypeIcon = typeBadge.icon;

  if (!content) {
    return (
      <div className={cn(
        "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn",
        isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
      )}>
        {/* Header */}
        <div className={cn(
          "px-6 py-4 border-b bg-gradient-to-r",
          isDark 
            ? "border-white/10 from-blue-500/10 to-cyan-500/10" 
            : "border-gray-200 from-blue-50 to-cyan-50"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isDark 
                ? "bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/50" 
                : "bg-gradient-to-br from-blue-100 to-cyan-100"
            )}>
              <FileText className={cn("w-5 h-5", isDark ? "text-cyan-400" : "text-blue-600")} />
            </div>
            <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
              Lesson Content
            </h3>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-12 text-center">
          <FileText className={cn("w-16 h-16 mx-auto mb-4", isDark ? "text-slate-700" : "text-gray-300")} />
          <p className={cn("font-medium mb-2", isDark ? "text-slate-400" : "text-gray-500")}>
            No content available
          </p>
          <p className={cn("text-sm", isDark ? "text-slate-600" : "text-gray-400")}>
            Add content to this lesson to help students learn
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden animate-fadeIn card-hover-effect",
      isDark ? "bg-slate-900/50 border-white/10" : "bg-white border-gray-200"
    )}>
      {/* Header */}
      <div className={cn(
        "px-6 py-4 border-b bg-gradient-to-r animated-gradient",
        isDark 
          ? "border-white/10 from-blue-500/10 to-cyan-500/10" 
          : "border-gray-200 from-blue-50 to-cyan-50"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow-lg",
              isDark 
                ? "bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/50 shadow-blue-500/20" 
                : "bg-gradient-to-br from-blue-100 to-cyan-100 shadow-blue-500/10"
            )}>
              <FileText className={cn("w-5 h-5", isDark ? "text-cyan-400" : "text-blue-600")} />
            </div>
            <div>
              <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                Lesson Content
              </h3>
              <p className={cn("text-xs", isDark ? "text-slate-400" : "text-gray-500")}>
                {stats.words.toLocaleString()} words • {stats.lines.toLocaleString()} lines
              </p>
            </div>
            
            {/* Collapse/Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "ml-3 p-2 rounded-lg transition-all ripple-effect button-press-effect",
                isDark 
                  ? "hover:bg-white/10 text-slate-400 hover:text-white" 
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              )}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Content Type Badge */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-lg",
              `bg-gradient-to-r ${typeBadge.color}`
            )}>
              <TypeIcon className="w-3.5 h-3.5" />
              {typeBadge.label}
            </div>
            
            {/* Security Badge */}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-lg",
              isDark 
                ? "bg-green-500/10 border-green-500/30 text-green-300 shadow-green-500/10" 
                : "bg-green-50 border-green-200 text-green-700 shadow-green-500/10"
            )}>
              <Shield className="w-3.5 h-3.5" />
              XSS Protected
            </div>
          </div>
        </div>
      </div>

      {/* Content Stats Bar */}
      {isExpanded && (
        <div className={cn(
          "px-6 py-3 border-b bg-gradient-to-r",
          isDark 
            ? "border-white/10 from-slate-800/50 to-slate-900/50" 
            : "border-gray-200 from-gray-50 to-white"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isDark ? "bg-purple-500/20" : "bg-purple-100"
                )}>
                  <BarChart3 className={cn("w-4 h-4", isDark ? "text-purple-400" : "text-purple-600")} />
                </div>
                <div>
                  <span className={cn("font-bold", isDark ? "text-white" : "text-gray-900")}>
                    {stats.characters.toLocaleString()}
                  </span>
                  <span className={cn("ml-1", isDark ? "text-slate-400" : "text-gray-500")}>
                    characters
                  </span>
                </div>
              </div>
              
              <div className={cn("h-8 w-px", isDark ? "bg-white/10" : "bg-gray-200")} />
              
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isDark ? "bg-blue-500/20" : "bg-blue-100"
                )}>
                  <FileText className={cn("w-4 h-4", isDark ? "text-blue-400" : "text-blue-600")} />
                </div>
                <div>
                  <span className={cn("font-bold", isDark ? "text-white" : "text-gray-900")}>
                    {stats.words.toLocaleString()}
                  </span>
                  <span className={cn("ml-1", isDark ? "text-slate-400" : "text-gray-500")}>
                    words
                  </span>
                </div>
              </div>
              
              <div className={cn("h-8 w-px", isDark ? "bg-white/10" : "bg-gray-200")} />
              
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isDark ? "bg-cyan-500/20" : "bg-cyan-100"
                )}>
                  <FileCode className={cn("w-4 h-4", isDark ? "text-cyan-400" : "text-cyan-600")} />
                </div>
                <div>
                  <span className={cn("font-bold", isDark ? "text-white" : "text-gray-900")}>
                    {stats.lines.toLocaleString()}
                  </span>
                  <span className={cn("ml-1", isDark ? "text-slate-400" : "text-gray-500")}>
                    lines
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle View Mode */}
              <button
                onClick={() => setShowRaw(!showRaw)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ripple-effect button-press-effect hover-lift",
                  isDark
                    ? "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
                    : "bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-300"
                )}
                title={showRaw ? 'Show rendered content' : 'Show raw content'}
              >
                {showRaw ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    Rendered
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    Raw
                  </>
                )}
              </button>

              {/* Copy Button */}
              <button
                onClick={handleCopyContent}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ripple-effect button-press-effect hover-lift",
                  copied
                    ? isDark
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : "bg-green-50 text-green-700 border border-green-200"
                    : isDark
                      ? "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
                      : "bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-300"
                )}
                title="Copy content to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Body */}
      {isExpanded && (
        <div className="p-6">
          {showRaw ? (
            // Raw Content View
            <div className={cn(
              "rounded-xl border p-4 card-hover-effect",
              isDark 
                ? "bg-slate-800/50 border-white/10" 
                : "bg-gray-50 border-gray-200"
            )}>
              <div className={cn(
                "flex items-center justify-between mb-3 pb-3 border-b",
                isDark ? "border-white/10" : "border-gray-300"
              )}>
                <span className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  isDark ? "text-slate-300" : "text-gray-700"
                )}>
                  Raw {typeInfo.title} Content
                </span>
                <span className={cn("text-xs", isDark ? "text-slate-500" : "text-gray-500")}>
                  Read-only
                </span>
              </div>
              <pre className={cn(
                "text-sm font-mono whitespace-pre-wrap break-words max-h-96 overflow-y-auto custom-scrollbar",
                isDark ? "text-slate-300" : "text-gray-800"
              )}>
                {content}
              </pre>
            </div>
          ) : (
            // Rendered Content View
            <div className={cn(
              "prose-wrapper rounded-xl p-6",
              isDark 
                ? "bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-white/5 text-slate-200" 
                : "bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 text-slate-900"
            )}>
              <SafeContentRenderer 
                content={content}
                type={contentType}
                className={cn("mt-0", isDark ? "prose-invert" : "")}
              />
            </div>
          )}

          {/* Content Type Info Footer */}
          <div className={cn("mt-6 pt-4 border-t", isDark ? "border-white/10" : "border-gray-200")}>
            <details className="group">
              <summary className={cn(
                "cursor-pointer text-xs font-medium flex items-center gap-2 transition-all hover-lift",
                isDark 
                  ? "text-slate-400 hover:text-white" 
                  : "text-gray-500 hover:text-gray-900"
              )}>
                <svg 
                  className="w-4 h-4 transition-transform group-open:rotate-90" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Content Type Information
              </summary>
              
              <div className={cn(
                "mt-3 p-4 rounded-xl border animate-fadeIn",
                isDark 
                  ? "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30" 
                  : "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
              )}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-2xl">
                    {typeInfo.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={cn("text-sm font-bold mb-1", isDark ? "text-white" : "text-blue-900")}>
                      {typeInfo.title}
                    </h4>
                    <p className={cn("text-xs mb-2", isDark ? "text-slate-300" : "text-blue-800")}>
                      {typeInfo.description}
                    </p>
                    <div className="flex items-start gap-1.5 text-xs">
                      <Shield className={cn("w-4 h-4 flex-shrink-0 mt-0.5", isDark ? "text-green-400" : "text-green-600")} />
                      <p className={cn(isDark ? "text-green-300" : "text-green-700")}>
                        <strong>Security:</strong> {typeInfo.security}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Markdown Syntax Help */}
                {contentType === 'markdown' && (
                  <div className={cn(
                    "mt-4 pt-4 border-t",
                    isDark ? "border-white/10" : "border-blue-300"
                  )}>
                    <p className={cn("text-xs font-semibold mb-2", isDark ? "text-white" : "text-blue-900")}>
                      Markdown Syntax Examples:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {['**bold**', '*italic*', '`code`', '[link](url)'].map(syntax => (
                        <code 
                          key={syntax}
                          className={cn(
                            "px-2 py-1 rounded border font-mono",
                            isDark 
                              ? "bg-slate-700 border-slate-600 text-cyan-400" 
                              : "bg-white border-blue-200 text-blue-800"
                          )}
                        >
                          {syntax}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {/* HTML Security Warning */}
                {contentType === 'html' && (
                  <div className={cn(
                    "mt-4 pt-4 border-t",
                    isDark ? "border-white/10" : "border-blue-300"
                  )}>
                    <p className={cn("text-xs mb-2", isDark ? "text-slate-300" : "text-blue-800")}>
                      <strong>⚠️ Note:</strong> The following HTML elements are blocked for security:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {['<script>', '<iframe>', '<object>', '<embed>', '<form>'].map(tag => (
                        <span 
                          key={tag} 
                          className={cn(
                            "inline-block px-2 py-0.5 rounded text-xs font-mono",
                            isDark 
                              ? "bg-red-500/20 text-red-300 border border-red-500/30" 
                              : "bg-red-100 text-red-800 border border-red-200"
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>
      )}

      {/* Collapsed State */}
      {!isExpanded && (
        <div className={cn(
          "px-6 py-4 text-center text-sm border-t",
          isDark 
            ? "bg-slate-800/30 text-slate-400 border-white/10" 
            : "bg-gray-50 text-gray-500 border-gray-200"
        )}>
          <p>Content hidden - Click ▼ to expand</p>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'};
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)'};
        }
      `}</style>
    </div>
  );
}