// src/app/coin/[coinId]/components/AddressLink.tsx

import { BONDING_CURVE_ADDRESS } from '@/app/constants/contracts';
import React, { useRef, useState, useEffect } from 'react';
import { CoinStaticData } from '@/app/types/coin';
import { IoCopyOutline } from 'react-icons/io5';
import { FaLink } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import Image from 'next/image';

export const AddressLink = ({ coinData }: { coinData: CoinStaticData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const address = coinData.tokenAddressOnL1 || coinData.tokenAddress || BONDING_CURVE_ADDRESS;
  const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  
  const explorerUrl = coinData.tokenAddressOnL1
  ? `https://etherscan.io/token/${coinData.tokenAddressOnL1}`
  : coinData.tokenAddress 
      ? `https://basescan.org/token/${coinData.tokenAddress}`
      : `https://basescan.org/address/${BONDING_CURVE_ADDRESS}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!', {
      duration: 1500,
      style: {
        background: '#1f2937',
        color: '#fff',
        border: '1px solid rgba(55, 65, 81, 0.5)',
      },
      iconTheme: {
        primary: '#4f46e5',
        secondary: '#ffffff',
      },
    });
    setIsOpen(false);
  };

  const handleExplorer = () => {
    window.open(explorerUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex gap-2 items-center text-gray-300 hover:text-white transition-colors duration-200"
      >
        CA:<span className='underline'>{displayAddress}</span> 
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute left-10 z-50 mt-2 w-56 rounded-xl bg-gray-800/90 backdrop-blur-sm shadow-xl border border-gray-700 overflow-hidden"
        >
          <div className="p-1">
            <div className="rounded-lg overflow-hidden">
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 
                            hover:bg-gray-700/50 hover:text-white transition-all duration-200"
                >
                    <IoCopyOutline className="w-4 h-4" />
                    Copy Address
                </button>
            </div>
        
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mx-2 my-1" />

            {coinData.tokenAddressOnL1 && (
                <>
                    <div className="rounded-lg overflow-hidden">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(coinData.tokenAddress!);
                                toast.success('Base address copied to clipboard!', {
                                    duration: 1500,
                                    style: {
                                        background: '#1f2937',
                                        color: '#fff',
                                        border: '1px solid rgba(55, 65, 81, 0.5)',
                                    },
                                    iconTheme: {
                                        primary: '#4f46e5',
                                        secondary: '#ffffff',
                                    },
                                });
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 
                                    hover:bg-gray-700/50 hover:text-white transition-all duration-200"
                        >
                            <Image 
                              src="/images/base-logo.webp" 
                              alt="Base Chain Logo" 
                              width={16} 
                              height={16} 
                              className="w-4 h-4"
                              priority={false}
                              aria-label="Base Chain Logo"
                              loading="lazy"
                              quality={75}
                            />
                            CA on Base: {`${coinData.tokenAddress!.slice(0, 6)}...${coinData.tokenAddress!.slice(-4)}`}
                        </button>
                    </div>
                    
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mx-2 my-1" />
                </>
            )}
        
            <div className="rounded-lg overflow-hidden">
              <button
                  onClick={handleExplorer}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 
                          hover:bg-gray-700/50 hover:text-white transition-all duration-200"
              >
                  <FaLink className="w-4 h-4" />
                  Open on Explorer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};