// src/app/types/notifications.ts

import { Socket } from 'socket.io-client';

type NotificationType = 'FOLLOW' | 'COMMENT_LIKE' | 'REPLY_LIKE' | 'COMMENT_REPLY';
export type FilterType = 'FOLLOW' | 'LIKE' | 'REPLY';

export interface NotificationFilter {
  type: FilterType;
  label: string;
  enabled: boolean;
}

export interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  connect: (userId: string) => void;
  disconnect: (userId: string) => void;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  commentId?: string;
  replyId?: string;
  actor: {
    id: string;
    username: string;
    image: string | null;
  };
  groupedActors?: {
    id: string;
    username: string;
    image: string | null;
  }[];
}

export interface GroupedNotification {
  id: string;
  type: NotificationType;
  targetId?: string;
  actors: Array<{
    id: string;
    username: string;
    image: string | null;
  }>;
  createdAt: string;
  isRead: boolean;
}

export interface NotificationDisplayProps {
  onUnreadCountChange: (count: number) => void;
}