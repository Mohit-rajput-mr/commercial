/**
 * Application Programming Interface Test Service
 * Uses RapidAPI endpoint
 */

const API_BASE_URL = 'https://zillow-com1.p.rapidapi.com';

function getHeaders(): Record<string, string> {
  return {
    'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '1a7e203e13msh15e124fc4fe90ddp1f1544jsneca3781dffe8',
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
 * Supports: city, state, zip code, address, or combinations like "City, State"
 * Fetches all available properties by making multiple API calls if needed
 */
export async function searchProperties(
  location: string,
  statusType: 'ForSale' | 'ForRent' = 'ForSale',
  homeType?: string
): Promise<PropertySearchResponse> {
  const startTime = Date.now();
  const allProps: any[] = [];
  let totalResultCount = 0;
  let page = 1;
  const maxPages = 20; // Safety limit to prevent infinite loops
  const resultsPerPage = 40; // Typical API limit per page

  // Normalize location string - trim and ensure proper format
  const normalizedLocation = location.trim();
  
  if (!normalizedLocation) {
    console.warn('Empty location provided to searchProperties');
    return {
      props: [],
      totalResultCount: 0,
      _responseTime: Date.now() - startTime,
      _endpoint: `${API_BASE_URL}/propertyExtendedSearch`,
      _params: `location=${normalizedLocation}&status_type=${statusType}`,
    };
  }

  console.log(`🔍 Property API Search: location="${normalizedLocation}", status="${statusType}"`);

  try {

    // Make multiple API calls to get all properties
    while (page <= maxPages) {
      const params = new URLSearchParams({
        location: normalizedLocation,
        status_type: statusType,
      });

      if (homeType) {
        params.append('home_type', homeType);
      }

      // Try to add pagination parameters if API supports them
      // Some APIs use 'page' or 'offset' parameters
      params.append('page', String(page));

      const response = await fetch(`${API_BASE_URL}/propertyExtendedSearch?${params.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        // If pagination fails, break and return what we have
        if (page > 1) break;
        const errorText = await response.text();
        console.error(`Zillow API Error (${response.status}):`, errorText || response.statusText);
        // Don't throw on first page, just return empty array
        if (page === 1) {
          return {
            props: [],
            totalResultCount: 0,
            _responseTime: Date.now() - startTime,
            _endpoint: `${API_BASE_URL}/propertyExtendedSearch`,
            _params: `location=${normalizedLocation}&status_type=${statusType}`,
          };
        }
        throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      const props = data.props || data || [];
      
      console.log(`📄 Zillow API Page ${page}: ${props.length} properties found for "${normalizedLocation}"`);
      
      if (props.length === 0) {
        // No more results
        break;
      }

      // Normalize address field - convert objects to strings
      const normalizedProps = props.map((prop: any) => {
        if (prop.address && typeof prop.address === 'object') {
          prop.address = prop.address.streetAddress || prop.address.community || JSON.stringify(prop.address);
        }
        return prop;
      });

      allProps.push(...normalizedProps);
      totalResultCount = data.totalResultCount || allProps.length;

      // If we got fewer results than expected, we've reached the end
      if (props.length < resultsPerPage) {
        break;
      }

      // If totalResultCount is known and we've fetched all, break
      if (data.totalResultCount && allProps.length >= data.totalResultCount) {
        break;
      }

      page++;
    }
  } catch (err) {
    // If first page fails, try without pagination
    if (page === 1 && allProps.length === 0) {
      const params = new URLSearchParams({
        location: normalizedLocation,
        status_type: statusType,
      });

      if (homeType) {
        params.append('home_type', homeType);
      }

      const response = await fetch(`${API_BASE_URL}/propertyExtendedSearch?${params.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const props = data.props || data || [];
        
        console.log('Zillow API fallback:', props.length, 'properties found');
        
        const normalizedProps = props.map((prop: any) => {
          if (prop.address && typeof prop.address === 'object') {
            prop.address = prop.address.streetAddress || prop.address.community || JSON.stringify(prop.address);
          }
          return prop;
        });

        allProps.push(...normalizedProps);
        totalResultCount = data.totalResultCount || normalizedProps.length || 0;
      } else {
        const errorText = await response.text();
        console.error('Zillow API fallback error:', response.status, errorText);
      }
    }
  }

  const responseTime = Date.now() - startTime;
  
  return {
    props: allProps,
    totalResultCount: totalResultCount || allProps.length,
    _responseTime: responseTime,
    _endpoint: `${API_BASE_URL}/propertyExtendedSearch`,
    _params: `location=${normalizedLocation}&status_type=${statusType}${homeType ? `&home_type=${homeType}` : ''}`,
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

