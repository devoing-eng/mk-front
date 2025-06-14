// src/app/components/Header/BiggestBuyers.tsx

import { useRecentPurchases } from '@/app/hooks/useRecentPurchases';
import { FaCrown } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export const BiggestBuyers = () => {
  const { data: purchases = [], isLoading, error } = useRecentPurchases();
  
  // Get top 5 buyers sorted by USD amount
  const topBuyers = purchases
  ?.reduce((acc, current) => {
    const existingBuyerIndex = acc.findIndex(
      item => item.buyer.address === current.buyer.address
    );
    
    if (existingBuyerIndex === -1) {
      acc.push(current);
    } else if (parseFloat(current.amount.usd) > parseFloat(acc[existingBuyerIndex].amount.usd)) {
      acc[existingBuyerIndex] = current;
    }
    
    return acc;
  }, [] as typeof purchases)
  ?.sort((a, b) => parseFloat(b.amount.usd) - parseFloat(a.amount.usd))
  .slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="rounded-xl px-4 z-50">
        <div className="flex justify-between items-center animate-pulse">
          {/* Loading skeleton layout */}
          <div className="flex items-end mr-4">
            <div className="h-8 w-20 bg-slate-700/50 rounded" />
          </div>
          <div className="flex gap-3 items-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center px-4 py-1.5 rounded-xl bg-slate-700/30">
                <div className="w-8 h-8 rounded-full bg-slate-600" />
                <div className="ml-3 space-y-1">
                  <div className="h-3 w-12 bg-slate-600 rounded" />
                  <div className="h-4 w-16 bg-slate-600 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !topBuyers.length) {
    const hardcodedBuyers = [
      {
        buyer: {
          address: "0x1234...5678",
          username: "CryptoDiamond",
          profileImage: "/images/blockie1.jpg"
        },
        amount: { usd: "147.88" },
        coin: { id: "1" }
      },
      {
        buyer: {
          address: "0x5666...5678",
          username: "GigaPump",
          profileImage: "/images/blockie2.jpg"
        },
        amount: { usd: "92.02" },
        coin: { id: "2" }
      },
      {
        buyer: {
          address: "0x0999...5678",
          username: "GoldHolder",
          profileImage: "/images/blockie3.jpg"
        },
        amount: { usd: "43.91" },
        coin: { id: "3" }
      },
    ];
  
    return (
      <div className="rounded-xl px-2 sm:px-4">
        <div className="flex justify-between items-center">
          <div className='flex items-end mr-2 sm:mr-4'>
            <h2 className="flex flex-col text-sm sm:text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              <span className="block">Biggest</span>
              <span className="block">Buyers</span>
            </h2>
          </div>
          
          <div className="flex gap-1 sm:gap-3 items-center overflow-x-auto pb-1">
            {hardcodedBuyers.map((topBuyer, index) => (
              <div
                key={topBuyer.buyer.address}
                className={`relative flex items-center px-2 sm:px-4 py-1 sm:py-1.5 rounded-xl flex-shrink-0
                  ${index === 0 ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-blue-500/20' : 'hover:bg-slate-700/30'}
                  transition-all duration-300 transform hover:scale-105`}
              >
                {index === 0 && (
                  <FaCrown 
                    className="absolute top-1 -right-2 text-yellow-400 text-sm sm:text-xl animate-bounce"
                    style={{ animationDuration: '2s' }}
                  />
                )}
                <div className="relative w-6 h-6 sm:w-8 sm:h-8">
                  <Image
                    src={topBuyer.buyer.profileImage}
                    alt={`${topBuyer.buyer.username}'s profile`}
                    width={46}
                    height={46}
                    className="rounded-full object-cover w-full h-full"
                    priority
                    unoptimized
                  />
                  <div className={`absolute inset-0 rounded-full border-2 
                    ${index === 0 ? 'border-blue-400/50' : 'border-gray-600/50'}`} 
                  />
                </div>
                
                <div className='flex flex-col ml-2 sm:ml-3'>
                  <span 
                    className="text-xs sm:text-sm font-semibold text-gray-400"
                  >
                    {topBuyer.buyer.username}
                  </span>
                  <span 
                    className={`font-bold text-xs sm:text-sm whitespace-nowrap
                    ${index === 0 ? 'text-blue-400 sm:text-lg' : 'text-green-400'}`}>
                    ${topBuyer.amount.usd.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl px-2 sm:px-4">
      <div className="flex justify-between items-center">
        <div className='flex items-end mr-2 sm:mr-4'>
          <h2 className="flex flex-col text-sm sm:text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            <span className="block">Biggest</span>
            <span className="block">Buyers</span>
          </h2>
        </div>
        
        <div className="flex gap-1 sm:gap-3 items-center overflow-x-auto pb-1 scrollbar-hide">
          {topBuyers.map((topBuyer, index) => (
            <div
              key={topBuyer.buyer.address}
              className={`relative flex items-center px-2 sm:px-4 py-1 sm:py-1.5 rounded-xl flex-shrink-0
                ${index === 0 ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-blue-500/20' : 'hover:bg-slate-700/30'}
                transition-all duration-300 transform hover:scale-105`}
            >
              {index === 0 && (
                <FaCrown 
                  className="absolute top-1 -right-2 text-yellow-400 text-sm sm:text-xl animate-bounce"
                  style={{ animationDuration: '2s' }}
                />
              )}
              <div className="relative w-6 h-6 sm:w-8 sm:h-8">
                <Image
                  src={topBuyer.buyer.profileImage}
                  alt={`${topBuyer.buyer.username}'s profile`}
                  width={46}
                  height={46}
                  className="rounded-full object-cover w-full h-full"
                  priority
                />
                <div className={`absolute inset-0 rounded-full border-2 
                  ${index === 0 ? 'border-blue-400/50' : 'border-gray-600/50'}`} 
                />
              </div>
              
              <div className='flex flex-col ml-2 sm:ml-3'>
                <Link 
                  href={`/creator/${topBuyer.buyer.address}`} 
                  className="text-xs sm:text-sm font-semibold text-gray-400 hover:underline hover:text-gray-300 transition-colors duration-200"
                  >
                  {topBuyer.buyer.username.slice(0, 5)}...
                </Link>
                <Link 
                  href={`/coin/${topBuyer.coin.id}`} 
                  className={`font-bold text-xs sm:text-sm whitespace-nowrap hover:underline
                  ${index === 0 ? 'text-blue-400 sm:text-lg' : 'text-green-400'}`}>
                  ${topBuyer.amount.usd.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};