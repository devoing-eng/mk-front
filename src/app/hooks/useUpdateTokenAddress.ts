// hooks/useUpdateTokenAddress.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCoinTokenAddress } from '../services/api';
import { STATIC_COIN_DATA_KEY } from './useStaticCoinData';
import { CoinStaticData } from '../types/coin';

export function useUpdateTokenAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ coinId, tokenAddress }: { coinId: string, tokenAddress: string }) =>
      updateCoinTokenAddress(coinId, tokenAddress),
    onSuccess: (_, { coinId, tokenAddress }) => {
      // Update the cached static data
      queryClient.setQueryData<CoinStaticData>(
        [STATIC_COIN_DATA_KEY, coinId],
        (oldData) => oldData ? {
          ...oldData,
          tokenAddress
        } : undefined
      );
    }
  });
}