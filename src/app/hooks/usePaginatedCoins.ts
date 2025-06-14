// hooks/usePaginatedCoins.ts

import { useQuery } from '@tanstack/react-query';
import { PaginatedCoinsResponse } from '../types/coin';

// Fetch function
async function fetchPaginatedCoins(
  filter: string, 
  page: number, 
  limit: number
): Promise<PaginatedCoinsResponse> {
  const searchParams = new URLSearchParams({
    filter,
    page: page.toString(),
    limit: limit.toString()
  });
  
  const response = await fetch(`/api/coins/paginated?${searchParams}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch coins: ${response.status}`);
  }
  
  return response.json();
}

// Hook
export function usePaginatedCoins(
  filter: string = 'trending',
  page: number = 1, 
  limit: number = 27
) {
  return useQuery({
    queryKey: ['paginatedCoins', filter, page, limit],
    queryFn: () => fetchPaginatedCoins(filter, page, limit),
    
    // Cache strategy
    staleTime: getCacheTime(filter),
    refetchInterval: getRefetchInterval(filter),
    
    // Performance optimizations
    // keepPreviousData: true, // ✨ KEY: Evite le flash pendant le loading
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    
    // Error handling
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error.message.includes('4')) return false;
      return failureCount < 2;
    },
    retryDelay: 1000,
    
    // Loading states
    notifyOnChangeProps: ['data', 'error', 'isLoading', 'isFetching'],
  });
}

// Helper functions for cache strategy
function getCacheTime(filter: string): number {
  switch (filter) {
    case 'trending': return 10 * 1000;  // 10 seconds - data changes frequently
    case 'new': return 30 * 1000;       // 30 seconds - new coins added occasionally
    default: return 60 * 1000;          // 1 minute - progress data updates
  }
}

function getRefetchInterval(filter: string): number {
  switch (filter) {
    case 'trending': return 30 * 1000;  // Refresh every 30 seconds
    case 'max_progress': 
    case 'min_progress': return 60 * 1000; // Refresh every minute
    default: return 2 * 60 * 1000;
  }
}