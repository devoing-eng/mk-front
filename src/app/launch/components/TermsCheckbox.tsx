// src/app/launch/components/TermsCheckbox.tsx

import { launchTermsApi } from '@/app/services/launchTermsApi';
import { useState, useEffect, ChangeEvent } from 'react';
import { FaCheck } from 'react-icons/fa6';
import Link from 'next/link';

interface TermsCheckboxProps {
  addressConnected: string | null;
}

const TermsCheckbox = ({ addressConnected }: TermsCheckboxProps) => {
  const [showTerms, setShowTerms] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const maxRetries = 3;
    let retryCount = 0;
    let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
  
    const checkTermsStatus = async (isRetry = false) => {
      if (!addressConnected) return;
      
      // Initial delay only on first attempt
      if (!isRetry) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      let willRetry = false;
      
      try {
        const hasAccepted = await launchTermsApi.getStatus(addressConnected);
        if (hasAccepted) {
          setShowTerms(false);
        }
      } catch (err: unknown) {
        const error = err as Error;
        const apiError = err as { response?: { status?: number } };
        
        // Silently handle errors for new users
        if (error?.message?.includes("undefined") || 
            apiError?.response?.status === 404 || 
            error?.message?.includes("not found")) {
          // Do nothing for new users - just show terms normally
        } else {
          setError('Failed to check terms status');
          
          // Schedule retry if under max retries
          if (retryCount < maxRetries) {
            retryCount++;
            willRetry = true;
            retryTimeoutId = setTimeout(() => {
              checkTermsStatus(true);
            }, 2500);
          }
        }
      } finally {
        // Only clear loading if we're not going to retry
        if (!willRetry) {
          setIsLoading(false);
        }
      }
    };
  
    // Initial check
    checkTermsStatus();
    
    // Cleanup function
    return () => {
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
        setIsLoading(false); // Ensure loading is cleared on unmount
      }
    };
  }, [addressConnected]);

  const handleCheckboxChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    
    if (checked) {
      if (!addressConnected) return;
      try {
        const success = await launchTermsApi.acceptTerms(addressConnected);
        if (success) {
          setShowTerms(false);
        }
      } catch (err) {
        setError('Failed to save terms acceptance');
        console.error('Error saving terms acceptance:', err);
        setIsChecked(false);
      }
    }
  };

  if (isLoading) {
    return null;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (!showTerms) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id="terms"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="peer sr-only"
            required
          />
          <label
            htmlFor="terms"
            className={`
              relative h-4 w-4 cursor-pointer rounded border-2
              transition-all duration-200 ease-in-out
              ${isChecked 
                ? 'border-transparent bg-gradient-to-tr from-red-600 to-yellow-600' 
                : 'border-gray-400 bg-transparent hover:border-gray-300'
              }
            `}
          >
            <FaCheck 
              className={`
                absolute h-3 w-3 text-white
                transition-opacity duration-200 ease-in-out
                ${isChecked ? 'opacity-100' : 'opacity-0'}
              `}
            />
          </label>
        </div>
        <label htmlFor="terms" className="cursor-pointer text-sm text-gray-400">
          I have read and agree to the{' '}
          <Link 
            href="https://memekult.gitbook.io/memekult-docs/legal/terms-and-conditions" 
            className="hover:text-gray-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms and Conditions
          </Link>
        </label>
      </div>
    </div>
  );

};

export default TermsCheckbox;