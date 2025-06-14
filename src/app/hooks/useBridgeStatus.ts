// src/app/hooks/useBridgeStatus.ts

import { BridgeStatus, BridgeStep, GasStatus, StepStatus } from "../types/coinBridge";
import { config } from '@/config/environment';
import { useEffect, useState } from "react";
import { io } from 'socket.io-client';

const DEFAULT_BRIDGE_STATE: BridgeStatus = {
  steps: {
    TOKEN_CREATION_1_2: 'pending',
    TOKEN_CREATION_2_2: 'pending',
    LIQUIDITY_BRIDGE: 'pending',
    LIQUIDITY_DEPOSIT: 'pending'
  }
};

export function useBridgeStatus(tokenAddress: string) {
  
  const [bridgeState, setBridgeState] = useState<BridgeStatus>(DEFAULT_BRIDGE_STATE);
  const [gasStatus, setGasStatus] = useState<GasStatus | null>(null);
  
  useEffect(() => {

    const socket = io(`${config.api.baseUrl}`, {
      transports: ['websocket', 'polling'],
      secure: true,
      rejectUnauthorized: process.env.NODE_ENV !== 'production',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Only subscribe once we're connected
    socket.on('connect', () => {
      socket.emit('subscribeToBridgeStatus', tokenAddress);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    const handleStatusUpdate = (data: { tokenAddress: string; status: Record<BridgeStep, StepStatus> }) => {
      if (data.tokenAddress === tokenAddress) {
        setBridgeState({ steps: data.status });
      }

      // Check if all steps are completed
      const isAllCompleted = Object.values(data.status).every(
        status => status === 'completed'
      );
      
      if (isAllCompleted) {
        localStorage.setItem(`bridge-${tokenAddress}-completed`, 'true');
      }
    };

    const handleGasStatus = (data: GasStatus & { tokenAddress: string }) => {
      if (data.tokenAddress === tokenAddress) {
        setGasStatus(data);
      }
    }

    socket.on('bridgeStatusUpdate', handleStatusUpdate);
    socket.on('gasStatusUpdate', handleGasStatus);

    return () => {
      if (socket.connected) {
        socket.emit('unsubscribeFromBridgeStatus', tokenAddress);
      }
      socket.off('bridgeStatusUpdate', handleStatusUpdate);
      socket.off('gasStatusUpdate', handleGasStatus);
      socket.disconnect();
    };
  }, [tokenAddress]);
  
  return { bridgeState, gasStatus };
};