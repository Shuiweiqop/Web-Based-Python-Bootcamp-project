import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, BookOpen, MessageCircle, Package, TrendingUp, Loader2, Sparkles, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useSFX } from '@/Contexts/SFXContext';
import axios from 'axios';

function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const { playSFX } = useSFX();

  // 搜索类别
  const categories = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'forum', label: 'Forum', icon: MessageCircle },
    { id: 'rewards', label: 'Rewards', icon: Package },
  ];

  // 从 localStorage 加载最近搜索
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }, []);

  // 保存搜索历史
  const saveToRecent = useCallback((searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches(prev => {
      const newSearches = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5);
      try {
        localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      } catch (e) {
        console.error('Failed to save search history', e);
      }
      return newSearches;
    });
  }, []);

  // 清除搜索历史
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('recentSearches');
    } catch (e) {
      console.error('Failed to clear search history', e);
    }
    playSFX('click');
  }, [playSFX]);

  // 🔍 搜索函数
  const performSearch = useCallback(async (searchQuery, category) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/search', {
        params: {
          q: searchQuery,
          category: category,
          limit: 10,
        },
        signal: abortControllerRef.current.signal,
      });

      if (response.data.success) {
        setResults(response.data.results || []);
        saveToRecent(searchQuery);
      } else {
        console.error('❌ Search failed:', response.data.message);
        setError(response.data.message || 'Search failed');
        setResults([]);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      
      console.error('💥 Search error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      let errorMessage = 'Search failed';
      if (error.response) {
        errorMessage = error.response.data?.message || `Error ${error.response.status}`;
        
        if (error.response.status === 419) {
          errorMessage = 'Session expired. Please refresh the page.';
        } else if (error.response.status === 401) {
          errorMessage = 'Please login to search.';
        } else if (error.response.status === 404) {
          errorMessage = 'Search API not found. Check your routes.';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Check your connection.';
      }

      setError(errorMessage);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [saveToRecent]);

  // 打开搜索框
  const handleOpen = useCallback(() => {
    playSFX('click');
    setIsOpen(true);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [playSFX]);

  // 关闭搜索框
  const handleClose = useCallback(() => {
    playSFX('click');
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setActiveCategory('all');
    setError(null);
    setSelectedIndex(-1);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [playSFX]);

  // 搜索处理 - 带防抖
  const handleSearch = useCallback((value) => {
    setQuery(value);
    setError(null);
    setSelectedIndex(-1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value, activeCategory);
    }, 300);
  }, [activeCategory, performSearch]);

  // 切换类别
  const handleCategoryChange = useCallback((categoryId) => {
    playSFX('click');
    setActiveCategory(categoryId);
    setError(null);
    setSelectedIndex(-1);
    if (query) {
      performSearch(query, categoryId);
    }
  }, [playSFX, query, performSearch]);

  // 点击结果项
  const handleResultClick = useCallback((result) => {
    playSFX('nav');
    handleClose();
    
    try {
      if (result.params && Object.keys(result.params).length > 0) {
        router.visit(route(result.route, result.params));
      } else {
        router.visit(route(result.route));
      }
    } catch (err) {
      console.error('Navigation error:', err);
    }
  }, [playSFX, handleClose]);

  // 点击最近搜索
  const handleRecentClick = useCallback((searchTerm) => {
    setQuery(searchTerm);
    performSearch(searchTerm, activeCategory);
  }, [activeCategory, performSearch]);

  // 键盘导航
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        handleClose();
        break;
    }
  }, [isOpen, results, selectedIndex, handleResultClick, handleClose]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose, handleKeyDown]);

  // 清理定时器和请求
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 快捷键支持 (Ctrl/Cmd + K)
  useEffect(() => {
    const handleShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        } else {
          handleOpen();
        }
      }
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [isOpen, handleOpen, handleClose]);

  // 获取类型图标和颜色
  const getTypeConfig = (type) => {
    switch (type) {
      case 'lesson':
        return {
          icon: <BookOpen className="w-4 h-4" />,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
        };
      case 'forum':
        return {
          icon: <MessageCircle className="w-4 h-4" />,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
        };
      case 'reward':
        return {
          icon: <Package className="w-4 h-4" />,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
        };
      default:
        return {
          icon: <Search className="w-4 h-4" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
        };
    }
  };

  // 获取元数据标签
  const getMetadataTag = (result) => {
    if (result.type === 'lesson' && result.metadata) {
      return (
        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
          {result.metadata.difficulty}
        </span>
      );
    }
    if (result.type === 'reward' && result.metadata) {
      return (
        <div className="flex items-center gap-1">
          <span className={`text-xs px-2 py-0.5 rounded ${
            result.metadata.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
            result.metadata.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
            result.metadata.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
            'bg-gray-500/20 text-gray-300'
          }`}>
            {result.metadata.rarity}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-0.5">
            <Sparkles className="w-3 h-3" />
            {result.metadata.point_cost}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* 搜索图标按钮 */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          onMouseEnter={() => playSFX('hover')}
          className="
            p-2 rounded-lg
            text-white/95 hover:text-white
            hover:bg-white/25 backdrop-blur-sm
            transition-all duration-200
            shadow-lg
            ripple-effect button-press-effect
            relative group
          "
          title="Search (Ctrl+K)"
        >
          <Search className="w-5 h-5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />
          <span className="absolute -bottom-8 right-0 text-xs text-white/70 bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ctrl+K
          </span>
        </button>
      )}

      {/* 展开的搜索框 */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={handleClose} />
          
          {/* 搜索面板 */}
          <div className="relative w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden animate-slideDown">
            
            {/* 搜索输入区 */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search for lessons, forum posts, rewards..."
                  className="
                    flex-1 bg-transparent border-none outline-none
                    text-white placeholder-gray-400
                    text-lg
                  "
                  autoComplete="off"
                />
                {isLoading && (
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                )}
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-gray-800 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* 类别标签 */}
              <div className="flex gap-2 mt-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                        transition-all duration-200
                        ${isActive
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }
                      `}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 搜索结果 */}
            <div className="max-h-96 overflow-y-auto">
              {/* 错误提示 */}
              {error && (
                <div className="p-4 m-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-medium">Search Error</p>
                      <p className="text-red-300 text-sm mt-1">{error}</p>
                      <p className="text-red-300/70 text-xs mt-2">
                        Please try again in a moment.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 空状态 - 显示最近搜索 */}
              {!query && !error && (
                <div className="p-4">
                  {recentSearches.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Recent Searches
                        </h3>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleRecentClick(search)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors text-left group"
                          >
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-300 group-hover:text-white flex-1">
                              {search}
                            </span>
                            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Start typing to search...</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Search for lessons, forum posts, and rewards
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 无结果 */}
              {query && !isLoading && !error && results.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No results found for "{query}"</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Try different keywords or check the spelling
                  </p>
                </div>
              )}

              {/* 结果列表 */}
              {results.length > 0 && (
                <div className="p-2">
                  {results.map((result, index) => {
                    const typeConfig = getTypeConfig(result.type);
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={`${result.type}-${result.id}-${index}`}
                        onClick={() => handleResultClick(result)}
                        className={`
                          w-full flex items-start gap-3 p-3 rounded-xl
                          transition-all duration-200
                          text-left group
                          ${isSelected ? 'bg-gray-800 ring-2 ring-purple-500' : 'hover:bg-gray-800'}
                        `}
                      >
                        <div className={`mt-1 p-2 rounded-lg ${typeConfig.bgColor}`}>
                          <div className={typeConfig.color}>
                            {typeConfig.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors truncate">
                            {result.title}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-1 mt-0.5">
                            {result.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getMetadataTag(result)}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-gray-500 group-hover:text-purple-400 transition-colors mt-1">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 快捷键提示 */}
            <div className="p-3 border-t border-gray-700 bg-gray-800/50">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-700 rounded">↑↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-700 rounded">↵</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-gray-700 rounded">ESC</kbd>
                    <span>Close</span>
                  </div>
                </div>
                {results.length > 0 && (
                  <div className="text-gray-500">
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
