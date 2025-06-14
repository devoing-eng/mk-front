export interface SearchResult {
    id: string;
    type: 'coin' | 'user';
    primaryText: string;
    secondaryText: string;
    imageUrl?: string | null;
}
  
export interface GroupedSearchResults {
    coins: SearchResult[];
    users: SearchResult[];
}