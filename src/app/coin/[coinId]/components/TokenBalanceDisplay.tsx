import { useTokenBalances } from '@/app/hooks/useTokenBalances';
import { IoRefreshOutline } from 'react-icons/io5';
import { CoinStaticData } from '@/app/types/coin';
import Image from 'next/image';
import React from 'react';
import { MetamaskWatchAssetParams } from '@/app/types/ethereum';

interface TokenBalanceDisplayProps {
  coinData: CoinStaticData
  addressConnected: string | null
}

const TokenBalanceDisplay = ({
  coinData,
  addressConnected
}: TokenBalanceDisplayProps) => {

  const {
    l1Balance,
    l2Balance,
    isLoadingL1,
    isLoadingL2,
    refetch
  } = useTokenBalances({
    addressConnected,
    tokenAddressL2: coinData.tokenAddress,
    tokenAddressL1: coinData.tokenAddressOnL1,
  })

  const LoadingSkeleton = () => (
    <div className="h-6 w-full mt-1 bg-gray-200 animate-pulse rounded" />
  );
  if (!coinData) {
    return <LoadingSkeleton />;
  }

  const handleAddToMetamask = async (tokenAddress: string | null, ticker: string, imageUrl: string) => {
    if (!window.ethereum || !tokenAddress) return;

    const params: MetamaskWatchAssetParams = {
      type: 'ERC20',
      options: {
        address: tokenAddress,
        symbol: ticker,
        decimals: 18,
        image: imageUrl
      }
    };
    
    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params
    });
  };

  const formatBalance = (balance: number): string => {
    return balance.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 4 
    });
  };

  // Determine what to display based on conditions
  const shouldShowL1 = coinData.tokenAddressOnL1 && (l2Balance === 0 || l1Balance > 0);
  const shouldShowL2 = !coinData.tokenAddressOnL1 || l2Balance > 0;

  return (
    <div className="w-full bg-gray-900 rounded-lg shadow-lg p-3 sm:p-4">
    <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
          <Image 
            src={coinData?.imageUrl ?? '/images/blockie1.jpg'} 
            alt={coinData?.ticker ?? 'Token'}
            width={24}
            height={24}
            className="w-full h-full object-cover"
            priority={false}
            loading="lazy"
            aria-label={`${coinData?.ticker ?? 'Token'} token icon`}
          />
        </div>
        <span className="text-sm sm:text-base font-medium text-gray-100">
          Your Balance
        </span>
        <button
          onClick={() => refetch()}
          disabled={isLoadingL1 || isLoadingL2}
          className="p-1 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
          aria-label="Refresh balances"
        >
          <IoRefreshOutline className={`w-3.5 h-3.5 text-gray-100 ${(isLoadingL1 || isLoadingL2) ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <button
        onClick={() => handleAddToMetamask(
          coinData.tokenAddressOnL1 || coinData.tokenAddress,
          coinData.ticker,
          coinData.imageUrl
        )}
        className="flex items-center gap-1 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        <Image
          src="/images/metamask-logo.png"
          alt="Metamask"
          width={16}
          height={16}
          className="rounded-full"
        />
        <span className="text-xs text-gray-100">Add to Metamask</span>
      </button>
    </div>
  
    <div className="space-y-2 sm:space-y-3">
      {shouldShowL2 && (
        <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-800 border border-gray-700">
          <div className="flex items-center gap-2">
            <Image 
              src="/images/base-logo.webp"
              alt="Base Network"
              width={16}
              height={16}
              className="rounded-full"
              priority={false}
              loading="lazy"
            />
            {isLoadingL2 ? (
              <div className="h-5 w-20 bg-gray-700 animate-pulse rounded" />
            ) : (
              <span className="text-gray-100 font-medium text-sm sm:text-base break-all">{formatBalance(l2Balance)}</span>
            )}
          </div>
          <span className="text-gray-400 font-medium ml-2 text-sm sm:text-base">{coinData?.ticker ?? 'Token'}</span>
        </div>
      )}
  
      {shouldShowL1 && (
        <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-800 border border-gray-700">
          <div className="flex items-center gap-2">
            <Image 
              src="/images/ethereum.svg"
              alt="Ethereum Network"
              width={16}
              height={16}
              className="rounded-full"
              priority={false}
              loading="lazy"
            />
            {isLoadingL1 ? (
              <div className="h-5 w-20 bg-gray-700 animate-pulse rounded" />
            ) : (
              <span className="text-gray-100 font-medium text-sm sm:text-base break-all">{formatBalance(l1Balance)}</span>
            )}
          </div>
          <span className="text-gray-400 font-medium ml-2 text-sm sm:text-base">{coinData?.ticker ?? 'Token'}</span>
        </div>
      )}
    </div>
  </div>
  );
};

export default TokenBalanceDisplay;