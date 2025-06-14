// src/app/creator/[id]/components/WalletModal.tsx

import { CREATORS_FEES_ABI, CREATORS_FEES_ADDRESS } from '@/app/constants/contracts';
import { NETWORK_CONSTANTS } from '@/app/constants/blockchain';
import { defaultProfileImage } from '@/app/constants/general';
import { useCreatorFees } from '@/app/hooks/useCreatorFees';
import React, { useState, useEffect } from 'react';
import CircularProgress from './CircularProgress';
import { GoArrowUpRight } from "react-icons/go";
import { useWeb3 } from '@/app/hooks/useWeb3';
import { HiWallet } from "react-icons/hi2";
import { IoClose } from 'react-icons/io5';
import { FiLoader } from "react-icons/fi";
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import Image from 'next/image';


interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
}

export default function WalletModal({ isOpen, onClose, userAddress }: WalletModalProps) {
  const explorerUrl = NETWORK_CONSTANTS.BASE_MAINNET.EXPLORER_URL;
  const { fees, loading, refetch } = useCreatorFees(userAddress);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [withdrawingAll, setWithdrawingAll] = useState(false);

  const {
    checkAndSwitchNetwork
  } = useWeb3()

  useEffect(() => {
    if (isOpen) {
      // Disable scrolling on body when modal opens
      document.body.style.overflow = 'hidden';
      refetch();
      // fetchFees();
    }
    return () => {
      // Re-enable scrolling when modal closes
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, refetch]);

  const handleWithdrawFees = async (tokenAddresses: string | string[]) => {
    // Convert single address to array for unified handling
    const addresses = Array.isArray(tokenAddresses) ? tokenAddresses : [tokenAddresses];
    const isBulkWithdrawal = addresses.length > 1;
    const toastId = isBulkWithdrawal ? 'withdraw-all' : 'withdraw';

    try {

      const isCorrectNetwork = await checkAndSwitchNetwork('BASE_MAINNET')
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Base network')
      }

      // Set appropriate loading state
      if (isBulkWithdrawal) {
        setWithdrawingAll(true);
      } else {
        setWithdrawing(addresses[0]);
      }

      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask or another web3 wallet');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
    
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      const contract = new ethers.Contract(
        CREATORS_FEES_ADDRESS,
        CREATORS_FEES_ABI,
        signer
      );

      toast.loading(
        isBulkWithdrawal 
          ? 'Processing withdrawal of all fees...' 
          : 'Processing withdrawal...', 
        { id: toastId }
      );

      const tx = await contract.withdrawFees(addresses, signerAddress);
      const receipt = await tx.wait();

      toast.success((
          <div className="flex flex-col gap-1">
            <span>
              {isBulkWithdrawal ? (
                <>
                  All fees <span className="text-green-500">withdrawn</span> successfully!
                </>
              ) : (
                <>
                  Fees <span className="text-green-500">withdrawn</span> successfully!
                </>
              )}
            </span>
            <a
              href={`${explorerUrl}/tx/${receipt.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              View on BaseScan →
            </a>
          </div>
        ),
        { id: toastId, duration: 5000 }
      );
    } catch (error) {
      console.error(
        isBulkWithdrawal 
          ? 'Error withdrawing all fees:' 
          : 'Error withdrawing fees:', 
        error
      );
      
      toast.error(
        error instanceof Error ? error.message : 'Failed to withdraw fees',
        { id: toastId }
      );
  
    } finally {
      if (isBulkWithdrawal) {
        setWithdrawingAll(false);
      } else {
        setWithdrawing(null);
      }
    }
  };

  const handleSingleWithdraw = (tokenAddress: string) => {
    return handleWithdrawFees(tokenAddress);
  };

  // All tokens withdrawal
  const handleWithdrawAll = () => {
    const tokenAddresses = fees.coins
      .filter(coin => parseFloat(coin.feesETH) > 0)
      .map(coin => coin.tokenAddress);
    return handleWithdrawFees(tokenAddresses);
  };

  const isTokenExpired = (creationTime: string): boolean => {
    const creationDate = new Date(parseInt(creationTime) * 1000); // Convert to milliseconds
    const now = new Date();
    const daysSinceCreation = (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation >= 366;
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-hidden z-50">
      <div className="bg-gray-900 text-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <HiWallet className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold"><span className='text-indigo-300'>Creator</span> Earnings</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <IoClose size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <FiLoader className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : (
          <>
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
              {parseFloat(fees.totalAvailableFeesETH) > 0 && (
                <div>
                  <p className="text-gray-400">Total Available</p>
                  <h3 className="text-2xl font-bold">{fees.totalAvailableFeesETH} ETH</h3>
                  <div className='flex items-center gap-2 mt-1'>
                    <p className="text-gray-400">${fees.totalAvailableFeesUSD}</p>
                    <button
                      onClick={handleWithdrawAll}
                      disabled={withdrawingAll}
                      className={`flex items-center justify-center  px-3 py-1 gap-2 rounded-lg 
                        ${withdrawingAll 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {withdrawingAll ? (
                        <FiLoader className="w-4 h-4 animate-spin" />
                      ) : (
                        <GoArrowUpRight className="w-4 h-4" />
                      )}
                      <span className='text-md font-semibold'>Withdraw All</span>
                    </button>
                  </div>
                </div>
              )}

                <div className="flex relative w-36 justify-end group">
                  <div className="px-2">
                    <p className='text-gray-400'>In Progress</p>
                    <h3 className="text-xl font-bold">{parseFloat(fees.totalFeesETH)} ETH</h3>
                  </div>
                </div>

              </div>
            </div>

            <div className="space-y-4">
              {fees.coins.map((coin) => (
                <div key={coin.tokenAddress} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                    <Image 
                      src={coin.imageUrl || defaultProfileImage} 
                      alt={coin.ticker}
                      width={32}
                      height={32}
                      className="rounded-full"
                      priority={false}
                      quality={75}
                      unoptimized={false}
                    />
                      <div>
                        <h4 className="font-semibold">{coin.ticker}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            {parseFloat(coin.feesETH).toFixed(5)} ETH 
                          </span>
                          <span className="text-xs text-gray-400">
                            <span className={
                              coin.change24h > 0 ? 'text-green-400' : 
                              'text-gray-400'
                            }>
                              {'+'}
                              {coin.change24h >= 0 ? coin.change24h : 0}%
                            </span>
                            {' in 24h.'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <CircularProgress coinId={coin.id} />
                      
                      <button
                        onClick={() => handleSingleWithdraw(coin.tokenAddress)}
                        disabled={
                          withdrawing === coin.tokenAddress || 
                          parseFloat(coin.feesETH) === 0 ||
                          coin.stage !== "5" ||
                          isTokenExpired(coin.creationTime)
                        }
                        className={`px-4 py-1 rounded-lg flex items-center gap-2 
                          ${withdrawing || 
                            parseFloat(coin.feesETH) === 0 || 
                            coin.stage !== "5" || 
                            isTokenExpired(coin.creationTime)
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'border border-indigo-500 hover:bg-indigo-70'
                          }`}
                      >
                        {withdrawing === coin.tokenAddress ? (
                          <FiLoader className="w-4 h-4 animate-spin" />
                        ) : (
                          <GoArrowUpRight className="w-4 h-4" />
                        )}
                        <span className='text-md'>Withdraw</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}