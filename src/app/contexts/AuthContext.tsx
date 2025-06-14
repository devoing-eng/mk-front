//src/app/contexts/AuthContext.tsx

"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { createSignatureMessage, requestSignature } from '@/utils/signatureUtils';
import { User } from '@/app/types/user';


interface AuthContextType {
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
  addressConnected: string | null;
  setAddress: (address: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  authenticateWithSignature: (address: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isConnected: false,
  setIsConnected: () => {},
  addressConnected: null,
  setAddress: () => {},
  user: null,
  setUser: () => {},
  token: null,
  setToken: () => {},
  authenticateWithSignature: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [addressConnected, setAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const authenticateWithSignature = useCallback(async (address: string) =>  {
    try {
      // Get the stored wallet type
      const walletType = localStorage.getItem('walletType') as 'metamask' | 'coinbase' | 'trust' | 'phantom';

      // Create message
      const message = createSignatureMessage(address);
      
      // Request signature from wallet
      const signature = await requestSignature(message, address, walletType);

      // Send to backend
      const response = await fetch('/api/users/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, message }),
      });

      if (response.ok) {
        const { data } = await response.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      setToken(null);
      localStorage.removeItem('authToken');
    }
  }, [setToken, setUser]);


  // Add token to auth state
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Fetch user data when address changes
  useEffect(() => {
    const fetchUser = async () => {
      if (addressConnected) {
        try {
          const response = await fetch(`/api/users/address/${addressConnected}`);
          if (response.ok) {
            const { data } = await response.json();
            setUser(data);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      } else {
        setUser(null);
      }
    };

    fetchUser();
  }, [addressConnected]);
  
  useEffect(() => {
    if (addressConnected && !token) {
      authenticateWithSignature(addressConnected);
    }
  }, [addressConnected, token, authenticateWithSignature]);

  return (
    <AuthContext.Provider 
      value={{ 
        isConnected, 
        setIsConnected, 
        addressConnected, 
        setAddress,
        user,
        setUser,
        token, 
        setToken,
        authenticateWithSignature,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};