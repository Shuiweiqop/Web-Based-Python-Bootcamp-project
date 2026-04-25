import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { 
    BookOpen,
    Clock,
    CheckCircle,
    ArrowRight,
    Filter,
    Search,
    X,
    Sparkles
} from 'lucide-react';

export default function Browse({ paths, hasActivePath }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);

    const levels = [
        { value: 'all', label: 'All Levels' },
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' }
    ];

    const getLevelGradient = (level) => {
        const gradients = {
            'beginner': 'from-green-500 to-emerald-600',
            'intermediate': 'from-blue-500 to-indigo-600',
            'advanced': 'from-purple-500 to-pink-600'
        };
        return gradients[level?.toLowerCase()] || 'from-gray-500 to-gray-600';
    };

    const getLevelBadge = (level) => {
        const badges = {
            'beginner': '🌱',
            'intermediate': '⚡',
            'advanced': '🚀'
        };
        return badges[level?.toLowerCase()] || '📚';
    };

    // Map icon names to emojis
    const getIconEmoji = (iconName) => {
        const iconMap = {
            'book': '📚',
            'code': '💻',
            'rocket': '🚀',
            'star': '⭐',
            'fire': '🔥',
            'trophy': '🏆',
            'graduation': '🎓',
            'lightbulb': '💡',
            'chart': '📊',
            'target': '🎯',
            'puzzle': '🧩',
            'brain': '🧠',
            'tool': '🔧',
            'paint': '🎨',
            'music': '🎵',
            'camera': '📷',
            'globe': '🌍',
            'science': '🔬',
            'atom': '⚛️',
            'dna': '🧬'
        };
        return iconMap[iconName?.toLowerCase()] || null;
    };

    // Get enrolled paths count
    const enrolledPaths = paths.filter(p => p.is_enrolled);
    const enrolledPathIds = enrolledPaths.map(p => p.path_id);

    // Filter paths
    const filteredPaths = paths.filter(path => {
        const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            path.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = selectedLevel === 'all' || path.difficulty_level.toLowerCase() === selectedLevel;
        const matchesEnrolled = !showEnrolledOnly || path.is_enrolled;
        
        return matchesSearch && matchesLevel && matchesEnrolled;
    });

    // Group by level
    const pathsByLevel = {
        beginner: filteredPaths.filter(p => p.difficulty_level.toLowerCase() === 'beginner'),
        intermediate: filteredPaths.filter(p => p.difficulty_level.toLowerCase() === 'intermediate'),
        advanced: filteredPaths.filter(p => p.difficulty_level.toLowerCase() === 'advanced')
    };

    const PathCard = ({ path }) => {
        const [isEnrolling, setIsEnrolling] = useState(false);

        const handleEnroll = () => {
            setIsEnrolling(true);
            router.post(route('student.paths.enroll', path.path_id), {
                set_as_primary: false
            }, {
                onFinish: () => setIsEnrolling(false)
            });
        };

        return (
            <div className="bg-black/70 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-2xl group">
                {/* Header */}
                <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                            <span className="text-4xl">
                                {getIconEmoji(path.icon) || path.icon || getLevelBadge(path.difficulty_level)}
                            </span>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                                    {path.title}
                                </h3>
                                <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${getLevelGradient(path.difficulty_level)} text-white`}>
                                    {path.difficulty_level}
                                </span>
                            </div>
                        </div>
                        {path.is_enrolled && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-300 border border-green-500/50 rounded-lg text-xs font-bold">
                                <CheckCircle className="h-4 w-4" />
                                <span>Enrolled</span>
                            </div>
                        )}
                    </div>

                    <p className="text-white/90 leading-relaxed text-sm font-medium">
                        {path.description}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 px-6 py-4 bg-white/5 border-y border-white/10">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                        <div>
                            <div className="font-bold text-white">{path.total_lessons}</div>
                            <div className="text-xs text-white/80 font-medium">Lessons</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-purple-400" />
                        <div>
                            <div className="font-bold text-white">{path.estimated_duration_hours}h</div>
                            <div className="text-xs text-white/80 font-medium">Duration</div>
                        </div>
                    </div>
                </div>

                {/* Learning Outcomes */}
                {path.learning_outcomes && (
                    <div className="px-6 py-4">
                        <h4 className="text-sm font-bold text-white mb-3">What you'll learn:</h4>
                        <div className="space-y-2">
                            {path.learning_outcomes.split('\n').slice(0, 3).map((outcome, index) => (
                                outcome.trim() && (
                                    <div key={index} className="flex items-start gap-2 text-sm text-white/90 font-medium">
                                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">{outcome}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Prerequisites */}
                {path.prerequisites && path.prerequisites !== 'No prerequisites required' && (
                    <div className="px-6 py-3 bg-amber-500/10 border-t border-amber-500/20">
                        <p className="text-xs text-amber-300 font-medium">
                            <span className="font-bold">Prerequisites:</span> {path.prerequisites}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 border-t border-white/10">
                    {path.is_enrolled ? (
                        <Link
                            href={route('student.paths.show', path.student_path_id)}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-200"
                        >
                            <span>View My Progress</span>
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={handleEnroll}
                                disabled={isEnrolling}
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
                            >
                                <Sparkles className="h-5 w-5" />
                                <span>{isEnrolling ? 'Enrolling...' : 'Enroll Now'}</span>
                            </button>
                            <Link
                                href={route('student.paths.show', path.path_id)}
                                className="w-full inline-flex items-center justify-center gap-2 px-6 py-2 text-white/90 hover:text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
                            >
                                <span>View Details</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <StudentLayout>
            <Head title="Browse Learning Paths" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                            Explore Learning Paths
                        </h1>
                        <p className="text-xl text-white/95 font-medium max-w-2xl mx-auto">
                            Choose from our curated learning paths to master new skills
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-black/70 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                            <Filter className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Filters</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search learning paths..."
                                    className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/75 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Level Filter */}
                        <div>
                            <select
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all font-medium"
                            >
                                {levels.map(level => (
                                    <option key={level.value} value={level.value} className="bg-gray-900 text-white">
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Enrolled Filter */}
                    <div className="mt-4">
                        <label className="flex items-center gap-2 cursor-pointer text-white/90 hover:text-white transition-colors">
                            <input
                                type="checkbox"
                                checked={showEnrolledOnly}
                                onChange={(e) => setShowEnrolledOnly(e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-semibold">Show only enrolled paths</span>
                        </label>
                    </div>

                    {/* Active Filters */}
                    {(searchQuery || selectedLevel !== 'all' || showEnrolledOnly) && (
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-white/90 font-semibold">Active filters:</span>
                            {searchQuery && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/50 text-xs font-bold rounded-lg">
                                    Search: {searchQuery}
                                    <button onClick={() => setSearchQuery('')}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {selectedLevel !== 'all' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/50 text-xs font-bold rounded-lg">
                                    {selectedLevel}
                                    <button onClick={() => setSelectedLevel('all')}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            {showEnrolledOnly && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/50 text-xs font-bold rounded-lg">
                                    Enrolled only
                                    <button onClick={() => setShowEnrolledOnly(false)}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedLevel('all');
                                    setShowEnrolledOnly(false);
                                }}
                                className="text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="text-white/90 font-medium">
                    <p className="text-lg">
                        Showing <span className="font-bold text-white">{filteredPaths.length}</span> learning path{filteredPaths.length !== 1 ? 's' : ''}
                        {enrolledPathIds.length > 0 && (
                            <span className="ml-2">
                                · You're enrolled in <span className="font-bold text-blue-400">{enrolledPathIds.length}</span> path{enrolledPathIds.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </p>
                </div>

                {/* Paths Grid */}
                {selectedLevel === 'all' ? (
                    <>
                        {/* Beginner Paths */}
                        {pathsByLevel.beginner.length > 0 && (
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span>🌱</span>
                                    <span>Beginner Paths</span>
                                    <span className="text-lg font-normal text-white/80">
                                        ({pathsByLevel.beginner.length})
                                    </span>
                                </h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pathsByLevel.beginner.map((path) => (
                                        <PathCard key={path.path_id} path={path} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Intermediate Paths */}
                        {pathsByLevel.intermediate.length > 0 && (
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span>⚡</span>
                                    <span>Intermediate Paths</span>
                                    <span className="text-lg font-normal text-white/80">
                                        ({pathsByLevel.intermediate.length})
                                    </span>
                                </h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pathsByLevel.intermediate.map((path) => (
                                        <PathCard key={path.path_id} path={path} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Advanced Paths */}
                        {pathsByLevel.advanced.length > 0 && (
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span>🚀</span>
                                    <span>Advanced Paths</span>
                                    <span className="text-lg font-normal text-white/80">
                                        ({pathsByLevel.advanced.length})
                                    </span>
                                </h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pathsByLevel.advanced.map((path) => (
                                        <PathCard key={path.path_id} path={path} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Filtered Results */
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPaths.map((path) => (
                            <PathCard key={path.path_id} path={path} />
                        ))}
                    </div>
                )}

                {/* No Results */}
                {filteredPaths.length === 0 && (
                    <div className="bg-black/70 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl">
                        <BookOpen className="h-20 w-20 text-white/40 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">
                            No paths found
                        </h3>
                        <p className="text-white/90 mb-6 font-medium">
                            Try adjusting your filters or search query
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedLevel('all');
                                setShowEnrolledOnly(false);
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
