// src/app/hooks/useWeb3.ts

import type { EthereumProvider, ProviderRpcError } from '@/app/types/ethereum'
import type { UseWeb3Return, TransactionResult } from '@/app/types/web3'
import { useAuth } from '@/app/contexts/AuthContext'
import Web3, { Contract, ContractAbi } from 'web3'
import { ApiClient } from '@/utils/apiClient'
import { useState, useEffect, useCallback } from 'react'
import {
  BONDING_CURVE_ABI,
  BONDING_CURVE_ADDRESS,
  ERC20_ONL1_ABI,
  ERC20_ONL2_ABI,
  MK_SWAP_MANAGER_ABI,
  SWAP_MANAGER_ADDRESS,
  UNISWAP_CREATOR_ABI,
  UNISWAP_CREATOR_ADDRESS
} from '../constants/contracts'
import { NETWORK_CONSTANTS } from '../constants/blockchain'

export function useWeb3(): UseWeb3Return {
  const { isConnected, addressConnected } = useAuth()
  const [web3Base, setWeb3Base] = useState<Web3 | null>(null)
  const [web3Ethereum, setWeb3Ethereum] = useState<Web3 | null>(null)
  const [bondingCurveContract, setBondingCurveContract] = useState<Contract<ContractAbi> | null>(null)
  const [swapManagerContract, setSwapManagerContract] = useState<Contract<ContractAbi> | null>(null)
  const [uniswapCreatorContract, setUniswapCreatorContract] = useState<Contract<ContractAbi> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const checkAndSwitchNetwork= useCallback(async (targetNetwork: keyof typeof NETWORK_CONSTANTS) => {
    if (!window.ethereum) return false
  
    try {
      // Check current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      const targetChainId = NETWORK_CONSTANTS[targetNetwork].CHAIN_ID
  
      if (chainId !== targetChainId) {
        try {
          // First try to switch to the network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          })
        } catch (error) {
          if (
            error instanceof Error && 
            'code' in error && 
            (error as ProviderRpcError).code === 4902
          ) {
            // If network is not added to wallet, prompt to add it
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: NETWORK_CONSTANTS[targetNetwork].CHAIN_ID,
                chainName: NETWORK_CONSTANTS[targetNetwork].CHAIN_NAME,
                nativeCurrency: NETWORK_CONSTANTS[targetNetwork].NATIVE_CURRENCY,
                rpcUrls: [NETWORK_CONSTANTS[targetNetwork].RPC_URL],
                blockExplorerUrls: [NETWORK_CONSTANTS[targetNetwork].EXPLORER_URL]
              }]
            })
          } else {
            throw error
          }
        }
      }
      return true
  
    } catch (error) {
      console.error(`Failed to switch to ${NETWORK_CONSTANTS[targetNetwork].CHAIN_NAME}:`, error)
      return false
    }
  }, [])

  // Initialize Web3 instance when wallet is connected
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        if (window.ethereum && isConnected) {
          // Both instances use the injected provider
          const web3BaseInstance = new Web3(window.ethereum as EthereumProvider)
          const web3EthereumInstance = new Web3(window.ethereum as EthereumProvider)
          
          setWeb3Base(web3BaseInstance)
          setWeb3Ethereum(web3EthereumInstance)

          if (!BONDING_CURVE_ADDRESS || !SWAP_MANAGER_ADDRESS || !UNISWAP_CREATOR_ADDRESS) {
            throw new Error('Contract addresses  not configured')
          }

          const bondingCurveContractInstance = new web3BaseInstance.eth.Contract(
            BONDING_CURVE_ABI,
            BONDING_CURVE_ADDRESS
          )
          const swapManagerContractInstance = new web3EthereumInstance.eth.Contract(
            MK_SWAP_MANAGER_ABI,
            SWAP_MANAGER_ADDRESS
          )
          const uniswapCreatorContract = new web3EthereumInstance.eth.Contract(
            UNISWAP_CREATOR_ABI,
            UNISWAP_CREATOR_ADDRESS
          );
          setBondingCurveContract(bondingCurveContractInstance)
          setSwapManagerContract(swapManagerContractInstance)
          setUniswapCreatorContract(uniswapCreatorContract)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize Web3 instance'))
      }
    }

    initializeWeb3()
  }, [isConnected])

  // Calculate tokens to receive for a given ETH amount
  const calculateTokensToReceive = async (ethAmount: number, tokenAddress: string): Promise<string> => {
    if (!bondingCurveContract || !web3Base) throw new Error('Web3 not initialized')
    if (!tokenAddress) throw new Error('Token address required for calculation')

    try {
      const weiAmount = web3Base.utils.toWei(ethAmount.toString(), 'ether')
      
      const tokensToReceive = await bondingCurveContract.methods
      .calculateTokensToReceive(tokenAddress, weiAmount)
      .call() as string 
      
      return tokensToReceive
    } catch (error: unknown) {
      console.error('Calculate tokens error:', error)
      throw new Error('Failed to calculate tokens to receive')
    }
  }

  // Calculate ETH to receive for a given token amount
  const calculateEthToReceive = async (tokenAmount: number, tokenAddress: string): Promise<string> => {
    if (!bondingCurveContract || !web3Base) throw new Error('Web3 not initialized')
    if (!tokenAddress) throw new Error('Token address required for calculation')

    try {
      const tokenAmountWithDecimals = web3Base.utils.toBigInt(tokenAmount * 1e18).toString() // Multiply by 1e18 as per contract
      
      const ethToReceive = await bondingCurveContract.methods
        .calculateEthToReceive(tokenAddress, tokenAmountWithDecimals)
        .call() as string
      
      return ethToReceive
    } catch (error: unknown) {
      console.error('Calculate ETH error:', error)
      throw new Error('Failed to calculate ETH to receive')
    }
  }

  const createNBuy = async (
    ethAmount: string,
    coinName: string,
    coinTicker: string,
    coinCreatorAddress: string
  ): Promise<TransactionResult> => {

    if (!bondingCurveContract || !web3Base || !addressConnected) throw new Error('Web3 not initialized or wallet not connected')
    
    try {
      setLoading(true)

      // Check network before transaction
      const isCorrectNetwork = await checkAndSwitchNetwork('BASE_MAINNET')
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Base network')
      }

      const weiAmount = web3Base.utils.toWei(ethAmount, 'ether')

      const gasPrice = await web3Base.eth.getGasPrice()

      const tx = await bondingCurveContract.methods
      .createNBuy(
        coinName, 
        coinTicker,
        coinCreatorAddress,
        0,
        0
      )
      .send({
        from: addressConnected,
        value: weiAmount,
        gasPrice: gasPrice.toString(),
      })

      // Extract the new token address from events
      const createdTokenEvent = tx.events?.CoinCreated;

      if (!createdTokenEvent) {
        throw new Error('Token creation event not found in transaction');
      }

      const newTokenAddress = createdTokenEvent.returnValues.token as string;

      return {
        tokenAddress: newTokenAddress,
        success: true,
        transactionHash: tx.transactionHash
      };

    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('insufficient funds')) {
            throw new Error('Insufficient ETH balance')
        } else if (error.message.includes('user rejected')) {
            throw new Error('Transaction rejected by user')
        }
      }
      throw new Error('Transaction failed')
    } finally {
      setLoading(false)
    }
  };

  const buyTokens = async (
    ethAmount: string,
    minTokens: string,
    coinId: string,
    tokenAddress?: string
  ): Promise<TransactionResult> => {
    if (!bondingCurveContract || !web3Base || !addressConnected) throw new Error('Web3 not initialized or wallet not connected')
    
    try {
      setLoading(true)

      // Check network before transaction
      const isCorrectNetwork = await checkAndSwitchNetwork('BASE_MAINNET')
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Base network')
      }

      const gasPrice = await web3Base.eth.getGasPrice()

      const weiAmount = web3Base.utils.toWei(ethAmount, 'ether')

      const hookNumber = 0 // Set to 0 for now

      if (!tokenAddress) {
        // First buy - need to create the token
        const coinDetails = await ApiClient.getCoin(coinId)
        const tx = await bondingCurveContract.methods
        .createNBuy(
          coinDetails.name, 
          coinDetails.ticker,
          coinDetails.creatorAddress,
          minTokens,
          hookNumber
        )
        .send({
          from: addressConnected,
          value: weiAmount,
          gasPrice: gasPrice.toString(),
        })

        // Extract the new token address from events
        const createdTokenEvent = tx.events?.CoinCreated;

        if (!createdTokenEvent) {
          throw new Error('Token creation event not found in transaction');
        }

        const newTokenAddress = createdTokenEvent.returnValues.token as string;

        return {
          tokenAddress: newTokenAddress,
          success: true,
          transactionHash: tx.transactionHash
        };

      } else {
        // Regular buy
        const tx = await bondingCurveContract.methods
        .buyCoin(tokenAddress, minTokens)
        .send({
          from: addressConnected,
          value: weiAmount,
          gasPrice: gasPrice.toString(),
        })

        return {
          success: true,
          transactionHash: tx.transactionHash
        };

      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('insufficient funds')) {
            throw new Error('Insufficient ETH balance')
        } else if (error.message.includes('user rejected')) {
            throw new Error('Transaction rejected by user')
        }
      }
      throw new Error('Transaction failed')
    } finally {
      setLoading(false)
    }
  };

  const sellTokens = async (
    tokenAddress: string,
    tokenAmount: string,
    minEth: string,
  ): Promise<TransactionResult> => {
    if (!bondingCurveContract || !web3Base || !addressConnected) throw new Error('Web3 not initialized or wallet not connected')
    
    try {
      setLoading(true)
  
      // Check network before transaction
      const isCorrectNetwork = await checkAndSwitchNetwork('BASE_MAINNET')
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Base network')
      }
  
      // Create ERC20 contract instance with correct ABI
      const tokenContract = new web3Base.eth.Contract(
        ERC20_ONL2_ABI,
        tokenAddress
      )
      
      const gasPrice = await web3Base.eth.getGasPrice()

      // Convert token amount to wei
      const tokenAmountWei = web3Base.utils.toWei(tokenAmount, 'ether')
  
      // Check token balance before proceeding
      const balance = await tokenContract.methods.balanceOf(addressConnected).call() as string;
      
      if (BigInt(balance) < BigInt(tokenAmountWei)) {
        throw new Error('Insufficient token balance')
      }
  
      // Sell the tokens
      const tx = await bondingCurveContract.methods
        .sellCoin(tokenAddress, tokenAmountWei, minEth)
        .send({ 
          from: addressConnected,
          gasPrice: gasPrice.toString(),
        })

      return {
        success: true,
        transactionHash: tx.transactionHash
      };
  
    } catch (error: unknown) {
      console.error('Detailed sell error:', error)
      if (error instanceof Error) {
        if (error.message.includes('insufficient balance')) {
          throw new Error('Insufficient token balance')
        } else if (error.message.includes('user rejected')) {
          throw new Error('Transaction rejected by user')
        } else if (error.message.includes('execution reverted')) {
          const revertReason = error.message.match(/execution reverted: (.*?)"/)?.[1] || 'Transaction reverted'
          throw new Error(`Transaction failed: ${revertReason}`)
        }
      }
      throw new Error('Transaction failed. Please check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const swapBuyTokens = async (
    ethAmount: string,
    tokenAddressOnL1: string,
    minTokens: string,
  ): Promise<TransactionResult> => {
    if (!swapManagerContract || !web3Ethereum || !addressConnected) throw new Error('Web3 not initialized or wallet not connected')
    
    try {
      setLoading(true)

      // Check network before transaction
      const isCorrectNetwork = await checkAndSwitchNetwork('ETHEREUM_MAINNET')
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Ethereum network')
      }

      const weiAmount = web3Ethereum.utils.toWei(ethAmount, 'ether')

      const hookNumber = 0 // Set to 0 for now

      const gasPrice = await web3Ethereum.eth.getGasPrice()
      const gasPriceUpgraded = (gasPrice * BigInt(110)) / BigInt(100);

      const tx = await swapManagerContract.methods
      .swapBuy(
        tokenAddressOnL1,
        hookNumber,
        minTokens,
        addressConnected
      )
      .send({
        from: addressConnected,
        value: weiAmount,
        gasPrice: gasPriceUpgraded.toString(),
      })

      return {
        success: true,
        transactionHash: tx.transactionHash
      };

    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('insufficient funds')) {
            throw new Error('Insufficient ETH balance')
        } else if (error.message.includes('user rejected')) {
            throw new Error('Transaction rejected by user')
        }
      }
      throw new Error('Transaction failed')
    } finally {
      setLoading(false)
    }
  };

  const checkTokenAllowance = async (
    tokenContract: Contract<ContractAbi> ,
    ownerAddress: string,
    spenderAddress: string
  ): Promise<boolean> => {
    const allowance = await tokenContract.methods.allowance(ownerAddress, spenderAddress).call() as string;
    return BigInt(allowance) > BigInt(0);
  };

  const signPermit = async (
    tokenContract: Contract<ContractAbi>,
    tokenAddressOnL1: string,
    ownerAddress: string,
    spenderAddress: string,
    web3: Web3
  ) => {
    // Get token details
    const name = await tokenContract.methods.name().call();
    const nonce = await tokenContract.methods.nonces(ownerAddress).call() as string;
    const deadline = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now
    
    // Maximum uint256 value for infinite approval
    const maxUint256 = (BigInt(2) ** BigInt(256) - BigInt(1)).toString();
    // Get chain id
    const chainId = await web3.eth.getChainId();
  
    // Create the data to sign
    const data = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' }
        ],
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      },
      primaryType: 'Permit',
      domain: {
        name: name,
        version: '1',
        chainId: chainId.toString(),
        verifyingContract: tokenAddressOnL1
      },
      message: {
        owner: ownerAddress,
        spender: spenderAddress,
        value: maxUint256,
        nonce: nonce.toString(),
        deadline: deadline
      },
    };

    const provider = web3.provider;
    
    if (!provider) {
      throw new Error('No provider available');
    }

    // Sign using eth_signTypedData_v4
    const signature = await provider.request({
      method: 'eth_signTypedData_v4',
      params: [ownerAddress, JSON.stringify(data)],
    });
  
    // Split signature
    const signatureString = signature as unknown as string;
    const r = signatureString.slice(0, 66);
    const s = '0x' + signatureString.slice(66, 130);
    const v = parseInt(signatureString.slice(130, 132), 16);
  
    return {
      owner: ownerAddress,
      spender: spenderAddress,
      value: maxUint256,
      deadline: deadline,
      v,
      r,
      s
    };
  };

  const swapSellTokens = async (
    tokenAddressOnL1: string,
    tokenAmount: string,
    minEth: string,
  ): Promise<TransactionResult> => {
    if (!swapManagerContract || !web3Ethereum || !addressConnected) throw new Error('Web3 not initialized or wallet not connected')
    try {
      setLoading(true)
  
      // Check network before transaction
      const isCorrectNetwork = await checkAndSwitchNetwork('ETHEREUM_MAINNET')
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Ethereum network')
      }
  
      // Create ERC20 contract instance with correct ABI
      const tokenContract = new web3Ethereum.eth.Contract(
        ERC20_ONL1_ABI,
        tokenAddressOnL1
      )

      // Check if SwapManager is already approved
      const isApproved = await checkTokenAllowance(
        tokenContract,
        addressConnected,
        SWAP_MANAGER_ADDRESS
      );
      
      // Convert token amount to wei
      const tokenAmountWei = web3Ethereum.utils.toWei(tokenAmount, 'ether')

      // If not approved, get permit signature
      if (!isApproved) {
        const permitData = await signPermit(
          tokenContract,
          tokenAddressOnL1,
          addressConnected,
          SWAP_MANAGER_ADDRESS,
          web3Ethereum
        );

        const gasPrice = await web3Ethereum.eth.getGasPrice()
        const gasPriceUpgraded = (gasPrice * BigInt(110)) / BigInt(100);

        // Call swapSellWithPermit
        const tx = await swapManagerContract.methods
        .swapSellWithPermit(
          tokenAddressOnL1,
          0,
          tokenAmountWei,
          minEth,
          addressConnected,
          permitData.deadline,
          permitData.v,
          permitData.r,
          permitData.s
        )
        .send({
          from: addressConnected,
          gasPrice: gasPriceUpgraded.toString(),
        });

        return {
          success: true,
          transactionHash: tx.transactionHash
        };
      }
  
      // Check token balance before proceeding
      const balance = await tokenContract.methods.balanceOf(addressConnected).call() as string;
      
      if (BigInt(balance) < BigInt(tokenAmountWei)) {
        throw new Error('Insufficient token balance')
      }

      const hookNumber = 0 // Set to 0 for now

      const gasPrice = await web3Ethereum.eth.getGasPrice()
      const gasPriceUpgraded = (gasPrice * BigInt(110)) / BigInt(100);
  
      // Sell the tokens
      const tx = await swapManagerContract.methods
        .swapSell(
          tokenAddressOnL1,
          hookNumber,
          tokenAmountWei,
          minEth,
          addressConnected
        )
        .send({ 
          from: addressConnected,
          gasPrice: gasPriceUpgraded.toString(),
        })

      return {
        success: true,
        transactionHash: tx.transactionHash
      };
  
    } catch (error: unknown) {
      console.error('Detailed sell error:', error)
      if (error instanceof Error) {
        if (error.message.includes('insufficient balance')) {
          throw new Error('Insufficient token balance')
        } else if (error.message.includes('user rejected')) {
          throw new Error('Transaction rejected by user')
        } else if (error.message.includes('execution reverted')) {
          const revertReason = error.message.match(/execution reverted: (.*?)"/)?.[1] || 'Transaction reverted'
          throw new Error(`Transaction failed: ${revertReason}`)
        }
      }
      throw new Error('Transaction failed. Please check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return {
    web3Base,
    web3Ethereum,
    bondingCurveContract,
    uniswapCreatorContract,
    loading,
    error,
    createNBuy,
    buyTokens,
    sellTokens,
    swapBuyTokens,
    swapSellTokens,
    calculateTokensToReceive,
    calculateEthToReceive,
    checkAndSwitchNetwork 
  }
}