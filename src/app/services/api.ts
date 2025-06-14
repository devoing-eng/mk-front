// services/api.ts
import { defaultProfileImage } from "../constants/general";
import { CoinStaticData } from "../types/coin";
import { UserProfileData } from "../types/user";

export const fetchCoinStaticData = async (coinId: string): Promise<CoinStaticData> => {
  const response = await fetch(`/api/coins/${coinId}/static`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch coin static data');
  }

  return response.json();
};

export const fetchUserProfile = async (userAddress: string): Promise<UserProfileData> => {
  if (!userAddress) {
    const response: UserProfileData = {
      success: true,
      data: {
        id: "MK",
        address: "0x1234",
        username: "MemeKult",
        image: defaultProfileImage,
        bio: "KULT!",
      }
    };
    return response;
  }
  
  try {
    const response = await fetch(`/api/users/address/${userAddress}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export const updateCoinTokenAddress = async (coinId: string, tokenAddress: string) => {
  const response = await fetch(`/api/coins/${coinId}/token-address`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tokenAddress }),
  });

  if (!response.ok) {
    throw new Error('Failed to update token address');
  }

  return response.json();
};