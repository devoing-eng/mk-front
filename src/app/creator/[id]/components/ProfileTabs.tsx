// src/app/creator/[id]/components/ProfileTabs.tsx

import { Coin, ProfileTabsProps, Tab, UserHolding } from '@/app/types/profileTabs';

import { useState, useEffect, useRef, useMemo } from 'react';
import TransactionsDisplay from './TransactionsDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDisplay from './NotificationDisplay';
import FollowersList from './FollowersList';
import ClaimsDisplay from './ClaimsDisplay';
import Link from 'next/link';
import { SingleCard } from '@/app/components/Home/MainSection/SingleCard';

export default function ProfileTabs({
  activeTab, 
  setActiveTab, 
  isOwnProfile, 
  profileData
}: ProfileTabsProps) {

  const [createdCoins, setCreatedCoins] = useState<Coin[]>([]);
  const [heldCoins, setHeldCoins] = useState<UserHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(6);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  const [notificationCount, setNotificationCount] = useState<number>(0);
  const handleUnreadCountChange = (count: number) => {
    setNotificationCount(count);
  };

  const tabs: Tab[] = useMemo(() => {
    const baseTabs: Tab[] = [
      { name: 'coins held', label: 'Coins Held' },
      { name: 'coins created', label: 'Coins Created' },
      { name: 'followers', label: 'Followers' },
      { name: 'following', label: 'Following' },
    ];
    
    if (isOwnProfile) {
      baseTabs.push(
        { name: 'claims', label: 'Tokens Claimed' },
        { name: 'transactions', label: 'My Transactions' },
        {
          name: 'notifications',
          label: 'Notifications',
          count: notificationCount,
        }
      );
    }
  
    return baseTabs;
  }, [isOwnProfile, notificationCount]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Show indicator if we're not at the end
      setCanScroll(scrollLeft + clientWidth < scrollWidth - 10); // -10 for some buffer
    }
  };
  
  // Check on mount and when tabs change
  useEffect(() => {
    handleScroll();
  }, [tabs]);

  useEffect(() => {
    const fetchCoins = async () => {
      if (activeTab !== 'coins held' && activeTab !== 'coins created') return;
      
      setLoading(true);
      
      try {
        const endpoint = activeTab === 'coins held' 
          ? `/api/users/${profileData.address}/coins-held`
          : `/api/users/${profileData.address}/coins-created`;
          
        const response = await fetch(endpoint);
        const result = await response.json();
        
        if (!result.success) throw new Error(result.error);

        interface CoinData {
          coin?: {
            tokenAddress?: string | null;
            tokenData?: {
              reserves?: {
                vEthReserve?: string;
              };
            };
          };
          tokenAddress?: string | null;
          tokenData?: {
            reserves?: {
              vEthReserve?: string;
            };
          };
        }

        // Sort the data by vEthReserve before setting state
        const sortedData = result.data.sort((a: CoinData, b: CoinData) => {
          const aReserve = (activeTab === 'coins held' ? 
            a.coin?.tokenData?.reserves?.vEthReserve : 
            a?.tokenData?.reserves?.vEthReserve) || '0';
            
          const bReserve = (activeTab === 'coins held' ? 
            b.coin?.tokenData?.reserves?.vEthReserve : 
            b?.tokenData?.reserves?.vEthReserve) || '0';
          
          return Number(BigInt(bReserve) - BigInt(aReserve));
        });
        
        if (activeTab === 'coins held') {
          setHeldCoins(sortedData);
        } else {
          setCreatedCoins(sortedData);
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [activeTab, profileData.address, profileData.username]);

  return (
    <>
      <div className="border-b mb-4 border-gray-800">
        <div className="relative w-full overflow-hidden">
          <div 
            className="overflow-x-auto scrollbar-hide"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            <nav className="flex min-w-max space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`${
                    activeTab === tab.name
                      ? 'border-indigo-500 text-indigo-500'
                      : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer`}
                >
                  {tab.label}
                  {typeof tab.count !== 'undefined' && tab.count > 0 && (
                    <span className="ml-2 bg-indigo-500 text-white px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          {canScroll && (
            <div className="absolute right-0 top-0 h-full flex items-center">
              <div className="w-8 h-full bg-gradient-to-l from-gray-900 pointer-events-none" />
              <div className="absolute right-2">
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  className="text-gray-400"
                >
                  <path 
                    d="M6 12l4-4-4-4" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'coins held' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              Array(2).fill(0).map((_, index) => (
                <div key={index} className="flex flex-col mb-4 animate-pulse items-center">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-1"></div>
                  <div className="h-10 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))
            ) : heldCoins.length === 0 ? (
              <div className="col-span-2 text-gray-400 text-center py-8">
                <p>No coins held yet</p>
                <Link 
                  href="/" 
                  className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block"
                >
                  Explore coins to buy
                </Link>
              </div>
            ) : (
              <AnimatePresence>
                {heldCoins.slice(0, displayCount).map((holding, index) => (
                  <motion.div
                    key={holding.coinId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <SingleCard
                      coinId={holding.coin.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Load More Button - only show if there are more coins to load */}
          {!loading && heldCoins.length > displayCount && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setDisplayCount(prev => prev + 6)}
                className="bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Load More
              </button>
            </div>
          )}

          {/* Show total count */}
          {!loading && heldCoins.length > 0 && (
            <div className="text-center text-gray-400 mt-4">
              Showing {Math.min(displayCount, heldCoins.length)} of {heldCoins.length} coins
            </div>
          )}
        </div>
      )}

      {activeTab === 'coins created' && (
        <div className="space-y-6"> 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              Array(2).fill(0).map((_, index) => (
                <div key={index} className="flex flex-col mb-4 animate-pulse items-center">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-1"></div>
                  <div className="h-10 bg-gray-700 rounded w-3/4"></div>
                </div>
                
              ))
            ) : createdCoins.length === 0 ? (
              <div className="col-span-2 text-gray-400 text-center py-8">
                <p>No coins created yet</p>
                <Link 
                  href="/launch" 
                  className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block"
                >
                  Launch your coin
                </Link>
              </div>
            ) : (
              <AnimatePresence>
                {createdCoins.slice(0, displayCount).map((coin, index) => (
                  <motion.div
                    key={coin.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <SingleCard
                      coinId={coin.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Load More Button - only show if there are more coins to load */}
          {!loading && createdCoins.length > displayCount && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setDisplayCount(prev => prev + 6)}
                className="bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Load More
              </button>
            </div>
          )}

          {/* Show total count */}
          {!loading && createdCoins.length > 0 && (
            <div className="text-center text-gray-400 mt-4">
              Showing {Math.min(displayCount, createdCoins.length)} of {createdCoins.length} coins
            </div>
          )}
        </div>
      )}

      {(activeTab === 'followers' || activeTab === 'following') && (
        <div>
          <FollowersList
            userId={profileData.id}
            type={activeTab as 'followers' | 'following'}
            isOwnProfile={isOwnProfile}
          />
        </div>
      )}

      {activeTab === 'notifications' && isOwnProfile && (
        <div className="mt-4">
          <NotificationDisplay onUnreadCountChange={handleUnreadCountChange} />
        </div>
      )}

      {activeTab === 'claims' && isOwnProfile && (
        <ClaimsDisplay userId={profileData.id} />
      )}

      {activeTab === 'transactions' && isOwnProfile && (
        <div className="mt-4">
          <TransactionsDisplay userAddress={profileData.address} />
        </div>
      )}
    </>
  );
}