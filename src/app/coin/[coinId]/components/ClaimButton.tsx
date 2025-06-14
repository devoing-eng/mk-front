// src/app/coin/[coinId]/components/ClaimButton.tsx

import { ButtonStage, ClaimButtonProps } from '@/app/types/claim';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const ClaimButton = ({
  addressConnected,
  onClaim,
  isVisible,
  transactionHash,
  status,
  onStatusChange,
  initialState
}: ClaimButtonProps) => {

  const router = useRouter();

  const [stage, setStage] = useState<ButtonStage>(initialState || 'INITIAL');
  const [error, setError] = useState<string | null>(null);

  // Update stage when initialState changes
  useEffect(() => {
    if (initialState) {
      setStage(initialState);
    }
  }, [initialState]);

  // Update stage when status changes
  useEffect(() => {
    switch (status) {
      case 'IN_PROGRESS':
        setStage('PROGRESSING');
        break;
      case 'FAILED':
        setStage('FAILED');
        break;
      case 'RECEIVED':
        setStage('COMPLETED');
        break;
    }
  }, [status]);

  const handleClaim = async () => {
    try {
      setStage('PROCESSING');
      setError(null);
      const result = await onClaim();
      
      if (result && result.success) {
        setStage('PROGRESSING');
      } else {
        setStage('INITIAL');
        setError('Transaction failed');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process claim');
      setStage('FAILED');
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    if (status === 'RECEIVED' && stage === 'PROGRESSING') {
        setTimeout(() => {
            setStage('COMPLETED');
            onStatusChange?.('RECEIVED'); // Call onStatusChange when status completes
        }, 2000);
    } else if (status === 'FAILED') {
        setStage('FAILED');
        onStatusChange?.('FAILED'); // Call onStatusChange when status fails
    }
  }, [status, stage, onStatusChange]);

  if (!isVisible) return null;

  const handleRedirectToProfile = () => {
    router.push(`/creator/${addressConnected}?tab=claims`);
  };

  return (
    <div className="space-y-4 mt-4 p-4 w-full max-w-xl mx-auto bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
      {stage === 'INITIAL' && (
        <motion.button
          onClick={handleClaim}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 px-6 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 text-white"
        >
          Claim Tokens
        </motion.button>
      )}

      {stage === 'PROCESSING' && (
        <motion.button
          disabled
          className="w-full py-4 px-6 rounded-xl font-semibold bg-slate-700 cursor-not-allowed text-white"
        >
          <div className="flex items-center justify-center space-x-2">
            <FiLoader className="w-5 h-5 animate-spin" />
            <span>Processing Claim...</span>
          </div>
        </motion.button>
      )}

      {(stage === 'PROGRESSING' || stage === 'COMPLETED') && (
        <div className="space-y-3">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                  stage === 'COMPLETED' 
                    ? 'text-emerald-200 bg-emerald-500/20' 
                    : 'text-indigo-200 bg-indigo-500/20'
                }`}>
                  {stage === 'COMPLETED' ? 'Completed' : 'In Progress'}
                </span>
              </div>
              <div className="text-right">
                {stage === 'COMPLETED' ? (
                  <FaCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="text-xs font-semibold inline-block text-indigo-200">
                    ~3min
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {transactionHash && (
            <Link 
              href={`https://layerzeroscan.com/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-100 text-sm flex justify-end"
            >
              View Transaction
            </Link>
          )}
        </div>
      )}

      {/* Failed state */}
      {stage === 'FAILED' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Failed
            </span>
            {transactionHash && (
                <Link 
                href={`https://layerzeroscan.com/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-100 text-sm"
                >
                View Transaction
                </Link>
            )}
          </div>
          <motion.button
            onClick={handleRedirectToProfile}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 rounded-xl font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
          >
            Retry Claim
          </motion.button>
        </div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-2 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <p className="text-sm text-slate-400 px-2">
        <span className="font-semibold">Claim your tokens on Ethereum</span> from the Base network, and start trading on <span className="font-semibold">Uniswap V4 through MemeKult.</span>
      </p>
    </div>
  );
};