'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Home, MapPin, Bed, Bath, Square, Calendar, FileJson, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Property {
  address: {
    street: string;
    locality: string;
    region: string;
    postalCode: string;
  };
  state?: string;
  baths?: number;
  beds?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
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
  [key: string]: any;
}

function JsonCardsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 20;

  const folder = searchParams.get('folder') || '';
  const file = searchParams.get('file') || '';

  useEffect(() => {
    const loadProperties = async () => {
      if (!folder || !file) {
        setError('Missing folder or file parameter');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/residential/${folder}/${file}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load JSON file: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle both array and object formats
        const propertiesArray = Array.isArray(data) ? data : data.properties || [];
        setProperties(propertiesArray);
        setError(null);
      } catch (err) {
        console.error('Error loading properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [folder, file]);

  // Pagination logic
  const totalPages = Math.ceil(properties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const currentProperties = properties.slice(startIndex, endIndex);

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

  const handlePropertyClick = (property: Property, index: number) => {
    // Store the property data in sessionStorage so the detail page can access it
    const propertyId = `${folder}_${file}_${startIndex + index}`;
    sessionStorage.setItem(`json_property_${propertyId}`, JSON.stringify(property));
    sessionStorage.setItem('json_current_source', JSON.stringify({ folder, file }));
    
    router.push(`/jsondetailinfo?id=${encodeURIComponent(propertyId)}`);
  };

  const getAddress = (property: Property) => {
    if (property.address) {
      const { street, locality, region, postalCode } = property.address;
      return {
        street: street || 'Unknown Street',
        city: locality || 'Unknown City',
        state: region || '',
        zip: postalCode || ''
      };
    }
    return { street: 'Unknown', city: 'Unknown', state: '', zip: '' };
  };

  const getImageUrl = (property: Property): string | null => {
    if (property.photos && property.photos.length > 0) {
      const firstPhoto = property.photos[0];
      // Handle both object format {href: "..."} and string format
      if (typeof firstPhoto === 'string') {
        return firstPhoto;
      } else if (firstPhoto && typeof firstPhoto === 'object' && firstPhoto.href) {
        return firstPhoto.href;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading properties from {file}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Error: {error}</p>
          <Link href="/test-page">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold"
            >
              Go Back
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/test-page">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileJson className="text-purple-400" />
                  {file.replace('.json', '').replace(/_/g, ' ').replace(/-/g, ' ')}
                </h1>
                <p className="text-gray-400 text-sm">
                  {properties.length} properties found • Page {currentPage} of {totalPages}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                folder === 'lease' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              }`}>
                {folder === 'lease' ? 'RENTAL' : 'FOR SALE'}
              </span>
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-accent-yellow hover:bg-yellow-400 text-black rounded-lg"
                >
                  <Home size={20} />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No properties found in this file</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProperties.map((property, index) => {
                const addr = getAddress(property);
                const imageUrl = getImageUrl(property);
                
                return (
                  <motion.div
                    key={startIndex + index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    onClick={() => handlePropertyClick(property, index)}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/50 cursor-pointer transition-all duration-300 group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-700">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={addr.street}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <MapPin size={48} />
                        </div>
                      )}
                      {/* Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          folder === 'lease' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-orange-500 text-white'
                        }`}>
                          {folder === 'lease' ? 'For Rent' : 'For Sale'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Price */}
                      <div className="text-xl font-bold text-white mb-2">
                        {formatPrice(property.listPrice)}
                        {folder === 'lease' && <span className="text-sm text-gray-400 font-normal">/mo</span>}
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-2 mb-3">
                        <MapPin size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-300">
                          <div className="font-medium">{addr.street}</div>
                          <div className="text-gray-400">{addr.city}, {addr.state} {addr.zip}</div>
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 pt-3 border-t border-gray-700">
                        {property.beds != null && (
                          <div className="flex items-center gap-1">
                            <Bed size={14} className="text-blue-400" />
                            <span>{property.beds} beds</span>
                          </div>
                        )}
                        {property.baths != null && (
                          <div className="flex items-center gap-1">
                            <Bath size={14} className="text-blue-400" />
                            <span>{property.baths} baths</span>
                          </div>
                        )}
                        {property.sqft != null && (
                          <div className="flex items-center gap-1">
                            <Square size={14} className="text-blue-400" />
                            <span>{property.sqft.toLocaleString()} sqft</span>
                          </div>
                        )}
                        {property.year_built && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-blue-400" />
                            <span>{property.year_built}</span>
                          </div>
                        )}
                      </div>

                      {/* Property Type */}
                      {property.property_type && (
                        <div className="mt-2 text-xs text-gray-500">
                          {property.property_type}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </motion.button>
                
                <div className="flex items-center gap-2">
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
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function JsonCardsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    }>
      <JsonCardsContent />
    </Suspense>
  );
}

