// src/components/NotificationDisplay.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { defaultProfileImage } from '@/app/constants/general';
import { useSocketStore } from '@/app/services/socketService';
import { FiFilter, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/app/contexts/AuthContext';
import { timeAgo } from '@/utils/dateFormat';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import {
  Notification,
  FilterType,
  GroupedNotification,
  NotificationDisplayProps, 
  NotificationFilter,
  SocketStore
} from '@/app/types/notifications';


export default function NotificationDisplay({onUnreadCountChange} : NotificationDisplayProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const socket = useSocketStore((state: SocketStore) => state.socket);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<NotificationFilter[]>([
    { type: 'FOLLOW', label: 'Follows', enabled: true },
    { type: 'LIKE', label: 'Likes', enabled: true },
    { type: 'REPLY', label: 'Replies', enabled: true }
  ]);

  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'X-User-Address': user.address,
        }
      });
      const { success, data } = await response.json();
      if (success) {
        setNotifications(data);
        const unreadCount = data.filter((notif: Notification) => !notif.isRead).length;
        onUnreadCountChange(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, onUnreadCountChange]);
  
  useEffect(() => {
    fetchNotifications();

    // Listen for new notifications
    socket?.on('notification', handleNewNotification);

    return () => {
      socket?.off('notification', handleNewNotification);
    };
  }, [socket, fetchNotifications, handleNewNotification]);


  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.address) return;
    
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'X-User-Address': user.address,
        }
      });
  
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
  
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user?.address]);

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'X-User-Address': user?.address || '',
        }
      });
      
      if (response.ok) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notif => ({ ...notif, isRead: true }))
        );
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const groupNotifications = (notifications: Notification[]): GroupedNotification[] => {
    const grouped: { [key: string]: GroupedNotification } = {};

    notifications.forEach(notif => {
      // Create a key based on type and target (comment/reply id)
      const targetId = notif.commentId || notif.replyId;
      const timeKey = new Date(notif.createdAt).getTime();
      const key = `${notif.type}_${targetId}_${Math.floor(timeKey / (60 * 60 * 1000))}`; // Group by hour

      if (!grouped[key]) {
        grouped[key] = {
          id: notif.id,
          type: notif.type,
          targetId,
          actors: [],
          createdAt: notif.createdAt,
          isRead: notif.isRead
        };
      }

      // Add actor if not already in the group
      if (!grouped[key].actors.find(a => a.id === notif.actor.id)) {
        grouped[key].actors.push({
          id: notif.actor.id,
          username: notif.actor.username,
          image: notif.actor.image
        });
      }
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const toggleFilter = (type: FilterType) => {
    setFilters(prevFilters =>
      prevFilters.map(filter =>
        filter.type === type
          ? { ...filter, enabled: !filter.enabled }
          : filter
      )
    );
  };

  const getFilteredNotifications = () => {
    return notifications.filter(notif => {
      // Handle the combined 'LIKE' filter
      if (filters.find(f => f.type === 'LIKE')?.enabled) {
        if (notif.type === 'COMMENT_LIKE' || notif.type === 'REPLY_LIKE') {
          return true;
        }
      }
      
      // Handle other filters directly
      return filters.find(f => 
        (f.type === 'FOLLOW' && notif.type === 'FOLLOW') ||
        (f.type === 'REPLY' && notif.type === 'COMMENT_REPLY')
      )?.enabled;
    });
  };

  const hasUnreadNotifications = notifications.some(n => !n.isRead);
  const filteredNotifications = getFilteredNotifications();
  const groupedNotifications = groupNotifications(filteredNotifications);
  const handleNotificationClick = useCallback((notification: GroupedNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  }, [markAsRead]);

  const renderGroupedNotificationContent = (notification: GroupedNotification) => {
    const { actors, type } = notification;
    const actorCount = actors.length;
  
    let actionText = '';
    switch (type) {
      case 'FOLLOW':
        actionText = 'started following you';
        break;
      case 'COMMENT_LIKE':
      case 'REPLY_LIKE':
        actionText = 'liked your ' + (type === 'COMMENT_LIKE' ? 'comment' : 'reply');
        break;
      case 'COMMENT_REPLY':
        actionText = 'replied to your comment';
        break;
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {actors.slice(0, 3).map((actor, index) => (
            <div key={`${actor.id}-${index}`} className="relative">
              <Image
                key={actor.id}
                src={actor.image || defaultProfileImage}
                alt={actor.username || 'User Avatar'}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-gray-900"
              />
            </div>
          ))}
        </div>
        <div className="ml-2">
          <p className="text-sm">
            <span className="font-bold">
              {actors[0].username}
              {actorCount > 1 && ` and ${actorCount - 1} others`}
            </span>{' '}
            {actionText}
          </p>
          <span className="text-xs text-gray-400">
            {timeAgo(new Date(notification.createdAt))}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <FiFilter className={showFilters ? "text-indigo-500" : "text-gray-400"} />
            Filters
          </button>
          
          {hasUnreadNotifications && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            >
              <FiCheckCircle />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 p-4 bg-gray-900 rounded-lg">
          {filters.map(filter => (
            <button
              key={filter.type}
              onClick={() => toggleFilter(filter.type)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                filter.enabled
                  ? 'bg-indigo-600 text-white border-b-2 border-indigo-400'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          {notifications.length === 0 
            ? 'No notifications yet'
            : 'No notifications match the selected filters'}
        </div>
      ) : (
        <>
          {groupedNotifications.map((notification) => (
            <div
              key={`notification-${notification.id}`}
              className={`p-4 rounded-lg transition-colors ${
                notification.isRead ? 'bg-gray-800' : 'bg-gray-700 border border-white'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              {renderGroupedNotificationContent(notification)}
            </div>
          ))}
        </>
      )}
    </div>
    </div>
  );
}