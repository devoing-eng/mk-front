// src/app/coin/[coinId]/components/SwapInterface.tsx

import { useTokenBalances } from '@/app/hooks/useTokenBalances';
import { NETWORK_CONSTANTS } from '@/app/constants/blockchain';
import { useClaimStatus } from '@/app/hooks/useClaimStatus';
import { ERC20_ONL1_ABI } from '@/app/constants/contracts';
import { useClaimsList } from '@/app/hooks/useClaimsList';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import LoadingSkeletonBS from './LoadingSkeletonBS';
import { useClaim } from '@/app/hooks/useClaim';
import { useWeb3 } from '@/app/hooks/useWeb3';
import SlippageModal from './SlippageModal';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { ClaimButton } from './ClaimButton';
import { CoinStaticData } from '@/app/types/coin';


export default function SwapInterface({coinData} : { coinData: CoinStaticData  }) {

  const { user, addressConnected } = useAuth();
  const coinId = coinData.id

  const {
    web3Ethereum,
    uniswapCreatorContract,
    loading,
    checkAndSwitchNetwork,
    swapBuyTokens,
    swapSellTokens,
  } = useWeb3()

  // ============ CLAIM ============

  const {
    l1Balance,
    l2Balance,
    isLoadingL1,
    isLoadingL2
  } = useTokenBalances({
    addressConnected: addressConnected,
    tokenAddressL2: coinData.tokenAddress,
    tokenAddressL1: coinData?.tokenAddressOnL1
  })

  const [txHash, setTxHash] = useState<string>('');
  const { fetchClaims, claims } = useClaimsList(user?.id);
  const { claimTokens } = useClaim();

  // First, handle user ID changes
  useEffect(() => {
    if (user?.id) {
      fetchClaims();
    }
  }, [user?.id, fetchClaims]);

  // Then, handle claims once they're loaded
  useEffect(() => {
    if (claims.length > 0 && coinId) {
      const existingClaim = claims.find(
        claim => 
          claim.coin.id === coinId && 
          claim.status === 'IN_PROGRESS'
      );
      
      if (existingClaim) {
        setTxHash(existingClaim.transactionHash);
      }
    }
  }, [claims, coinId]);

  const currentClaim = claims.find(claim => claim.transactionHash === txHash);

  // Initialize monitoring with just this claim if it exists
  const { startMonitoring, stopMonitoring } = useClaimStatus({
    claims: currentClaim ? [currentClaim] : [],
    onStatusChange: useCallback(() => {
      fetchClaims();
    }, [fetchClaims])
  });

  // Start monitoring only when we have a valid claim
  useEffect(() => {
    if (currentClaim && user?.id) {
      startMonitoring();
    }
    return () => stopMonitoring();
  }, [currentClaim?.id, user?.id, startMonitoring, stopMonitoring, currentClaim]);

  const getClaimButtonState = () => {
    // If there's a current claim in progress, show progress state
    if (currentClaim?.status === 'IN_PROGRESS') {
      return 'PROGRESSING';
    }
  
    // Get all claims for this coin
    const coinClaims = claims.filter(c => c.coin.id === coinId);
    
    // Sort by creation date, most recent first
    const sortedClaims = coinClaims.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const mostRecentClaim = sortedClaims[0];
  
    // If L2 balance exists but no L1 balance, show initial claim state
    if (l2Balance !== 0 && l1Balance === 0) {
      return 'INITIAL';
    }
  
    // If no balances and most recent claim failed, show retry state
    if (l2Balance === 0 && l1Balance === 0 && mostRecentClaim?.status === 'FAILED') {
      return 'FAILED';
    }
  
    // Don't show button in other cases
    return null;
  };
  
  const shouldShowClaim = getClaimButtonState() !== null;
  const initialButtonState = getClaimButtonState();

  // ============ SWAP ============

  const explorerUrl = NETWORK_CONSTANTS.ETHEREUM_MAINNET.EXPLORER_URL;
  
  const [inputValue, setInputValue] = useState<string>('0.003')
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useState(false)
  const [slippage, setSlippage] = useState(10) // Default 10%
  const [transactionError, setTransactionError] = useState<string | null>(null)

  const handleClaim = useCallback(async () => {

    await checkAndSwitchNetwork('BASE_MAINNET')
  
    try {
      const result = await claimTokens(coinData.tokenAddress!, coinId, true);
      
      if (result.success) {
        if (!result.transactionHash) {
          throw new Error('No transaction hash received');
        }
        
        setTxHash(result.transactionHash);

        await fetchClaims();
        
        toast.success('Claim initiated! Tracking progress...', { 
          id: 'claim-initiated', 
          duration: 3000 
        });
  
        return result;
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to claim tokens');
    }
  }, [checkAndSwitchNetwork, claimTokens, coinData.tokenAddress, coinId, fetchClaims]);

  // ============ SWAP ============

  const handlePresetAmount = async (amount: string) => {
    setInputValue(amount);
    const fakeEvent = {
      target: { value: amount }
    } as React.ChangeEvent<HTMLInputElement>;
    await handleInputChange(fakeEvent);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if(!web3Ethereum || !uniswapCreatorContract){
      console.error('web3 instance or UC contract missing on Ethereum')
      return;
    }
    
    // Allow empty input or valid decimal numbers
    if (value === '' || value === '.') {
      setInputValue('');
      // setEstimatedEth('0.0');
      // setEstimatedTokens('0.0');
      return;
    }
  
    // Validate input format
    if (/^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setInputValue(value);
      }
    }
  };

  const handleAddValue = async (percentage: number) => {
    if (!coinData?.tokenAddressOnL1 || !web3Ethereum || !addressConnected) return;
  
    try {

      // Check network before
      const isCorrectNetwork = await checkAndSwitchNetwork('ETHEREUM_MAINNET')
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Ethereum network')
      }

      const code = await web3Ethereum.eth.getCode(coinData.tokenAddressOnL1);
      if (code === '0x') {
        throw new Error('No contract at this address');
      }
  
      const tokenContract = new web3Ethereum.eth.Contract(ERC20_ONL1_ABI, coinData.tokenAddressOnL1);
      
      // Get balance
      const balance = await tokenContract.methods.balanceOf(addressConnected).call() as string;

      const balanceInTokens = web3Ethereum.utils.fromWei(balance, 'ether');

      // Calculate percentage of balance      
      const amount = percentage === 100 
      ? balanceInTokens
      : (parseFloat(balanceInTokens) * percentage / 100).toFixed(6);

      setInputValue(amount);
    } catch (err) {
      console.error('Failed to get balance:', err)
    }
  }

  const handleTabChange = (tab: 'buy' | 'sell') => {
    setActiveTab(tab)
    setInputValue(tab === 'buy' ? '0.003' : '10000');
  }

  const handleReset = () => {
    setInputValue('0.0')
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

    try {
      setTransactionError(null)
      toast.loading('Buy in progress...', { id: 'buy' });
      
      if (!coinData || !coinData.tokenAddressOnL1) {
        throw new Error('Coin data not available')
      }

      // Check network before transaction
      const isCorrectNetwork = await checkAndSwitchNetwork('ETHEREUM_MAINNET')
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Ethereum network')
      }

      const minTokens = 1;
      // const tokensToReceive = 0
      // const minTokens = (BigInt(tokensToReceive) * BigInt(Math.floor((100 - slippage - 1) * 10)) / BigInt(1000)).toString()
      // setEstimatedTokens(formatTokens(minTokens));

      // Call buyTokens with the coinId
      const result = await swapBuyTokens(
        inputValue,
        coinData.tokenAddressOnL1,
        minTokens.toString(),
      )

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
              View on EtherScan →
            </Link>
          </div>
        ),
        { id: 'buy', duration: 5000 }
      );
      
      // Reset input after successful transaction
      setInputValue('0.003')
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
      
      if (!coinData || !coinData.tokenAddressOnL1) {
        throw new Error('Token not available for trading')
      }
  
      // Check network before transaction
      const isCorrectNetwork = await checkAndSwitchNetwork('ETHEREUM_MAINNET')
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Ethereum network')
      }
  
      // Calculate minimum ETH based on slippage
      const ethToReceive = 0
      
      // Calculate minimum ETH with slippage
      const minEth = (BigInt(ethToReceive) * BigInt(Math.floor((100 - slippage - 1) * 10)) / BigInt(1000)).toString()
  
      // Call sellTokens
      const result = await swapSellTokens(
        coinData.tokenAddressOnL1,
        inputValue,
        minEth
      )

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
              View on EtherScan →
            </Link>
          </div>
        ),
        { id: 'sell', duration: 5000 }
      );
      
      // Reset input after successful transaction
      setInputValue('0.0')
    } catch (err) {
      console.error('Sell error:', err)
      toast.error('Sell error');
      toast.dismiss('sell');
    }
  }
  
  return !coinData ? (
    <LoadingSkeletonBS />
  ) : (
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
          <div className="flex w-full flex-col gap-4">
              <div className="flex justify-between mt-4">
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
                  type="number" 
                  value={inputValue}
                  onChange={handleInputChange}
                  step="0.001"
                  className="bg-transparent w-full pr-20 outline-none text-sm lg:text-base" 
                />
                  <div className="absolute right-2 flex items-center gap-2">
                  <span className="text-sm lg:text-base">ETH</span>
                  <Image
                    src="/images/ethereum.svg"
                    alt="ETH Logo"
                    width={24}
                    height={24}
                  />
                  </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button onClick={() => handlePresetAmount('0.0')} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm">reset</button>
                <button onClick={() => handlePresetAmount('0.01')} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm">0.01 ETH</button>
                <button onClick={() => handlePresetAmount('0.05')} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm">0.05 ETH</button>
                <button onClick={() => handlePresetAmount('0.1')} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm">0.1 ETH</button>
              </div>

              <button 
                onClick={handleBuy}
                disabled={loading || parseFloat(inputValue) <= 0 }
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-white py-2 rounded text-sm lg:text-base"
              >
                {loading ? 'Processing...' : 'BUY'}
              </button>

              {/* {parseFloat(inputValue) > 0 && coinData.tokenAddressOnL1 && coinData.tokenAddressOnL1 !== '' && (
                  <div className="text-xs text-gray-400 mb-4">
                  Estimated {coinData.ticker} to receive: <span className='text-gray-300 font-medium'>{estimatedTokens} {coinData.ticker}</span>
                  </div>
              )} */}

              {/* Display transaction error */}
              {transactionError && (
                <div className="text-red-500 text-sm mt-2">
                  {transactionError}
                </div>
              )}
          </div>
      ) : (
          <div className="flex w-full flex-col gap-4">
              <div className="flex justify-end mt-4">
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
                      className='rounded-full'
                      width={24}
                      height={24}
                  />
                  </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                  <button onClick={handleReset} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm">reset</button>
                  <button onClick={() => handleAddValue(25)} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm">25%</button>
                  <button onClick={() => handleAddValue(50)} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm">50%</button>
                  <button onClick={() => handleAddValue(75)} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm">75%</button>
                  <button onClick={() => handleAddValue(100)} className="bg-gray-800 px-2 py-1 rounded text-xs lg:text-sm col-span-4">100%</button>
              </div>

              <button 
                onClick={handleSell}
                disabled={loading || parseFloat(inputValue) <= 0 || !coinData.tokenAddressOnL1}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold text-white py-2 rounded text-sm lg:text-base"
              >
                {loading ? 'Processing...' : 'SELL'}
              </button>

              {/* Display transaction error */}
              {transactionError && (
                  <div className="text-red-500 text-sm mt-2">
                  {transactionError}
                  </div>
              )}

          </div>
      )}

      {isLoadingL1 || isLoadingL2 ? (
        <div className="flex flex-col gap-4 animate-pulse mt-4">
          <div className="flex-1 h-10 bg-gray-700 rounded"></div>
        </div>
      ) : (
        shouldShowClaim && (
          <ClaimButton
            addressConnected={addressConnected!}
            onClaim={handleClaim}
            isVisible={shouldShowClaim}
            transactionHash={txHash}
            status={currentClaim?.status || 'INITIAL'}
            onStatusChange={() => fetchClaims()} 
            initialState={initialButtonState}
          />
        )
      )}
    </>
  )
}