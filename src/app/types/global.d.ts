// src/app/types/global.d.ts

import { EthereumProvider } from './ethereum';

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    web3?: EthereumProvider;
    coinbaseWalletExtension?: EthereumProvider;
    trustwallet?: EthereumProvider;
    phantom?: {
      ethereum: EthereumProvider;
    };
  }
}