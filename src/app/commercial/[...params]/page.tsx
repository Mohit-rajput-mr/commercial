'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { 
  ArrowLeft, Building2, MapPin, DollarSign, Square, 
  Loader2, ChevronLeft, ChevronRight,
  Info, User, Building, Copy, Check, ArrowRight
} from 'lucide-react';
import ShareButton from '@/components/ShareButton';

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
    images = rawProperty.photos.map((p: any) => p.url || p.src || p).filter(Boolean);
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

  // Get square footage from various fields
  const squareFootage = rawProperty.squareFootage || 
                        rawProperty.sqft || 
                        rawProperty.buildingSize || 
                        rawProperty.size ||
                        rawProperty.area ||
                        null;

  // Transform to CommercialProperty
  return {
    propertyId: rawProperty.propertyId || rawProperty.id || rawProperty.zpid || fallbackId,
    listingType: rawProperty.listingType || rawProperty.type || rawProperty.transactionType || '',
    propertyType: rawProperty.propertyType || rawProperty.propertySubType || '',
    city: city,
    state: state,
    zip: zip,
    country: country,
    address: address,
    description: rawProperty.description || rawProperty.summary || '',
    listingUrl: rawProperty.listingUrl || rawProperty.url || rawProperty.detailUrl || '',
    images: images,
    dataPoints: rawProperty.dataPoints || [],
    price: price,
    priceNumeric: priceNumeric,
    priceCurrency: rawProperty.priceCurrency || 'USD',
    isAuction: rawProperty.isAuction || false,
    auctionEndDate: rawProperty.auctionEndDate || null,
    squareFootage: squareFootage,
    buildingSize: rawProperty.buildingSize || null,
    numberOfUnits: rawProperty.numberOfUnits || rawProperty.units || null,
    brokerName: rawProperty.brokerName || rawProperty.broker?.name || null,
    brokerCompany: rawProperty.brokerCompany || rawProperty.broker?.company || null,
    propertyTypeDetailed: rawProperty.propertyTypeDetailed || null,
    capRate: rawProperty.capRate || null,
    position: rawProperty.position || 0,
    availability: rawProperty.availability || null,
    com: rawProperty.com,
  };
}

function CommercialDetailContent() {
  const params = useParams();
  const router = useRouter();
  
  // Parse params array - simplified: just property ID
  // - /commercial/crexi-1728502 (params = ['crexi-1728502'])
  // - /commercial/bit123/crexi-1728502 (params = ['bit123', 'crexi-1728502']) - bit support for shareability
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
    // This handles both numeric IDs like "38763600" and string IDs like "crexi-1728502"
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

  // Filter valid image URLs - handle both string arrays and object arrays
  const images = (property?.images || [])
    .map((img: any) => {
      // Handle string URLs
      if (typeof img === 'string') return img;
      // Handle object with url/imageUrl/src properties
      if (typeof img === 'object' && img !== null) {
        return img.url || img.imageUrl || img.src || img.href || '';
      }
      return '';
    })
    .filter((url: string) => url && typeof url === 'string' && (url.startsWith('http') || url.startsWith('//')));
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="h-[40px] md:h-[68px]"></div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-accent-yellow animate-spin" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="h-[40px] md:h-[68px]"></div>
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 text-center">
          <Building2 className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-6 text-sm md:text-base">The commercial property you&apos;re looking for could not be found.</p>
          <button
            onClick={goBack}
            className="px-5 py-2.5 md:px-6 md:py-3 bg-accent-yellow hover:bg-yellow-400 text-primary-black rounded-lg font-medium transition-colors text-sm md:text-base"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Removed com logic - not needed

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="h-[40px] md:h-[68px]"></div>
      
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[40px] md:top-[68px] z-40">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <button
                onClick={goBack}
                className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-primary-black transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} className="md:w-5 md:h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-xl font-bold text-primary-black truncate">
                  Commercial Property
                </h1>
                <p className="text-gray-500 text-xs md:text-sm truncate">{cleanAddress(property.address) || 'Address Not Available'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${getListingBadgeColor(property.listingType)}`}>
                {getListingLabel(property.listingType)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="mb-4 md:mb-8">
            <div className="relative h-[250px] sm:h-[350px] md:h-[500px] rounded-xl md:rounded-2xl overflow-hidden bg-gray-200 group">
              <img
                src={images[currentImageIndex]}
                alt={property.address || 'Commercial Property'}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => {
                  window.open(images[currentImageIndex], '_blank');
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/logoRE.png';
                  target.className = 'w-full h-full object-contain p-8 bg-gray-100';
                }}
              />
              {/* Share Button Overlay */}
              <div className="absolute top-4 right-4 z-10">
                <ShareButton
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                  title={cleanAddress(property.address) || 'Commercial Property'}
                  text={`Check out this commercial property: ${cleanAddress(property.address)}`}
                  variant="icon"
                  iconSize={20}
                />
              </div>
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/90 hover:bg-white text-primary-black rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeft size={20} className="md:w-6 md:h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/90 hover:bg-white text-primary-black rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRight size={20} className="md:w-6 md:h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-primary-black text-xs md:text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-col gap-1 md:gap-2">
                <span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-lg ${getListingBadgeColor(property.listingType)}`}>
                  {getListingLabel(property.listingType)}
                </span>
                {property.propertyType && (
                  <span className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-lg bg-primary-black text-white">
                    {property.propertyType}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {hasMultipleImages && (
              <div className="flex gap-2 mt-3 md:mt-4 overflow-x-auto pb-2">
                {images.slice(0, 10).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index ? 'border-accent-yellow' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${index + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/logoRE.png';
                      }}
                    />
                  </button>
                ))}
                {images.length > 10 && (
                  <div className="flex-shrink-0 w-16 h-12 md:w-20 md:h-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 text-xs md:text-sm font-medium">
                    +{images.length - 10}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* No Images Placeholder */}
        {images.length === 0 && (
          <div className="mb-4 md:mb-8 h-[200px] md:h-[300px] bg-gray-200 rounded-xl md:rounded-2xl flex items-center justify-center">
            <Building2 size={60} className="md:w-20 md:h-20 text-gray-400" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Price & Address Card */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4 mb-3 md:mb-4">
                <div className="text-2xl md:text-4xl font-bold text-primary-black">
                  {formatPrice(property.price, property.priceNumeric)}
                </div>
              </div>
              
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="text-accent-yellow mt-1 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <div className="text-lg font-medium text-primary-black">
                    {cleanAddress(property.address) || 'Address Not Available'}
                  </div>
                  <div className="text-gray-500">
                    {[property.city, getStateString(property.state), property.zip].filter(Boolean).join(', ')}
                  </div>
                </div>
                <button
                  onClick={copyAddress}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>


              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
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
                {property.propertyTypeDetailed && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <Building2 className="text-accent-yellow" size={18} />
                    <span className="text-primary-black font-medium">{property.propertyTypeDetailed}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-primary-black mb-4 flex items-center gap-2">
                  <Info className="text-accent-yellow" size={20} />
                  Property Description
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}

            {/* Property Highlights */}
            {property.dataPoints && property.dataPoints.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-primary-black mb-4 flex items-center gap-2">
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
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Key Details Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary-black mb-4">Key Details</h3>
              <div className="space-y-4">
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
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-primary-black mb-4 flex items-center gap-2">
                  <User className="text-accent-yellow" size={20} />
                  Listed By
                </h3>
                <div className="text-gray-600">
                  {property.brokerName && <div className="font-medium text-primary-black">{property.brokerName}</div>}
                  {property.brokerCompany && <div className="text-gray-500">{property.brokerCompany}</div>}
                </div>
              </div>
            )}

            {/* Location Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-primary-black mb-4 flex items-center gap-2">
                <MapPin className="text-accent-yellow" size={20} />
                Location
              </h3>
              <div className="text-gray-600">
                <p className="mb-2">{cleanAddress(property.address) || 'Address Not Available'}</p>
                <p>{property.city}, {getStateString(property.state)} {property.zip}</p>
                {property.country && <p className="text-gray-400 text-sm mt-1">{property.country}</p>}
              </div>
            </div>
          </div>
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
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="h-[40px] md:h-[68px]"></div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-accent-yellow animate-spin" />
        </div>
      </div>
    }>
      <CommercialDetailContent />
    </Suspense>
  );
}

