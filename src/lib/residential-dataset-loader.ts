/**
 * Residential Dataset Loader
 * Loads residential properties from public/residential/sale and public/residential/lease folders
 */

import { APIProperty } from './property-api';

interface ResidentialDatasetProperty {
  address: {
    street: string;
    locality: string;
    region: string;
    postalCode: string;
  };
  state?: string; // NEW: Top-level state field ("Lease" or "Sale")
  beds?: number | null;
  baths?: number | null;
  baths_consolidated?: string | null;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  price?: number | null;
  listPrice?: number | null;
  list_price?: number | null;
  sqft?: number | null;
  livingArea?: number | null;
  photos?: Array<{
    href: string;
    type?: string;
    [key: string]: any;
  }>;
  primary_photo?: {
    href: string;
  };
  property_id?: string;
  id?: string;
  details?: Array<{
    category: string;
    text: string[];
  }>;
  history?: Array<{
    price: number;
    event_name: string;
    date: string;
  }>;
  [key: string]: any;
}

// Map city names to file names (matching actual file names in public/residential folders)
const CITY_FILE_MAP: { [key: string]: { sale: string; lease: string } } = {
  'chicago': { sale: 'chicago_sale.json', lease: 'chicago_rental.json' },
  'houston': { sale: 'houston_sale.json', lease: 'houston_rental.json' },
  'las vegas': { sale: 'las_vegas_sale.json', lease: 'losangeles_rental.json' }, // Note: lease file is losangeles_rental.json (no las vegas lease file)
  'los angeles': { sale: 'las_vegas_sale.json', lease: 'losangeles_rental.json' }, // Note: sale file is las_vegas_sale.json (no los angeles sale file)
  'la': { sale: 'las_vegas_sale.json', lease: 'losangeles_rental.json' },
  'miami': { sale: 'miami_sale.json', lease: 'miami_rental.json' },
  'miami beach': { sale: 'miami_beach_sale.json', lease: 'miami_beach_rental.json' },
  'new york': { sale: 'new_york_sale.json', lease: 'newyork_rental.json' },
  'nyc': { sale: 'new_york_sale.json', lease: 'newyork_rental.json' },
  'new york city': { sale: 'new_york_sale.json', lease: 'newyork_rental.json' },
  'philadelphia': { sale: 'philadelphia_sale.json', lease: 'philadelphia_rental.json' },
  'phoenix': { sale: 'phoenix_sale.json', lease: 'phoenix_rental.json' },
  'san antonio': { sale: 'san-antonio_sale.json', lease: 'san_antonio_rental.json' },
};

/**
 * Normalize city name for file lookup
 */
function normalizeCityName(city: string): string {
  return city.toLowerCase().trim();
}

/**
 * Get file paths for a city
 * Prioritizes exact matches and longer city names (e.g., "miami beach" before "miami")
 */
function getCityFiles(city: string): { sale: string | null; lease: string | null } {
  const normalized = normalizeCityName(city);
  
  // Try exact match first
  if (CITY_FILE_MAP[normalized]) {
    // CRITICAL: Construct file paths explicitly - sale files go to /residential/sale/, lease files go to /residential/lease/
    const salePath = `/residential/sale/${CITY_FILE_MAP[normalized].sale}`;
    const leasePath = `/residential/lease/${CITY_FILE_MAP[normalized].lease}`;
    
    // For Miami Beach, verify exact paths
    if (normalized === 'miami beach') {
      if (salePath !== '/residential/sale/miami_beach_sale.json') {
        console.error(`❌ CRITICAL: Miami Beach sale path mismatch: ${salePath}`);
      }
      if (leasePath !== '/residential/lease/miami_beach_rental.json') {
        console.error(`❌ CRITICAL: Miami Beach lease path mismatch: ${leasePath}`);
      }
    }
    
    return {
      sale: salePath,
      lease: leasePath,
    };
  }
  
  // Sort city keys by length (longest first) to prioritize specific matches
  // e.g., "miami beach" should match before "miami"
  const sortedCityKeys = Object.keys(CITY_FILE_MAP).sort((a, b) => b.length - a.length);
  
  // Try exact substring match with longer cities first
  for (const key of sortedCityKeys) {
    // Check if the normalized city exactly contains the key (exact match)
    if (normalized === key || normalized.startsWith(key + ' ') || normalized.endsWith(' ' + key) || normalized.includes(' ' + key + ' ')) {
      return {
        sale: `/residential/sale/${CITY_FILE_MAP[key].sale}`,
        lease: `/residential/lease/${CITY_FILE_MAP[key].lease}`,
      };
    }
  }
  
  // Try partial match as fallback (e.g., "chicago il" -> "chicago")
  for (const key of sortedCityKeys) {
    const firstWord = normalized.split(' ')[0];
    if (key.includes(firstWord) || firstWord.includes(key.split(' ')[0])) {
      return {
        sale: `/residential/sale/${CITY_FILE_MAP[key].sale}`,
        lease: `/residential/lease/${CITY_FILE_MAP[key].lease}`,
      };
    }
  }
  
  return { sale: null, lease: null };
}

/**
 * Convert residential dataset property to APIProperty format
 */
function convertToAPIProperty(
  item: ResidentialDatasetProperty,
  listingType: 'sale' | 'lease'
): APIProperty {
  // Extract address components
  const street = item.address?.street || '';
  const city = item.address?.locality || '';
  const state = item.address?.region || '';
  const zipcode = item.address?.postalCode || '';
  
  // Get price - prefer listPrice, then list_price, then price, then from history
  let price: number | undefined;
  if (item.listPrice) {
    price = item.listPrice;
  } else if (item.list_price) {
    price = item.list_price;
  } else if (item.price) {
    price = item.price;
  } else if (item.history && item.history.length > 0) {
    // Get latest listing price from history
    const latestListing = item.history
      .filter(h => h.event_name?.toLowerCase().includes('list') && h.price > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (latestListing) {
      price = latestListing.price;
    }
  }
  
  // Get images
  const images: string[] = [];
  if (item.primary_photo?.href) {
    images.push(item.primary_photo.href);
  }
  if (item.photos && Array.isArray(item.photos)) {
    item.photos.forEach(photo => {
      if (photo.href && !images.includes(photo.href)) {
        images.push(photo.href);
      }
    });
  }
  
  // Get square footage
  const sqft = item.sqft || item.livingArea || undefined;
  
  // Get property ID - use id field (it's the main identifier)
  const propertyId = item.id || item.property_id || `res-${Math.random().toString(36).substr(2, 9)}`;
  
  // Extract description from details
  let description = '';
  if (item.details && Array.isArray(item.details)) {
    const descriptionParts: string[] = [];
    item.details.forEach(detail => {
      if (detail.text && Array.isArray(detail.text)) {
        descriptionParts.push(...detail.text);
      }
    });
    description = descriptionParts.join('. ');
  }
  
  // Extract additional fields from details
  let yearBuilt: number | undefined;
  let lotSize: number | undefined;
  let propertySubtype: string | undefined;
  let hoaFees: number | undefined;
  let hoaFrequency: string | undefined;
  let parkingFeatures: string | undefined;
  let heatingFeatures: string | undefined;
  let coolingFeatures: string | undefined;
  let yearBuiltText: string | undefined;
  
  if (item.details && Array.isArray(item.details)) {
    item.details.forEach(detail => {
      if (detail.text && Array.isArray(detail.text)) {
        detail.text.forEach(text => {
          // Extract year built
          const yearMatch = text.match(/Year Built:\s*(\d{4})/i);
          if (yearMatch) {
            yearBuilt = parseInt(yearMatch[1]);
            yearBuiltText = yearMatch[1];
          }
          
          // Extract lot size
          const lotMatch = text.match(/Lot Size[^:]*:\s*([\d,]+)\s*(sqft|sq\.?\s*ft|acres?|ac)/i);
          if (lotMatch) {
            const lotValue = parseFloat(lotMatch[1].replace(/,/g, ''));
            if (lotMatch[2].toLowerCase().includes('ac')) {
              // Convert acres to sqft (1 acre = 43,560 sqft)
              lotSize = Math.round(lotValue * 43560);
            } else {
              lotSize = Math.round(lotValue);
            }
          }
          
          // Extract property subtype
          const subtypeMatch = text.match(/Property Subtype:\s*(.+)/i);
          if (subtypeMatch) {
            propertySubtype = subtypeMatch[1].trim();
          }
          
          // Extract HOA fees
          const hoaMatch = text.match(/Association Fee:\s*([\d,]+)/i);
          if (hoaMatch) {
            hoaFees = parseFloat(hoaMatch[1].replace(/,/g, ''));
          }
          
          const hoaFreqMatch = text.match(/Association Fee Frequency:\s*(.+)/i);
          if (hoaFreqMatch) {
            hoaFrequency = hoaFreqMatch[1].trim();
          }
          
          // Extract parking
          const parkingMatch = text.match(/Parking Features:\s*(.+)/i);
          if (parkingMatch) {
            parkingFeatures = parkingMatch[1].trim();
          }
          
          // Extract heating
          const heatingMatch = text.match(/Heating Features:\s*(.+)/i);
          if (heatingMatch) {
            heatingFeatures = heatingMatch[1].trim();
          }
          
          // Extract cooling
          const coolingMatch = text.match(/Cooling Features:\s*(.+)/i);
          if (coolingMatch) {
            coolingFeatures = coolingMatch[1].trim();
          }
        });
      }
    });
  }
  
  // Get property type from details or default
  let propertyType = 'Residential';
  if (propertySubtype) {
    propertyType = propertySubtype;
  } else if (item.details) {
    const typeDetail = item.details.find(d => 
      d.category === 'Other Property Info' && 
      d.text?.some(t => t.includes('Property Subtype:'))
    );
    if (typeDetail) {
      const typeMatch = typeDetail.text?.find(t => t.includes('Property Subtype:'))?.match(/Property Subtype:\s*(.+)/i);
      if (typeMatch) {
        propertyType = typeMatch[1].trim();
      }
    }
  }
  
  // CRITICAL: Status MUST match listingType - this is the source of truth
  // If listingType is 'lease', status MUST be 'For Rent'
  // If listingType is 'sale', status MUST be 'For Sale'
  const propertyStatus = listingType === 'lease' ? 'For Rent' : 'For Sale';
  
  // CRITICAL: Read state field from raw data (NEW field: "Lease" or "Sale")
  // This field is at the top level of each property object, right after address
  // Use the state field from JSON if available, otherwise derive from listingType
  const propertyState = item.state || (listingType === 'lease' ? 'Lease' : 'Sale');
  
  // Ensure price is always a number (default to 0 if undefined)
  const finalPrice: number = price !== undefined && price !== null ? price : 0;
  
  return {
    zpid: propertyId,
    address: street,
    city: city,
    state: state, // US state (FL, CA, etc.)
    zipcode: zipcode,
    price: finalPrice,
    bedrooms: item.beds || undefined,
    bathrooms: item.baths || (item.baths_consolidated ? parseFloat(item.baths_consolidated) : undefined),
    livingArea: sqft,
    lotSize: lotSize,
    yearBuilt: yearBuilt,
    propertyType: propertyType,
    propertySubtype: propertySubtype,
    status: propertyStatus, // CRITICAL: Status MUST match listingType - enforced here
    listingState: propertyState, // NEW: Top-level state field ("Lease" or "Sale")
    imgSrc: images[0] || undefined,
    images: images,
    description: description,
    latitude: item.coordinates?.latitude,
    longitude: item.coordinates?.longitude,
    // Additional fields
    hoaFees: hoaFees,
    hoaFrequency: hoaFrequency,
    parkingFeatures: parkingFeatures,
    heatingFeatures: heatingFeatures,
    coolingFeatures: coolingFeatures,
    yearBuiltText: yearBuiltText,
  };
}

/**
 * Load residential properties for a city and listing type
 */
export async function loadResidentialProperties(
  city: string,
  listingType: 'sale' | 'lease'
): Promise<APIProperty[]> {
  try {
    console.log(`🔍 Loading residential properties for city: "${city}", listingType: "${listingType}"`);
    
    const files = getCityFiles(city);
    console.log(`📁 City files found:`, files);
    
    // CRITICAL: Select file based on listingType - MUST match exactly
    // EXPLICIT: Use strict comparison to ensure correct file selection
    let filePath: string | null = null;
    if (listingType === 'lease') {
      filePath = files.lease;
      console.log(`✅ SELECTING LEASE FILE: ${filePath}`);
    } else if (listingType === 'sale') {
      filePath = files.sale;
      console.log(`✅ SELECTING SALE FILE: ${filePath}`);
    } else {
      console.error(`❌ CRITICAL ERROR: Invalid listingType: "${listingType}" (must be 'sale' or 'lease')`);
      return [];
    }
    
    if (!filePath) {
      console.error(`❌ CRITICAL ERROR: No residential dataset file found for city: ${city}, type: ${listingType}`);
      console.error(`   Available files: sale=${files.sale}, lease=${files.lease}`);
      console.error(`   listingType value: "${listingType}" (type: ${typeof listingType})`);
      return [];
    }
    
    // CRITICAL: Verify we're loading from the correct folder BEFORE loading
    const expectedFolder = listingType === 'lease' ? 'lease' : 'sale';
    const actualFolder = filePath.includes('/lease/') ? 'lease' : filePath.includes('/sale/') ? 'sale' : 'unknown';
    
    console.log(`🔍 File Selection Validation:`);
    console.log(`   listingType: "${listingType}"`);
    console.log(`   expectedFolder: "${expectedFolder}"`);
    console.log(`   actualFolder: "${actualFolder}"`);
    console.log(`   filePath: "${filePath}"`);
    
    if (actualFolder !== expectedFolder) {
      console.error(`❌ CRITICAL ERROR: Folder mismatch!`);
      console.error(`   Expected folder: ${expectedFolder}`);
      console.error(`   Actual folder: ${actualFolder}`);
      console.error(`   File path: ${filePath}`);
      console.error(`   listingType: ${listingType}`);
      console.error(`   City: ${city}`);
      return []; // Return empty array to prevent wrong data
    }
    
    if (!filePath.includes(`/${expectedFolder}/`)) {
      console.error(`❌ CRITICAL ERROR: File path doesn't contain expected folder!`);
      console.error(`   Expected folder: ${expectedFolder}`);
      console.error(`   Actual file path: ${filePath}`);
      console.error(`   listingType: ${listingType}`);
      console.error(`   City: ${city}`);
      return []; // Return empty array to prevent wrong data
    }
    
    console.log(`✅ Folder validation passed: Loading from ${expectedFolder} folder`);
    
    // CRITICAL: Verify exact filename matches expected pattern for the city
    const normalizedCity = normalizeCityName(city);
    
    // Find the matching city key in CITY_FILE_MAP
    let matchedCityKey: string | null = null;
    if (CITY_FILE_MAP[normalizedCity]) {
      matchedCityKey = normalizedCity;
    } else {
      // Try to find matching city key (prioritize longer matches like "miami beach" over "miami")
      const sortedKeys = Object.keys(CITY_FILE_MAP).sort((a, b) => b.length - a.length);
      for (const key of sortedKeys) {
        if (normalizedCity === key || 
            normalizedCity.startsWith(key + ' ') || 
            normalizedCity.includes(' ' + key + ' ')) {
          matchedCityKey = key;
          break;
        }
      }
    }
    
    if (matchedCityKey && CITY_FILE_MAP[matchedCityKey]) {
      const expectedFileName = listingType === 'lease' 
        ? CITY_FILE_MAP[matchedCityKey].lease 
        : CITY_FILE_MAP[matchedCityKey].sale;
      
      if (!filePath.includes(expectedFileName)) {
        console.error(`❌ CRITICAL ERROR: Filename mismatch!`);
        console.error(`   Expected filename: ${expectedFileName}`);
        console.error(`   Actual file path: ${filePath}`);
        console.error(`   listingType: ${listingType}`);
        console.error(`   City: ${city} (matched to: ${matchedCityKey})`);
        return []; // Return empty array to prevent wrong data
      }
      
      console.log(`✅ Filename verification passed: ${expectedFileName}`);
    }
    
    // CRITICAL: For Miami Beach specifically, ensure exact file match
    if (normalizedCity.includes('miami beach') || matchedCityKey === 'miami beach') {
      const expectedMiamiBeachFile = listingType === 'lease' 
        ? '/residential/lease/miami_beach_rental.json'
        : '/residential/sale/miami_beach_sale.json';
      
      if (filePath !== expectedMiamiBeachFile) {
        console.error(`❌ CRITICAL ERROR: Miami Beach file path mismatch!`);
        console.error(`   Expected: ${expectedMiamiBeachFile}`);
        console.error(`   Actual: ${filePath}`);
        console.error(`   listingType: ${listingType}`);
        return []; // Return empty array to prevent wrong data
      }
      console.log(`✅ Miami Beach file verification passed: ${filePath}`);
    }
    
    console.log(`📂 Loading file: ${filePath}`);
    console.log(`   Expected folder: ${expectedFolder}`);
    console.log(`   listingType: ${listingType}`);
    console.log(`   City: ${city}${matchedCityKey ? ` (matched to: ${matchedCityKey})` : ''}`);
    
    // CRITICAL: Final validation before loading
    console.log(`🔍 FINAL VALIDATION BEFORE LOADING:`);
    console.log(`   listingType: "${listingType}" (type: ${typeof listingType})`);
    console.log(`   filePath: "${filePath}"`);
    console.log(`   expectedFolder: "${expectedFolder}"`);
    console.log(`   filePath contains '/lease/': ${filePath.includes('/lease/')}`);
    console.log(`   filePath contains '/sale/': ${filePath.includes('/sale/')}`);
    
    // CRITICAL: For Miami Beach lease, verify exact file
    if (normalizedCity.includes('miami beach') || matchedCityKey === 'miami beach') {
      if (listingType === 'lease') {
        if (filePath !== '/residential/lease/miami_beach_rental.json') {
          console.error(`❌ CRITICAL ERROR: Miami Beach lease file mismatch!`);
          console.error(`   Expected: /residential/lease/miami_beach_rental.json`);
          console.error(`   Actual: ${filePath}`);
          console.error(`   listingType: ${listingType}`);
          return [];
        }
        console.log(`✅ VERIFIED: Miami Beach lease file is correct: ${filePath}`);
      } else if (listingType === 'sale') {
        if (filePath !== '/residential/sale/miami_beach_sale.json') {
          console.error(`❌ CRITICAL ERROR: Miami Beach sale file mismatch!`);
          console.error(`   Expected: /residential/sale/miami_beach_sale.json`);
          console.error(`   Actual: ${filePath}`);
          console.error(`   listingType: ${listingType}`);
          return [];
        }
        console.log(`✅ VERIFIED: Miami Beach sale file is correct: ${filePath}`);
      }
    }
    
    // Load the dataset file
    console.log(`📥 FETCHING FILE: ${filePath}`);
    const response = await fetch(filePath);
    if (!response.ok) {
      console.error(`❌ Failed to load ${filePath}: ${response.status} ${response.statusText}`);
      console.error(`   URL: ${response.url}`);
      return [];
    }
    
    console.log(`✅ File fetch successful: ${filePath}`);
    const data: ResidentialDatasetProperty[] = await response.json();
    if (!Array.isArray(data)) {
      console.warn(`❌ Invalid data format in ${filePath} - expected array, got:`, typeof data);
      return [];
    }
    
    console.log(`✅ Loaded ${data.length} residential properties from ${filePath}`);
    console.log(`   ✅ VERIFIED: Loading from ${expectedFolder} folder`);
    console.log(`   ✅ VERIFIED: File path contains correct folder: ${filePath.includes(`/${expectedFolder}/`)}`);
    console.log(`   ✅ VERIFIED: listingType="${listingType}", expectedStatus="${listingType === 'lease' ? 'For Rent' : 'For Sale'}"`);
    console.log(`   ✅ VERIFIED: File name matches: ${filePath.includes(listingType === 'lease' ? 'rental' : 'sale')}`);
    
    // Convert to APIProperty format
    const properties = data.map((item, index) => {
      // LAYER 1: Read state field from raw JSON data (NEW field: "Lease" or "Sale")
      const rawState = item.state;
      const expectedState = listingType === 'lease' ? 'Lease' : 'Sale';
      
      // LAYER 2: CRITICAL - Verify state field matches file type BEFORE conversion
      if (rawState && rawState !== expectedState) {
        console.error(`❌ LAYER 2 FAILED: Property at index ${index} has state="${rawState}" but file is ${listingType} (expected "${expectedState}")`);
        console.error(`   File: ${filePath}`);
        console.error(`   Property ID: ${item.id || item.property_id || 'unknown'}`);
        console.error(`   This property should NOT be in this file!`);
        // Still convert it but mark it as wrong - filtering will remove it later
      }
      
      const converted = convertToAPIProperty(item, listingType);
      
      // LAYER 3: Ensure listingState matches the state field from JSON
      if (rawState && converted.listingState !== rawState) {
        console.warn(`   ⚠️ LAYER 3: Property ${converted.zpid}: JSON state="${rawState}" but converted listingState="${converted.listingState}" - using JSON value`);
        converted.listingState = rawState; // Use the state from JSON file
      }
      
      // LAYER 4: DOUBLE-CHECK and enforce correct status
      const expectedStatus = listingType === 'lease' ? 'For Rent' : 'For Sale';
      if (converted.status !== expectedStatus) {
        console.error(`❌ LAYER 4 FAILED: Property ${converted.zpid} has status "${converted.status}" but should be "${expectedStatus}"`);
        console.error(`   Listing type: ${listingType}, File: ${filePath}`);
        console.error(`   Property index: ${index}`);
        // Force correct status - this should never happen if convertToAPIProperty works correctly
        converted.status = expectedStatus;
      }
      
      // LAYER 5: Final verification - if state field exists and doesn't match, log critical error
      if (rawState && rawState !== expectedState) {
        console.error(`❌ LAYER 5 CRITICAL: Property ${converted.zpid} is in WRONG file!`);
        console.error(`   File type: ${listingType}, Property state: "${rawState}"`);
        console.error(`   This property will be filtered out by strict filtering logic`);
      }
      
      // Log first property for verification
      if (index === 0) {
        console.log(`📊 First property converted:`, {
          zpid: converted.zpid,
          city: converted.city,
          status: converted.status,
          listingState: converted.listingState,
          rawStateFromJSON: rawState,
          expectedStatus,
          listingType,
          filePath
        });
      }
      
      return converted;
    });
    
    // LAYER 6: Filter out properties with wrong state field BEFORE returning
    let filteredProperties = properties.filter(p => {
      const propState = p.listingState || '';
      const expectedState = listingType === 'lease' ? 'Lease' : 'Sale';
      
      // If state field exists and doesn't match, exclude it
      if (propState && propState !== expectedState) {
        console.error(`❌ LAYER 6: Filtering out property ${p.zpid} - state="${propState}" doesn't match file type "${listingType}"`);
        return false;
      }
      
      // Also check status field
      const propStatus = (p.status || '').toLowerCase();
      if (listingType === 'lease') {
        if (propStatus.includes('sale') && !propStatus.includes('rent') && !propStatus.includes('lease')) {
          console.error(`❌ LAYER 6: Filtering out property ${p.zpid} - status="${p.status}" indicates Sale but file is lease`);
          return false;
        }
      } else {
        if ((propStatus.includes('rent') || propStatus.includes('lease')) && !propStatus.includes('sale')) {
          console.error(`❌ LAYER 6: Filtering out property ${p.zpid} - status="${p.status}" indicates Lease but file is sale`);
          return false;
        }
      }
      
      return true;
    });
    
    if (filteredProperties.length !== properties.length) {
      console.error(`❌ LAYER 6 FILTERED: Removed ${properties.length - filteredProperties.length} properties with wrong state/status from ${filePath}`);
    }
    
    // Log state field statistics
    const stateBreakdown = filteredProperties.reduce((acc, p) => {
      const state = p.listingState || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(`📊 State field breakdown:`, stateBreakdown);
    console.log(`   Expected state: ${listingType === 'lease' ? 'Lease' : 'Sale'}`);
    
    // LAYER 7: Final verification - Check if any properties have wrong status
    const wrongStatusCount = filteredProperties.filter(p => {
      const propStatus = (p.status || '').toLowerCase();
      if (listingType === 'lease') {
        return !propStatus.includes('rent') && !propStatus.includes('lease');
      } else {
        return !propStatus.includes('sale');
      }
    }).length;
    
    if (wrongStatusCount > 0) {
      console.error(`❌ LAYER 7 FAILED: ${wrongStatusCount} properties have incorrect status from ${filePath}`);
      console.error(`   Expected status: ${listingType === 'lease' ? 'For Rent' : 'For Sale'}`);
      // Filter out properties with wrong status
      filteredProperties = filteredProperties.filter(p => {
        const propStatus = (p.status || '').toLowerCase();
        if (listingType === 'lease') {
          return propStatus.includes('rent') || propStatus.includes('lease');
        } else {
          return propStatus.includes('sale');
        }
      });
      console.log(`   ✅ LAYER 7 FILTERED: ${filteredProperties.length} properties with correct status`);
    }
    
    // CRITICAL: Final status verification - log first few properties
    if (filteredProperties.length > 0) {
      console.log(`📊 Status verification (first 5 properties):`);
      filteredProperties.slice(0, 5).forEach((p, idx) => {
        console.log(`   ${idx + 1}. Property ${p.zpid}: status="${p.status}", expected="${listingType === 'lease' ? 'For Rent' : 'For Sale'}"`);
      });
    }
    
    console.log(`✅ Converted ${filteredProperties.length} properties to APIProperty format with status: ${listingType === 'lease' ? 'For Rent' : 'For Sale'}`);
    console.log(`   ✅ VERIFIED: All properties have correct status from ${filePath}`);
    
    return filteredProperties;
    
    return properties;
  } catch (error) {
    console.error(`❌ Error loading residential properties for ${city} (${listingType}):`, error);
    return [];
  }
}

/**
 * Load all residential properties for a city (both sale and lease)
 */
export async function loadAllResidentialProperties(city: string): Promise<{
  sale: APIProperty[];
  lease: APIProperty[];
}> {
  const [saleProperties, leaseProperties] = await Promise.all([
    loadResidentialProperties(city, 'sale'),
    loadResidentialProperties(city, 'lease'),
  ]);
  
  return {
    sale: saleProperties,
    lease: leaseProperties,
  };
}

/**
 * Search residential properties by location
 * Prioritizes exact file name matches (e.g., "Miami Beach" matches miami_beach files)
 */
export async function searchResidentialProperties(
  location: string,
  listingType: 'sale' | 'lease' = 'sale' // WARNING: Default is 'sale' - callers MUST explicitly pass 'lease' for rentals
): Promise<APIProperty[]> {
  // CRITICAL: Log the listingType to ensure it's being passed correctly
  console.log(`🔍 searchResidentialProperties called with:`);
  console.log(`   location: "${location}"`);
  console.log(`   listingType: "${listingType}" (type: ${typeof listingType})`);
  console.log(`   Will load from: /residential/${listingType}/ folder`);
  
  // CRITICAL: Validate listingType
  if (listingType !== 'sale' && listingType !== 'lease') {
    console.error(`❌ CRITICAL ERROR: Invalid listingType "${listingType}" - must be 'sale' or 'lease'`);
    return [];
  }
  // Extract city from location string - normalize and clean
  // CRITICAL: Decode URL-encoded characters first (e.g., %2C becomes comma)
  let locationLower = decodeURIComponent(location).toLowerCase().trim();
  
  // Remove common state abbreviations and extra whitespace
  // Handle formats like "Miami Beach, FL", "Miami Beach FL", "Miami Beach, Florida"
  locationLower = locationLower
    .replace(/,\s*(fl|florida|ca|california|ny|new york|il|illinois|tx|texas|az|arizona|pa|pennsylvania)/i, '')
    .trim();
  
  // CRITICAL: Ensure "miami beach" is matched before "miami" by checking longer city names first
  // This prevents "Miami Beach, FL" from matching just "miami"
  console.log(`🔍 Searching residential properties for location: "${location}" (decoded: "${decodeURIComponent(location)}", normalized: "${locationLower}") with listingType: "${listingType}"`);
  
  // CRITICAL VALIDATION: For Miami Beach specifically, ensure we don't match "miami" instead
  if (locationLower.includes('miami beach') || locationLower === 'miami beach') {
    console.log(`🔍 CRITICAL: Detected "Miami Beach" in location - will prioritize "miami beach" over "miami"`);
  }
  
  // Sort city keys by length (longest first) to prioritize specific matches
  // e.g., "miami beach" should match before "miami"
  const sortedCityKeys = Object.keys(CITY_FILE_MAP).sort((a, b) => b.length - a.length);
  
  // Try to find matching city - prioritize exact matches and longer city names
  let matchedCity: string | null = null;
  
  // First pass: Check for exact matches (longer cities first)
  for (const cityKey of sortedCityKeys) {
    // Exact match (case-insensitive)
    if (locationLower === cityKey) {
      matchedCity = cityKey;
      console.log(`✅ Exact match found: "${locationLower}" === "${cityKey}"`);
      break;
    }
  }
  
  // Second pass: Check if location contains the full city name as a complete word
  // e.g., "miami beach" should match "miami beach" but not "miami"
  if (!matchedCity) {
    for (const cityKey of sortedCityKeys) {
      // Use word boundary regex to match complete city names
      // This ensures "miami beach" matches "miami beach" but not just "miami"
      const cityRegex = new RegExp(`\\b${cityKey.replace(/\s+/g, '\\s+')}\\b`, 'i');
      if (cityRegex.test(locationLower)) {
        matchedCity = cityKey;
        console.log(`✅ Word boundary match found: "${locationLower}" contains "${cityKey}"`);
        break;
      }
      
      // Check if location starts with city name followed by comma, space, or end of string
      if (locationLower.startsWith(cityKey + ',') || 
          locationLower.startsWith(cityKey + ' ') ||
          locationLower === cityKey) {
        matchedCity = cityKey;
        console.log(`✅ Prefix match found: "${locationLower}" starts with "${cityKey}"`);
        break;
      }
    }
  }
  
  // Third pass: Try extracting city from common formats like "City, State" or "City State"
  if (!matchedCity) {
    // Split by comma or space, take first part as potential city
    const parts = locationLower.split(/[,\s]+/);
    if (parts.length > 0) {
      // For multi-word cities like "Miami Beach", try combining first two words
      let potentialCity = parts[0].trim();
      if (parts.length > 1) {
        // Try two-word city name first (e.g., "Miami Beach")
        const twoWordCity = `${parts[0]} ${parts[1]}`.trim();
        for (const cityKey of sortedCityKeys) {
          if (twoWordCity === cityKey || cityKey.includes(twoWordCity) || twoWordCity.includes(cityKey)) {
            matchedCity = cityKey;
            console.log(`✅ Two-word city match found: "${twoWordCity}" matches "${cityKey}"`);
            break;
          }
        }
      }
      
      // If still no match, try single word
      if (!matchedCity) {
        for (const cityKey of sortedCityKeys) {
          // Exact match with first part
          if (potentialCity === cityKey) {
            matchedCity = cityKey;
            console.log(`✅ Single-word match found: "${potentialCity}" === "${cityKey}"`);
            break;
          }
          
          // Check if city key starts with potential city or vice versa
          if (cityKey.startsWith(potentialCity) || potentialCity.startsWith(cityKey.split(' ')[0])) {
            // Prefer longer matches
            if (!matchedCity || cityKey.length > matchedCity.length) {
              matchedCity = cityKey;
              console.log(`✅ Partial match found: "${potentialCity}" partially matches "${cityKey}"`);
            }
          }
        }
      }
    }
  }
  
  // Fourth pass: Fallback to simple includes check (but still prioritize longer matches)
  if (!matchedCity) {
    for (const cityKey of sortedCityKeys) {
      if (locationLower.includes(cityKey)) {
        matchedCity = cityKey;
        console.log(`✅ Includes match found: "${locationLower}" includes "${cityKey}"`);
        break;
      }
    }
  }
  
  if (!matchedCity) {
    console.warn(`❌ No matching city found for location: "${location}" (normalized: "${locationLower}")`);
    console.warn(`   Available cities: ${Object.keys(CITY_FILE_MAP).join(', ')}`);
    return [];
  }
  
  // CRITICAL: Verify the matched city and expected file
  const expectedFiles = CITY_FILE_MAP[matchedCity];
  const expectedFilePath = listingType === 'lease' 
    ? `/residential/lease/${expectedFiles.lease}`
    : `/residential/sale/${expectedFiles.sale}`;
  
  console.log(`✅ FINAL MATCH: "${location}" → city: "${matchedCity}" with listingType: "${listingType}"`);
  console.log(`   📁 Expected file: ${expectedFilePath}`);
  console.log(`   📁 Will load from: ${listingType === 'sale' ? 'sale' : 'lease'} folder`);
  
  // CRITICAL: For Miami Beach, verify we're not matching "miami" instead
  if (locationLower.includes('beach') && matchedCity === 'miami') {
    console.error(`❌ CRITICAL ERROR: Location contains "beach" but matched "miami" instead of "miami beach"!`);
    console.error(`   Location: "${location}" (normalized: "${locationLower}")`);
    console.error(`   Matched city: "${matchedCity}"`);
    // Try to force match to "miami beach"
    if (CITY_FILE_MAP['miami beach']) {
      console.log(`   🔧 Correcting: Forcing match to "miami beach"`);
      matchedCity = 'miami beach';
      const correctedFiles = CITY_FILE_MAP[matchedCity];
      const correctedFilePath = listingType === 'lease' 
        ? `/residential/lease/${correctedFiles.lease}`
        : `/residential/sale/${correctedFiles.sale}`;
      console.log(`   ✅ Corrected file: ${correctedFilePath}`);
    }
  }
  
  // CRITICAL: Verify we're calling with the correct listingType
  if (listingType !== 'sale' && listingType !== 'lease') {
    console.error(`❌ CRITICAL ERROR: Invalid listingType "${listingType}" passed to searchResidentialProperties`);
    return [];
  }
  
  // CRITICAL: For Miami Beach, ensure we're loading the correct file
  if (matchedCity === 'miami beach') {
    const expectedFile = listingType === 'lease' 
      ? '/residential/lease/miami_beach_rental.json'
      : '/residential/sale/miami_beach_sale.json';
    console.log(`🔍 Miami Beach validation: Expected file: ${expectedFile}, listingType: ${listingType}`);
  }
  
  return loadResidentialProperties(matchedCity, listingType);
}

/**
 * Get available cities from residential datasets
 */
export function getAvailableResidentialCities(): string[] {
  return Object.keys(CITY_FILE_MAP).map(city => 
    city.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
}

/**
 * Get residential property details by ID
 * Searches through all residential dataset files
 * @param id - Property ID to search for
 * @param preferredListingType - Preferred listing type ('sale' or 'lease'). If provided, searches that type first.
 */
export async function getResidentialPropertyById(
  id: string, 
  preferredListingType?: 'sale' | 'lease'
): Promise<APIProperty | null> {
  try {
    console.log(`🔍 Searching for residential property with ID: ${id}${preferredListingType ? ` (preferred: ${preferredListingType})` : ''}`);
    // Search through all city files
    const cityFiles = Object.values(CITY_FILE_MAP);
    const allFiles: Array<{ path: string; type: 'sale' | 'lease' }> = [];
    
    // Collect files - if preferredListingType is specified, ONLY collect that type
    cityFiles.forEach(files => {
      if (preferredListingType) {
        // STRICT: Only search the preferred type to prevent finding properties in wrong files
        if (preferredListingType === 'sale') {
          allFiles.push({ path: `/residential/sale/${files.sale}`, type: 'sale' });
        } else {
          allFiles.push({ path: `/residential/lease/${files.lease}`, type: 'lease' });
        }
      } else {
        // If no preference, search both but prioritize sale
        allFiles.push({ path: `/residential/sale/${files.sale}`, type: 'sale' });
        allFiles.push({ path: `/residential/lease/${files.lease}`, type: 'lease' });
      }
    });
    
    // Sort files: prioritize preferred listing type, otherwise search sale files first (more common)
    const sortedFiles = allFiles.sort((a, b) => {
      if (preferredListingType) {
        // If preferred type is specified, prioritize it
        if (a.type === preferredListingType && b.type !== preferredListingType) return -1;
        if (b.type === preferredListingType && a.type !== preferredListingType) return 1;
      } else {
        // Default: prioritize sale files (more common than lease)
        if (a.type === 'sale' && b.type === 'lease') return -1;
        if (a.type === 'lease' && b.type === 'sale') return 1;
      }
      return 0;
    });
    
    // Search through all files
    for (const { path: filePath, type: listingType } of sortedFiles) {
      try {
        const response = await fetch(filePath);
        if (!response.ok) continue;
        
        const data: ResidentialDatasetProperty[] = await response.json();
        if (!Array.isArray(data)) continue;
        
        // Find property by ID
        const property = data.find(item => 
          item.id === id || 
          item.property_id === id ||
          String(item.id) === id ||
          String(item.property_id) === id
        );
        
        if (property) {
          console.log(`✅ Found property ${id} in ${filePath} with listingType: ${listingType}`);
          
          // LAYER 1: Check state field from JSON FIRST - this is the source of truth
          const rawState = property.state;
          const expectedState = listingType === 'lease' ? 'Lease' : 'Sale';
          
          if (rawState && rawState !== expectedState) {
            console.error(`❌ LAYER 1 FAILED: Property ${id} found in ${listingType} file but has state="${rawState}" (expected "${expectedState}")`);
            console.error(`   File: ${filePath}`);
            console.error(`   This property should NOT be in this file!`);
            
            // If preferredListingType is specified, skip this property (it's in wrong file)
            if (preferredListingType && listingType !== preferredListingType) {
              console.error(`   SKIPPING: Property is in wrong file type. Continuing search...`);
              continue; // Continue searching in other files
            } else if (rawState === (listingType === 'lease' ? 'Sale' : 'Lease')) {
              // Property is definitely in wrong file - skip it
              console.error(`   SKIPPING: Property state="${rawState}" doesn't match file type="${listingType}"`);
              continue;
            } else {
              // If no preference, still log error but use the file's listingType
              console.warn(`   WARNING: Using file's listingType despite state mismatch`);
            }
          }
          
          const converted = convertToAPIProperty(property, listingType);
          
          // LAYER 2: Verify status matches listing type
          const expectedStatus = listingType === 'lease' ? 'For Rent' : 'For Sale';
          if (converted.status !== expectedStatus) {
            console.error(`❌ LAYER 2 FAILED: Property ${id} has status "${converted.status}" but should be "${expectedStatus}"`);
            console.error(`   Correcting status...`);
            converted.status = expectedStatus;
          }
          
          // LAYER 3: Verify listingState matches
          const expectedListingState = listingType === 'lease' ? 'Lease' : 'Sale';
          if (converted.listingState !== expectedListingState) {
            console.error(`❌ LAYER 3 FAILED: Property ${id} has listingState="${converted.listingState}" but should be "${expectedListingState}"`);
            console.error(`   Correcting listingState...`);
            converted.listingState = expectedListingState;
          }
          
          // LAYER 4: Final verification - if preferredListingType is specified, verify it matches
          if (preferredListingType) {
            if (listingType !== preferredListingType) {
              console.error(`❌ LAYER 4 FAILED: Property found in ${listingType} file but preferredListingType is ${preferredListingType}`);
              console.error(`   SKIPPING this property and continuing search...`);
              continue;
            }
            
            // Double-check status matches preferred type
            const preferredStatus = preferredListingType === 'lease' ? 'For Rent' : 'For Sale';
            if (converted.status !== preferredStatus) {
              console.error(`❌ LAYER 4 STATUS CHECK FAILED: Property status="${converted.status}" doesn't match preferred "${preferredStatus}"`);
              console.error(`   Correcting...`);
              converted.status = preferredStatus;
              converted.listingState = preferredListingType === 'lease' ? 'Lease' : 'Sale';
            }
          }
          
          console.log(`   ✅ All verification layers passed`);
          console.log(`   Final status: ${converted.status}, listingState: ${converted.listingState}`);
          return converted;
        }
      } catch (err) {
        // Continue to next file
        continue;
      }
    }
    
    console.warn(`❌ Property ${id} not found in any residential dataset files`);
    return null;
  } catch (error) {
    console.error(`❌ Error loading residential property ${id}:`, error);
    return null;
  }
}

