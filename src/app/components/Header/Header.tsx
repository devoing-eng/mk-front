// src/app/components/Header/Header.tsx

"use client";

import { EthereumProvider, ProviderRpcError, WalletOption } from '@/app/types/ethereum';
import { defaultProfileImage } from '@/app/constants/general';
import { IoClose, IoWalletOutline } from 'react-icons/io5';
import { useAuth } from '@/app/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/app/hooks/useUser';

import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { BiggestBuyers } from './BiggestBuyers';

const Header = () => {
  
  const { isConnected, setIsConnected, setAddress, authenticateWithSignature } = useAuth();
  const { user, loading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(defaultProfileImage);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // setProfileImage
  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(user.profileImage);
    }
  }, [user]);

  // checkExistingConnection 
  useEffect(() => {
    const checkExistingConnection = async () => {
      const savedAddress = localStorage.getItem('walletAddress');
      const savedConnectionType = localStorage.getItem('walletType');
  
      if (savedAddress && savedConnectionType) {
        try {
          switch (savedConnectionType) {
            case 'metamask':
              if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];;
                if (accounts[0]?.toLowerCase() === savedAddress.toLowerCase()) {
                  setAddress(accounts[0]);
                  setIsConnected(true);
                }
              }
              break;
            case 'phantom':
              if ('phantom' in window && window.phantom?.ethereum?.isPhantom) {
                const accounts = await window.phantom.ethereum.request({ 
                  method: 'eth_accounts' 
                }) as string[];
                
                if (accounts[0]?.toLowerCase() === savedAddress.toLowerCase()) {
                  setAddress(accounts[0]);
                  setIsConnected(true);
                }
              }
              break;
            case 'coinbase':
              if (typeof window.coinbaseWalletExtension !== 'undefined') {
                const accounts = await window.coinbaseWalletExtension.request({ method: 'eth_accounts' }) as string[];;
                if (accounts[0]?.toLowerCase() === savedAddress.toLowerCase()) {
                  setAddress(accounts[0]);
                  setIsConnected(true);
                }
              }
              break;
            case 'trust':
              if (typeof window.trustwallet !== 'undefined') {
                const accounts = await window.trustwallet.request({ method: 'eth_accounts' }) as string[];;
                if (accounts[0]?.toLowerCase() === savedAddress.toLowerCase()) {
                  setAddress(accounts[0]);
                  setIsConnected(true);
                }
              }
              break;
          }
        } catch (error) {
          console.error('Error reconnecting wallet:', error);
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('walletType');
        }
      }
    };
  
    checkExistingConnection();
  }, [setAddress, setIsConnected]);

  const connectMetaMask = async () => {
    // Check for MetaMask (not Phantom)
    let provider: EthereumProvider;

    if (window.ethereum?.isMetaMask && !window.ethereum?.isPhantom) {
      provider = window.ethereum;
    } else if (window.web3?.isMetaMask && !window.web3?.isPhantom) {
      provider = window.web3;
    } else {
      console.error('MetaMask not detected');
      window.open('https://metamask.io/en-GB/download', '_blank');
      return;
    }
    
    try {
      // Define Base Mainnet parameters
      const baseChainId = '0x2105'  // 8453 in hex
      const baseNetworkParams = {
        chainId: baseChainId,
        chainName: 'Base Mainnet',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org']
      } as const;
  
      // First request accounts - before chain switching
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      // Then try to switch chains
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: baseChainId }]
        });
      } catch (error) {
        // Type guard for ProviderRpcError
        if (
          error instanceof Error && 
          'code' in error && 
          (error as ProviderRpcError).code === 4902
        ) {
          try {
            // Add the Base network
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [baseNetworkParams]
            });
          } catch (addError) {
            console.error('Failed to add Base network:', addError);
            return;
          }
        } else {
          console.error('Failed to switch to Base network:', error);
          // Continue anyway, as the user might already be on the correct network
        }
      }
      
      // Get the address from the accounts
      const address = accounts[0];
      setAddress(address);
      setIsConnected(true);
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('walletType', 'metamask');
  
      // Authenticate with backend
      await authenticateWithSignature(address);
  
    } catch (error) {
      console.error('Failed to connect to MetaMask:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  const connectCoinbase = async () => {
    if (typeof window.coinbaseWalletExtension !== 'undefined') {
      try {
        const accounts = await window.coinbaseWalletExtension.request({ method: 'eth_requestAccounts' }) as string[];
        const address = accounts[0];
        setAddress(address);
        setIsConnected(true);
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('walletType', 'coinbase');

        await authenticateWithSignature(address);
      } catch (error) {
        console.error('Failed to connect to Coinbase Wallet:', error);
      }
    }
  };

  const connectPhantom = async (): Promise<void> => {
    if ('phantom' in window) {
      const provider = window.phantom?.ethereum;
      
      if (provider?.isPhantom) {
        try {
          // First, request account access
          const response = await provider.request({ 
            method: 'eth_requestAccounts' 
          });
          
          // Type guard to ensure response is string array
          if (!Array.isArray(response) || !response.every(item => typeof item === 'string')) {
            throw new Error('Invalid response format from eth_requestAccounts');
          }
  
          const address = response[0];
  
          // Then, try to switch to Base Mainnet
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x2105' }],
            });
          } catch (switchError) {
            // Check if the error is because the chain needs to be added
            if (
              switchError instanceof Error && 
              'code' in switchError && 
              (switchError as { code: number }).code === 4902
            ) {
              // Add the Base Mainnet network
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x2105',
                  chainName: 'Base Mainnet',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org'],
                }],
              });
            } else {
              throw switchError;
            }
          }
  
          // After successful chain switch/add, set the connection
          setAddress(address);
          setIsConnected(true);
          localStorage.setItem('walletAddress', address);
          localStorage.setItem('walletType', 'phantom');
  
          // Authenticate with backend
          await authenticateWithSignature(address);
  
        } catch (error) {
          if (error instanceof Error) {
            if ('code' in error) {
              const providerError = error as { code: number; message: string };
              switch (providerError.code) {
                case -32002:
                  console.error('There is already a pending wallet connection request');
                  toast.error('There is already a pending wallet connection request');
                  break;
                case 4001:
                  console.error('User rejected the connection request');
                  toast.error('User rejected the connection request');
                  break;
                default:
                  console.error(`Failed to connect to Phantom: ${providerError.message}`);
              }
            } else {
              console.error('Failed to connect to Phantom:', error.message);
            }
          } else {
            console.error('An unknown error occurred while connecting to Phantom');
          }
        }
      }
    } else {
      window.open('https://phantom.app/', '_blank');
    }
  };

  const connectTrustWallet = async () => {
    if (typeof window.trustwallet !== 'undefined') {
      try {
        const accounts = await window.trustwallet.request({ method: 'eth_requestAccounts' }) as string[];
        const address = accounts[0];
        setAddress(address);
        setIsConnected(true);
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('walletType', 'trust');

        await authenticateWithSignature(address);
      } catch (error) {
        console.error('Failed to connect to Trust Wallet:', error);
      }
    }
  };

  const disconnectWallet = async () => {

    setIsConnected(false);
    setAddress('');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
  };

  const openConnectModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeConnectModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  const toggleProfilePopup = () => {
    setIsProfilePopupOpen(!isProfilePopupOpen);
  };

  const wallets: WalletOption[] = [
    { name: 'MetaMask', logo: '/images/metamask-logo.png', onClick: connectMetaMask },
    { name: 'Coinbase', logo: '/images/coinbase-logo.png', onClick: connectCoinbase },
    { name: 'Phantom', logo: '/images/phantom-logo.png', onClick: connectPhantom },
    { name: 'Trust Wallet', logo: '/images/trustwallet-logo.png', onClick: connectTrustWallet },
  ];

  return (
    <>
      <header className="top-0 left-0 w-full bg-transparent flex justify-between items-center p-4 border-b border-indigo-300 z-20">
        <Link href="/" className="text-2xl font-bold text-white">
          <Image
            src="/images/mk-logo.png"
            alt="MemeKult"
            width={100}
            height={100}
            className="w-10 h-10"
          />
        </Link>
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
          <BiggestBuyers />
        </div>

        {!isConnected ? (
          <div>
            <button
              onClick={openConnectModal}
              className="flex items-center gap-2 bg-transparent border text-white border-white rounded-full px-4 py-2 hover:bg-white hover:text-gray-900 transition"
            >
              Connect Wallet
              <IoWalletOutline />
            </button>
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 w-full p-4">
                <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-sm px-6 py-6 relative">
                  <button
                    onClick={closeConnectModal}
                    className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors border border-white border-opacity-20 hover:border-opacity-80 rounded-full p-1"
                    aria-label="Close modal"
                  >
                    <IoClose size={20} />
                  </button>
                  <div className="relative flex flex-col items-center justify-center mb-8 mt-5">
                    {/* Gradient underline effect */}
                    <div className="absolute -bottom-1 w-32 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                    
                    {/* Optional subtle glow effect behind text */}
                    <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full" />
                    
                    {/* Main title */}
                    <h2 className="text-lg sm:text-2xl text-white font-semibold tracking-wide">
                      Choose a Wallet
                    </h2>
                  </div>
                  
                  {/* Main 4 wallets in a grid */}
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto p-4">
                    {wallets.slice(0, 4).map((wallet, index) => (
                      <button
                        key={wallet.name}
                        onClick={() => {
                          wallet.onClick();
                          closeConnectModal();
                        }}
                        className={`
                          relative group flex flex-col items-center justify-center p-6
                          bg-gray-800 rounded-xl transition-all duration-300
                          hover:bg-gray-700 hover:shadow-lg hover:scale-105
                          ${index === 0 ? 'hover:bg-orange-900/30' : ''}
                          ${index === 1 ? 'hover:bg-blue-600/30' : ''}
                          ${index === 2 ? 'hover:bg-purple-800/30' : ''}
                          ${index === 3 ? 'hover:bg-sky-600/30' : ''}
                        `}
                      >
                        <div className="relative w-12 h-12 mb-2 transition-transform duration-300 group-hover:scale-110">
                          <Image
                            src={wallet.logo}
                            alt={`${wallet.name} logo`}
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>
                        
                        <span className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-2">
                          {wallet.name}
                        </span>
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div onClick={toggleProfilePopup} className="flex items-center bg-gray-800 rounded-full p-1 cursor-pointer relative z-50">
            <Image
              src={profileImage || defaultProfileImage}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full mr-2"
            />
            {loading ? (
              <span className="text-white mr-2">Loading...</span>
            ) : (
              <span className="text-white mr-2">@{user?.username || 'Unknown'}</span>
            )}
            {isProfilePopupOpen && (
              <div ref={popupRef} className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4">
                <div className="flex items-center mb-4">
                  <Image
                    src={profileImage || defaultProfileImage}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="rounded-full mr-3"
                  />
                  <div>

                  {loading ? (
                    <p className="text-white font-bold">Loading...</p>
                  ) : !user?.username ? (
                    <p className="text-white font-bold">Error loading profile</p>
                  ) : (
                    <>
                      <Link
                      href={`/creator/${encodeURIComponent(user.address)}`}
                      onClick={() => setIsProfilePopupOpen(false)}
                      className="group inline-flex items-center gap-2 text-white font-bold hover:text-indigo-400 transition-all duration-200"
                    >
                      @{user?.username}
                      <svg 
                        className="w-3.5 h-3.5 transition-transform duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:translate-y-0.5" 
                        fill="currentColor" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        />
                      </svg>
                    </Link>
                  </>
                  )}
                  </div>
                </div>
                <div 
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(user?.address || '');
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
                    } catch (err) {
                      console.error('Failed to copy:', err);
                    }
                  }}
                  className="group bg-gray-800 hover:bg-gray-750 text-white p-3 rounded-lg mb-4 text-xs cursor-pointer transition-all duration-200 hover:shadow-lg relative"
                >
                  <span className='font-medium text-gray-300'>Your address:</span>
                  <div className="mt-1 font-mono tracking-wider break-all">
                    {user?.address?.split('').map((char, index) => (
                      <span
                        key={index}
                        className="text-gray-400 group-hover:text-indigo-400 transition-colors duration-700"
                        style={{ transitionDelay: `${index * 30}ms` }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="w-full text-xs bg-gray-700 text-white py-2 rounded hover:bg-gray-600 transition"
                >
                  Disconnect wallet
                </button>
                <button
                  onClick={() => setIsProfilePopupOpen(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white transition"
                  aria-label="Close"
                >
                  <IoClose size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </header>
      <div className="md:hidden w-full overflow-x-auto py-2 px-2">
        <BiggestBuyers />
      </div>
    </>
  );
};

export default Header;