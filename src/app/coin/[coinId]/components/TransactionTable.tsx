// components/TransactionTable.tsx

import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { useTransactions } from '@/app/hooks/useTransactions';
import { formatNumber } from '@/utils/formatters';
import { timeAgo } from '@/utils/dateFormat';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CoinStaticData } from '@/app/types/coin';

type SortField = 'account' | 'type' | 'eth' | 'tokens' | 'date' | 'hash';
type SortDirection = 'asc' | 'desc';

export default function TransactionTable({ coinId, coinData }: { coinId : string, coinData: CoinStaticData}) {
  
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    data: transactions = [], 
    isLoading,
    isError
  } = useTransactions(coinId);

  // Deduplicate and sort transactions
  const sortedTransactions = useMemo(() => {
    // First deduplicate based on hash
    const uniqueTransactions = Array.from(
      new Map(transactions.map(tx => [tx.hash, tx])).values()
    );

    return uniqueTransactions.sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'account':
          return multiplier * a.account.localeCompare(b.account);
        case 'type':
          return multiplier * a.type.localeCompare(b.type);
        case 'eth':
          return multiplier * (parseFloat(a.eth) - parseFloat(b.eth));
        case 'tokens':
          return multiplier * (parseFloat(a.tokens) - parseFloat(b.tokens));
        case 'date':
          return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime());
        case 'hash':
          return multiplier * a.hash.localeCompare(b.hash);
        default:
          return 0;
      }
    });
  }, [transactions, sortField, sortDirection]);

  // Then paginate the sorted transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedTransactions.slice(startIndex, endIndex);
  }, [sortedTransactions, currentPage]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Calculate total pages
  const calculatedTotalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)

  if (isLoading) {
    return (
      <div className="min-w-full bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-w-full bg-gray-800 rounded-lg p-4 text-gray-400">
        No transactions.
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden text-xs sm:text-sm">
          <thead className="bg-gray-700">
            <tr>
              {[
                { key: 'account', label: 'Account' },
                { key: 'type', label: 'Type' },
                { key: 'eth', label: 'ETH' },
                { key: 'tokens', label: `${coinData?.ticker}` },
                { key: 'date', label: 'Date' },
                { key: 'hash', label: 'Tx Hash' }
              ].map(({ key, label }) => (
                <th 
                  key={key}
                  onClick={() => handleSort(key as SortField)}
                  className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-300 cursor-pointer hover:bg-gray-600 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    {label}
                    {sortField === key && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedTransactions.map((tx) => (
              <tr key={tx.hash} className="hover:bg-gray-700">
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                  <Link 
                    href={`/creator/${tx.account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {tx.account.slice(0, 6)}...{tx.account.slice(-4)}
                  </Link>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                  {tx.type === 'BUY' ? (
                    <span className="px-1 sm:px-2 py-0.5 sm:py-1 rounded bg-green-900 text-green-200">
                      BUY
                    </span>
                  ) : (
                    <span className="px-1 sm:px-2 py-0.5 sm:py-1 rounded bg-red-900 text-red-200">
                      SELL
                    </span>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                  {parseFloat(tx.eth).toFixed(4)}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                  {formatNumber(parseFloat(tx.tokens))}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                  {timeAgo(new Date(tx.date))}
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                  <Link 
                    href={`https://basescan.org/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* Pagination Controls */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => setCurrentPage(prev => prev - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded bg-gray-700 disabled:opacity-50 min-w-[40px] min-h-[40px] flex items-center justify-center touch-manipulation"
        >
          <IoChevronBackOutline className="text-lg" />
        </button>
        <span className="px-3 py-1.5 border rounded-md border-gray-500 flex items-center">
          <span className='font-bold text-indigo-300'>{currentPage}</span>{' '}
          <span className='font-light'>/ {calculatedTotalPages}</span>
        </span>
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage >= calculatedTotalPages}
          className="px-3 py-1.5 rounded bg-gray-700 disabled:opacity-50 min-w-[40px] min-h-[40px] flex items-center justify-center touch-manipulation"
        >
          <IoChevronForwardOutline className="text-lg" />
        </button>
      </div>
    </div>
  );
}