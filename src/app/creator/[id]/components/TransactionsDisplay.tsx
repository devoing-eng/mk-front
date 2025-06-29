// src/app/creator/[id]/components/TransactionsDisplay.tsx

import { useUserTransactions } from '@/app/hooks/useUserTransactions';
import { NETWORK_CONSTANTS } from '@/app/constants/blockchain';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from '@/utils/formatters';
import { timeAgo } from '@/utils/dateFormat';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';


export default function TransactionsDisplay({ userAddress }:{ userAddress : string}) {
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const { transactions, loading, error } = useUserTransactions(userAddress);
  const explorerUrl = NETWORK_CONSTANTS.BASE_MAINNET.EXPLORER_URL;
  const [displayCount, setDisplayCount] = useState(5);

  const filteredTransactions = useMemo(() => {
    if (filterType === 'ALL') return transactions;
    return transactions.filter(tx => tx.type === filterType);
  }, [transactions, filterType]);


  if (loading) {
    return (
        <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        Error loading transactions: {error}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        No transactions found
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-end mb-4 gap-2">
        <button
            onClick={() => setFilterType('ALL')}
            className={`px-4 py-1 rounded-lg font-medium transition-all duration-200 ${
            filterType === 'ALL' 
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
        >
            All
        </button>
        <button
            onClick={() => setFilterType('BUY')}
            className={`px-4 py-1 rounded-lg font-medium transition-all duration-200 ${
            filterType === 'BUY'
                ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/20'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
        >
            Buy
        </button>
        <button
            onClick={() => setFilterType('SELL')}
            className={`px-4 py-1 rounded-lg font-medium transition-all duration-200 ${
            filterType === 'SELL'
                ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/20'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
        >
            Sell
        </button>
        </div> 
      <AnimatePresence>
        {filteredTransactions.slice(0, displayCount).map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">

                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-">
                  <Image 
                    src={tx.coin.imageUrl} 
                    alt={tx.coin.name} 
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    priority={false}
                    aria-label={tx.coin.name}
                    unoptimized
                  />
                </div>
                <div>
                  <Link 
                    href={`/coin/${tx.coin.id}`}
                    className="text-lg font-semibold text-white hover:text-indigo-400 truncate max-w-[200px]"
                  >
                    {tx.coin.name}
                  </Link>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {timeAgo(new Date(tx.timestamp))}
                  </div>
                </div>
              </div>
                <div className="text-right">
                    <div className={`text-lg font-semibold flex items-center gap-2`}>
                        <span className={`px-2 py-0.5 rounded text-sm ${
                        tx.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {tx.type}
                        </span>
                        <span>
                        {formatNumber(Number(BigInt(tx.tokenAmount) / BigInt(1e18)))} {tx.coin.ticker}
                        </span>
                    </div>
                    <div className="text-sm text-gray-400">
                        {(parseFloat(tx.ethAmount) / 1e18).toFixed(4)} ETH
                    </div>
                </div>
            </div>
            <div className="mt-3 pt-2 text-sm text-gray-500 border-t border-gray-700/50">
              <Link 
                href={`${explorerUrl}/tx/${tx.transactionHash}`}
                title={`View transaction ${tx.transactionHash} on Basescan`}
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-indigo-400 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
              >
                View on BaseScan
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                </svg>
              </Link>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {transactions.length > displayCount && (
        <div className="flex justify-center mt-8">
          <button
            aria-label="Load more transactions"
            onClick={() => setDisplayCount(prev => prev + 5)}
            className="bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Load More
          </button>
        </div>
      )}

      {/* Show total count */}
      <div className="text-center text-gray-400 mt-4">
        Showing {Math.min(displayCount, filteredTransactions.length)} of {filteredTransactions.length} transactions
      </div>
    </div>
  );
}