// src/app/coin/[coinId]/components/CoinDetails.tsx

'use client';

import { formatNumber, formatTokens, formatTokensWithoutEther } from '@/utils/formatters';
import { useUpdateTokenAddress } from '@/app/hooks/useUpdateTokenAddress';
import { useStaticCoinData } from '@/app/hooks/useStaticCoinData';
import { NETWORK_CONSTANTS } from '@/app/constants/blockchain';
import { TRADING_CONSTANTS } from '@/app/constants/trading';
import { LoadingPageSkeleton } from './LoadingPageSkeleton';
import { useCoinMetrics } from '@/app/hooks/useCoinMetrics';
import { ERC20_ONL2_ABI } from '@/app/constants/contracts';
import FirstBuyConfirmation from './FirstBuyConfirmation';
import { NetworkStatusIndicator } from './NetworkStatus';
import TokenBalanceDisplay from './TokenBalanceDisplay';
import HolderDistribution from './HolderDistribution';
import { useAuth } from '@/app/contexts/AuthContext';
import TransactionTable from './TransactionTable';
import ThreadDiscussion from './ThreadDiscussion';
import TradingViewChart from './TradingViewChart';
import BridgeProgress from './BridgeProgress';
import { useWeb3 } from '@/app/hooks/useWeb3';
import ShillMessage from './ShillMessage';
import { ChartType } from '@/app/types/coin';
import SlippageModal from './SlippageModal';
import CoinProgress from './CoinProgress';
import CreatorBadge from './CreatorBadge';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';
import { AddressLink } from './AddressLink';
import { ChartToggle } from './ChartToggle';

export default function CoinDetails({ coinId } : { coinId : string}) {
  const [termsAccepted, setTermsAccepted] = useState(false);

  const initPrice = 2.45538*1e-9;

  const explorerUrl = NETWORK_CONSTANTS.BASE_MAINNET.EXPLORER_URL;
  const MIN_ETH_VALUE = TRADING_CONSTANTS.MIN_ETH_VALUE;
  const [inputValue, setInputValue] = useState<string>('0.003')
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [activeChart, setActiveChart] = useState<ChartType>('current');

  const [isSlippageModalOpen, setIsSlippageModalOpen] = useState(false)
  const [slippage, setSlippage] = useState(10) // Default 10%
  const [transactionError, setTransactionError] = useState<string | null>(null)

  const [activeView, setActiveView] = useState<'comments' | 'transactions'>('comments');
  const [activeMobileView, setActiveMobileView] = useState('buy');

  const [estimatedEth, setEstimatedEth] = useState<string>('0.0')
  const [estimatedTokens, setEstimatedTokens] = useState<string>('0.0')
  const { addressConnected } = useAuth(); 

  const {
    calculateTokensToReceive,
    calculateEthToReceive,
    buyTokens,
    sellTokens,
    loading,
    checkAndSwitchNetwork,
    web3Base
  } = useWeb3()

  const updateTokenAddress = useUpdateTokenAddress();
  const { data: coinData } = useStaticCoinData(coinId);
  const { liveMarketCap, progress, reserves: coinReserves } = useCoinMetrics(coinId);
  const isBCCompleted = progress >= 100;

  const handlePresetAmount = async (amount: string) => {
    setInputValue(amount);
    const fakeEvent = {
      target: { value: amount }
    } as React.ChangeEvent<HTMLInputElement>;
    await handleInputChange(fakeEvent);
  };

  const handleMaxAmount = async () => {
    let amount;
    if (!coinReserves) {
      amount = TRADING_CONSTANTS.MAX_COLLATERAL.toString();
    } else {
      const actualReserve = coinReserves.vEthReserve; // This is a string in wei
      
      // Convert actualReserve from wei (string) to ETH (number)
      const actualReserveInEth = parseFloat(ethers.formatEther(actualReserve));
      
      // Calculate the difference to get to MAX_COLLATERAL
      const availableToAdd = TRADING_CONSTANTS.MAX_COLLATERAL - 
                            (actualReserveInEth - TRADING_CONSTANTS.INIT_VETH);
      
      // Ensure we don't go below 0 in case of calculation errors
      amount = Math.max(0, availableToAdd).toFixed(6);
    }
    
    setInputValue(amount);
    const fakeEvent = {
      target: { value: amount }
    } as React.ChangeEvent<HTMLInputElement>;
    await handleInputChange(fakeEvent);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input or valid decimal numbers
    if (value === '' || value === '.') {
      setInputValue('');
      setEstimatedEth('0.0');
      setEstimatedTokens('0.0');
      return;
    }
  
    // Validate input format
    if (/^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setInputValue(value);
        
        if (numValue > 0 && coinData?.tokenAddress) {
          try {
            if (activeTab === 'sell') {
              // Calculate ETH for sell
              const ethToReceive = await calculateEthToReceive(numValue, coinData.tokenAddress);
              const ethInEther = web3Base?.utils.fromWei(ethToReceive, 'ether') || '0.0';
              setEstimatedEth((Number(ethInEther) * 0.99).toFixed(5));
            } else if (activeTab === 'buy') {
              // Calculate tokens for buy
              const numValueWithFees = numValue*0.99;
              const tokensToReceive = await calculateTokensToReceive(numValueWithFees, coinData.tokenAddress);
              const formattedTokens = formatTokens(tokensToReceive);

              setEstimatedTokens(formattedTokens);
            }
          } catch (err) {
            console.error(`Failed to calculate ${activeTab === 'sell' ? 'ETH' : 'tokens'}:`, err);
            if (activeTab === 'sell') {
              setEstimatedEth('0.0');
            } else {
              setEstimatedTokens('0.0');
            }
          }
        } else {
          if (numValue > 0) {
            
            if (activeTab === 'buy') {
              // Calculate tokens to receive based on ETH input
              const numValueWithFees = numValue * 0.99;
              const tokensToReceive = numValueWithFees / initPrice;
              const formattedTokens = formatTokensWithoutEther(tokensToReceive);
              setEstimatedTokens(formattedTokens);
              setEstimatedEth('0.0');
            } else if (activeTab === 'sell') {
              // Calculate ETH to receive based on token input
              const ethToReceive = numValue * initPrice;
              const ethWithFees = (ethToReceive * 0.99).toFixed(5);
              setEstimatedEth(ethWithFees);
              setEstimatedTokens('0.0');
            }
          } else {
            setEstimatedEth('0.0');
            setEstimatedTokens('0.0');
          }
        }
      }
    }
  };

  const handleAddValue = async (percentage: number) => {
    if (!coinData?.tokenAddress || !web3Base || !addressConnected) return;
  
    try {

      // Check network before
      const isCorrectNetwork = await checkAndSwitchNetwork('BASE_MAINNET')
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Base network')
      }

      // Create contract instance and explicitly type the balanceOf return value
      const tokenContract = new web3Base.eth.Contract(ERC20_ONL2_ABI, coinData.tokenAddress);
      const balance = await tokenContract.methods.balanceOf(addressConnected).call() as string;
      const balanceInTokens = web3Base.utils.fromWei(balance, 'ether');
      
      // Calculate percentage of balance      
      const amount = percentage === 100 
      ? balanceInTokens
      : (parseFloat(balanceInTokens) * percentage / 100).toFixed(6);

      setInputValue(amount);
      
      // Update estimated ETH
      try {
        const ethToReceive = await calculateEthToReceive(parseFloat(amount), coinData.tokenAddress)
        const ethInEther = web3Base.utils.fromWei(ethToReceive, 'ether');
        setEstimatedEth(Number(ethInEther).toFixed(6));
      } catch (err) {
        console.error('Failed to calculate ETH:', err)
      }
    } catch (err) {
      console.error('Failed to get balance:', err)
    }
  }

  const handleReset = () => {
    setInputValue('0.0')
    setEstimatedEth('0.0')
  }

  const handleTabChange = (tab: 'buy' | 'sell') => {
    setActiveTab(tab)
    setInputValue(tab === 'buy' ? '0.003' : '1000000');
  }

  const handleBuy = async () => {
    
    if (!coinId) {
      setTransactionError('Invalid coin ID')
      return
    }
  
    if (!addressConnected) {
      setTransactionError('User not authenticated');
      return;
    }  

    const ethValue = parseFloat(inputValue);
    
    if (ethValue < MIN_ETH_VALUE) {
      setTransactionError(`Minimum transaction amount is ${MIN_ETH_VALUE} ETH`);
      return;
    }

    try {
      setTransactionError(null)
      toast.loading('Buy in progress...', { id: 'buy' });
      
      if (!coinData) {
        throw new Error('Coin data not available')
      }

      // Check network before transaction
      const isCorrectNetwork = await checkAndSwitchNetwork('BASE_MAINNET')
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Base network')
      }

      // Calculate minimum tokens based on slippage
      let minTokens: string
      if (coinData.tokenAddress) {
        // For existing tokens, calculate minimum tokens
        const tokensToReceive = await calculateTokensToReceive(
          parseFloat(inputValue),
          coinData.tokenAddress
        )
        minTokens = (BigInt(tokensToReceive) * BigInt(Math.floor((100 - slippage - 1) * 10)) / BigInt(1000)).toString()
        setEstimatedTokens(formatTokens(minTokens));
      } else {
        // For first buy, use a default minimum tokens value
        minTokens = '0' // Random minimum value
      }

      // Call buyTokens with the coinId
      const result = await buyTokens(
        inputValue,
        minTokens.toString(),
        coinId,
        coinData.tokenAddress || ''
      )

      if (result.success) {
        try {
          const response = await fetch('/api/users/track-holding', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userAddress: addressConnected,
              coinId: coinId
            })
          });

          const trackingResult = await response.json();

          if (!response.ok) {
            console.error('Failed to track holding:', trackingResult.error);
          }
        } catch (error) {
          console.error('Error tracking holding:', error);
        }
        
        // If this was a first buy and we got a new token address, refresh the coin data
        if (result.tokenAddress) {
          await updateTokenAddress.mutateAsync({
            coinId,
            tokenAddress: result.tokenAddress
          });
        }

        toast.success((
            <div className="flex flex-col">
              <span>
                {`${coinData.ticker}`} <span className="text-green-500">bought</span> successfully!
              </span>
              <Link
                href={`${explorerUrl}/tx/${result.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                View on BaseScan →
              </Link>
            </div>
          ),
          { id: 'buy', duration: 5000 }
        );
      }

      // Reset input after successful transaction
      setInputValue('0.003');

    } catch (err) {
      console.error('Buy error:', err)
      toast.error('Buy error');
      toast.dismiss('buy');
    }
  }

  const handleSell = async () => {
    if (!coinId) {
      setTransactionError('Invalid coin ID')
      return
    }
  
    const tokenAmount = parseFloat(inputValue);
    if (tokenAmount <= 0) {
      setTransactionError('Invalid token amount');
      return;
    }
  
    try {
      setTransactionError(null)
      toast.loading('Sale in progress...', { id: 'sell' });
      
      if (!coinData || !coinData.tokenAddress) {
        throw new Error('Token not available for trading')
      }
  
      // Check network before transaction
      const isCorrectNetwork = await checkAndSwitchNetwork('BASE_MAINNET')
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Base network')
      }
  
      // Calculate minimum ETH based on slippage
      const ethToReceive = await calculateEthToReceive(
        tokenAmount,
        coinData.tokenAddress
      )
      
      // Calculate minimum ETH with slippage
      const minEth = (BigInt(ethToReceive) * BigInt(Math.floor((100 - slippage - 1) * 10)) / BigInt(1000)).toString()
  
      // Call sellTokens
      const result = await sellTokens(
        coinData.tokenAddress,
        inputValue,
        minEth
      )

      if (result.success){

        toast.success((
            <div className="flex flex-col">
              <span>
                {`${coinData.ticker}`} <span className="text-red-500">sold</span> successfully
              </span>
              <Link
                href={`${explorerUrl}/tx/${result.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                View on BaseScan →
              </Link>
            </div>
          ),
          { id: 'sell', duration: 5000 }
        );
      }

      // Reset input
      setInputValue('0.0')
    } catch (err) {
      console.error('Sell error:', err)
      toast.error('Sell error');
      toast.dismiss('sell');
    }
  }

  return !coinData ? (
    <LoadingPageSkeleton />
  ) : (
    <div className="flex flex-col text-white p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center lg:w-[73.7%] mb-3 gap-2 sm:gap-0">
        {coinData && (
          <>
            <div className="w-full sm:w-auto pb-2 sm:pb-0">
              <ShillMessage
                addressConnected={addressConnected}
                creatorAddress={coinData.creatorAddress}
                tokenAddress={coinData.tokenAddress}
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:whitespace-nowrap sm:gap-3">
                <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
                  <h2 className="text-md lg:text-lg font-bold break-all">{coinData.name.toUpperCase()}</h2>
                  <p className="text-indigo-400">{coinData.ticker}</p>
                  {liveMarketCap !== 0 && (
                    <p className="text-green-300">Mkt Cap: ${formatNumber(liveMarketCap)}</p>
                  )}
                </div>
                <div className="mt-1 sm:mt-0 flex items-center gap-3">
                  <AddressLink coinData={coinData}/>
                </div>
              </div>
            </div>

            <div className="flex justify-between w-full sm:w-auto items-center gap-2 mt-2 sm:mt-0">
              {coinData.tokenAddressOnL1 && (
                <ChartToggle 
                  activeChart={activeChart} 
                  onToggle={(type) => setActiveChart(type)} 
                />
              )}
              <CreatorBadge coinData={coinData} />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col flex-1">
          {/* Chart */} 
          <TradingViewChart
            coinData={coinData}
            activeChart={activeChart}
          />
          
          {/* Mobile View Toggle - only visible below lg breakpoint */}
          <div className="mt-4 flex lg:hidden justify-start overflow-x-auto pb-2">
            <div className="bg-gray-800 p-1 rounded-lg flex gap-1 text-sm">
              <button
                onClick={() => setActiveMobileView('buy')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  activeMobileView === 'buy'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveMobileView('progress')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  activeMobileView === 'progress'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setActiveMobileView('thread')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  activeMobileView === 'thread'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Thread
              </button>
              <button
                onClick={() => setActiveMobileView('trades')}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  activeMobileView === 'trades'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Trades
              </button>
            </div>
          </div>

          {/* Desktop View Toggle - only visible on lg and up */}
          <div className="mt-8 hidden lg:flex justify-start">
            <div className="bg-gray-800 p-1 rounded-lg flex gap-1 text-sm">
              <button
                onClick={() => setActiveView('comments')}
                className={`px-4 py-2 rounded-md transition-all cursor-pointer ${
                  activeView === 'comments'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Thread
              </button>
              <button
                onClick={() => setActiveView('transactions')}
                className={`px-4 py-2 rounded-md transition-all cursor-pointer ${
                  activeView === 'transactions'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Transactions
              </button>
            </div>
          </div>

          {/* Mobile Content Section - conditionally rendered based on mobile view */}
          <div className="mt-4 lg:hidden">
            {activeMobileView === 'buy' && (
              <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4">
                <div>
                  <NetworkStatusIndicator
                    isOnUniswap={isBCCompleted}
                    coinName={coinData.ticker.toUpperCase()}
                  />
                </div>
                
                {!isBCCompleted ? (
                  <>
                    <div className="flex gap-2">
                      <button 
                        className={`flex-1 py-2 rounded text-sm lg:text-base ${activeTab === 'buy' ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'}`}
                        onClick={() => handleTabChange('buy')}
                      >
                        Buy
                      </button>
                      <button 
                        className={`flex-1 py-2 rounded text-sm lg:text-base ${activeTab === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'}`}
                        onClick={() => handleTabChange('sell')}
                      >
                        Sell
                      </button>
                    </div>

                    {activeTab === 'buy' ? (
                      <>
                        <div className="flex justify-between">
                          <button 
                            onClick={() => setIsSlippageModalOpen(true)}
                            className="bg-gray-800 text-white px-3 py-1 rounded text-xs lg:text-sm"
                          >
                            Slippage: {slippage}%
                          </button>
                          <SlippageModal
                            isOpen={isSlippageModalOpen}
                            onClose={() => setIsSlippageModalOpen(false)}
                            onSelectSlippage={setSlippage}
                            currentSlippage={slippage}
                          />
                        </div>

                        <div className="relative flex items-center bg-transparent border border-gray-700 rounded p-2">
                          <input
                            id="buy-input-1"
                            type="number" 
                            value={inputValue}
                            onChange={handleInputChange}
                            step="0.001"
                            className="bg-transparent w-full pr-20 outline-none text-sm lg:text-base" 
                          />
                          <div className="absolute right-2 flex items-center gap-2">
                            <span className="text-sm lg:text-base">ETH</span>
                            <Image
                              src="/images/base-logo.webp"
                              alt="ETH Logo"
                              width={24}
                              height={24}
                              className="h-5 w-5"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          <button onClick={() => handlePresetAmount('0.0')} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">reset</button>
                          <button onClick={() => handlePresetAmount('0.01')} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">0.01 ETH</button>
                          <button onClick={() => handlePresetAmount('0.05')} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">0.05 ETH</button>
                          <button onClick={() => handlePresetAmount('0.1')} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">0.1 ETH</button>
                          <button onClick={() => handleMaxAmount()} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm col-span-4 cursor-pointer">MAX</button>
                        </div>

                        <p className="text-xs text-gray-400">
                          Minimum transaction: {MIN_ETH_VALUE} ETH
                        </p>
                        <button 
                          onClick={handleBuy}
                          disabled={!termsAccepted || loading || parseFloat(inputValue) < MIN_ETH_VALUE}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-white py-2 rounded text-sm lg:text-base"
                        >
                          {loading ? 'Processing...' : 'BUY'}
                        </button>

                        {parseFloat(inputValue) > 0 && (
                          <div className="text-xs text-gray-400">
                            Estimated {coinData.ticker} to receive: <span className='text-gray-300 font-medium'>{estimatedTokens} </span>{coinData.ticker}
                          </div>
                        )}

                        <FirstBuyConfirmation
                          addressConnected={addressConnected}
                          onConfirmed={setTermsAccepted} 
                        />

                        {/* Display transaction error */}
                        {transactionError && (
                          <div className="text-red-500 text-sm mt-2">
                            {transactionError}
                          </div>
                        )}
                      </>
                    ) : (
                      // Sales Interface
                      <>
                        <div className="flex justify-end">
                          <button 
                            onClick={() => setIsSlippageModalOpen(true)}
                            className="bg-gray-800 text-white px-3 py-1 rounded text-xs lg:text-sm"
                          >
                            Slippage: {slippage}%
                          </button>
                          <SlippageModal
                            isOpen={isSlippageModalOpen}
                            onClose={() => setIsSlippageModalOpen(false)}
                            onSelectSlippage={setSlippage}
                            currentSlippage={slippage}
                          />
                        </div>

                        <div className="relative flex items-center bg-transparent border border-gray-700 rounded p-2">
                          <input
                            id="sell-input-1"
                            type="number" 
                            value={parseFloat(inputValue).toFixed(6)}
                            onChange={handleInputChange}
                            step="10000"
                            className="bg-transparent w-full pr-20 outline-none text-sm lg:text-base" 
                          />
                          <div className="absolute right-2 flex items-center gap-2">
                            <span className="text-sm lg:text-base">{coinData.ticker}</span>
                            <Image
                              src={coinData.imageUrl}
                              alt={coinData.ticker}
                              width={24}
                              height={24}
                              className="rounded-full h-5 w-5"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          <button onClick={handleReset} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">reset</button>
                          <button onClick={() => handleAddValue(25)} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">25%</button>
                          <button onClick={() => handleAddValue(50)} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">50%</button>
                          <button onClick={() => handleAddValue(75)} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">75%</button>
                          <button onClick={() => handleAddValue(100)} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm col-span-4 cursor-pointer">100%</button>
                        </div>

                        <p className="text-xs text-gray-400">
                          Minimum transaction: {MIN_ETH_VALUE} ETH worth of tokens
                        </p>

                        <button 
                          onClick={handleSell}
                          disabled={loading || parseFloat(inputValue) <= 0 || !coinData.tokenAddress || parseFloat(estimatedEth) <= MIN_ETH_VALUE}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-white py-2 rounded text-sm lg:text-base"
                        >
                          {loading ? 'Processing...' : 'SELL'}
                        </button>

                        {parseFloat(inputValue) > 0 && (
                          <div className="text-xs text-gray-400">
                            Estimated ETH to receive: <span className='text-gray-300 font-medium'>{estimatedEth} </span>ETH
                          </div>
                        )}

                        <FirstBuyConfirmation
                          addressConnected={addressConnected}
                          onConfirmed={setTermsAccepted} 
                        />

                        {/* Display transaction error */}
                        {transactionError && (
                          <div className="text-red-500 text-sm mt-2">
                            {transactionError}
                          </div>
                        )}

                      </>
                    )}
                  </>
                ) : (
                  <BridgeProgress 
                    coinData={coinData}
                  />
                )}

                <TokenBalanceDisplay 
                  coinData={coinData}
                  addressConnected={addressConnected}
                />
              </div>
            )}
            
            {activeMobileView === 'progress' && (
              <>
                <CoinProgress 
                  coinData={coinData}
                  coinId={coinId}
                />
                <div className="mt-4">
                  <HolderDistribution coinData={coinData} />
                </div>
              </>
            )}
            
            {activeMobileView === 'thread' && (
              <ThreadDiscussion
                coinId={coinId}
                coinData={coinData}
              />
            )}
            
            {activeMobileView === 'trades' && (
              <TransactionTable
                coinId={coinId}
                coinData={coinData}
              />
            )}
          </div>

          {/* Desktop Content Section - only visible on lg and up */}
          <div className="mt-4 hidden lg:block">
            {activeView === 'comments' ? (
              <ThreadDiscussion
                coinId={coinId}
                coinData={coinData}
              />
            ) : (
              <TransactionTable
                coinId={coinId}
                coinData={coinData}
              />
            )}
          </div>
        </div>

        {/* Buy / Sell Component */}
        <div className="w-full lg:w-1/3 xl:w-1/4 hidden lg:flex flex-col gap-4 overflow-y-auto h-[1266px]">
          <div>
            <NetworkStatusIndicator
              isOnUniswap={isBCCompleted}
              coinName={coinData.ticker.toUpperCase()}
            />
          </div>
          
          {!isBCCompleted ? (
            <>
              <div className="flex gap-2">
                <button 
                  className={`flex-1 py-2 rounded text-sm lg:text-base ${activeTab === 'buy' ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'}`}
                  onClick={() => handleTabChange('buy')}
                >
                  Buy
                </button>
                <button 
                  className={`flex-1 py-2 rounded text-sm lg:text-base ${activeTab === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'}`}
                  onClick={() => handleTabChange('sell')}
                >
                  Sell
                </button>
              </div>

              {activeTab === 'buy' ? (
                <>
                  <div className="flex justify-between">
                    <button 
                      onClick={() => setIsSlippageModalOpen(true)}
                      className="bg-gray-800 text-white px-3 py-1 rounded text-xs lg:text-sm"
                    >
                      Slippage: {slippage}%
                    </button>
                    <SlippageModal
                      isOpen={isSlippageModalOpen}
                      onClose={() => setIsSlippageModalOpen(false)}
                      onSelectSlippage={setSlippage}
                      currentSlippage={slippage}
                    />
                  </div>

                  <div className="relative flex items-center bg-transparent border border-gray-700 rounded p-2">
                    <input
                      id="buy-input-2"
                      type="number" 
                      value={inputValue}
                      onChange={handleInputChange}
                      step="0.001"
                      className="bg-transparent w-full pr-20 outline-none text-sm lg:text-base" 
                    />
                    <div className="absolute right-2 flex items-center gap-2">
                      <span className="text-sm lg:text-base">ETH</span>
                      <Image
                        src="/images/base-logo.webp"
                        alt="ETH Logo"
                        width={24}
                        height={24}
                        className="h-5 w-5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => handlePresetAmount('0.0')} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">reset</button>
                    <button onClick={() => handlePresetAmount('0.01')} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">0.01 ETH</button>
                    <button onClick={() => handlePresetAmount('0.05')} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">0.05 ETH</button>
                    <button onClick={() => handlePresetAmount('0.1')} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">0.1 ETH</button>
                    <button onClick={() => handleMaxAmount()} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm col-span-4 cursor-pointer">MAX</button>
                  </div>

                  <p className="text-xs text-gray-400">
                    Minimum transaction: {MIN_ETH_VALUE} ETH
                  </p>
                  <button 
                    onClick={handleBuy}
                    disabled={!termsAccepted || loading || parseFloat(inputValue) < MIN_ETH_VALUE}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-white py-2 rounded text-sm lg:text-base"
                  >
                    {loading ? 'Processing...' : 'BUY'}
                  </button>

                  {parseFloat(inputValue) > 0 && (
                    <div className="text-xs text-gray-400">
                      Estimated {coinData.ticker} to receive: <span className='text-gray-300 font-medium'>{estimatedTokens} </span>{coinData.ticker}
                    </div>
                  )}

                  <FirstBuyConfirmation
                    addressConnected={addressConnected}
                    onConfirmed={setTermsAccepted} 
                  />

                  {/* Display transaction error */}
                  {transactionError && (
                    <div className="text-red-500 text-sm mt-2">
                      {transactionError}
                    </div>
                  )}
                </>
              ) : (
                // Sales Interface
                <>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => setIsSlippageModalOpen(true)}
                      className="bg-gray-800 text-white px-3 py-1 rounded text-xs lg:text-sm"
                    >
                      Slippage: {slippage}%
                    </button>
                    <SlippageModal
                      isOpen={isSlippageModalOpen}
                      onClose={() => setIsSlippageModalOpen(false)}
                      onSelectSlippage={setSlippage}
                      currentSlippage={slippage}
                    />
                  </div>

                  <div className="relative flex items-center bg-transparent border border-gray-700 rounded p-2">
                    <input
                      id="sell-input-2"
                      type="number" 
                      value={parseFloat(inputValue).toFixed(6)}
                      onChange={handleInputChange}
                      step="10000"
                      className="bg-transparent w-full pr-20 outline-none text-sm lg:text-base" 
                    />
                    <div className="absolute right-2 flex items-center gap-2">
                      <span className="text-sm lg:text-base">{coinData.ticker}</span>
                      <Image
                        src={coinData.imageUrl}
                        alt={coinData.ticker}
                        width={24}
                        height={24}
                        className="rounded-full h-5 w-5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={handleReset} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">reset</button>
                    <button onClick={() => handleAddValue(25)} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">25%</button>
                    <button onClick={() => handleAddValue(50)} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">50%</button>
                    <button onClick={() => handleAddValue(75)} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm cursor-pointer">75%</button>
                    <button onClick={() => handleAddValue(100)} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm col-span-4 cursor-pointer">100%</button>
                  </div>

                  <p className="text-xs text-gray-400">
                    Minimum transaction: {MIN_ETH_VALUE} ETH worth of tokens
                  </p>

                  <button 
                    onClick={handleSell}
                    disabled={loading || parseFloat(inputValue) <= 0 || !coinData.tokenAddress || parseFloat(estimatedEth) <= MIN_ETH_VALUE}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-white py-2 rounded text-sm lg:text-base"
                  >
                    {loading ? 'Processing...' : 'SELL'}
                  </button>

                  {parseFloat(inputValue) > 0 && (
                    <div className="text-xs text-gray-400">
                      Estimated ETH to receive: <span className='text-gray-300 font-medium'>{estimatedEth} </span>ETH
                    </div>
                  )}

                  <FirstBuyConfirmation
                    addressConnected={addressConnected}
                    onConfirmed={setTermsAccepted} 
                  />

                  {/* Display transaction error */}
                  {transactionError && (
                    <div className="text-red-500 text-sm mt-2">
                      {transactionError}
                    </div>
                  )}

                </>
              )}
            </>
          ) : (
            <BridgeProgress 
              coinData={coinData}
            />
          )}

          <TokenBalanceDisplay 
            coinData={coinData}
            addressConnected={addressConnected}
          />
          <CoinProgress 
            coinData={coinData}
            coinId={coinId}
          />
          <HolderDistribution coinData={coinData} />
        </div>
      </div>
    </div>
  )
}