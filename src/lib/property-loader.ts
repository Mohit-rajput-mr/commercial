// Utility to load properties from datasets for shareable links

interface PropertyIdParts {
  listingType: 'sale' | 'lease';
  location: string;
  index: number;
}

/**
 * Parse property ID from URL format: sale_Miami, FL_0 or lease_Houston, TX_5 or sale_miami_0
 */
export function parsePropertyId(propertyId: string): PropertyIdParts | null {
  try {
    // Decode URL-encoded characters first
    let decodedId = decodeURIComponent(propertyId);
    
    // Format: listingType_location_index
    const parts = decodedId.split('_');
    if (parts.length < 3) {
      console.error(`Invalid property ID format: ${propertyId} (decoded: ${decodedId})`);
      return null;
    }

    const listingType = parts[0].toLowerCase() as 'sale' | 'lease';
    if (listingType !== 'sale' && listingType !== 'lease') {
      console.error(`Invalid listing type: ${listingType}`);
      return null;
    }

    const index = parseInt(parts[parts.length - 1]);
    if (isNaN(index)) {
      console.error(`Invalid index: ${parts[parts.length - 1]}`);
      return null;
    }

    // Location is everything in between
    const locationParts = parts.slice(1, -1);
    const location = locationParts.join('_').replace(/%2C/g, ',').replace(/%20/g, ' ');

    console.log(`Parsed property ID: ${propertyId} -> listingType=${listingType}, location=${location}, index=${index}`);
    return { listingType, location, index };
  } catch (error) {
    console.error('Error parsing property ID:', error, propertyId);
    return null;
  }
}

/**
 * Load residential property from dataset
 */
export async function loadResidentialPropertyFromDataset(
  listingType: 'sale' | 'lease',
  location: string,
  index: number
): Promise<any | null> {
  try {
    // Map location to city name for file path
    const cityMap: Record<string, string> = {
      'miami, fl': 'miami',
      'miami': 'miami',
      'miami beach, fl': 'miami_beach',
      'miami beach': 'miami_beach',
      'houston, tx': 'houston',
      'houston': 'houston',
      'philadelphia, pa': 'philadelphia',
      'philadelphia': 'philadelphia',
      'phoenix, az': 'phoenix',
      'phoenix': 'phoenix',
      'san antonio, tx': 'san-antonio',
      'san antonio': 'san-antonio',
      'chicago, il': 'chicago',
      'chicago': 'chicago',
      'las vegas, nv': 'las_vegas',
      'las vegas': 'las_vegas',
      'los angeles, ca': 'losangeles',
      'los angeles': 'losangeles',
      'new york, ny': 'new_york',
      'new york': 'new_york',
      'manhattan, ny': 'new_york',
      'manhattan': 'new_york',
    };

    const locationLower = location.toLowerCase().trim();
    let cityName = cityMap[locationLower];
    
    // If not in map, extract city name from location
    if (!cityName) {
      cityName = locationLower.split(',')[0].trim().toLowerCase().replace(/\s+/g, '_');
    }

    // Try multiple file name formats
    const fileNames = [
      `${cityName}_${listingType}.json`,  // miami_sale.json (actual format)
      `dataset_${cityName}_${listingType}.json`,  // dataset_miami_sale.json (fallback)
      `${cityName}_${listingType === 'sale' ? 'sale' : 'rental'}.json`,  // miami_rental.json for lease
    ];

    for (const fileName of fileNames) {
      const filePath = `/residential/${listingType}/${fileName}`;
      
      try {
        const response = await fetch(filePath);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data[index] !== undefined) {
            console.log(`✅ Loaded property from ${filePath} at index ${index}`);
            return data[index];
          }
        }
      } catch (err) {
        // Try next file name format
        continue;
      }
    }

    console.error(`❌ Failed to load property: listingType=${listingType}, location=${location}, index=${index}`);
    console.error(`Tried file names: ${fileNames.join(', ')}`);
    return null;
  } catch (error) {
    console.error('Error loading residential property:', error);
    return null;
  }
}

/**
 * Load commercial property from dataset
 */
export async function loadCommercialPropertyFromDataset(propertyId: string): Promise<any | null> {
  try {
    // Commercial property IDs are typically like "crexi-1728502" or similar
    // We need to search through commercial datasets
    const commercialFiles = [
      'commercial/commercial_dataset_LA.json',
      'commercial/commercial_dataset_Chicago.json',
      'commercial/commercial_dataset_houston.json',
      'commercial/commercial_dataset_ny.json',
      'commercial/commercial_dataset_17nov2025.json',
      'commercial/dataset_lasvegas_lease.json',
      'commercial/dataset_las_vegas_sale.json',
    ];

    for (const file of commercialFiles) {
      try {
        const response = await fetch(`/${file}`);
        if (!response.ok) continue;

        const data = await response.json();
        if (!Array.isArray(data)) continue;

        // Search for property by ID
        const property = data.find((prop: any) => {
          const propId = prop.propertyId || prop.zpid || prop.id || '';
          return propId === propertyId || propId.toString() === propertyId;
        });

        if (property) {
          return property;
        }
      } catch (err) {
        console.warn(`Failed to load ${file}:`, err);
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error loading commercial property:', error);
    return null;
  }
}

