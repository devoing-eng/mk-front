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

export interface Coin {
  id: string;
  imageUrl: string;
  name: string;
  ticker: string;
  creator: {
    username: string;
  };
  description: string | null;
  tokenData?: { 
    reserves: { 
      initialVToken: string;
      vTokenReserve: string;
      initialVETH: string;
      vEthReserve: string;
      bridgeThreshold: string;
    };
  };
}

export interface UserHolding {
  coinId: string;
  coin: {
    id: string;
    name: string;
    ticker: string;
    imageUrl: string;
    description: string | null;
    tokenData?: {
      reserves: { 
        initialVToken: string;
        vTokenReserve: string;
        initialVETH: string;
        vEthReserve: string;
        bridgeThreshold: string;
      };
    };
    creator: {
      username: string;
    };
  };
}
