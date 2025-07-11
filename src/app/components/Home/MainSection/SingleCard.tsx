//src/app/components/Home/MainSection/SingleCard.tsx

import { CreatedHolding } from '@/app/types/profileTabs';
import { formatNumber } from '@/utils/formatters';
import { IoFlash, IoMusicalNotes } from 'react-icons/io5';
import Image from 'next/image';
import Link from 'next/link';

interface SingleCardProps {
  data: CreatedHolding;
}

export const SingleCard = ({ data }: SingleCardProps) => {

  const coinData = data.coin;
  const creatorData = coinData.creator

  const progress = coinData.tokenData?.progress;
  const liveMarketCap = coinData.tokenData?.liveMarketCap;

  const logoSrc = progress === 100 ? '/images/ethereum.svg' : '/images/base-logo.webp';

  if (!coinData) {
    return <div>No data available</div>;
  }

  return (
    <div className="relative max-w-md">
      <div className="relative rounded-xl p-2 bg-gray-600 hover:bg-indigo-600">
        <div className="bg-black relative rounded-lg">
          {data.coin.isPremium && (
            <div className="absolute top-4 right-14 z-10">
              <div className="flex items-center bg-gradient-to-r from-amber-500 to-yellow-300 px-2 py-1 rounded-md shadow-lg">
                <IoFlash className="text-amber-900" size={14} />
              </div>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Image
              src={logoSrc}
              alt={progress === 100 ? 'Ethereum logo' : 'Base logo'}
              width={24}
              height={24}
              priority={true}
            />
          </div>

          <Link href={`/coin/${data.coinId}`}>
            <button className="w-full text-left cursor-pointer">
              <div className="flex p-4">
                <div className="w-1/4 mr-4 h-32 overflow-hidden flex-shrink-0 flex items-start justify-center">
                  <Image
                    src={coinData.imageUrl}
                    alt={coinData.name}
                    width={100}
                    height={100}
                    className="rounded-lg"
                  />
                </div>
                <div className="w-3/4 flex flex-col">
                <h2 className="text-white text-xl font-bold mb-1">
                    {coinData.name.length > 18 ? `${coinData.name.slice(0, 18)}...` : coinData.name}
                  </h2>
                  <p className="text-indigo-400 font-semibold mb-1 flex items-center">
                    {coinData.ticker}
                    {coinData.audioUrl && (
                      <span className="ml-2 flex items-center bg-gradient-to-r from-purple-500/90 to-purple-500/50 px-1.5 py-0.5 rounded text-xs text-white">
                        <IoMusicalNotes className="mr-0.5" size={10} />
                        <span className="text-xs">Audio Meme</span>
                      </span>
                    )}
                  </p>
                  {liveMarketCap && (
                    <p className="text-lime-500 mb-1">
                      MCap: {liveMarketCap !== 0 ? `$${formatNumber(liveMarketCap)}` : '...'}
                    </p>
                  )}
                  <p className="text-gray-300 mb-1 flex items-center whitespace-nowrap">
                    <span className="min-w-fit">Created by</span>
                    <span className="text-blue-500 ml-1 truncate max-w-[200px]">
                      {creatorData.username}
                    </span>
                  </p>
                  <p className="text-white line-clamp-1">{coinData.description}</p>
                </div>
              </div>
            </button>
          </Link>
          {progress !== undefined && (
            <>
              <div className={`absolute bottom-2 left-2 text-green-300 p-2 text-sm font-bold`}>
                {progress.toFixed(2)}%
              </div>
              <div className="bg-gray-700 h-4 w-full">
                <div
                  className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-600 h-full"
                  style={{ width: `${progress.toFixed(2)}%` }}
                >
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};