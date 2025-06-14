/* eslint-disable @typescript-eslint/no-unused-vars */
// src/services/socketService.ts

import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  heartbeatInterval?: NodeJS.Timeout;
  currentPage: string | null;
  connect: (userId: string) => void;
  disconnect: (userId: string) => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  currentPage: null,

  connect: (userId: string) => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.memekult.com', {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    })

    socket.on('connect', () => {
      socket.emit('authenticate', userId);
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('reconnect', (_attempt) => {
      socket.emit('authenticate', userId);
      set({ isConnected: true });
    });

    // Set up heartbeat to keep connection alive
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000);

    socket.connect();
    set({ 
      socket,
      // Store interval reference for cleanup
      heartbeatInterval 
    });
  },

  disconnect: (userId: string) => {
    set((state) => {

      if (state.socket && state.currentPage) {
        if (userId) {
          state.socket.emit('pageLeave', { 
            pageUrl: state.currentPage, 
            userId 
          });
        }
      }

      if (state.socket) {
        state.socket.disconnect();
      }
      
      // Clear heartbeat interval
      if (state.heartbeatInterval) {
        clearInterval(state.heartbeatInterval);
      }
      
      return { 
        socket: null, 
        isConnected: false,
        heartbeatInterval: undefined
      };
    });
  },

}));