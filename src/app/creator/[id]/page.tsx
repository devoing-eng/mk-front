// src/app/creator/[id]/page.tsx

import CreatorDetails from '@/app/creator/[id]/components/CreatorDetails';
import { getPageMetadata } from '@/lib/metadata';
import { ApiClient } from '@/utils/apiClient';
import { Metadata } from 'next';

interface CreatorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CreatorPageProps): Promise<Metadata> {
  const { id: userAddress } = await params
  
  try {
    const userData = await ApiClient.getUserDetails(userAddress);

    if (!userData) {
      return getPageMetadata('creator', {
        name: 'Trader',
        description: 'Trading on MemeKult',
        id: userAddress
      });
    }

    return getPageMetadata('creator', {
      name: userData.data.username,
      id: userAddress,
      description: userData.data.bio || `${userData.data.username} is creating Kults`,
      image: userData.data.image || null
    });

  } catch (error) {
    console.error('Error fetching creator data:', error);
    return getPageMetadata('creator', {
      name: 'MemeKult',
      description: 'Trading on MemeKult',
      userAddress
    });
  }
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { id } = await params;

  return (
    <div className='mt-10'>
      <CreatorDetails params={{ id }} />
    </div>
  );
}