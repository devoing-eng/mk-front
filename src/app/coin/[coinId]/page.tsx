// src/app/coin/[coinId]/page.tsx

import CoinDetails from '@/app/coin/[coinId]/components/CoinDetails';
import { getPageMetadata } from '@/lib/metadata';
import { ApiClient } from '@/utils/apiClient'
import { Metadata } from 'next';

interface CoinPageProps {
  params: Promise<{ coinId: string }>;
}

export async function generateMetadata({ params }: CoinPageProps): Promise<Metadata> {
  const { coinId } = await params;
  
  try {
    const coinData = await ApiClient.getCoin(coinId);

    if (!coinData) {
      return getPageMetadata('coin', {
        name: 'One More Kult',
        ticker: 'OMK',
        creator: '0xab34BEb34b03Df942216ee93f1F2be2dbe34e9E6',
        description: 'One More Kult on MemeKult',
        coinId
      });
    }

    return getPageMetadata('coin', {
      name: coinData.name,
      ticker: coinData.ticker,
      creator: coinData.creatorAddress,
      description: coinData.description,
      coinId
    });

  } catch (error) {
    console.error('Error fetching coin data:', error);
    return getPageMetadata('coin', {
      name: 'One More Kult',
      ticker: 'OMK',
      creator: '0xab34BEb34b03Df942216ee93f1F2be2dbe34e9E6',
      description: 'One More Kult on MemeKult',
      coinId
    });
  }
}

export default async function CoinPage({ params }: CoinPageProps) {
  const { coinId } = await params;

  return (
    <div className='mt-10'>
      <CoinDetails coinId={coinId} />
    </div>
  );
}