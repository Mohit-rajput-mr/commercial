export interface Property {
  id: string;
  type: 'Office' | 'Retail' | 'Industrial' | 'Restaurant' | 'Land' | 'Medical' | 'Flex' | 'Coworking';
  price: string;
  pricePerSF: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  size: string;
  sizeRange?: { min: number; max: number };
  imageUrl: string;
  images: string[];
  isFavorite?: boolean;
  highlights: string[];
  spaceAvailability: SpaceAvailability[];
  agent: Agent;
  description: string;
  coordinates?: { lat: number; lng: number };
  virtualTour?: string;
  yearBuilt?: number;
  parking?: string;
  zoning?: string;
}

export interface SpaceAvailability {
  space: string;
  size: string;
  term: string;
  rentalRate: string;
  rentType: string;
  floorPlan?: string;
  interiorPhotos?: string[];
}

export interface Agent {
  id: string;
  name: string;
  photo: string;
  phone: string;
  email: string;
  company: string;
  companyLogo: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  favorites: string[];
  savedSearches: SavedSearch[];
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
}

export interface SearchFilters {
  type?: string[];
  location?: string;
  priceRange?: { min: number; max: number };
  sizeRange?: { min: number; max: number };
  listingType?: 'For Sale' | 'For Lease' | 'Auctions';
}

