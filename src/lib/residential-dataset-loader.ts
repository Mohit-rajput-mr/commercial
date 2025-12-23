/**
 * Residential Dataset Loader
 * Functions to load residential properties from JSON datasets
 */

import { APIProperty } from './property-api';
import { getResidentialFilePath } from './dataset-mapping';

/**
 * Load residential properties for a city and listing type
 */
export async function loadResidentialProperties(
  city: string,
  listingType: 'sale' | 'lease'
): Promise<APIProperty[]> {
  try {
    const filePath = getResidentialFilePath(city, listingType);
    
    if (!filePath) {
      console.warn(`No file path found for city: ${city}, listingType: ${listingType}`);
      return [];
    }

    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to load properties: ${response.statusText}`);
    }

    const data = await response.json();
    const propertiesArray: any[] = Array.isArray(data) ? data : data.properties || [];
    
    // Transform to APIProperty format
    return propertiesArray.map((prop, index) => ({
      zpid: prop.zpid || `prop-${index}`,
      address: typeof prop.address === 'string' 
        ? prop.address 
        : prop.address?.street || '',
      city: prop.city || prop.address?.locality || city,
      state: prop.state || prop.address?.region || '',
      zipcode: prop.zipcode || prop.address?.postalCode || '',
      price: prop.listPrice || prop.price || null,
      beds: prop.beds || prop.bedrooms || null,
      baths: prop.baths || prop.bathrooms || null,
      squareFootage: prop.squareFootage || prop.sqft || null,
      propertyType: prop.propertyType || 'Residential',
      status: listingType === 'lease' ? 'For Rent' : 'For Sale',
      imgSrc: prop.imgSrc || prop.photos?.[0] || prop.images?.[0] || null,
      latitude: prop.latitude || prop.coordinates?.latitude || null,
      longitude: prop.longitude || prop.coordinates?.longitude || null,
    } as APIProperty));
  } catch (error) {
    console.error(`Error loading residential properties for ${city} (${listingType}):`, error);
    return [];
  }
}

/**
 * Search residential properties by location
 */
export async function searchResidentialProperties(
  locationQuery: string,
  listingType: 'sale' | 'lease' = 'sale'
): Promise<APIProperty[]> {
  // Normalize location query
  const normalized = locationQuery.toLowerCase().trim();
  
  // Try to match known cities
  const knownCities = ['miami', 'miami beach', 'new york', 'los angeles', 'las vegas', 
                       'chicago', 'houston', 'philadelphia', 'phoenix', 'san antonio'];
  
  for (const city of knownCities) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return loadResidentialProperties(city, listingType);
    }
  }
  
  // If no match, return empty array
  return [];
}

/**
 * Get residential property by ID
 */
export async function getResidentialPropertyById(id: string): Promise<APIProperty | null> {
  // This would need to search across all residential datasets
  // For now, return null - this can be implemented if needed
  console.warn('getResidentialPropertyById not fully implemented');
  return null;
}
