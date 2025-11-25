// Dataset loader - maps cities to their specific dataset files
// This ensures we load ONLY the correct properties for each searched city

import { CommercialProperty } from './us-real-estate-api';

// City to dataset file mapping
const CITY_DATASET_MAP: Record<string, string[]> = {
  // Los Angeles
  'los angeles': ['commercial_dataset_LA.json'],
  'la': ['commercial_dataset_LA.json'],
  'l.a.': ['commercial_dataset_LA.json'],
  
  // Chicago
  'chicago': ['commercial_dataset_Chicago.json'],
  
  // Houston
  'houston': ['commercial_dataset_houston.json'],
  
  // New York
  'new york': ['commercial_dataset_ny.json'],
  'new york city': ['commercial_dataset_ny.json'],
  'nyc': ['commercial_dataset_ny.json'],
  'manhattan': ['commercial_dataset_ny.json'],
  'brooklyn': ['commercial_dataset_ny.json'],
  
  // Miami
  'miami': ['dataset_miami_sale.json', 'dataset_miami_beach.json', 'dataset_miamibeach_lease.json'],
  'miami beach': ['dataset_miami_beach.json', 'dataset_miamibeach_lease.json'],
  
  // Philadelphia
  'philadelphia': ['dataset_philadelphia.json', 'dataset_philadelphia_sale.json'],
  'philly': ['dataset_philadelphia.json', 'dataset_philadelphia_sale.json'],
  
  // Phoenix
  'phoenix': ['dataset_phoenix.json'],
  
  // San Antonio
  'san antonio': ['dataset_san_antonio_sale.json', 'dataset_son_antonio_lease.json'],
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
 */
export function getDatasetFilesForLocation(searchLocation: string): string[] {
  const { city } = parseLocation(searchLocation);
  
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
  
  // If no specific dataset, use the main combined dataset
  return ['commercial_dataset_17nov2025.json'];
}

/**
 * Check if a property matches the searched location
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
    // Exact city match
    if (propCity === searchCity) return true;
    
    // Partial city match (e.g., "Miami Beach" contains "Miami")
    if (propCity.includes(searchCity) || searchCity.includes(propCity)) return true;
  }
  
  // If we have a state search
  if (searchState) {
    const fullState = STATE_ABBREV[searchState] || searchState;
    if (propState === searchState || propState === fullState) {
      // If only state is specified, match any city in that state
      if (!searchCity) return true;
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
  
  console.log(`📂 Loading datasets for "${searchLocation}":`, datasetFiles);
  
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



