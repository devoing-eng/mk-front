// hooks/useRecentPurchases.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Purchase } from '../types/coin';

export function useRecentPurchases(): UseQueryResult<Purchase[]> {
  return useQuery({
    queryKey: ['recentPurchases'],
    queryFn: async () => {
      const response = await fetch('/api/coins/recent-purchases');
      if (!response.ok) throw new Error('Failed to fetch recent purchases');
      return response.json();
    },
    refetchInterval: 150000, // Poll every 2.5 min
    staleTime: 150000,       // Consider data stale after 2.5 min
  });
}