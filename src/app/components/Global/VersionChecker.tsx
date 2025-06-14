// src/app/components/Global/VersionChecker.tsx
'use client';
import { useEffect } from 'react';
import { checkAppVersion } from '@/utils/versionCheck';

export default function VersionChecker() {
  useEffect(() => {
    checkAppVersion();
    
    // Periodic checks
    const interval = setInterval(checkAppVersion, 15 * 60 * 1000); // 15 min
    return () => clearInterval(interval);
  }, []);

  return null;
}