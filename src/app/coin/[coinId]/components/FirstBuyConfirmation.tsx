// src/app/coin/[coinId]/components/FirstBuyConfirmation.tsx

import { marketTermsApi } from '@/app/services/marketTermsApi';
import { useState, useEffect, ChangeEvent } from 'react';
import { FaCheck } from 'react-icons/fa6';
import Link from 'next/link';

interface FirstBuyConfirmationProps {
  addressConnected: string | null;
  onConfirmed: (confirmed: boolean) => void;
}

const FirstBuyConfirmation = ({ addressConnected, onConfirmed }: FirstBuyConfirmationProps) => {
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkTermsStatus = async () => {
      if (!addressConnected) return;
      try {
        const hasAccepted = await marketTermsApi.getStatus(addressConnected);
        if (hasAccepted) {
          setShowConfirmation(false);
          onConfirmed(true);
        }
      } catch (err) {
        setError('Failed to check terms status');
        console.error('Error checking terms status:', err);
      } finally {
        setIsLoading(false);
      }
    };
  
    checkTermsStatus();
  }, [onConfirmed, addressConnected]);

  const handleCheckboxChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    
    if (checked) {
      if (!addressConnected) return;
      try {
        const success = await marketTermsApi.acceptTerms(addressConnected);
        if (success) {
          setShowConfirmation(false);
          onConfirmed(true);
        }
      } catch (err) {
        setError('Failed to save terms acceptance');
        console.error('Error saving terms acceptance:', err);
        setIsChecked(false);
        onConfirmed(false);
      }
    } else {
      onConfirmed(false);
    }
  };

  if (isLoading) {
    return null;
  }
  
  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (!showConfirmation) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id="buyConfirmation"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="peer sr-only"
            required
          />
          <label
            htmlFor="buyConfirmation"
            className={`
              relative h-4 w-4 cursor-pointer rounded border-2
              transition-all duration-200 ease-in-out
              ${isChecked 
                ? 'border-transparent bg-gradient-to-r from-green-500 to-green-600' 
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
        <label htmlFor="buyConfirmation" className="cursor-pointer text-sm text-gray-400">
            I agree to the{' '}
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

export default FirstBuyConfirmation;