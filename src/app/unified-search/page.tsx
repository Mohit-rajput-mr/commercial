'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchProperties, APIProperty, getAddressString, getCity, getState, getZipcode } from '@/lib/property-api';
import { searchCommercial, CommercialProperty, searchPropertiesByLocation, ZillowProperty } from '@/lib/us-real-estate-api';
import PropertyCard from '@/components/PropertyCard';
import CommercialPropertyCard from '@/components/CommercialPropertyCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Search, Loader2 } from 'lucide-react';
import { PropertyGridSkeleton } from '@/components/SkeletonLoader';

function UnifiedSearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const location = searchParams.get('location') || '';
  const propertyType = searchParams.get('type') || '';
  const status = searchParams.get('status') || 'ForSale'; // Get status from URL (ForSale or ForRent)

  const [residentialProps, setResidentialProps] = useState<(APIProperty | ZillowProperty)[]>([]);
  const [commercialProps, setCommercialProps] = useState<CommercialProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll down 50px when page loads to account for fixed navbar
  useEffect(() => {
    if (location) {
      window.scrollTo({ top: 50, behavior: 'smooth' });
    }
  }, [location]);

  useEffect(() => {
    if (!location) return;

    async function searchAll() {
      setLoading(true);
      setError(null);

      try {
        // Convert status: ForSale -> 'ForSale', ForRent -> 'ForRent' for residential
        // For commercial: ForSale -> 'sale', ForRent -> 'lease'
        const residentialStatus = status === 'ForRent' ? 'ForRent' : 'ForSale';
        const commercialStatus = status === 'ForRent' ? 'lease' : 'sale';

        // Search with specific status first - Try both Zillow API methods
        console.log('🔍 Searching for residential properties:', location, 'Status:', residentialStatus);
        
        // Try Zillow API directly (searchPropertiesByLocation) first - more reliable
        let zillowResults: ZillowProperty[] = [];
        try {
          console.log('📡 Calling Zillow API via searchPropertiesByLocation...');
          zillowResults = await searchPropertiesByLocation(location, residentialStatus);
          console.log('✅ Zillow API (direct) results:', zillowResults.length, 'properties');
          if (zillowResults.length > 0) {
            console.log('Sample Zillow property:', zillowResults[0]);
          }
        } catch (err) {
          console.error('❌ Zillow API (direct) error:', err);
        }
        
        // Also try the property-api function as fallback
        let propertyApiResults: APIProperty[] = [];
        try {
          console.log('📡 Calling Zillow API via searchProperties (property-api)...');
          const residentialRes = await searchProperties(location, residentialStatus as 'ForSale' | 'ForRent');
          propertyApiResults = residentialRes.props || [];
          console.log('✅ Property API results:', propertyApiResults.length, 'properties');
          if (propertyApiResults.length > 0) {
            console.log('Sample Property API result:', propertyApiResults[0]);
          }
        } catch (err) {
          console.error('❌ Property API error:', err);
        }

        // Search commercial properties
        const commercialRes = await searchCommercial(location, commercialStatus as 'sale' | 'lease').catch(() => ({ props: [] }));

        // Convert ZillowProperty to APIProperty format for consistent display
        const convertZillowToAPI = (zillow: ZillowProperty): APIProperty => {
          const price = typeof zillow.price === 'string' 
            ? parseInt(zillow.price.replace(/[^0-9]/g, '')) || 0 
            : (zillow.price || 0);
          
          return {
            zpid: zillow.zpid,
            address: zillow.address || 'Address not available',
            city: zillow.city || '',
            state: zillow.state || '',
            zipcode: zillow.zipcode || '',
            price: price,
            bedrooms: zillow.bedrooms,
            bathrooms: zillow.bathrooms,
            livingArea: zillow.livingArea,
            lotSize: zillow.lotSize,
            yearBuilt: zillow.yearBuilt,
            propertyType: zillow.propertyType,
            status: zillow.status || zillow.listingStatus,
            imgSrc: zillow.imgSrc || zillow.images?.[0],
            images: zillow.images || (zillow.imgSrc ? [zillow.imgSrc] : []),
            description: zillow.description,
            zestimate: zillow.zestimate,
            latitude: zillow.latitude,
            longitude: zillow.longitude,
          };
        };

        // Get ALL properties without limit - combine both residential results, removing duplicates
        const convertedZillowProps: APIProperty[] = zillowResults.map(convertZillowToAPI);
        let filteredResidential: APIProperty[] = [...convertedZillowProps];
        
        console.log('📊 Converted Zillow properties:', convertedZillowProps.length);
        
        // Add property-api results that aren't duplicates (by zpid)
        const existingZpids = new Set(convertedZillowProps.map(p => p.zpid));
        propertyApiResults.forEach(prop => {
          if (prop.zpid && !existingZpids.has(prop.zpid)) {
            filteredResidential.push(prop);
          }
        });
        
        console.log('📊 Total combined residential properties:', filteredResidential.length);
        
        let filteredCommercial = commercialRes.props || [];
        console.log('📊 Commercial properties:', filteredCommercial.length);

        // If no residential results found for specific status, try to show ALL properties by location (lenient search)
        if (filteredResidential.length === 0) {
          console.log('No residential results for specific status, trying lenient search...');
          // Try searching with ForSale regardless of selected status
          try {
            const allZillowResults = await searchPropertiesByLocation(location, 'ForSale');
            const convertedAllZillow = allZillowResults.map(convertZillowToAPI);
            filteredResidential = convertedAllZillow;
            console.log('Lenient Zillow search results:', convertedAllZillow.length, 'properties');
          } catch (err) {
            console.error('Lenient Zillow search error:', err);
          }
          
          // Also try property-api
          if (filteredResidential.length === 0) {
            try {
              const allResidentialRes = await searchProperties(location, 'ForSale');
              filteredResidential = allResidentialRes.props || [];
              console.log('Lenient Property API results:', filteredResidential.length, 'properties');
            } catch (err) {
              console.error('Lenient Property API error:', err);
            }
          }
        }
        
        // If no commercial results, try the other type
        if (filteredCommercial.length === 0) {
          try {
            const altCommercialRes = await searchCommercial(location, commercialStatus === 'sale' ? 'lease' : 'sale');
            filteredCommercial = altCommercialRes.props || [];
          } catch (err) {
            console.error('Alternative commercial search error:', err);
          }
        }

        if (propertyType) {
          filteredResidential = filteredResidential.filter((p) => p.propertyType?.toLowerCase().includes(propertyType.toLowerCase()));
          filteredCommercial = filteredCommercial.filter((p) => p.propertyType?.toLowerCase().includes(propertyType.toLowerCase()));
        }

        // Sort commercial properties: prioritize properties with images, then by price (highest first)
        filteredCommercial = filteredCommercial.sort((a, b) => {
          const aHasImage = a.imgSrc || (a.images && a.images.length > 0);
          const bHasImage = b.imgSrc || (b.images && b.images.length > 0);
          
          if (aHasImage && !bHasImage) return -1;
          if (!aHasImage && bHasImage) return 1;
          
          // Both have images or both don't, sort by price
          const aPrice = a.price || 0;
          const bPrice = b.price || 0;
          
          return bPrice - aPrice;
        });

        // No limit - show all properties
        setResidentialProps(filteredResidential);
        setCommercialProps(filteredCommercial);
      } catch (err) {
        setError('Failed to search properties. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }

    searchAll();
  }, [location, propertyType, status]);

  const handleResidentialClick = (property: APIProperty) => {
    // Navigate to Zillow property detail page
    router.push(`/property/zillow/${property.zpid}`);
  };

  const handleCommercialClick = (property: CommercialProperty) => {
    router.push(`/property/commercial/${property.zpid}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Navbar Spacer - Prevents content overlap */}
      <div className="h-[50px] w-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary-black mb-2">
          Search Results
          {location && (
            <span className="text-accent-yellow"> for &quot;{location}&quot;</span>
          )}
        </h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {status && (
            <span className="px-3 py-1 bg-accent-yellow/20 text-primary-black rounded-lg text-sm font-semibold">
              {status === 'ForRent' ? 'For Rent' : 'For Sale'}
            </span>
          )}
          {propertyType && (
            <span className="px-3 py-1 bg-gray-200 text-primary-black rounded-lg text-sm font-semibold">
              {propertyType}
            </span>
          )}
        </div>

        {loading && (
          <div className="space-y-8">
            <div className="flex items-center justify-center py-4">
              <Loader2 className="animate-spin text-accent-yellow mr-2" size={24} />
              <span className="text-custom-gray">Searching properties...</span>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-4">
                Residential Properties
              </h2>
              <PropertyGridSkeleton count={3} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-4">
                Commercial Properties
              </h2>
              <PropertyGridSkeleton count={3} />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Residential Properties Section */}
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-4">
                Residential Properties ({residentialProps.length})
              </h2>
              {residentialProps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {residentialProps.map((property) => (
                    <div key={property.zpid}>
                      <PropertyCard
                        property={property as APIProperty}
                        isSelected={false}
                        onClick={() => handleResidentialClick(property as APIProperty)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Search className="mx-auto mb-4 text-custom-gray" size={48} />
                  <p className="text-lg text-custom-gray">No residential properties found</p>
                </div>
              )}
            </div>

            {/* Commercial Properties Section */}
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-4">
                Commercial Properties ({commercialProps.length})
              </h2>
              {commercialProps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {commercialProps.map((property) => (
                    <div key={property.zpid}>
                      <CommercialPropertyCard
                        property={property}
                        isSelected={false}
                        onClick={() => handleCommercialClick(property)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg shadow-md p-8 text-center">
                  <Search className="mx-auto mb-4 text-orange-700" size={48} />
                  <p className="text-lg text-orange-900">No commercial properties found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function UnifiedSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="h-[50px] w-full"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-10">
          <PropertyGridSkeleton count={6} />
        </div>
        <Footer />
      </div>
    }>
      <UnifiedSearchPageContent />
    </Suspense>
  );
}

