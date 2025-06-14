// src/app/types/web3.ts
import { NETWORK_CONSTANTS } from '../constants/blockchain';
import type { Web3, Contract, ContractAbi} from 'web3'

export interface TransactionResult {
    tokenAddress?: string;
    success: boolean;
    transactionHash?: string;
}

export interface UseWeb3Return {
    web3Base: Web3 | null
    web3Ethereum: Web3 | null
    bondingCurveContract: Contract<ContractAbi> | null
    uniswapCreatorContract:  Contract<ContractAbi> | null
    loading: boolean
    error: Error | null
    createNBuy: (ethAmount: string, coinName: string, coinTicker: string, coinCreatorAddress: string) => Promise<TransactionResult>
    buyTokens: (ethAmount: string, minTokens: string, coinId: string, tokenAddress: string) => Promise<TransactionResult>
    sellTokens: (tokenAddress: string, tokenAmount: string, minEth: string) => Promise<TransactionResult>
    swapBuyTokens: (ethAmount: string, tokenAddressOnL1: string, minTokens: string) => Promise<TransactionResult>
    swapSellTokens: (tokenAddressOnL1: string, tokenAmount: string, minEth: string) => Promise<TransactionResult>
    calculateTokensToReceive: (ethAmount: number, tokenAddress: string) => Promise<string>
    calculateEthToReceive: (tokenAmount: number, tokenAddress: string) => Promise<string>
    checkAndSwitchNetwork: (targetNetwork: keyof typeof NETWORK_CONSTANTS) => Promise<boolean>
}