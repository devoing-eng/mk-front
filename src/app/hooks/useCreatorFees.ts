import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FeesData } from '../types/coin';

interface UseCreatorFeesReturn {
  fees: FeesData;
  loading: boolean;
  error: Error | null;
  fetchFees: () => Promise<void>;
  refetch: () => Promise<void>;
}

const DEFAULT_FEES_DATA: FeesData = {
  totalFeesETH: "0",
  totalFeesUSD: "0",
  totalAvailableFeesETH: "0",
  totalAvailableFeesUSD: "0",
  coins: []
};

export const useCreatorFees = (userAddress: string): UseCreatorFeesReturn => {
  const [fees, setFees] = useState<FeesData>(DEFAULT_FEES_DATA);;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFees = useCallback(async () => {
    if (!userAddress) {
      setFees(DEFAULT_FEES_DATA);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/creator-fees/user/${userAddress}/fees`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const { success, data, error } = await response.json();
      
      if (!success) {
        throw new Error(error || 'Failed to fetch fees');
      }

      setFees(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch creator fees';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
      // Set default data on error
      setFees(DEFAULT_FEES_DATA);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  // Alias for fetchFees to make the API more intuitive
  const refetch = useCallback(() => fetchFees(), [fetchFees]);

  return { fees, loading, error, fetchFees, refetch };
};