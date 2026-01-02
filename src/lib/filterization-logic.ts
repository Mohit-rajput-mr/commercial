/**
 * Filterization Logic
 * Determines which files to load based on selected filters (Lease/Sale, Residential/Commercial)
 */

import { APIProperty } from './property-api';
import { CommercialProperty } from './us-real-estate-api';
import { loadResidentialProperties } from './residential-dataset-loader';
import { loadPropertiesForLocation } from './dataset-loader';

export type ListingType = 'lease' | 'sale';
export type PropertyCategory = 'residential' | 'commercial' | 'combined';

export interface FilterOptions {
  listingType: ListingType | null; // 'lease' or 'sale' or null (both)
  propertyCategory: PropertyCategory; // 'residential', 'commercial', or 'combined'
}

export interface FilterizationResult {
  residentialProperties: APIProperty[];
  commercialProperties: CommercialProperty[];
  totalCount: number;
  filesLoaded: string[];
}

// HARDCODED: City to file path mapping - all residential files
const CITY_FILE_PATHS: { [key: string]: { sale: string; lease: string } } = {
  'chicago': {
    sale: '/residential/sale/chicago_sale.json',
    lease: '/residential/lease/chicago_rental.json',
  },
  'houston': {
    sale: '/residential/sale/houston_sale.json',
    lease: '/residential/lease/houston_rental.json',
  },
  'las vegas': {
    sale: '/residential/sale/las_vegas_sale.json',
    lease: '/residential/lease/losangeles_rental.json', // Note: lease file is losangeles_rental.json
  },
  'los angeles': {
    sale: '/residential/sale/las_vegas_sale.json', // Note: sale file is las_vegas_sale.json
    lease: '/residential/lease/losangeles_rental.json',
  },
  'la': {
    sale: '/residential/sale/las_vegas_sale.json',
    lease: '/residential/lease/losangeles_rental.json',
  },
  'miami': {
    sale: '/residential/sale/miami_sale.json',
    lease: '/residential/lease/miami_rental.json',
  },
  'miami beach': {
    sale: '/residential/sale/miami_beach_sale.json',
    lease: '/residential/lease/miami_beach_rental.json',
  },
  'new york': {
    sale: '/residential/sale/new_york_sale.json',
    lease: '/residential/lease/newyork_rental.json',
  },
  'nyc': {
    sale: '/residential/sale/new_york_sale.json',
    lease: '/residential/lease/newyork_rental.json',
  },
  'new york city': {
    sale: '/residential/sale/new_york_sale.json',
    lease: '/residential/lease/newyork_rental.json',
  },
  'philadelphia': {
    sale: '/residential/sale/philadelphia_sale.json',
    lease: '/residential/lease/philadelphia_rental.json',
  },
  'phoenix': {
    sale: '/residential/sale/phoenix_sale.json',
    lease: '/residential/lease/phoenix_rental.json',
  },
  'san antonio': {
    sale: '/residential/sale/san-antonio_sale.json',
    lease: '/residential/lease/san_antonio_rental.json',
  },
};

/**
 * Determine which files to load based on filters
 * Returns hardcoded file paths for each city
 */
export function determineFilesToLoad(
  location: string,
  filters: FilterOptions
): {
  residentialFiles: Array<{ city: string; listingType: 'sale' | 'lease'; filePath: string }>;
  commercialFiles: boolean;
} {
  const result = {
    residentialFiles: [] as Array<{ city: string; listingType: 'sale' | 'lease'; filePath: string }>,
    commercialFiles: false,
  };

  // Extract city from location
  let normalizedCity = location.toLowerCase().trim();
  try {
    normalizedCity = decodeURIComponent(normalizedCity);
  } catch (e) {
    // If decoding fails, use original
  }

  // Remove state abbreviations
  normalizedCity = normalizedCity
    .replace(/,\s*(fl|florida|ca|california|ny|new york|il|illinois|tx|texas|az|arizona|pa|pennsylvania)/i, '')
    .trim();

  // Map location to city name (matching CITY_FILE_PATHS keys)
  const cityMap: { [key: string]: string } = {
    'miami beach': 'miami beach',
    'miami': 'miami',
    'new york': 'new york',
    'new york city': 'new york',
    'nyc': 'new york',
    'los angeles': 'los angeles',
    'la': 'los angeles',
    'las vegas': 'las vegas',
    'chicago': 'chicago',
    'houston': 'houston',
    'philadelphia': 'philadelphia',
    'phoenix': 'phoenix',
    'san antonio': 'san antonio',
  };

  // Find matching city
  let matchedCity: string | null = null;
  const sortedKeys = Object.keys(cityMap).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    if (
      normalizedCity === key ||
      normalizedCity.startsWith(key + ',') ||
      normalizedCity.startsWith(key + ' ') ||
      normalizedCity.includes(' ' + key + ' ')
    ) {
      matchedCity = cityMap[key];
      break;
    }
  }

  if (!matchedCity) {
    for (const key of sortedKeys) {
      if (normalizedCity.includes(key)) {
        matchedCity = cityMap[key];
        break;
      }
    }
  }

  // Determine residential files to load with HARDCODED paths
  if (filters.propertyCategory === 'residential' || filters.propertyCategory === 'combined') {
    if (matchedCity && CITY_FILE_PATHS[matchedCity]) {
      const cityPaths = CITY_FILE_PATHS[matchedCity];
      
      if (filters.listingType === 'lease') {
        // HARDCODED: Load lease file
        result.residentialFiles.push({
          city: matchedCity,
          listingType: 'lease',
          filePath: cityPaths.lease,
        });
      } else if (filters.listingType === 'sale') {
        // HARDCODED: Load sale file (Miami sale is now allowed)
        result.residentialFiles.push({
          city: matchedCity,
          listingType: 'sale',
          filePath: cityPaths.sale,
        });
      } else {
        // Both lease and sale (null filter)
        // HARDCODED: Load lease file
        result.residentialFiles.push({
          city: matchedCity,
          listingType: 'lease',
          filePath: cityPaths.lease,
        });
        // HARDCODED: Load sale file (Miami sale is now allowed)
        result.residentialFiles.push({
          city: matchedCity,
          listingType: 'sale',
          filePath: cityPaths.sale,
        });
      }
    }
  }

  // Determine commercial files to load
  if (filters.propertyCategory === 'commercial' || filters.propertyCategory === 'combined') {
    result.commercialFiles = true;
  }

  return result;
}

/**
 * Load properties based on filters
 */
export async function loadPropertiesByFilters(
  location: string,
  filters: FilterOptions
): Promise<FilterizationResult> {
  console.log('🔍 Filterization Logic: Loading properties with filters:', filters);
  console.log('   Location:', location);

  const filesToLoad = determineFilesToLoad(location, filters);
  console.log('   Files to load:', filesToLoad);

  const residentialProperties: APIProperty[] = [];
  const commercialProperties: CommercialProperty[] = [];
  const filesLoaded: string[] = [];

  // Load residential properties using HARDCODED file paths
  if (filesToLoad.residentialFiles.length > 0) {
    for (const file of filesToLoad.residentialFiles) {
      try {
        console.log(`   Loading residential: ${file.city} (${file.listingType})`);
        console.log(`   HARDCODED file path: ${file.filePath}`);

        // Only enforce that we don't accidentally mix lease/sale files for a specific filter
        if (filters.listingType && file.listingType !== filters.listingType) {
          console.log(
            `   Skipping ${file.filePath} because listingType=${file.listingType} does not match active filter=${filters.listingType}`
          );
          continue;
        }

        const props = await loadResidentialProperties(file.city, file.listingType);
        residentialProperties.push(...props);
        filesLoaded.push(file.filePath);
        console.log(`   ✅ Loaded ${props.length} properties from ${file.filePath}`);
      } catch (error) {
        console.error(`   ❌ Error loading ${file.city} (${file.listingType}) from ${file.filePath}:`, error);
      }
    }
  }

  // Load commercial properties
  if (filesToLoad.commercialFiles) {
    try {
      console.log(`   Loading commercial properties for: ${location}`);
      const commercialProps = await loadPropertiesForLocation(location);
      commercialProperties.push(...commercialProps);
      filesLoaded.push(`Commercial dataset for ${location}`);
      console.log(`   ✅ Loaded ${commercialProps.length} commercial properties`);
    } catch (error) {
      console.error(`   ❌ Error loading commercial properties:`, error);
    }
  }

  // CRITICAL: Deduplicate properties by zpid BEFORE filtering
  const seenZpids = new Set<string>();
  const uniqueResidential: APIProperty[] = [];
  const uniqueCommercial: CommercialProperty[] = [];
  
  // Deduplicate residential properties
  for (const prop of residentialProperties) {
    const zpid = prop.zpid || '';
    if (zpid && !seenZpids.has(zpid)) {
      uniqueResidential.push(prop);
      seenZpids.add(zpid);
    } else if (!zpid) {
      // If no zpid, use address+city as unique identifier
      const uniqueKey = `${prop.address || ''}_${prop.city || ''}_${prop.state || ''}`;
      if (!seenZpids.has(uniqueKey)) {
        uniqueResidential.push(prop);
        seenZpids.add(uniqueKey);
      }
    }
  }
  
  // Deduplicate commercial properties
  const seenCommercialIds = new Set<string>();
  for (const prop of commercialProperties) {
    const zpid = prop.zpid || '';
    if (zpid && !seenCommercialIds.has(zpid)) {
      uniqueCommercial.push(prop);
      seenCommercialIds.add(zpid);
    } else if (!zpid) {
      const uniqueKey = `${typeof prop.address === 'string' ? prop.address : prop.address?.streetAddress || ''}_${prop.city || ''}_${prop.state || ''}`;
      if (!seenCommercialIds.has(uniqueKey)) {
        uniqueCommercial.push(prop);
        seenCommercialIds.add(uniqueKey);
      }
    }
  }
  
  console.log(`   🔄 Deduplication: ${residentialProperties.length} → ${uniqueResidential.length} residential properties`);
  console.log(`   🔄 Deduplication: ${commercialProperties.length} → ${uniqueCommercial.length} commercial properties`);

  // Filter properties based on selected filters - ONLY by JSON "state" field
  let filteredResidential = uniqueResidential;
  let filteredCommercial = uniqueCommercial;

  if (filters.listingType === 'lease') {
    console.log('   🔍 Filtering residential properties where state === "Lease"');
    filteredResidential = uniqueResidential.filter((p) => {
      const rawState = (p as any).listingState || (p as any).state;
      return typeof rawState === 'string' && rawState.toLowerCase().trim() === 'lease';
    });
  } else if (filters.listingType === 'sale') {
    console.log('   🔍 Filtering residential properties where state === "Sale"');
    filteredResidential = uniqueResidential.filter((p) => {
      const rawState = (p as any).listingState || (p as any).state;
      return typeof rawState === 'string' && rawState.toLowerCase().trim() === 'sale';
    });
  }

  // Apply property category filter
  if (filters.propertyCategory === 'residential') {
    filteredCommercial = [];
  } else if (filters.propertyCategory === 'commercial') {
    filteredResidential = [];
  }

  const totalCount = filteredResidential.length + filteredCommercial.length;

  console.log('✅ Filterization complete:');
  console.log(`   Residential: ${filteredResidential.length}`);
  console.log(`   Commercial: ${filteredCommercial.length}`);
  console.log(`   Total: ${totalCount}`);
  console.log(`   Files loaded: ${filesLoaded.length}`);

  return {
    residentialProperties: filteredResidential,
    commercialProperties: filteredCommercial,
    totalCount,
    filesLoaded,
  };
}


















