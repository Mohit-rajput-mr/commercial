'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type TabType = 'For Sale' | 'For Lease' | 'Auctions';

interface TrendingProperty {
  id: string;
  priceLabel: string;
  addressLine: string;
  locationLine: string;
  sizeLabel?: string;
  typeLabel: string;
  imageUrl: string;
  link: string;
  isExternal?: boolean;
}

async function loadCommercialDatasets(): Promise<any[]> {
  const datasetUrls = ['/commercial_dataset_17nov2025.json', '/commercial_dataset2.json'];
  let combined: any[] = [];

  for (const url of datasetUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          combined = [...combined, ...data];
        }
      }
    } catch (error) {
      console.warn(`Failed to load dataset ${url}`, error);
    }
  }

  return combined;
}

async function fetchForSaleTrending(limit = 8): Promise<TrendingProperty[]> {
  const allData = await loadCommercialDatasets();

  const forSale = allData
    .filter((item) => {
      const listingType = String(item.listingType || '').toLowerCase();
      const isAuction = item.isAuction || listingType.includes('auction');
      const isLease = listingType.includes('lease') || listingType.includes('rent');
      return !isAuction && !isLease && (item.price || item.priceNumeric);
    })
    .sort((a, b) => {
      // Prioritize properties with images
      const aHasImages = a.images && a.images.length > 0 ? 1 : 0;
      const bHasImages = b.images && b.images.length > 0 ? 1 : 0;
      if (bHasImages !== aHasImages) {
        return bHasImages - aHasImages;
      }
      // Then sort by price (highest first)
      return (b.priceNumeric || 0) - (a.priceNumeric || 0);
    })
    .slice(0, limit);

  return forSale.map((item, index) => ({
    id: item.propertyId || `sale-${index}`,
    priceLabel: item.price || (item.priceNumeric ? `$${item.priceNumeric.toLocaleString()}` : 'Price on request'),
    addressLine: item.address || 'Address not available',
    locationLine: [item.city, item.state, item.zip].filter(Boolean).join(', '),
    sizeLabel: item.squareFootage ? `${item.squareFootage} sq ft` : item.buildingSize || undefined,
    typeLabel: item.propertyTypeDetailed || item.propertyType || 'Commercial Property',
    imageUrl: item.images?.[0] || '/assets/logoRE.png',
    link: `/property/commercial/${item.propertyId || `sale-${index}`}`,
    isExternal: false,
  }));
}

async function fetchForLeaseTrending(limit = 8): Promise<TrendingProperty[]> {
  const allData = await loadCommercialDatasets();

  const forLease = allData
    .filter((item) => {
      const listingType = String(item.listingType || '').toLowerCase();
      const isAuction = item.isAuction || listingType.includes('auction');
      const isLease = listingType.includes('lease') || listingType.includes('rent');
      return !isAuction && isLease;
    })
    .sort((a, b) => {
      // Prioritize properties with images
      const aHasImages = a.images && a.images.length > 0 ? 1 : 0;
      const bHasImages = b.images && b.images.length > 0 ? 1 : 0;
      if (bHasImages !== aHasImages) {
        return bHasImages - aHasImages;
      }
      // Then sort by price (highest first)
      return (b.priceNumeric || 0) - (a.priceNumeric || 0);
    })
    .slice(0, limit);

  return forLease.map((item, index) => ({
    id: item.propertyId || `lease-${index}`,
    priceLabel: item.price || (item.priceNumeric ? `$${item.priceNumeric.toLocaleString()}` : 'Price on request'),
    addressLine: item.address || 'Address not available',
    locationLine: [item.city, item.state, item.zip].filter(Boolean).join(', '),
    sizeLabel: item.squareFootage ? `${item.squareFootage} sq ft` : item.buildingSize || undefined,
    typeLabel: item.propertyTypeDetailed || item.propertyType || 'Commercial Property',
    imageUrl: item.images?.[0] || '/assets/logoRE.png',
    link: `/property/commercial/${item.propertyId || `lease-${index}`}`,
    isExternal: false,
  }));
}

async function fetchAuctionTrending(limit = 8): Promise<TrendingProperty[]> {
  const allData = await loadCommercialDatasets();

  const auctions = allData
    .filter((item) => item.isAuction || String(item.listingType || '').toLowerCase().includes('auction'))
    .sort((a, b) => {
      // Prioritize properties with images
      const aHasImages = a.images && a.images.length > 0 ? 1 : 0;
      const bHasImages = b.images && b.images.length > 0 ? 1 : 0;
      if (bHasImages !== aHasImages) {
        return bHasImages - aHasImages;
      }
      // Then sort by price (highest first)
      return (b.priceNumeric || 0) - (a.priceNumeric || 0);
    })
    .slice(0, limit);

  return auctions.map((item, index) => ({
    id: item.propertyId || `auction-${index}`,
    priceLabel: item.price || (item.priceNumeric ? `$${item.priceNumeric.toLocaleString()}` : 'Starting bid TBD'),
    addressLine: item.address || 'Address not available',
    locationLine: [item.city, item.state, item.zip].filter(Boolean).join(', '),
    sizeLabel: item.squareFootage ? `${item.squareFootage} sq ft` : item.buildingSize || undefined,
    typeLabel: item.propertyTypeDetailed || item.propertyType || 'Auction Property',
    imageUrl: item.images?.[0] || '/assets/logoRE.png',
    link: `/property/commercial/${item.propertyId || `auction-${index}`}`,
    isExternal: false,
  }));
}

export default function Listings() {
  const [activeTab, setActiveTab] = useState<TabType>('Auctions');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [propertiesByTab, setPropertiesByTab] = useState<Record<TabType, TrendingProperty[]>>({
    Auctions: [],
    'For Sale': [],
    'For Lease': [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [sale, lease, auction] = await Promise.all([
          fetchForSaleTrending(),
          fetchForLeaseTrending(),
          fetchAuctionTrending(),
        ]);

        if (isMounted) {
          setPropertiesByTab({
            'For Sale': sale,
            'For Lease': lease,
            Auctions: auction,
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

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };

  return (
    <div className="py-20 px-5 bg-light-gray">
      <div className="max-w-7xl 2xl:max-w-[90%] 3xl:max-w-[85%] 4xl:max-w-[80%] mx-auto px-5 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-primary-black mb-6">
              Trending Properties
            </h2>
            <div className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0">
              {(['Auctions', 'For Sale', 'For Lease'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg border-2 font-semibold text-sm md:text-base transition-all whitespace-nowrap flex-shrink-0 ${
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
          <a
            href="#"
            className="text-primary-black font-semibold border-b-2 border-accent-yellow hover:text-accent-yellow transition-colors flex items-center gap-2"
          >
            See More <ArrowRight size={20} />
          </a>
        </div>

        {/* Listings Grid */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-hide -mx-4 md:mx-0 px-4 md:px-0 touch-pan-x"
        >
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 lg:gap-10 xl:gap-12 2xl:gap-16 min-w-max md:min-w-0">
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
              visibleProperties.map((property, index) => {
                const CardContent = (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all relative group flex-shrink-0 w-[calc(50vw-1.5rem)] md:w-auto cursor-pointer"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundImage: `url(${property.imageUrl})` }}
                      />
                      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-full text-sm font-semibold text-primary-black">
                        {property.typeLabel}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(property.id);
                        }}
                        className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all z-20 ${
                          favorites.has(property.id)
                            ? 'bg-accent-yellow text-primary-black'
                            : 'bg-white text-primary-black hover:bg-accent-yellow'
                        }`}
                      >
                        <Heart size={20} fill={favorites.has(property.id) ? 'currentColor' : 'none'} />
                      </motion.button>
                    </div>
                    <div className="p-5">
                      <div className="text-2xl font-bold text-primary-black mb-2">{property.priceLabel}</div>
                      <div className="text-base text-custom-gray mb-1">{property.addressLine}</div>
                      <div className="text-base text-custom-gray mb-3">{property.locationLine}</div>
                      {property.sizeLabel && (
                        <div className="text-sm font-semibold text-primary-black">{property.sizeLabel}</div>
                      )}
                    </div>
                  </motion.div>
                );

                if (property.isExternal) {
                  return (
                    <a
                      key={property.id}
                      href={property.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {CardContent}
                    </a>
                  );
                }

                return (
                  <Link key={property.id} href={property.link} className="block">
                    {CardContent}
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

