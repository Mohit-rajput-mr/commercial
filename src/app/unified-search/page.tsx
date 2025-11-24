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
  const [databaseProps, setDatabaseProps] = useState<(APIProperty | CommercialProperty)[]>([]);
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

        // Search database properties (admin-uploaded)
        let databaseResidential: APIProperty[] = [];
        let databaseCommercial: CommercialProperty[] = [];
        try {
          console.log('📡 Searching database properties for:', location);
          // Search database properties - try multiple search strategies
          let dbResponse = await fetch(`/api/properties?search=${encodeURIComponent(location)}&limit=100`);
          let dbData = await dbResponse.json();
          
          // If no results, try searching by city and state separately
          if (!dbData.success || !dbData.properties || dbData.properties.length === 0) {
            const locationParts = location.split(',').map(p => p.trim());
            if (locationParts.length >= 2) {
              const city = locationParts[0];
              const state = locationParts[1];
              console.log('📡 Trying city/state search:', city, state);
              dbResponse = await fetch(`/api/properties?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&limit=100`);
              dbData = await dbResponse.json();
            }
          }
          
          console.log('📊 Database search results:', dbData.success ? dbData.properties?.length || 0 : 0, 'properties');
          if (dbData.success && dbData.properties && dbData.properties.length > 0) {
            console.log('✅ Sample database property:', dbData.properties[0]);
          } else {
            console.log('⚠️ No database properties found for:', location);
          }
          
          if (dbData.success && dbData.properties) {
            // Separate residential and commercial properties
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

              // If property type is Residential, add to residential array
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
                  source: 'database',
                } as APIProperty & { source: string });
              } else {
                // Commercial property
                databaseCommercial.push(propertyData as CommercialProperty);
              }
            });
            console.log('✅ Database properties found:', {
              residential: databaseResidential.length,
              commercial: databaseCommercial.length
            });
          }
        } catch (err) {
          console.error('❌ Database search error:', err);
        }

        // Search commercial properties - only get actual commercial types
        const commercialRes = await searchCommercial(location, commercialStatus as 'sale' | 'lease', undefined, 'commercial').catch(() => ({ props: [] }));
        
        // Also search for residential properties from datasets (multifamily, etc.)
        const residentialFromDatasets = await searchCommercial(location, commercialStatus as 'sale' | 'lease', undefined, 'residential').catch(() => ({ props: [] }));

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

        // Add database residential properties (remove duplicates)
        databaseResidential.forEach(prop => {
          const propZpid = prop.zpid || (prop as any).id;
          if (propZpid && !existingZpids.has(propZpid)) {
            filteredResidential.push(prop);
            existingZpids.add(propZpid);
          }
        });
        
        // Add residential properties from datasets (multifamily, etc.)
        if (residentialFromDatasets.props && residentialFromDatasets.props.length > 0) {
          console.log('📊 Residential from datasets:', residentialFromDatasets.props.length);
          residentialFromDatasets.props.forEach(prop => {
            const propZpid = prop.zpid || (prop as any).id;
            if (propZpid && !existingZpids.has(propZpid)) {
              // Convert CommercialProperty to APIProperty format
              filteredResidential.push({
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
              } as APIProperty);
              existingZpids.add(propZpid);
            }
          });
        }
        
        console.log('📊 Total combined residential properties:', filteredResidential.length);
        console.log('📊 Database residential:', databaseResidential.length);
        
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

        // Combine database commercial properties with commercial properties
        // Remove duplicates based on address
        const allCommercial = [...filteredCommercial];
        const existingAddresses = new Set(filteredCommercial.map(p => {
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

        // No limit - show all properties
        setResidentialProps(filteredResidential);
        setCommercialProps(allCommercial);
        setDatabaseProps([...databaseResidential, ...databaseCommercial]);
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
    // Check if it's a database property
    if ((property as any).source === 'database') {
      router.push(`/property/${property.zpid}`);
    } else {
      // Navigate to Zillow property detail page
      router.push(`/property/zillow/${property.zpid}`);
    }
  };

  const handleCommercialClick = (property: CommercialProperty & { source?: string }) => {
    // Check if it's a database property
    if (property.source === 'database') {
      router.push(`/property/${property.zpid}`);
    } else {
      router.push(`/property/commercial/${property.zpid}`);
    }
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
                {databaseProps.filter((p: any) => p.source === 'database' && p.propertyType === 'Residential').length > 0 && (
                  <span className="text-sm font-normal text-custom-gray ml-2">
                    ({databaseProps.filter((p: any) => p.source === 'database' && p.propertyType === 'Residential').length} from database)
                  </span>
                )}
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
                {databaseProps.filter((p: any) => p.source === 'database' && p.propertyType !== 'Residential').length > 0 && (
                  <span className="text-sm font-normal text-custom-gray ml-2">
                    ({databaseProps.filter((p: any) => p.source === 'database' && p.propertyType !== 'Residential').length} from database)
                  </span>
                )}
              </h2>
              {commercialProps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {commercialProps.map((property) => (
                    <div key={property.zpid || (typeof property.address === 'string' ? property.address : property.address?.streetAddress || `prop-${Math.random()}`)}>
                      <CommercialPropertyCard
                        property={property}
                        isSelected={false}
                        onClick={() => {
                          // If it's a database property, navigate to database property page
                          if ((property as any).source === 'database') {
                            router.push(`/property/${property.zpid}`);
                          } else {
                            handleCommercialClick(property);
                          }
                        }}
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

