/**
 * Application Programming Interface Test Service
 * Uses RapidAPI endpoint
 */

const API_BASE_URL = 'https://zillow-com1.p.rapidapi.com';

function getHeaders(): Record<string, string> {
  return {
    'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
    'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPIDAPI_HOST || 'zillow-com1.p.rapidapi.com',
  };
}

export interface APIAddress {
  streetAddress?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  neighborhood?: string;
  subdivision?: string;
  community?: string;
}

export interface APIProperty {
  zpid: string;
  address: string | APIAddress;
  city: string;
  state: string;
  zipcode: string;
  price: number;
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
  zestimate?: number;
  latitude?: number;
  longitude?: number;
}

// Helper function to extract address string
export function getAddressString(address: string | APIAddress | undefined): string {
  if (!address) return 'Address not available';
  if (typeof address === 'string') return address;
  return address.streetAddress || address.community || address.neighborhood || 'Address not available';
}

// Helper function to extract city
export function getCity(property: APIProperty): string {
  if (typeof property.address === 'object' && property.address.city) {
    return property.address.city;
  }
  return property.city || '';
}

// Helper function to extract state
export function getState(property: APIProperty): string {
  if (typeof property.address === 'object' && property.address.state) {
    return property.address.state;
  }
  return property.state || '';
}

// Helper function to extract zipcode
export function getZipcode(property: APIProperty): string {
  if (typeof property.address === 'object' && property.address.zipcode) {
    return property.address.zipcode;
  }
  return property.zipcode || '';
}

export interface PropertySearchResponse {
  props: APIProperty[];
  totalResultCount?: number;
  _responseTime?: number;
  _endpoint?: string;
  _params?: string;
}

export interface PropertyDetailsResponse extends APIProperty {
  images?: string[];
  description?: string;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  brokerName?: string;
  _responseTime?: number;
  _endpoint?: string;
  _params?: string;
}

/**
 * Search properties by location
 */
export async function searchProperties(
  location: string,
  statusType: 'ForSale' | 'ForRent' = 'ForSale',
  homeType?: string
): Promise<PropertySearchResponse> {
  const params = new URLSearchParams({
    location,
    status_type: statusType,
  });

  if (homeType) {
    params.append('home_type', homeType);
  }

  const startTime = Date.now();
  const response = await fetch(`${API_BASE_URL}/propertyExtendedSearch?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const responseTime = Date.now() - startTime;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  
  // Normalize address field - convert objects to strings
  const normalizedProps = (data.props || data || []).map((prop: any) => {
    if (prop.address && typeof prop.address === 'object') {
      prop.address = prop.address.streetAddress || prop.address.community || JSON.stringify(prop.address);
    }
    return prop;
  });
  
  return {
    props: normalizedProps,
    totalResultCount: data.totalResultCount || normalizedProps.length || 0,
    _responseTime: responseTime,
    _endpoint: `${API_BASE_URL}/propertyExtendedSearch`,
    _params: params.toString(),
  };
}

/**
 * Get property details by ZPID
 */
export async function getPropertyDetails(zpid: string): Promise<PropertyDetailsResponse> {
  const params = new URLSearchParams({ zpid });
  const startTime = Date.now();

  const response = await fetch(`${API_BASE_URL}/property?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const responseTime = Date.now() - startTime;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  
  return {
    ...data,
    _responseTime: responseTime,
    _endpoint: `${API_BASE_URL}/property`,
    _params: params.toString(),
  };
}

/**
 * Get property images by ZPID
 */
export async function getPropertyImages(zpid: string): Promise<string[]> {
  const params = new URLSearchParams({ zpid });
  const startTime = Date.now();

  const response = await fetch(`${API_BASE_URL}/images?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const responseTime = Date.now() - startTime;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  
  return (data.images || data || []) as string[];
}

/**
 * Get location suggestions (autocomplete)
 */
export async function getLocationSuggestions(location: string): Promise<string[]> {
  const params = new URLSearchParams({ location });
  const startTime = Date.now();

  const response = await fetch(`${API_BASE_URL}/locationSuggestions?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const responseTime = Date.now() - startTime;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  
  return (data.suggestions || data || []) as string[];
}

