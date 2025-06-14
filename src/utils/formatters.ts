// src/utils/formatters.ts

import { ethers } from "ethers";
import axios from "axios";

export async function getEthPriceInUSD(): Promise<number> {
  try {
    const response = await axios.get('/api/eth-price');
    return response.data.ethereum.usd;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    throw new Error('Failed to fetch ETH price');
  }
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

export const formatEthLiquidity = (vEthReserve: string, initialVETH: number): string => {
  const currentEth = parseFloat(ethers.formatEther(vEthReserve));
  const liquidityEth = currentEth - initialVETH;

  if (liquidityEth===0) {
    return liquidityEth.toFixed(2);
  }
  
  return liquidityEth.toFixed(5);
};

export const formatTokens = (value: string): string => {
  const number = parseFloat(ethers.formatEther(value));
  return number.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    useGrouping: true
  }).replace(/,/g, ' ');
};

export const formatTokensWithoutEther = (value: number): string => {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    useGrouping: true
  }).replace(/,/g, ' ');
};