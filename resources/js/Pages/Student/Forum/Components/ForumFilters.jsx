import { Search, X } from 'lucide-react';
import { useSFX } from '@/Contexts/SFXContext';

export default function ForumFilters({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    sortBy,
    categories,
    onSearch,
    onCategoryChange,
    onSortChange,
    isDark = true,
}) {
    const { playSFX } = useSFX();

    const sortOptions = [
        { value: 'recent', label: '🕐 Most Recent' },
        { value: 'popular', label: '🔥 Most Popular' },
        { value: 'replies', label: '💬 Most Replied' },
        { value: 'views', label: '👁️ Most Viewed' },
    ];

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        playSFX('search');
        onSearch(e);
    };

    const handleClearSearch = () => {
        playSFX('click');
        setSearchQuery('');
        onCategoryChange(selectedCategory);
    };

    return (
        <div className={`${isDark ? 'bg-slate-950/72 border-white/12' : 'bg-white/85 border-gray-200'} backdrop-blur-xl border rounded-2xl shadow-2xl p-6 mb-8`}>
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                        onFocus={() => playSFX('hover')}
                        placeholder="Search posts by title or content..."
                        className={`
                            w-full pl-12 pr-12 py-4 
                            ${isDark ? 'bg-slate-950/78 border-white/16 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}
                            backdrop-blur-sm
                            border
                            rounded-xl 
                            focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                            ${isDark ? 'focus:bg-black/40' : 'focus:bg-white'}
                            transition-all duration-200
                            shadow-lg
                            ripple-effect
                        `}
                    />
                    <Search className="
                        absolute left-4 top-1/2 transform -translate-y-1/2 
                        w-5 h-5 text-gray-400
                        group-focus-within:text-blue-400
                        transition-colors duration-200
                        animate-pulse-slow
                    " />
                    
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            onMouseEnter={() => playSFX('hover')}
                            className={`
                                absolute right-4 top-1/2 transform -translate-y-1/2 
                                ${isDark ? 'text-gray-400 hover:text-white bg-white/10 hover:bg-red-500/30' : 'text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-red-100'}
                                rounded-lg p-1
                                transition-all duration-200
                                ripple-effect button-press-effect
                            `}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Category Filter */}
                <div className="flex-1">
                    <label className={`block text-sm font-bold mb-3 ${isDark ? 'text-white drop-shadow-lg' : 'text-gray-800'}`}>
                        Filter by Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                playSFX('click');
                                onCategoryChange('all');
                            }}
                            onMouseEnter={() => playSFX('hover')}
                            className={`
                                px-4 py-2.5 rounded-xl font-bold text-sm
                                transition-all duration-200
                                ripple-effect button-press-effect
                                ${selectedCategory === 'all'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl shadow-blue-500/50 ring-2 ring-blue-400/50 scale-105 animate-glowPulse'
                                    : isDark
                                      ? 'bg-white/10 text-gray-100 hover:bg-white/20 hover:text-white border border-white/20 hover:scale-105'
                                      : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-300 hover:scale-105'
                                }
                            `}
                        >
                            All Posts
                        </button>
                        {Object.entries(categories).map(([key, category]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    playSFX('click');
                                    onCategoryChange(key);
                                }}
                                onMouseEnter={() => playSFX('hover')}
                                className={`
                                    px-4 py-2.5 rounded-xl font-bold text-sm
                                    flex items-center gap-2
                                    transition-all duration-200
                                    ripple-effect button-press-effect
                                    ${selectedCategory === key
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl shadow-blue-500/50 ring-2 ring-blue-400/50 scale-105 animate-glowPulse'
                                        : isDark
                                          ? 'bg-white/10 text-gray-100 hover:bg-white/20 hover:text-white border border-white/20 hover:scale-105'
                                          : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-300 hover:scale-105'
                                    }
                                `}
                            >
                                <span className="text-base animate-pulse-slow">{category.icon}</span>
                                <span>{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Options */}
                <div className="lg:w-64">
                    <label className={`block text-sm font-bold mb-3 ${isDark ? 'text-white drop-shadow-lg' : 'text-gray-800'}`}>
                        Sort By
                    </label>
                    <select
                        value={sortBy}
                        onChange={(e) => {
                            playSFX('click');
                            onSortChange(e.target.value);
                        }}
                        onFocus={() => playSFX('hover')}
                        className={`
                            w-full px-4 py-3 
                            ${isDark ? 'bg-slate-950/78 border-white/16 text-white' : 'bg-white border-gray-300 text-gray-900'}
                            backdrop-blur-sm
                            border
                            rounded-xl 
                            font-medium
                            focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                            ${isDark ? 'focus:bg-black/40' : 'focus:bg-white'}
                            transition-all duration-200
                            shadow-lg
                            cursor-pointer
                            ripple-effect
                        `}
                    >
                        {sortOptions.map((option) => (
                            <option 
                                key={option.value} 
                                value={option.value}
                                className={isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
