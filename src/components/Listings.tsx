'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/indexedDB';

type TabType = 'For Sale' | 'For Lease';

interface TrendingProperty {
  id: string;
  priceLabel: string;
  addressLine: string;
  locationLine: string;
  sizeLabel?: string;
  typeLabel: string;
  imageUrl: string;
  rawData?: any;
}

async function loadCommercialDatasets(): Promise<any[]> {
  const datasetUrls = [
    '/commercial/commercial_dataset_17nov2025.json',
    '/commercial/commercial_dataset2.json',
    '/commercial/commercial_dataset_Chicago.json',
    '/commercial/commercial_dataset_houston.json',
    '/commercial/commercial_dataset_LA.json',
    '/commercial/commercial_dataset_ny.json',
    '/commercial/dataset_miami_beach.json',
    '/commercial/dataset_miami_sale.json',
    '/commercial/dataset_miamibeach_lease.json',
    '/commercial/dataset_philadelphia_sale.json',
    '/commercial/dataset_philadelphia.json',
    '/commercial/dataset_phoenix.json',
    '/commercial/dataset_san_antonio_sale.json',
    '/commercial/dataset_son_antonio_lease.json'
  ];
  let combined: any[] = [];

  for (const url of datasetUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          console.log(`📦 Loaded ${data.length} properties from ${url}`);
          combined = [...combined, ...data];
        }
      } else {
        console.warn(`⚠️ Failed to fetch ${url}: ${res.status}`);
      }
    } catch (error) {
      console.warn(`❌ Error loading ${url}:`, error);
    }
  }

  console.log(`📊 Total commercial properties loaded: ${combined.length}`);
  return combined;
}

async function fetchForSaleTrendingFromData(allData: any[], usedPropertyIds: Set<string>, limit = 8): Promise<TrendingProperty[]> {
  // Helper to check for valid images
  const getValidImageCount = (images: any): number => {
    if (!images || !Array.isArray(images)) return 0;
    return images.filter((img: any) => img && typeof img === 'string' && img.startsWith('http')).length;
  };

  const forSale = allData
    .filter((item) => {
      // Skip if already used or no propertyId
      if (!item.propertyId || usedPropertyIds.has(item.propertyId)) return false;
      
      const listingType = String(item.listingType || '').toLowerCase();
      // Exclude lease/rent properties - everything else is considered "for sale"
      const isLease = listingType.includes('lease') || listingType.includes('rent') || listingType.includes('sublease') || listingType.includes('coworking');
      // Must have at least one valid image
      const imageCount = getValidImageCount(item.images);
      return !isLease && imageCount > 0;
    })
    .sort((a, b) => {
      // Prioritize properties with more images
      const aImageCount = getValidImageCount(a.images);
      const bImageCount = getValidImageCount(b.images);
      if (bImageCount !== aImageCount) {
        return bImageCount - aImageCount;
      }
      // Then sort by price (highest first)
      return (b.priceNumeric || 0) - (a.priceNumeric || 0);
    })
    .slice(0, limit);

  console.log(`✅ Found ${forSale.length} For Sale properties with images (from ${allData.length} total)`);

  // Mark these properties as used
  forSale.forEach(item => usedPropertyIds.add(item.propertyId));

  return forSale.map((item, index) => {
    // Clean address - remove appended SF/Unit/AC patterns
    const cleanAddress = (addr: string): string => {
      if (!addr) return '';
      return addr
        .replace(/\d{1,3}(,\d{3})*\s*SF\s*(Office|Retail|Industrial|Multifamily|Available|Property|Commercial|Coworking)?\s*(Available)?/gi, '')
        .replace(/\d+\s*Unit\s*(Multifamily|Apartment|Residential)?/gi, '')
        .replace(/\d+\.\d+\s*AC\s*(Commercial|Residential|Industrial)?\s*(Lot)?/gi, '')
        .replace(/\d+\s*AC\s*(Commercial|Residential|Industrial)?\s*(Lot)?/gi, '')
        .trim();
    };
    
    let addressLine = cleanAddress(item.address || '');
    
    // Check for invalid addresses
    const invalidPatterns = [
      /^\d+\s+(Properties?|Land\s+Properties?)$/i,
      /^(Properties?|Land\s+Properties?)$/i,
      /^\d+\s*Properties?$/i,
    ];
    
    const isInvalidAddress = invalidPatterns.some(pattern => pattern.test(addressLine)) || !addressLine || addressLine.length < 5;
    
    if (isInvalidAddress) {
      const locationParts = [item.city, item.state, item.zip].filter(Boolean);
      addressLine = locationParts.length > 0 ? locationParts.join(', ') : 'Address not available';
    }
    
    return {
      id: item.propertyId || `sale-${index}`,
      priceLabel: item.price || (item.priceNumeric ? `$${item.priceNumeric.toLocaleString()}` : 'Price on request'),
      addressLine: addressLine,
      locationLine: [item.city, item.state, item.zip].filter(Boolean).join(', '),
      sizeLabel: item.squareFootage ? `${item.squareFootage} sq ft` : item.buildingSize || undefined,
      typeLabel: item.propertyTypeDetailed || item.propertyType || 'Commercial Property',
      imageUrl: (() => {
        // Find first valid image URL
        if (item.images && Array.isArray(item.images)) {
          const validImage = item.images.find((img: string) => img && typeof img === 'string' && img.startsWith('http'));
          if (validImage) return validImage;
        }
        return '/assets/logoRE.png';
      })(),
      rawData: item,
    };
  });
}

async function fetchForLeaseTrendingFromData(allData: any[], usedPropertyIds: Set<string>, limit = 8): Promise<TrendingProperty[]> {
  // Helper to check for valid images
  const getValidImageCount = (images: any): number => {
    if (!images || !Array.isArray(images)) return 0;
    return images.filter((img: any) => img && typeof img === 'string' && img.startsWith('http')).length;
  };

  const forLease = allData
    .filter((item) => {
      // Skip if already used or no propertyId
      if (!item.propertyId || usedPropertyIds.has(item.propertyId)) return false;
      
      const listingType = String(item.listingType || '').toLowerCase();
      // Include lease/rent/coworking properties
      const isLease = listingType.includes('lease') || listingType.includes('rent') || listingType.includes('sublease') || listingType.includes('coworking');
      // Must have at least one valid image
      const imageCount = getValidImageCount(item.images);
      return isLease && imageCount > 0;
    })
    .sort((a, b) => {
      // Prioritize properties with more images
      const aImageCount = getValidImageCount(a.images);
      const bImageCount = getValidImageCount(b.images);
      if (bImageCount !== aImageCount) {
        return bImageCount - aImageCount;
      }
      // Then sort by price (highest first)
      return (b.priceNumeric || 0) - (a.priceNumeric || 0);
    })
    .slice(0, limit);

  console.log(`✅ Found ${forLease.length} For Lease properties with images (from ${allData.length} total)`);

  // Mark these properties as used
  forLease.forEach(item => usedPropertyIds.add(item.propertyId));

  return forLease.map((item, index) => {
    // Clean address - remove appended SF/Unit/AC patterns
    const cleanAddress = (addr: string): string => {
      if (!addr) return '';
      return addr
        .replace(/\d{1,3}(,\d{3})*\s*SF\s*(Office|Retail|Industrial|Multifamily|Available|Property|Commercial|Coworking)?\s*(Available)?/gi, '')
        .replace(/\d+\s*Unit\s*(Multifamily|Apartment|Residential)?/gi, '')
        .replace(/\d+\.\d+\s*AC\s*(Commercial|Residential|Industrial)?\s*(Lot)?/gi, '')
        .replace(/\d+\s*AC\s*(Commercial|Residential|Industrial)?\s*(Lot)?/gi, '')
        .trim();
    };
    
    let addressLine = cleanAddress(item.address || '');
    
    // Check for invalid addresses
    const invalidPatterns = [
      /^\d+\s+(Properties?|Land\s+Properties?)$/i,
      /^(Properties?|Land\s+Properties?)$/i,
      /^\d+\s*Properties?$/i,
    ];
    
    const isInvalidAddress = invalidPatterns.some(pattern => pattern.test(addressLine)) || !addressLine || addressLine.length < 5;
    
    if (isInvalidAddress) {
      const locationParts = [item.city, item.state, item.zip].filter(Boolean);
      addressLine = locationParts.length > 0 ? locationParts.join(', ') : 'Address not available';
    }
    
    return {
      id: item.propertyId || `lease-${index}`,
      priceLabel: item.price || (item.priceNumeric ? `$${item.priceNumeric.toLocaleString()}` : 'Price on request'),
      addressLine: addressLine,
      locationLine: [item.city, item.state, item.zip].filter(Boolean).join(', '),
      sizeLabel: item.squareFootage ? `${item.squareFootage} sq ft` : item.buildingSize || undefined,
      typeLabel: item.propertyTypeDetailed || item.propertyType || 'Commercial Property',
      imageUrl: (() => {
        // Find first valid image URL
        if (item.images && Array.isArray(item.images)) {
          const validImage = item.images.find((img: string) => img && typeof img === 'string' && img.startsWith('http'));
          if (validImage) return validImage;
        }
        return '/assets/logoRE.png';
      })(),
      rawData: item,
    };
  });
}

export default function Listings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('For Sale');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [propertiesByTab, setPropertiesByTab] = useState<Record<TabType, TrendingProperty[]>>({
    'For Sale': [],
    'For Lease': [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const allFavs = await import('@/lib/indexedDB').then(m => m.getAllFavorites());
        const favIds = new Set(allFavs.map(f => f.propertyId));
        setFavorites(favIds);
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load all datasets once
        const allData = await loadCommercialDatasets();
        
        // Track used property IDs to ensure no duplicates across tabs
        const usedPropertyIds = new Set<string>();
        
        // Get sale properties first
        const saleProps = await fetchForSaleTrendingFromData(allData, usedPropertyIds);
        
        // Get lease properties (excluding any already shown)
        const leaseProps = await fetchForLeaseTrendingFromData(allData, usedPropertyIds);

        if (isMounted) {
          setPropertiesByTab({
            'For Sale': saleProps,
            'For Lease': leaseProps,
          });
        }
      } catch (err: any) {
        console.error('Trending properties load error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load trending properties.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleProperties = useMemo(() => propertiesByTab[activeTab] || [], [propertiesByTab, activeTab]);

  const toggleFavorite = async (property: TrendingProperty) => {
    const id = property.id;
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
          address: property.addressLine,
          price: property.priceLabel,
          propertyType: property.typeLabel,
          imageUrl: property.imageUrl,
          city: property.locationLine.split(',')[0],
          state: property.locationLine.split(',')[1]?.trim(),
          dataSource: 'commercial',
          rawData: property.rawData,
          timestamp: Date.now(),
        });
        setFavorites(prev => new Set([...prev, id]));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handlePropertyClick = (property: TrendingProperty) => {
    // Store property data in sessionStorage and navigate to commercial-detail page
    if (property.rawData) {
      sessionStorage.setItem(`commercial_property_${property.id}`, JSON.stringify(property.rawData));
      sessionStorage.setItem('commercial_source', 'trending');
    }
    // Navigate to commercial property detail page
    router.push(`/commercial/${encodeURIComponent(property.id)}`);
  };

  return (
    <div className="py-20 px-5 bg-light-gray">
      <div className="max-w-7xl 2xl:max-w-[90%] 3xl:max-w-[85%] 4xl:max-w-[80%] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4 md:gap-6">
          <div>
            <h2 className="text-2xl md:text-5xl font-bold text-primary-black mb-4 md:mb-6">
              Trending Properties
            </h2>
            <div className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0">
              {(['For Sale', 'For Lease'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 md:px-6 py-1.5 md:py-2.5 rounded-lg border-2 font-semibold text-xs md:text-base transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab
                      ? 'bg-primary-black text-accent-yellow border-primary-black'
                      : 'bg-transparent text-primary-black border-primary-black hover:bg-primary-black hover:text-accent-yellow'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <Link
            href="/commercial-search"
            className="text-primary-black font-semibold border-b-2 border-accent-yellow hover:text-accent-yellow transition-colors flex items-center gap-2 text-sm md:text-base"
          >
            See More <ArrowRight size={16} className="md:w-5 md:h-5" />
          </Link>
        </div>

        {/* Listings Grid */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-hide -mx-2 md:mx-0 px-2 md:px-0 touch-pan-x"
        >
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-8 lg:gap-10 xl:gap-12 2xl:gap-16 min-w-max md:min-w-0">
            {isLoading && (
              <div className="col-span-full flex items-center justify-center py-12">
                <p className="text-primary-black text-sm md:text-base">Loading top properties...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center space-y-2">
                <p className="text-primary-black font-semibold">{error}</p>
                <p className="text-sm text-custom-gray">Please refresh the page to try again.</p>
              </div>
            )}

            {!isLoading && !error && visibleProperties.length === 0 && (
              <div className="col-span-full flex items-center justify-center py-12">
                <p className="text-primary-black text-sm md:text-base">No properties available for this category right now.</p>
              </div>
            )}

            {!isLoading &&
              !error &&
              visibleProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  onClick={() => handlePropertyClick(property)}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all relative group flex-shrink-0 w-[calc(45vw-1rem)] md:w-auto cursor-pointer"
                >
                  <div className="relative h-32 md:h-52 overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundImage: `url(${property.imageUrl})` }}
                    />
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white px-2 md:px-4 py-1 md:py-2 rounded-full text-[10px] md:text-sm font-semibold text-primary-black">
                      {property.typeLabel}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(property);
                      }}
                      className={`absolute top-2 md:top-4 right-2 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all z-20 ${
                        favorites.has(property.id)
                          ? 'bg-accent-yellow text-primary-black'
                          : 'bg-white text-primary-black hover:bg-accent-yellow'
                      }`}
                    >
                      <Heart size={16} className="md:w-5 md:h-5" fill={favorites.has(property.id) ? 'currentColor' : 'none'} />
                    </motion.button>
                  </div>
                  <div className="p-2 md:p-5">
                    <div className="text-sm md:text-2xl font-bold text-primary-black mb-1 md:mb-2">{property.priceLabel}</div>
                    <div className="text-[10px] md:text-base text-custom-gray mb-0.5 md:mb-1 line-clamp-1">{property.addressLine}</div>
                    <div className="text-[10px] md:text-base text-custom-gray mb-1 md:mb-3 line-clamp-1">{property.locationLine}</div>
                    {property.sizeLabel && (
                      <div className="text-[10px] md:text-sm font-semibold text-primary-black">{property.sizeLabel}</div>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
