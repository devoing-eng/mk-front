//src/app/creator/[id]/components/ProfileHeader.tsx


import { defaultProfileImage } from '@/app/constants/general';
import { useCreatorFees } from '@/app/hooks/useCreatorFees';
import { ProfileData } from '@/app/types/profileTabs';
import { RiCoinsLine } from 'react-icons/ri';
import { useEffect, useState } from 'react';
import FollowButton from './FollowButton';
import WalletModal from './WalletModal';
import { CiEdit } from 'react-icons/ci';
import UserStats from './UserStats';
import Image from 'next/image';
import Link from 'next/link';

interface ProfileHeaderProps {
  profileData: ProfileData;
  isOwnProfile: boolean;
  onEditProfile: () => void;
  isLoading: boolean; 
}

export default function ProfileHeader({
  profileData,
  isOwnProfile,
  onEditProfile
} : ProfileHeaderProps) {
  const userAddress = profileData.address;
  const { fees, fetchFees } = useCreatorFees(userAddress);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  return (
    <>
    <div className='container mx-auto p-4'>
      <div className='bg-gray-900/50 rounded-2xl backdrop-blur-sm relative'>
        <div className='absolute top-4 right-4 md:hidden'>
          <div className="bg-gray-800/60 p-3 rounded-xl backdrop-blur-sm">
            <p className="font-mono text-xs mb-1">
              {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </p>
            <Link
              href={`https://basescan.org//search?f=0&q=${userAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-xs hover:text-blue-300 transition-colors flex items-center gap-1 group"
            >
              View on BaseScan
              <svg 
                className="w-3 h-3 transform transition-transform group-hover:translate-x-1" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
              </svg>
            </Link>
          </div>
        </div>
        {/* Main profile section */}
        <div className='flex flex-col md:flex-row gap-6'>
          {/* Left side - Avatar */}
          <div className='flex-shrink-0'>
            <Image
              src={profileData.profileImage || defaultProfileImage}
              alt="Creator Avatar"
              width={90}
              height={90}
              className="rounded-xl shadow-lg max-w-[90px] w-auto h-auto"
              priority
            />
          </div>
  
          {/* Middle section - User info */}
          <div className='flex-grow space-y-4'>
            {/* Username and buttons row */}
            <div className='flex flex-wrap items-center gap-4'>
              <h1 className="text-2xl font-bold">
                @{profileData.username.length > 22 
                  ? profileData.username.substring(0, 22) + "..." 
                  : profileData.username}
              </h1>
              <div className='flex gap-2'>
                {isOwnProfile ? (
                  <>
                  <button
                    onClick={onEditProfile}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-800 transition-colors"
                  >
                    <CiEdit className="w-4 h-4" />
                    <span className="text-sm">Edit Profile</span>
                  </button>
                  </>
                ) : (
                  <FollowButton targetUserId={profileData.id} />
                )}
              </div>
            </div>
  
            {/* Stats */}
            <div className='flex gap-4'>
              <UserStats userId={profileData.id} />
            </div>
  
            {/* Bio */}
            <p className="text-gray-400 max-w-2xl">{profileData.bio}</p>
            
            {/* Creator Earnings Button */}
            <div className='flex gap-2'>
              {isOwnProfile ? (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium shadow-lg transition-all duration-300 hover:shadow-indigo-500/25 hover:-translate-y-0.5"
                >
                  <RiCoinsLine className="w-5 h-5" />
                  <span>Creator Earnings</span>
                  <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              ):(
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 shadow-sm">
                  <RiCoinsLine className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Creator Earnings: 
                    <span className="ml-1 text-indigo-400">+{fees.totalFeesUSD}$</span>
                  </span>
                </div>
              )}
            </div>
          </div>
  
          {/* Right side - Wallet info */}
          <div className='hidden md:flex flex-col gap-4 md:items-end'>
            {/* Wallet Address Card */}
            <div className="bg-gray-800/60 p-4 rounded-xl backdrop-blur-sm w-[200px] md:w-auto">
              <p className="font-mono text-sm mb-2">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </p>
              <Link
                href={`https://basescan.org/address/${userAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-sm hover:text-blue-300 transition-colors flex items-center gap-2 group"
              >
                View on BaseScan
                <svg 
                  className="w-4 h-4 transform transition-transform group-hover:translate-x-1" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Modal */}
    {isOwnProfile && isWalletModalOpen && (
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        userAddress={userAddress}
      />
    )}
    </>
  );
}