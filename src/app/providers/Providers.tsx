// src/app/providers/Providers.tsx

'use client'

import { ReactQueryProvider } from './ReactQueryProvider'
import { AuthProvider } from "../contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {

  return (
      <AuthProvider>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </AuthProvider>
  )
}