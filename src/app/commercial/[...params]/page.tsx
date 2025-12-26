'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, Building2, MapPin, DollarSign, Square, 
  Loader2, ChevronLeft, ChevronRight,
  Info, User, Building, Copy, Check, ArrowRight,
  Map, ExternalLink, FileJson, Calendar, ChevronDown, ChevronUp
} from 'lucide-react';
import ShareButton from '@/components/ShareButton';
import PropertyInquiryForm from '@/components/PropertyInquiryForm';

// Property Feature Dropdown Component (matching residential style)
interface PropertyFeatureDropdownProps {
  title: string;
  icon: React.ReactNode;
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}

function PropertyFeatureDropdown({ title, icon, data, renderItem }: PropertyFeatureDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-semibold text-primary-black">{title}</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {data.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="text-gray-500" size={20} />
        ) : (
          <ChevronDown className="text-gray-500" size={20} />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-4 space-y-3">
          {data.map((item, index) => renderItem(item, index))}
        </div>
      )}
    </div>
  );
}

// Commercial Property interface
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
  com?: number;
  // Additional fields for rich data display
  coordinates?: { latitude?: number; longitude?: number };
  yearBuilt?: number | string;
  lotSize?: string | null;
  zoning?: string | null;
  parking?: string | null;
  stories?: number | null;
  details?: Array<{ category: string; parent_category: string; text: string[] }>;
  history?: any[];
  taxHistory?: any[];
  [key: string]: any;
}

// Helper to extract state string from object or string
function extractStateString(state: any): string {
  if (!state) return '';
  if (typeof state === 'string') return state;
  if (typeof state === 'object') {
    return state.code || state.name || '';
  }
  return '';
}

// Helper to safely convert any value to a displayable string (prevents object rendering errors)
function safeString(value: any): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'object') {
    // Handle common object patterns
    if (value.value) return String(value.value);
    if (value.text) return String(value.text);
    if (value.label) return String(value.label);
    if (value.name) return String(value.name);
    // Don't try to render complex objects
    return null;
  }
  return String(value);
}

// Transform raw property data to CommercialProperty format
function transformCommercialProperty(rawProperty: any, fallbackId: string): CommercialProperty {
  // Handle various property formats from different data sources
  const location = rawProperty.locations?.[0] || rawProperty.location || {};
  
  // Get images from various possible fields
  let images: string[] = [];
  if (rawProperty.images && Array.isArray(rawProperty.images)) {
    images = rawProperty.images.map((img: any) => {
      if (typeof img === 'string') return img;
      if (typeof img === 'object' && img !== null) {
        return img.url || img.imageUrl || img.src || img.href || '';
      }
      return '';
    }).filter((url: string) => url && url.length > 0);
  } else if (rawProperty.image) {
    images = [rawProperty.image];
  } else if (rawProperty.imgSrc) {
    images = [rawProperty.imgSrc];
  } else if (rawProperty.photos && Array.isArray(rawProperty.photos)) {
    images = rawProperty.photos.map((p: any) => p.url || p.src || p.href || (typeof p === 'string' ? p : '')).filter(Boolean);
  }

  // Determine address
  const address = rawProperty.address || 
                  location.formattedAddress || 
                  location.address || 
                  rawProperty.streetAddress ||
                  rawProperty.name ||
                  '';

  // Determine city, state, zip
  const city = rawProperty.city || location.city || '';
  const state = extractStateString(rawProperty.state || location.state);
  const zip = rawProperty.zip || rawProperty.zipCode || location.postalCode || location.zip || '';
  const country = rawProperty.country || location.country || 'United States';

  // Get price info
  let price = rawProperty.price || null;
  let priceNumeric = rawProperty.priceNumeric || null;
  if (rawProperty.askingPrice) {
    price = rawProperty.askingPrice;
  }
  if (typeof price === 'number') {
    priceNumeric = price;
    price = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  }

  // Get square footage from various fields - check propertyFacts for fallback
  const propertyFacts = rawProperty.propertyFacts || {};
  let squareFootage = safeString(rawProperty.squareFootage) || 
                      safeString(rawProperty.sqft) || 
                      safeString(propertyFacts.TotalBuildingSize) ||
                      safeString(rawProperty.size) ||
                      safeString(rawProperty.area);
  
  // Get building size - might be in propertyFacts
  let buildingSize = safeString(rawProperty.buildingSize) || 
                     safeString(propertyFacts.TotalBuildingSize);
  
  // Get property type - might be in propertyFacts
  let propertyType = safeString(rawProperty.propertyType) || 
                     safeString(rawProperty.propertySubType) ||
                     safeString(propertyFacts.PropertyType) || '';
  
  // Get cap rate - might be in propertyFacts
  let capRate = safeString(rawProperty.capRate) || 
                safeString(propertyFacts.CapRate);
  
  // Get description - might be in lotDetails
  let description = safeString(rawProperty.description) || 
                    safeString(rawProperty.summary) ||
                    safeString(rawProperty.executiveSummary) || '';
  
  // Get broker info
  let brokerName = safeString(rawProperty.brokerName) || 
                   safeString(rawProperty.agent_fullName) ||
                   safeString(rawProperty.broker?.name);
  let brokerCompany = safeString(rawProperty.brokerCompany) || 
                      safeString(rawProperty.Broker) ||
                      safeString(rawProperty.broker?.company);

  // Safely get address string
  let addressStr = safeString(address);
  if (!addressStr && rawProperty.propertyFacts) {
    // Try to construct from property facts
    addressStr = '';
  }

  // Get coordinates
  let coordinates = rawProperty.coordinates || location.coordinates || null;
  if (rawProperty.latitude && rawProperty.longitude) {
    coordinates = { latitude: rawProperty.latitude, longitude: rawProperty.longitude };
  }

  // Transform to CommercialProperty - all string fields use safeString
  return {
    propertyId: safeString(rawProperty.propertyId) || safeString(rawProperty.id) || safeString(rawProperty.zpid) || fallbackId,
    listingType: safeString(rawProperty.listingType) || safeString(rawProperty.type) || safeString(rawProperty.transactionType) || '',
    propertyType: propertyType,
    city: safeString(city) || '',
    state: state,
    zip: safeString(zip) || '',
    country: safeString(country) || '',
    address: addressStr || '',
    description: description,
    listingUrl: safeString(rawProperty.listingUrl) || safeString(rawProperty.url) || safeString(rawProperty.detailUrl) || '',
    images: images,
    dataPoints: Array.isArray(rawProperty.dataPoints) ? rawProperty.dataPoints.filter((dp: any) => typeof dp === 'string') : [],
    price: safeString(price),
    priceNumeric: typeof priceNumeric === 'number' ? priceNumeric : null,
    priceCurrency: safeString(rawProperty.priceCurrency) || 'USD',
    isAuction: rawProperty.isAuction || false,
    auctionEndDate: safeString(rawProperty.auctionEndDate),
    squareFootage: squareFootage,
    buildingSize: buildingSize,
    numberOfUnits: typeof rawProperty.numberOfUnits === 'number' ? rawProperty.numberOfUnits : (typeof rawProperty.units === 'number' ? rawProperty.units : null),
    brokerName: brokerName,
    brokerCompany: brokerCompany,
    propertyTypeDetailed: safeString(rawProperty.propertyTypeDetailed) || safeString(propertyFacts.PropertySubtype),
    capRate: capRate,
    position: typeof rawProperty.position === 'number' ? rawProperty.position : 0,
    availability: safeString(rawProperty.availability),
    com: typeof rawProperty.com === 'number' ? rawProperty.com : undefined,
    coordinates: coordinates,
    yearBuilt: rawProperty.yearBuilt || rawProperty.year_built || propertyFacts.YearBuilt,
    lotSize: safeString(rawProperty.lotSize) || safeString(rawProperty.lot_sqft) || safeString(propertyFacts.LotSize),
    zoning: safeString(rawProperty.zoning) || safeString(propertyFacts.Zoning),
    parking: safeString(rawProperty.parking) || safeString(propertyFacts.Parking),
    stories: rawProperty.stories || rawProperty.floors || propertyFacts.Stories,
    details: rawProperty.details,
    history: rawProperty.history,
    taxHistory: rawProperty.taxHistory,
  };
}

function CommercialDetailContent() {
  const params = useParams();
  const router = useRouter();
  
  // Parse params array - simplified: just property ID
  const paramsArray = typeof params.params === 'string' 
    ? [params.params] 
    : Array.isArray(params.params) 
      ? params.params 
      : [];
  
  let comNumber: number | undefined;
  let propertyId: string = '';
  
  if (paramsArray.length === 2 && paramsArray[0].startsWith('com')) {
    // New format: /commercial/com123/crexi-1728502
    const comStr = paramsArray[0].replace('com', '');
    comNumber = parseInt(comStr);
    propertyId = decodeURIComponent(paramsArray[1]);
  } else if (paramsArray.length === 1) {
    // Single param: always treat as property ID
    propertyId = decodeURIComponent(paramsArray[0]);
  }
  
  const [property, setProperty] = useState<CommercialProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId && comNumber === undefined) {
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log(`🔍 Commercial property loading - propertyId: "${propertyId}", comNumber: ${comNumber}`);

      // PRIORITY 1: Try sessionStorage first (fastest, for same-tab navigation)
      if (propertyId) {
        const storedProperty = sessionStorage.getItem(`commercial_property_${propertyId}`);
        if (storedProperty) {
          try {
            const parsed = JSON.parse(storedProperty);
            console.log(`✅ Loaded from sessionStorage:`, parsed.propertyId || parsed.id);
            const transformedProperty = transformCommercialProperty(parsed, propertyId);
            setProperty(transformedProperty);
            setLoading(false);
            return;
          } catch (e) {
            console.warn('Failed to parse stored property:', e);
          }
        }
      }

      // PRIORITY 2: Load from dataset by propertyId (works in new tabs - for shareable links)
      if (propertyId) {
        console.log(`🔍 Searching datasets for property ID: ${propertyId}`);
        try {
          const { loadCommercialPropertyFromDataset } = await import('@/lib/property-loader');
          const loadedProperty = await loadCommercialPropertyFromDataset(propertyId);
          
          if (loadedProperty) {
            console.log(`✅ Found property in dataset:`, loadedProperty.propertyId || loadedProperty.id);
            const transformedProperty = transformCommercialProperty(loadedProperty, propertyId);
            setProperty(transformedProperty);
            setLoading(false);
            return;
          } else {
            console.warn(`❌ Property not found in datasets with ID: ${propertyId}`);
          }
        } catch (err) {
          console.error('Error loading commercial property from dataset:', err);
        }
      }

      // PRIORITY 3: Load by com number (if available)
      if (comNumber !== undefined && !isNaN(comNumber) && comNumber >= 0) {
        try {
          console.log(`🔍 Searching by com number: ${comNumber}`);
          const { loadCommercialPropertyByCom } = await import('@/lib/property-loader');
          const property = await loadCommercialPropertyByCom(comNumber);
          
          if (property) {
            console.log(`✅ Found property by com:`, property.propertyId || property.id);
            const transformedProperty = transformCommercialProperty(property, propertyId || `com-${comNumber}`);
            setProperty(transformedProperty);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Error loading by com:', err);
        }
      }

      console.error(`❌ Failed to load commercial property. propertyId="${propertyId}", comNumber=${comNumber}`);
      setLoading(false);
    };

    loadProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, comNumber]);

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/commercial-search');
    }
  };

  // Helper to determine listing type
  const getListingCategory = (listingType?: string): string => {
    if (!listingType) return 'unknown';
    const lt = listingType.toLowerCase();
    if (lt.includes('auction')) return 'auction';
    if (lt.includes('lease')) return 'lease';
    if (lt.includes('sale')) return 'sale';
    return 'unknown';
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
    const sqftStr = typeof sqft === 'number' ? sqft.toString() : sqft;
    if (typeof sqftStr !== 'string') return null;
    return sqftStr.includes('SF') ? sqftStr : `${sqftStr} SF`;
  };

  // Clean address - remove appended SF/Unit info
  const cleanAddress = (address?: string): string => {
    if (!address) return '';
    let cleaned = address
      .replace(/\d{1,3}(,\d{3})*\s*SF\s*(Office|Retail|Industrial|Multifamily|Available|Property|Commercial|Coworking)?\s*(Available)?/gi, '')
      .replace(/\d+\s*Unit\s*(Multifamily|Apartment|Residential)?/gi, '')
      .replace(/\d+\.\d+\s*AC\s*(Commercial|Residential|Industrial)?\s*(Lot)?/gi, '')
      .replace(/\d+\s*AC\s*(Commercial|Residential|Industrial)?\s*(Lot)?/gi, '')
      .trim();
    return cleaned || address;
  };

  // Extract state string from either string or object
  const getStateString = (state?: string | { code?: string; name?: string }): string => {
    if (!state) return '';
    if (typeof state === 'string') return state;
    if (typeof state === 'object') {
      return state.code || state.name || '';
    }
    return '';
  };

  const copyAddress = async () => {
    if (property) {
      const cleaned = cleanAddress(property.address);
      const stateStr = getStateString(property.state);
      const fullAddress = `${cleaned || ''}, ${property.city || ''}, ${stateStr} ${property.zip || ''}`.trim();
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to check if value is a complex object/array
  const isComplexValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') return true;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0) return true;
    return false;
  };

  // Helper to render simple values
  const renderSimpleValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value) && value.length > 0 && typeof value[0] !== 'object') {
      return value.join(', ');
    }
    return String(value);
  };

  // Get all property keys for display, excluding complex objects
  const excludedKeys = ['photos', 'images', 'address', 'coordinates', 'details', 'history', 'taxHistory', 'dataPoints'];
  const getPropertyKeys = (prop: CommercialProperty) => {
    return Object.keys(prop).filter(key => 
      !excludedKeys.includes(key) && 
      prop[key] != null && 
      !isComplexValue(prop[key])
    );
  };

  // Filter valid image URLs - handle both string arrays and object arrays
  const getImages = (prop: CommercialProperty | null): string[] => {
    if (!prop?.images) return [];
    return prop.images
      .map((img: any) => {
        if (typeof img === 'string') return img;
        if (typeof img === 'object' && img !== null) {
          return img.url || img.imageUrl || img.src || img.href || '';
        }
        return '';
      })
      .filter((url: string) => url && typeof url === 'string' && (url.startsWith('http') || url.startsWith('//')));
  };

  const images = getImages(property);
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-[40px] md:pt-[68px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-accent-yellow animate-spin mx-auto mb-4" />
          <p className="text-primary-black text-base md:text-lg">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-[40px] md:pt-[68px]">
        <div className="text-center">
          <Building2 className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-6 text-sm md:text-base">The commercial property you&apos;re looking for could not be found.</p>
          <Link href="/commercial-search">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 md:px-6 md:py-3 bg-accent-yellow hover:bg-yellow-400 text-primary-black rounded-lg font-semibold text-sm md:text-base"
            >
              Go Back
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const propertyKeys = getPropertyKeys(property);
  const comId = property?.com !== undefined ? property.com : comNumber;

  return (
    <div className="min-h-screen bg-gray-50 pt-[40px] md:pt-[68px]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-[40px] md:top-[68px] z-40">
        <div className="w-full px-3 md:px-6 lg:px-8 py-2 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goBack}
                className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-primary-black transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} className="md:w-5 md:h-5" />
              </motion.button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-xl font-bold text-primary-black truncate">Commercial Property</h1>
                <p className="text-gray-500 text-xs md:text-sm truncate">{cleanAddress(property.address) || 'Address Not Available'}</p>
                {comId !== undefined && (
                  <p className="text-gray-400 text-xs">Com ID: {comId}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${getListingBadgeColor(property.listingType)}`}>
                {getListingLabel(property.listingType)}
              </span>
              {comId !== undefined && (
                <span className="px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-blue-500 text-white">
                  Com {comId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-6">
        {/* TOP SECTION: Image Gallery | Ask Additional Questions (Fixed/Sticky) */}
        <div className="max-w-[95%] xl:max-w-[92%] 2xl:max-w-[90%] mx-auto">
          <div className="flex flex-col lg:flex-row gap-3 mb-3 md:mb-5">
          {/* LEFT - Image Gallery */}
          <div className="w-full lg:w-3/4 lg:flex-[3]">
            {images.length > 0 ? (
              <div className="w-full">
                <div className="relative w-full aspect-[16/11.7] max-h-[473px] md:max-h-[592px] rounded-xl overflow-hidden bg-gray-200 group">
                  <Image
                    src={images[currentImageIndex]}
                    alt={`Property image ${currentImageIndex + 1}`}
                    fill
                    className="object-contain bg-gray-100 cursor-pointer"
                    unoptimized
                    sizes="75vw"
                    onClick={() => {
                      window.open(images[currentImageIndex], '_blank');
                    }}
                  />
                  {/* Share Button Overlay */}
                  <div className="absolute top-3 right-3 z-10">
                    <ShareButton
                      url={typeof window !== 'undefined' ? window.location.href : ''}
                      title={cleanAddress(property.address) || 'Commercial Property'}
                      text={`Check out this commercial property: ${cleanAddress(property.address)}`}
                      variant="icon"
                      iconSize={20}
                    />
                  </div>
                  
                  {/* Image Navigation */}
                  {hasMultipleImages && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentImageIndex(i => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white rounded-full text-primary-black shadow-lg"
                      >
                        <ChevronLeft size={24} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentImageIndex(i => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 hover:bg-white rounded-full text-primary-black shadow-lg"
                      >
                        <ChevronRight size={24} />
                      </motion.button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white/90 rounded-full text-primary-black text-sm font-medium">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {hasMultipleImages && (
                  <div className="flex gap-1.5 mt-2.5 md:mt-3 overflow-x-auto pb-1.5">
                    {images.slice(0, 8).map((img, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative w-12 h-8 md:w-14 md:h-10 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                          currentImageIndex === index ? 'border-accent-yellow' : 'border-transparent'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="(max-width: 768px) 15vw, 64px"
                        />
                      </motion.button>
                    ))}
                    {images.length > 8 && (
                      <div className="w-12 h-8 md:w-14 md:h-10 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                        +{images.length - 8}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[16/13] bg-gray-200 rounded-xl flex items-center justify-center">
                <Building2 size={60} className="md:w-20 md:h-20 text-gray-400" />
              </div>
            )}
          </div>

          {/* RIGHT - Ask Additional Questions Form (Fixed/Sticky) */}
          <div className="w-full lg:w-1/4 lg:flex-[1] flex-shrink-0">
            <div className="lg:sticky lg:top-[100px] lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
              <PropertyInquiryForm
                propertyAddress={`${cleanAddress(property.address) || ''}, ${property.city || ''}, ${getStateString(property.state)} ${property.zip || ''}`.trim()}
                propertyId={property.propertyId}
                formType="property_inquiry"
                theme="light"
                compact={true}
              />
            </div>
          </div>
        </div>
        </div>

        {/* Property Details Section - Below Image & Form */}
        <div>
          {/* Main Info Card */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Price & Address */}
            <div className="xl:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-3xl font-bold text-primary-black">
                    {formatPrice(property.price, property.priceNumeric)}
                    {getListingCategory(property.listingType) === 'lease' && <span className="text-lg text-gray-500 font-normal">/month</span>}
                  </div>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${getListingBadgeColor(property.listingType)}`}>
                    {getListingLabel(property.listingType)}
                  </span>
                  {comId !== undefined && (
                    <span className="inline-block mt-2 ml-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
                      Com {comId}
                    </span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="text-accent-yellow mt-1 flex-shrink-0" size={20} />
                <div>
                  <div className="text-lg text-primary-black font-medium">{cleanAddress(property.address) || 'Address Not Available'}</div>
                  <div className="text-gray-500">{property.city}, {getStateString(property.state)} {property.zip}</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={copyAddress}
                  className="ml-auto p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </motion.button>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                {property.squareFootage && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <Square className="text-accent-yellow" size={18} />
                    <span className="text-primary-black font-medium">{formatSqft(property.squareFootage)}</span>
                  </div>
                )}
                {property.numberOfUnits && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <Building className="text-accent-yellow" size={18} />
                    <span className="text-primary-black font-medium">{property.numberOfUnits} Units</span>
                  </div>
                )}
                {property.capRate && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <DollarSign className="text-accent-yellow" size={18} />
                    <span className="text-primary-black font-medium">Cap Rate: {property.capRate}</span>
                  </div>
                )}
                {property.yearBuilt && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <Calendar className="text-accent-yellow" size={18} />
                    <span className="text-primary-black font-medium">Built {property.yearBuilt}</span>
                  </div>
                )}
                {property.lotSize && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <Square className="text-green-500" size={18} />
                    <span className="text-primary-black font-medium">{property.lotSize} lot</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Map Placeholder */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-primary-black mb-4 flex items-center gap-2">
                <Map className="text-accent-yellow" size={20} />
                Location
              </h3>
              <div className="text-gray-600 mb-4">
                <p className="mb-2">{cleanAddress(property.address) || 'Address Not Available'}</p>
                <p>{property.city}, {getStateString(property.state)} {property.zip}</p>
                {property.country && <p className="text-gray-400 text-sm mt-1">{property.country}</p>}
              </div>
              {property.coordinates && property.coordinates.latitude && property.coordinates.longitude && (
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Latitude: {property.coordinates.latitude}</p>
                  <p>Longitude: {property.coordinates.longitude}</p>
                  <a
                    href={`https://www.google.com/maps?q=${property.coordinates.latitude},${property.coordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-accent-yellow hover:bg-yellow-400 text-primary-black rounded-lg transition-colors font-medium"
                  >
                    <ExternalLink size={16} />
                    View on Google Maps
                  </a>
                </div>
              )}
              {(!property.coordinates || !property.coordinates.latitude) && (
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(`${cleanAddress(property.address)}, ${property.city}, ${getStateString(property.state)} ${property.zip}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-yellow hover:bg-yellow-400 text-primary-black rounded-lg transition-colors font-medium"
                >
                  <ExternalLink size={16} />
                  View on Google Maps
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-4 flex items-center gap-2">
                <Info className="text-accent-yellow" size={20} />
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          )}

          {/* Property Highlights */}
          {property.dataPoints && property.dataPoints.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-4 flex items-center gap-2">
                <Building2 className="text-accent-yellow" size={20} />
                Property Highlights
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...new Set(property.dataPoints)].map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                    <span className="text-accent-yellow mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Property Details from 'details' array */}
          {property.details && property.details.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6 flex items-center gap-2">
                <Building2 className="text-accent-yellow" size={20} />
                Property Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {property.details.map((detail, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-accent-yellow font-medium mb-1">{detail.parent_category}</div>
                    <div className="text-primary-black font-semibold mb-2">{detail.category}</div>
                    <ul className="space-y-1">
                      {detail.text.map((text, textIndex) => (
                        <li key={textIndex} className="text-sm text-gray-500">• {text}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Details Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-primary-black mb-4">Key Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {property.listingType && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Listing Type</span>
                  <span className="font-medium text-primary-black">{getListingLabel(property.listingType)}</span>
                </div>
              )}
              {property.propertyType && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium text-primary-black">{property.propertyType}</span>
                </div>
              )}
              {property.propertyTypeDetailed && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Subtype</span>
                  <span className="font-medium text-primary-black">{property.propertyTypeDetailed}</span>
                </div>
              )}
              {property.squareFootage && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Size</span>
                  <span className="font-medium text-primary-black">{formatSqft(property.squareFootage)}</span>
                </div>
              )}
              {property.numberOfUnits && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Units</span>
                  <span className="font-medium text-primary-black">{property.numberOfUnits}</span>
                </div>
              )}
              {property.capRate && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Cap Rate</span>
                  <span className="font-medium text-primary-black">{property.capRate}</span>
                </div>
              )}
              {property.yearBuilt && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Year Built</span>
                  <span className="font-medium text-primary-black">{property.yearBuilt}</span>
                </div>
              )}
              {property.stories && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Stories</span>
                  <span className="font-medium text-primary-black">{property.stories}</span>
                </div>
              )}
              {property.zoning && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Zoning</span>
                  <span className="font-medium text-primary-black">{property.zoning}</span>
                </div>
              )}
              {property.parking && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Parking</span>
                  <span className="font-medium text-primary-black">{property.parking}</span>
                </div>
              )}
              {property.availability && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Availability</span>
                  <span className="font-medium text-primary-black">{property.availability}</span>
                </div>
              )}
            </div>
          </div>

          {/* Broker Info */}
          {(property.brokerName || property.brokerCompany) && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-4 flex items-center gap-2">
                <User className="text-accent-yellow" size={20} />
                Listed By
              </h3>
              <div className="text-gray-600">
                {property.brokerName && <div className="font-medium text-primary-black">{property.brokerName}</div>}
                {property.brokerCompany && <div className="text-gray-500">{property.brokerCompany}</div>}
              </div>
            </div>
          )}

          {/* All Property Data */}
          {propertyKeys.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-6 flex items-center gap-2">
                <FileJson className="text-accent-yellow" size={20} />
                All Property Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {propertyKeys.map((key) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-accent-yellow font-medium mb-1 uppercase tracking-wider">
                      {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-primary-black text-sm break-words">
                      {renderSimpleValue(property[key])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property History - Dropdown */}
          {property.history && Array.isArray(property.history) && property.history.length > 0 && (
            <PropertyFeatureDropdown
              title="Property History"
              icon={<Calendar className="text-accent-yellow" size={20} />}
              data={property.history}
              renderItem={(item: any, index: number) => {
                const date = item.date || item.eventDate || item.soldOn || item.listingDate || 'Date N/A';
                const price = item.price || item.soldPrice || item.listPrice || item.lastSoldPrice;
                const event = item.event || item.type || item.status || item.description;
                const source = item.source || item.listingAgent || item.agent;
                
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="font-semibold text-primary-black mb-2">{date}</div>
                    {event && <div className="text-gray-600 text-sm mb-1">{event}</div>}
                    {price && <div className="text-accent-yellow font-medium">{formatPrice(price, null)}</div>}
                    {source && <div className="text-xs text-gray-500 mt-2">Source: {typeof source === 'object' ? source.name || JSON.stringify(source) : source}</div>}
                  </div>
                );
              }}
            />
          )}

          {/* Tax History - Dropdown */}
          {property.taxHistory && Array.isArray(property.taxHistory) && property.taxHistory.length > 0 && (
            <PropertyFeatureDropdown
              title="Tax History"
              icon={<DollarSign className="text-accent-yellow" size={20} />}
              data={property.taxHistory}
              renderItem={(tax: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {tax.year && <div className="font-semibold text-primary-black mb-2">Year: {tax.year}</div>}
                  {tax.tax && <div className="text-accent-yellow font-medium mb-1">{formatPrice(tax.tax, null)}</div>}
                  {tax.assessment && <div className="text-gray-600 text-sm mb-1">Assessment: {formatPrice(tax.assessment, null)}</div>}
                </div>
              )}
            />
          )}

          {/* View Original Listing */}
          {property.listingUrl && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-semibold text-primary-black mb-4 flex items-center gap-2">
                <ExternalLink className="text-accent-yellow" size={20} />
                Original Listing
              </h3>
              <a
                href={property.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-yellow hover:bg-yellow-400 text-primary-black rounded-lg transition-colors font-medium"
              >
                <ExternalLink size={16} />
                View Original Listing
              </a>
            </div>
          )}
        </div>

        {/* Property ID Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          Property ID: {property.propertyId}
        </div>
      </div>
    </div>
  );
}

export default function CommercialDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-[40px] md:pt-[68px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-accent-yellow animate-spin mx-auto mb-4" />
          <p className="text-primary-black text-base md:text-lg">Loading...</p>
        </div>
      </div>
    }>
      <CommercialDetailContent />
    </Suspense>
  );
}
