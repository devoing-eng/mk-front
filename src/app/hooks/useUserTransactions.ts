// hooks/useUserTransactions.ts
import { UserTransaction, UserTransactionsResponse } from '../types/user';
import { useState, useEffect } from 'react';

export function useUserTransactions(userAddress: string) {
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userAddress}/transactions`);
        const result: UserTransactionsResponse = await response.json();

        if (!result.success) {
          throw new Error('Failed to fetch transactions');
        }

        setTransactions(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userAddress]);

  return { transactions, loading, error };
}