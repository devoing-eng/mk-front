// src/app/hooks/useAffiliateCodes.ts

import { AffiliateCode } from '../types/affiliateCodes';
import { useQuery } from '@tanstack/react-query';

export function useAffiliateCodes() {
  return useQuery({
    queryKey: ['affiliateCodes'],
    queryFn: async () => {
      const response = await fetch('/api/admin/affiliate-codes');
      if (!response.ok) throw new Error('Failed to fetch affiliate codes');
      return response.json() as Promise<AffiliateCode[]>;
    },
    staleTime: 100 * 60 * 1000, // 100 minutes - codes don't change often
  });
}