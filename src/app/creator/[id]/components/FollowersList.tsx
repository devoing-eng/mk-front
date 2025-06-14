// src/app/creator/[id]/components/FollowersList.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { defaultProfileImage } from '@/app/constants/general';
import { useInView } from 'react-intersection-observer';
import { useDebounce } from '@/app/hooks/useDebounce';
import { FiSearch } from 'react-icons/fi';
import FollowButton from './FollowButton';
import Image from 'next/image';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  image: string | null;
  address: string;
  _count?: {
    followers: number;
    following: number;
  };
}

interface FollowersListProps {
  userId: string;
  type: 'followers' | 'following';
  isOwnProfile: boolean
}

export default function FollowersList({ userId, type, isOwnProfile }: FollowersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { ref, inView } = useInView();

  const fetchUsers = useCallback(async (pageNum: number, searchTerm: string = '') => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/follow/${userId}/${type}?page=${pageNum}&limit=20&search=${searchTerm}`
      );
      const { success, data, pagination } = await response.json();

      if (success) {
        if (pageNum === 1) {
          setUsers(data);
        } else {
          setUsers(prev => [...prev, ...data]);
        }
        setHasMore(page < pagination.pages);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
    }
  }, [userId, type, page]);

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoadingSuggestions(true);
      const response = await fetch(`/api/follow/suggestions/${userId}?limit=6`);
      const { success, data } = await response.json();
      
      if (success) {
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [userId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Handle search changes
  useEffect(() => {
    fetchUsers(1, debouncedSearch);
  }, [debouncedSearch, fetchUsers]);

  // Handle infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loading && !search) {
      setPage(prev => prev + 1);
      fetchUsers(page + 1);
    }
  }, [inView, hasMore, loading, search, page, fetchUsers]);
  
  // Initial load
  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // Add new useEffect to check if we need to show suggestions
  useEffect(() => {
    if (users.length < 5) {
      fetchSuggestions();
    }
  }, [users.length, fetchSuggestions]);

  // Early return for loading state
  if (loading || (users.length < 5 && loadingSuggestions && isOwnProfile)) {
    return (
      <div className="space-y-4 py-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg animate-pulse">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gray-700 h-10 w-10"></div>
              <div>
                <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
            <div className="rounded-md bg-gray-700 h-8 w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{type === 'followers' ? 'Followers' : 'Following'}</h2>
        {users.length > 0 && (
          <span className="bg-indigo-900 px-3 py-1 rounded-full text-sm">
            {users.length} {type === 'followers' ? 'Followers' : 'Following'}
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={handleSearch}
          className="w-full px-4 py-2 bg-gray-800 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
  
      {users.length > 0 ? (
        <>          
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Image
                    src={user.image || defaultProfileImage}
                    alt={user.username || 'User avatar'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <Link href={`/creator/${user.address}`} passHref>
                      <h4 className="font-semibold hover:text-indigo-400 cursor-pointer transition-colors">
                        {user.username.length > 12 
                        ? user.username.substring(0, 12) + "..." 
                        : user.username}
                      </h4>
                    </Link>
                    <p className="text-sm text-gray-400">
                      {user._count?.following ?? 0} Followers
                    </p>
                  </div>
                </div>
                
                <FollowButton targetUserId={user.id} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-gray-400 py-4">
          {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
        </p>
      )}
  
      {/* Suggestions section */}
      {users.length < 5 && suggestions.length > 0 && isOwnProfile && (
        <div className="mt-8">
          <div className="border-l-2 border-indigo-500 pl-3 mb-4">
            <h3 className="text-sm uppercase tracking-wider text-gray-300">Popular creators</h3>
          </div>
          
          {/* Mobile view (default) and desktop grid */}
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
            {suggestions.map((user) => (
              <div key={user.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Image
                    src={user.image || defaultProfileImage}
                    alt={user.username || 'User avatar'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <Link href={`/creator/${user.address}`} passHref>
                      <h4 className="font-semibold hover:text-indigo-400 cursor-pointer transition-colors">
                        {user.username.length > 12 
                        ? user.username.substring(0, 12) + "..." 
                        : user.username}
                      </h4>
                    </Link>
                    <p className="text-sm text-gray-400">
                      {user._count?.following ?? 0} Followers
                    </p>
                  </div>
                </div>
                
                <FollowButton targetUserId={user.id} />
              </div>
            ))}
          </div>
        </div>
      )}
        
      <div ref={ref} className="h-4" />
    </div>
  );
}