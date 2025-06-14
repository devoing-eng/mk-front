// components/Stats.tsx
import { useEffect, useState } from 'react';
import { useFollowersCount } from '@/app/hooks/useFollowersCount';
import { IoHeart, IoPeopleSharp } from 'react-icons/io5';
import { FaCommentDots } from 'react-icons/fa6';
import { FiLoader } from 'react-icons/fi';

interface UserStatsProps {
  userId: string;
}

interface UserStats {
  likesCount: number;
  repliesCount: number;
}

export default function UserStats({ userId }: UserStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { followersCount } = useFollowersCount(userId);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/users/stats/${userId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch stats');
        }

        setStats(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-24"></div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <span>
        {loading ? (
          <FiLoader className="w-4 h-4 animate-spin" />
        ) : (
          <span className='flex items-center text-white font-semibold gap-2'><IoPeopleSharp /> {`${followersCount}`}</span>
        )}
      </span>
      <span className="text-purple-500 flex items-center font-semibold gap-2">
        <IoHeart />
        {stats.likesCount.toLocaleString()}
      </span>
      <span className="text-green-500 flex items-center font-semibold gap-2">
        <FaCommentDots />
        {stats.repliesCount.toLocaleString()}
      </span>
    </div>
  );
}