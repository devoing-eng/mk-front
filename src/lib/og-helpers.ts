// src/lib/og-helpers.ts

import { OGImageParams } from "@/app/types/openGraphType";
import { config } from "@/config/environment";

export function generateOGImageUrl(params: OGImageParams): string {
  const baseUrl = config.frontend.baseUrl || 'https://www.memekult.com';
  const searchParams = new URLSearchParams();
  
  searchParams.set('type', params.type);
  
  switch (params.type) {
    case 'coin':
      if (params.coinId) searchParams.set('coinId', params.coinId);
      break;
    case 'creator':
      if (params.userAddress) searchParams.set('userAddress', params.userAddress);
      break;
  }
  
  return `${baseUrl}/api/og?${searchParams.toString()}`;
}