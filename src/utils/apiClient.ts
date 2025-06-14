// src/utils/apiClient.ts

import { CoinStaticData } from '@/app/types/coin';
import { config } from '@/config/environment';

export class ApiClient {
  private static async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${config.api.baseUrl}/api${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Coin not found or token not deployed' && 
            (endpoint.includes('/all-data') || endpoint.includes('/info'))) {
          return {
            success: true,
            data: null
          } as T;
        }

        console.error('API request failed:', {
          url,
          status: response.status,
          statusText: response.statusText,
          error: data.error
        });
        
        throw new Error(data.error || `API call failed: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      // Only log and throw if it's not an expected "no token" case
      if (error instanceof Error && 
          !error.message.includes('Coin not found or token not deployed')) {
        console.error('API request error:', {
          url,
          error
        });
        throw error;
      }
      throw error;
    }
  }

  static async getCoin(coinId: string, options?: RequestInit) {
    return this.fetch<CoinStaticData>(`/coins/${coinId}/static`, options);
  }

  static async getUserDetails(address: string) {
    return this.fetch<{
      success: boolean;
      data: {
        id: string;
        address: string;
        username: string;
        bio: string;
        image: string;
      };
    }>(`/users/address/${address}`);
  }
}