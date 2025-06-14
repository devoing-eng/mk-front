// src/app/hooks/useUser.ts
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  address: string;
  username: string;
  profileImage: string;
  bio: string;
}

export function useUser() {
  const { addressConnected, isConnected, token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileFetched, setProfileFetched] = useState(false);

  // Function to fetch the user's profile data by address
  const fetchUserData = useCallback(async () => {
    if (isConnected && addressConnected && !profileFetched) {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/address/${addressConnected.toLowerCase()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });

        const data = await response.json();
        if (data.success) {
          setUser({
            ...data.data,
            profileImage: data.data.image,
          });
          setProfileFetched(true);
        } else {
          setError(data.error);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    }
  }, [isConnected, addressConnected, profileFetched, token]);

  useEffect(() => {
    // Only fetch user data when we have both address and token
    if (isConnected && addressConnected && token && !profileFetched) {
      fetchUserData();
    }
  }, [isConnected, addressConnected, token, fetchUserData, profileFetched]);

  useEffect(() => {
    if (!isConnected || !addressConnected) {
      setUser(null);
      setProfileFetched(false);
      setError(null);
    }
  }, [isConnected, addressConnected]);

  return { user, loading, error };
}