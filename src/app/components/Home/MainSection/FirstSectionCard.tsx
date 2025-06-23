//src/app/components/Home/MainSection/FirstSectionCard.tsx

import { IoFlash, IoMusicalNotes } from 'react-icons/io5';
import { useEffect, useRef, useState } from 'react';
import { EnrichedCoin } from '@/app/types/coin';
import { formatNumber } from '@/utils/formatters';
import Image from 'next/image';
import Link from 'next/link';

interface FirstSectionCardProps {
  coin: EnrichedCoin;
}

export const FirstSectionCard = ({ coin }: FirstSectionCardProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const previousTrendingStatus = useRef<boolean | null>(null);
  
  const logoSrc = coin.progress === 100 ? '/images/ethereum.svg' : '/images/base-logo.webp';
  
  // Handle trending animation
  useEffect(() => {
    // Check if this coin just became trending
    const wasNotPreviouslyTrending = previousTrendingStatus.current === false || 
      previousTrendingStatus.current === null;
  
    // If it's trending now but wasn't before, set spinning
    if (coin.isTrending && wasNotPreviouslyTrending) {
      setIsSpinning(true);
      setTimeout(() => setIsSpinning(false), 2000);
    }
  
    // Save current trending status for next comparison
    previousTrendingStatus.current = coin.isTrending;
  
  }, [coin.isTrending]);

  return (
    <div className="relative max-w-md">
      <div className={`relative rounded-xl p-2 transition-all duration-300 ${
        isSpinning 
          ? 'bg-gradient-to-r from-indigo-600 via-purple-300 to-indigo-600 animate-border-gradient bg-[length:200%_auto]' 
          : 'bg-gray-600 hover:bg-indigo-600'
      }`}>
        <div className="bg-black relative rounded-lg">
          {/* Premium Badge */}
          {coin.isPremiumActive && (
            <div className="absolute top-4 right-14 z-10">
              <div className="flex items-center bg-gradient-to-r from-amber-500 to-yellow-300 px-2 py-1 rounded-md shadow-lg">
                <IoFlash className="text-amber-900" size={14} />
              </div>
            </div>
          )}
          
          {/* Chain Logo */}
          <div className="absolute top-4 right-4">
            <Image
              src={logoSrc}
              alt={coin.progress === 100 ? 'Ethereum logo' : 'Base logo'}
              width={24}
              height={24}
              priority={true}
            />
          </div>
          
          {/* Progress Badge */}
          <div className={`absolute bottom-2 left-2 text-green-300 p-2 text-sm font-bold`}>
            {coin.progress.toFixed(2)}%
          </div>
          
          {/* Trending Badge */}
          {coin.isTrending && (
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center bg-gradient-to-r from-red-500 to-orange-400 px-2 py-1 rounded-md shadow-lg">
                <span className="text-white text-xs font-bold">🔥 TRENDING</span>
              </div>
            </div>
          )}
          
          <Link href={`/coin/${coin.id}`}>
            <button className="cursor-pointer w-full text-left">
              <div className="flex p-4">
                {/* Coin Image */}
                <div className="w-1/4 mr-4 h-32 overflow-hidden flex-shrink-0 flex items-start justify-center">
                  <Image
                    src={coin.imageUrl}
                    alt={coin.name}
                    width={100}
                    height={100}
                    className="rounded-lg"
                  />
                </div>
                
                {/* Coin Info */}
                <div className="w-3/4 flex flex-col">
                  <h2 className="text-white text-xl font-bold mb-1">
                    {coin.name.length > 18 ? `${coin.name.slice(0, 18)}...` : coin.name}
                  </h2>
                  
                  <p className="text-indigo-400 font-semibold mb-1 flex items-center">
                    {coin.ticker}
                    {coin.audioUrl && (
                      <span className="ml-2 flex items-center bg-gradient-to-r from-purple-500/90 to-purple-500/50 px-1.5 py-0.5 rounded text-xs text-white">
                        <IoMusicalNotes className="mr-0.5" size={10} />
                        <span className="text-xs">Audio Meme</span>
                      </span>
                    )}
                  </p>
                  
                  <p className="text-lime-500 mb-1">
                    MCap: {coin.liveMarketCap !== 0 ? `$${formatNumber(coin.liveMarketCap)}` : '...'}
                  </p>
                  
                  <p className="text-gray-300 mb-1 flex items-center whitespace-nowrap">
                    <span className="min-w-fit">Created by</span>
                    <span className="text-blue-500 ml-1 truncate max-w-[200px]">
                      {coin.creator?.username || 'Anonymous'}
                    </span>
                  </p>
                  
                  <p className="text-white line-clamp-1">{coin.description}</p>
                </div>
              </div>
            </button>
          </Link>
          
          {/* Progress Bar */}
          <div className="bg-gray-700 h-4 w-full">
            <div
              className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-600 h-full transition-all duration-500"
              style={{ width: `${coin.progress.toFixed(2)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};