// src/hooks/useClaimsList.ts
import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Claim, UseClaimsListReturn } from '../types/claim';

export function useClaimsList(userId: string | undefined, itemsPerPage: number = 14): UseClaimsListReturn {
  const { addressConnected } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchClaims = useCallback(async (filters?: { 
    coinAddress?: string; 
    status?: 'IN_PROGRESS' | 'RECEIVED' | 'FAILED'
  }) => {

    // Verify that the connected wallet matches the userId
    if (!addressConnected || !userId) {
      setError('Unauthorized access');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        userId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.coinAddress && { coinAddress: filters.coinAddress })
      });

      const response = await fetch(`/api/claims?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch claims');
      }

      const data = await response.json();
      setClaims(data.claims);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Failed to load claims');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [addressConnected, userId]);

  const setPage = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate pagination
  const totalPages = Math.ceil(claims.length / itemsPerPage);
  const paginatedClaims = claims.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    claims: paginatedClaims,
    loading,
    error,
    currentPage,
    totalPages,
    fetchClaims,
    setPage
  };
}