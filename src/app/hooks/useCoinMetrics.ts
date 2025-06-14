// src/app/hooks/useCoinMetrics.ts

import { getEthPriceInUSD } from '@/utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { CoinMetrics } from '../types/coin';

export function useEthPrice() {
  const { data: ethPrice, isLoading: isPriceLoading } = useQuery({
    queryKey: ['ethPrice'],
    queryFn: getEthPriceInUSD,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  return { ethPrice, isLoading: isPriceLoading };
}

interface MetricsResponse {
  reserves: {
    vEthReserve: string;
    vTokenReserve: string;
  };
  metrics: {
    liveMarketCap: number;
    maxMarketCap: number;
    progress: number;
  };
  ethPrice: number;
}

// Fetch function for the unified endpoint
async function fetchCoinMetrics(coinId: string): Promise<MetricsResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const response = await fetch(`/api/coins/${coinId}/metrics`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Metrics fetch failed for ${coinId}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 200)
      });
      throw new Error(`Failed to fetch coin metrics: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - useCoinMetrics.ts');
    }
    throw error;
  }
}

export function useCoinMetrics(coinId: string): CoinMetrics {
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['coinMetrics', coinId],
    queryFn: () => {
      if (!coinId) throw new Error('No coinId provided');
      return fetchCoinMetrics(coinId);
    },
    
    refetchInterval: 60000,  // 1 minute
    staleTime: 55000,        // 55 seconds
    gcTime: 60000,           // 1 minute
    
    // Error handling
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error.message.includes('404')) return false;
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    
    // Performance settings
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    
    throwOnError: false,
  });

  // Return the same interface as the old hook for compatibility
  return {
    liveMarketCap: data?.metrics.liveMarketCap ?? 0,
    maxMarketCap: data?.metrics.maxMarketCap ?? 0,
    progress: data?.metrics.progress ?? 0,
    isLoading,
    ethPrice: data?.ethPrice ?? 0,
    error: error?.message ?? null,
    reserves: data?.reserves
  };
}