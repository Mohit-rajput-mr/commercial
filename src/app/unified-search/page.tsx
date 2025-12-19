'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import MapView from '@/components/MapView';
import { 
  Search, Loader2, Home, 
  MapPin, Bed, Bath, Square, 
  ChevronDown, X, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';

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

function UnifiedSearchPageContent() {
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
  const sqftParam = searchParams.get('sqft');
  
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
  const [selectedSqftRange, setSelectedSqftRange] = useState<string | null>(sqftParam || null);

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

  const SQFT_RANGES = [
    { value: '0-1000', label: 'Under 1,000', min: 0, max: 1000 },
    { value: '1000-2000', label: '1,000 - 2,000', min: 1000, max: 2000 },
    { value: '2000-3000', label: '2,000 - 3,000', min: 2000, max: 3000 },
    { value: '3000-5000', label: '3,000 - 5,000', min: 3000, max: 5000 },
    { value: '5000+', label: '5,000+', min: 5000, max: Infinity },
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
  const [sqftDropdownOpen, setSqftDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setPriceDropdownOpen(false);
        setBedsDropdownOpen(false);
        setBathsDropdownOpen(false);
        setSqftDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 20;

  // Refs for property cards (for map interaction)
  const propertyRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // Load properties
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

        console.log(`📁 Loading properties from: ${filePath}`);

        const response = await fetch(filePath);
        
        if (!response.ok) {
          throw new Error(`Failed to load properties: ${response.statusText}`);
        }

        const data = await response.json();
        const propertiesArray: Property[] = Array.isArray(data) ? data : data.properties || [];
        
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

  // Get sqft range object from selected value
  const getSqftRange = (value: string | null) => {
    if (!value) return null;
    return SQFT_RANGES.find(r => r.value === value) || null;
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

    // Apply sqft filter
    const sqftRange = getSqftRange(selectedSqftRange);
    if (sqftRange) {
      filtered = filtered.filter(p => {
        const sqft = p.sqft || 0;
        return sqft >= sqftRange.min && sqft <= sqftRange.max;
      });
    }

    // Sort by price (high to low) by default
    filtered.sort((a, b) => (b.listPrice || 0) - (a.listPrice || 0));

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [allProperties, selectedBeds, selectedBaths, selectedPriceRange, selectedSqftRange, isForRent]);

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const currentProperties = filteredProperties.slice(startIndex, startIndex + propertiesPerPage);

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
    const propertyId = `${listingType}_${location}_${startIndex + index}`;
    sessionStorage.setItem(`json_property_${propertyId}`, JSON.stringify(property));
    sessionStorage.setItem('json_current_source', JSON.stringify({ folder: listingType, file: location }));
    router.push(`/jsondetailinfo?id=${encodeURIComponent(propertyId)}`);
  };

  // Update URL params when filters change
  const updateURLWithFilters = useCallback((filters: {
    beds?: number | null;
    baths?: number | null;
    price?: string | null;
    sqft?: string | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove filter params
    if (filters.beds !== undefined) {
      if (filters.beds !== null) {
        params.set('beds', filters.beds.toString());
      } else {
        params.delete('beds');
      }
    }
    if (filters.baths !== undefined) {
      if (filters.baths !== null) {
        params.set('baths', filters.baths.toString());
      } else {
        params.delete('baths');
      }
    }
    if (filters.price !== undefined) {
      if (filters.price !== null) {
        params.set('price', filters.price);
      } else {
        params.delete('price');
      }
    }
    if (filters.sqft !== undefined) {
      if (filters.sqft !== null) {
        params.set('sqft', filters.sqft);
      } else {
        params.delete('sqft');
      }
    }
    
    // Update URL without reload
    router.replace(`/unified-search?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const clearFilters = () => {
    setSelectedBeds(null);
    setSelectedBaths(null);
    setSelectedPriceRange(null);
    setSelectedSqftRange(null);
    // Clear URL params
    updateURLWithFilters({ beds: null, baths: null, price: null, sqft: null });
  };

  const activeFiltersCount = [selectedBeds, selectedBaths, selectedPriceRange, selectedSqftRange].filter(v => v !== null).length;

  // Update URL when filters change
  useEffect(() => {
    updateURLWithFilters({
      beds: selectedBeds,
      baths: selectedBaths,
      price: selectedPriceRange,
      sqft: selectedSqftRange
    });
  }, [selectedBeds, selectedBaths, selectedPriceRange, selectedSqftRange, updateURLWithFilters]);

  // Handle marker click - navigate to property detail page (same as card click)
  const handleMarkerClick = useCallback((propertyId: string) => {
    // Find property by zpid in current page
    const propertyIndex = currentProperties.findIndex(p => (p.zpid || `prop-${filteredProperties.indexOf(p)}`) === propertyId);
    if (propertyIndex !== -1) {
      const property = currentProperties[propertyIndex];
      // Use same logic as handlePropertyClick to ensure consistency
      const detailId = `${listingType}_${location}_${startIndex + propertyIndex}`;
      sessionStorage.setItem(`json_property_${detailId}`, JSON.stringify(property));
      sessionStorage.setItem('json_current_source', JSON.stringify({ folder: listingType, file: location }));
      router.push(`/jsondetailinfo?id=${encodeURIComponent(detailId)}`);
    }
  }, [currentProperties, filteredProperties, listingType, location, startIndex, router]);

  const handlePropertyHover = useCallback((propertyId: string | null) => {
    setHighlightedPropertyId(propertyId);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation />
      
      {/* Navbar Spacer */}
      <div className="h-[50px] md:h-[68px] w-full flex-shrink-0"></div>
      
      {/* Header Section with Always-Visible Filters */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 md:px-6 flex-shrink-0 relative z-[100]">
        <div className="max-w-[1920px] mx-auto">
          {/* Title Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            {/* Title & Info */}
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-primary-black">
                {location ? (
                  <>Properties in <span className="text-accent-yellow">{location}</span></>
                ) : (
                  'Search Results'
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
                  {filteredProperties.length} of {allProperties.length} properties
                </span>
              </div>
              </div>
            </div>
            
          {/* Always Visible Filters - Dropdown Style */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {/* Price Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setPriceDropdownOpen(!priceDropdownOpen);
                  setBedsDropdownOpen(false);
                  setBathsDropdownOpen(false);
                  setSqftDropdownOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
                  selectedPriceRange
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                Price: {selectedPriceRange 
                  ? (isForRent ? RENT_PRICE_RANGES : SALE_PRICE_RANGES).find(r => r.value === selectedPriceRange)?.label 
                  : 'Any'}
                <ChevronDown size={16} className={`transition-transform ${priceDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {priceDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[200] max-h-64 overflow-y-auto">
              <button
                    onClick={() => {
                      setSelectedPriceRange(null);
                      setPriceDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedPriceRange === null ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    Any Price
              </button>
                  {(isForRent ? RENT_PRICE_RANGES : SALE_PRICE_RANGES).map((range) => (
                    <button
                      key={range.value}
                      onClick={() => {
                        setSelectedPriceRange(range.value);
                        setPriceDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedPriceRange === range.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
            </div>
              )}
          </div>

            {/* Bedrooms Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setBedsDropdownOpen(!bedsDropdownOpen);
                  setPriceDropdownOpen(false);
                  setBathsDropdownOpen(false);
                  setSqftDropdownOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
                  selectedBeds !== null
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <Bed size={16} />
                Beds: {selectedBeds !== null ? `${selectedBeds}+` : 'Any'}
                <ChevronDown size={16} className={`transition-transform ${bedsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {bedsDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-[200] max-h-64 overflow-y-auto">
                  {BEDROOM_OPTIONS.map((option) => (
                    <button
                      key={option.value ?? 'any'}
                      onClick={() => {
                        setSelectedBeds(option.value);
                        setBedsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedBeds === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bathrooms Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setBathsDropdownOpen(!bathsDropdownOpen);
                  setPriceDropdownOpen(false);
                  setBedsDropdownOpen(false);
                  setSqftDropdownOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
                  selectedBaths !== null
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <Bath size={16} />
                Baths: {selectedBaths !== null ? `${selectedBaths}+` : 'Any'}
                <ChevronDown size={16} className={`transition-transform ${bathsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {bathsDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-[200] max-h-64 overflow-y-auto">
                  {BATHROOM_OPTIONS.map((option) => (
                    <button
                      key={option.value ?? 'any'}
                      onClick={() => {
                        setSelectedBaths(option.value);
                        setBathsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedBaths === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Square Feet Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setSqftDropdownOpen(!sqftDropdownOpen);
                  setPriceDropdownOpen(false);
                  setBedsDropdownOpen(false);
                  setBathsDropdownOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border ${
                  selectedSqftRange
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <Square size={16} />
                Sq.Ft: {selectedSqftRange 
                  ? SQFT_RANGES.find(r => r.value === selectedSqftRange)?.label 
                  : 'Any'}
                <ChevronDown size={16} className={`transition-transform ${sqftDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {sqftDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-[200] max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedSqftRange(null);
                      setSqftDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedSqftRange === null ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    Any Size
                  </button>
                  {SQFT_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => {
                        setSelectedSqftRange(range.value);
                        setSqftDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedSqftRange === range.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters Button (only shown when filters are active) */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDE - Map */}
        <div className="hidden md:block w-1/2 h-full relative z-[1]">
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
              properties={filteredProperties as any}
              centerLocation={location}
              onMarkerClick={handleMarkerClick}
              onMarkerHover={handlePropertyHover}
              highlightedPropertyId={highlightedPropertyId}
              showResidential={true}
              showCommercial={false}
            />
          )}
        </div>

        {/* RIGHT SIDE - Property List */}
        <div className="w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-gray-50">
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
            {!loading && !error && filteredProperties.length === 0 && allProperties.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                <Filter className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-yellow-800 font-medium mb-2">No properties match your filters</p>
                <p className="text-yellow-600 text-sm mb-4">Try adjusting your filter criteria</p>
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
                        </div>

                        {/* Content */}
                        <div className="p-3">
                          {/* Price */}
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            {formatPrice(property.listPrice)}
                            {isForRent && <span className="text-sm text-gray-500 font-normal">/mo</span>}
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
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                          return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-9 h-9 rounded-lg font-medium text-sm transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                          );
                        })}
                      </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                {/* Results Summary */}
                <div className="mt-3 text-center text-xs text-gray-500">
                  Showing {startIndex + 1}-{Math.min(startIndex + propertiesPerPage, filteredProperties.length)} of {filteredProperties.length} properties
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

export default function UnifiedSearchPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col">
        <Navigation />
        <div className="h-[68px] w-full"></div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
            <p className="text-gray-600 font-medium">Loading search results...</p>
          </div>
        </div>
      </div>
    }>
      <UnifiedSearchPageContent />
    </Suspense>
  );
}
