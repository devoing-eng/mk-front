import React from 'react';

interface ShillMessageProps {
  addressConnected: string| null;
  creatorAddress: string;
  tokenAddress: string | null;
}

export default function ShillMessage({
  addressConnected,
  creatorAddress,
  tokenAddress
}: ShillMessageProps) {
  // Only show the message if tokenAddress is null AND addressConnected equals creatorAddress
  if (tokenAddress !== null || addressConnected !== creatorAddress) {
    return null;
  }

  return (
    <div className="w-full max-w-64 mb-2 rounded-md bg-blue-600 bg-opacity-10 border border-blue-400 shadow-sm">
      <div className="flex items-center py-1.5 px-3">
        <div>
          <p className="text-sm font-medium text-gray-200">
            Your coin is off-chain as for now.
          </p>
          <p className="text-sm font-semibold text-green-400">
            🚨 Shill it. Buy it.
          </p>
          <p className="text-sm font-semibold text-indigo-200">
            🚀 Send it to moon.
          </p>
        </div>
      </div>
    </div>
  );
}
