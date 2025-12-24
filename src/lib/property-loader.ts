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
    if (isNaN(bit) || bit < 0) {
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
 * Searches ALL residential files to ensure shareable links work
 */
export async function loadResidentialPropertyFromDataset(
  listingType: 'sale' | 'lease',
  location: string,
  bit: number
): Promise<any | null> {
  try {
    // Get ALL residential files from both sale and lease folders
    // This ensures we find the property regardless of which file it's in
    const allResidentialFiles = [
      // Sale files
      '/residential/sale/miami_sale.json',
      '/residential/sale/miami_beach_sale.json',
      '/residential/sale/chicago_sale.json',
      '/residential/sale/houston_sale.json',
      '/residential/sale/philadelphia_rental.json', // Note: philadelphia uses rental for both
      '/residential/sale/phoenix_rental.json', // Note: phoenix uses rental for both
      '/residential/sale/san-antonio_sale.json',
      '/residential/sale/las_vegas_sale.json',
      '/residential/sale/losangeles_sale.json',
      '/residential/sale/new_york_sale.json',
      // Lease files
      '/residential/lease/miami_rental.json',
      '/residential/lease/miami_beach_rental.json',
      '/residential/lease/chicago_rental.json',
      '/residential/lease/houston_rental.json',
      '/residential/lease/philadelphia_rental.json',
      '/residential/lease/phoenix_rental.json',
      '/residential/lease/san_antonio_rental.json',
      '/residential/lease/lasvegas_rental.json',
      '/residential/lease/losangeles_rental.json',
      '/residential/lease/newyork_rental.json',
    ];

    // If location is provided, prioritize files that match the location
    const locationLower = location.toLowerCase().trim();
    let prioritizedFiles = [...allResidentialFiles];
    
    // Try to prioritize based on location hint
    if (locationLower.includes('miami')) {
      prioritizedFiles = [
        '/residential/sale/miami_sale.json',
        '/residential/lease/miami_rental.json',
        '/residential/sale/miami_beach_sale.json',
        '/residential/lease/miami_beach_rental.json',
        ...allResidentialFiles.filter(f => !f.includes('miami'))
      ];
    } else if (locationLower.includes('chicago')) {
      prioritizedFiles = [
        '/residential/sale/chicago_sale.json',
        '/residential/lease/chicago_rental.json',
        ...allResidentialFiles.filter(f => !f.includes('chicago'))
      ];
    } else if (locationLower.includes('houston')) {
      prioritizedFiles = [
        '/residential/sale/houston_sale.json',
        '/residential/lease/houston_rental.json',
        ...allResidentialFiles.filter(f => !f.includes('houston'))
      ];
    } else if (locationLower.includes('philadelphia') || locationLower.includes('philly')) {
      prioritizedFiles = [
        '/residential/sale/philadelphia_rental.json',
        '/residential/lease/philadelphia_rental.json',
        ...allResidentialFiles.filter(f => !f.includes('philadelphia'))
      ];
    } else if (locationLower.includes('phoenix')) {
      prioritizedFiles = [
        '/residential/sale/phoenix_rental.json',
        '/residential/lease/phoenix_rental.json',
        ...allResidentialFiles.filter(f => !f.includes('phoenix'))
      ];
    } else if (locationLower.includes('san antonio')) {
      prioritizedFiles = [
        '/residential/sale/san-antonio_sale.json',
        '/residential/lease/san_antonio_rental.json',
        ...allResidentialFiles.filter(f => !f.includes('san'))
      ];
    } else if (locationLower.includes('las vegas') || locationLower.includes('vegas')) {
      prioritizedFiles = [
        '/residential/sale/las_vegas_sale.json',
        '/residential/lease/lasvegas_rental.json',
        ...allResidentialFiles.filter(f => !f.includes('las') && !f.includes('vegas'))
      ];
    } else if (locationLower.includes('los angeles') || locationLower.includes('la')) {
      prioritizedFiles = [
        '/residential/sale/losangeles_sale.json',
        '/residential/lease/losangeles_rental.json',
        ...allResidentialFiles.filter(f => !f.includes('los'))
      ];
    } else if (locationLower.includes('new york') || locationLower.includes('nyc') || locationLower.includes('manhattan')) {
      prioritizedFiles = [
        '/residential/sale/new_york_sale.json',
        '/residential/lease/newyork_rental.json',
        ...allResidentialFiles.filter(f => !f.includes('new') && !f.includes('york'))
      ];
    }

    // Remove duplicates while preserving order
    const uniqueFiles = Array.from(new Set(prioritizedFiles));

    // Search through all files
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
    return null;
  } catch (error) {
    console.error('Error loading residential property:', error);
    return null;
  }
}

/**
 * Load residential property by bit number only (searches all files)
 * Used when we only have the bit number from URL
 */
export async function loadResidentialPropertyByBit(bit: number): Promise<any | null> {
  try {
    // Get ALL residential files from both sale and lease folders
    const allResidentialFiles = [
      // Sale files
      '/residential/sale/miami_sale.json',
      '/residential/sale/miami_beach_sale.json',
      '/residential/sale/chicago_sale.json',
      '/residential/sale/houston_sale.json',
      '/residential/sale/philadelphia_rental.json',
      '/residential/sale/phoenix_rental.json',
      '/residential/sale/san-antonio_sale.json',
      '/residential/sale/las_vegas_sale.json',
      '/residential/sale/losangeles_sale.json',
      '/residential/sale/new_york_sale.json',
      // Lease files
      '/residential/lease/miami_rental.json',
      '/residential/lease/miami_beach_rental.json',
      '/residential/lease/chicago_rental.json',
      '/residential/lease/houston_rental.json',
      '/residential/lease/philadelphia_rental.json',
      '/residential/lease/phoenix_rental.json',
      '/residential/lease/san_antonio_rental.json',
      '/residential/lease/lasvegas_rental.json',
      '/residential/lease/losangeles_rental.json',
      '/residential/lease/newyork_rental.json',
    ];

    // Search through all files
    for (const filePath of allResidentialFiles) {
      try {
        const response = await fetch(filePath);
        if (response.ok) {
          const data = await response.json();
          const propertiesArray = Array.isArray(data) ? data : data.properties || [];
          
          // Search for property by bit number
          const property = propertiesArray.find((prop: any) => prop.bit === bit);
          
          if (property) {
            console.log(`✅ Loaded residential property from ${filePath} with bit ${bit}`);
            return property;
          }
        }
      } catch (err) {
        // Try next file
        continue;
      }
    }

    console.error(`❌ Failed to load residential property with bit ${bit}`);
    return null;
  } catch (error) {
    console.error('Error loading residential property by bit:', error);
    return null;
  }
}

/**
 * Load commercial property from dataset by bit or property ID
 */
export async function loadCommercialPropertyFromDataset(propertyId: string): Promise<any | null> {
  try {
    // Check if this is a Crexi ID or other commercial ID format
    // parsePropertyId is only for residential property IDs (format: sale_Miami, FL_123)
    const isCrexiId = propertyId.startsWith('crexi-');
    const isCommercialId = !propertyId.includes('_') || isCrexiId; // Commercial IDs don't have underscore format
    
    // Only try parsePropertyId for residential-style IDs (has underscore and doesn't start with crexi-)
    if (!isCommercialId) {
      const parsed = parsePropertyId(propertyId);
      if (parsed) {
        // This is a residential-style ID, but we're in commercial loader
        // Skip this - it's not a commercial property
        console.log(`⚠️ Skipping residential-style ID in commercial loader: ${propertyId}`);
      }
    }

    // Handle Crexi IDs and other commercial property IDs
    let searchId = propertyId;
    let crexiId: string | null = null;
    
    if (isCrexiId) {
      // Handle different Crexi formats:
      // - "crexi-1408852" -> "1408852"
      // - "crexi-sale-1897627" -> "1897627"
      // - "crexi-lease-1897627" -> "1897627"
      if (propertyId.startsWith('crexi-sale-')) {
        crexiId = propertyId.replace(/^crexi-sale-/, '');
      } else if (propertyId.startsWith('crexi-lease-')) {
        crexiId = propertyId.replace(/^crexi-lease-/, '');
      } else {
        // Standard crexi- format
        crexiId = propertyId.replace(/^crexi-/, '');
      }
      searchId = crexiId;
      console.log(`🔍 Parsed Crexi ID: ${propertyId} -> ${crexiId}`);
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
    console.log(`🔍 Searching ${commercialFiles.length} commercial files for propertyId: "${propertyId}", searchId: "${searchId}"`);
    
    for (const filename of commercialFiles) {
      try {
        const filePath = `/${filename}`;
        const response = await fetch(filePath);
        if (!response.ok) {
          console.warn(`⚠️ Failed to fetch ${filePath}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const propertiesArray = Array.isArray(data) ? data : data.properties || [];

        // Search for property by ID
        const property = propertiesArray.find((prop: any) => {
          const propId = prop.propertyId || prop.zpid || prop.id || '';
          const idString = propId.toString();
          
          // Match exact ID (most common case)
          if (idString === propertyId || idString === searchId) {
            return true;
          }
          
          // Match Crexi format variations
          if (isCrexiId && crexiId) {
            // For crexi-1408852 or crexi-sale-1897627, match prop.id === extracted ID
            if (prop.id && prop.id.toString() === crexiId) {
              return true;
            }
            // Match numeric ID directly
            if (idString === crexiId) {
              return true;
            }
            // Match various Crexi format variations
            if (idString === `crexi-${crexiId}` ||
                idString === `crexi-sale-${crexiId}` ||
                idString === `crexi-lease-${crexiId}` ||
                idString === propertyId) {
              return true;
            }
            // Also check if propertyId field matches
            if (prop.propertyId && prop.propertyId.toString() === propertyId) {
              return true;
            }
          }
          
          return false;
        });

        if (property) {
          console.log(`✅ Found property "${propertyId}" in ${filename}`);
          return property;
        }
      } catch (err) {
        console.warn(`❌ Error loading ${filename}:`, err);
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
            // Transform Crexi property to standard format
            const location = property.locations?.[0] || property.location || {};
            
            // Helper to extract state string from object or string
            const extractState = (state: any): string => {
              if (!state) return '';
              if (typeof state === 'string') return state;
              if (typeof state === 'object') {
                return state.code || state.name || '';
              }
              return '';
            };
            
            // Extract images from Crexi media array - handle multiple formats
            let extractedImages: string[] = [];
            if (property.media && Array.isArray(property.media)) {
              // Try different Crexi media formats
              extractedImages = property.media
                .filter((m: any) => {
                  // Filter for Image type and check for URL fields
                  if (m.type === 'Image' || m.type === 'image') {
                    return m.imageUrl || m.url || m.src;
                  }
                  // Also include if it has a URL field (some formats)
                  return m.url || m.imageUrl || m.src;
                })
                .map((m: any) => m.imageUrl || m.url || m.src)
                .filter((url: any): url is string => typeof url === 'string' && url.startsWith('http'));
            }
            
            // Fallback to thumbnailUrl or existing images array
            if (extractedImages.length === 0) {
              if (property.thumbnailUrl) {
                extractedImages = [property.thumbnailUrl];
              } else if (property.images && Array.isArray(property.images)) {
                extractedImages = property.images.filter((img: any) => typeof img === 'string' && img.startsWith('http'));
              }
            }
            
            return {
              ...property,
              propertyId: property.id ? `crexi-${property.id}` : property.propertyId,
              address: location.address || property.address || '',
              city: location.city || property.city || '',
              state: extractState(location.state) || extractState(property.state) || '',
              zip: location.zip || property.zip || '',
              price: property.askingPrice ? `$${property.askingPrice.toLocaleString()}` : property.price || null,
              priceNumeric: property.askingPrice || property.priceNumeric || null,
              squareFootage: property.squareFootage || property.rentableSqftMin || property.rentableSqftMax || null,
              images: extractedImages,
              listingType: property.listingType || 'For Sale',
              propertyType: property.types?.[0] || property.propertyType || 'Commercial',
              brokerCompany: property.brokerageName || property.brokerCompany || null,
            };
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
 * Load commercial property by bit number (searches all files)
 * Commercial properties can also have bit numbers for consistency
 */
export async function loadCommercialPropertyByBit(bit: number): Promise<any | null> {
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
        
        // Search for property by bit number
        const property = propertiesArray.find((prop: any) => prop.bit === bit);
        
        if (property) {
          console.log(`✅ Loaded commercial property by bit ${bit} from ${filename}`);
          return property;
        }
      } catch (err) {
        console.warn(`Failed to load /${filename}:`, err);
        continue;
      }
    }

    console.error(`❌ Failed to load commercial property with bit ${bit}`);
    return null;
  } catch (error) {
    console.error('Error loading commercial property by bit:', error);
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

