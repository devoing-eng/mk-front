// src/app/creator/[id]/components/ClaimsDisplay.tsx

"use client";

import { useClaimStatus } from '@/app/hooks/useClaimStatus';
import { useClaimsList } from '@/app/hooks/useClaimsList';
import { NewClaimButton } from './NewClaimButton';
import { useClaim } from '@/app/hooks/useClaim';
import { useCallback, useEffect } from 'react';
import { useWeb3 } from '@/app/hooks/useWeb3';
import { timeAgo } from "@/utils/dateFormat";
import { Claim } from '@/app/types/claim';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

export default function ClaimsDisplay({ userId }: { userId: string}) {
  
  const { claimTokens, error: retryClaimError } = useClaim();

  const {
    claims,
    loading,
    error,
    currentPage,
    totalPages,
    fetchClaims,
    setPage
  } = useClaimsList(userId);

  const {
    checkAndSwitchNetwork
  } = useWeb3()

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims, userId]);

  const { startMonitoring, stopMonitoring, claimableCoins } = useClaimStatus({
    claims,
    onStatusChange: useCallback((claimId: string, newStatus: string) => {
      const claim = claims.find(c => c.id === claimId);
      if (claim?.status !== newStatus) {
        fetchClaims();
      }
    }, [claims, fetchClaims])
  });

  useEffect(() => {
    // Only start monitoring on initial mount
    startMonitoring();
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  function shouldShowRetry(claim: Claim, claims: Claim[]): boolean {
    if (claim.status !== 'FAILED') return false;
  
    // Get all claims for this specific coin
    const coinClaims = claims.filter(c => c.coin.id === claim.coin.id);
    
    // Sort by creation date, most recent first
    const sortedClaims = coinClaims.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  
    // Check if there's any successful claim for this coin
    const hasSuccessfulClaim = sortedClaims.some(c => c.status === 'RECEIVED');
    if (hasSuccessfulClaim) return false;
  
    // Find most recent failed claim
    const mostRecentFailedClaim = sortedClaims.find(c => c.status === 'FAILED');
    
    // Only show retry if this is the most recent failed claim
    return mostRecentFailedClaim?.id === claim.id;
  }

  const handleRetryClaim = async (tokenAddress: string, coinId: string) => {

    await checkAndSwitchNetwork('BASE_MAINNET')

    try {
      const result = await claimTokens(tokenAddress, coinId, false);
      if (result.success) {
        toast.success((
          <div>
            Claim initiated! Tracking progress...
            <br />
            <Link 
              href={`https://layerzeroscan.com/tx/${result.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              View on LayerZero Scan →
            </Link>
          </div>
        ), { duration: 5000 });
      }
    } catch (err) {
      toast.error('Failed to claim tokens');
      console.error('Claim error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-8">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {claimableCoins.length > 0 && (
        <NewClaimButton claimableCoinsList={claimableCoins} />
      )}

      {claims.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No claims found
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center gap-6">
                {/* Coin Info */}
                <div className="flex items-center space-x-4">
                  <Image
                    src={claim.coin.imageUrl || '/images/mk-logo.png'}
                    alt={claim.coin.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    priority={false}
                    quality={75}
                    unoptimized={false}
                  />
                  <div>
                    <h3 className="font-semibold">{claim.coin.name}</h3>
                    <p className="text-gray-400 text-sm">{claim.coin.ticker}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Status Button with pulse */}
                  <div className="relative">
                    <div 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        claim.status === 'RECEIVED' 
                          ? 'bg-green-100 text-green-800'
                          : claim.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {claim.status === 'RECEIVED' 
                        ? 'Received' 
                        : claim.status === 'FAILED'
                        ? 'Failed'
                        : 'In Progress'
                      }
                      {shouldShowRetry(claim, claims) && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Time Ago and Retry Button Container */}
                  <div className="flex items-center gap-6">
                    <p className="text-gray-400 text-sm">
                      {timeAgo(new Date(claim.createdAt))}
                    </p>
                    
                    {shouldShowRetry(claim, claims) && (
                      <div className="relative">
                        <button 
                          onClick={() => {
                            handleRetryClaim(claim.coin.tokenAddress, claim.coin.id);
                          }}
                          className="text-amber-400 hover:text-amber-300 text-sm underline"
                        >
                          Retry the claim here.
                        </button>

                        {/* Error Message */}
                        {retryClaimError && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                          >
                            {retryClaimError}
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
  
                {/* Transaction Link */}
                <Link 
                  href={`https://layerzeroscan.com/tx/${claim.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-100 text-sm ml-auto"
                >
                  View Transaction
                </Link>
              </div>
            </motion.div>
          ))}
  
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}