'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { 
  ArrowLeft, Building2, MapPin, DollarSign, Square, 
  Loader2, ChevronLeft, ChevronRight,
  Info, User, Building, Copy, Check, Calendar,
  Map, ExternalLink, FileJson, ChevronDown, ChevronUp
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

function CommercialDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('id') || '';
  
  const [property, setProperty] = useState<CommercialProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // First try to load from sessionStorage
      const storedProperty = sessionStorage.getItem(`commercial_property_${propertyId}`);
      if (storedProperty) {
        try {
          setProperty(JSON.parse(storedProperty));
          setLoading(false);
          return;
        } catch (e) {
          console.error('Failed to parse stored property:', e);
        }
      }

      // If not in sessionStorage, try to load from dataset (for shared links)
      try {
        const { loadCommercialPropertyFromDataset } = await import('@/lib/property-loader');
        const property = await loadCommercialPropertyFromDataset(propertyId);
        
        if (property) {
          setProperty(property);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error loading commercial property from dataset:', err);
      }

      setLoading(false);
    };

    loadProperty();
  }, [propertyId]);

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
  const formatPrice = (price?: string | number | null, priceNumeric?: number | null) => {
    if (typeof price === 'string' && price) return price;
    if (typeof price === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(price);
    }
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

  const copyAddress = async () => {
    if (property) {
      const cleaned = cleanAddress(property.address);
      const fullAddress = `${cleaned || ''}, ${property.city || ''}, ${property.state || ''} ${property.zip || ''}`.trim();
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter valid image URLs
  const getImages = (prop: CommercialProperty | null): string[] => {
    if (!prop?.images) return [];
    return prop.images.filter(img => img && typeof img === 'string' && (img.startsWith('http') || img.startsWith('//')));
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="h-[40px] md:h-[68px]"></div>
      
      {/* Header Bar */}
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
      
      <div className="w-full mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-6">
        {/* TOP SECTION: Image Gallery | Ask Additional Questions */}
        <div className="max-w-[95%] xl:max-w-[92%] 2xl:max-w-[90%] mx-auto">
          <div className="flex flex-col lg:flex-row gap-3 mb-3 md:mb-5">
          {/* LEFT - Image Gallery */}
          <div className="w-full lg:w-3/4 lg:flex-[3]">
            {images.length > 0 ? (
              <div className="w-full">
                <div className="relative w-full aspect-[16/11.7] max-h-[473px] md:max-h-[592px] rounded-xl overflow-hidden bg-gray-200 group">
                  <Image
                    src={images[currentImageIndex]}
                    alt={property.address || 'Commercial Property'}
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
                  {hasMultipleImages && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevImage}
                        className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 p-1.5 md:p-2.5 bg-white/90 hover:bg-white text-primary-black rounded-full shadow-lg transition-colors"
                      >
                        <ChevronLeft size={20} className="md:w-6 md:h-6" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextImage}
                        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-1.5 md:p-2.5 bg-white/90 hover:bg-white text-primary-black rounded-full shadow-lg transition-colors"
                      >
                        <ChevronRight size={20} className="md:w-6 md:h-6" />
                      </motion.button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-primary-black text-xs md:text-sm font-medium">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1 md:gap-1.5">
                    <span className={`px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-lg text-xs md:text-sm font-bold shadow-lg ${getListingBadgeColor(property.listingType)}`}>
                      {getListingLabel(property.listingType)}
                    </span>
                    {property.propertyType && (
                      <span className="px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-lg text-xs md:text-sm font-bold shadow-lg bg-primary-black text-white">
                        {property.propertyType}
                      </span>
                    )}
                  </div>
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
                        className={`relative flex-shrink-0 w-12 h-8 md:w-14 md:h-10 rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === index ? 'border-accent-yellow' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`View ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="(max-width: 768px) 15vw, 64px"
                        />
                      </motion.button>
                    ))}
                    {images.length > 8 && (
                      <div className="flex-shrink-0 w-12 h-8 md:w-14 md:h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                        +{images.length - 8}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[16/13] bg-gray-200 rounded-xl md:rounded-2xl flex items-center justify-center">
                <Building2 size={60} className="md:w-20 md:h-20 text-gray-400" />
              </div>
            )}
          </div>

          {/* RIGHT - Ask Additional Questions Form */}
          <div className="w-full lg:w-1/4 lg:flex-[1] flex-shrink-0">
            <div className="lg:sticky lg:top-[100px] lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
              <PropertyInquiryForm
                propertyAddress={`${cleanAddress(property.address) || ''}, ${property.city || ''}, ${property.state || ''} ${property.zip || ''}`.trim()}
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
                </div>
              </div>
              
              {/* Address */}
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="text-accent-yellow mt-1 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <div className="text-lg font-medium text-primary-black">
                    {cleanAddress(property.address) || 'Address Not Available'}
                  </div>
                  <div className="text-gray-500">
                    {[property.city, property.state, property.zip].filter(Boolean).join(', ')}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={copyAddress}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </motion.button>
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
                {property.yearBuilt && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <Calendar className="text-accent-yellow" size={18} />
                    <span className="text-primary-black font-medium">Built {property.yearBuilt}</span>
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

            {/* Location Map Placeholder */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-primary-black mb-4 flex items-center gap-2">
                <Map className="text-accent-yellow" size={20} />
                Location
              </h3>
              <div className="text-gray-600 mb-4">
                <p className="mb-2">{cleanAddress(property.address) || 'Address Not Available'}</p>
                <p>{property.city}, {property.state} {property.zip}</p>
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
                  href={`https://www.google.com/maps/search/${encodeURIComponent(`${cleanAddress(property.address)}, ${property.city}, ${property.state} ${property.zip}`)}`}
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
