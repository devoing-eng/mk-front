export interface Claim {
  id: string;
  transactionHash: string;
  status: 'IN_PROGRESS' | 'RECEIVED' | 'FAILED' ;
  createdAt: Date;
  coin: {
    id: string;
    name: string;
    ticker: string;
    imageUrl: string;
    tokenAddress: string;
    tokenAddressOnL1: string; 
  };
}
  
export interface UseClaimsListReturn {
  claims: Claim[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  fetchClaims: (filters?: { coinAddress?: string; status?: 'IN_PROGRESS' | 'RECEIVED' | 'FAILED'}) => Promise<void>;
  setPage: (page: number) => void;
}

export interface ClaimResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export type ButtonStage = 'INITIAL' | 'PROCESSING' | 'PROGRESSING' | 'COMPLETED' | 'FAILED';

export interface ClaimButtonProps {
  addressConnected: string;
  onClaim: () => Promise<ClaimResult | undefined>;
  isVisible: boolean;
  transactionHash?: string;
  status: 'INITIAL' | 'IN_PROGRESS' | 'RECEIVED' | 'FAILED';
  onStatusChange?: (status: 'IN_PROGRESS' | 'RECEIVED' | 'FAILED') => void;
  initialState: 'INITIAL' | 'PROGRESSING' | 'FAILED' | null;
}