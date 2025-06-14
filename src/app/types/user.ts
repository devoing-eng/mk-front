// src/app/types/user.ts

export interface UserProfileData {
  success: boolean,
  data: {
    id: string,
    address: string,
    username: string,
    image: string,
    bio: string,
  },
}

export interface UserTransaction {
  id: string;
  tokenAddress: string;
  blockNumber: number;
  userAddress: string;
  type: 'BUY' | 'SELL';
  ethAmount: string;
  tokenAmount: string;
  transactionHash: string;
  timestamp: Date;
  coin: {
    id: string;
    name: string;
    ticker: string;
    imageUrl: string;
    creator: {
      username: string;
    };
  };
}

export interface UserTransactionsResponse {
  success: boolean;
  data: UserTransaction[];
}

export interface User {
  id: string;
  address: string;
  username: string;
  image?: string | null;
  bio?: string | null;
}