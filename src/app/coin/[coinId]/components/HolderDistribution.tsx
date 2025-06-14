
import { useHoldersDistribution } from '@/app/hooks/useHoldersDistribution';
import { BONDING_CURVE_ADDRESS } from '@/app/constants/contracts';
import { Users } from 'lucide-react';
import { useMemo } from 'react';
import { CoinStaticData } from '@/app/types/coin';

interface EnrichedHolder {
  address: string;
  balance: string;
  percentage: string;
  displayName: string;
  type: 'creator' | 'bondingCurve' | 'holder';
}

const EmptyHoldersState = () => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Holders distribution</h2>
      </div>
      
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <Users className="w-12 h-12 text-gray-500" />
        <p className="text-gray-400 text-sm">No holder found</p>
      </div>
    </div>
  );
};

export default function HolderDistribution({ coinData } : { coinData : CoinStaticData }) {
  
  const { 
    data: holders = [], 
    isLoading, 
    isError 
  } = useHoldersDistribution(coinData.id);

  // Enrich holders with display names and types
  const enrichedHolders = useMemo<EnrichedHolder[]>(() => {
    if (!holders || !coinData) return [];

    return holders.map(holder => {
      // Check if this is the bonding curve address
      const isBondingCurve = holder.address === BONDING_CURVE_ADDRESS;
      
      // Check if this is the creator
      const isCreator = holder.address.toLowerCase() === coinData.creatorAddress.toLowerCase();

      return {
        ...holder,
        displayName: isBondingCurve 
          ? 'Bonding Curve'
          : isCreator 
            ? 'Creator' 
            : `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`,
        type: isBondingCurve 
          ? 'bondingCurve' 
          : isCreator 
            ? 'creator' 
            : 'holder'
      };
    });
  }, [holders, coinData]);

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between items-center mb-4">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div>Error loading holders distribution</div>;
  }

  if (!enrichedHolders.length) {
    return <EmptyHoldersState />;
  }

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Holders distribution</h2>
      </div>
      
      <div className="space-y-4">
        {enrichedHolders.map((holder, index) => (
          <div key={holder.address} className="relative">
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${
                holder.type === 'creator' 
                  ? 'text-green-400' 
                  : holder.type === 'bondingCurve' 
                    ? 'text-blue-400' 
                    : 'text-gray-400'
              }`}>
                {index + 1}. {holder.displayName}
              </span>
              <span className="font-medium">{parseFloat(holder.percentage).toFixed(2)}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  holder.type === 'creator' 
                    ? 'bg-green-500' 
                    : holder.type === 'bondingCurve' 
                      ? 'bg-blue-500' 
                      : 'bg-indigo-500'
                }`}
                style={{ width: `${holder.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}