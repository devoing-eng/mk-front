// src/app/creator/[id]/components/FollowButton.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { RiUserFollowLine } from "react-icons/ri";
import { FiLoader } from 'react-icons/fi';
import { FaPlus } from "react-icons/fa";
import { toast } from 'react-hot-toast';

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
}

export default function FollowButton({ targetUserId, onFollowChange, className = '' }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const checkFollowStatus = useCallback(async () => {
    if (!user || user.id === targetUserId) return;

    try {
      const response = await fetch(`/api/follow/check/${user.id}/${targetUserId}`);
      const { success, data } = await response.json();
      if (success) {
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  }, [user, targetUserId]); 

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please connect your wallet to follow');
      return;
    }

    if (user.id === targetUserId) {
      toast.error('You cannot follow yourself');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const method = isFollowing ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/follow/${targetUserId}/${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: user.id })
      });

      const { success, error } = await response.json();
      if (!success) {
        if (error === 'Already following this user') {
          toast.error('You are already following this user');
          setIsFollowing(true);
        } else {
          throw new Error(error);
        }
        return;
      }

      setIsFollowing(!isFollowing);
      onFollowChange?.(!isFollowing);
      
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading || !user || user.id === targetUserId}
      className={`${
        user?.id === targetUserId
          ? 'bg-gray-700 border-gray-600'
          : isFollowing 
            ? 'border-gray-800 bg-gradient-to-tr from-indigo-300 to-indigo-600' 
            : 'border-white'
      } flex items-center gap-2 text-md text-white border hover:scale-105 px-2 py-1 rounded-lg transition-all ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      >
      {user?.id === targetUserId ? (
        <>
          <span className="text-gray-400">Me</span>
        </>
      ) : isLoading ? (
        <>
          <FiLoader className="w-4 h-4 animate-spin" />
          {isFollowing ? 'Following' : 'Follow'}
        </>
      ) : isFollowing ? (
        <>
          <RiUserFollowLine className="w-4 h-4" />
          Following
        </>
      ) : (
        <>
          <FaPlus className="w-3 h-3" />
          Follow
        </>
      )}
    </button>
  );
}