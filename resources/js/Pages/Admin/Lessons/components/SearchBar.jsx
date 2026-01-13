// resources/js/Pages/Admin/Lessons/components/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { safeRoute } from '@/utils/routeHelpers';

export default function SearchBar({ 
  initialQuery = '', 
  placeholder = 'Search lessons by title or content...',
  onSearch = null,
  debounceMs = 300,
  showRecentSearches = true,
  maxRecentSearches = 5,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const debounceTimer = useRef(null);
  const inputRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lessonSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, maxRecentSearches));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, [maxRecentSearches]);

  // Debounced search handler
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debounceMs]);

  // Perform search
  const performSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Simulate API call for suggestions
    // In production, this would call an actual API endpoint
    setTimeout(() => {
      // Mock suggestions based on query
      const mockSuggestions = [
        { id: 1, title: `Lessons matching "${searchQuery}"`, type: 'search' },
        { id: 2, title: `"${searchQuery}" in content`, type: 'search' },
      ];
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 100);
  };

  // Handle search submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!query.trim()) {
      // Clear search if empty
      router.get(safeRoute('admin.lessons.index'), {}, { preserveState: true });
      return;
    }

    // Save to recent searches
    saveRecentSearch(query);

    // Perform search
    router.get(
      safeRoute('admin.lessons.index'),
      { q: query },
      { preserveState: true, replace: true }
    );

    setSuggestions([]);
  };

  // Save search to recent searches
  const saveRecentSearch = (searchQuery) => {
    try {
      const updated = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery),
      ].slice(0, maxRecentSearches);

      setRecentSearches(updated);
      localStorage.setItem('lessonSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    router.get(safeRoute('admin.lessons.index'), {}, { preserveState: true });
    inputRef.current?.focus();
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchQuery) => {
    setQuery(searchQuery);
    saveRecentSearch(searchQuery);
    router.get(
      safeRoute('admin.lessons.index'),
      { q: searchQuery },
      { preserveState: true, replace: true }
    );
    setSuggestions([]);
    setIsFocused(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const searchQuery = suggestion.title.replace(/^Lessons matching "/, '').replace(/"$/, '').replace(/^"/, '').replace(/" in content$/, '');
    handleRecentSearchClick(searchQuery);
  };

  // Check if should show dropdown
  const showDropdown = isFocused && (suggestions.length > 0 || (recentSearches.length > 0 && !query.trim()));

  return (
    <div className="relative w-full">
      {/* Search Input Container */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
          {/* Search Icon */}
          <MagnifyingGlassIcon className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              // Delay to allow click on dropdown items
              setTimeout(() => setIsFocused(false), 200);
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500"
            autoComplete="off"
          />

          {/* Loading Indicator or Clear Button */}
          <div className="absolute right-3 flex items-center gap-2">
            {isLoading && (
              <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
            )}
            {query && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Tips */}
        {!showDropdown && query && (
          <div className="mt-1 text-xs text-gray-500">
            <span>Press Enter to search</span>
            {query.length >= 3 && (
              <span> • {query.length} characters</span>
            )}
          </div>
        )}
      </form>

      {/* Dropdown Suggestions */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Search Results</p>
              </div>
              <div className="divide-y divide-gray-100">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm text-gray-700"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                    {suggestion.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {!query.trim() && recentSearches.length > 0 && showRecentSearches && (
            <div>
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Recent Searches
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center justify-between text-sm text-gray-700 group"
                  >
                    <span className="flex items-center gap-2 flex-1">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      {search}
                    </span>
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {suggestions.length === 0 && recentSearches.length === 0 && query.trim() && (
            <div className="px-3 py-6 text-center">
              <SparklesIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No suggestions found</p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
            </div>
          )}

          {/* Tips */}
          {suggestions.length === 0 && recentSearches.length === 0 && !query.trim() && (
            <div className="px-3 py-3 bg-blue-50 border-t border-gray-100">
              <p className="text-xs text-blue-700 font-medium mb-2">Search Tips:</p>
              <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                <li>Search by lesson title</li>
                <li>Search by content keywords</li>
                <li>Use quotes for exact matches</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}