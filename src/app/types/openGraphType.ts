// src/app/types/openGraphType.ts

export type OGImageParams = {
  type: 'coin' | 'creator' | 'default';
  // Coin specific params
  coinId?: string;
  name?: string;
  ticker?: string;
  description?: string;
  creatorAddress?: string;
  creatorUsername?: string;
  tokenAddress?: string;
  image?: string;
  hasAudio?: boolean;
  // Creator specific params
  username?: string;
  userAddress?: string;
};