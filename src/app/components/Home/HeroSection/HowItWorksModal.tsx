import { Bs1Circle, Bs2Circle, Bs3Circle } from "react-icons/bs";
import { useEthPrice } from '@/app/hooks/useCoinMetrics';
import React, { useRef, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import Link from 'next/link';

type HowItWorksModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { ethPrice } = useEthPrice();

  useEffect(() => {
    if (!isOpen) return;

    if (isOpen) {
      // Disable scrolling on body when modal opens
      document.body.style.overflow = 'hidden';
    }

    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Re-enable scrolling when modal closes
      document.body.style.overflow = 'unset';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-100 w-screen h-screen overflow-hidden">
      <div className="w-full max-h-[100vh] max-w-md md:max-w-lg lg:max-w-[808px] p-4 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 pr-2">
        <div ref={modalRef} className="bg-gray-900 p-4 sm:p-6 md:p-8 rounded-lg w-full relative text-white shadow-lg">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors border border-white border-opacity-20 hover:border-opacity-80 rounded-full p-2 z-10"
            aria-label="Close modal"
          >
            <IoClose size={20} />
          </button>

          {/* Header Section */}
          <h3 className="text-2xl sm:text-3xl font-semibold mb-12 mt-6 pr-12 md:pr-0 md:mt-0 text-white/90">
            Buy, Sell <span className='font-light'>&</span>  Launch Safe Tokens <span className='font-light'>on</span> Ethereum
          </h3>

          {/* Features Section */}
          <div className="mb-10 grid grid-cols-2 gap-3">
            {['Fair Launch', 'No Rugs', 'No Presale', 'No Team Allocation'].map((feature) => (
              <div key={feature} className="flex mb-4 items-center gap-2">
                <div className="flex-shrink-0 w-6">
                  <FaCheckCircle className="text-green-400" />
                </div>
                <span className="text-white text-xl font-semibold">{feature}</span>
              </div>
            ))}
          </div>

          {/* Base Network Section */}
          <div className="mb-12 inline-block">
            <h4 className="inline-flex items-center gap-2 text-lg font-semibold mb-3 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 rounded">
              <Bs1Circle />
              <span>Trade on Base</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-white/90">
              <li>Buy the coin on the bonding curve.</li>
              <li>Sell anytime to lock in your profits or losses.</li>
              <li>When enough people buy on the bonding curve, it reaches a market cap of 40 ETH (${Math.round(ethPrice! * 40).toLocaleString('en-US')}).</li>
            </ol>
          </div>

          {/* Deployment Section */}
          <div className="mb-12">
            <h4 className="inline-flex items-center gap-2 text-lg font-semibold mb-3 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 rounded">
              <Bs2Circle />
              <span>Claim your tokens on Ethereum</span>
            </h4>
            <p className="text-white/90">
              Deployment on Ethereum: The token is created, and 8 ETH (${Math.round(ethPrice! * 8).toLocaleString('en-US')}) of liquidity is bridged, deposited on Uniswap V4, and locked forever. 
              You can easily claim your tokens on Ethereum from Base.
            </p>
          </div>

          {/* Ethereum Section */}
          <div className="mb-8">
          <h4 className="inline-flex items-center gap-2 text-lg font-semibold mb-3 bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 rounded">
              <Bs3Circle />
              <span>Trade on Ethereum</span>
            </h4>
            <p className="text-white/90">
              Trade on Uniswap V4 directly through MemeKult from the Ethereum network.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link 
              href='https://memekult.gitbook.io/memekult-docs/documentation/faq'
              className="flex justify-center text-sm mb-3 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              FAQ
            </Link>
            <Link 
              href='https://memekult.gitbook.io/memekult-docs/documentation/api'
              className="flex justify-center text-sm mb-3 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              API
            </Link>
          </div>

          {/* Disclaimer Section */}
          <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10">
            <h4 className="font-semibold mb-2 text-gray-300 text-sm">Disclaimer</h4>
            <p className="text-xs text-white/80 leading-relaxed">
              Tokens launched on this platform are not endorsed by MemeKult.com. 
              MemeKult.com is not an investment platform; the value of your tokens may decrease significantly at any time. 
              By using MemeKult.com, you acknowledge and accept all associated risks and agree to our <Link
                href="https://memekult.gitbook.io/memekult-docs/legal/terms-and-conditions"
                className='underline hover:text-gray-100'
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms and Conditions
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}