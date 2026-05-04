// resources/js/Pages/Admin/Lessons/Index.jsx
import React, { useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { safeRoute } from '@/utils/routeHelpers';
import { cn } from '@/utils/cn';

// Import sub-components
import StatisticsCards from './components/StatisticsCards';
import LessonCard from './components/LessonCard';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import Pagination from '@/Components/Pagination';
import EmptyState from './components/EmptyState';

export default function Index({ auth }) {
  const { lessons, filters, statistics } = usePage().props;
  const [showFilters, setShowFilters] = useState(false);
  const [isDark, setIsDark] = useState(true); 
  const quickDraftForm = useForm({
    title: '',
    difficulty: 'beginner',
  });
  const meta = lessons?.meta || {};
  const data = lessons?.data || [];

  // Handle lesson deletion
  const handleDelete = (lessonId, lessonTitle) => {
    if (!lessonId) {
      alert('Internal error: missing lesson id for "' + (lessonTitle || '') + '"');
      return;
    }

    if (!confirm(
      `Are you sure you want to delete "${lessonTitle}"?\n\n` +
      `This will also delete:\n` +
      `• All exercises\n` +
      `• All tests and questions\n` +
      `• All student progress\n\n` +
      `This action cannot be undone.`
    )) {
      return;
    }

    router.delete(safeRoute('admin.lessons.destroy', lessonId), {
      preserveScroll: true,
      onSuccess: () => {
        console.log('Lesson deleted successfully');
      },
      onError: (errs) => {
        console.error('Delete failed', errs);
        alert('Failed to delete lesson. See console for details.');
      }
    });
  };

  // Handle bulk actions
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLessons(data.map(l => l.lesson_id));
    } else {
      setSelectedLessons([]);
    }
  };

  const handleSelectLesson = (lessonId) => {
    setSelectedLessons(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedLessons.length === 0) return;

    if (bulkAction === 'delete') {
      if (!confirm(`Delete ${selectedLessons.length} lesson(s)? This cannot be undone.`)) {
        return;
      }
    }

    router.post(safeRoute('admin.lessons.bulk-action'), {
      action: bulkAction,
      lesson_ids: selectedLessons,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedLessons([]);
        setBulkAction('');
      },
      onError: (errs) => {
        console.error('Bulk action failed', errs);
        alert('Failed to perform bulk action. See console for details.');
      }
    });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    router.get(safeRoute('admin.lessons.index'), {}, { preserveState: true });
  };

  const handleQuickDraft = (e) => {
    e.preventDefault();

    quickDraftForm.post(safeRoute('admin.lessons.quick-draft'), {
      preserveScroll: true,
    });
  };

  return (
    <AuthenticatedLayout
      user={auth?.user}
      header={
        <div className="flex items-center justify-between animate-fadeIn">
          <div>
            <h2 className="font-semibold text-3xl leading-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Lessons Management
            </h2>
            <p className="text-sm mt-2 text-slate-300">
              Manage and organize your course lessons
            </p>
          </div>
          <Link
            href={safeRoute('admin.lessons.create')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 hover-lift ripple-effect button-press-effect font-medium"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Lesson
          </Link>
        </div>
      }
    >
      <Head title="Lessons Management" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/80 p-6 shadow-2xl">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  Teacher Fast Path
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  Start a lesson shell in under 10 seconds
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  Create the draft first, then finish content, sections, practice, checks, and publish settings from a guided checklist.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {['Draft by default', 'Opens a next-step checklist', 'Great for series lessons'].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 font-medium text-cyan-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleQuickDraft}
                className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm"
              >
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-100">
                      Lesson Title
                    </label>
                    <input
                      type="text"
                      value={quickDraftForm.data.title}
                      onChange={(e) => quickDraftForm.setData('title', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                      placeholder="e.g. Python loops quick draft"
                    />
                    {quickDraftForm.errors.title && (
                      <p className="mt-2 text-sm text-red-300">{quickDraftForm.errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-100">
                      Difficulty
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ['beginner', 'Beginner'],
                        ['intermediate', 'Intermediate'],
                        ['advanced', 'Advanced'],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => quickDraftForm.setData('difficulty', value)}
                          className={cn(
                            'rounded-xl border px-3 py-2 text-sm font-semibold transition-all',
                            quickDraftForm.data.difficulty === value
                              ? 'border-cyan-300 bg-cyan-400/15 text-white'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {quickDraftForm.errors.difficulty && (
                      <p className="mt-2 text-sm text-red-300">{quickDraftForm.errors.difficulty}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={quickDraftForm.processing}
                      className="inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      {quickDraftForm.processing ? 'Creating Draft...' : 'Quick Draft'}
                    </button>

                    <Link
                      href={safeRoute('admin.lessons.create')}
                      className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10 hover:text-white"
                    >
                      Full Builder
                    </Link>

                    <Link
                      href={safeRoute('admin.ai-lessons.create')}
                      className="inline-flex items-center rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-5 py-3 text-sm font-semibold text-fuchsia-100 transition-all hover:bg-fuchsia-500/15"
                    >
                      AI Draft
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div>
              <StatisticsCards 
                statistics={statistics}
                currentData={data}
              />
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="mb-6 glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 p-6 animate-slideDown">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <SearchBar 
                  initialQuery={filters?.q || ''}
                  placeholder="Search lessons by title or content..."
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "inline-flex items-center px-6 py-3 border rounded-lg transition-all whitespace-nowrap ripple-effect button-press-effect font-medium",
                  showFilters || filters?.difficulty || filters?.status
                    ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/20 animate-glowPulse'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 card-hover-effect'
                )}
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filters
                {(filters?.difficulty || filters?.status) && (
                  <span className="ml-2 px-2.5 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs rounded-full shadow-lg animate-bounceIn">
                    {[filters?.difficulty, filters?.status].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="animate-slideDown">
                <FilterPanel 
                  currentFilters={filters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            )}

            {/* Active Filters Display */}
            {(filters?.q || filters?.difficulty || filters?.status) && (
              <div className="mt-6 pt-6 border-t border-white/10 animate-fadeIn">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-slate-300 font-semibold">Active filters:</span>
                  
                  {filters?.q && (
                    <FilterTag 
                      label={`Search: "${filters.q}"`}
                      onRemove={() => router.get(safeRoute('admin.lessons.index'), {
                        ...filters,
                        q: undefined,
                      }, { preserveState: true })}
                    />
                  )}
                  
                  {filters?.difficulty && (
                    <FilterTag 
                      label={`Difficulty: ${filters.difficulty}`}
                      onRemove={() => router.get(safeRoute('admin.lessons.index'), {
                        ...filters,
                        difficulty: undefined,
                      }, { preserveState: true })}
                    />
                  )}
                  
                  {filters?.status && (
                    <FilterTag 
                      label={`Status: ${filters.status}`}
                      onRemove={() => router.get(safeRoute('admin.lessons.index'), {
                        ...filters,
                        status: undefined,
                      }, { preserveState: true })}
                    />
                  )}

                  <Link
                    href={safeRoute('admin.lessons.index')}
                    className="text-sm text-cyan-400 hover:text-cyan-300 font-medium ml-2 transition-colors ripple-effect"
                  >
                    Clear all
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions Bar */}
          {data.length > 0 && (
            <div className="mb-6 glassmorphism-enhanced rounded-xl shadow-2xl border border-white/10 p-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <label className="flex items-center whitespace-nowrap group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLessons.length === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-purple-400/50 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer transition-all"
                    />
                    <span className="ml-3 text-sm text-slate-200 group-hover:text-white transition-colors font-medium">
                      Select all ({selectedLessons.length} selected)
                    </span>
                  </label>

                  {selectedLessons.length > 0 && (
                    <div className="flex items-center gap-3 animate-bounceIn">
                      <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                        className="text-sm border border-white/20 bg-white/5 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all card-hover-effect"
                      >
                        <option value="" className="bg-slate-800">Bulk actions...</option>
                        <option value="activate" className="bg-slate-800">Set to Active</option>
                        <option value="deactivate" className="bg-slate-800">Set to Inactive</option>
                        <option value="draft" className="bg-slate-800">Set to Draft</option>
                        <option value="delete" className="bg-slate-800">Delete</option>
                      </select>

                      <button
                        onClick={handleBulkAction}
                        disabled={!bulkAction}
                        className="px-6 py-2 text-sm bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 font-semibold ripple-effect button-press-effect"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg text-sm text-white font-medium shadow-lg animate-pulse-slow">
                  <span className="mr-2">📚</span>
                  {meta.total} lesson{meta.total !== 1 ? 's' : ''} total
                </div>
              </div>
            </div>
          )}

          {/* Lessons List */}
          {data.length === 0 ? (
            <div>
              <EmptyState 
                hasFilters={!!(filters?.q || filters?.difficulty || filters?.status)}
                searchQuery={filters?.q}
                onClearFilters={handleClearFilters}
                 isDark={isDark}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((lesson) => (
                <div key={lesson.lesson_id}>
                  <LessonCard
                    lesson={lesson}
                    isSelected={selectedLessons.includes(lesson.lesson_id)}
                    onSelect={() => handleSelectLesson(lesson.lesson_id)}
                    onDelete={handleDelete}
                    isDark={isDark}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.total > 0 && meta.last_page > 1 && (
            <div className="mt-8 animate-fadeIn">
              <Pagination 
                meta={meta}
                filters={filters}
              />
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

/**
 * Filter Tag Component
 * Displays active filters with remove button
 */
function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-400/50 text-white text-sm font-medium rounded-full shadow-lg hover-lift transition-all animate-bounceIn">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 transition-all ripple-effect button-press-effect"
        title="Remove filter"
      >
        <XMarkIcon className="w-3 h-3" />
      </button>
    </span>
  );
}
