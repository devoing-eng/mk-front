// src/app/providers/Providers.tsx

'use client'

import { ReactQueryProvider } from './ReactQueryProvider'
import { AuthProvider } from "../contexts/AuthContext";
import { AuthKitProvider } from '@farcaster/auth-kit';

export function Providers({ children }: { children: React.ReactNode }) {
  const domain = typeof window !== 'undefined' ? window.location.host : '';

  return (
    <AuthKitProvider
      config={{
        domain: domain,
        rpcUrl: 'https://mainnet.optimism.io',
      }}
    >
      <AuthProvider>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </AuthProvider>
    </AuthKitProvider>
  )
}