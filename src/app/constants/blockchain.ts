// src/app/constants/blockchain.ts

export const NETWORK_CONSTANTS = {
  BASE_SEPOLIA: {
    CHAIN_NAME: 'Base Sepolia',
    CHAIN_ID: '0x14a34',
    NATIVE_CURRENCY: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    API_URL: 'https://api-sepolia.basescan.org/api',
    RPC_URL: 'https://base-sepolia.infura.io/v3/d591ff65da304139b275ef7b0a8df69a',
    EXPLORER_URL: 'https://sepolia.basescan.org'
  },
  BASE_MAINNET: {
    CHAIN_NAME: 'Base Mainnet',
    CHAIN_ID: '0x2105',
    NATIVE_CURRENCY: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    API_URL: 'https://api.basescan.org/api',
    RPC_URL: 'https://base-mainnet.g.alchemy.com/v2/346NIdt0gtZRIR3eKVwBQq4nWa6DCdo0',
    EXPLORER_URL: 'https://basescan.org'
  },
  OPTIMISM_SEPOLIA: {
    CHAIN_NAME: 'Optimism Sepolia',
    CHAIN_ID: '0xaa37dc',
    NATIVE_CURRENCY: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    API_URL: 'https://api-sepolia-optimistic.etherscan.io/api',
    RPC_URL: 'https://optimism-sepolia.infura.io/v3/d591ff65da304139b275ef7b0a8df69a',
    WS_URL: 'wss://optimism-sepolia.infura.io/ws/v3/d591ff65da304139b275ef7b0a8df69a',
    PUBLIC_RPC_URL: 'https://sepolia.optimism.io',
    EXPLORER_URL: 'https://sepolia-optimism.etherscan.io'
  },
  ETHEREUM_SEPOLIA: {
    CHAIN_NAME: 'Ethereum Sepolia',
    CHAIN_ID: '0xaa36a7',
    NATIVE_CURRENCY: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    API_URL: 'https://api-sepolia.etherscan.io/api',
    RPC_URL: 'https://eth-sepolia.g.alchemy.com/v2/346NIdt0gtZRIR3eKVwBQq4nWa6DCdo0',
    EXPLORER_URL: 'https://sepolia.etherscan.io'
  },
  ETHEREUM_MAINNET: {
    CHAIN_NAME: 'Ethereum Mainnet',
    CHAIN_ID: '0x1',  // 1 in hex
    NATIVE_CURRENCY: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    API_URL: 'https://api.etherscan.io/api',
    RPC_URL: 'https://mainnet.infura.io/v3/d591ff65da304139b275ef7b0a8df69a',
    EXPLORER_URL: 'https://etherscan.io'
  },
};