/**
 * Smart Location-to-File Mapping Utility
 * Maps city/location searches to their corresponding JSON dataset files
 * for faster, targeted loading instead of loading all files
 */

// Commercial files mapping by city/location keywords
export const COMMERCIAL_LOCATION_MAP: Record<string, string[]> = {
  // Houston
  'houston': ['commercial/commercial_dataset_houston.json'],
  'houston, tx': ['commercial/commercial_dataset_houston.json'],
  'houston tx': ['commercial/commercial_dataset_houston.json'],
  
  // Chicago
  'chicago': ['commercial/commercial_dataset_Chicago.json'],
  'chicago, il': ['commercial/commercial_dataset_Chicago.json'],
  'chicago il': ['commercial/commercial_dataset_Chicago.json'],
  
  // Los Angeles
  'los angeles': ['commercial/commercial_dataset_LA.json', 'commercial/dataset_los_angeles_lease.json', 'commercial/dataset_los_angeles_sale.json'],
  'la': ['commercial/commercial_dataset_LA.json', 'commercial/dataset_los_angeles_lease.json', 'commercial/dataset_los_angeles_sale.json'],
  'los angeles, ca': ['commercial/commercial_dataset_LA.json', 'commercial/dataset_los_angeles_lease.json', 'commercial/dataset_los_angeles_sale.json'],
  'los angeles ca': ['commercial/commercial_dataset_LA.json', 'commercial/dataset_los_angeles_lease.json', 'commercial/dataset_los_angeles_sale.json'],
  
  // New York
  'new york': ['commercial/commercial_dataset_ny.json', 'commercial/dataset_manhattan_ny.json'],
  'ny': ['commercial/commercial_dataset_ny.json', 'commercial/dataset_manhattan_ny.json'],
  'new york, ny': ['commercial/commercial_dataset_ny.json', 'commercial/dataset_manhattan_ny.json'],
  'new york ny': ['commercial/commercial_dataset_ny.json', 'commercial/dataset_manhattan_ny.json'],
  'manhattan': ['commercial/dataset_manhattan_ny.json', 'commercial/commercial_dataset_ny.json'],
  'nyc': ['commercial/commercial_dataset_ny.json', 'commercial/dataset_manhattan_ny.json'],
  
  // Miami
  'miami': ['commercial/dataset_miami_sale.json', 'commercial/dataset_miami_beach.json', 'commercial/dataset_miamibeach_lease.json'],
  'miami, fl': ['commercial/dataset_miami_sale.json', 'commercial/dataset_miami_beach.json', 'commercial/dataset_miamibeach_lease.json'],
  'miami fl': ['commercial/dataset_miami_sale.json', 'commercial/dataset_miami_beach.json', 'commercial/dataset_miamibeach_lease.json'],
  'miami beach': ['commercial/dataset_miami_beach.json', 'commercial/dataset_miamibeach_lease.json'],
  
  // Philadelphia
  'philadelphia': ['commercial/dataset_philadelphia.json', 'commercial/dataset_philadelphia_sale.json'],
  'philadelphia, pa': ['commercial/dataset_philadelphia.json', 'commercial/dataset_philadelphia_sale.json'],
  'philadelphia pa': ['commercial/dataset_philadelphia.json', 'commercial/dataset_philadelphia_sale.json'],
  'philly': ['commercial/dataset_philadelphia.json', 'commercial/dataset_philadelphia_sale.json'],
  
  // Phoenix
  'phoenix': ['commercial/dataset_phoenix.json'],
  'phoenix, az': ['commercial/dataset_phoenix.json'],
  'phoenix az': ['commercial/dataset_phoenix.json'],
  
  // San Antonio
  'san antonio': ['commercial/dataset_san_antonio_sale.json', 'commercial/dataset_son_antonio_lease.json'],
  'san antonio, tx': ['commercial/dataset_san_antonio_sale.json', 'commercial/dataset_son_antonio_lease.json'],
  'san antonio tx': ['commercial/dataset_san_antonio_sale.json', 'commercial/dataset_son_antonio_lease.json'],
  
  // Las Vegas
  'las vegas': ['commercial/dataset_las_vegas_sale.json', 'commercial/dataset_lasvegas_lease.json'],
  'las vegas, nv': ['commercial/dataset_las_vegas_sale.json', 'commercial/dataset_lasvegas_lease.json'],
  'las vegas nv': ['commercial/dataset_las_vegas_sale.json', 'commercial/dataset_lasvegas_lease.json'],
  'vegas': ['commercial/dataset_las_vegas_sale.json', 'commercial/dataset_lasvegas_lease.json'],
  
  // Austin
  'austin': ['commercial/dataset_austin_lease.json', 'commercial/dataset_austin_sale.json'],
  'austin, tx': ['commercial/dataset_austin_lease.json', 'commercial/dataset_austin_sale.json'],
  'austin tx': ['commercial/dataset_austin_lease.json', 'commercial/dataset_austin_sale.json'],
  
  // San Francisco
  'san francisco': ['commercial/dataset_sanfrancisco_lease.json', 'commercial/dataset_sanfrancisco_sale.json'],
  'san francisco, ca': ['commercial/dataset_sanfrancisco_lease.json', 'commercial/dataset_sanfrancisco_sale.json'],
  'san francisco ca': ['commercial/dataset_sanfrancisco_lease.json', 'commercial/dataset_sanfrancisco_sale.json'],
  'sf': ['commercial/dataset_sanfrancisco_lease.json', 'commercial/dataset_sanfrancisco_sale.json'],
};

// All commercial files (fallback when no specific location)
export const ALL_COMMERCIAL_FILES = [
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

// Crexi files (Miami focused)
export const CREXI_FILES = [
  'miami_all_crexi_sale.json',
  'miami_all_crexi_lease.json',
];

// Residential files mapping by city/location keywords
export const RESIDENTIAL_LOCATION_MAP: Record<string, { sale: string[]; lease: string[] }> = {
  // Miami
  'miami': {
    sale: ['residential/sale/miami_sale.json', 'residential/sale/miami_beach_sale.json'],
    lease: ['residential/lease/miami_rental.json', 'residential/lease/miami_beach_rental.json'],
  },
  'miami, fl': {
    sale: ['residential/sale/miami_sale.json', 'residential/sale/miami_beach_sale.json'],
    lease: ['residential/lease/miami_rental.json', 'residential/lease/miami_beach_rental.json'],
  },
  'miami beach': {
    sale: ['residential/sale/miami_beach_sale.json'],
    lease: ['residential/lease/miami_beach_rental.json'],
  },
  
  // Chicago
  'chicago': {
    sale: ['residential/sale/chicago_sale.json'],
    lease: ['residential/lease/chicago_rental.json'],
  },
  'chicago, il': {
    sale: ['residential/sale/chicago_sale.json'],
    lease: ['residential/lease/chicago_rental.json'],
  },
  
  // Houston
  'houston': {
    sale: ['residential/sale/houston_sale.json'],
    lease: ['residential/lease/houston_rental.json'],
  },
  'houston, tx': {
    sale: ['residential/sale/houston_sale.json'],
    lease: ['residential/lease/houston_rental.json'],
  },
  
  // Los Angeles
  'los angeles': {
    sale: ['residential/sale/losangeles_sale.json'],
    lease: ['residential/lease/losangeles_rental.json'],
  },
  'los angeles, ca': {
    sale: ['residential/sale/losangeles_sale.json'],
    lease: ['residential/lease/losangeles_rental.json'],
  },
  'la': {
    sale: ['residential/sale/losangeles_sale.json'],
    lease: ['residential/lease/losangeles_rental.json'],
  },
  
  // New York
  'new york': {
    sale: ['residential/sale/new_york_sale.json'],
    lease: ['residential/lease/newyork_rental.json'],
  },
  'new york, ny': {
    sale: ['residential/sale/new_york_sale.json'],
    lease: ['residential/lease/newyork_rental.json'],
  },
  'nyc': {
    sale: ['residential/sale/new_york_sale.json'],
    lease: ['residential/lease/newyork_rental.json'],
  },
  
  // Philadelphia
  'philadelphia': {
    sale: ['residential/sale/philadelphia_sale.json'],
    lease: ['residential/lease/philadelphia_rental.json'],
  },
  'philadelphia, pa': {
    sale: ['residential/sale/philadelphia_sale.json'],
    lease: ['residential/lease/philadelphia_rental.json'],
  },
  'philly': {
    sale: ['residential/sale/philadelphia_sale.json'],
    lease: ['residential/lease/philadelphia_rental.json'],
  },
  
  // Phoenix
  'phoenix': {
    sale: ['residential/sale/phoenix_sale.json'],
    lease: ['residential/lease/phoenix_rental.json'],
  },
  'phoenix, az': {
    sale: ['residential/sale/phoenix_sale.json'],
    lease: ['residential/lease/phoenix_rental.json'],
  },
  
  // San Antonio
  'san antonio': {
    sale: ['residential/sale/san-antonio_sale.json'],
    lease: ['residential/lease/san_antonio_rental.json'],
  },
  'san antonio, tx': {
    sale: ['residential/sale/san-antonio_sale.json'],
    lease: ['residential/lease/san_antonio_rental.json'],
  },
  
  // Las Vegas
  'las vegas': {
    sale: ['residential/sale/las_vegas_sale.json'],
    lease: [], // No lease file for Las Vegas
  },
  'las vegas, nv': {
    sale: ['residential/sale/las_vegas_sale.json'],
    lease: [],
  },
  'vegas': {
    sale: ['residential/sale/las_vegas_sale.json'],
    lease: [],
  },
};

// All residential files
export const ALL_RESIDENTIAL_FILES = {
  sale: [
    'residential/sale/miami_sale.json',
    'residential/sale/miami_beach_sale.json',
    'residential/sale/chicago_sale.json',
    'residential/sale/houston_sale.json',
    'residential/sale/las_vegas_sale.json',
    'residential/sale/losangeles_sale.json',
    'residential/sale/new_york_sale.json',
    'residential/sale/philadelphia_sale.json',
    'residential/sale/phoenix_sale.json',
    'residential/sale/san-antonio_sale.json',
  ],
  lease: [
    'residential/lease/miami_rental.json',
    'residential/lease/miami_beach_rental.json',
    'residential/lease/chicago_rental.json',
    'residential/lease/houston_rental.json',
    'residential/lease/losangeles_rental.json',
    'residential/lease/newyork_rental.json',
    'residential/lease/philadelphia_rental.json',
    'residential/lease/phoenix_rental.json',
    'residential/lease/san_antonio_rental.json',
  ],
};

/**
 * Get commercial files to load based on location query
 * Returns targeted files if location matches, otherwise returns subset for initial load
 */
export function getCommercialFilesForLocation(location: string | null, status?: 'ForSale' | 'ForLease' | null): string[] {
  if (!location || location.trim() === '') {
    // No location specified - return a limited set for initial fast load
    // User can paginate to load more
    return [
      'commercial/commercial_dataset_17nov2025.json',
      'commercial/commercial_dataset2.json',
    ];
  }
  
  const normalizedLocation = location.toLowerCase().trim();
  
  // Check for exact match first
  if (COMMERCIAL_LOCATION_MAP[normalizedLocation]) {
    const files = [...COMMERCIAL_LOCATION_MAP[normalizedLocation]];
    
    // Add Crexi files for Miami
    if (normalizedLocation.includes('miami')) {
      if (status === 'ForSale') {
        files.push('miami_all_crexi_sale.json');
      } else if (status === 'ForLease') {
        files.push('miami_all_crexi_lease.json');
      } else {
        files.push(...CREXI_FILES);
      }
    }
    
    return files;
  }
  
  // Check for partial match
  for (const [key, files] of Object.entries(COMMERCIAL_LOCATION_MAP)) {
    if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
      const result = [...files];
      
      // Add Crexi files for Miami
      if (key.includes('miami')) {
        if (status === 'ForSale') {
          result.push('miami_all_crexi_sale.json');
        } else if (status === 'ForLease') {
          result.push('miami_all_crexi_lease.json');
        } else {
          result.push(...CREXI_FILES);
        }
      }
      
      return result;
    }
  }
  
  // No match found - return limited set for fast initial load
  return [
    'commercial/commercial_dataset_17nov2025.json',
    'commercial/commercial_dataset2.json',
  ];
}

/**
 * Get residential files to load based on location and listing type
 */
export function getResidentialFilesForLocation(
  location: string | null, 
  listingType: 'sale' | 'lease'
): string[] {
  if (!location || location.trim() === '') {
    // No location - return all files for that listing type
    return ALL_RESIDENTIAL_FILES[listingType];
  }
  
  const normalizedLocation = location.toLowerCase().trim();
  
  // Check for exact match first
  if (RESIDENTIAL_LOCATION_MAP[normalizedLocation]) {
    return RESIDENTIAL_LOCATION_MAP[normalizedLocation][listingType];
  }
  
  // Check for partial match
  for (const [key, files] of Object.entries(RESIDENTIAL_LOCATION_MAP)) {
    if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
      return files[listingType];
    }
  }
  
  // No match found - return all files for that listing type
  return ALL_RESIDENTIAL_FILES[listingType];
}

/**
 * Extract city name from a location string
 * e.g., "Houston, TX" -> "houston"
 */
export function extractCityFromLocation(location: string): string {
  if (!location) return '';
  
  // Remove state abbreviation and clean up
  const parts = location.split(',');
  const city = parts[0].trim().toLowerCase();
  
  return city;
}

/**
 * Check if a location has dedicated dataset files
 */
export function hasLocationData(location: string, type: 'commercial' | 'residential'): boolean {
  const normalizedLocation = location.toLowerCase().trim();
  
  if (type === 'commercial') {
    return Object.keys(COMMERCIAL_LOCATION_MAP).some(
      key => normalizedLocation.includes(key) || key.includes(normalizedLocation)
    );
  } else {
    return Object.keys(RESIDENTIAL_LOCATION_MAP).some(
      key => normalizedLocation.includes(key) || key.includes(normalizedLocation)
    );
  }
}

// Pagination constants
export const PROPERTIES_PER_PAGE = 20;

/**
 * Paginate an array of properties
 */
export function paginateProperties<T>(
  properties: T[],
  page: number,
  perPage: number = PROPERTIES_PER_PAGE
): { data: T[]; totalPages: number; totalCount: number; currentPage: number } {
  const totalCount = properties.length;
  const totalPages = Math.ceil(totalCount / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const data = properties.slice(startIndex, endIndex);
  
  return {
    data,
    totalPages,
    totalCount,
    currentPage,
  };
}

