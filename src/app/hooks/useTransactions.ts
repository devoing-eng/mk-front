// src/app/hooks/useTransactions.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { TransactionData } from '../types/coin';

const TRANSACTIONS_KEY = 'transactions';

interface TransactionsResponse {
 tokenAddress: string;
 transactions: TransactionData[];
}

async function fetchTransactions(coinId: string): Promise<TransactionsResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`/api/coins/${coinId}/transactions`, {
      signal: controller.signal
    });
    
    if (!response.ok) {
      if (response.status === 504) {
        // Handle timeout specifically
        throw new Error('Request timed out');
      }
      throw new Error('Failed to fetch transactions');
    }
    
    const data = await response.json();
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export function useTransactions(coinId: string): UseQueryResult<TransactionData[]> {
  // useTokenUpdates(coinId);

  return useQuery({
    queryKey: [TRANSACTIONS_KEY, coinId],
    queryFn: async () => {
      const data = await fetchTransactions(coinId);
      return data.transactions;
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 55000,      // Consider data stale after 55 seconds
    gcTime: 60000,         // Keep in cache for 60 seconds
    retry: (failureCount, error) => {
      // Don't retry on 404s
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}