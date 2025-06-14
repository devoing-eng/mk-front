// types/ethereum.ts
interface EthereumRequest {
  method: string;
  params?: unknown[] | MetamaskWatchAssetParams;
}

export interface MetamaskWatchAssetParams {
  type: 'ERC20';
  options: {
    address: string;
    symbol: string;
    decimals: number;
    image: string;
  };
}

export interface EthereumProvider {
  request: (args: EthereumRequest) => Promise<unknown>;
  on: (eventName: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (eventName: string, callback: (...args: unknown[]) => void) => void;
  isPhantom?: boolean;
  isMetaMask?: boolean;
}

export interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

export interface WalletOption {
  name: string;
  logo: string;
  onClick: () => Promise<void> | void;
}