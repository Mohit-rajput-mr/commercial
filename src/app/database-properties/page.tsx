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
        
        // Fetch all active properties from database
        console.log('📡 Fetching database properties...');
        const response = await fetch('/api/properties?limit=1000&page=1');
        const data = await response.json();
        
        console.log('📊 API Response:', {
          success: data.success,
          propertiesCount: data.properties?.length || 0,
          error: data.error,
          pagination: data.pagination
        });
        
        if (data.success && Array.isArray(data.properties)) {
          console.log('✅ Properties fetched:', data.properties.length);
          if (data.properties.length > 0) {
            console.log('📋 Sample property:', data.properties[0]);
          } else {
            console.warn('⚠️ No properties found. Properties need to have is_active = true to appear.');
          }
          // Convert database properties to the format expected by PropertyCard/CommercialPropertyCard
          const formattedProperties = data.properties.map((prop: any) => {
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

            // If residential, return as APIProperty, otherwise as CommercialProperty
            if (prop.property_type === 'Residential') {
              return {
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
              } as APIProperty & { source: string };
            } else {
              return propertyData as CommercialProperty;
            }
          });
          
          setProperties(formattedProperties);
          setFilteredProperties(formattedProperties);
        } else {
          console.error('❌ Failed to load properties:', data.error || 'Unknown error');
          if (data.error) {
            setError(`Error: ${data.error}`);
          } else if (data.properties && Array.isArray(data.properties) && data.properties.length === 0) {
            setError('No active properties found in the database. Properties must have is_active = true to appear here.');
          } else {
            setError('Failed to load properties. Please check the browser console for more details.');
          }
        }
      } catch (err: any) {
        console.error('❌ Error fetching properties:', err);
        setError(`Failed to load properties: ${err.message || 'Unknown error'}. Please try again later.`);
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

