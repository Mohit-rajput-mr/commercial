// TypeScript interfaces for Zillow-com1 API responses

export interface LocationSuggestion {
  location: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

export interface PropertySearchResult {
  zpid: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  lotSize?: number;
  yearBuilt?: number;
  propertyType?: string;
  homeStatus?: string;
  daysOnZillow?: number;
  zestimate?: number;
  rentZestimate?: number;
  imgSrc?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  mlsNumber?: string;
  description?: string;
}

export interface PropertyDetail {
  zpid: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  lotSize?: number;
  yearBuilt?: number;
  propertyType?: string;
  homeStatus?: string;
  daysOnZillow?: number;
  zestimate?: number;
  rentZestimate?: number;
  images?: string[];
  description?: string;
  latitude?: number;
  longitude?: number;
  mlsNumber?: string;
  stories?: number;
  hoaFee?: number;
  taxAnnualAmount?: number;
  pricePerSqft?: number;
  resoFacts?: {
    heating?: string;
    cooling?: string;
    parking?: string;
    garageType?: string;
    flooring?: string[];
    appliances?: string[];
    amenities?: string[];
  };
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
  event: string;
  priceChangeRate?: number;
}

export interface TaxHistoryEntry {
  year: number;
  taxPaid: number;
  taxIncreaseRate?: number;
  assessmentValue?: number;
  taxRate?: number;
}

export interface ZestimateData {
  zestimate?: number;
  rentZestimate?: number;
  valueChange?: number;
  valueChangeDuration?: string;
}

export interface ZestimateHistoryEntry {
  date: string;
  value: number;
  change?: number;
}

export interface WalkScore {
  walkScore?: number;
  transitScore?: number;
  bikeScore?: number;
}

export interface School {
  name: string;
  rating: number;
  grades: string;
  distance: number;
  type: string;
  studentCount?: number;
}

export interface SimilarProperty {
  zpid: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  imgSrc?: string;
  propertyType?: string;
  homeStatus?: string;
}

export interface RentEstimate {
  rentZestimate?: number;
  rentRange?: {
    low?: number;
    high?: number;
  };
}

export interface Agent {
  name?: string;
  phone?: string;
  email?: string;
  photo?: string;
  profileUrl?: string;
}
