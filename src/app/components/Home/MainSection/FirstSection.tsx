// /app/components/Home/MainSection/FirstSection.tsx

'use client';

import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { useState, useCallback } from 'react';
import { usePaginatedCoins } from '@/app/hooks/usePaginatedCoins';
import { LiveBar } from './LiveBar';
import { CoinFilters } from './CoinFilters';
import { FirstSectionCard } from './FirstSectionCard';

const ITEMS_PER_PAGE = 27;

type FilterValue = 'trending' | 'new' | 'min_progress' | 'max_progress' | 'finalized';

export const FirstSection = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>('trending');
  const [currentPage, setCurrentPage] = useState(1);

  // 🚀 UN SEUL HOOK pour tout remplacer !
  const { 
    data: response, 
    isLoading, 
    isFetching,
    error 
  } = usePaginatedCoins(selectedFilter, currentPage, ITEMS_PER_PAGE);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilter: FilterValue) => {
    setSelectedFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  // Handle page changes
  const handlePageChange = useCallback((newPage: number) => {
    if (response?.pagination && newPage >= 1 && newPage <= response.pagination.totalPages) {
      setCurrentPage(newPage);
    }
  }, [response?.pagination]);

  // Loading skeleton
  if (isLoading && !response) {
    return (
      <section className="bg-gradient-to-t from-[#0D121F] via-gray-900 to-indigo-900 text-white p-4 sm:p-8 lg:p-16">
        <div className='flex flex-col gap-8 justify-start w-full mb-8'>
          <LiveBar />
          <CoinFilters
            selectedFilter={selectedFilter}
            onFilterChange={handleFilterChange}
            isLoading={true}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Loading Skeleton */}
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
              <div className="h-48 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="bg-gradient-to-t from-[#0D121F] via-gray-900 to-indigo-900 text-white p-4 sm:p-8 lg:p-16">
        <div className='flex flex-col gap-8 justify-start w-full mb-8'>
          <LiveBar />
        </div>
        <div className="flex justify-center">
          <div className="text-red-400">Error loading coins: {error.message}</div>
        </div>
      </section>
    );
  }

  const coins = response?.coins || [];
  const pagination = response?.pagination;

  return (
    <section className="bg-gradient-to-t from-[#0D121F] via-gray-900 to-indigo-900 text-white p-4 sm:p-8 lg:p-16">
      <div className='flex flex-col gap-8 justify-start w-full mb-8'>
        <LiveBar />
        <CoinFilters
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
          isLoading={isFetching}
        />
      </div>

      {/* Coins Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {coins.map((coin) => (
          <FirstSectionCard
            key={coin.id}
            coin={coin}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrevPage || isFetching}
            className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoChevronBackOutline />
          </button>
          
          <span className="px-3 py-1 border rounded-md border-gray-500">
            <span className='font-bold text-indigo-300'>{pagination.currentPage}</span>{' '}
            <span className='font-light'>/ {pagination.totalPages}</span>
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage || isFetching}
            className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoChevronForwardOutline />
          </button>
        </div>
      )}

      {/* Total count info */}
      {pagination && (
        <div className="mt-4 text-center text-gray-400 text-sm">
          Showing {coins.length} of {pagination.totalCount} coins
        </div>
      )}
    </section>
  );
};