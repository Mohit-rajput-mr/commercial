'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { searchPropertiesByLocation, ZillowProperty, searchCommercial, CommercialProperty } from "@/lib/us-real-estate-api";
import { Search, MapPin } from "lucide-react";
import { PropertyGridSkeleton } from '@/components/SkeletonLoader';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CommercialPropertyCard from '@/components/CommercialPropertyCard';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [residentialProps, setResidentialProps] = useState<ZillowProperty[]>([]);
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
        // Search both residential (Zillow) and commercial (local datasets) properties
        console.log('Searching for:', locationQuery);
        const [residentialRes, commercialRes] = await Promise.all([
          searchPropertiesByLocation(locationQuery, 'ForSale').catch((err) => {
            console.error('Residential search error:', err);
            return [];
          }),
          searchCommercial(locationQuery, 'sale').catch((err) => {
            console.error('Commercial search error:', err);
            return { props: [] };
          }),
        ]);

        console.log('Search results - Residential:', Array.isArray(residentialRes) ? residentialRes.length : 0, 'Commercial:', commercialRes.props?.length || 0);
        setResidentialProps(Array.isArray(residentialRes) ? residentialRes : []);
        setCommercialProps(commercialRes.props || []);
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

  const handleCommercialClick = (property: CommercialProperty) => {
    router.push(`/property/commercial/${property.zpid}`);
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
                <button
                  key={property.zpid}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-gray-100 hover:border-accent-yellow cursor-pointer p-0 text-left flex flex-col"
                  onClick={() => router.push(`/property/zillow/${property.zpid}`)}
                >
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    {property.imgSrc ? (
                      <Image 
                        src={property.imgSrc} 
                        alt={property.address || 'Property'} 
                        width={400}
                        height={176}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-custom-gray">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col p-4 gap-2">
                    <h2 className="font-bold text-lg text-primary-black truncate">{property.address}</h2>
                    <div className="text-sm text-custom-gray truncate">{property.city}, {property.state} {property.zipcode}</div>
                    {property.price && <div className="font-semibold text-accent-yellow">{property.price}</div>}
                    <div className="mt-auto flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="inline-block mr-1" size={14} />{property.propertyType || 'Property'}
                    </div>
                  </div>
                </button>
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
