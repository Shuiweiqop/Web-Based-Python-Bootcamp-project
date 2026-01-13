// resources/js/Pages/Admin/Lessons/components/FilterPanel.jsx
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
  FunnelIcon,
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { safeRoute } from '@/utils/routeHelpers';

export default function FilterPanel({ currentFilters = {}, onClose }) {
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [isDirty, setIsDirty] = useState(false);

  // Filter configurations
  const filterOptions = {
    difficulty: {
      label: 'Difficulty Level',
      icon: '🎯',
      options: [
        { value: 'beginner', label: 'Beginner', description: 'For newcomers', color: 'bg-green-100 text-green-800 border-green-300' },
        { value: 'intermediate', label: 'Intermediate', description: 'Moderate experience needed', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        { value: 'advanced', label: 'Advanced', description: 'For experienced learners', color: 'bg-red-100 text-red-800 border-red-300' },
      ],
    },
    status: {
      label: 'Status',
      icon: '📊',
      options: [
        { value: 'active', label: 'Active', description: 'Visible to students', color: 'bg-green-100 text-green-800 border-green-300' },
        { value: 'inactive', label: 'Inactive', description: 'Hidden from students', color: 'bg-gray-100 text-gray-800 border-gray-300' },
        { value: 'draft', label: 'Draft', description: 'Work in progress', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      ],
    },
  };

  // Handle filter toggle
  const handleFilterToggle = (filterType, filterValue) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === filterValue ? undefined : filterValue,
    }));
    setIsDirty(true);
  };

  // Handle clear single filter
  const handleClearFilter = (filterType) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterType]: undefined,
    }));
    setIsDirty(true);
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    const params = {};
    
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== undefined) {
        params[key] = value;
      }
    });

    router.get(
      safeRoute('admin.lessons.index'),
      params,
      { preserveState: true, replace: true }
    );
    
    setIsDirty(false);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setLocalFilters({});
    setIsDirty(true);
  };

  // Handle clear all and close
  const handleClearAndClose = () => {
    router.get(
      safeRoute('admin.lessons.index'),
      {},
      { preserveState: true, replace: true }
    );
    onClose?.();
  };

  // Count active filters
  const activeFilterCount = Object.values(localFilters).filter(v => v !== undefined).length;

  // Check if filters have changed from current
  const hasChanges = JSON.stringify(localFilters) !== JSON.stringify(currentFilters);

  return (
    <div className="animate-in fade-in duration-200">
      <div className="mt-4 pt-4 border-t border-gray-200">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-700" />
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Close filters"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Groups */}
        <div className="space-y-6">
          {Object.entries(filterOptions).map(([filterType, filterConfig]) => (
            <div key={filterType} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              {/* Filter Group Header */}
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900 flex items-center">
                  <span className="mr-2 text-lg">{filterConfig.icon}</span>
                  {filterConfig.label}
                </label>
                
                {localFilters[filterType] && (
                  <button
                    onClick={() => handleClearFilter(filterType)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                    title={`Clear ${filterConfig.label.toLowerCase()}`}
                  >
                    <XMarkIcon className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              {/* Filter Options */}
              <div className="space-y-2">
                {filterConfig.options.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterToggle(filterType, option.value)}
                    className={`w-full text-left px-3 py-2 rounded-md border-2 transition-all flex items-center justify-between group ${
                      localFilters[filterType] === option.value
                        ? `${option.color} border-current shadow-sm`
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {option.label}
                      </div>
                      <div className={`text-xs ${
                        localFilters[filterType] === option.value
                          ? 'opacity-90'
                          : 'text-gray-500'
                      }`}>
                        {option.description}
                      </div>
                    </div>
                    
                    {/* Checkbox */}
                    <div className={`ml-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      localFilters[filterType] === option.value
                        ? 'border-current bg-current'
                        : 'border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {localFilters[filterType] === option.value && (
                        <CheckIcon className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(localFilters).map(([key, value]) => {
                if (!value) return null;
                
                const filterConfig = filterOptions[key];
                const option = filterConfig?.options?.find(o => o.value === value);
                
                return (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${option?.color}`}
                  >
                    {option?.label}
                    <button
                      onClick={() => handleFilterToggle(key, value)}
                      className="hover:opacity-70 transition-opacity"
                      title={`Remove ${option?.label} filter`}
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          {/* Reset Button */}
          <button
            onClick={handleResetFilters}
            disabled={activeFilterCount === 0}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeFilterCount === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Reset all filters"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Reset
          </button>

          {/* Apply Button */}
          <button
            onClick={handleApplyFilters}
            disabled={!isDirty}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isDirty
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                : 'bg-blue-100 text-blue-400 cursor-not-allowed'
            }`}
            title="Apply selected filters"
          >
            Apply Filters
            {hasChanges && <span className="ml-1 w-2 h-2 bg-white rounded-full inline-block" />}
          </button>

          {/* Clear All */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAndClose}
              className="px-3 py-2 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              title="Clear all filters and close"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filter Info */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-xs text-amber-800">
            <strong>Tip:</strong> Select one filter per category. Multiple selections replace the previous choice.
          </p>
        </div>
      </div>
    </div>
  );
}