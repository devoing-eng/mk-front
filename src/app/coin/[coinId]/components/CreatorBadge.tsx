// src/app/coin/[coinId]/components/CreatorBadge.tsx

import { defaultProfileImage } from "@/app/constants/general";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import { CoinStaticData } from "@/app/types/coin";
import { timeAgo } from "@/utils/dateFormat";
import Image from 'next/image';
import Link from "next/link";

const CreatorBadge = ({ coinData }: { coinData: CoinStaticData }) => {
    
    const { 
      data: creatorData, 
      isLoading, 
      isError 
    } = useUserProfile(coinData.creatorAddress);
  
    if (isLoading) {
      return (
        <div className="flex items-center bg-rose-300 rounded-lg px-3 py-1 animate-pulse">
          <div className="w-6 h-6 bg-gray-300 rounded-full mr-2" />
          <div className="w-20 h-4 bg-gray-300 rounded" />
        </div>
      );
    }
  
    if (isError || !creatorData) {
      return (
        <div className="flex items-center bg-rose-300 rounded-lg px-3 py-1">
          <Image
            src={defaultProfileImage}
            alt="Default avatar"
            width={24}
            height={24}
            className="rounded-full mr-2 h-auto w-auto"
          />
          <Link 
            href={`/creator/${coinData.creatorAddress}`}
            className="text-gray-900 hover:underline"
          >
            Creator
          </Link>
        </div>
      );
    }
  
    return (
      <div className='flex items-center gap-4'>
        <div className="flex items-center bg-rose-300 rounded-lg px-3 py-1">
          <Image
            src={creatorData.data.image || defaultProfileImage}
            alt={creatorData.data.username}
            width={24}
            height={24}
            className="rounded-full mr-2 max-w-[24px] h-auto w-auto"
          />
          <Link 
            href={`/creator/${coinData.creatorAddress}`}
            className="text-gray-900 hover:underline"
          >
            {creatorData.data.username}
          </Link>
        </div>
        <div>
          <span className="text-sm text-gray-300">
            {timeAgo(new Date(coinData.createdAt))}
          </span>
        </div>
      </div>
    );
};

export default CreatorBadge;