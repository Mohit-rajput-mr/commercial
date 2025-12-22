// Dataset loader - maps cities to their specific dataset files
// This ensures we load ONLY the correct properties for each searched city

import { CommercialProperty } from './us-real-estate-api';

// City to dataset file mapping
const CITY_DATASET_MAP: Record<string, string[]> = {
  // Los Angeles
  'los angeles': ['commercial_dataset_LA.json', 'dataset_los_angeles_sale.json', 'dataset_los_angeles_lease.json'],
  'la': ['commercial_dataset_LA.json', 'dataset_los_angeles_sale.json', 'dataset_los_angeles_lease.json'],
  'l.a.': ['commercial_dataset_LA.json', 'dataset_los_angeles_sale.json', 'dataset_los_angeles_lease.json'],
  
  // Chicago
  'chicago': ['commercial_dataset_Chicago.json'],
  
  // Houston
  'houston': ['commercial_dataset_houston.json'],
  
  // Las Vegas
  'las vegas': ['dataset_las_vegas_sale.json', 'dataset-las_vegas_lease.json'],
  'vegas': ['dataset_las_vegas_sale.json', 'dataset-las_vegas_lease.json'],
  
  // Austin
  'austin': ['dataset_austin_lease.json'],
  
  // San Francisco
  'san francisco': ['dataset_sanfrancisco_lease.json'],
  'sf': ['dataset_sanfrancisco_lease.json'],
  'san fran': ['dataset_sanfrancisco_lease.json'],
  
  // New York
  'new york': ['commercial_dataset_ny.json', 'dataset_manhattan_ny.json'],
  'new york city': ['commercial_dataset_ny.json', 'dataset_manhattan_ny.json'],
  'nyc': ['commercial_dataset_ny.json', 'dataset_manhattan_ny.json'],
  'manhattan': ['dataset_manhattan_ny.json', 'commercial_dataset_ny.json'],
  'brooklyn': ['commercial_dataset_ny.json'],
  
  // Miami - REMOVED: Use new residential/sale and residential/lease folders instead
  // 'miami': ['dataset_miami_sale.json', 'dataset_miami_beach.json', 'dataset_miamibeach_lease.json'],
  // 'miami beach': ['dataset_miami_beach.json', 'dataset_miamibeach_lease.json'],
  
  // Philadelphia - REMOVED: Use new residential/sale and residential/lease folders instead
  // 'philadelphia': ['dataset_philadelphia.json', 'dataset_philadelphia_sale.json'],
  // 'philly': ['dataset_philadelphia.json', 'dataset_philadelphia_sale.json'],
  
  // Phoenix - REMOVED: Use new residential/sale and residential/lease folders instead
  // 'phoenix': ['dataset_phoenix.json'],
  
  // San Antonio - REMOVED: Use new residential/sale and residential/lease folders instead
  // 'san antonio': ['dataset_san_antonio_sale.json', 'dataset_son_antonio_lease.json'],
};

// State abbreviation to full name mapping
const STATE_ABBREV: Record<string, string> = {
  'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas',
  'ca': 'california', 'co': 'colorado', 'ct': 'connecticut', 'de': 'delaware',
  'fl': 'florida', 'ga': 'georgia', 'hi': 'hawaii', 'id': 'idaho',
  'il': 'illinois', 'in': 'indiana', 'ia': 'iowa', 'ks': 'kansas',
  'ky': 'kentucky', 'la': 'louisiana', 'me': 'maine', 'md': 'maryland',
  'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota', 'ms': 'mississippi',
  'mo': 'missouri', 'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada',
  'nh': 'new hampshire', 'nj': 'new jersey', 'nm': 'new mexico', 'ny': 'new york',
  'nc': 'north carolina', 'nd': 'north dakota', 'oh': 'ohio', 'ok': 'oklahoma',
  'or': 'oregon', 'pa': 'pennsylvania', 'ri': 'rhode island', 'sc': 'south carolina',
  'sd': 'south dakota', 'tn': 'tennessee', 'tx': 'texas', 'ut': 'utah',
  'vt': 'vermont', 'va': 'virginia', 'wa': 'washington', 'wv': 'west virginia',
  'wi': 'wisconsin', 'wy': 'wyoming', 'dc': 'district of columbia'
};

/**
 * Parse a search location string into city and state
 */
export function parseLocation(searchLocation: string): { city: string; state: string } {
  const parts = searchLocation.toLowerCase().trim().split(',').map(p => p.trim());
  
  let city = parts[0] || '';
  let state = parts[1] || '';
  
  // Remove state abbreviation from city if present
  const stateAbbrevs = Object.keys(STATE_ABBREV);
  for (const abbrev of stateAbbrevs) {
    if (city.endsWith(` ${abbrev}`)) {
      state = abbrev;
      city = city.replace(new RegExp(` ${abbrev}$`), '');
      break;
    }
  }
  
  return { city, state };
}

/**
 * Get the dataset files for a given search location
 * NOTE: Residential cities (Miami, Miami Beach, Philadelphia, Phoenix, San Antonio) 
 * should use new residential/sale and residential/lease folders, NOT legacy datasets
 */
export function getDatasetFilesForLocation(searchLocation: string): string[] {
  const { city } = parseLocation(searchLocation);
  
  // Cities that use NEW residential dataset structure - return empty array
  const residentialCities = ['miami', 'miami beach', 'philadelphia', 'philly', 'phoenix', 'san antonio', 
                             'chicago', 'houston', 'las vegas', 'los angeles', 'la', 'new york', 'nyc'];
  if (residentialCities.includes(city)) {
    console.log(`⏭️ City "${city}" uses new residential dataset structure - skipping legacy datasets`);
    return []; // Return empty - use residential/sale and residential/lease folders instead
  }
  
  // Check exact match first
  if (CITY_DATASET_MAP[city]) {
    return CITY_DATASET_MAP[city];
  }
  
  // Check partial match
  for (const [key, files] of Object.entries(CITY_DATASET_MAP)) {
    if (city.includes(key) || key.includes(city)) {
      return files;
    }
  }
  
  // If no specific dataset, use the main combined dataset (only for commercial)
  return ['commercial_dataset_17nov2025.json'];
}

/**
 * Check if a property matches the searched location
 * Enhanced to handle multi-word cities like "Miami Beach" correctly
 */
export function propertyMatchesLocation(
  property: { city?: string; state?: string; address?: string | { streetAddress?: string } },
  searchLocation: string
): boolean {
  const { city: searchCity, state: searchState } = parseLocation(searchLocation);
  
  const propCity = (property.city || '').toLowerCase().trim();
  const propState = (property.state || '').toLowerCase().trim();
  
  // If we have a specific city search
  if (searchCity) {
    // Exact city match (case-insensitive)
    if (propCity === searchCity) return true;
    
    // CRITICAL: For multi-word cities, check if either contains the other as a complete phrase
    // e.g., "miami beach" should match "miami beach" but also handle variations
    // Check if searchCity is contained in propCity as a complete word/phrase
    if (propCity.includes(searchCity)) {
      // Additional check: ensure it's not a partial word match
      // e.g., "miami" should match "miami beach" but "miam" shouldn't
      const searchWords = searchCity.split(/\s+/);
      const propWords = propCity.split(/\s+/);
      
      // If searchCity is a single word, check if it matches the first word of propCity
      // This handles "miami" matching "miami beach"
      if (searchWords.length === 1 && propWords.length > 1) {
        if (propWords[0] === searchWords[0]) return true;
      }
      
      // If searchCity is multiple words, check if propCity starts with searchCity
      // This handles "miami beach" matching "miami beach"
      if (searchWords.length > 1) {
        if (propCity.startsWith(searchCity) || searchCity.startsWith(propCity)) return true;
      }
      
      // Fallback: simple includes check
      return true;
    }
    
    // Reverse check: propCity contains searchCity
    if (searchCity.includes(propCity)) {
      return true;
    }
  }
  
  // If we have a state search
  if (searchState) {
    const fullState = STATE_ABBREV[searchState] || searchState;
    if (propState === searchState || propState === fullState) {
      // If only state is specified, match any city in that state
      if (!searchCity) return true;
      // If city is also specified, we already checked city above
      // If city check passed, return true
      if (searchCity && (propCity === searchCity || propCity.includes(searchCity) || searchCity.includes(propCity))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Load properties from dataset files for a specific location
 */
export async function loadPropertiesForLocation(searchLocation: string): Promise<CommercialProperty[]> {
  const datasetFiles = getDatasetFilesForLocation(searchLocation);
  const allProperties: CommercialProperty[] = [];
  const seenIds = new Set<string>();
  
  // SKIP loading if no dataset files found (means city uses new residential dataset structure)
  if (datasetFiles.length === 0 || datasetFiles[0] === 'commercial_dataset_17nov2025.json') {
    console.log(`⏭️ Skipping legacy datasets for "${searchLocation}" - using new residential dataset structure`);
    return [];
  }
  
  console.log(`📂 Loading COMMERCIAL datasets for "${searchLocation}":`, datasetFiles);
  
  for (const file of datasetFiles) {
    try {
      const response = await fetch(`/${file}`);
      if (!response.ok) {
        console.warn(`⚠️ Could not load ${file}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`✅ Loaded ${file}: ${data.length} properties`);
      
      // Convert and filter properties
      for (let i = 0; i < data.length; i++) {
        const prop = data[i];
        
        // Detect dataset format: Manhattan dataset has addressCity, addressState fields
        const isManhattanFormat = prop.addressCity !== undefined || prop.addressState !== undefined;
        
        if (isManhattanFormat) {
          // Manhattan dataset format (residential/Zillow format)
          const propId = prop.zpid || `manhattan-${i}`;
          
          // Skip duplicates
          if (seenIds.has(propId)) continue;
          
          // Check if property matches the search location
          const propCity = (prop.addressCity || '').toLowerCase().trim();
          const propState = (prop.addressState || '').toLowerCase().trim();
          const { city: searchCity, state: searchState } = parseLocation(searchLocation);
          
          // Match Manhattan specifically or New York
          const matchesManhattan = searchCity === 'manhattan' || 
            searchCity === 'new york' || 
            searchCity === 'nyc' ||
            (propCity === 'new york' && (searchCity === 'manhattan' || searchCity === 'new york' || searchCity === 'nyc'));
          
          if (!matchesManhattan && searchCity && propCity !== searchCity) continue;
          if (searchState && propState !== searchState.toLowerCase()) continue;
          
          seenIds.add(propId);
          
          // Convert to CommercialProperty format (ONLY for commercial properties)
          // NOTE: This function should NOT be used for residential properties
          // Residential properties should use residential/sale and residential/lease folders
          allProperties.push({
            zpid: propId,
            address: prop.address || prop.addressStreet || '',
            city: prop.addressCity || 'New York',
            state: prop.addressState || 'NY',
            zipcode: prop.addressZipcode || '',
            price: 0, // Manhattan dataset doesn't have price
            propertyType: 'Commercial', // Changed from Residential - this loader is for commercial only
            propertyCategory: 'commercial',
            status: prop.listingType?.includes('Lease') ? 'For Lease' : 'For Sale', // Use actual listing type
            imgSrc: prop.imageSource || null,
            images: prop.photoUrls && prop.photoUrls.length > 0 
              ? prop.photoUrls 
              : (prop.imageSource ? [prop.imageSource] : []),
            description: '',
            bedrooms: 0,
            bathrooms: 0,
            livingArea: 0,
            lotSize: 0,
            yearBuilt: undefined,
            latitude: prop.latitude || undefined,
            longitude: prop.longitude || undefined,
            listingUrl: prop.detailUrl || undefined,
          } as CommercialProperty);
        } else {
          // Standard commercial dataset format
          const propId = prop.propertyId || `${file}-${i}`;
          
          // Skip duplicates
          if (seenIds.has(propId)) continue;
          
          // Check if property matches the search location
          if (!propertyMatchesLocation(prop, searchLocation)) continue;
          
          seenIds.add(propId);
          
          allProperties.push({
            zpid: propId,
            address: prop.address || '',
            city: prop.city || '',
            state: prop.state || '',
            zipcode: prop.zip || '',
            price: prop.priceNumeric || 0,
            propertyType: prop.propertyType || 'Commercial',
            status: prop.listingType?.includes('Lease') ? 'For Lease' : 'For Sale',
            imgSrc: prop.images?.[0] || null,
            images: prop.images || [],
            description: prop.description || '',
            bedrooms: prop.numberOfUnits || 0,
            bathrooms: 0,
            livingArea: prop.squareFootage ? parseInt(prop.squareFootage.replace(/,/g, '')) || 0 : 0,
            lotSize: 0,
            yearBuilt: undefined,
            latitude: undefined,
            longitude: undefined,
            listingUrl: prop.listingUrl || undefined,
          } as CommercialProperty);
        }
      }
    } catch (err) {
      console.error(`❌ Error loading ${file}:`, err);
    }
  }
  
  console.log(`📊 Total properties for "${searchLocation}": ${allProperties.length}`);
  return allProperties;
}

/**
 * Get all available cities from datasets
 */
export function getAvailableCities(): string[] {
  return Object.keys(CITY_DATASET_MAP).map(city => 
    city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
}



