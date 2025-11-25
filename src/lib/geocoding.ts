// Geocoding utilities using Geoapify API
const GEOAPIFY_API_KEY = 'f396d0928e4b41eeac1751e01b3a444e';

export interface GeocodedLocation {
  lat: number;
  lng: number;
  address: string;
}

// In-memory cache for geocoded addresses
const geocodeCache = new Map<string, GeocodedLocation>();

// Load cache from localStorage on init
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('geocode_cache');
    if (stored) {
      const parsed = JSON.parse(stored);
      Object.entries(parsed).forEach(([key, value]) => {
        geocodeCache.set(key, value as GeocodedLocation);
      });
      console.log('📍 Loaded', geocodeCache.size, 'cached geocode results');
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}

// Save cache to localStorage periodically
let saveTimeout: NodeJS.Timeout | null = null;
function saveCache() {
  if (typeof window === 'undefined') return;
  
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const obj: Record<string, GeocodedLocation> = {};
      geocodeCache.forEach((value, key) => {
        obj[key] = value;
      });
      localStorage.setItem('geocode_cache', JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
  }, 1000);
}

/**
 * Normalize address for caching
 */
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[,\.]+/g, ',')
    .substring(0, 200); // Limit key length
}

/**
 * Geocode an address to get lat/lng coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodedLocation | null> {
  if (!address || address.trim().length < 3) {
    return null;
  }

  const cacheKey = normalizeAddress(address);
  
  // Check cache first
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_API_KEY}&limit=1`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const result: GeocodedLocation = {
        lat: feature.properties.lat,
        lng: feature.properties.lon,
        address: feature.properties.formatted || address,
      };
      
      // Cache the result
      geocodeCache.set(cacheKey, result);
      saveCache();
      return result;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Batch geocode multiple addresses with high concurrency
 */
export async function geocodeBatch(addresses: string[]): Promise<Map<string, GeocodedLocation>> {
  const results = new Map<string, GeocodedLocation>();
  const toGeocode: string[] = [];
  
  // First, check cache for all addresses
  addresses.forEach(addr => {
    const cacheKey = normalizeAddress(addr);
    if (geocodeCache.has(cacheKey)) {
      results.set(addr, geocodeCache.get(cacheKey)!);
    } else {
      toGeocode.push(addr);
    }
  });
  
  console.log(`📍 Cache hit: ${results.size}/${addresses.length}, need to geocode: ${toGeocode.length}`);
  
  if (toGeocode.length === 0) {
    return results;
  }
  
  // Geocode remaining addresses in parallel batches
  const batchSize = 10;
  for (let i = 0; i < toGeocode.length; i += batchSize) {
    const batch = toGeocode.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(addr => geocodeAddress(addr)));
    
    batchResults.forEach((result, index) => {
      if (result) {
        results.set(batch[index], result);
      }
    });
    
    // Small delay between batches
    if (i + batchSize < toGeocode.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * Get center point from location string (city, state)
 */
export async function getCenterFromLocation(location: string): Promise<GeocodedLocation | null> {
  return geocodeAddress(location);
}

/**
 * Clear geocode cache
 */
export function clearGeocodeCache(): void {
  geocodeCache.clear();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('geocode_cache');
  }
}

/**
 * Get cache stats
 */
export function getGeocodeStats(): { cached: number } {
  return { cached: geocodeCache.size };
}
