// src/hooks/useClaimStatus.ts
import { getLayerZeroMessageStatus, MessageStatus } from '@/utils/layerzero';
import { ERC20_ONL1_ABI, ERC20_ONL2_ABI } from '../constants/contracts';
import { NETWORK_CONSTANTS } from '../constants/blockchain';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClaimableCoin } from '../types/coin';
import { ethers } from 'ethers';

interface UseClaimStatusProps {
  claims: {
    id: string;
    transactionHash: string;
    status: 'IN_PROGRESS' | 'RECEIVED' | 'FAILED'; 
    coin: {
      id: string;
      name: string;
      ticker: string;
      imageUrl: string;
      tokenAddress: string;
      tokenAddressOnL1: string; 
    };
  }[];
  onStatusChange?: (claimId: string, newStatus: 'IN_PROGRESS' | 'RECEIVED' | 'FAILED') => void;
}

const updateClaimStatus = async (claimId: string, newStatus: 'IN_PROGRESS' | 'RECEIVED' | 'FAILED') => {
  try {
    const response = await fetch(`/api/claims/${claimId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update claim status');
    }
  } catch (err) {
    console.error('Error updating claim status:', err);
    throw err;
  }
};

export function useClaimStatus({ claims, onStatusChange }: UseClaimStatusProps) {

  const [claimableCoins, setClaimableCoins] = useState<ClaimableCoin[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { addressConnected } = useAuth();

  const previousStatusesRef = useRef<Record<string, string>>({});

  const checkClaimsStatus = useCallback(async () => {
    if (!addressConnected || !isMonitoring) return;
  
    try {
      let hasChanges = false;
      const newClaimableCoins: ClaimableCoin[] = [];
  
      for (const claim of claims) { 
        
        const previousStatus = previousStatusesRef.current[claim.id];
        const messageStatus = await getLayerZeroMessageStatus(claim.transactionHash);
  
        // Early return if status hasn't changed and we already have a status
        if (messageStatus === MessageStatus.FAILED) {
          if (previousStatus !== 'FAILED') {
            hasChanges = true;
            previousStatusesRef.current[claim.id] = 'FAILED';
            await updateClaimStatus(claim.id, 'FAILED');
            onStatusChange?.(claim.id, 'FAILED');
          }
          continue;
        }
  
        // Only proceed with contract calls if message is DELIVERED or INFLIGHT
        if (messageStatus === MessageStatus.DELIVERED || messageStatus === MessageStatus.INFLIGHT) {
          const l1Provider = new ethers.JsonRpcProvider(NETWORK_CONSTANTS.ETHEREUM_MAINNET.RPC_URL);
          const l2Provider = new ethers.JsonRpcProvider(NETWORK_CONSTANTS.BASE_MAINNET.RPC_URL);
  
          const l1Contract = new ethers.Contract(
            claim.coin.tokenAddressOnL1,
            ERC20_ONL1_ABI,
            l1Provider
          );
  
          const l2Contract = new ethers.Contract(
            claim.coin.tokenAddress,
            ERC20_ONL2_ABI,
            l2Provider
          );

          let newStatus: 'IN_PROGRESS' | 'RECEIVED' | 'FAILED' | null = null;
  
          if (claim.status !== 'RECEIVED') {

            const claimsOnL1 = await l1Contract.claimsOnL1(addressConnected);

            if (claimsOnL1.toString() === '0' && messageStatus === MessageStatus.INFLIGHT) {
              newStatus = 'IN_PROGRESS';
            } else if (claimsOnL1.toString() !== '0' && messageStatus === MessageStatus.DELIVERED) {
              newStatus = 'RECEIVED';
            }

          } else if (claim.status === 'RECEIVED') {

            const [claimsOnL1, claimsOnL2] = await Promise.all([
              l1Contract.claimsOnL1(addressConnected),
              l2Contract.claimsOnL2(addressConnected)
            ]);

            if (claimsOnL2.toString() === claimsOnL1.toString()) {
              const balanceOnL2 = await l2Contract.balanceOf(addressConnected);
    
              if (balanceOnL2.toString() !== '0') {
                hasChanges = true;
                newClaimableCoins.push({
                  id: claim.id,
                  coinId: claim.coin.id,
                  name: claim.coin.name,
                  ticker: claim.coin.ticker,
                  imageUrl: claim.coin.imageUrl,
                  tokenAddress: claim.coin.tokenAddress
                });
              }
            }
          }
  
          if (newStatus && newStatus !== previousStatus) {
            previousStatusesRef.current[claim.id] = newStatus;
            await updateClaimStatus(claim.id, newStatus);
            onStatusChange?.(claim.id, newStatus);
          }
        }
      }
  
      if (hasChanges) {
        setClaimableCoins(newClaimableCoins);
      }
  
    } catch (error) {
      console.error('Error checking claims status:', error);
    }
  }, [addressConnected, claims, isMonitoring, onStatusChange]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  useEffect(() => {
    if (!isMonitoring) return;

    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const runCheck = async () => {
      if (!mounted) return;
      
      await checkClaimsStatus();
      
      if (mounted) {
        timeoutId = setTimeout(runCheck, 150000);
      }
    };

    runCheck();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [checkClaimsStatus, isMonitoring]);

  // Reset previous statuses when claims change
  useEffect(() => {
    previousStatusesRef.current = Object.fromEntries(
      claims.map(claim => [claim.id, claim.status])
    );
  }, [claims]);

  return {
    startMonitoring,
    stopMonitoring,
    claimableCoins
  };
}