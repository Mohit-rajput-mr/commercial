'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { searchPropertiesByLocation, ZillowProperty, searchCommercial, CommercialProperty } from "@/lib/us-real-estate-api";
import { searchProperties, APIProperty } from '@/lib/property-api';
import { Search, MapPin } from "lucide-react";
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

        // Search external APIs
        const [residentialRes, commercialRes, residentialFromDatasets] = await Promise.all([
          searchPropertiesByLocation(locationQuery, 'ForSale').catch((err) => {
            console.error('Residential search error:', err);
            return [];
          }),
          searchCommercial(locationQuery, 'sale', undefined, 'commercial').catch((err) => {
            console.error('Commercial search error:', err);
            return { props: [] };
          }),
          searchCommercial(locationQuery, 'sale', undefined, 'residential').catch((err) => {
            console.error('Residential from datasets search error:', err);
            return { props: [] };
          }),
        ]);

        // Combine results, removing duplicates
        const allResidential: (ZillowProperty | APIProperty)[] = [...(Array.isArray(residentialRes) ? residentialRes : [])];
        const existingZpids = new Set(allResidential.map(p => p.zpid));
        
        // Add residential from datasets (multifamily, etc.)
        if (residentialFromDatasets.props && residentialFromDatasets.props.length > 0) {
          console.log('📊 Residential from datasets:', residentialFromDatasets.props.length);
          residentialFromDatasets.props.forEach(prop => {
            if (prop.zpid && !existingZpids.has(prop.zpid)) {
              allResidential.push({
                zpid: prop.zpid,
                address: typeof prop.address === 'string' ? prop.address : (prop.address?.streetAddress || ''),
                city: prop.city || '',
                state: prop.state || '',
                zipcode: prop.zipcode || '',
                price: prop.price,
                bedrooms: prop.bedrooms,
                bathrooms: prop.bathrooms,
                livingArea: prop.livingArea,
                lotSize: prop.lotSize,
                yearBuilt: prop.yearBuilt,
                propertyType: prop.propertyType,
                status: prop.status,
                imgSrc: prop.imgSrc,
                images: prop.images,
                description: prop.description,
                latitude: prop.latitude,
                longitude: prop.longitude,
              } as ZillowProperty);
              existingZpids.add(prop.zpid);
            }
          });
        }
        
        databaseResidential.forEach(prop => {
          if (prop.zpid && !existingZpids.has(prop.zpid)) {
            allResidential.push(prop);
            existingZpids.add(prop.zpid);
          }
        });

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

        console.log('Search results - Residential:', allResidential.length, 'Commercial:', allCommercial.length);
        setResidentialProps(allResidential);
        setCommercialProps(allCommercial);
        setFetched(true);
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
    // Check if it's a database property
    if (property.source === 'database') {
      router.push(`/property/${property.zpid}`);
    } else {
      router.push(`/property/commercial/${property.zpid}`);
    }
  };

  const handleResidentialClick = (property: ZillowProperty | APIProperty) => {
    // Check if it's a database property
    if ((property as any).source === 'database') {
      router.push(`/property/${property.zpid}`);
    } else {
      router.push(`/property/zillow/${property.zpid}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="h-[50px] w-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary-black mb-8 text-center">
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

        {/* Residential Properties Section */}
        {residentialProps.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-4">
              Residential Properties ({residentialProps.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {residentialProps.map((property) => (
                <PropertyCard
                  key={property.zpid}
                  property={property as APIProperty}
                  isSelected={false}
                  onClick={() => handleResidentialClick(property)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Commercial Properties Section */}
        {commercialProps.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-4">
              Commercial Properties ({commercialProps.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {commercialProps.map((property) => (
                <CommercialPropertyCard
                  key={property.zpid}
                  property={property}
                  isSelected={false}
                  onClick={() => handleCommercialClick(property)}
                />
              ))}
            </div>
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
