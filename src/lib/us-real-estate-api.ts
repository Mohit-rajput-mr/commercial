/**
 * Commercial Property API Service
 * Uses web-scraped JSON data from commercial_dataset JSON files
 */

let commercialData: any[] = [];

async function loadCommercialData(): Promise<any[]> {
  if (commercialData.length > 0) {
    return commercialData;
  }
  
  try {
    let allData: any[] = [];
    
    if (typeof window !== 'undefined') {
      try {
        const response1 = await fetch('/commercial_dataset_17nov2025.json');
        if (response1.ok) {
          const data1 = await response1.json();
          if (Array.isArray(data1)) {
            allData = [...allData, ...data1];
          }
        }
      } catch (err) {
        console.warn('Error loading commercial_dataset_17nov2025.json:', err);
      }
      
      try {
        const response2 = await fetch('/commercial_dataset2.json');
        if (response2.ok) {
          const data2 = await response2.json();
          if (Array.isArray(data2)) {
            allData = [...allData, ...data2];
          }
        }
      } catch (err) {
        console.warn('Error loading commercial_dataset2.json:', err);
      }
      
      commercialData = allData;
    } else {
      const fs = require('fs');
      const path = require('path');
      
      try {
        const filePath1 = path.join(process.cwd(), 'public', 'commercial_dataset_17nov2025.json');
        const fileContents1 = fs.readFileSync(filePath1, 'utf8');
        const data1 = JSON.parse(fileContents1);
        if (Array.isArray(data1)) {
          allData = [...allData, ...data1];
        }
      } catch (err) {
        console.warn('Error loading commercial_dataset_17nov2025.json:', err);
      }
      
      try {
        const filePath2 = path.join(process.cwd(), 'public', 'commercial_dataset2.json');
        const fileContents2 = fs.readFileSync(filePath2, 'utf8');
        const data2 = JSON.parse(fileContents2);
        if (Array.isArray(data2)) {
          allData = [...allData, ...data2];
        }
      } catch (err) {
        console.warn('Error loading commercial_dataset2.json:', err);
      }
      
      commercialData = allData;
    }
    
    return commercialData;
  } catch (err) {
    console.error('Error loading commercial data:', err);
    commercialData = [];
    return [];
  }
}

interface RawCommercialData {
  propertyId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price?: string | null;
  priceNumeric?: number | null;
  propertyType: string;
  propertyTypeDetailed?: string | null;
  listingType: string;
  description?: string | null;
  images?: string[];
  squareFootage?: number | null;
  buildingSize?: string | null;
  listingUrl?: string;
  dataPoints?: string[];
  [key: string]: any;
}

export interface CommercialProperty {
  zpid: string;
  address: string | CommercialAddress;
  city: string;
  state: string;
  zipcode: string;
  price?: number;
  priceText?: string;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  lotSize?: number;
  yearBuilt?: number;
  propertyType?: string;
  status?: string;
  imgSrc?: string;
  images?: string[];
  description?: string;
  latitude?: number;
  longitude?: number;
  listingUrl?: string;
  sizeText?: string;
}

export interface CommercialAddress {
  streetAddress?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  neighborhood?: string;
  subdivision?: string;
  community?: string;
}

export interface CommercialSearchResponse {
  props: CommercialProperty[];
  totalResultCount?: number;
  _responseTime?: number;
  _endpoint?: string;
  _params?: string;
}

function normalizeProperty(item: RawCommercialData): CommercialProperty {
  return {
    zpid: item.propertyId || String(Math.random()),
    address: item.address || '',
    city: item.city || '',
    state: item.state || '',
    zipcode: item.zip || '',
    price: item.priceNumeric || undefined,
    priceText: item.price || undefined,
    propertyType: item.propertyType || item.propertyTypeDetailed || '',
    status: item.listingType || undefined,
    imgSrc: item.images?.[0] || undefined,
    images: item.images || [],
    description: item.description || undefined,
    livingArea: item.squareFootage || undefined,
    listingUrl: item.listingUrl || undefined,
    sizeText: item.buildingSize || undefined,
  };
}

export async function getAllCommercialProperties(): Promise<CommercialSearchResponse> {
  const startTime = Date.now();
  
  try {
    const data = await loadCommercialData();
    const allProperties = (data as RawCommercialData[]).map(normalizeProperty);
    
    const responseTime = Date.now() - startTime;
    
    return {
      props: allProperties,
      totalResultCount: allProperties.length,
      _responseTime: responseTime,
      _endpoint: 'local-dataset-all',
      _params: JSON.stringify({ action: 'getAll' }),
    };
  } catch (err) {
    const responseTime = Date.now() - startTime;
    console.error('Get all commercial properties error:', err);
    throw new Error(`Failed to load commercial properties: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

function matchesListingType(listingType: string | null | undefined, searchType: 'sale' | 'lease'): boolean {
  if (!listingType) return true;
  
  const lowerType = listingType.toLowerCase();
  
  if (searchType === 'lease') {
    return lowerType.includes('lease') || lowerType.includes('rent');
  }
  
  return !lowerType.includes('lease') && !lowerType.includes('rent');
}

export async function searchCommercial(
  location: string,
  type: 'sale' | 'lease' = 'sale',
  propertyType?: string
): Promise<CommercialSearchResponse> {
  const startTime = Date.now();
  const searchQuery = location.trim().toLowerCase();
  
  try {
    const data = await loadCommercialData();
    
    const filtered = (data as RawCommercialData[])
      .filter((item) => {
        if (!matchesListingType(item.listingType, type)) {
          return false;
        }
        
        if (propertyType) {
          const itemType = (item.propertyType || item.propertyTypeDetailed || '').toLowerCase();
          if (!itemType.includes(propertyType.toLowerCase())) {
            return false;
          }
        }
        
        const city = String(item.city || '').toLowerCase().trim();
        const state = String(item.state || '').toLowerCase().trim();
        const zip = String(item.zip || '').toLowerCase().trim();
        const address = String(item.address || '').toLowerCase().trim();
        
        if (!searchQuery || searchQuery.trim() === '') {
          return true;
        }
        
        const stateAbbreviations: { [key: string]: string } = {
          'alabama': 'al', 'alaska': 'ak', 'arizona': 'az', 'arkansas': 'ar',
          'california': 'ca', 'colorado': 'co', 'connecticut': 'ct', 'delaware': 'de',
          'florida': 'fl', 'georgia': 'ga', 'hawaii': 'hi', 'idaho': 'id',
          'illinois': 'il', 'indiana': 'in', 'iowa': 'ia', 'kansas': 'ks',
          'kentucky': 'ky', 'louisiana': 'la', 'maine': 'me', 'maryland': 'md',
          'massachusetts': 'ma', 'michigan': 'mi', 'minnesota': 'mn', 'mississippi': 'ms',
          'missouri': 'mo', 'montana': 'mt', 'nebraska': 'ne', 'nevada': 'nv',
          'new hampshire': 'nh', 'new jersey': 'nj', 'new mexico': 'nm', 'new york': 'ny',
          'north carolina': 'nc', 'north dakota': 'nd', 'ohio': 'oh', 'oklahoma': 'ok',
          'oregon': 'or', 'pennsylvania': 'pa', 'rhode island': 'ri', 'south carolina': 'sc',
          'south dakota': 'sd', 'tennessee': 'tn', 'texas': 'tx', 'utah': 'ut',
          'vermont': 'vt', 'virginia': 'va', 'washington': 'wa', 'west virginia': 'wv',
          'wisconsin': 'wi', 'wyoming': 'wy'
        };
        
        if (city.includes(searchQuery) || state.includes(searchQuery) || zip.includes(searchQuery) || address.includes(searchQuery)) {
          return true;
        }
        
        for (const [stateName, abbrev] of Object.entries(stateAbbreviations)) {
          if (searchQuery === stateName && state === abbrev) {
            return true;
          }
          if (searchQuery === abbrev && state === abbrev) {
            return true;
          }
        }
        
        return false;
      })
      .map(normalizeProperty);
    
    const responseTime = Date.now() - startTime;
    
    return {
      props: filtered,
      totalResultCount: filtered.length,
      _responseTime: responseTime,
      _endpoint: 'local-dataset',
      _params: JSON.stringify({ location, type, propertyType }),
    };
  } catch (err) {
    const responseTime = Date.now() - startTime;
    console.error('Commercial search error:', err);
    throw new Error(`Failed to search commercial properties: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function getCommercialDetails(id: string): Promise<CommercialProperty | null> {
  try {
    const data = await loadCommercialData();
    const item = (data as RawCommercialData[]).find((p) => p.propertyId === id);
    
    if (!item) {
      return null;
    }
    
    return normalizeProperty(item);
  } catch (err) {
    console.error('Get commercial details error:', err);
    return null;
  }
}

export async function getCommercialImages(id: string): Promise<string[]> {
  try {
    const data = await loadCommercialData();
    const item = (data as RawCommercialData[]).find((p) => p.propertyId === id);
    
    return item?.images || [];
  } catch (err) {
    console.error('Get commercial images error:', err);
    return [];
  }
}

export function getAddressString(address: string | CommercialAddress | undefined): string {
  if (!address) return 'Address not available';
  if (typeof address === 'string') return address;
  return address.streetAddress || address.community || address.neighborhood || 'Address not available';
}

export function getCity(property: CommercialProperty): string {
  if (typeof property.address === 'object' && property.address.city) {
    return property.address.city;
  }
  return property.city || '';
}

export function getState(property: CommercialProperty): string {
  if (typeof property.address === 'object' && property.address.state) {
    return property.address.state;
  }
  return property.state || '';
}

export function getZipcode(property: CommercialProperty): string {
  if (typeof property.address === 'object' && property.address.zipcode) {
    return property.address.zipcode;
  }
  return property.zipcode || '';
}

// Zillow Property Types and Functions
export interface ZillowProperty {
  zpid: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price?: string | number;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  lotSize?: number;
  yearBuilt?: number;
  propertyType?: string;
  status?: string;
  listingStatus?: string;
  imgSrc?: string;
  images?: string[];
  description?: string;
  latitude?: number;
  longitude?: number;
  zestimate?: number;
}

const ZILLOW_API_BASE_URL = 'https://zillow-com1.p.rapidapi.com';

function getZillowHeaders(): Record<string, string> {
  return {
    'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || 'faf657766emsha74fedf2f6947fdp14c2b1jsn61fd3e532c38',
    'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPIDAPI_HOST || 'zillow-com1.p.rapidapi.com',
  };
}

/**
 * Search properties by location using Zillow API
 */
export async function searchPropertiesByLocation(
  location: string,
  statusType: 'ForSale' | 'ForRent' = 'ForSale'
): Promise<ZillowProperty[]> {
  try {
    const params = new URLSearchParams({
      location,
      status_type: statusType,
    });

    const response = await fetch(`${ZILLOW_API_BASE_URL}/propertyExtendedSearch?${params.toString()}`, {
      method: 'GET',
      headers: getZillowHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Zillow API Error (${response.status}): ${errorText || response.statusText}`);
      return [];
    }

    const data = await response.json();
    const props = data.props || data || [];
    
    // Normalize properties to ZillowProperty format
    return props.map((item: any): ZillowProperty => {
      const address = typeof item.address === 'string' 
        ? item.address 
        : item.address?.streetAddress || item.address || 'Address not available';
      
      return {
        zpid: item.zpid || String(Math.random()),
        address,
        city: item.city || '',
        state: item.state || '',
        zipcode: item.zipcode || item.zip || '',
        price: item.price || item.priceText || undefined,
        bedrooms: item.bedrooms || undefined,
        bathrooms: item.bathrooms || undefined,
        livingArea: item.livingArea || item.squareFootage || undefined,
        lotSize: item.lotSize || undefined,
        yearBuilt: item.yearBuilt || undefined,
        propertyType: item.propertyType || item.homeType || undefined,
        status: item.status || item.listingStatus || undefined,
        listingStatus: item.listingStatus || item.status || undefined,
        imgSrc: item.imgSrc || item.images?.[0] || undefined,
        images: item.images || (item.imgSrc ? [item.imgSrc] : []),
        description: item.description || undefined,
        latitude: item.latitude || undefined,
        longitude: item.longitude || undefined,
        zestimate: item.zestimate || undefined,
      };
    });
  } catch (err) {
    console.error('Search properties by location error:', err);
    return [];
  }
}

/**
 * Get property details by ZPID from Zillow API
 */
export async function getPropertyDetailsByZpid(zpid: string): Promise<ZillowProperty | null> {
  try {
    const params = new URLSearchParams({ zpid });
    const response = await fetch(`${ZILLOW_API_BASE_URL}/property?${params.toString()}`, {
      method: 'GET',
      headers: getZillowHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Zillow API Error (${response.status}): ${errorText || response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Normalize the response to ZillowProperty format
    const property: ZillowProperty = {
      zpid: data.zpid || zpid,
      address: typeof data.address === 'string' 
        ? data.address 
        : data.address?.streetAddress || data.address || 'Address not available',
      city: data.city || '',
      state: data.state || '',
      zipcode: data.zipcode || data.zip || '',
      price: data.price || data.priceText || undefined,
      bedrooms: data.bedrooms || undefined,
      bathrooms: data.bathrooms || undefined,
      livingArea: data.livingArea || data.squareFootage || undefined,
      lotSize: data.lotSize || undefined,
      yearBuilt: data.yearBuilt || undefined,
      propertyType: data.propertyType || data.homeType || undefined,
      status: data.status || data.listingStatus || undefined,
      listingStatus: data.listingStatus || data.status || undefined,
      imgSrc: data.imgSrc || data.images?.[0] || undefined,
      images: data.images || (data.imgSrc ? [data.imgSrc] : []),
      description: data.description || undefined,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined,
      zestimate: data.zestimate || undefined,
    };

    return property;
  } catch (err) {
    console.error('Get property details by ZPID error:', err);
    return null;
  }
}
