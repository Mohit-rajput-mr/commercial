/**
 * Commercial Property API Service
 * Uses web-scraped JSON data from commercial_dataset JSON files
 */

let commercialData: any[] = [];

// All 14 dataset files in the public folder
const DATASET_FILES = [
  'commercial_dataset_17nov2025.json',
  'commercial_dataset2.json',
  'commercial_dataset_Chicago.json',
  'commercial_dataset_houston.json',
  'commercial_dataset_LA.json',
  'commercial_dataset_ny.json',
  'dataset_miami_beach.json',
  'dataset_miami_sale.json',
  'dataset_miamibeach_lease.json',
  'dataset_philadelphia_sale.json',
  'dataset_philadelphia.json',
  'dataset_phoenix.json',
  'dataset_san_antonio_sale.json',
  'dataset_son_antonio_lease.json'
];

async function loadCommercialData(): Promise<any[]> {
  if (commercialData.length > 0) {
    return commercialData;
  }
  
  try {
    let allData: any[] = [];
    
    if (typeof window !== 'undefined') {
      // Browser environment - load all datasets
      const loadPromises = DATASET_FILES.map(async (filename) => {
        try {
          const response = await fetch(`/${filename}`);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              console.log(`✅ Loaded ${filename}: ${data.length} properties`);
              return data;
            }
          }
        } catch (err) {
          console.warn(`Error loading ${filename}:`, err);
        }
        return [];
      });
      
      const results = await Promise.all(loadPromises);
      allData = results.flat();
      commercialData = allData;
      console.log(`📊 Total properties loaded from all datasets: ${allData.length}`);
    } else {
      // Server environment - load all datasets
      const fs = require('fs');
      const path = require('path');
      
      for (const filename of DATASET_FILES) {
        try {
          const filePath = path.join(process.cwd(), 'public', filename);
          const fileContents = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(fileContents);
          if (Array.isArray(data)) {
            allData = [...allData, ...data];
            console.log(`✅ Loaded ${filename}: ${data.length} properties`);
          }
        } catch (err) {
          console.warn(`Error loading ${filename}:`, err);
        }
      }
      
      commercialData = allData;
      console.log(`📊 Total properties loaded from all datasets: ${allData.length}`);
    }
    
    return commercialData;
  } catch (err) {
    console.error('Error loading commercial data:', err);
    commercialData = [];
    return [];
  }
}

// Property type categorization
const COMMERCIAL_PROPERTY_TYPES = [
  'office',
  'retail',
  'industrial',
  'warehouse',
  'flex',
  'hospitality',
  'hotel',
  'motel',
  'specialty',
  'land',
  'mixed-use',
  'shopping center',
  'strip center',
  'restaurant',
  'medical',
  'healthcare'
];

const RESIDENTIAL_PROPERTY_TYPES = [
  'multifamily',
  'apartment',
  'condo',
  'townhouse',
  'single family',
  'residential'
];

/**
 * Determines if a property type is commercial or residential
 * @param propertyType - The property type string from the dataset
 * @returns 'commercial' | 'residential'
 */
export function categorizePropertyType(propertyType: string | null | undefined): 'commercial' | 'residential' {
  if (!propertyType) return 'commercial'; // Default to commercial for unknown types
  
  const normalizedType = propertyType.toLowerCase().trim();
  
  // Check if it's a residential type
  if (RESIDENTIAL_PROPERTY_TYPES.some(type => normalizedType.includes(type))) {
    return 'residential';
  }
  
  // Check if it's a commercial type
  if (COMMERCIAL_PROPERTY_TYPES.some(type => normalizedType.includes(type))) {
    return 'commercial';
  }
  
  // Default to commercial if unclear
  return 'commercial';
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
  propertyCategory?: 'commercial' | 'residential'; // Added category field
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
  const propertyType = item.propertyType || item.propertyTypeDetailed || '';
  const category = categorizePropertyType(propertyType);
  
  return {
    zpid: item.propertyId || String(Math.random()),
    address: item.address || '',
    city: item.city || '',
    state: item.state || '',
    zipcode: item.zip || '',
    price: item.priceNumeric || undefined,
    priceText: item.price || undefined,
    propertyType: propertyType,
    propertyCategory: category,
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
  propertyType?: string,
  category?: 'commercial' | 'residential' | 'all'
): Promise<CommercialSearchResponse> {
  const startTime = Date.now();
  const searchQuery = location.trim().toLowerCase();
  
  try {
    const data = await loadCommercialData();
    console.log('Commercial search - Data loaded:', data.length, 'properties, Query:', searchQuery);
    
    const filtered = (data as RawCommercialData[])
      .filter((item) => {
        if (!matchesListingType(item.listingType, type)) {
          return false;
        }
        
        // Filter by category if specified
        if (category && category !== 'all') {
          const itemCategory = categorizePropertyType(item.propertyType || item.propertyTypeDetailed);
          if (itemCategory !== category) {
            return false;
          }
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
        
        // If no search query, show all properties (after type filters)
        if (!searchQuery || searchQuery.trim() === '') {
          return true;
        }
        
        // Create a full address string for matching (normalize spaces)
        const fullAddress = `${address} ${city} ${state} ${zip}`.toLowerCase().replace(/\s+/g, ' ').trim();
        
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
        
        // Normalize search query - remove commas and normalize spaces
        const normalizedQuery = searchQuery.replace(/,/g, '').replace(/\s+/g, ' ').trim();
        const searchWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
        
        // Filter out very short words (1 char) but keep 2+ char words
        const meaningfulWords = searchWords.filter(w => w.length >= 2);
        
        // If no meaningful words after filtering, use original query
        if (meaningfulWords.length === 0 && searchWords.length > 0) {
          meaningfulWords.push(normalizedQuery);
        }
        
        // VERY LENIENT MATCHING - match if ANY word appears in ANY field
        
        // 1. Check if full address contains the entire query
        if (fullAddress.includes(normalizedQuery)) {
          return true;
        }
        
        // 2. Check individual components with full query
        if (city.includes(normalizedQuery) || 
            state.includes(normalizedQuery) || 
            zip.includes(normalizedQuery) || 
            address.includes(normalizedQuery)) {
          return true;
        }
        
        // 3. STATE MATCHING - Check state abbreviations and full names
        for (const [stateName, abbrev] of Object.entries(stateAbbreviations)) {
          // If query is a state name/abbrev and property is in that state
          if ((normalizedQuery === stateName || normalizedQuery === abbrev) && state === abbrev) {
            return true;
          }
          // If query contains state name/abbrev and property is in that state
          if ((normalizedQuery.includes(stateName) || normalizedQuery.includes(abbrev)) && state === abbrev) {
            return true;
          }
        }
        
        // 4. SINGLE KEYWORD MATCHING - If ANY word matches ANY field, include it
        // This is the most lenient - works for single keywords like "New", "York", "Main", etc.
        for (const word of meaningfulWords) {
          // Skip single character words
          if (word.length < 2) continue;
          
          // Check if word appears in any field
          if (city.includes(word) || 
              state.includes(word) || 
              zip.includes(word) || 
              address.includes(word) ||
              fullAddress.includes(word)) {
            return true;
          }
          
          // Also check state abbreviations for single words
          for (const [stateName, abbrev] of Object.entries(stateAbbreviations)) {
            if ((word === stateName || word === abbrev) && state === abbrev) {
              return true;
            }
          }
        }
        
        // 5. PARTIAL MATCHING - Check if any part of the query appears anywhere
        // Split query into smaller chunks for partial matching
        if (normalizedQuery.length >= 3) {
          // Check if any 3+ character substring matches
          for (let i = 0; i <= normalizedQuery.length - 3; i++) {
            const substring = normalizedQuery.substring(i, i + 3);
            if (fullAddress.includes(substring) ||
                city.includes(substring) ||
                state.includes(substring) ||
                address.includes(substring)) {
              return true;
            }
          }
        }
        
        return false;
      })
      .map(normalizeProperty);
    
    const responseTime = Date.now() - startTime;
    console.log('Commercial search - Results:', filtered.length, 'properties found in', responseTime, 'ms');
    
    return {
      props: filtered,
      totalResultCount: filtered.length,
      _responseTime: responseTime,
      _endpoint: 'local-dataset',
      _params: JSON.stringify({ location, type, propertyType, category }),
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
    'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '1a7e203e13msh15e124fc4fe90ddp1f1544jsneca3781dffe8',
    'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPIDAPI_HOST || 'zillow-com1.p.rapidapi.com',
  };
}

/**
 * Search properties by location using Zillow API
 * Supports: city, state, zip code, address, or combinations like "City, State"
 */
export async function searchPropertiesByLocation(
  location: string,
  statusType: 'ForSale' | 'ForRent' = 'ForSale'
): Promise<ZillowProperty[]> {
  try {
    // Normalize location string - trim and ensure proper format
    const normalizedLocation = location.trim();
    
    if (!normalizedLocation) {
      console.warn('Empty location provided to searchPropertiesByLocation');
      return [];
    }

    const params = new URLSearchParams({
      location: normalizedLocation,
      status_type: statusType,
    });

    console.log(`🔍 Zillow API Search: location="${normalizedLocation}", status="${statusType}"`);

    const response = await fetch(`${ZILLOW_API_BASE_URL}/propertyExtendedSearch?${params.toString()}`, {
      method: 'GET',
      headers: getZillowHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Zillow API Error (${response.status}): ${errorText || response.statusText}`);
      return [];
    }

    const data = await response.json();
    const props = data.props || data || [];
    
    console.log(`✅ Zillow API Results: ${props.length} properties found for "${normalizedLocation}"`);
    
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
