'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar, 
  FileJson, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2,
  DollarSign,
  Car,
  Trees,
  Shield,
  Info,
  Map,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface Property {
  address?: {
    street?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
  };
  state?: string;
  baths?: number;
  baths_full?: number;
  baths_half?: number;
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
  details?: Array<{
    category: string;
    parent_category: string;
    text: string[];
  }>;
  construction?: string;
  lot_sqft?: number;
  stories?: number;
  garage?: number;
  parking?: string;
  hoa?: number | string;
  hoa_fee?: number | string;
  heating?: string;
  cooling?: string;
  pool?: boolean | string;
  spa?: boolean | string;
  view?: string;
  waterfront?: boolean | string;
  fireplace?: boolean | string;
  flooring?: string;
  appliances?: string | string[];
  laundry?: string;
  security?: string;
  roof?: string;
  exterior?: string;
  foundation?: string;
  zoning?: string;
  tax_assessed_value?: number;
  annual_tax?: number;
  mls_id?: string;
  listing_agent?: string;
  listing_office?: string;
  listing_date?: string;
  days_on_market?: number;
  status?: string;
  neighborhood?: string;
  school_district?: string;
  buildingPermitsHistory?: any[];
  [key: string]: any;
}

function JsonDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sourceInfo, setSourceInfo] = useState<{ folder: string; file: string } | null>(null);

  const propertyId = searchParams.get('id') || '';

  useEffect(() => {
    const loadProperty = () => {
      if (!propertyId) {
        setError('No property ID provided');
        setLoading(false);
        return;
      }

      try {
        // Load property from sessionStorage
        const storedProperty = sessionStorage.getItem(`json_property_${propertyId}`);
        const storedSource = sessionStorage.getItem('json_current_source');
        
        if (!storedProperty) {
          setError('Property not found. Please go back and select a property.');
          setLoading(false);
          return;
        }

        setProperty(JSON.parse(storedProperty));
        if (storedSource) {
          setSourceInfo(JSON.parse(storedSource));
        }
        setError(null);
      } catch (err) {
        console.error('Error loading property:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [propertyId]);

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

  const getAddress = (prop: Property) => {
    if (prop.address) {
      const { street, locality, region, postalCode } = prop.address;
      return {
        street: street || 'Unknown Street',
        city: locality || 'Unknown City',
        state: region || '',
        zip: postalCode || '',
        full: `${street || ''}, ${locality || ''}, ${region || ''} ${postalCode || ''}`.trim()
      };
    }
    return { street: 'Unknown', city: 'Unknown', state: '', zip: '', full: 'Unknown' };
  };

  const copyAddress = async () => {
    if (property) {
      const addr = getAddress(property);
      await navigator.clipboard.writeText(addr.full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const goBackToCards = () => {
    // Try to go back in history first
    if (window.history.length > 1) {
      router.back();
    } else if (sourceInfo) {
      // If coming from unified-search, go back there
      const file = sourceInfo.file || '';
      if (file.includes('_')) {
        // Came from unified-search
        router.push(`/unified-search?location=${encodeURIComponent(file)}&status=${sourceInfo.folder === 'lease' ? 'ForRent' : 'ForSale'}`);
      } else {
        router.push(`/jsoncards?folder=${sourceInfo.folder}&file=${encodeURIComponent(file)}`);
      }
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-accent-yellow animate-spin mx-auto mb-4" />
          <p className="text-primary-black text-base md:text-lg">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 text-base md:text-lg mb-4">{error || 'Property not found'}</p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 md:px-6 md:py-3 bg-accent-yellow hover:bg-yellow-400 text-primary-black rounded-lg font-semibold text-sm md:text-base"
            >
              Go to Home
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const addr = getAddress(property);
  const folder = sourceInfo?.folder || 'sale';

  // Extract photo URLs from photos array (handle both object and string formats)
  const getPhotoUrl = (photo: { href?: string } | string): string | null => {
    if (typeof photo === 'string') {
      return photo;
    } else if (photo && typeof photo === 'object' && photo.href) {
      return photo.href;
    }
    return null;
  };

  const photoUrls: string[] = (property.photos || [])
    .map(getPhotoUrl)
    .filter((url): url is string => url !== null);

  // Helper to render any value properly
  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  // Get all property keys for display
  const excludedKeys = ['photos', 'address', 'coordinates', 'details', 'buildingPermitsHistory'];
  const propertyKeys = Object.keys(property).filter(key => !excludedKeys.includes(key) && property[key] != null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-2 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goBackToCards}
                className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-primary-black transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} className="md:w-5 md:h-5" />
              </motion.button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-xl font-bold text-primary-black truncate">Property Details</h1>
                <p className="text-gray-500 text-xs md:text-sm truncate">{addr.street}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${
                folder === 'lease' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-orange-500 text-white'
              }`}>
                {folder === 'lease' ? 'RENTAL' : 'FOR SALE'}
              </span>
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 md:p-2 bg-accent-yellow hover:bg-yellow-400 text-primary-black rounded-lg"
                >
                  <Home size={18} className="md:w-5 md:h-5" />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Image Gallery */}
        {photoUrls.length > 0 && (
          <div className="mb-4 md:mb-8">
            <div className="relative h-[250px] sm:h-[350px] md:h-[500px] rounded-xl overflow-hidden bg-gray-200">
              <Image
                src={photoUrls[currentImageIndex]}
                alt={`Property image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              
              {/* Image Navigation */}
              {photoUrls.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentImageIndex(i => (i - 1 + photoUrls.length) % photoUrls.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full text-primary-black shadow-lg"
                  >
                    <ChevronLeft size={24} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentImageIndex(i => (i + 1) % photoUrls.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full text-primary-black shadow-lg"
                  >
                    <ChevronRight size={24} />
                  </motion.button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 rounded-full text-primary-black text-sm font-medium">
                    {currentImageIndex + 1} / {photoUrls.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {photoUrls.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {photoUrls.slice(0, 10).map((photoUrl, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-accent-yellow' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={photoUrl}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Price & Address */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-3xl font-bold text-primary-black">
                  {formatPrice(property.listPrice)}
                  {folder === 'lease' && <span className="text-lg text-gray-500 font-normal">/month</span>}
                </div>
                {property.state && (
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                    property.state === 'Lease' || folder === 'lease'
                      ? 'bg-green-500 text-white' 
                      : 'bg-orange-500 text-white'
                  }`}>
                    {property.state}
                  </span>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="text-accent-yellow mt-1 flex-shrink-0" size={20} />
              <div>
                <div className="text-lg text-primary-black font-medium">{addr.street}</div>
                <div className="text-gray-500">{addr.city}, {addr.state} {addr.zip}</div>
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
              {property.beds != null && (
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                  <Bed className="text-accent-yellow" size={18} />
                  <span className="text-primary-black font-medium">{property.beds} Beds</span>
                </div>
              )}
              {property.baths != null && (
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                  <Bath className="text-accent-yellow" size={18} />
                  <span className="text-primary-black font-medium">{property.baths} Baths</span>
                </div>
              )}
              {property.sqft != null && (
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                  <Square className="text-accent-yellow" size={18} />
                  <span className="text-primary-black font-medium">{property.sqft.toLocaleString()} sqft</span>
                </div>
              )}
              {property.year_built && (
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                  <Calendar className="text-accent-yellow" size={18} />
                  <span className="text-primary-black font-medium">Built {property.year_built}</span>
                </div>
              )}
              {property.lot_sqft && (
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                  <Trees className="text-green-500" size={18} />
                  <span className="text-primary-black font-medium">{property.lot_sqft.toLocaleString()} sqft lot</span>
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
            {property.coordinates && (
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
          </div>
        </div>

        {/* Description */}
        {property.listingDescription && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-primary-black mb-4 flex items-center gap-2">
              <Info className="text-accent-yellow" size={20} />
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {property.listingDescription}
            </p>
          </div>
        )}

        {/* Property Details from 'details' array */}
        {property.details && property.details.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-primary-black mb-6 flex items-center gap-2">
              <Building2 className="text-accent-yellow" size={20} />
              Property Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* All Property Data */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-primary-black mb-6 flex items-center gap-2">
            <FileJson className="text-accent-yellow" size={20} />
            All Property Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {propertyKeys.map((key) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-accent-yellow font-medium mb-1 uppercase tracking-wider">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className="text-primary-black text-sm break-words">
                  {renderValue(property[key])}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Building Permits History */}
        {property.buildingPermitsHistory && property.buildingPermitsHistory.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-primary-black mb-6 flex items-center gap-2">
              <Shield className="text-accent-yellow" size={20} />
              Building Permits History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-accent-yellow font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-accent-yellow font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-accent-yellow font-medium">Project Type</th>
                    <th className="text-left py-3 px-4 text-accent-yellow font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {property.buildingPermitsHistory.map((permit, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-600">{permit.permit_effective_date || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600">{permit.permit_type_of_work || 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {[permit.permit_project_type_1, permit.permit_project_type_2, permit.permit_project_type_3]
                          .filter(Boolean)
                          .join(', ') || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          permit.permit_status === 'Final' ? 'bg-green-100 text-green-700' :
                          permit.permit_status === 'Issued' ? 'bg-blue-100 text-blue-700' :
                          permit.permit_status === 'Revoked' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {permit.permit_status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Raw JSON Data (Collapsible) */}
        <details className="bg-white rounded-xl shadow-sm border border-gray-100">
          <summary className="p-6 cursor-pointer text-lg font-semibold text-primary-black flex items-center gap-2">
            <FileJson className="text-accent-yellow" size={20} />
            Raw JSON Data (Click to expand)
          </summary>
          <div className="px-6 pb-6">
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs text-gray-600 max-h-96 overflow-y-auto border border-gray-200">
              {JSON.stringify(property, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}

export default function JsonDetailInfoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-accent-yellow animate-spin mx-auto mb-4" />
          <p className="text-primary-black text-base md:text-lg">Loading...</p>
        </div>
      </div>
    }>
      <JsonDetailContent />
    </Suspense>
  );
}
