// hooks/useStaticCoinData.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchCoinStaticData } from '../services/api';
import { CoinStaticData } from '../types/coin';

export const STATIC_COIN_DATA_KEY = 'staticCoinData';

export function useStaticCoinData(coinId: string): UseQueryResult<CoinStaticData> {
  return useQuery({
    queryKey: [STATIC_COIN_DATA_KEY, coinId],
    queryFn: () => fetchCoinStaticData(coinId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}