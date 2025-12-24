'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MapView from '@/components/MapView';
import { addFavorite, removeFavorite, getAllFavorites } from '@/lib/indexedDB';
import { 
  Search, Loader2, Home, 
  MapPin, Bed, Bath, Square, 
  ChevronDown, X, ChevronLeft, ChevronRight, Heart, Map as MapIcon, List
} from 'lucide-react';
import Pagination from '@/components/Pagination';

// Property interface matching JSON structure
interface Property {
  address?: {
    street?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
  };
  state?: string;
  baths?: number;
  beds?: number;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  photos?: Array<{ href?: string } | string>;
  listPrice?: number;
  lastSoldPrice?: number;
  price?: number | string;
  price_display?: string;
  sqft?: number;
  year_built?: number;
  property_type?: string;
  listingDescription?: string;
  zpid?: string;
  imgSrc?: string | null;
  images?: string[];
  city?: string;
  latitude?: number;
  longitude?: number;
  zipcode?: string;
  propertyType?: string;
  status?: string;
  [key: string]: any;
}

// City to file mapping
const CITY_FILE_MAP: Record<string, { lease: string; sale: string }> = {
  'miami beach': { lease: 'miami_beach_rental.json', sale: 'miami_beach_sale.json' },
  'miami': { lease: 'miami_rental.json', sale: 'miami_sale.json' },
  'new york': { lease: 'newyork_rental.json', sale: 'new_york_sale.json' },
  'los angeles': { lease: 'losangeles_rental.json', sale: 'losangeles_sale.json' },
  'las vegas': { lease: 'lasvegas_rental.json', sale: 'las_vegas_sale.json' },
  'chicago': { lease: 'chicago_rental.json', sale: 'chicago_sale.json' },
  'houston': { lease: 'houston_rental.json', sale: 'houston_sale.json' },
  'philadelphia': { lease: 'philadelphia_rental.json', sale: 'philadelphia_sale.json' },
  'phoenix': { lease: 'phoenix_rental.json', sale: 'phoenix_sale.json' },
  'san antonio': { lease: 'san_antonio_rental.json', sale: 'san-antonio_sale.json' },
};

function ResidentialSearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL parameters
  const location = searchParams.get('location') || '';
  const statusParam = searchParams.get('status') || 'ForSale';
  const propertyTypeParam = searchParams.get('propertyType') || 'Residential';
  
  // Read filter params from URL
  const bedsParam = searchParams.get('beds');
  const bathsParam = searchParams.get('baths');
  const priceParam = searchParams.get('price');
  
  // Determine if it's for rent or sale
  const isForRent = statusParam.toLowerCase().includes('rent') || statusParam.toLowerCase().includes('lease');
  const listingType: 'lease' | 'sale' = isForRent ? 'lease' : 'sale';

  // State
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);
  
  // Filter states - initialize from URL params
  const [selectedBeds, setSelectedBeds] = useState<number | null>(bedsParam ? parseInt(bedsParam) : null);
  const [selectedBaths, setSelectedBaths] = useState<number | null>(bathsParam ? parseInt(bathsParam) : null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(priceParam || null);

  // Price range options (different for sale vs rent)
  const SALE_PRICE_RANGES = [
    { value: '0-500000', label: 'Under $500K', min: 0, max: 500000 },
    { value: '500000-1000000', label: '$500K - $1M', min: 500000, max: 1000000 },
    { value: '1000000-2000000', label: '$1M - $2M', min: 1000000, max: 2000000 },
    { value: '2000000-5000000', label: '$2M - $5M', min: 2000000, max: 5000000 },
    { value: '5000000-10000000', label: '$5M - $10M', min: 5000000, max: 10000000 },
    { value: '10000000+', label: '$10M+', min: 10000000, max: Infinity },
  ];

  const RENT_PRICE_RANGES = [
    { value: '0-2000', label: 'Under $2K', min: 0, max: 2000 },
    { value: '2000-3500', label: '$2K - $3.5K', min: 2000, max: 3500 },
    { value: '3500-5000', label: '$3.5K - $5K', min: 3500, max: 5000 },
    { value: '5000-7500', label: '$5K - $7.5K', min: 5000, max: 7500 },
    { value: '7500-10000', label: '$7.5K - $10K', min: 7500, max: 10000 },
    { value: '10000+', label: '$10K+', min: 10000, max: Infinity },
  ];

  const BEDROOM_OPTIONS = [
    { value: null, label: 'Any' },
    { value: 1, label: '1+' },
    { value: 2, label: '2+' },
    { value: 3, label: '3+' },
    { value: 4, label: '4+' },
    { value: 5, label: '5+' },
    { value: 6, label: '6+' },
    { value: 7, label: '7+' },
    { value: 8, label: '8+' },
    { value: 9, label: '9+' },
    { value: 10, label: '10+' },
    { value: 11, label: '11+' },
    { value: 12, label: '12+' },
  ];

  const BATHROOM_OPTIONS = [
    { value: null, label: 'Any' },
    { value: 1, label: '1+' },
    { value: 2, label: '2+' },
    { value: 3, label: '3+' },
    { value: 4, label: '4+' },
    { value: 5, label: '5+' },
    { value: 6, label: '6+' },
    { value: 7, label: '7+' },
    { value: 8, label: '8+' },
    { value: 9, label: '9+' },
    { value: 10, label: '10+' },
    { value: 11, label: '11+' },
    { value: 12, label: '12+' },
  ];

  // Dropdown open states
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
  const [bedsDropdownOpen, setBedsDropdownOpen] = useState(false);
  const [bathsDropdownOpen, setBathsDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is inside any dropdown button or dropdown menu
      const isInsideDropdown = target.closest('[data-dropdown-container]') ||
                               target.closest('[data-dropdown-menu]') ||
                               target.closest('button[data-dropdown-trigger]');
      if (!isInsideDropdown) {
        setPriceDropdownOpen(false);
        setBedsDropdownOpen(false);
        setBathsDropdownOpen(false);
      }
    };
    // Use capture phase to handle clicks properly
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
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
  
  const toggleFavorite = async (property: Property) => {
    const id = property.zpid || `prop-${property.address?.street || 'unknown'}`;
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
        const imageUrl = getImageUrl(property);
        await addFavorite({
          id: `fav-${Date.now()}-${id}`,
          propertyId: id,
          address: typeof property.address === 'string' ? property.address : property.address?.street,
          price: property.listPrice ? `$${property.listPrice.toLocaleString()}` : property.price_display || 'Price on request',
          propertyType: property.property_type || property.propertyType || 'Residential',
          imageUrl: imageUrl || undefined,
          city: property.city || property.address?.locality,
          state: property.state || property.address?.region,
          dataSource: 'residential',
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

  // Normalize city name for matching
  const normalizeCity = (input: string): string => {
    let normalized = input.toLowerCase().trim();
    try {
      normalized = decodeURIComponent(normalized);
    } catch (e) {}
    
    // Remove state abbreviations
    normalized = normalized
      .replace(/,\s*(fl|florida|ca|california|ny|new york|il|illinois|tx|texas|az|arizona|pa|pennsylvania|nv|nevada)/gi, '')
            .trim();
          
    return normalized;
  };

  // Find matching city
  const findMatchingCity = (input: string): string | null => {
    const normalized = normalizeCity(input);
    
    // Try exact match first
    if (CITY_FILE_MAP[normalized]) {
      return normalized;
    }
    
    // Try partial match (sorted by length to prioritize longer matches like "miami beach" over "miami")
    const sortedCities = Object.keys(CITY_FILE_MAP).sort((a, b) => b.length - a.length);
    for (const city of sortedCities) {
      if (normalized.includes(city) || city.includes(normalized)) {
        return city;
      }
    }
    
    return null;
  };

  // Load properties with IndexedDB caching
  useEffect(() => {
    if (!location) return;

    const loadProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        const matchedCity = findMatchingCity(location);
        
        if (!matchedCity) {
          setError(`No properties found for "${location}". Try: Miami, Miami Beach, Los Angeles, Chicago, Houston, New York, Philadelphia, Phoenix, San Antonio, Las Vegas`);
          setAllProperties([]);
          setLoading(false);
          return;
        }

        const fileInfo = CITY_FILE_MAP[matchedCity];
        const fileName = listingType === 'lease' ? fileInfo.lease : fileInfo.sale;
        const filePath = `/residential/${listingType}/${fileName}`;

        // Check IndexedDB cache first
        const { getCachedProperties, saveCachedProperties, generateCacheKey } = await import('@/lib/indexeddb-cache');
        const cacheKey = generateCacheKey('residential', {
          location: matchedCity,
          listingType,
        });

        let cachedProperties = await getCachedProperties(cacheKey);
        
        if (cachedProperties && cachedProperties.length > 0) {
          console.log(`✅ Using cached properties for ${matchedCity} (${cachedProperties.length} properties)`);
          setAllProperties(cachedProperties);
          setCurrentPage(1);
          setLoading(false);
          return;
        }

        // Cache miss - fetch from network
        console.log(`📁 Loading properties from: ${filePath}`);

        const response = await fetch(filePath);
        
        if (!response.ok) {
          throw new Error(`Failed to load properties: ${response.statusText}`);
        }

        const data = await response.json();
        let propertiesArray: Property[] = Array.isArray(data) ? data : data.properties || [];
        
        // Shuffle properties for different order each time
        // Always shuffle for Miami and Miami Beach, shuffle others only on initial load
        const isMiami = matchedCity.toLowerCase() === 'miami' || matchedCity.toLowerCase() === 'miami beach';
        const shuffleKey = `shuffle-${matchedCity}-${listingType}`;
        const lastShuffleSeed = sessionStorage.getItem(shuffleKey);
        // Always shuffle for Miami/Miami Beach, shuffle others only on initial load
        if (isMiami || !lastShuffleSeed) {
          // Fisher-Yates shuffle algorithm for random order
          for (let i = propertiesArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [propertiesArray[i], propertiesArray[j]] = [propertiesArray[j], propertiesArray[i]];
          }
          
          sessionStorage.setItem(shuffleKey, Date.now().toString());
        }
        
        // Transform properties to have required fields for MapView
        const transformedProperties = propertiesArray.map((prop, index) => {
          const addr = prop.address || {};
          return {
            ...prop,
            zpid: prop.zpid || `prop-${index}`,
            city: addr.locality || prop.city || matchedCity,
            state: addr.region || prop.state || '',
            zipcode: addr.postalCode || prop.zipcode || '',
            latitude: prop.coordinates?.latitude || prop.latitude,
            longitude: prop.coordinates?.longitude || prop.longitude,
            imgSrc: getImageUrl(prop),
            status: isForRent ? 'For Rent' : 'For Sale',
            propertyType: prop.property_type || 'Residential',
          };
        });
        
        console.log(`✅ Loaded ${transformedProperties.length} properties from ${fileName}`);
        
        // Save to IndexedDB cache
        await saveCachedProperties(cacheKey, transformedProperties, {
          location: matchedCity,
          listingType,
          propertyType: 'residential',
        });
        
        setAllProperties(transformedProperties);
        setCurrentPage(1);

      } catch (err) {
        console.error('Error loading properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to load properties');
        setAllProperties([]);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [location, listingType, isForRent]);

  // Get price range object from selected value
  const getPriceRange = (value: string | null) => {
    if (!value) return null;
    const ranges = isForRent ? RENT_PRICE_RANGES : SALE_PRICE_RANGES;
    return ranges.find(r => r.value === value) || null;
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...allProperties];

    // Apply bedroom filter (1+ means >= 1, etc.)
    if (selectedBeds !== null) {
      filtered = filtered.filter(p => (p.beds || 0) >= selectedBeds);
    }

    // Apply bathroom filter (1+ means >= 1, etc.)
    if (selectedBaths !== null) {
      filtered = filtered.filter(p => (p.baths || 0) >= selectedBaths);
    }

    // Apply price filter (use listPrice from JSON)
    const priceRange = getPriceRange(selectedPriceRange);
    if (priceRange) {
      filtered = filtered.filter(p => {
        const price = p.listPrice || 0;
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    // Sort by price (high to low) by default
    filtered.sort((a, b) => (b.listPrice || 0) - (a.listPrice || 0));

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [allProperties, selectedBeds, selectedBaths, selectedPriceRange, isForRent]);

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const currentProperties = filteredProperties.slice(startIndex, startIndex + propertiesPerPage);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedBeds !== null) {
      params.set('beds', selectedBeds.toString());
    } else {
      params.delete('beds');
    }
    
    if (selectedBaths !== null) {
      params.set('baths', selectedBaths.toString());
    } else {
      params.delete('baths');
    }
    
    if (selectedPriceRange) {
      params.set('price', selectedPriceRange);
    } else {
      params.delete('price');
    }
    
    // Update URL without reloading
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedBeds, selectedBaths, selectedPriceRange, searchParams]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedBeds(null);
    setSelectedBaths(null);
    setSelectedPriceRange(null);
    setPriceDropdownOpen(false);
    setBedsDropdownOpen(false);
    setBathsDropdownOpen(false);
  };

  // Check if any filters are active
  const hasActiveFilters = selectedBeds !== null || selectedBaths !== null || selectedPriceRange !== null;

  // Helper functions
  const formatPrice = (price?: number | string) => {
    if (!price) return 'Price on Request';
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, '')) : price;
    if (isNaN(numPrice)) return 'Price on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  function getImageUrl(property: Property): string | null {
    if (property.imgSrc) return property.imgSrc;
    if (property.photos && property.photos.length > 0) {
      const firstPhoto = property.photos[0];
      if (typeof firstPhoto === 'string') return firstPhoto;
      if (firstPhoto && typeof firstPhoto === 'object' && firstPhoto.href) return firstPhoto.href;
    }
    if (property.images && property.images.length > 0) return property.images[0];
    return null;
  }

  const getAddress = (property: Property) => {
    if (property.address) {
      const { street, locality, region, postalCode } = property.address;
      return {
        street: street || 'Unknown Street',
        city: locality || property.city || 'Unknown City',
        state: region || property.state || '',
        zip: postalCode || property.zipcode || ''
      };
    }
    return { 
      street: 'Unknown', 
      city: property.city || 'Unknown', 
      state: property.state || '', 
      zip: property.zipcode || '' 
    };
  };

  const handlePropertyClick = (property: Property, index: number) => {
    // Use bit field if available, otherwise fallback to index
    const bit = property.bit || (startIndex + index);
    const propertyId = `${listingType}_${location}_${bit}`;
    sessionStorage.setItem(`json_property_${propertyId}`, JSON.stringify(property));
    sessionStorage.setItem('json_current_source', JSON.stringify({ folder: listingType, file: location }));
    // Use new URL format with bit in path: /jsondetailinfo/bit[bitNumber]?id=...
    router.push(`/jsondetailinfo/bit${bit}?id=${encodeURIComponent(propertyId)}`);
  };

  // Handle marker click - navigate to property detail page (same as card click)
  const handleMarkerClick = useCallback((propertyId: string) => {
    // Find property in allProperties by zpid or propertyId
    const property = allProperties.find(p => 
      p.zpid === propertyId || 
      `prop-${allProperties.indexOf(p)}` === propertyId ||
      propertyId.includes(p.zpid || '') ||
      (p.zpid && propertyId.includes(p.zpid))
    );
    
    if (property) {
      // Use bit field if available, otherwise fallback to index
      const bit = property.bit || allProperties.indexOf(property);
      const detailId = `${listingType}_${location}_${bit}`;
      
      sessionStorage.setItem(`json_property_${detailId}`, JSON.stringify(property));
      sessionStorage.setItem('json_current_source', JSON.stringify({ folder: listingType, file: location }));
      // Use new URL format with bit in path
      router.push(`/jsondetailinfo/bit${bit}?id=${encodeURIComponent(detailId)}`);
    } else {
      // Fallback: try to find by zpid directly
      const fallbackProperty = allProperties.find(p => p.zpid === propertyId);
      if (fallbackProperty) {
        const bit = fallbackProperty.bit || allProperties.indexOf(fallbackProperty);
        const detailId = `${listingType}_${location}_${bit}`;
        sessionStorage.setItem(`json_property_${detailId}`, JSON.stringify(fallbackProperty));
        sessionStorage.setItem('json_current_source', JSON.stringify({ folder: listingType, file: location }));
        // Use new URL format with bit in path
        router.push(`/jsondetailinfo/bit${bit}?id=${encodeURIComponent(detailId)}`);
      }
    }
  }, [allProperties, listingType, location, router]);

  const handlePropertyHover = useCallback((propertyId: string | null) => {
    setHighlightedPropertyId(propertyId);
  }, []);


  return (
    <div className="h-screen flex flex-col overflow-hidden pt-[40px] md:pt-[68px]">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 md:px-6 flex-shrink-0 relative z-[10000]" style={{ overflow: 'visible' }}>
        <div className="max-w-[1920px] mx-auto" style={{ overflow: 'visible', position: 'relative' }}>
          {/* Title Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            {/* Title & Info */}
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-primary-black">
                {location ? (
                  <><span className="text-blue-600">Residential</span> Properties in <span className="text-accent-yellow">{location}</span></>
                ) : (
                  <><span className="text-blue-600">Residential</span> Properties</>
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isForRent 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {isForRent ? 'For Rent' : 'For Sale'}
                  </span>
                <span className="text-sm text-gray-500">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <>
                      {filteredProperties.length.toLocaleString()} {filteredProperties.length === 1 ? 'property' : 'properties'}
                      {hasActiveFilters && filteredProperties.length !== allProperties.length && (
                        <span className="text-accent-yellow ml-1">
                          ({allProperties.length.toLocaleString()} total)
                        </span>
                      )}
                    </>
                  )}
                </span>
              </div>
              </div>
            </div>
            
            {/* Filters Section - Always Visible Dropdown Style */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-4 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0" style={{ overflow: 'visible', position: 'relative', zIndex: 10001 }}>
              {/* Price Dropdown */}
              <div className="relative" data-dropdown-container style={{ zIndex: priceDropdownOpen ? 10002 : 'auto' }}>
                <button
                  data-dropdown-trigger
                  onClick={() => {
                    setPriceDropdownOpen(!priceDropdownOpen);
                    setBedsDropdownOpen(false);
                    setBathsDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    selectedPriceRange
                      ? 'bg-accent-yellow border-accent-yellow text-white font-semibold'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <span className="text-sm whitespace-nowrap">
                    {selectedPriceRange
                      ? (isForRent ? RENT_PRICE_RANGES : SALE_PRICE_RANGES).find(r => r.value === selectedPriceRange)?.label || 'Price'
                      : 'Price'}
                  </span>
                  <ChevronDown size={16} className={`transition-transform ${priceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {priceDropdownOpen && (
                  <div 
                    data-dropdown-menu
                    className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[200px] max-h-[300px] overflow-y-auto z-[10003]"
                    style={{ zIndex: 10003 }}
                  >
                    {(isForRent ? RENT_PRICE_RANGES : SALE_PRICE_RANGES).map((range) => (
                      <button
                        key={range.value}
                        onClick={() => {
                          setSelectedPriceRange(range.value === selectedPriceRange ? null : range.value);
                          setPriceDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          selectedPriceRange === range.value ? 'bg-accent-yellow/10 text-accent-yellow font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bedrooms Dropdown */}
              <div className="relative" data-dropdown-container style={{ zIndex: bedsDropdownOpen ? 10002 : 'auto' }}>
                <button
                  data-dropdown-trigger
                  onClick={() => {
                    setBedsDropdownOpen(!bedsDropdownOpen);
                    setPriceDropdownOpen(false);
                    setBathsDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    selectedBeds !== null
                      ? 'bg-accent-yellow border-accent-yellow text-white font-semibold'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Bed size={16} />
                  <span className="text-sm whitespace-nowrap">
                    {selectedBeds !== null ? `${selectedBeds}+` : 'Beds'}
                  </span>
                  <ChevronDown size={16} className={`transition-transform ${bedsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {bedsDropdownOpen && (
                  <div 
                    data-dropdown-menu
                    className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[120px] max-h-[300px] overflow-y-auto z-[10003]"
                    style={{ zIndex: 10003 }}
                  >
                    {BEDROOM_OPTIONS.map((option) => (
                      <button
                        key={option.value === null ? 'any' : option.value}
                        onClick={() => {
                          setSelectedBeds(option.value);
                          setBedsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                          selectedBeds === option.value ? 'bg-accent-yellow/10 text-accent-yellow font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <Bed size={14} />
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bathrooms Dropdown */}
              <div className="relative" data-dropdown-container style={{ zIndex: bathsDropdownOpen ? 10002 : 'auto' }}>
                <button
                  data-dropdown-trigger
                  onClick={() => {
                    setBathsDropdownOpen(!bathsDropdownOpen);
                    setPriceDropdownOpen(false);
                    setBedsDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    selectedBaths !== null
                      ? 'bg-accent-yellow border-accent-yellow text-white font-semibold'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Bath size={16} />
                  <span className="text-sm whitespace-nowrap">
                    {selectedBaths !== null ? `${selectedBaths}+` : 'Baths'}
                  </span>
                  <ChevronDown size={16} className={`transition-transform ${bathsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {bathsDropdownOpen && (
                  <div 
                    data-dropdown-menu
                    className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[120px] max-h-[300px] overflow-y-auto z-[10003]"
                    style={{ zIndex: 10003 }}
                  >
                    {BATHROOM_OPTIONS.map((option) => (
                      <button
                        key={option.value === null ? 'any' : option.value}
                        onClick={() => {
                          setSelectedBaths(option.value);
                          setBathsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                          selectedBaths === option.value ? 'bg-accent-yellow/10 text-accent-yellow font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <Bath size={14} />
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 text-sm whitespace-nowrap"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              )}
            </div>
        </div>
      </div>

      {/* Main Content - Full width on mobile, split on desktop */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Map - Desktop only, hidden on mobile (all pin CSS and geocoding logic remains intact) */}
        <div className="hidden md:block w-full md:w-1/2 h-full relative z-[1]">
          {/* Map Component - Desktop only, all pin CSS and geocoding logic intact */}
          {loading ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={40} />
                <p className="text-gray-600 font-medium">Loading map...</p>
                <p className="text-gray-400 text-sm">Centering on {location}</p>
              </div>
            </div>
          ) : (
            <MapView
              properties={allProperties as any}
              centerLocation={location || 'United States'}
              onMarkerClick={handleMarkerClick}
              onMarkerHover={handlePropertyHover}
              highlightedPropertyId={highlightedPropertyId}
              showResidential={true}
              showCommercial={false}
            />
          )}
        </div>

        {/* Property List - Full width on mobile, right side on desktop */}
        <div className="flex w-full md:w-1/2 h-full flex-col overflow-hidden bg-gray-50">
          {/* Scrollable Property List */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading properties for {location}...</p>
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
            {!loading && !error && allProperties.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">No properties found</p>
                <p className="text-gray-500 text-sm">Try searching for a different location</p>
              </div>
            )}

            {/* Properties Grid */}
            {!loading && !error && currentProperties.length > 0 && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {currentProperties.map((property, index) => {
                    const addr = getAddress(property);
                    const imageUrl = getImageUrl(property);
                    const propertyId = property.zpid || `prop-${startIndex + index}`;
                    
                    return (
                      <div
                        key={propertyId}
                            ref={(el) => {
                          if (el) propertyRefs.current.set(propertyId, el);
                            }}
                        onMouseEnter={() => handlePropertyHover(propertyId)}
                            onMouseLeave={() => handlePropertyHover(null)}
                        onClick={() => handlePropertyClick(property, index)}
                        className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl border-2 ${
                          highlightedPropertyId === propertyId 
                            ? 'border-blue-500 shadow-lg scale-[1.01]' 
                            : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        {/* Image */}
                        <div className="relative h-40 bg-gray-200">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={addr.street}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              unoptimized
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <Home size={40} />
                          </div>
                          )}
                          {/* Badge */}
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold shadow ${
                              isForRent 
                                ? 'bg-green-500 text-white' 
                                : 'bg-orange-500 text-white'
                            }`}>
                              {isForRent ? 'For Rent' : 'For Sale'}
                            </span>
                          </div>
                          {/* Heart Icon */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(property);
                            }}
                            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-20 ${
                              favorites.has(propertyId)
                                ? 'bg-accent-yellow text-primary-black'
                                : 'bg-white text-primary-black hover:bg-accent-yellow'
                            }`}
                          >
                            <Heart size={16} fill={favorites.has(propertyId) ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-3">
                          {/* Price */}
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            {formatPrice(property.listPrice)}
                          </div>

                          {/* Address */}
                          <div className="flex items-start gap-1.5 mb-2">
                            <MapPin size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-gray-600">
                              <div className="font-medium text-gray-800">{addr.street}</div>
                              <div>{addr.city}, {addr.state} {addr.zip}</div>
                            </div>
                          </div>

                          {/* Property Details */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                            {property.beds != null && (
                              <div className="flex items-center gap-1">
                                <Bed size={12} className="text-blue-500" />
                                <span>{property.beds} beds</span>
                      </div>
                    )}
                            {property.baths != null && (
                              <div className="flex items-center gap-1">
                                <Bath size={12} className="text-blue-500" />
                                <span>{property.baths} baths</span>
                  </div>
                )}
                            {property.sqft != null && (
                              <div className="flex items-center gap-1">
                                <Square size={12} className="text-blue-500" />
                                <span>{property.sqft.toLocaleString()} sqft</span>
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
                    totalCount={allProperties.length}
                    perPage={propertiesPerPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}

            {/* No Location */}
            {!location && !loading && (
              <div className="bg-gray-100 rounded-xl p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Search for Properties</h2>
                <p className="text-gray-500 mb-6">Enter a location in the search bar to find properties</p>
                <Link href="/">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
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

export default function ResidentialSearchPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col pt-[40px] md:pt-[68px]">
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
            <p className="text-gray-600 font-medium">Loading search results...</p>
          </div>
        </div>
      </div>
    }>
      <ResidentialSearchPageContent />
    </Suspense>
  );
}

