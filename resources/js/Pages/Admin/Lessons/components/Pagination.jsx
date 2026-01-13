// resources/js/Pages/Admin/Lessons/components/Pagination.jsx
import React, { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { safeRoute } from '@/utils/routeHelpers';

export default function Pagination({ 
  meta = {}, 
  filters = {},
  maxVisiblePages = 5,
  showEdgeLinks = true,
  showPageInfo = true,
  compact = false,
}) {
  // Handle missing meta
  if (!meta || meta.last_page <= 1) {
    return null;
  }

  const {
    current_page = 1,
    last_page = 1,
    from = 0,
    to = 0,
    total = 0,
    per_page = 10,
  } = meta;

  // Calculate visible page numbers
  const getVisiblePages = useMemo(() => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, current_page - half);
    let end = Math.min(last_page, start + maxVisiblePages - 1);

    // Adjust start if end is near last page
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    // Add first page if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('ellipsis');
      }
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add last page if needed
    if (end < last_page) {
      if (end < last_page - 1) {
        pages.push('ellipsis');
      }
      pages.push(last_page);
    }

    return pages;
  }, [current_page, last_page, maxVisiblePages]);

  // Build page URL
  const getPageUrl = (pageNumber) => {
    return safeRoute('admin.lessons.index', {
      page: pageNumber,
      ...filters,
    });
  };

  // Pagination info text
  const getInfoText = () => {
    if (total === 0) return 'No results';
    return `Showing ${from} to ${to} of ${total} results`;
  };

  // Calculate total pages info
  const totalPagesInfo = `Page ${current_page} of ${last_page}`;

  // Compact view for mobile
  if (compact) {
    return (
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between gap-2">
          {/* Previous */}
          {current_page > 1 ? (
            <Link
              href={getPageUrl(current_page - 1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Previous page"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Link>
          ) : (
            <button
              disabled
              className="p-2 text-gray-300 cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
          )}

          {/* Page Info */}
          <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
            {totalPagesInfo}
          </span>

          {/* Next */}
          {current_page < last_page ? (
            <Link
              href={getPageUrl(current_page + 1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Next page"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </Link>
          ) : (
            <button
              disabled
              className="p-2 text-gray-300 cursor-not-allowed"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left: Info */}
        {showPageInfo && (
          <div className="text-sm text-gray-600">
            {getInfoText()}
            <span className="mx-2 text-gray-300">•</span>
            <span className="font-medium">{totalPagesInfo}</span>
          </div>
        )}

        {/* Center: Page numbers */}
        <div className="flex items-center gap-1">
          {/* First page button */}
          {showEdgeLinks && current_page > 1 && (
            <Link
              href={getPageUrl(1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="First page"
            >
              <ChevronDoubleLeftIcon className="w-4 h-4" />
            </Link>
          )}

          {/* Previous button */}
          {current_page > 1 ? (
            <Link
              href={getPageUrl(current_page - 1)}
              className="px-3 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
              title="Previous page"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Previous</span>
            </Link>
          ) : (
            <button
              disabled
              className="px-3 py-2 text-gray-400 border border-gray-200 rounded cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Previous</span>
            </button>
          )}

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getVisiblePages.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 py-2 text-gray-400"
                  >
                    <EllipsisHorizontalIcon className="w-4 h-4" />
                  </span>
                );
              }

              return (
                <Link
                  key={page}
                  href={getPageUrl(page)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                    current_page === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  title={`Go to page ${page}`}
                >
                  {page}
                </Link>
              );
            })}
          </div>

          {/* Next button */}
          {current_page < last_page ? (
            <Link
              href={getPageUrl(current_page + 1)}
              className="px-3 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
              title="Next page"
            >
              <span className="hidden sm:inline text-sm">Next</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          ) : (
            <button
              disabled
              className="px-3 py-2 text-gray-400 border border-gray-200 rounded cursor-not-allowed flex items-center gap-1"
            >
              <span className="hidden sm:inline text-sm">Next</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          )}

          {/* Last page button */}
          {showEdgeLinks && current_page < last_page && (
            <Link
              href={getPageUrl(last_page)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Last page"
            >
              <ChevronDoubleRightIcon className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Right: Summary */}
        <div className="text-xs text-gray-500 text-center sm:text-right">
          <p>
            <span className="font-medium text-gray-700">{total}</span>
            {' '}total result{total !== 1 ? 's' : ''}
          </p>
          <p>
            <span className="font-medium text-gray-700">{per_page}</span>
            {' '}per page
          </p>
        </div>
      </div>

      {/* Quick jump (optional) */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
        <label htmlFor="quick-jump" className="text-sm text-gray-600">
          Go to page:
        </label>
        <select
          id="quick-jump"
          onChange={(e) => {
            const pageNum = parseInt(e.target.value);
            if (pageNum && pageNum !== current_page) {
              window.location.href = getPageUrl(pageNum);
            }
          }}
          value={current_page}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Array.from({ length: last_page }, (_, i) => i + 1).map(page => (
            <option key={page} value={page}>
              Page {page}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}