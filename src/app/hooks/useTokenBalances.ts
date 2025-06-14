// src/app/hooks/useTokenBalances.ts

import { ERC20_ONL1_ABI, ERC20_ONL2_ABI } from '../constants/contracts'
import { useState, useEffect, useCallback } from 'react'
import type Web3 from 'web3'
import { useWeb3 } from './useWeb3'

interface UseTokenBalancesProps {
  addressConnected: string | null
  tokenAddressL2: string | null | undefined
  tokenAddressL1: string | null | undefined
}

interface TokenBalances {
  l1Balance: number
  l2Balance: number
  isLoadingL1: boolean
  isLoadingL2: boolean
  refetch: () => Promise<void>;
}

export const useTokenBalances = ({
  addressConnected,
  tokenAddressL2,
  tokenAddressL1
}: UseTokenBalancesProps): TokenBalances => {
  const [l1Balance, setL1Balance] = useState<number>(0)
  const [l2Balance, setL2Balance] = useState<number>(0)
  const [isLoadingL1, setIsLoadingL1] = useState<boolean>(false)
  const [isLoadingL2, setIsLoadingL2] = useState<boolean>(false)

  const {
    web3Base,
    web3Ethereum,
    checkAndSwitchNetwork,
  } = useWeb3()

  const fetchTokenBalance = useCallback(
    async (
      web3Instance: Web3,
      tokenAddress: string | null| undefined,
      network: 'BASE_MAINNET' | 'ETHEREUM_MAINNET',
    ): Promise<number> => {

    if (!tokenAddress) return 0;

    await checkAndSwitchNetwork(network)

    const abi = (network === 'BASE_MAINNET') ? ERC20_ONL2_ABI : ERC20_ONL1_ABI;

    const tokenContract = new web3Instance.eth.Contract(abi, tokenAddress)
    const balance = await tokenContract.methods.balanceOf(addressConnected).call() as string
    const decimals = await tokenContract.methods.decimals().call() as string
    return Number(balance) / Math.pow(10, Number(decimals))
  },[addressConnected, checkAndSwitchNetwork])

  useEffect(() => {
    const fetchL2Balance = async () => {
      if (!web3Base || !addressConnected) return
      setIsLoadingL2(true)
      
      try {
        const balanceInTokensL2 = await fetchTokenBalance(
          web3Base,
          tokenAddressL2,
          'BASE_MAINNET'
        )
        setL2Balance(balanceInTokensL2)
      } catch (error) {
        console.error('Error fetching L2 balance:', error)
        setL2Balance(0)
      } finally {
        setIsLoadingL2(false)
      }
    }

    const fetchL1Balance = async () => {
      if (!web3Ethereum || !addressConnected || !tokenAddressL1) return
      setIsLoadingL1(true)

      try {
        const balanceInTokensL1 = await fetchTokenBalance(
          web3Ethereum,
          tokenAddressL1,
          'ETHEREUM_MAINNET',
        )
        setL1Balance(balanceInTokensL1)
      } catch (error) {
        console.error('Error fetching L1 balance:', error)
        setL1Balance(0)
      } finally {
        setIsLoadingL1(false)
      }
    }

    const fetchAllBalances = async () => {
      await fetchL2Balance()
      await fetchL1Balance()
    }

    fetchAllBalances()
  }, [
    web3Base,
    web3Ethereum,
    addressConnected,
    tokenAddressL2,
    tokenAddressL1,
    checkAndSwitchNetwork,
    fetchTokenBalance
  ])

  const refetch = useCallback(async () => {
    if (!web3Base || !web3Ethereum || !addressConnected) return;
    
    setIsLoadingL2(true);
    setIsLoadingL1(true);
    
    try {
      const balanceL2 = await fetchTokenBalance(
        web3Base,
        tokenAddressL2,
        'BASE_MAINNET'
      );
      setL2Balance(balanceL2);
      
      if (tokenAddressL1) {
        const balanceL1 = await fetchTokenBalance(
          web3Ethereum,
          tokenAddressL1,
          'ETHEREUM_MAINNET'
        );
        setL1Balance(balanceL1);
      }
    } catch (error) {
      console.error('Error refetching balances:', error);
    } finally {
      setIsLoadingL2(false);
      setIsLoadingL1(false);
    }
  }, [web3Base, web3Ethereum, addressConnected, tokenAddressL2, tokenAddressL1, fetchTokenBalance]);


  return {
    l1Balance,
    l2Balance,
    isLoadingL1,
    isLoadingL2,
    refetch
  }
}
