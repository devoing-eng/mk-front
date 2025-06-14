// src/app/components/Home/MainSection/LiveBar.tsx

import { IoVolumeHighOutline, IoVolumeMuteOutline } from 'react-icons/io5';
import { useRecentPurchases } from '@/app/hooks/useRecentPurchases';
import React, { useEffect, useRef, useState } from 'react';
import { Purchase } from '@/app/types/coin';
import Marquee from 'react-fast-marquee';
import Image from 'next/image';
import { Howl } from 'howler';

interface LivePurchaseItemProps {
  profileImage: string;
  amount: string;  // USD amount
  ticker: string;
}

const LivePurchaseItem = ({ profileImage, amount, ticker }: LivePurchaseItemProps) => (
  <div className="flex items-center space-x-2 bg-gray-800 rounded-full px-2 py-1">
    <Image 
      src={profileImage}
      alt={ticker}
      width={20}
      height={20}
      className="rounded-full"
    />
    <span className="text-yellow-400 font-bold">${amount}</span>
    <span className="text-white uppercase">{ticker}</span>
  </div>
);

// Static placeholder data
const staticPurchases: LivePurchaseItemProps[] = [
  { ticker: 'FREE', amount: '420.00', profileImage: '/images/blockie1.jpg' },
  { ticker: 'FOR', amount: '777.00', profileImage: '/images/blockie2.jpg' },
  { ticker: 'KULTS', amount: '420.00', profileImage: '/images/blockie3.jpg' },
  { ticker: 'NEXT', amount: '777.00', profileImage: '/images/blockie4.jpg' },
  { ticker: 'LAUNCH', amount: '420.00', profileImage: '/images/blockie5.jpg' },
  { ticker: 'MEMEKULT', amount: '777.00', profileImage: '/images/blockie6.jpg' },
  { ticker: 'ON', amount: '420.00', profileImage: '/images/blockie7.jpg' },
  { ticker: 'WELCOME', amount: '777.00', profileImage: '/images/blockie8.jpg' },
];

export const LiveBar = () => {

  const { data: purchases = [], isLoading } = useRecentPurchases();

  const coinSoundRef = useRef<Howl | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const prevPurchasesLength = useRef(purchases.length);

  // Initialize sound + animation
  useEffect(() => {
    coinSoundRef.current = new Howl({
      src: ['/images/multi-coin-payout-14-213732.mp3'],
      volume: 1,
    });

    const interval = setInterval(() => {
      coinSoundRef.current?.play();
      const coinContainer = document.getElementById('coin-container');
      if (coinContainer) {
        coinContainer.classList.add('animate-coins');
        setTimeout(() => {
          coinContainer.classList.remove('animate-coins');
        }, 1000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handle new purchases
  useEffect(() => {
    if (purchases.length > prevPurchasesLength.current && !isMuted) {
      coinSoundRef.current?.play();
      const coinContainer = document.getElementById('coin-container');
      if (coinContainer) {
        coinContainer.classList.add('animate-coins');
        setTimeout(() => {
          coinContainer.classList.remove('animate-coins');
        }, 1000);
      }
    }
    prevPurchasesLength.current = purchases.length;
  }, [purchases.length, isMuted]);

  // Type guard to check if a purchase is a real purchase
  const isRealPurchase = (purchase: Purchase | LivePurchaseItemProps): purchase is Purchase => {
    return 'buyer' in purchase;
  };

  const getDisplayPurchases = (realPurchases: Purchase[]): Array<Purchase | LivePurchaseItemProps> => {
    if (realPurchases.length === 0) return staticPurchases;
    
    if (realPurchases.length < 8) {
      // Get the first N static purchases to fill the gap
      const neededCount = 8 - realPurchases.length;
      const staticFill = staticPurchases.slice(0, neededCount);
      
      // Combine real purchases with static ones
      return [...realPurchases, ...staticFill];
    }
    
    return realPurchases;
  };

  if (isLoading) {
    return (
      <div className="relative flex items-center bg-gray-800 p-2 rounded-lg animate-pulse">
        <div className="w-full h-8 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center bg-gray-800 p-2 rounded-lg">
    
      <button
        onClick={() => {
          if (coinSoundRef.current) {
            const newMuteStatus = !isMuted;
            coinSoundRef.current.mute(newMuteStatus);
            setIsMuted(newMuteStatus); // Update the local mute state
          }
        }}
          className="absolute bottom-0 -left-1 mb-[-20px] md:-left-10 md:mb-0 md:bottom-auto text-sm text-white px-2 py-1 rounded"
      >
        {isMuted ? <IoVolumeMuteOutline /> : <IoVolumeHighOutline />}
      </button>

      {/* Static green dot indicator */}
      <div className="relative mx-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
      </div>

      <Marquee gradient={false} speed={100} direction="right">
        <div className="flex items-center space-x-4">
          {purchases.length > 0 ? (
            [...getDisplayPurchases(purchases)].map((purchase, index) => (
              <LivePurchaseItem
                key={`${isRealPurchase(purchase) ? purchase.coin.id : 'static'}-${index}`}
                profileImage={isRealPurchase(purchase) ? purchase.buyer.profileImage : purchase.profileImage}
                amount={isRealPurchase(purchase) ? purchase.amount.usd : purchase.amount}
                ticker={isRealPurchase(purchase) ? purchase.coin.ticker : purchase.ticker}
              />
            ))
          ) : (
            // Default placeholder purchases when there are no real ones
            [...staticPurchases].map((placeholder, index) => (
              <LivePurchaseItem
                key={`placeholder-${index}`}
                profileImage={placeholder.profileImage}
                amount={placeholder.amount}
                ticker={placeholder.ticker}
              />
            ))
          )}
        </div>
      </Marquee>

      {/* Coin spouting animation on the left edge */}
      <div id="coin-container" className="absolute left-2 bottom-0">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="coin"></div>
        ))}
      </div>

      <style jsx>{`
        .coin {
          position: absolute;
          bottom: 0;
          width: 30px;
          height: 30px;
          background-image: url('/images/eth-gold.svg');
          background-size: cover;
          opacity: 0;
        }
        .animate-coins .coin {
          animation: spout 1s ease-out forwards;
        }
        @keyframes spout {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};