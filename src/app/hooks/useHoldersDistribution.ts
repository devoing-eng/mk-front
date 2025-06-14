// src/app/hooks/useHoldersDistribution.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { HolderInfo } from '../types/coin';

const HOLDERS_KEY = 'holdersDistribution';

async function fetchHoldersDistribution(coinId: string): Promise<HolderInfo[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

  try {
    const response = await fetch(`/api/coins/${coinId}/holders`, {
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch holders distribution');
    }
    
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function useHoldersDistribution(coinId: string): UseQueryResult<HolderInfo[]> {

  return useQuery({
    queryKey: [HOLDERS_KEY, coinId],
    queryFn: () => fetchHoldersDistribution(coinId),
    refetchInterval: 60000, // Refetch every 60s
    staleTime: 55000,      // Consider data stale after 55s
    gcTime: 60000,        // Keep in cache for 60s
    select: (data) => {
      return [...data].sort((a, b) => 
        parseFloat(b.percentage) - parseFloat(a.percentage)
      );
    }
  });
}