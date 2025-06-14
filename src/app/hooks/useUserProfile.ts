// src/app/hooks/useUserProfile.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchUserProfile } from '../services/api';
import { UserProfileData } from '../types/user';

const USER_PROFILE_KEY = 'userProfile';

export function useUserProfile(userAddress: string): UseQueryResult<UserProfileData> {
  return useQuery({
    queryKey: [USER_PROFILE_KEY, userAddress],
    queryFn: () => fetchUserProfile(userAddress),
    staleTime: 15 * 60 * 1000, // Consider data stale after 15 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}