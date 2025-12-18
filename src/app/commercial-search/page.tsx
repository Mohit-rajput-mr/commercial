'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import MapView from '@/components/MapView';
import { 
  Search, Loader2, Building2, 
  MapPin, Square, DollarSign,
  ChevronDown, X, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';

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
const SQFT_RANGES = [
  { value: null, label: 'Any Size' },
  { value: '0-5000', label: 'Under 5,000 SF', min: 0, max: 5000 },
  { value: '5000-10000', label: '5,000 - 10,000 SF', min: 5000, max: 10000 },
  { value: '10000-25000', label: '10,000 - 25,000 SF', min: 10000, max: 25000 },
  { value: '25000-50000', label: '25,000 - 50,000 SF', min: 25000, max: 50000 },
  { value: '50000-100000', label: '50,000 - 100,000 SF', min: 50000, max: 100000 },
  { value: '100000+', label: '100,000+ SF', min: 100000, max: Infinity },
];

function CommercialSearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL parameters
  const locationParam = searchParams.get('location') || '';
  const statusParam = searchParams.get('status') || '';
  const specificTypeParam = searchParams.get('specificType') || ''; // New: specific property type from hero

  // Normalize location for matching
  const normalizeLocation = (input: string): string => {
    let normalized = input.toLowerCase().trim();
    try {
      normalized = decodeURIComponent(normalized);
    } catch (e) {}
    // Remove state names/abbreviations but keep city names intact
    normalized = normalized
      .replace(/,\s*(fl|florida|ca|california|ny|new york|il|illinois|tx|texas|az|arizona|pa|pennsylvania|nv|nevada)\s*$/gi, '')
      .trim();
    return normalized;
  };

  // Check if city matches search query
  const cityMatchesSearch = (city: string, search: string): boolean => {
    const normalizedCity = city.toLowerCase().trim();
    const normalizedSearch = search.toLowerCase().trim();
    // Exact match or contains
    return normalizedCity === normalizedSearch || 
           normalizedCity.includes(normalizedSearch) ||
           normalizedSearch.includes(normalizedCity);
  };

  // State
  const [allProperties, setAllProperties] = useState<CommercialProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<CommercialProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(locationParam);
  const [selectedListingType, setSelectedListingType] = useState<'sale' | 'lease' | null>(
    statusParam.toLowerCase().includes('lease') || statusParam.toLowerCase().includes('rent') ? 'lease' : 
    statusParam.toLowerCase().includes('sale') ? 'sale' : null
  );
  
  // Filter states
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(
    specificTypeParam && specificTypeParam !== 'All' ? specificTypeParam : null
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [selectedSqftRange, setSelectedSqftRange] = useState<string | null>(null);

  // Dropdown open states
  const [listingTypeDropdownOpen, setListingTypeDropdownOpen] = useState(false);
  const [propertyTypeDropdownOpen, setPropertyTypeDropdownOpen] = useState(false);
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
  const [sqftDropdownOpen, setSqftDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setListingTypeDropdownOpen(false);
        setPropertyTypeDropdownOpen(false);
        setPriceDropdownOpen(false);
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

  // Load all commercial properties (including Crexi dataset)
  useEffect(() => {
    const loadAllProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        const allProps: CommercialProperty[] = [];
        
        // Load regular commercial files from /commercial folder
        for (const file of COMMERCIAL_FILES) {
          try {
            const response = await fetch(`/commercial/${file}`);
            if (response.ok) {
              const data = await response.json();
              const properties: CommercialProperty[] = Array.isArray(data) ? data : [];
              
              // Transform and normalize properties
              const transformed = properties.map((prop, index) => {
                const validImages = getValidImages(prop.images);
                const cleanedAddress = cleanAddress(prop.address);
                
                return {
                  ...prop,
                  // Clean the address
                  addressCleaned: cleanedAddress,
                  // For map compatibility
                  zpid: prop.propertyId || `commercial-${file}-${index}`,
                  imgSrc: validImages[0] || null,
                  status: getListingCategory(prop.listingType) === 'lease' ? 'For Lease' : 'For Sale',
                  latitude: undefined,
                  longitude: undefined,
                  // Normalize property type
                  propertyType: prop.propertyType || prop.propertyTypeDetailed || 'Commercial',
                  // Store valid images count for sorting
                  validImageCount: validImages.length,
                };
              });
              
              allProps.push(...transformed);
            }
          } catch (err) {
            console.warn(`Failed to load ${file}:`, err);
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

        const crexiCount = allProps.filter(p => p.propertyId?.startsWith('crexi-')).length;
        console.log(`✅ Total loaded: ${allProps.length} commercial properties (${COMMERCIAL_FILES.length} regular files${crexiCount > 0 ? ` + ${crexiCount} Crexi properties` : ''})`);
        setAllProperties(allProps);
        
      } catch (err) {
        console.error('Error loading commercial properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to load commercial properties');
      } finally {
        setLoading(false);
      }
    };

    loadAllProperties();
  }, [selectedListingType]); // Reload when listing type filter changes (to load/skip Crexi SALE dataset)

  // Get price range object from selected value
  const getPriceRange = (value: string | null) => {
    if (!value) return null;
    return PRICE_RANGES.find(r => r.value === value) || null;
  };

  // Get sqft range object from selected value
  const getSqftRange = (value: string | null) => {
    if (!value) return null;
    return SQFT_RANGES.find(r => r.value === value) || null;
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

    // Filter by search query (city, address, zip)
    if (normalizedSearch) {
      filtered = filtered.filter(p => {
        const city = (p.city || '').toLowerCase();
        const address = (p.address || '').toLowerCase();
        const zip = (p.zip || '').toLowerCase();
        const state = (p.state || '').toLowerCase();
        const description = (p.description || '').toLowerCase();
        
        // Check for matches
        return cityMatchesSearch(city, normalizedSearch) || 
               address.includes(normalizedSearch) ||
               zip.includes(normalizedSearch) ||
               state.includes(normalizedSearch) ||
               description.includes(normalizedSearch);
      });
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

    // Filter by square footage
    const sqftRange = getSqftRange(selectedSqftRange);
    if (sqftRange && sqftRange.min !== undefined && sqftRange.max !== undefined) {
      filtered = filtered.filter(p => {
        const sqft = parseSqft(p.squareFootage);
        return sqft >= sqftRange.min! && sqft <= sqftRange.max!;
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
  }, [allProperties, searchQuery, selectedListingType, selectedPropertyType, selectedPriceRange, selectedSqftRange]);

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
    router.push(`/commercial-detail?id=${encodeURIComponent(property.propertyId)}`);
  };

  const clearFilters = () => {
    setSelectedListingType(null);
    setSelectedPropertyType(null);
    setSelectedPriceRange(null);
    setSelectedSqftRange(null);
    setSearchQuery('');
  };

  const activeFiltersCount = [selectedListingType, selectedPropertyType, selectedPriceRange, selectedSqftRange, searchQuery].filter(v => v !== null && v !== '').length;

  // Handle marker click - scroll to property in list
  const handleMarkerClick = useCallback((propertyId: string) => {
    // Navigate directly to property detail page
    const property = filteredProperties.find(p => p.zpid === propertyId || p.propertyId === propertyId);
    if (property) {
      // Store in sessionStorage for detail page
      sessionStorage.setItem(`commercial_property_${propertyId}`, JSON.stringify(property));
      // Navigate to detail page
      router.push(`/commercial-detail?id=${propertyId}`);
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
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation />
      
      {/* Navbar Spacer */}
      <div className="h-[50px] md:h-[68px] w-full flex-shrink-0"></div>
      
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
                  setSqftDropdownOpen(false);
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
                  setSqftDropdownOpen(false);
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
                  setSqftDropdownOpen(false);
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

            {/* Square Footage Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setSqftDropdownOpen(!sqftDropdownOpen);
                  setListingTypeDropdownOpen(false);
                  setPropertyTypeDropdownOpen(false);
                  setPriceDropdownOpen(false);
                }}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm transition-all border ${
                  selectedSqftRange
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <Square size={14} className="hidden md:block" />
                Size: {selectedSqftRange ? SQFT_RANGES.find(r => r.value === selectedSqftRange)?.label : 'Any'}
                <ChevronDown size={14} className={`transition-transform ${sqftDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {sqftDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[1000] max-h-64 overflow-y-auto">
                  {SQFT_RANGES.map((range) => (
                    <button
                      key={range.value ?? 'any'}
                      onClick={() => {
                        setSelectedSqftRange(range.value);
                        setSqftDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedSqftRange === range.value ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700'
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

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDE - Map (hidden on mobile) - Lower z-index so dropdowns appear above */}
        <div className="hidden md:block w-1/2 h-full relative z-[10]">
          {!loading && filteredProperties.length > 0 && (
            <MapView
              properties={filteredProperties as any}
              centerLocation={searchQuery || 'United States'}
              onMarkerClick={handleMarkerClick}
              onMarkerHover={handlePropertyHover}
              highlightedPropertyId={highlightedPropertyId}
              showResidential={false}
              showCommercial={true}
            />
          )}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - Property List */}
        <div className="w-full md:w-1/2 h-full flex flex-col overflow-hidden bg-gray-50">
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
                              <div>{[property.city, property.state, property.zip].filter(Boolean).join(', ')}</div>
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
                            className={`w-8 h-8 md:w-9 md:h-9 rounded-lg font-medium text-sm transition-colors ${
                              currentPage === pageNum
                                ? 'bg-orange-500 text-white'
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
                  Showing {startIndex + 1}-{Math.min(startIndex + propertiesPerPage, filteredProperties.length)} of {filteredProperties.length} commercial properties
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
      <div className="h-screen flex flex-col">
        <Navigation />
        <div className="h-[68px] w-full"></div>
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
