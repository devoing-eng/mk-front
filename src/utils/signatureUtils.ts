// src/utils/signatureUtils.ts

import type { EthereumProvider, ProviderRpcError } from '@/app/types/ethereum';

export const createSignatureMessage = (address: string) => {
  const timestamp = Date.now();
  const date = new Date(timestamp);
  return `Welcome to MemeKult!\n\nConfirm to sign in.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n${address}\n\nDate: ${date}`;
};

// Add support for different wallet types
export const requestSignature = async (
    message: string, 
    address: string, 
    walletType: 'metamask' | 'coinbase' | 'trust' | 'phantom',
  ): Promise<string> => {
    try {
        
      let provider: EthereumProvider | undefined;
      
      switch (walletType) {
        case 'metamask':
          provider = window.ethereum;
          break;
        case 'coinbase':
          provider = window.coinbaseWalletExtension;
          break;
        case 'trust':
          provider = window.trustwallet;
          break;
        case 'phantom':
          provider = window.phantom?.ethereum;
          break;
        default:
          throw new Error('Unsupported wallet type');
      }

      if (!provider) {
        throw new Error(`${walletType} wallet not installed`);
      }

      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address]
      }) as string;
  
      if (!signature) {
        throw new Error('Failed to get signature');
      }
  
      return signature;
      
    } catch (error) {
      if (error instanceof Error) {
        const providerError = error as ProviderRpcError;
        console.error('Signature request failed:', {
          code: providerError.code,
          message: providerError.message,
          data: providerError.data
        });
      }
      throw error;
    }
};