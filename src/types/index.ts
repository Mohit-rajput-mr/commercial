// Re-export from property.ts for backward compatibility
export type { Property } from './property';
export type { Agent, SpaceAvailability, User, SavedSearch, SearchFilters } from './property';

export interface StatCard {
  number: string;
  label: string;
}

export interface Company {
  name: string;
  logo?: string;
}

export type TabType = 'For Lease' | 'For Sale' | 'Auctions' | 'Businesses For Sale';

export type PropertyType = 'Office' | 'Retail' | 'Industrial' | 'Flex' | 'Coworking' | 'Medical' | 'Restaurant' | 'Land';

