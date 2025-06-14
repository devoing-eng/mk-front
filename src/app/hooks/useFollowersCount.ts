// src/hooks/useFollowersCount.ts
import { useState, useEffect } from 'react';

export function useFollowersCount(userId: string) {
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFollowersCount() {
      try {
        const response = await fetch(`/api/follow/${userId}/followers?page=1&limit=1`);
        const { success, pagination } = await response.json();
        if (success) {
          setFollowersCount(pagination.total);
        }
      } catch (error) {
        console.error('Error fetching followers count:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFollowersCount();
  }, [userId]);

  return { followersCount, loading };
}