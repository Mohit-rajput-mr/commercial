'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import CommercialPropertyCard from '@/components/CommercialPropertyCard';
import { PropertyGridSkeleton } from '@/components/SkeletonLoader';
import { Database, Search, Loader2 } from 'lucide-react';
import type { APIProperty } from '@/lib/property-api';
import type { CommercialProperty } from '@/lib/us-real-estate-api';

export default function DatabasePropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<(APIProperty | CommercialProperty)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProperties, setFilteredProperties] = useState<(APIProperty | CommercialProperty)[]>([]);

  useEffect(() => {
    async function fetchAllProperties() {
      try {
        setLoading(true);
        setError(null);
        
        // Load properties from test_database.json
        console.log('📡 Loading properties from test_database.json...');
        const response = await fetch('/test_database.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load test_database.json: ${response.statusText}`);
        }
        
        // Read as text first to handle JSON structure issues
        const textData = await response.text();
        
        // Try to parse as-is first
        let jsonData;
        try {
          jsonData = JSON.parse(textData);
        } catch (e) {
          // If parsing fails, try to fix common issues
          let fixedText = textData.trim();
          
          // If it doesn't start with '{', add it
          if (!fixedText.startsWith('{')) {
            fixedText = '{' + fixedText;
          }
          
          // Remove trailing comma before closing braces
          fixedText = fixedText.replace(/,\s*(\}|\])/g, '$1');
          
          // Ensure proper closing - should end with }\n}
          if (!fixedText.endsWith('}')) {
            fixedText = fixedText + '\n}';
          }
          
          // If it doesn't have the outer closing brace, add it
          const openCount = (fixedText.match(/\{/g) || []).length;
          const closeCount = (fixedText.match(/\}/g) || []).length;
          if (openCount > closeCount) {
            fixedText = fixedText + '\n}';
          }
          
          try {
            jsonData = JSON.parse(fixedText);
          } catch (e2) {
            console.error('JSON parse error:', e2);
            console.error('First 200 chars:', fixedText.substring(0, 200));
            console.error('Last 200 chars:', fixedText.substring(fixedText.length - 200));
            const errorMessage = e2 instanceof Error ? e2.message : 'Unknown error';
            throw new Error(`Failed to parse JSON: ${errorMessage}`);
          }
        }
        
        // Extract properties from pageProps.properties
        const rawProperties = jsonData?.pageProps?.properties || [];
        
        console.log('📊 Loaded from test_database.json:', {
          totalProperties: rawProperties.length,
          sampleProperty: rawProperties[0]
        });
        
        if (rawProperties.length === 0) {
          console.warn('⚠️ No properties found in test_database.json');
          setError('No properties found in test_database.json');
          setProperties([]);
          setFilteredProperties([]);
          return;
        }
        
        // Convert properties from test_database.json format to PropertyCard/CommercialPropertyCard format
        const formattedProperties = rawProperties.map((prop: any) => {
          // Extract address components
          const addressLine = prop.location?.address?.line || '';
          const city = prop.location?.address?.city || '';
          const state = prop.location?.address?.state || prop.location?.address?.state_code || '';
          const zipcode = prop.location?.address?.postal_code || '';
          const lat = prop.location?.address?.coordinate?.lat || null;
          const lon = prop.location?.address?.coordinate?.lon || null;
          
          // Extract property details
          const price = prop.list_price || 0;
          const beds = prop.description?.beds || null;
          const baths = prop.description?.baths_consolidated ? parseFloat(prop.description.baths_consolidated) : null;
          const sqft = prop.description?.sqft || null;
          const lotSqft = prop.description?.lot_sqft || null;
          const yearBuilt = prop.description?.year_built || null;
          const propertyType = prop.description?.type || 'unknown';
          const status = prop.status === 'for_sale' ? 'For Sale' : prop.status === 'for_rent' ? 'For Rent' : 'For Sale';
          
          // Extract images
          const primaryPhoto = prop.primary_photo?.href || null;
          const photos = prop.photos?.map((p: any) => p.href) || [];
          const images = primaryPhoto ? [primaryPhoto, ...photos.filter((p: string) => p !== primaryPhoto)] : photos;
          
          // Determine if residential or commercial
          const isResidential = ['condos', 'single_family', 'townhomes', 'multi_family'].includes(propertyType);
          
          if (isResidential && beds !== null) {
            // Format as APIProperty (Residential)
            return {
              zpid: prop.property_id || prop.listing_id || `prop-${Math.random()}`,
              address: addressLine,
              city: city,
              state: state,
              zipcode: zipcode,
              price: price,
              bedrooms: beds || 0,
              bathrooms: baths || 0,
              livingArea: sqft || 0,
              lotSize: lotSqft || 0,
              yearBuilt: yearBuilt,
              propertyType: 'Residential',
              status: status,
              imgSrc: images[0] || null,
              images: images,
              description: '',
              latitude: lat,
              longitude: lon,
              source: 'test_database',
            } as APIProperty & { source: string };
          } else {
            // Format as CommercialProperty
            return {
              zpid: prop.property_id || prop.listing_id || `prop-${Math.random()}`,
              address: addressLine,
              city: city,
              state: state,
              zipcode: zipcode,
              price: price,
              priceText: price > 0 ? `$${price.toLocaleString()}` : 'Price on Request',
              propertyType: propertyType === 'land' ? 'Land' : 'Commercial',
              status: status,
              imgSrc: images[0] || null,
              images: images,
              description: '',
              beds: beds || 0,
              baths: baths || 0,
              sqft: sqft || 0,
              lotSize: lotSqft || 0,
              yearBuilt: yearBuilt,
              latitude: lat,
              longitude: lon,
              source: 'test_database',
            } as CommercialProperty & { source: string };
          }
        });
        
        console.log('✅ Formatted properties:', formattedProperties.length);
        setProperties(formattedProperties);
        setFilteredProperties(formattedProperties);
      } catch (err: any) {
        console.error('❌ Error loading properties from test_database.json:', err);
        setError(`Failed to load properties: ${err.message || 'Unknown error'}. Please make sure test_database.json exists in the public folder.`);
        setProperties([]);
        setFilteredProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAllProperties();
  }, []);

  // Filter properties based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProperties(properties);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = properties.filter(prop => {
      // Handle address which can be string or object
      const addressStr = typeof prop.address === 'string' 
        ? prop.address.toLowerCase() 
        : (prop.address?.streetAddress || prop.address?.city || '').toLowerCase();
      const city = prop.city?.toLowerCase() || '';
      const state = prop.state?.toLowerCase() || '';
      const zipcode = prop.zipcode?.toLowerCase() || '';
      const fullAddress = `${addressStr} ${city} ${state} ${zipcode}`;
      
      return fullAddress.includes(query) || 
             addressStr.includes(query) || 
             city.includes(query) || 
             state.includes(query) || 
             zipcode.includes(query);
    });
    
    setFilteredProperties(filtered);
  }, [searchQuery, properties]);

  const handleResidentialClick = (property: APIProperty) => {
    router.push(`/property/${property.zpid}`);
  };

  const handleCommercialClick = (property: CommercialProperty) => {
    router.push(`/property/commercial/${property.zpid}`);
  };

  const residentialProperties = filteredProperties.filter(p => 
    (p as any).propertyType === 'Residential' || (p as any).bedrooms !== undefined
  ) as APIProperty[];
  
  const commercialProperties = filteredProperties.filter(p => 
    (p as any).propertyType !== 'Residential' && (p as any).bedrooms === undefined
  ) as CommercialProperty[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="h-[50px] w-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="text-accent-yellow" size={32} />
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-black">
              Database Properties
            </h1>
          </div>
          <p className="text-custom-gray mb-6">
            Browse all properties uploaded to our database
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by address, city, state, or zip..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow focus:ring-2 focus:ring-accent-yellow/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="space-y-8">
            <div className="flex items-center justify-center py-4">
              <Loader2 className="animate-spin text-accent-yellow mr-2" size={24} />
              <span className="text-custom-gray">Loading properties...</span>
            </div>
            <PropertyGridSkeleton count={6} />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Database className="mx-auto mb-4 text-custom-gray" size={48} />
                <p className="text-lg text-custom-gray">
                  {searchQuery ? 'No properties found matching your search.' : 'No properties in database yet.'}
                </p>
              </div>
            ) : (
              <>
                {/* Residential Properties */}
                {residentialProperties.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-4">
                      Residential Properties ({residentialProperties.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {residentialProperties.map((property) => (
                        <PropertyCard
                          key={property.zpid}
                          property={property}
                          isSelected={false}
                          onClick={() => handleResidentialClick(property)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Commercial Properties */}
                {commercialProperties.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-4">
                      Commercial Properties ({commercialProperties.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {commercialProperties.map((property) => (
                        <CommercialPropertyCard
                          key={property.zpid || (typeof property.address === 'string' ? property.address : property.address?.streetAddress || `prop-${Math.random()}`)}
                          property={property}
                          isSelected={false}
                          onClick={() => handleCommercialClick(property)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Total Count */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center text-custom-gray">
                  <p className="text-sm">
                    Showing {filteredProperties.length} of {properties.length} properties
                    {searchQuery && ` matching "${searchQuery}"`}
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

