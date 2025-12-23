'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { searchPropertiesByLocation, ZillowProperty, searchCommercial, CommercialProperty } from "@/lib/us-real-estate-api";
import { searchProperties, APIProperty } from '@/lib/property-api';
import { searchResidentialProperties } from '@/lib/residential-dataset-loader';
import { Search } from "lucide-react";
import { PropertyGridSkeleton } from '@/components/SkeletonLoader';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CommercialPropertyCard from '@/components/CommercialPropertyCard';
import PropertyCard from '@/components/PropertyCard';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [residentialProps, setResidentialProps] = useState<(ZillowProperty | APIProperty)[]>([]);
  const [commercialProps, setCommercialProps] = useState<CommercialProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  // Build search query from any city/state/zip/address params or direct location param
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";
  const postal_code = searchParams.get("postal_code") || "";
  const address = searchParams.get("address") || "";
  const location = searchParams.get("location") || "";
  const locationQuery = location || [address, city, state, postal_code].filter((v) => !!v).join(", ") || "";

  useEffect(() => {
    async function fetchProperties() {
      if (!locationQuery) {
        setFetched(true);
        return;
      }

      setLoading(true);
      setError(null);
      setFetched(false);
      try {
        // Search both residential (Zillow) and commercial (local datasets) properties, plus database properties
        console.log('Searching for:', locationQuery);
        
        // Search database properties first
        let databaseResidential: APIProperty[] = [];
        let databaseCommercial: CommercialProperty[] = [];
        try {
          console.log('📡 Searching database properties for:', locationQuery);
          const dbResponse = await fetch(`/api/properties?search=${encodeURIComponent(locationQuery)}&limit=100`);
          const dbData = await dbResponse.json();
          
          if (dbData.success && dbData.properties && dbData.properties.length > 0) {
            console.log('✅ Database properties found:', dbData.properties.length);
            dbData.properties.forEach((prop: any) => {
              const propertyData = {
                zpid: prop.zpid || prop.id,
                address: prop.address || '',
                city: prop.city || '',
                state: prop.state || '',
                zipcode: prop.zip || prop.zipcode || '',
                price: prop.price || 0,
                priceText: prop.price_text || `$${prop.price?.toLocaleString() || 'N/A'}`,
                propertyType: prop.property_type || 'Commercial',
                status: prop.status || 'For Sale',
                imgSrc: prop.images && prop.images.length > 0 ? prop.images[0] : null,
                images: prop.images || [],
                description: prop.description || '',
                beds: prop.beds || 0,
                baths: prop.baths || 0,
                sqft: prop.sqft || prop.living_area || 0,
                lotSize: prop.lot_size || 0,
                yearBuilt: prop.year_built || null,
                latitude: prop.latitude || null,
                longitude: prop.longitude || null,
                source: 'database',
              };

              if (prop.property_type === 'Residential') {
                databaseResidential.push({
                  zpid: propertyData.zpid,
                  address: propertyData.address,
                  city: propertyData.city,
                  state: propertyData.state,
                  zipcode: propertyData.zipcode,
                  price: propertyData.price,
                  bedrooms: propertyData.beds,
                  bathrooms: propertyData.baths,
                  livingArea: propertyData.sqft,
                  lotSize: propertyData.lotSize,
                  yearBuilt: propertyData.yearBuilt,
                  propertyType: 'Residential',
                  status: propertyData.status,
                  imgSrc: propertyData.imgSrc,
                  images: propertyData.images,
                  description: propertyData.description,
                  latitude: propertyData.latitude,
                  longitude: propertyData.longitude,
                } as APIProperty & { source: string });
              } else {
                databaseCommercial.push(propertyData as CommercialProperty);
              }
            });
          }
        } catch (err) {
          console.error('❌ Database search error:', err);
        }

        // Load residential properties from new datasets (sale)
        const residentialFromNewDatasets = await searchResidentialProperties(locationQuery, 'sale').catch((err) => {
          console.error('Residential dataset search error:', err);
          return [];
        });
        console.log('📊 Residential from new datasets:', residentialFromNewDatasets.length);

        // Search external APIs (optional fallbacks)
        const [residentialRes, commercialRes] = await Promise.all([
          searchPropertiesByLocation(locationQuery, 'ForSale').catch((err) => {
            console.error('Residential API search error:', err);
            return [];
          }),
          searchCommercial(locationQuery, 'sale', undefined, 'commercial').catch((err) => {
            console.error('Commercial search error:', err);
            return { props: [] };
          }),
        ]);

        // Combine results, removing duplicates
        const allResidential: (ZillowProperty | APIProperty)[] = [];
        const existingZpids = new Set<string>();
        
        // Add residential from new datasets FIRST (most reliable)
        residentialFromNewDatasets.forEach(prop => {
          if (prop.zpid && !existingZpids.has(prop.zpid)) {
            allResidential.push(prop);
            existingZpids.add(prop.zpid);
          }
        });
        
        // Add database residential properties
        databaseResidential.forEach(prop => {
          if (prop.zpid && !existingZpids.has(prop.zpid)) {
            allResidential.push(prop);
            existingZpids.add(prop.zpid);
          }
        });
        
        // Add API results (fallback)
        if (Array.isArray(residentialRes)) {
          residentialRes.forEach(prop => {
            if (prop.zpid && !existingZpids.has(prop.zpid)) {
              allResidential.push(prop);
              existingZpids.add(prop.zpid);
            }
          });
        }

        const allCommercial = [...(commercialRes.props || [])];
        const existingAddresses = new Set(allCommercial.map(p => {
          const addressStr = typeof p.address === 'string' ? p.address.toLowerCase() : (p.address?.streetAddress || '').toLowerCase();
          return `${addressStr}_${p.city?.toLowerCase() || ''}_${p.state?.toLowerCase() || ''}`;
        }));
        databaseCommercial.forEach(prop => {
          const propAddressStr = typeof prop.address === 'string' ? prop.address.toLowerCase() : (prop.address?.streetAddress || '').toLowerCase();
          const addressKey = `${propAddressStr}_${prop.city?.toLowerCase() || ''}_${prop.state?.toLowerCase() || ''}`;
          if (!existingAddresses.has(addressKey)) {
            allCommercial.push(prop);
            existingAddresses.add(addressKey);
          }
        });

        // Sort properties to prioritize exact address matches
        const sortByAddressMatch = (props: any[], searchQuery: string) => {
          return props.sort((a, b) => {
            const aAddress = (typeof a.address === 'string' ? a.address : (a.address?.streetAddress || '')).toLowerCase();
            const bAddress = (typeof b.address === 'string' ? b.address : (b.address?.streetAddress || '')).toLowerCase();
            const query = searchQuery.toLowerCase();
            
            const aExactMatch = aAddress.includes(query);
            const bExactMatch = bAddress.includes(query);
            
            if (aExactMatch && !bExactMatch) return -1;
            if (!aExactMatch && bExactMatch) return 1;
            return 0;
          });
        };

        const sortedResidential = sortByAddressMatch([...allResidential], locationQuery);
        const sortedCommercial = sortByAddressMatch([...allCommercial], locationQuery);

        console.log('Search results - Residential:', sortedResidential.length, 'Commercial:', sortedCommercial.length);
        setResidentialProps(sortedResidential);
        setCommercialProps(sortedCommercial);
        setFetched(true);

        // TODO: Geocode properties that don't have coordinates
        // geocodeProperties([...sortedResidential, ...sortedCommercial]);
      } catch (err: any) {
        console.error('Search error:', err);
        setError("Failed to load properties. Try again later.");
        setResidentialProps([]);
        setCommercialProps([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, [locationQuery]);


  const handleCommercialClick = (property: CommercialProperty & { source?: string }) => {
    // Use standardized commercial URL format
    const propertyId = (property as any).propertyId || property.zpid || (property as any).id || '';
    // Use com in URL path if available: /commercial/com[com]/[id]
    const com = (property as any).com;
    if (com) {
      router.push(`/commercial/com${com}/${encodeURIComponent(propertyId)}`);
    } else {
      router.push(`/commercial/${encodeURIComponent(propertyId)}`);
    }
  };

  const handleResidentialClick = (property: ZillowProperty | APIProperty) => {
    // Use standardized residential URL format
    router.push(`/residential/${encodeURIComponent(property.zpid)}`);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="h-[50px] w-full"></div>
      
      <div className="max-w-[1920px] mx-auto px-4 py-8 md:px-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary-black mb-6 text-center">
          Properties {locationQuery && `for ${locationQuery}`}
        </h1>
        
        {loading && (
          <div className="space-y-8">
            <div className="flex items-center justify-center py-4 text-custom-gray">
              <Search className="mr-2 animate-spin" /> Loading properties…
            </div>
            <PropertyGridSkeleton count={8} />
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {!loading && !error && fetched && residentialProps.length === 0 && commercialProps.length === 0 && (
          <div className="text-custom-gray text-lg text-center py-12">
            No matching properties found for &quot;{locationQuery}&quot;.
          </div>
        )}

        {/* Properties Grid Layout */}
        {!loading && (residentialProps.length > 0 || commercialProps.length > 0) && (
          <div className="space-y-8">
              {/* Residential Properties Section */}
              {residentialProps.length > 0 && (
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                    Residential Properties ({residentialProps.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {residentialProps.map((property) => (
                      <div
                        key={property.zpid}
                        onClick={() => setSelectedProperty(property.zpid)}
                      >
                        <PropertyCard
                          property={property as APIProperty}
                          isSelected={selectedProperty === property.zpid}
                          onClick={() => handleResidentialClick(property)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commercial Properties Section */}
              {commercialProps.length > 0 && (
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-600 rounded-full"></span>
                    Commercial Properties ({commercialProps.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {commercialProps.map((property) => (
                      <div
                        key={property.zpid}
                        onClick={() => setSelectedProperty(property.zpid)}
                      >
                        <CommercialPropertyCard
                          property={property}
                          isSelected={selectedProperty === property.zpid}
                          onClick={() => handleCommercialClick(property)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white py-8 px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-center">
        <PropertyGridSkeleton count={8} />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
