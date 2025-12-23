// Utility to load properties from datasets for shareable links

interface PropertyIdParts {
  listingType: 'sale' | 'lease';
  location: string;
  bit: number;
}

/**
 * Parse property ID from URL format: sale_Miami, FL_123 or lease_Houston, TX_456 or sale_miami_789
 * Now uses 'bit' (unique property identifier) instead of array index
 */
export function parsePropertyId(propertyId: string): PropertyIdParts | null {
  try {
    // Decode URL-encoded characters first
    let decodedId = decodeURIComponent(propertyId);
    
    // Format: listingType_location_bit
    // The location may contain commas and spaces, so we need to parse from the ends
    
    // Find the last underscore followed by a number (the bit)
    const lastUnderscoreMatch = decodedId.match(/_(\d+)$/);
    if (!lastUnderscoreMatch) {
      console.error(`Invalid property ID format: ${propertyId} (decoded: ${decodedId}) - no bit found`);
      return null;
    }

    const bit = parseInt(lastUnderscoreMatch[1]);
    if (isNaN(bit) || bit <= 0) {
      console.error(`Invalid bit: ${lastUnderscoreMatch[1]}`);
      return null;
    }

    // Remove the bit part from the end
    const withoutBit = decodedId.slice(0, -lastUnderscoreMatch[0].length);
    
    // Find the first underscore (separates listingType from location)
    const firstUnderscoreIndex = withoutBit.indexOf('_');
    if (firstUnderscoreIndex === -1) {
      console.error(`Invalid property ID format: ${propertyId} (decoded: ${decodedId}) - no listing type found`);
      return null;
    }

    const listingType = withoutBit.slice(0, firstUnderscoreIndex).toLowerCase() as 'sale' | 'lease';
    if (listingType !== 'sale' && listingType !== 'lease') {
      console.error(`Invalid listing type: ${listingType}`);
      return null;
    }

    // Location is everything after the first underscore
    // This preserves commas, spaces, and any other characters in the location
    const location = withoutBit.slice(firstUnderscoreIndex + 1);

    console.log(`Parsed property ID: ${propertyId} -> listingType=${listingType}, location=${location}, bit=${bit}`);
    return { listingType, location, bit };
  } catch (error) {
    console.error('Error parsing property ID:', error, propertyId);
    return null;
  }
}

/**
 * Load residential property from dataset by bit number
 */
export async function loadResidentialPropertyFromDataset(
  listingType: 'sale' | 'lease',
  location: string,
  bit: number
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

    // Search all residential files if city-specific file doesn't have the property
    const allResidentialFiles = [
      ...fileNames.map(f => `/residential/${listingType}/${f}`),
      // Also check other cities in case bit is from a different file
      `/residential/${listingType}/miami_sale.json`,
      `/residential/${listingType}/miami_rental.json`,
      `/residential/${listingType}/miami_beach_sale.json`,
      `/residential/${listingType}/miami_beach_rental.json`,
      `/residential/${listingType}/chicago_sale.json`,
      `/residential/${listingType}/chicago_rental.json`,
      `/residential/${listingType}/houston_sale.json`,
      `/residential/${listingType}/houston_rental.json`,
      `/residential/${listingType}/philadelphia_sale.json`,
      `/residential/${listingType}/philadelphia_rental.json`,
      `/residential/${listingType}/phoenix_sale.json`,
      `/residential/${listingType}/phoenix_rental.json`,
      `/residential/${listingType}/san-antonio_sale.json`,
      `/residential/${listingType}/san_antonio_rental.json`,
      `/residential/${listingType}/las_vegas_sale.json`,
      `/residential/${listingType}/lasvegas_rental.json`,
      `/residential/${listingType}/losangeles_sale.json`,
      `/residential/${listingType}/losangeles_rental.json`,
      `/residential/${listingType}/new_york_sale.json`,
      `/residential/${listingType}/newyork_rental.json`,
    ];

    // Remove duplicates
    const uniqueFiles = [...new Set(allResidentialFiles)];

    for (const filePath of uniqueFiles) {
      try {
        const response = await fetch(filePath);
        if (response.ok) {
          const data = await response.json();
          const propertiesArray = Array.isArray(data) ? data : data.properties || [];
          
          // Search for property by bit number
          const property = propertiesArray.find((prop: any) => prop.bit === bit);
          
          if (property) {
            console.log(`✅ Loaded property from ${filePath} with bit ${bit}`);
            return property;
          }
        }
      } catch (err) {
        // Try next file
        continue;
      }
    }

    console.error(`❌ Failed to load property: listingType=${listingType}, location=${location}, bit=${bit}`);
    console.error(`Tried file names: ${fileNames.join(', ')}`);
    return null;
  } catch (error) {
    console.error('Error loading residential property:', error);
    return null;
  }
}

/**
 * Load commercial property from dataset by bit or property ID
 */
export async function loadCommercialPropertyFromDataset(propertyId: string): Promise<any | null> {
  try {
    // First, try to parse as bit-based ID (format: sale_Miami, FL_123 or lease_Houston, TX_456)
    // Note: This is for residential properties. Commercial uses 'com' field.
    const parsed = parsePropertyId(propertyId);
    if (parsed) {
      // This is a bit-based ID (residential), search all commercial files by com
      const commercialFiles = [
        'commercial/commercial_dataset_17nov2025.json',
        'commercial/commercial_dataset_Chicago.json',
        'commercial/commercial_dataset_houston.json',
        'commercial/commercial_dataset_LA.json',
        'commercial/commercial_dataset_ny.json',
        'commercial/commercial_dataset2.json',
        'commercial/dataset_manhattan_ny.json',
        'commercial/dataset_miami_beach.json',
        'commercial/dataset_miami_sale.json',
        'commercial/dataset_miamibeach_lease.json',
        'commercial/dataset_philadelphia_sale.json',
        'commercial/dataset_philadelphia.json',
        'commercial/dataset_phoenix.json',
        'commercial/dataset_san_antonio_sale.json',
        'commercial/dataset_son_antonio_lease.json',
        'commercial/dataset_las_vegas_sale.json',
        'commercial/dataset_lasvegas_lease.json',
        'commercial/dataset_austin_lease.json',
        'commercial/dataset_austin_sale.json',
        'commercial/dataset_los_angeles_lease.json',
        'commercial/dataset_los_angeles_sale.json',
        'commercial/dataset_sanfrancisco_lease.json',
        'commercial/dataset_sanfrancisco_sale.json',
        'miami_all_crexi_sale.json',
        'miami_all_crexi_lease.json',
      ];

      for (const filename of commercialFiles) {
        try {
          const response = await fetch(`/${filename}`);
          if (!response.ok) continue;

          const data = await response.json();
          const propertiesArray = Array.isArray(data) ? data : data.properties || [];

          // Search for property by com number (commercial uses 'com', not 'bit')
          const property = propertiesArray.find((prop: any) => prop.com === parsed.bit);
          
          if (property) {
            console.log(`✅ Loaded commercial property from ${filename} with com ${parsed.bit}`);
            return property;
          }
        } catch (err) {
          console.warn(`Failed to load /${filename}:`, err);
          continue;
        }
      }
    }

    // Fallback: Handle legacy property IDs (Crexi, propertyId, etc.)
    let searchId = propertyId;
    let isCrexiId = false;
    let crexiId: string | null = null;
    
    if (propertyId.startsWith('crexi-')) {
      isCrexiId = true;
      const parts = propertyId.split('-');
      if (parts.length >= 3) {
        crexiId = parts.slice(2).join('-'); // Extract the actual ID (e.g., "1897627")
        searchId = crexiId;
      }
    }

    // All commercial files to search
    const commercialFiles = [
      'commercial/commercial_dataset_17nov2025.json',
      'commercial/commercial_dataset_Chicago.json',
      'commercial/commercial_dataset_houston.json',
      'commercial/commercial_dataset_LA.json',
      'commercial/commercial_dataset_ny.json',
      'commercial/commercial_dataset2.json',
      'commercial/dataset_manhattan_ny.json',
      'commercial/dataset_miami_beach.json',
      'commercial/dataset_miami_sale.json',
      'commercial/dataset_miamibeach_lease.json',
      'commercial/dataset_philadelphia_sale.json',
      'commercial/dataset_philadelphia.json',
      'commercial/dataset_phoenix.json',
      'commercial/dataset_san_antonio_sale.json',
      'commercial/dataset_son_antonio_lease.json',
      'commercial/dataset_las_vegas_sale.json',
      'commercial/dataset_lasvegas_lease.json',
      'commercial/dataset_austin_lease.json',
      'commercial/dataset_austin_sale.json',
      'commercial/dataset_los_angeles_lease.json',
      'commercial/dataset_los_angeles_sale.json',
      'commercial/dataset_sanfrancisco_lease.json',
      'commercial/dataset_sanfrancisco_sale.json',
    ];

    // Crexi files (in root public folder)
    const crexiFiles = [
      'miami_all_crexi_sale.json',
      'miami_all_crexi_lease.json',
    ];

    // Search through commercial files
    for (const filename of commercialFiles) {
      try {
        const response = await fetch(`/${filename}`);
        if (!response.ok) continue;

        const data = await response.json();
        const propertiesArray = Array.isArray(data) ? data : data.properties || [];

        // Search for property by ID
        const property = propertiesArray.find((prop: any) => {
          const propId = prop.propertyId || prop.zpid || prop.id || '';
          const idString = propId.toString();
          
          // Match exact ID
          if (idString === propertyId || idString === searchId) {
            return true;
          }
          
          // Match Crexi format variations
          if (isCrexiId && crexiId) {
            if (idString === crexiId || 
                idString === `crexi-sale-${crexiId}` ||
                idString === `crexi-lease-${crexiId}` ||
                (prop.id && prop.id.toString() === crexiId)) {
              return true;
            }
          }
          
          return false;
        });

        if (property) {
          return property;
        }
      } catch (err) {
        console.warn(`Failed to load /${filename}:`, err);
        continue;
      }
    }

    // Search through Crexi files if it's a Crexi ID
    if (isCrexiId && crexiId) {
      for (const filename of crexiFiles) {
        try {
          const response = await fetch(`/${filename}`);
          if (!response.ok) continue;

          const data = await response.json();
          const propertiesArray = Array.isArray(data) ? data : data.properties || [];

          // Search for property by Crexi ID
          const property = propertiesArray.find((prop: any) => {
            const propId = prop.id || prop.propertyId || '';
            return propId.toString() === crexiId || 
                   propId.toString() === crexiId?.toString();
          });

          if (property) {
            return property;
          }
        } catch (err) {
          console.warn(`Failed to load /${filename}:`, err);
          continue;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error loading commercial property:', error);
    return null;
  }
}

/**
 * Load commercial property from dataset by com number
 */
export async function loadCommercialPropertyByCom(com: number): Promise<any | null> {
  try {
    const commercialFiles = [
      'commercial/commercial_dataset_17nov2025.json',
      'commercial/commercial_dataset_Chicago.json',
      'commercial/commercial_dataset_houston.json',
      'commercial/commercial_dataset_LA.json',
      'commercial/commercial_dataset_ny.json',
      'commercial/commercial_dataset2.json',
      'commercial/dataset_manhattan_ny.json',
      'commercial/dataset_miami_beach.json',
      'commercial/dataset_miami_sale.json',
      'commercial/dataset_miamibeach_lease.json',
      'commercial/dataset_philadelphia_sale.json',
      'commercial/dataset_philadelphia.json',
      'commercial/dataset_phoenix.json',
      'commercial/dataset_san_antonio_sale.json',
      'commercial/dataset_son_antonio_lease.json',
      'commercial/dataset_las_vegas_sale.json',
      'commercial/dataset_lasvegas_lease.json',
      'commercial/dataset_austin_lease.json',
      'commercial/dataset_austin_sale.json',
      'commercial/dataset_los_angeles_lease.json',
      'commercial/dataset_los_angeles_sale.json',
      'commercial/dataset_sanfrancisco_lease.json',
      'commercial/dataset_sanfrancisco_sale.json',
      'miami_all_crexi_sale.json',
      'miami_all_crexi_lease.json',
    ];

    for (const filename of commercialFiles) {
      try {
        const filePath = filename.startsWith('miami_all_crexi') 
          ? `/${filename}` 
          : `/${filename}`;
        
        const response = await fetch(filePath);
        if (!response.ok) continue;

        const data = await response.json();
        const propertiesArray = Array.isArray(data) ? data : data.properties || [];
        
          // Search for property by com number
          const property = propertiesArray.find((prop: any) => prop.com === com);
          
          if (property) {
            console.log(`✅ Loaded commercial property by com ${com} from ${filename}`);
            return property;
          }
      } catch (err) {
        console.warn(`Failed to load /${filename}:`, err);
        continue;
      }
    }

    console.error(`❌ Failed to load commercial property with com ${com}`);
    return null;
  } catch (error) {
    console.error('Error loading commercial property by com:', error);
    return null;
  }
}

