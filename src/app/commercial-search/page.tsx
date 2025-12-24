'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MapView from '@/components/MapView';
import { addFavorite, removeFavorite, getAllFavorites } from '@/lib/indexedDB';
import { 
  Search, Loader2, Building2, 
  MapPin, Square, DollarSign,
  ChevronDown, X, Filter, ChevronLeft, ChevronRight, Heart, Map as MapIcon, List
} from 'lucide-react';
import { getCommercialFilesForLocation, CREXI_FILES } from '@/lib/location-file-mapper';
import Pagination from '@/components/Pagination';

// Commercial Property interface matching JSON structure
interface CommercialProperty {
  propertyId: string;
  listingType?: string;
  propertyType?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  address?: string;
  description?: string;
  listingUrl?: string;
  images?: string[];
  dataPoints?: string[];
  price?: string | null;
  priceNumeric?: number | null;
  priceCurrency?: string;
  isAuction?: boolean;
  auctionEndDate?: string | null;
  squareFootage?: string | null;
  buildingSize?: string | null;
  numberOfUnits?: number | null;
  brokerName?: string | null;
  brokerCompany?: string | null;
  propertyTypeDetailed?: string | null;
  capRate?: string | null;
  position?: number;
  availability?: string | null;
  // For map compatibility
  zpid?: string;
  latitude?: number;
  longitude?: number;
  imgSrc?: string | null;
  status?: string;
  [key: string]: any;
}

// All commercial files to load (including miami_all_crexi.json)
const COMMERCIAL_FILES = [
  'commercial_dataset_17nov2025.json',
  'commercial_dataset_Chicago.json',
  'commercial_dataset_houston.json',
  'commercial_dataset_LA.json',
  'commercial_dataset_ny.json',
  'commercial_dataset2.json',
  'dataset_manhattan_ny.json',
  'dataset_miami_beach.json',
  'dataset_miami_sale.json',
  'dataset_miamibeach_lease.json',
  'dataset_philadelphia_sale.json',
  'dataset_philadelphia.json',
  'dataset_phoenix.json',
  'dataset_san_antonio_sale.json',
  'dataset_son_antonio_lease.json',
  'dataset_las_vegas_sale.json',
  'dataset_lasvegas_lease.json',
  'dataset_austin_lease.json',
  'dataset_austin_sale.json',
  'dataset_los_angeles_lease.json',
  'dataset_los_angeles_sale.json',
  'dataset_sanfrancisco_lease.json',
  'dataset_sanfrancisco_sale.json',
];

// Crexi dataset files (loaded separately from root public folder)
const CREXI_SALE_FILE = 'miami_all_crexi_sale.json';
const CREXI_LEASE_FILE = 'miami_all_crexi_lease.json';


// Property types for filter
const PROPERTY_TYPE_OPTIONS = [
  { value: null, label: 'All Properties' },
  { value: 'Office', label: 'Office' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Multifamily', label: 'Multifamily' },
  { value: 'Industrial', label: 'Industrial' },
  { value: 'Land', label: 'Land' },
  { value: 'Hospitality', label: 'Hospitality' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Mixed Use', label: 'Mixed Use' },
];

// Price ranges
const PRICE_RANGES = [
  { value: null, label: 'Any Price' },
  { value: '0-500000', label: 'Under $500K', min: 0, max: 500000 },
  { value: '500000-1000000', label: '$500K - $1M', min: 500000, max: 1000000 },
  { value: '1000000-5000000', label: '$1M - $5M', min: 1000000, max: 5000000 },
  { value: '5000000-10000000', label: '$5M - $10M', min: 5000000, max: 10000000 },
  { value: '10000000-50000000', label: '$10M - $50M', min: 10000000, max: 50000000 },
  { value: '50000000+', label: '$50M+', min: 50000000, max: Infinity },
];

// Square footage ranges

function CommercialSearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL parameters
  const locationParam = searchParams.get('location') || '';
  const statusParam = searchParams.get('status') || '';
  const specificTypeParam = searchParams.get('specificType') || ''; // New: specific property type from hero
  
  // Read filter params from URL
  const priceParam = searchParams.get('price');
  const propertyTypeParam = searchParams.get('propertyType');

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

  // Reverse mapping: full name to abbreviation
  const STATE_NAME_TO_ABBREV: Record<string, string> = {};
  Object.entries(STATE_ABBREV).forEach(([abbrev, name]) => {
    STATE_NAME_TO_ABBREV[name] = abbrev;
  });

  // Normalize location for matching (keeps the search query intact for flexible matching)
  const normalizeLocation = (input: string): string => {
    let normalized = input.toLowerCase().trim();
    try {
      normalized = decodeURIComponent(normalized);
    } catch (e) {}
    // Special handling for Las Vegas - include North Las Vegas
    if (normalized === 'las vegas' || normalized === 'vegas') {
      normalized = 'las vegas'; // Normalize to "las vegas" to match both "Las Vegas" and "North Las Vegas"
    }
    // Special handling for San Francisco - normalize "SF" and "San Fran" to "san francisco"
    if (normalized === 'sf' || normalized === 'san fran') {
      normalized = 'san francisco';
    }
    return normalized;
  };

  // Extract state from search query and return both state code and name
  const extractStateFromQuery = (query: string): { code: string | null; name: string | null } => {
    const normalized = query.toLowerCase().trim();
    
    // Check for state abbreviation (2 letters, possibly with comma/space)
    const abbrevMatch = normalized.match(/\b([a-z]{2})\b/);
    if (abbrevMatch) {
      const abbrev = abbrevMatch[1];
      if (STATE_ABBREV[abbrev]) {
        return { code: abbrev.toUpperCase(), name: STATE_ABBREV[abbrev] };
      }
    }
    
    // Check for full state name
    for (const [abbrev, name] of Object.entries(STATE_ABBREV)) {
      if (normalized.includes(name)) {
        return { code: abbrev.toUpperCase(), name };
      }
    }
    
    return { code: null, name: null };
  };

  // Check if city matches search query (enhanced matching)
  const cityMatchesSearch = (city: string, search: string): boolean => {
    if (!city || !search) return false;
    const normalizedCity = city.toLowerCase().trim();
    const normalizedSearch = search.toLowerCase().trim();
    
    // Exact match first (highest priority)
    if (normalizedCity === normalizedSearch) return true;
    
    // Special handling for Las Vegas - match both "Las Vegas" and "North Las Vegas"
    if (normalizedSearch === 'las vegas' || normalizedSearch === 'vegas') {
      if (normalizedCity.includes('las vegas')) {
        return true; // Match "Las Vegas", "North Las Vegas", "Las Vegas Valley", etc.
      }
      return false; // Don't match other cities when searching for Las Vegas
    }
    
    // Special handling for San Francisco - match "SF", "San Francisco", "San Fran"
    // IMPORTANT: Must be strict to avoid matching "San Antonio"
    if (normalizedSearch === 'sf' || normalizedSearch === 'san francisco' || normalizedSearch === 'san fran') {
      if (normalizedCity === 'sf' || normalizedCity === 'san francisco' || normalizedCity.startsWith('san francisco')) {
        return true; // Match "SF", "San Francisco" exactly
      }
      return false; // Don't match other cities when searching for San Francisco
    }
    
    // Special handling for San Antonio - be strict to avoid matching "San Francisco"
    if (normalizedSearch === 'san antonio' || normalizedSearch === 'san anton') {
      if (normalizedCity === 'san antonio' || normalizedCity.startsWith('san antonio')) {
        return true; // Match "San Antonio" exactly
      }
      return false; // Don't match other cities when searching for San Antonio
    }
    
    // Special handling: if city is "SF" and search is "san francisco" or vice versa
    if ((normalizedCity === 'sf' && (normalizedSearch.includes('san francisco') || normalizedSearch === 'san fran')) ||
        ((normalizedCity.includes('san francisco') || normalizedCity === 'san fran') && normalizedSearch === 'sf')) {
      return true;
    }
    
    // For multi-word cities, check if search is a complete word/phrase match
    // This prevents "San" from matching both "San Francisco" and "San Antonio"
    const cityWords = normalizedCity.split(/\s+/);
    const searchWords = normalizedSearch.split(/\s+/);
    
    // If search has multiple words, city must start with or equal the search
    if (searchWords.length > 1) {
      if (normalizedCity.startsWith(normalizedSearch) || normalizedSearch.startsWith(normalizedCity)) {
        return true;
      }
      return false; // Don't do partial word matching for multi-word searches
    }
    
    // For single-word searches, check if city starts with that word (but be careful with "San")
    if (searchWords.length === 1) {
      const searchWord = searchWords[0];
      // Special case: "San" alone should not match cities starting with "San"
      // User should search for "San Francisco" or "San Antonio" specifically
      if (searchWord === 'san' && cityWords.length > 1) {
        return false; // Don't match "San Francisco" or "San Antonio" with just "San"
      }
      // Check if first word of city matches
      if (cityWords[0] === searchWord) {
        return true;
      }
    }
    
    // Last resort: contains match (but only if it's a meaningful match)
    // Avoid matching "San" in both "San Francisco" and "San Antonio"
    if (normalizedSearch.length >= 4 && (normalizedCity.includes(normalizedSearch) || normalizedSearch.includes(normalizedCity))) {
      return true;
    }
    
    return false;
  };

  // State
  const [allProperties, setAllProperties] = useState<CommercialProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<CommercialProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Map is desktop-only, no mobile toggle needed
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(locationParam);
  const [selectedListingType, setSelectedListingType] = useState<'sale' | 'lease' | null>(
    statusParam.toLowerCase().includes('lease') || statusParam.toLowerCase().includes('rent') ? 'lease' : 
    statusParam.toLowerCase().includes('sale') ? 'sale' : null
  );
  
  // Filter states - initialize from URL params
  // Priority: specificType (from hero) > propertyType (from URL persistence)
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(() => {
    // If specificType exists and is not 'All' or 'Commercial', use it
    if (specificTypeParam && specificTypeParam !== 'All' && specificTypeParam !== 'Commercial') {
      return specificTypeParam;
    }
    // Otherwise use propertyType if it's not 'Commercial'
    if (propertyTypeParam && propertyTypeParam !== 'Commercial') {
      return propertyTypeParam;
    }
    return null;
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(priceParam || null);

  // Dropdown open states
  const [listingTypeDropdownOpen, setListingTypeDropdownOpen] = useState(false);
  const [propertyTypeDropdownOpen, setPropertyTypeDropdownOpen] = useState(false);
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setListingTypeDropdownOpen(false);
        setPropertyTypeDropdownOpen(false);
        setPriceDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 20;
  
  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const allFavs = await getAllFavorites();
        const favIds = new Set(allFavs.map(f => f.propertyId));
        setFavorites(favIds);
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    };
    loadFavorites();
  }, []);
  
  const toggleFavorite = async (property: CommercialProperty) => {
    const id = property.propertyId;
    const isCurrentlyFavorite = favorites.has(id);
    
    try {
      if (isCurrentlyFavorite) {
        await removeFavorite(id);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        await addFavorite({
          id: `fav-${Date.now()}-${id}`,
          propertyId: id,
          address: property.address,
          price: formatPrice(property.price, property.priceNumeric),
          propertyType: (property.propertyType || property.propertyTypeDetailed) || undefined,
          imageUrl: property.images?.find(img => img && typeof img === 'string' && img.startsWith('http')) || undefined,
          city: property.city,
          state: typeof property.state === 'string' ? property.state : (property.state as any)?.code || '',
          dataSource: 'commercial',
          rawData: property,
          timestamp: Date.now(),
        });
        setFavorites(prev => new Set([...prev, id]));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Refs for property cards (for map interaction)
  const propertyRefs = useRef<globalThis.Map<string, HTMLDivElement>>(new globalThis.Map());

  // Helper to determine listing type from listingType string
  const getListingCategory = (listingType?: string): string => {
    if (!listingType) return 'unknown';
    const lt = listingType.toLowerCase();
    if (lt.includes('auction')) return 'auction';
    if (lt.includes('lease')) return 'lease';
    if (lt.includes('sale')) return 'sale';
    return 'unknown';
  };

  // Helper to parse square footage
  const parseSqft = (sqft?: string | null): number => {
    if (!sqft) return 0;
    return parseInt(sqft.replace(/[^0-9]/g, '')) || 0;
  };

  // Clean address - remove appended SF/Unit info
  const cleanAddress = (address?: string): string => {
    if (!address) return '';
    // Remove patterns like "52,030 SF Office Available", "685,000 SF Industrial", "47 Unit Multifamily"
    let cleaned = address
      .replace(/\d{1,3}(,\d{3})*\s*SF\s*(Office|Retail|Industrial|Multifamily|Available|Property|Commercial|Coworking)?\s*(Available)?/gi, '')
      .replace(/\d+\s*Unit\s*(Multifamily|Apartment|Residential)?/gi, '')
      .replace(/\d+\.\d+\s*AC\s*(Commercial|Residential|Industrial)?\s*(Lot)?/gi, '')
      .replace(/\d+\s*AC\s*(Commercial|Residential|Industrial)?\s*(Lot)?/gi, '')
      .trim();
    return cleaned || address;
  };

  // Get valid images from property
  const getValidImages = (images?: any[]): string[] => {
    if (!images || !Array.isArray(images)) return [];
    return images.filter(img => img && typeof img === 'string' && img.startsWith('http'));
  };

  // Calculate property completeness score (for sorting)
  const getCompletenessScore = (prop: CommercialProperty): number => {
    let score = 0;
    const validImages = getValidImages(prop.images);
    
    // Images are most important (0-50 points)
    if (validImages.length > 0) score += 30;
    if (validImages.length > 3) score += 10;
    if (validImages.length > 10) score += 10;
    
    // Price info (0-15 points)
    if (prop.price || prop.priceNumeric) score += 15;
    
    // Address quality (0-10 points)
    const cleanAddr = cleanAddress(prop.address);
    if (cleanAddr && cleanAddr.length > 10) score += 10;
    
    // Other details (0-25 points)
    if (prop.city) score += 3;
    if (prop.state) score += 2;
    if (prop.propertyType || prop.propertyTypeDetailed) score += 5;
    if (prop.squareFootage) score += 5;
    if (prop.description && prop.description.length > 20) score += 5;
    if (prop.dataPoints && prop.dataPoints.length > 0) score += 5;
    
    return score;
  };

  // Load commercial datasets based on location (smart loading for faster performance)
  useEffect(() => {
    const loadCommercialProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        const allProps: CommercialProperty[] = [];
        const seenIds = new Set<string>();
        
        // Import IndexedDB cache utilities
        const { getCachedProperties, saveCachedProperties, generateCacheKey } = await import('@/lib/indexeddb-cache');
        
        // Get files to load based on location (smart loading)
        const status = statusParam.toLowerCase().includes('lease') ? 'ForLease' : 
                       statusParam.toLowerCase().includes('sale') ? 'ForSale' : null;
        const filesToLoad = getCommercialFilesForLocation(locationParam, status);
        
        console.log(`📦 Smart loading: ${filesToLoad.length} files for location "${locationParam || 'all'}"`, filesToLoad);
        
        // Load only the relevant commercial dataset files
        for (const filepath of filesToLoad) {
          // Extract filename from path for cache key
          const filename = filepath.includes('/') ? filepath.split('/').pop()! : filepath;
          try {
            // Check cache first for transformed properties
            const cacheKey = generateCacheKey('commercial', { filename });
            let cachedTransformedProperties = await getCachedProperties(cacheKey);
            
            if (cachedTransformedProperties && cachedTransformedProperties.length > 0) {
              console.log(`✅ Using cached transformed properties for ${filename} (${cachedTransformedProperties.length} properties)`);
              // Add cached transformed properties directly to allProps
              cachedTransformedProperties.forEach((prop: CommercialProperty) => {
                if (!seenIds.has(prop.propertyId)) {
                  seenIds.add(prop.propertyId);
                  allProps.push(prop);
                }
              });
              continue; // Skip to next file
            }
            
            // Cache miss - fetch from network and transform
            const response = await fetch(`/${filepath}`);
            if (!response.ok) {
              continue;
            }
            
            const data = await response.json();
            const properties: any[] = Array.isArray(data) ? data : [];
            
            console.log(`📂 Fetched ${properties.length} properties from ${filepath}`);
            
            // Transform properties to match CommercialProperty interface
            const transformedProps: CommercialProperty[] = [];
            let loadedCount = 0;
            let skippedCount = 0;
            
            properties.forEach((prop, index) => {
                // Check if this is a Crexi-style format (Las Vegas datasets)
                const isCrexiSaleFormat = prop.locations && Array.isArray(prop.locations) && prop.locations.length > 0;
                const isCrexiLeaseFormat = prop.location && typeof prop.location === 'object' && prop.location.address;
                
                let propId: string;
                let city: string = '';
                let state: string = '';
                let zip: string = '';
                let address: string = '';
                let latitude: number | null = null;
                let longitude: number | null = null;
                let listingType: string = 'For Sale';
                let price: string | null = null;
                let priceNumeric: number | null = null;
                let squareFootage: string | null = null;
                let propertyType: string = 'Commercial';
                let images: string[] = [];
                let firstImage: string | null = null;
                let description: string = '';
                let listingUrl: string | undefined = undefined;
                let brokerCompany: string | null = null;
                
                if (isCrexiSaleFormat) {
                  // Crexi Sale format (dataset_las_vegas_sale.json)
                  const location = prop.locations[0];
                  propId = prop.id ? `crexi-sale-${prop.id}` : `${filename}-${index}`;
                  city = location.city || '';
                  state = typeof location.state === 'string' 
                    ? location.state 
                    : (location.state?.code || '');
                  zip = location.zip || '';
                  address = location.address || prop.name || '';
                  latitude = location.latitude || null;
                  longitude = location.longitude || null;
                  listingType = 'For Sale';
                  priceNumeric = prop.askingPrice || null;
                  price = prop.askingPrice ? `$${prop.askingPrice.toLocaleString()}` : null;
                  squareFootage = prop.squareFootage ? prop.squareFootage.toString() : null;
                  propertyType = prop.types && prop.types.length > 0 ? prop.types[0] : 'Commercial';
                  firstImage = prop.thumbnailUrl || null;
                  images = firstImage ? [firstImage] : [];
                  description = prop.description || prop.name || '';
                  listingUrl = prop.url || undefined;
                  brokerCompany = prop.brokerageName || null;
                } else if (isCrexiLeaseFormat) {
                  // Crexi Lease format (dataset_lasvegas_lease.json)
                  const location = prop.location;
                  if (!location || !location.city) {
                    // Skip properties without valid location data
                    skippedCount++;
                    return;
                  }
                  propId = prop.id ? `crexi-lease-${prop.id}` : `${filename}-${index}`;
                  city = location.city || '';
                  state = typeof location.state === 'string' 
                    ? location.state 
                    : (location.state?.code || '');
                  zip = location.zip || '';
                  address = location.address || prop.name || '';
                  latitude = location.latitude || null;
                  longitude = location.longitude || null;
                  listingType = 'For Lease';
                  // For lease, use rateYearly or rateMonthly
                  if (prop.rateYearlyMin || prop.rateYearlyMax) {
                    const rate = prop.rateYearlyMin || prop.rateYearlyMax;
                    price = `$${rate.toLocaleString()}/SF/yr`;
                    priceNumeric = rate;
                  } else if (prop.rateMonthly) {
                    price = prop.rateMonthly;
                    const rateMatch = prop.rateMonthly.match(/[\d.]+/);
                    if (rateMatch) {
                      priceNumeric = parseFloat(rateMatch[0]);
                    }
                  }
                  squareFootage = prop.rentableSqftMin || prop.rentableSqftMax 
                    ? (prop.rentableSqftMin && prop.rentableSqftMax && prop.rentableSqftMin !== prop.rentableSqftMax
                        ? `${prop.rentableSqftMin} - ${prop.rentableSqftMax}`
                        : (prop.rentableSqftMin || prop.rentableSqftMax)?.toString() || undefined)
                    : undefined;
                  propertyType = prop.types && prop.types.length > 0 ? prop.types[0] : 'Commercial';
                  firstImage = prop.thumbnailUrl || null;
                  images = firstImage ? [firstImage] : [];
                  description = prop.description || prop.name || '';
                  listingUrl = prop.url || undefined;
                  brokerCompany = prop.brokerageName || null;
                } else {
                  // Standard format (existing datasets)
                  propId = prop.propertyId || `${filename}-${index}`;
                  city = prop.city || '';
                  state = prop.state || '';
                  zip = prop.zip || prop.zipcode || '';
                  address = prop.address || '';
                  latitude = prop.latitude || prop.lat || null;
                  longitude = prop.longitude || prop.lng || prop.lon || null;
                  
                  // Determine listing type from listingType field
                  if (prop.listingType) {
                    const lt = prop.listingType.toLowerCase();
                    if (lt.includes('lease') || lt.includes('rent')) {
                      listingType = 'For Lease';
                    } else if (lt.includes('sale') || lt.includes('auction')) {
                      listingType = 'For Sale';
                    }
                  }
                  
                  // Extract price
                  if (prop.price) {
                    if (typeof prop.price === 'string') {
                      price = prop.price;
                      const priceMatch = prop.price.match(/[\d,]+/);
                      if (priceMatch) {
                        priceNumeric = parseFloat(priceMatch[0].replace(/,/g, ''));
                      }
                    } else if (typeof prop.price === 'number') {
                      priceNumeric = prop.price;
                      price = `$${prop.price.toLocaleString()}`;
                    }
                  }
                  
                  // Extract square footage
                  if (prop.squareFootage) {
                    squareFootage = typeof prop.squareFootage === 'string' ? prop.squareFootage : prop.squareFootage.toString();
                  } else if (prop.buildingSize) {
                    squareFootage = typeof prop.buildingSize === 'string' ? prop.buildingSize : prop.buildingSize.toString();
                  }
                  
                  // Extract images - handle both string arrays and object arrays with url property
                  if (Array.isArray(prop.images)) {
                    images = prop.images
                      .map((img: any) => {
                        if (typeof img === 'string') return img;
                        if (img && typeof img === 'object' && img.url) return img.url;
                        return null;
                      })
                      .filter((url: string | null): url is string => url !== null);
                  } else {
                    images = [];
                  }
                  firstImage = images[0] || null;
                  
                  propertyType = prop.propertyType || 'Commercial';
                  description = prop.description || '';
                  listingUrl = prop.listingUrl || undefined;
                  brokerCompany = prop.brokerCompany || null;
                }
                
                // Skip duplicates
                if (seenIds.has(propId)) {
                  skippedCount++;
                  return;
                }
                seenIds.add(propId);
                loadedCount++;
                
                // Transform to CommercialProperty format
                const transformedProp: CommercialProperty = {
                  propertyId: propId,
                  listingType: listingType,
                  propertyType: propertyType,
                  propertyTypeDetailed: prop.types && prop.types.length > 1 ? prop.types.join(', ') : propertyType,
                  city: city,
                  state: state,
                  zip: zip,
                  country: 'USA',
                  address: address,
                  description: description,
                  listingUrl: listingUrl,
                  images: images,
                  dataPoints: Array.isArray(prop.dataPoints) ? prop.dataPoints : [],
                  price: price,
                  priceNumeric: priceNumeric,
                  priceCurrency: prop.priceCurrency || 'USD',
                  isAuction: prop.isAuction || (prop.listingType?.toLowerCase().includes('auction') || false),
                  auctionEndDate: prop.auctionEndDate || null,
                  squareFootage: squareFootage,
                  buildingSize: prop.buildingSize || (squareFootage ? `${squareFootage} SF` : null),
                  numberOfUnits: prop.numberOfUnits || prop.numberOfSuites || null,
                  brokerName: prop.brokerName || null,
                  brokerCompany: brokerCompany,
                  capRate: prop.capRate || null,
                  position: index,
                  availability: prop.availability || prop.status || null,
                  // For map and display compatibility
                  zpid: propId,
                  imgSrc: firstImage,
                  status: listingType,
                  latitude: latitude ?? undefined,
                  longitude: longitude ?? undefined,
                };
                
                transformedProps.push(transformedProp);
                allProps.push(transformedProp);
            });
            
            console.log(`✅ Added ${loadedCount} properties from ${filename} (skipped ${skippedCount} duplicates/invalid)`);
            
            // Save transformed properties to cache
            if (transformedProps.length > 0) {
              await saveCachedProperties(cacheKey, transformedProps, {
                filename,
                propertyType: 'commercial',
              });
            }
            
            // Debug: Show city distribution for Las Vegas datasets
            if (filename.includes('las_vegas') || filename.includes('las-vegas')) {
              const lasVegasProps = allProps.filter(p => 
                p.city && (p.city.toLowerCase().includes('las vegas') || p.city.toLowerCase().includes('north las vegas'))
              );
              const cities = [...new Set(allProps.slice(-loadedCount).map(p => p.city).filter(Boolean))];
              console.log(`📍 Las Vegas dataset cities: ${cities.slice(0, 10).join(', ')}${cities.length > 10 ? '...' : ''}`);
              console.log(`🎰 Las Vegas properties in loaded set: ${lasVegasProps.length}`);
            }
          } catch (err) {
            console.warn(`⚠️ Failed to load ${filename}:`, err);
          }
        }

        // Load Crexi SALE dataset from root public folder (miami_all_crexi_sale.json)
        // Only load when selectedListingType is 'sale' or null (all properties)
        if (selectedListingType === 'sale' || selectedListingType === null) {
          try {
            const crexiResponse = await fetch(`/${CREXI_SALE_FILE}`);
            if (crexiResponse.ok) {
              const crexiData = await crexiResponse.json();
              const crexiProperties: any[] = Array.isArray(crexiData) ? crexiData : [];
              
              console.log(`📦 Loading ${crexiProperties.length} SALE properties from ${CREXI_SALE_FILE}`);
              
              // Transform Crexi properties to match CommercialProperty interface
              const transformedCrexi = crexiProperties.map((prop, index) => {
              // Extract images from media array
              const mediaImages = prop.media && Array.isArray(prop.media) 
                ? prop.media.filter((m: any) => m.type === 'Image' && m.imageUrl).map((m: any) => m.imageUrl)
                : [];
              
              const firstImage = mediaImages[0] || prop.thumbnailUrl || null;
              
              // Extract location data
              const location = prop.locations?.[0] || {};
              const address = location.address || prop.name || '';
              const city = location.city || '';
              const state = location.state?.code || '';
              const zip = location.zip || '';
              
              // Extract neighborhood from urlSlug
              const neighborhood = prop.urlSlug 
                ? prop.urlSlug.replace(/^florida-/, '').replace(/-/g, ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                : '';
              
              return {
                propertyId: prop.id ? `crexi-${prop.id}` : `crexi-${index}`,
                listingType: 'For Sale', // Most Crexi properties are for sale
                propertyType: prop.types?.[0] || 'Commercial',
                propertyTypeDetailed: prop.types?.join(', ') || null,
                city: city,
                state: state,
                zip: zip,
                country: 'USA',
                address: address,
                addressCleaned: address,
                description: prop.description || prop.name || '',
                listingUrl: prop.url || null,
                images: mediaImages,
                dataPoints: [],
                price: prop.askingPrice ? `$${prop.askingPrice.toLocaleString()}` : null,
                priceNumeric: prop.askingPrice || null,
                priceCurrency: 'USD',
                isAuction: false,
                auctionEndDate: null,
                squareFootage: null,
                buildingSize: null,
                numberOfUnits: prop.numberOfUnits || null,
                brokerName: null,
                brokerCompany: prop.brokerageName || null,
                capRate: prop.capRate ? `${prop.capRate}%` : null,
                position: index,
                availability: prop.status || null,
                // For map and display compatibility
                zpid: prop.id ? `crexi-${prop.id}` : `crexi-${index}`,
                imgSrc: firstImage,
                status: 'For Sale',
                latitude: location.latitude,
                longitude: location.longitude,
                validImageCount: mediaImages.length,
                // Additional Crexi-specific data
                crexiData: {
                  name: prop.name,
                  urlSlug: prop.urlSlug,
                  neighborhood: neighborhood,
                  county: location.county,
                  numberOfImages: prop.numberOfImages || mediaImages.length,
                  pricePerSqFt: prop.pricePerSqFt,
                  pricePerUnit: prop.pricePerUnit,
                  netOperatingIncome: prop.netOperatingIncome,
                  lotSizeAcres: prop.lotSizeAcres,
                  fullData: prop, // Store full Crexi data for detail page
                },
              };
            });
            
              allProps.push(...transformedCrexi);
              console.log(`✅ Added ${transformedCrexi.length} Crexi SALE properties`);
            }
          } catch (err) {
            console.warn(`Failed to load ${CREXI_SALE_FILE}:`, err);
          }
        } else {
          console.log(`⏭️ Skipping Crexi SALE dataset (filter is set to '${selectedListingType}')`);
        }

        // Load Crexi LEASE dataset from root public folder (miami_all_crexi_lease.json)
        // Only load when selectedListingType is 'lease' or null (all properties)
        if (selectedListingType === 'lease' || selectedListingType === null) {
          try {
            const crexiLeaseResponse = await fetch(`/${CREXI_LEASE_FILE}`);
            if (crexiLeaseResponse.ok) {
              const crexiLeaseData = await crexiLeaseResponse.json();
              const crexiLeaseProperties: any[] = Array.isArray(crexiLeaseData) ? crexiLeaseData : [];
              
              console.log(`📦 Loading ${crexiLeaseProperties.length} LEASE properties from ${CREXI_LEASE_FILE}`);
              
              // Transform Crexi LEASE properties to match CommercialProperty interface
              const transformedCrexiLease = crexiLeaseProperties.map((prop, index) => {
                // Extract images from media array (if exists) or use thumbnailUrl
                const mediaImages = prop.media && Array.isArray(prop.media) 
                  ? prop.media.filter((m: any) => m.type === 'Image' && m.imageUrl).map((m: any) => m.imageUrl)
                  : [];
                
                const firstImage = mediaImages[0] || prop.thumbnailUrl || null;
                
                // Extract location data (lease structure uses "location" not "locations")
                const location = prop.location || {};
                const address = location.address || prop.name || '';
                const city = location.city || '';
                const state = location.state?.code || '';
                const zip = location.zip || '';
                
                // Extract neighborhood from urlSlug
                const neighborhood = prop.urlSlug 
                  ? prop.urlSlug.replace(/^florida-/, '').replace(/-/g, ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                  : '';
                
                return {
                  propertyId: prop.id ? `crexi-lease-${prop.id}` : `crexi-lease-${index}`,
                  listingType: 'For Lease',
                  propertyType: prop.types?.[0] || 'Commercial',
                  propertyTypeDetailed: prop.types?.join(', ') || null,
                  city: city,
                  state: state,
                  zip: zip,
                  country: 'USA',
                  address: address,
                  addressCleaned: address,
                  description: prop.description || prop.name || '',
                  listingUrl: prop.url || null,
                  images: mediaImages.length > 0 ? mediaImages : (firstImage ? [firstImage] : []),
                  dataPoints: [],
                  price: prop.rentMin || prop.rentMax ? `$${(prop.rentMin || prop.rentMax || 0).toLocaleString()}/mo` : null,
                  priceNumeric: prop.rentMin || prop.rentMax || null,
                  priceCurrency: 'USD',
                  isAuction: false,
                  auctionEndDate: null,
                  squareFootage: prop.rentableSqftMin || prop.rentableSqftMax || null,
                  buildingSize: prop.rentableSqftMin && prop.rentableSqftMax ? `${prop.rentableSqftMin.toLocaleString()} - ${prop.rentableSqftMax.toLocaleString()} SF` : null,
                  numberOfUnits: prop.numberOfSuites || null,
                  brokerName: null,
                  brokerCompany: prop.brokerageName || null,
                  capRate: null,
                  position: index,
                  availability: prop.status || null,
                  // For map and display compatibility
                  zpid: prop.id ? `crexi-lease-${prop.id}` : `crexi-lease-${index}`,
                  imgSrc: firstImage,
                  status: 'For Lease',
                  latitude: location.latitude,
                  longitude: location.longitude,
                  validImageCount: mediaImages.length > 0 ? mediaImages.length : (firstImage ? 1 : 0),
                  // Additional Crexi-specific data
                  crexiData: {
                    name: prop.name,
                    urlSlug: prop.urlSlug,
                    neighborhood: neighborhood,
                    county: location.county,
                    numberOfImages: prop.numberOfImages || mediaImages.length,
                    rentableSqftMin: prop.rentableSqftMin,
                    rentableSqftMax: prop.rentableSqftMax,
                    rateType: prop.rateType,
                    numberOfSuites: prop.numberOfSuites,
                    fullData: prop, // Store full Crexi data for detail page
                  },
                };
              });
              
              allProps.push(...transformedCrexiLease);
              console.log(`✅ Added ${transformedCrexiLease.length} Crexi LEASE properties`);
            }
          } catch (err) {
            console.warn(`Failed to load ${CREXI_LEASE_FILE}:`, err);
          }
        } else {
          console.log(`⏭️ Skipping Crexi LEASE dataset (filter is set to '${selectedListingType}')`);
        }

        console.log(`✅ Load complete: ${allProps.length} total commercial properties from all datasets`);
        
        // Debug: Show unique cities loaded
        const uniqueCities = [...new Set(allProps.map(p => p.city).filter(c => c))];
        console.log(`📍 Cities loaded:`, uniqueCities.sort());
        
        // Debug: Show Las Vegas properties count if location is Las Vegas
        if (locationParam && (locationParam.toLowerCase().includes('las vegas') || locationParam.toLowerCase().includes('vegas'))) {
          const lasVegasProps = allProps.filter(p => 
            p.city && (p.city.toLowerCase().includes('las vegas') || p.city.toLowerCase().includes('north las vegas'))
          );
          console.log(`🎰 Las Vegas properties loaded: ${lasVegasProps.length} out of ${allProps.length} total`);
          console.log(`🎰 Las Vegas properties by listing type:`, {
            sale: lasVegasProps.filter(p => p.listingType === 'For Sale').length,
            lease: lasVegasProps.filter(p => p.listingType === 'For Lease').length,
          });
        }
        
        setAllProperties(allProps);
        
      } catch (err) {
        console.error('Error loading commercial properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to load commercial properties');
      } finally {
        setLoading(false);
      }
    };

    loadCommercialProperties();
  }, [selectedListingType, locationParam, statusParam]); // Reload when listing type filter or location changes

  // Get price range object from selected value
  const getPriceRange = (value: string | null) => {
    if (!value) return null;
    return PRICE_RANGES.find(r => r.value === value) || null;
  };


  // Apply filters
  useEffect(() => {
    let filtered = [...allProperties];
    const normalizedSearch = normalizeLocation(searchQuery);

    // Filter by listing type (sale/lease)
    if (selectedListingType) {
      filtered = filtered.filter(p => {
        const category = getListingCategory(p.listingType);
        return category === selectedListingType;
      });
    }

    // Filter by search query (city, address, zip, state, street names, etc.)
    if (normalizedSearch) {
      console.log(`🔍 Filtering by search query: "${normalizedSearch}"`);
      const beforeFilter = filtered.length;
      
      // Extract state information from search query
      const stateInfo = extractStateFromQuery(normalizedSearch);
      
      filtered = filtered.filter(p => {
        const city = (p.city || '').toLowerCase();
        const address = (p.address || '').toLowerCase();
        const zip = (p.zip || '').toLowerCase();
        const description = (p.description || '').toLowerCase();
        
        // Handle state as string or object (Crexi format)
        let stateStr = '';
        let stateCode = '';
        let stateName = '';
        if (typeof p.state === 'string') {
          stateStr = p.state.toLowerCase();
          stateCode = p.state.toUpperCase();
          stateName = STATE_ABBREV[p.state.toLowerCase()] || '';
        } else if (p.state && typeof p.state === 'object') {
          const stateObj = p.state as any;
          stateCode = (stateObj.code || '').toUpperCase();
          stateName = (stateObj.name || '').toLowerCase();
          stateStr = stateCode.toLowerCase() || stateName;
        }
        
        // 1. City matching (enhanced) - HIGHEST PRIORITY
        if (cityMatchesSearch(city, normalizedSearch)) {
          return true;
        }
        
        // 2. Address matching (full address and individual street names)
        // But be strict: if search is a known city name, don't match on partial words
        const isKnownCitySearch = normalizedSearch === 'san francisco' || normalizedSearch === 'sf' || normalizedSearch === 'san fran' ||
                                   normalizedSearch === 'san antonio' || normalizedSearch === 'las vegas' ||
                                   normalizedSearch === 'vegas' || normalizedSearch === 'los angeles' ||
                                   normalizedSearch === 'la' || normalizedSearch === 'new york' ||
                                   normalizedSearch === 'nyc' || normalizedSearch === 'miami' ||
                                   normalizedSearch === 'chicago' || normalizedSearch === 'houston' ||
                                   normalizedSearch === 'austin' || normalizedSearch === 'phoenix' ||
                                   normalizedSearch === 'philadelphia' || normalizedSearch === 'philly';
        
        // Full address match (always allowed)
        if (address.includes(normalizedSearch)) {
          return true;
        }
        
        // For known city searches, don't match on individual words to avoid false matches
        // (e.g., "San" matching both "San Francisco" and "San Antonio" properties)
        if (!isKnownCitySearch) {
          // Check if any word in the search query matches the address
          const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length >= 2);
          for (const word of searchWords) {
            // Skip common words that might cause false matches
            if (word === 'san' || word === 'los' || word === 'new' || word.length < 3) {
              continue;
            }
            if (address.includes(word)) {
              return true;
            }
          }
        }
        
        // 3. ZIP code matching
        if (zip.includes(normalizedSearch)) {
          return true;
        }
        
        // 4. State matching (code and name)
        if (stateInfo.code) {
          // Search query contains a state code/name
          if (stateCode === stateInfo.code || stateName === stateInfo.name) {
            return true;
          }
        } else {
          // Check if search query matches state code or name
          if (stateStr && (stateStr.includes(normalizedSearch) || normalizedSearch.includes(stateStr))) {
            return true;
          }
          if (stateCode && normalizedSearch === stateCode.toLowerCase()) {
            return true;
          }
          if (stateName && normalizedSearch.includes(stateName)) {
            return true;
          }
        }
        
        // 5. Description matching - only if not a known city search (to avoid false matches)
        // For city searches, we want to match primarily on city, not description
        if (!isKnownCitySearch && description.includes(normalizedSearch)) {
          return true;
        }
        
        // 6. Full address matching (if property has a fullAddress field)
        const fullAddress = (p as any).fullAddress || '';
        if (fullAddress && typeof fullAddress === 'string') {
          const fullAddressLower = fullAddress.toLowerCase();
          // For known city searches, check if the full address actually contains the city name
          if (isKnownCitySearch) {
            // Only match if the full address contains the exact city name
            if (normalizedSearch === 'sf' || normalizedSearch === 'san fran') {
              if (fullAddressLower.includes('san francisco')) {
                return true;
              }
            } else if (fullAddressLower.includes(normalizedSearch)) {
              return true;
            }
          } else {
            if (fullAddressLower.includes(normalizedSearch)) {
              return true;
            }
          }
        }
        
        // 7. Property name/title matching (if available) - only if not a known city search
        if (!isKnownCitySearch) {
          const propertyName = (p as any).name || (p as any).title || '';
          if (propertyName && typeof propertyName === 'string') {
            if (propertyName.toLowerCase().includes(normalizedSearch)) {
              return true;
            }
          }
        }
        
        return false;
      });
      console.log(`✅ Filtered from ${beforeFilter} to ${filtered.length} properties`);
      
      // Debug: Show sample cities from filtered results
      if (filtered.length > 0) {
        const sampleCities = [...new Set(filtered.slice(0, 10).map(p => p.city))];
        console.log(`📍 Sample cities in filtered results:`, sampleCities);
      } else {
        console.log(`⚠️ No properties match search query "${normalizedSearch}"`);
        // Debug: Show sample cities from all properties
        const allCities = [...new Set(allProperties.slice(0, 20).map(p => p.city))];
        console.log(`📍 Sample cities in all properties:`, allCities);
      }
    }

    // Filter by property type
    if (selectedPropertyType) {
      filtered = filtered.filter(p => {
        const propType = (p.propertyType || p.propertyTypeDetailed || '').toLowerCase();
        return propType.includes(selectedPropertyType.toLowerCase());
      });
    }

    // Filter by price
    const priceRange = getPriceRange(selectedPriceRange);
    if (priceRange && priceRange.min !== undefined && priceRange.max !== undefined) {
      filtered = filtered.filter(p => {
        const price = p.priceNumeric || 0;
        return price >= priceRange.min! && price <= priceRange.max!;
      });
    }

    // Sort: City match first, then images, then completeness, then price
    filtered.sort((a, b) => {
      // First: If searching by city, prioritize exact city matches
      if (normalizedSearch) {
        const aCity = a.city || '';
        const bCity = b.city || '';
        // Exact city match gets highest priority
        const aExactMatch = aCity.toLowerCase() === normalizedSearch ? 2 : (cityMatchesSearch(aCity, normalizedSearch) ? 1 : 0);
        const bExactMatch = bCity.toLowerCase() === normalizedSearch ? 2 : (cityMatchesSearch(bCity, normalizedSearch) ? 1 : 0);
        if (bExactMatch !== aExactMatch) return bExactMatch - aExactMatch;
      }

      // Second: Properties with images come first
      const aImageCount = getValidImages(a.images).length;
      const bImageCount = getValidImages(b.images).length;
      const aHasImages = aImageCount > 0 ? 1 : 0;
      const bHasImages = bImageCount > 0 ? 1 : 0;
      if (bHasImages !== aHasImages) return bHasImages - aHasImages;
      
      // Third: More images = higher priority
      if (bImageCount !== aImageCount) return bImageCount - aImageCount;
      
      // Fourth: If property type is selected, show matching ones first
      if (selectedPropertyType) {
        const aMatches = (a.propertyType || '').toLowerCase().includes(selectedPropertyType.toLowerCase()) ? 1 : 0;
        const bMatches = (b.propertyType || '').toLowerCase().includes(selectedPropertyType.toLowerCase()) ? 1 : 0;
        if (bMatches !== aMatches) return bMatches - aMatches;
      }
      
      // Fifth: Sort by completeness score (more details = higher)
      const scoreA = getCompletenessScore(a);
      const scoreB = getCompletenessScore(b);
      if (scoreB !== scoreA) return scoreB - scoreA;
      
      // Sixth: Sort by price (highest first)
      const priceA = a.priceNumeric || 0;
      const priceB = b.priceNumeric || 0;
      if (priceB !== priceA) return priceB - priceA;
      
      return (a.position || 0) - (b.position || 0);
    });

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [allProperties, searchQuery, selectedListingType, selectedPropertyType, selectedPriceRange]);

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const currentProperties = filteredProperties.slice(startIndex, startIndex + propertiesPerPage);

  // Format price
  const formatPrice = (price?: string | null, priceNumeric?: number | null) => {
    if (price) return price;
    if (priceNumeric) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(priceNumeric);
    }
    return 'Contact for Price';
  };

  // Format square footage
  const formatSqft = (sqft?: string | number | null) => {
    if (!sqft) return null;
    const sqftStr = String(sqft);
    return sqftStr.includes('SF') ? sqftStr : `${sqftStr} SF`;
  };

  // Get listing type badge color
  const getListingBadgeColor = (listingType?: string) => {
    const category = getListingCategory(listingType);
    switch (category) {
      case 'sale': return 'bg-orange-500 text-white';
      case 'lease': return 'bg-green-500 text-white';
      case 'auction': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Get listing type label
  const getListingLabel = (listingType?: string) => {
    const category = getListingCategory(listingType);
    switch (category) {
      case 'sale': return 'For Sale';
      case 'lease': return 'For Lease';
      case 'auction': return 'Auction';
      default: return 'Commercial';
    }
  };

  const handlePropertyClick = (property: CommercialProperty) => {
    sessionStorage.setItem(`commercial_property_${property.propertyId}`, JSON.stringify(property));
    sessionStorage.setItem('commercial_source', 'commercial-search');
    // Navigate to commercial property detail page
    router.push(`/commercial/${encodeURIComponent(property.propertyId)}`);
  };

  const clearFilters = () => {
    setSelectedListingType(null);
    setSelectedPropertyType(null);
    setSelectedPriceRange(null);
    setSearchQuery('');
  };

  const activeFiltersCount = [selectedListingType, selectedPropertyType, selectedPriceRange, searchQuery].filter(v => v !== null && v !== '').length;

  // Handle marker click - scroll to property in list
  // Update URL params when filters change
  const updateURLWithFilters = useCallback((filters: {
    propertyType?: string | null;
    price?: string | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove filter params
    if (filters.propertyType !== undefined) {
      if (filters.propertyType !== null) {
        params.set('propertyType', filters.propertyType);
      } else {
        params.delete('propertyType');
      }
    }
    if (filters.price !== undefined) {
      if (filters.price !== null) {
        params.set('price', filters.price);
      } else {
        params.delete('price');
      }
    }
    
    // Update URL without reload
    router.replace(`/commercial-search?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Update URL when filters change
  useEffect(() => {
    updateURLWithFilters({
      propertyType: selectedPropertyType,
      price: selectedPriceRange
    });
  }, [selectedPropertyType, selectedPriceRange, updateURLWithFilters]);

  const handleMarkerClick = useCallback((propertyId: string) => {
    // Navigate directly to property detail page
    const property = filteredProperties.find(p => p.zpid === propertyId || p.propertyId === propertyId);
    if (property) {
      // Store in sessionStorage for detail page
      sessionStorage.setItem(`commercial_property_${propertyId}`, JSON.stringify(property));
      // Navigate to commercial property detail page
      router.push(`/commercial/${encodeURIComponent(propertyId)}`);
    }
  }, [filteredProperties, router]);

  const handlePropertyHover = useCallback((propertyId: string | null) => {
    setHighlightedPropertyId(propertyId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is applied through the useEffect
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden pt-[40px] md:pt-[68px]">
      {/* Header Section with Filters - z-index higher than map */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-3 py-2 md:px-6 md:py-3 flex-shrink-0 relative z-[1000]">
        <div className="max-w-[1920px] mx-auto">
          {/* Title Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3 mb-2 md:mb-4">
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold text-primary-black">
                <span className="text-accent-yellow">Commercial</span> Properties
                {searchQuery && <span className="text-gray-500 text-sm md:text-base font-normal ml-2">in &quot;{searchQuery}&quot;</span>}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                  {filteredProperties.length} of {allProperties.length} properties
                </span>
              </div>
            </div>
            
            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by city, address, or zip..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Filters Row - All dropdowns have high z-index to appear above map */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 relative z-[500]">
            {/* Listing Type Dropdown (Sale/Lease) */}
            <div className="relative">
              <button
                onClick={() => {
                  setListingTypeDropdownOpen(!listingTypeDropdownOpen);
                  setPropertyTypeDropdownOpen(false);
                  setPriceDropdownOpen(false);
                }}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm transition-all border ${
                  selectedListingType
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {selectedListingType === 'sale' ? 'For Sale' : selectedListingType === 'lease' ? 'For Lease' : 'All Listings'}
                <ChevronDown size={14} className={`transition-transform ${listingTypeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {listingTypeDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-[1000] max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedListingType(null);
                      setListingTypeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedListingType === null ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    All Listings
                  </button>
                  <button
                    onClick={() => {
                      setSelectedListingType('sale');
                      setListingTypeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedListingType === 'sale' ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    For Sale
                  </button>
                  <button
                    onClick={() => {
                      setSelectedListingType('lease');
                      setListingTypeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedListingType === 'lease' ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    For Lease
                  </button>
                </div>
              )}
            </div>

            {/* Property Type Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setPropertyTypeDropdownOpen(!propertyTypeDropdownOpen);
                  setListingTypeDropdownOpen(false);
                  setPriceDropdownOpen(false);
                }}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm transition-all border ${
                  selectedPropertyType
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <Building2 size={14} className="hidden md:block" />
                Type: {selectedPropertyType || 'All'}
                <ChevronDown size={14} className={`transition-transform ${propertyTypeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {propertyTypeDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-[1000] max-h-64 overflow-y-auto">
                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value ?? 'all'}
                      onClick={() => {
                        setSelectedPropertyType(option.value);
                        setPropertyTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedPropertyType === option.value ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setPriceDropdownOpen(!priceDropdownOpen);
                  setListingTypeDropdownOpen(false);
                  setPropertyTypeDropdownOpen(false);
                }}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm transition-all border ${
                  selectedPriceRange
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <DollarSign size={14} className="hidden md:block" />
                Price: {selectedPriceRange ? PRICE_RANGES.find(r => r.value === selectedPriceRange)?.label : 'Any'}
                <ChevronDown size={14} className={`transition-transform ${priceDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {priceDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[1000] max-h-64 overflow-y-auto">
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.value ?? 'any'}
                      onClick={() => {
                        setSelectedPriceRange(range.value);
                        setPriceDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedPriceRange === range.value ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>


            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Full width on mobile, split on desktop */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Map - Desktop only, hidden on mobile (all pin CSS and geocoding logic remains intact) */}
        <div className="hidden md:block w-full md:w-1/2 h-full relative z-[10]">
          {/* Map Component - Desktop only, all pin CSS and geocoding logic intact */}
          {loading ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : (
            filteredProperties.length > 0 && (
              <MapView
                properties={filteredProperties as any}
                centerLocation={searchQuery || locationParam || 'United States'}
                onMarkerClick={handleMarkerClick}
                onMarkerHover={handlePropertyHover}
                highlightedPropertyId={highlightedPropertyId}
                showResidential={false}
                showCommercial={true}
              />
            )
          )}
        </div>

        {/* Property List - Full width on mobile, right side on desktop */}
        <div className="flex w-full md:w-1/2 h-full flex-col overflow-hidden bg-gray-50">
          {/* Scrollable Property List */}
          <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading commercial properties...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-800 mb-4">{error}</p>
                <Link href="/">
                  <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                    Go Home
                  </button>
                </Link>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && filteredProperties.length === 0 && allProperties.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 md:p-8 text-center">
                <Filter className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-yellow-800 font-medium mb-2">No properties match your search</p>
                <p className="text-yellow-600 text-sm mb-4">Try adjusting your search or filter criteria</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Properties Grid */}
            {!loading && !error && currentProperties.length > 0 && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                  {currentProperties.map((property) => {
                    const propertyId = property.propertyId;
                    // Get first valid image URL
                    const imageUrl = property.images?.find(img => img && typeof img === 'string' && img.startsWith('http'));
                    
                    return (
                      <div
                        key={propertyId}
                        ref={(el) => {
                          if (el) propertyRefs.current.set(propertyId, el);
                        }}
                        onMouseEnter={() => handlePropertyHover(propertyId)}
                        onMouseLeave={() => handlePropertyHover(null)}
                        onClick={() => handlePropertyClick(property)}
                        className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl border-2 ${
                          highlightedPropertyId === propertyId 
                            ? 'border-orange-500 shadow-lg scale-[1.01]' 
                            : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        {/* Image */}
                        <div className="relative h-36 md:h-44 bg-gray-200 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={property.address || 'Commercial Property'}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                const fallback = document.createElement('div');
                                fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9,3 9,21"></polyline><polyline points="15,3 15,21"></polyline><polyline points="3,9 21,9"></polyline><polyline points="3,15 21,15"></polyline></svg>';
                                target.parentElement?.appendChild(fallback);
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <Building2 size={48} />
                            </div>
                          )}
                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold shadow ${getListingBadgeColor(property.listingType)}`}>
                              {getListingLabel(property.listingType)}
                            </span>
                            {property.propertyType && (
                              <span className="px-2 py-1 rounded-md text-xs font-bold shadow bg-gray-800 text-white">
                                {property.propertyType}
                              </span>
                            )}
                          </div>
                          {/* Heart Icon */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(property);
                            }}
                            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-20 ${
                              favorites.has(property.propertyId)
                                ? 'bg-accent-yellow text-primary-black'
                                : 'bg-white text-primary-black hover:bg-accent-yellow'
                            }`}
                          >
                            <Heart size={16} fill={favorites.has(property.propertyId) ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-3">
                          {/* Price */}
                          <div className="text-base md:text-lg font-bold text-gray-900 mb-1">
                            {formatPrice(property.price, property.priceNumeric)}
                          </div>

                          {/* Address */}
                          <div className="flex items-start gap-1.5 mb-2">
                            <MapPin size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-gray-600 line-clamp-2">
                              <div className="font-medium text-gray-800">
                                {(property as any).addressCleaned || cleanAddress(property.address) || 'Address Not Available'}
                              </div>
                              <div>{[
                                property.city, 
                                typeof property.state === 'string' ? property.state : (property.state as any)?.code || '', 
                                property.zip
                              ].filter(Boolean).join(', ')}</div>
                            </div>
                          </div>

                          {/* Property Details */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                            {property.squareFootage && (
                              <div className="flex items-center gap-1">
                                <Square size={12} className="text-orange-500" />
                                <span>{formatSqft(property.squareFootage)}</span>
                              </div>
                            )}
                            {property.numberOfUnits && (
                              <div className="flex items-center gap-1">
                                <Building2 size={12} className="text-orange-500" />
                                <span>{property.numberOfUnits} Units</span>
                              </div>
                            )}
                            {property.capRate && (
                              <div className="flex items-center gap-1">
                                <DollarSign size={12} className="text-green-500" />
                                <span>Cap: {property.capRate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={filteredProperties.length}
                    perPage={propertiesPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}

            {/* No Properties Loaded */}
            {!loading && allProperties.length === 0 && (
              <div className="bg-gray-100 rounded-xl p-8 md:p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No Commercial Properties Found</h2>
                <p className="text-gray-500 mb-6">Unable to load commercial property data</p>
                <Link href="/">
                  <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
                    Go to Home Page
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommercialSearchPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col pt-[40px] md:pt-[68px]">
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="animate-spin text-orange-500 mx-auto mb-4" size={48} />
            <p className="text-gray-600 font-medium">Loading commercial properties...</p>
          </div>
        </div>
      </div>
    }>
      <CommercialSearchPageContent />
    </Suspense>
  );
}

