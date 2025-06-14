// src/app/creator/[id]/components/NewClaimButton.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { ClaimableCoin } from '@/app/types/coin';
import { useClaim } from '@/app/hooks/useClaim';
import toast from 'react-hot-toast';
import { useState } from 'react';
import Image from 'next/image';

export function NewClaimButton({ claimableCoinsList }: { claimableCoinsList: ClaimableCoin[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const { claimTokens, error: newClaimError } = useClaim();

  const handleNewClaim = async (tokenAddress: string, coinId: string) => {
    try {
      const result = await claimTokens(tokenAddress, coinId, true);
      if (result.success) {
        toast.success('Claim initiated! Tracking progress...', { 
          id: 'claim-initiated', 
          duration: 3000 
        });
        setIsOpen(false); // Close the selection after successful claim
      }
    } catch (err) {
      toast.error('Failed to claim tokens');
      console.error('Claim error:', err);
    }
  };

  return (
    <>
      {claimableCoinsList.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <span>Tokens to claim</span>
            {claimableCoinsList.length > 0 && (
              <span className="bg-indigo-500 px-2 py-0.5 rounded-full text-xs">
                {claimableCoinsList.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 bg-gray-800 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold mb-4">Tokens to claim</h3>
                <div className="space-y-2">
                  {claimableCoinsList.map((coin) => (
                    <motion.div
                      key={coin.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer"
                      onClick={() => handleNewClaim(coin.tokenAddress, coin.coinId)}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={coin.imageUrl || '/images/mk-logo.png'}
                          alt={coin.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div>
                          <p className="font-medium">{coin.name}</p>
                          <p className="text-sm text-gray-400">{coin.ticker}</p>
                        </div>
                      </div>
                      <button className="text-sm text-indigo-400 hover:text-indigo-300">
                        Claim →
                      </button>
                    </motion.div>
                  ))}
                  {/* Claim Error Display */}
                  {newClaimError && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-2 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    >
                     {newClaimError}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}