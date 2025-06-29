// components/Coin/LiquidityProgress.tsx

import { useCoinMetrics } from '@/app/hooks/useCoinMetrics';
import { formatEthLiquidity } from '@/utils/formatters';

interface LiquidityProgressProps {
  coinId: string;
  initialVETH: number;        
  vEthReserve: string;        
  tokensAvailable: string;     
  isLoading: boolean;
}

export default function LiquidityProgress({
  coinId,
  initialVETH,
  vEthReserve,
  tokensAvailable,
  isLoading
}: LiquidityProgressProps) {
  
  const { progress } = useCoinMetrics(coinId); //!

  if (isLoading ) {
    return (
      <div className="mb-4 animate-pulse">
        <p>No transactions yet. Be the First to buy this Coin🔥</p>
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-1"></div>
        <div className="h-2.5 bg-gray-700 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Bonding curve progress:</span>
        <span className={`text-sm text-green-300 ${progress}`}>
            {progress.toFixed(2)}%
        </span>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col mt-2 text-sm text-gray-400 space-y-2">
          <div>
            💧 Liquidity: {Math.max(parseFloat(formatEthLiquidity(vEthReserve, initialVETH)) || 0, 0)} ETH
          </div>
          <div>
            🪙 Available: {tokensAvailable} tokens
          </div>
      </div>
    </div>
  );
}