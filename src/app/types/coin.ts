// src/app/types/coin.ts

export interface CoinMetrics {
  liveMarketCap: number;
  maxMarketCap: number;
  progress: number;
  isLoading: boolean;
  ethPrice: number;
  error: string | null;
  
  reserves?: {
    vEthReserve: string;
    vTokenReserve: string;
  };
}
  
export interface CoinStaticData {
  // Database static data
  id: string;
  name: string;
  ticker: string;
  description: string | null;
  imageUrl: string;
  audioUrl: string | undefined;
  tokenAddress: string | null;
  tokenAddressOnL1: string | null;
  isPremium?: boolean;
  twitterLink: string | null;
  telegramLink: string | null;
  website: string | null;
  createdAt: string;
  // References to the creator
  creatorId: string;    
  creatorAddress: string; 
}

export interface CoinDynamicReserves {
    vEthReserve: string;
    vTokenReserve: string;
}

export interface HolderInfo {
    address: string;
    balance: string;
    percentage: string;
}

export interface TransactionData {
    account: string;    // msgSender
    type: 'BUY' | 'SELL';
    eth: string;        // ethPaid or ethReceived in ETH (not Wei)
    tokens: string;     // tokensBought or tokensSold
    date: string;       // ISO string
    hash: string;       // transaction hash
}

export interface Purchase {
    buyer: {
      address: string;
      profileImage: string;
      username: string;
    };
    amount: {
      usd: string;
    };
    coin: {
      ticker: string;
      id: string;
    };
}

interface CoinFee {
    id: string;
    name: string;
    ticker: string;
    tokenAddress: string;
    imageUrl: string;
    feesETH: string;
    feesUSD: string;
    change24h: number;
    stage: string;
    creationTime: string;
}
  
export interface FeesData {
    totalFeesETH: string;
    totalFeesUSD: string;
    totalAvailableFeesETH: string,
    totalAvailableFeesUSD: string,
    coins: CoinFee[];
}

export interface PremiumCoin {
    id: string;
    name: string;
    tokenAddress: string;
    ticker: string;
    imageUrl: string;
    isPremium: boolean;
    premiumUntil: string;
    affiliateCodeId?: string;
    affiliateCode?: {
        code: string;
    };
}
  
export interface PremiumData {
    [id: string]: {
        isPremium: boolean;
        premiumUntil: string;
    }
}

export interface ClaimableCoin {
    id: string;
    coinId: string;
    name: string;
    ticker: string;
    imageUrl: string;
    tokenAddress: string;
}

export interface TrendingToken {
  volume: number;
  coinId: string;
  tokenAddress: string;
}

export type ChartType = 'bcurve' | 'current';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface EnrichedCoin {
  // Static coin data
  id: string;
  name: string;
  ticker: string;
  description: string | null;
  imageUrl: string;
  audioUrl: string | null;
  tokenAddress: string | null;
  tokenAddressOnL1: string | null;
  isPremium: boolean;
  twitterLink: string | null;
  telegramLink: string | null;
  website: string | null;
  createdAt: string;
  creatorAddress: string;
  
  // Creator data
  creator: {
    id: string;
    address: string;
    username: string | null;
    image: string | null;
    bio: string | null;
  } | null;
  
  // Reserves data
  reserves: {
    vEthReserve: string;
    vTokenReserve: string;
  };
  
  // Calculated data
  progress: number;
  liveMarketCap: number;
  maxMarketCap: number;
  
  // Trending data
  trendingVolume: number;
  isTrending: boolean;
  
  // Premium data
  isPremiumActive: boolean;
}

export interface PaginatedCoinsResponse {
  coins: EnrichedCoin[];
  pagination: PaginationInfo;
  filter: string;
}