export interface ProfileData {
  id: string;
  address: string;
  username: string;
  bio: string;
  profileImage: string;
}

export interface Tab {
  name: string;
  label: string;
  count?: number;  // count optional since not all tabs will have it
}

export interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOwnProfile: boolean;
  profileData: {
    id: string;
    address: string;
    username: string;
    bio: string;
    profileImage: string;
  };
}

export interface CreatedHolding {
  coinId: string;
  coin: {
    id: string;
    name: string;
    ticker: string;
    imageUrl: string;
    audioUrl: string;
    isPremium: boolean;
    description: string | null;
    tokenData?: {
      liveMarketCap: number;
      progress : number;
    };
    creator: {
      username: string;
    };
  };
}