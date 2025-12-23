/**
 * Comprehensive Dataset Mapping Configuration
 * Pre-build mapping of all files, locations, field mappings, and filter keywords
 * This ensures proper file loading and filtering across the application
 */

// ============================================================================
// FILE LOCATIONS AND STRUCTURE
// ============================================================================

export const FILE_STRUCTURE = {
  commercial: {
    basePath: '/commercial',
    files: [
      'commercial_dataset_17nov2025.json',
      'commercial_dataset_Chicago.json',
      'commercial_dataset_houston.json',
      'commercial_dataset_LA.json',
      'commercial_dataset_ny.json',
      'commercial_dataset2.json',
      'dataset_austin_lease.json',
      'dataset_austin_sale.json',
      'dataset_las_vegas_sale.json',
      'dataset_lasvegas_lease.json',
      'dataset_los_angeles_lease.json',
      'dataset_los_angeles_sale.json',
      'dataset_manhattan_ny.json',
      'dataset_miami_beach.json',
      'dataset_miami_sale.json',
      'dataset_miamibeach_lease.json',
      'dataset_philadelphia_sale.json',
      'dataset_philadelphia.json',
      'dataset_phoenix.json',
      'dataset_san_antonio_sale.json',
      'dataset_son_antonio_lease.json',
      'dataset_sanfrancisco_lease.json',
      'dataset_sanfrancisco_sale.json',
    ],
  },
  residential: {
    basePath: '/residential',
    folders: {
      sale: '/residential/sale',
      lease: '/residential/lease',
    },
    cities: {
      'miami': {
        sale: 'miami_sale.json',
        lease: 'miami_rental.json',
      },
      'miami beach': {
        sale: 'miami_beach_sale.json',
        lease: 'miami_beach_rental.json',
      },
      'new york': {
        sale: 'new_york_sale.json',
        lease: 'newyork_rental.json',
      },
      'los angeles': {
        sale: 'losangeles_sale.json',
        lease: 'losangeles_rental.json',
      },
      'las vegas': {
        sale: 'las_vegas_sale.json',
        lease: 'lasvegas_rental.json',
      },
      'chicago': {
        sale: 'chicago_sale.json',
        lease: 'chicago_rental.json',
      },
      'houston': {
        sale: 'houston_sale.json',
        lease: 'houston_rental.json',
      },
      'philadelphia': {
        sale: 'philadelphia_rental.json',
        lease: 'philadelphia_rental.json',
      },
      'phoenix': {
        sale: 'phoenix_rental.json',
        lease: 'phoenix_rental.json',
      },
      'san antonio': {
        sale: 'san-antonio_sale.json',
        lease: 'san_antonio_rental.json',
      },
    },
  },
  crexi: {
    basePath: '/',
    files: {
      sale: 'miami_all_crexi_sale.json',
      lease: 'miami_all_crexi_lease.json',
    },
  },
} as const;

// ============================================================================
// CITY TO DATASET MAPPING (COMMERCIAL)
// ============================================================================

export const COMMERCIAL_CITY_DATASETS: Record<string, {
  sale?: string[];
  lease?: string[];
  general?: string[]; // Files that contain both sale and lease
  crexi?: ('sale' | 'lease')[]; // Crexi files to include
}> = {
  'chicago': {
    sale: ['commercial_dataset_Chicago.json'],
    lease: ['commercial_dataset_Chicago.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'houston': {
    sale: ['commercial_dataset_houston.json'],
    lease: ['commercial_dataset_houston.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'los angeles': {
    sale: ['commercial_dataset_LA.json', 'dataset_los_angeles_sale.json'],
    lease: ['commercial_dataset_LA.json', 'dataset_los_angeles_lease.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'la': {
    sale: ['commercial_dataset_LA.json', 'dataset_los_angeles_sale.json'],
    lease: ['commercial_dataset_LA.json', 'dataset_los_angeles_lease.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'new york': {
    sale: ['commercial_dataset_ny.json', 'dataset_manhattan_ny.json'],
    lease: ['commercial_dataset_ny.json', 'dataset_manhattan_ny.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'ny': {
    sale: ['commercial_dataset_ny.json', 'dataset_manhattan_ny.json'],
    lease: ['commercial_dataset_ny.json', 'dataset_manhattan_ny.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'nyc': {
    sale: ['commercial_dataset_ny.json', 'dataset_manhattan_ny.json'],
    lease: ['commercial_dataset_ny.json', 'dataset_manhattan_ny.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'manhattan': {
    sale: ['dataset_manhattan_ny.json'],
    lease: ['dataset_manhattan_ny.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'miami': {
    sale: ['dataset_miami_sale.json'],
    lease: [],
    general: ['commercial_dataset2.json'],
    crexi: ['sale', 'lease'],
  },
  'miami beach': {
    sale: ['dataset_miami_beach.json', 'dataset_miami_sale.json'],
    lease: ['dataset_miamibeach_lease.json'],
    general: ['commercial_dataset2.json'],
    crexi: ['sale', 'lease'],
  },
  'philadelphia': {
    sale: ['dataset_philadelphia_sale.json', 'dataset_philadelphia.json'],
    lease: ['dataset_philadelphia.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'philly': {
    sale: ['dataset_philadelphia_sale.json', 'dataset_philadelphia.json'],
    lease: ['dataset_philadelphia.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'phoenix': {
    sale: ['dataset_phoenix.json'],
    lease: ['dataset_phoenix.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'san antonio': {
    sale: ['dataset_san_antonio_sale.json'],
    lease: ['dataset_son_antonio_lease.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'las vegas': {
    sale: ['dataset_las_vegas_sale.json'],
    lease: ['dataset_lasvegas_lease.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'vegas': {
    sale: ['dataset_las_vegas_sale.json'],
    lease: ['dataset_lasvegas_lease.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'austin': {
    sale: ['dataset_austin_sale.json'],
    lease: ['dataset_austin_lease.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'san francisco': {
    sale: ['dataset_sanfrancisco_sale.json'],
    lease: ['dataset_sanfrancisco_lease.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'sf': {
    sale: ['dataset_sanfrancisco_sale.json'],
    lease: ['dataset_sanfrancisco_lease.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
  'san fran': {
    sale: ['dataset_sanfrancisco_sale.json'],
    lease: ['dataset_sanfrancisco_lease.json'],
    general: ['commercial_dataset_17nov2025.json', 'commercial_dataset2.json'],
  },
} as const;

// ============================================================================
// FIELD MAPPINGS FOR FILTERING
// ============================================================================

export const FIELD_MAPPINGS = {
  // Listing Type Fields
  listingType: {
    sale: ['For Sale', 'Sale', 'sale', 'FOR_SALE', 'for_sale', 'SALE'],
    lease: ['For Lease', 'Lease', 'lease', 'Rent', 'rent', 'FOR_LEASE', 'for_lease', 'RENTAL', 'rental'],
  },
  
  // Property Type Fields
  propertyType: {
    residential: ['Residential', 'residential', 'RESIDENTIAL', 'House', 'house', 'Home', 'home'],
    commercial: ['Commercial', 'commercial', 'COMMERCIAL', 'Office', 'office', 'Retail', 'retail'],
    office: ['Office', 'office', 'OFFICE', 'Office Space', 'office space'],
    retail: ['Retail', 'retail', 'RETAIL', 'Retail Space', 'retail space'],
    multifamily: ['Multifamily', 'multifamily', 'MULTIFAMILY', 'Multi-family', 'multi-family'],
    industrial: ['Industrial', 'industrial', 'INDUSTRIAL', 'Warehouse', 'warehouse'],
    land: ['Land', 'land', 'LAND', 'Lot', 'lot'],
    hospitality: ['Hospitality', 'hospitality', 'HOSPITALITY', 'Hotel', 'hotel'],
    healthcare: ['Healthcare', 'healthcare', 'HEALTHCARE', 'Medical', 'medical'],
    mixedUse: ['Mixed Use', 'mixed use', 'MIXED_USE', 'Mixed-Use', 'mixed-use'],
  },
  
  // Address Fields
  address: {
    street: ['street', 'streetAddress', 'street_address', 'address', 'Address', 'streetName'],
    city: ['city', 'City', 'locality', 'Locality', 'municipality'],
    state: ['state', 'State', 'region', 'Region', 'stateCode', 'state_code'],
    zip: ['zip', 'Zip', 'zipcode', 'zipCode', 'postalCode', 'postal_code', 'postcode'],
  },
  
  // Price Fields
  price: {
    numeric: ['price', 'Price', 'listPrice', 'list_price', 'askingPrice', 'asking_price', 'priceNumeric', 'price_numeric'],
    display: ['price', 'Price', 'price_display', 'priceDisplay', 'formattedPrice'],
  },
  
  // Property Details Fields
  details: {
    beds: ['beds', 'Beds', 'bedrooms', 'Bedrooms', 'bed_count', 'bedCount'],
    baths: ['baths', 'Baths', 'bathrooms', 'Bathrooms', 'bath_count', 'bathCount'],
    squareFootage: ['squareFootage', 'square_footage', 'sqft', 'Sqft', 'sqFt', 'squareFeet', 'area'],
    buildingSize: ['buildingSize', 'building_size', 'size', 'Size'],
  },
  
  // Location Fields (for coordinates)
  coordinates: {
    latitude: ['latitude', 'Latitude', 'lat', 'Lat', 'y', 'Y'],
    longitude: ['longitude', 'Longitude', 'lng', 'Lng', 'lon', 'Lon', 'x', 'X'],
  },
  
  // Image Fields
  images: {
    primary: ['imgSrc', 'img_src', 'image', 'Image', 'thumbnailUrl', 'thumbnail_url', 'photo', 'Photo'],
    array: ['images', 'Images', 'photos', 'Photos', 'media', 'Media'],
  },
} as const;

// ============================================================================
// FILTER KEYWORDS
// ============================================================================

export const FILTER_KEYWORDS = {
  // Listing Type Keywords
  listingType: {
    sale: ['sale', 'for sale', 'buy', 'purchase', 'selling'],
    lease: ['lease', 'rent', 'rental', 'for lease', 'for rent', 'leasing'],
  },
  
  // Property Type Keywords
  propertyType: {
    residential: ['residential', 'house', 'home', 'apartment', 'condo', 'townhouse'],
    commercial: ['commercial', 'business', 'office', 'retail', 'warehouse'],
    office: ['office', 'office space', 'workspace', 'corporate'],
    retail: ['retail', 'store', 'shop', 'shopping', 'storefront'],
    multifamily: ['multifamily', 'multi-family', 'apartment building', 'apartments'],
    industrial: ['industrial', 'warehouse', 'manufacturing', 'distribution'],
    land: ['land', 'lot', 'parcel', 'acreage', 'vacant'],
    hospitality: ['hotel', 'motel', 'hospitality', 'lodging'],
    healthcare: ['medical', 'healthcare', 'hospital', 'clinic'],
    mixedUse: ['mixed use', 'mixed-use', 'mixed', 'combination'],
  },
  
  // City/Location Keywords (for search matching)
  cities: {
    'miami': ['miami', 'miami beach', 'miami-dade', 'dade county'],
    'miami beach': ['miami beach', 'south beach', 'sobe'],
    'new york': ['new york', 'nyc', 'new york city', 'manhattan', 'brooklyn', 'queens'],
    'los angeles': ['los angeles', 'la', 'l.a.', 'hollywood', 'beverly hills'],
    'las vegas': ['las vegas', 'vegas', 'north las vegas', 'henderson', 'clark county'],
    'chicago': ['chicago', 'chi', 'windy city'],
    'houston': ['houston', 'h-town'],
    'philadelphia': ['philadelphia', 'philly', 'phila'],
    'phoenix': ['phoenix', 'phx'],
    'san antonio': ['san antonio', 'sa'],
    'austin': ['austin', 'atx'],
    'san francisco': ['san francisco', 'sf', 'san fran', 'bay area'],
  },
  
  // State Keywords
  states: {
    'florida': ['fl', 'florida', 'fla'],
    'california': ['ca', 'california', 'cali'],
    'new york': ['ny', 'new york'],
    'texas': ['tx', 'texas'],
    'illinois': ['il', 'illinois'],
    'nevada': ['nv', 'nevada'],
    'arizona': ['az', 'arizona'],
    'pennsylvania': ['pa', 'pennsylvania'],
  },
} as const;

// ============================================================================
// DATA FORMAT MAPPINGS (for different dataset structures)
// ============================================================================

export const DATA_FORMATS = {
  // Crexi Sale Format
  crexiSale: {
    id: 'id',
    locations: 'locations',
    askingPrice: 'askingPrice',
    squareFootage: 'squareFootage',
    types: 'types',
    thumbnailUrl: 'thumbnailUrl',
    description: 'description',
    url: 'url',
    brokerageName: 'brokerageName',
    media: 'media',
  },
  
  // Crexi Lease Format
  crexiLease: {
    id: 'id',
    location: 'location',
    rateYearlyMin: 'rateYearlyMin',
    rateYearlyMax: 'rateYearlyMax',
    rateMonthly: 'rateMonthly',
    rentableSqftMin: 'rentableSqftMin',
    rentableSqftMax: 'rentableSqftMax',
    types: 'types',
    thumbnailUrl: 'thumbnailUrl',
    description: 'description',
    url: 'url',
    brokerageName: 'brokerageName',
    numberOfSuites: 'numberOfSuites',
  },
  
  // Standard Commercial Format
  standardCommercial: {
    propertyId: 'propertyId',
    city: 'city',
    state: 'state',
    zip: 'zip',
    address: 'address',
    listingType: 'listingType',
    propertyType: 'propertyType',
    price: 'price',
    squareFootage: 'squareFootage',
    images: 'images',
    latitude: 'latitude',
    longitude: 'longitude',
  },
  
  // Residential Format
  residential: {
    zpid: 'zpid',
    address: 'address',
    city: 'city',
    state: 'state',
    zipcode: 'zipcode',
    listPrice: 'listPrice',
    beds: 'beds',
    baths: 'baths',
    squareFootage: 'squareFootage',
    photos: 'photos',
    coordinates: 'coordinates',
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get full file path for a commercial dataset file
 */
export function getCommercialFilePath(filename: string): string {
  return `${FILE_STRUCTURE.commercial.basePath}/${filename}`;
}

/**
 * Get full file path for a residential dataset file
 */
export function getResidentialFilePath(city: string, listingType: 'sale' | 'lease'): string | null {
  const cityLower = city.toLowerCase();
  const cityData = FILE_STRUCTURE.residential.cities[cityLower as keyof typeof FILE_STRUCTURE.residential.cities];
  
  if (!cityData) return null;
  
  const fileName = listingType === 'sale' ? cityData.sale : cityData.lease;
  const folder = listingType === 'sale' ? 'sale' : 'lease';
  
  return `${FILE_STRUCTURE.residential.folders[folder]}/${fileName}`;
}

/**
 * Get Crexi file path
 */
export function getCrexiFilePath(listingType: 'sale' | 'lease'): string {
  const fileName = listingType === 'sale' 
    ? FILE_STRUCTURE.crexi.files.sale 
    : FILE_STRUCTURE.crexi.files.lease;
  return `${FILE_STRUCTURE.crexi.basePath}${fileName}`;
}

/**
 * Check if a field value matches a filter keyword
 */
export function matchesFilterKeyword(value: string, keywords: readonly string[]): boolean {
  const normalizedValue = value.toLowerCase().trim();
  return keywords.some(keyword => 
    normalizedValue === keyword.toLowerCase() || 
    normalizedValue.includes(keyword.toLowerCase()) ||
    keyword.toLowerCase().includes(normalizedValue)
  );
}

/**
 * Get all files for a city and listing type (commercial)
 */
export function getCommercialFilesForCity(
  city: string, 
  listingType: 'sale' | 'lease' | null
): { commercialFiles: string[]; crexiFiles: string[] } {
  const normalizedCity = city.toLowerCase().trim();
  const cityData = COMMERCIAL_CITY_DATASETS[normalizedCity];
  
  if (!cityData) {
    return { commercialFiles: [], crexiFiles: [] };
  }
  
  const filesToLoad = new Set<string>();
  
  // Always add general files first
  if (cityData.general) {
    cityData.general.forEach(file => filesToLoad.add(file));
  }
  
  // Add sale files
  if (listingType === 'sale' || listingType === null) {
    if (cityData.sale) {
      cityData.sale.forEach(file => filesToLoad.add(file));
    }
  }
  
  // Add lease files
  if (listingType === 'lease' || listingType === null) {
    if (cityData.lease) {
      cityData.lease.forEach(file => filesToLoad.add(file));
    }
  }
  
  // Separate commercial and Crexi files
  const commercialFiles: string[] = [];
  const crexiFiles: string[] = [];
  
  filesToLoad.forEach(file => {
    if (file === FILE_STRUCTURE.crexi.files.sale || file === FILE_STRUCTURE.crexi.files.lease) {
      crexiFiles.push(file);
    } else {
      commercialFiles.push(file);
    }
  });
  
  // Add Crexi files if specified
  if (cityData.crexi) {
    if ((listingType === 'sale' || listingType === null) && cityData.crexi.includes('sale')) {
      crexiFiles.push(FILE_STRUCTURE.crexi.files.sale);
    }
    if ((listingType === 'lease' || listingType === null) && cityData.crexi.includes('lease')) {
      crexiFiles.push(FILE_STRUCTURE.crexi.files.lease);
    }
  }
  
  return { commercialFiles, crexiFiles };
}

