// src/app/hooks/useClaim.ts

import { MK_BRIDGE_ABI, MK_BRIDGE_ADDRESS } from '../constants/contracts';
import { useAuth } from '../contexts/AuthContext';
import { useCallback, useState } from 'react';
import { ClaimResult } from '../types/claim';
import { useWeb3 } from './useWeb3';
import { ethers } from 'ethers';

export function useClaim() {
  const { addressConnected, isConnected, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    checkAndSwitchNetwork,
  } = useWeb3()

  const claimTokens = useCallback(async (
    tokenAddress: string,
    coinId: string,
    isNewClaim: boolean
  ): Promise<ClaimResult> => {

    if (!isConnected || !addressConnected) {
      throw new Error('Wallet not connected');
    }

    await checkAndSwitchNetwork('BASE_MAINNET')

    setLoading(true);
    setError(null);

    try {
      // Check if ethereum object exists
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask or another web3 wallet');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Initialize contract
      const bridgeContract = new ethers.Contract(
        MK_BRIDGE_ADDRESS,
        MK_BRIDGE_ABI,
        signer
      );
      // Step 1: Get quote for claim
      const msgType = 5;
      const nativeFee = await bridgeContract.quote.staticCall(
        tokenAddress,
        msgType
      );

      // Step 2: Execute claim
      const tx = await bridgeContract.claimOnL2(
        addressConnected,         // holder address
        tokenAddress,    // token address
        isNewClaim,     // isNewClaim boolean
        {
          value: nativeFee
        }
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Add new claim to database
      try {
        const response = await fetch('/api/claims', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            coinId,
            transactionHash: receipt.hash
          })
        });

        if (!response.ok) {
          console.error('Failed to save claim in database');
          // Note: We don't throw here as the blockchain transaction was successful
          // We might want to add retry logic for the database update
        }
      } catch (dbError) {
        console.error('Error saving claim to database:', dbError);
        // Again, we don't throw as the claim itself was successful
      }

      return {
        success: true,
        transactionHash: receipt.hash
      };

    } catch (error) {
        if (error instanceof Error) {

          let errorMessage = '';
      
          if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient ETH balance';
          } else if (error.message.includes('user rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else if (error.message.includes('No tokens to claim')) {
            errorMessage = 'No tokens to claim. No user balance.';
          } else {
            errorMessage = 'Unexpected error.';
          }
          
          setError(errorMessage);
          // Clear error after 5 seconds
          setTimeout(() => setError(null), 5000);

          return {
            success: false,
            error: errorMessage
          };
        }
  
        // Fallback error
        setError('An unexpected error occurred');
        setTimeout(() => setError(null), 5000);
        return {
          success: false,
          error: 'An unexpected error occurred'
        };
    } finally {
        setLoading(false);
    }
  }, [addressConnected, isConnected, user?.id, checkAndSwitchNetwork]);

  return {
    claimTokens,
    loading,
    error
  };
}