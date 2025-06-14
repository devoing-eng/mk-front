// src/app/coin/[coinId]/components/CoinProgress.tsx

import { FaXTwitter, FaTelegram, FaPlay, FaPause } from 'react-icons/fa6';
import { formatNumber, formatEthLiquidity } from '@/utils/formatters';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TRADING_CONSTANTS } from '@/app/constants/trading';
import { useCoinMetrics } from '@/app/hooks/useCoinMetrics';
import { formatEther, type BigNumberish } from 'ethers';
import LiquidityProgress from './LiquidityProgress';
import { CoinStaticData } from '@/app/types/coin';
import CoinDescription from './CoinDescription';
import { TbWorldWww } from 'react-icons/tb';
import Image from 'next/image';
import Link from 'next/link';

function calculateTokensAvailable(
  bridgeThreshold?: number,
  initialVToken?: number,
  vTokenReserve?: string
): number {
  if (!bridgeThreshold || !initialVToken || !vTokenReserve) {
    return 0;
  }

  try {
    const tokenReserveValue = parseFloat(formatEther(vTokenReserve as BigNumberish));

    return tokenReserveValue - (initialVToken - bridgeThreshold);
  } catch (error) {
    console.error('Error calculating tokens available:', error);
    return 0;
  }
}

interface CoinProgressProps {
  coinData: CoinStaticData
  coinId: string
}

export default function CoinProgress({ coinData, coinId }: CoinProgressProps) {
 
  const { maxMarketCap, progress, reserves: coinReserves, isLoading: isReservesLoading } = useCoinMetrics(coinId);

  const isBCCompleted = progress >= 100;

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tokensAvailable = useMemo(() => {
    
    if (isBCCompleted) {
      return '0';
    }

    const value = calculateTokensAvailable(
      TRADING_CONSTANTS.BRIDGE_THRESHOLD,
      TRADING_CONSTANTS.INIT_VTOKENS,
      coinReserves?.vTokenReserve
    );
    return formatNumber(value);
  }, [isBCCompleted, coinReserves?.vTokenReserve]);

  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(coinData.audioUrl);
      
      // Add event listeners to update state when audio ends
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      
      audioRef.current.onpause = () => {
        setIsPlaying(false);
      };
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg">
      {/* Basic Info Section */}
      <div className="flex items-start mb-4">
        <div className="relative mr-4 min-w-[6rem]">
          <Image
            src={coinData.imageUrl}
            alt={coinData.name}
            width={96}
            height={96}
            className="rounded-lg w-24 h-24 object-cover"
          />

          {/* Play button overlay */}
          {coinData.audioUrl && (
            <div 
              className="absolute inset-0 flex items-center justify-center rounded-lg cursor-pointer hover:bg-opacity-60 transition-all duration-200 overflow-hidden group"
              onClick={toggleAudio}
            >
              {/* Audio spectrum visualization - only shows when playing */}
              {isPlaying && (
                <div className="absolute inset-0 flex items-end justify-center bg-black bg-opacity-50">
                  <div className="flex items-end h-12 space-x-1 px-1">
                    <div className="w-1 bg-white bg-opacity-70 rounded-t-sm animate-audio-bar1 h-3"></div>
                    <div className="w-1 bg-white bg-opacity-70 rounded-t-sm animate-audio-bar7 h-6"></div>
                    <div className="w-1 bg-white bg-opacity-70 rounded-t-sm animate-audio-bar2 h-8"></div>
                    <div className="w-1 bg-white bg-opacity-70 rounded-t-sm animate-audio-bar3 h-5"></div>
                    <div className="w-1 bg-white bg-opacity-70 rounded-t-sm animate-audio-bar4 h-10"></div>
                    <div className="w-1 bg-white bg-opacity-70 rounded-t-sm animate-audio-bar5 h-4"></div>
                    <div className="w-1 bg-white bg-opacity-70 rounded-t-sm animate-audio-bar6 h-7"></div>
                    <div className="w-1 bg-white bg-opacity-70 rounded-t-sm animate-audio-bar7 h-6"></div>
                  </div>
                </div>
              )}
              
              {/* Dark overlay shown when not playing */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              )}
              
              {/* Play/Pause button */}
              <div className={`relative z-10 bg-white bg-opacity-90 rounded-full p-2 shadow-lg ${isPlaying ? 'scale-90 opacity-0 group-hover:opacity-100 transition-opacity' : 'scale-100'} transition-transform`}>
                {isPlaying ? (
                  <FaPause className="text-purple-600" size={18} />
                ) : (
                  <FaPlay className="text-purple-600" size={18} />
                )}
              </div>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold">{coinData.name}</h2>
          <p className="text-indigo-400">{coinData.ticker}</p>
          <CoinDescription description={coinData.description} maxChars={200} />
          
          {/* Social network buttons */}
          <div className="flex space-x-4 mt-2">
            {coinData.twitterLink && (
              <Link
                href={coinData.twitterLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="text-white hover:text-gray-300 transition-colors">
                  <FaXTwitter size={15} />
                </button>
              </Link>
            )}
            {coinData.telegramLink && (
              <Link
                href={coinData.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="text-white hover:text-gray-300 transition-colors">
                  <FaTelegram size={15} />
                </button>
              </Link>
            )}
            {coinData.website && (
              <Link
                href={coinData.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="text-white hover:text-gray-300 transition-colors">
                  <TbWorldWww size={15} />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {coinReserves && (
        <>
        {/* Blockchain Data Section */}
        <div className="w-full flex flex-col gap-4">
          <LiquidityProgress
            coinId={coinId}
            initialVETH={TRADING_CONSTANTS.INIT_VETH}
            vEthReserve={coinReserves.vEthReserve}
            tokensAvailable={tokensAvailable}
            isLoading={isReservesLoading}
          />
        </div>

          <p className="text-sm mb-4">
            When the market cap reaches <span className='font-semibold text-green-300'>
              ${formatNumber(maxMarketCap)}
            </span> all the liquidity from the bonding curve will be deposited into Uniswap V4 (Ethereum) and locked.
          </p>

          <p className="text-sm">
            There are <span className='font-semibold text-amber-300'>
              {tokensAvailable}
            </span> tokens still available for sale and
            <span className='font-semibold text-indigo-300 mx-1'> 
              {formatEthLiquidity(
                coinReserves.vEthReserve,
                TRADING_CONSTANTS.INIT_VETH
              )} ETH</span>in the bonding curve.
          </p>
        </>
      )}
    </div>
  );
}