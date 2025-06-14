// src/app/auth/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function AuthPage() {
  const { addressConnected } = useAuth(); 
  const router = useRouter();
  
  useEffect(() => {
    const handleCallback = async () => {
      if (!addressConnected) {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const oauth_token = params.get('oauth_token');
      const oauth_verifier = params.get('oauth_verifier');

      if (oauth_token && oauth_verifier) {
        try {
          const response = await fetch(
            `/api/authTwitter/callback?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}&user_address=${addressConnected}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to complete Twitter authentication');
          }

          const data = await response.json();
          toast.success(`Successfully connected with Twitter as @${data.twitterUsername}`);
          
          setTimeout(() => {
            router.push(`/creator/${addressConnected}`);
          }, 1500);
        } catch (error) {
          console.error('Error during callback:', error);
          toast.error('Failed to complete Twitter authentication');
          router.push('/');
        }
      }
    };

    handleCallback();
  }, [router, addressConnected]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-400">Completing authentication...</div>
    </div>
  );
}