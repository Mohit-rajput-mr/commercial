'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchProperties, APIProperty } from '@/lib/property-api';
import { searchCommercial, CommercialProperty, searchPropertiesByLocation, ZillowProperty } from '@/lib/us-real-estate-api';
import { loadPropertiesForLocation, propertyMatchesLocation } from '@/lib/dataset-loader';
import PropertyCard from '@/components/PropertyCard';
import CommercialPropertyCard from '@/components/CommercialPropertyCard';
import Navigation from '@/components/Navigation';
import MapView from '@/components/MapView';
import { Search, Loader2, Map as MapIcon, List, Building2, Home } from 'lucide-react';
import { PropertyGridSkeleton } from '@/components/SkeletonLoader';

// Helper function to determine if property is commercial
const isCommercialProperty = (property: APIProperty | CommercialProperty): boolean => {
  const propType = (property.propertyType || '').toLowerCase();
  const commercialTypes = ['commercial', 'office', 'retail', 'industrial', 'warehouse', 'medical', 'land', 'hotel', 'mixed', 'flex', 'special', 'multifamily'];
  return commercialTypes.some(type => propType.includes(type));
};

function UnifiedSearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const location = searchParams.get('location') || '';
  const propertyType = searchParams.get('type') || '';
  const status = searchParams.get('status') || 'ForSale';

  const [allProperties, setAllProperties] = useState<(APIProperty | CommercialProperty)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  
  // Filter states
  const [showResidential, setShowResidential] = useState(true);
  const [showCommercial, setShowCommercial] = useState(true);
  
  const propertyRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Load properties for the searched location
  useEffect(() => {
    if (!location) return;

    async function searchAll() {
      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Searching for properties in:', location);

        // 1. Load from city-specific dataset files (MOST RELIABLE)
        const datasetProperties = await loadPropertiesForLocation(location);
        console.log('📊 Dataset properties for', location + ':', datasetProperties.length);

        // 2. Parallel API calls for additional properties
        const residentialStatus = status === 'ForRent' ? 'ForRent' : 'ForSale';
        const commercialStatus = status === 'ForRent' ? 'lease' : 'sale';
        
        const [zillowResults, propertyApiResults, commercialRes, dbData] = await Promise.all([
          searchPropertiesByLocation(location, residentialStatus).catch(() => []),
          searchProperties(location, residentialStatus as 'ForSale' | 'ForRent').then(r => r.props || []).catch(() => []),
          searchCommercial(location, commercialStatus as 'sale' | 'lease', undefined, 'commercial').catch(() => ({ props: [] })),
          fetch(`/api/properties?city=${encodeURIComponent(location.split(',')[0] || location)}&limit=500`)
            .then(r => r.json())
            .catch(() => ({ success: false, properties: [] }))
        ]);

        console.log('📊 API Results:');
        console.log('   - Zillow:', (zillowResults as any[]).length);
        console.log('   - Property API:', propertyApiResults.length);
        console.log('   - Commercial API:', commercialRes.props?.length || 0);
        console.log('   - Database:', dbData.properties?.length || 0);

        // Convert Zillow to APIProperty format
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
            propertyType: zillow.propertyType || 'Residential',
            status: zillow.status || zillow.listingStatus,
            imgSrc: zillow.imgSrc || zillow.images?.[0],
            images: zillow.images || (zillow.imgSrc ? [zillow.imgSrc] : []),
            description: zillow.description,
            zestimate: zillow.zestimate,
            latitude: zillow.latitude,
            longitude: zillow.longitude,
          };
        };

        // Combine all properties, removing duplicates
        const allProps: (APIProperty | CommercialProperty)[] = [];
        const seenIds = new Set<string>();
        const seenAddresses = new Set<string>();

        const addProperty = (prop: APIProperty | CommercialProperty) => {
          const propId = prop.zpid || '';
          const addressStr = typeof prop.address === 'string' 
            ? prop.address.toLowerCase().substring(0, 50) 
            : ((prop.address as any)?.streetAddress || '').toLowerCase().substring(0, 50);
          const addressKey = `${addressStr}_${(prop.city || '').toLowerCase()}`;
          
          // Skip if already seen
          if (propId && seenIds.has(propId)) return;
          if (addressKey.length > 10 && seenAddresses.has(addressKey)) return;
          
          // IMPORTANT: Only add properties that match the searched location
          if (!propertyMatchesLocation(prop, location)) {
            return;
          }
          
          if (propId) seenIds.add(propId);
          if (addressKey.length > 10) seenAddresses.add(addressKey);
          allProps.push(prop);
        };

        // Add dataset properties FIRST (they're pre-filtered by city)
        datasetProperties.forEach(p => {
          seenIds.add(p.zpid || '');
          allProps.push(p);
        });
        console.log('📊 After dataset:', allProps.length, 'properties');

        // Add Zillow results (residential) - only if they match location
        (zillowResults as ZillowProperty[]).forEach(z => {
          const converted = convertZillowToAPI(z);
          addProperty(converted);
        });
        
        // Add property API results
        propertyApiResults.forEach(p => addProperty(p));
        
        // Add commercial results
        if (commercialRes.props) {
          commercialRes.props.forEach((p: CommercialProperty) => addProperty(p));
        }
        
        // Add database properties
        if (dbData.success && dbData.properties) {
          dbData.properties.forEach((prop: any) => {
            const converted = {
              zpid: prop.zpid || prop.id,
              address: prop.address || '',
              city: prop.city || '',
              state: prop.state || '',
              zipcode: prop.zip || prop.zipcode || '',
              price: prop.price || 0,
              propertyType: prop.property_type || 'Commercial',
              status: prop.status || 'For Sale',
              imgSrc: prop.images?.[0] || null,
              images: prop.images || [],
              description: prop.description || '',
              bedrooms: prop.beds || 0,
              bathrooms: prop.baths || 0,
              livingArea: prop.sqft || prop.living_area || 0,
              lotSize: prop.lot_size || 0,
              yearBuilt: prop.year_built || null,
              latitude: prop.latitude || null,
              longitude: prop.longitude || null,
              source: 'database',
            } as any;
            addProperty(converted);
          });
        }

        console.log('📊 Total combined properties:', allProps.length);

        // Sort: prioritize properties with images, then by price
        allProps.sort((a, b) => {
          const aHasImage = a.imgSrc || (a.images && a.images.length > 0);
          const bHasImage = b.imgSrc || (b.images && b.images.length > 0);
          if (aHasImage && !bHasImage) return -1;
          if (!aHasImage && bHasImage) return 1;
          return (b.price || 0) - (a.price || 0);
        });

        setAllProperties(allProps);
        console.log('✅ Total properties loaded for "' + location + '":', allProps.length);

      } catch (err) {
        setError('Failed to search properties. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }

    searchAll();
  }, [location, propertyType, status]);

  // Filter properties based on type toggles
  const filteredProperties = allProperties.filter(prop => {
    const isCommercial = isCommercialProperty(prop);
    if (isCommercial && !showCommercial) return false;
    if (!isCommercial && !showResidential) return false;
    return true;
  });

  // Separate for display
  const residentialProps = filteredProperties.filter(p => !isCommercialProperty(p));
  const commercialProps = filteredProperties.filter(p => isCommercialProperty(p));

  const handlePropertyClick = (property: APIProperty | CommercialProperty) => {
    const isCommercial = isCommercialProperty(property);
    const source = (property as any).source;
    const listingUrl = (property as any).listingUrl;
    
    // If it has a listing URL, open in new tab
    if (listingUrl) {
      window.open(listingUrl, '_blank');
      return;
    }
    
    if (source === 'database') {
      router.push(`/property/${property.zpid}`);
    } else if (isCommercial) {
      router.push(`/property/commercial/${property.zpid}`);
    } else {
      router.push(`/property/residential/${property.zpid}`);
    }
  };

  // Handle marker click - scroll to property in list
  const handleMarkerClick = useCallback((propertyId: string) => {
    console.log('🎯 Marker clicked:', propertyId);
    
    // Highlight the property
    setHighlightedPropertyId(propertyId);
    
    // Scroll to property card in list
    setTimeout(() => {
      const propertyElement = propertyRefs.current.get(propertyId);
      if (propertyElement) {
        propertyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight animation
        propertyElement.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-75');
        setTimeout(() => {
          propertyElement.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-75');
        }, 3000);
      }
    }, 100);
  }, []);

  const handlePropertyHover = useCallback((propertyId: string | null) => {
    setHighlightedPropertyId(propertyId);
  }, []);

  // Count for display
  const totalResidential = allProperties.filter(p => !isCommercialProperty(p)).length;
  const totalCommercial = allProperties.filter(p => isCommercialProperty(p)).length;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation />
      
      {/* Navbar Spacer */}
      <div className="h-[50px] w-full flex-shrink-0"></div>
      
      {/* Header Section - Fixed */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 flex-shrink-0">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-primary-black">
                Search Results
                {location && (
                  <span className="text-accent-yellow"> for &quot;{location}&quot;</span>
                )}
              </h1>
              <div className="flex flex-wrap gap-2 mt-1">
                {status && (
                  <span className="px-2 py-0.5 bg-accent-yellow/20 text-primary-black rounded text-xs font-semibold">
                    {status === 'ForRent' ? 'For Rent' : 'For Sale'}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {allProperties.length} properties found
                </span>
              </div>
            </div>
            
            {/* Mobile View Toggle */}
            <div className="flex md:hidden gap-2">
              <button
                onClick={() => setViewMode('map')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-primary-black'
                }`}
              >
                <MapIcon size={16} />
                Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-primary-black'
                }`}
              >
                <List size={16} />
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDE - Map (FIXED, does not scroll) */}
        <div className={`
          ${viewMode === 'list' ? 'hidden md:block' : 'block'}
          ${viewMode === 'map' ? 'w-full' : 'w-full md:w-1/2'}
          h-full relative
        `}>
          {loading ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="animate-spin text-blue-500 mx-auto mb-2" size={40} />
                <p className="text-gray-600 font-medium">Loading map...</p>
                <p className="text-gray-400 text-sm">Centering on {location}</p>
              </div>
            </div>
          ) : (
            <MapView
              properties={allProperties}
              centerLocation={location}
              onMarkerClick={handleMarkerClick}
              onMarkerHover={handlePropertyHover}
              highlightedPropertyId={highlightedPropertyId}
              showResidential={showResidential}
              showCommercial={showCommercial}
            />
          )}
        </div>

        {/* RIGHT SIDE - Property List (SCROLLABLE independently) */}
        <div 
          ref={listContainerRef}
          className={`
            ${viewMode === 'map' ? 'hidden md:flex' : 'flex'}
            ${viewMode === 'list' ? 'w-full' : 'w-full md:w-1/2'}
            flex-col h-full overflow-hidden bg-gray-50
          `}
        >
          {/* Filter Buttons - Sticky at top of list */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => setShowResidential(!showResidential)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  showResidential 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-blue-400'
                }`}
              >
                <Home size={16} />
                Residential
                <span className={`px-1.5 py-0.5 rounded text-xs ${showResidential ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  {totalResidential}
                </span>
              </button>
              <button
                onClick={() => setShowCommercial(!showCommercial)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  showCommercial 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-amber-400'
                }`}
              >
                <Building2 size={16} />
                Commercial
                <span className={`px-1.5 py-0.5 rounded text-xs ${showCommercial ? 'bg-amber-600' : 'bg-gray-200'}`}>
                  {totalCommercial}
                </span>
              </button>
            </div>
          </div>

          {/* Scrollable Property List */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {loading && (
              <div className="space-y-6">
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
                  <span className="text-gray-600">Searching properties in {location}...</span>
                </div>
                <PropertyGridSkeleton count={4} />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-6">
                {/* Residential Properties */}
                {showResidential && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Residential Properties ({residentialProps.length})
                    </h2>
                    {residentialProps.length > 0 ? (
                      <div className="space-y-3">
                        {residentialProps.map((property, index) => (
                          <div 
                            key={property.zpid || `res-${index}`}
                            ref={(el) => {
                              if (el && property.zpid) propertyRefs.current.set(property.zpid, el);
                            }}
                            onMouseEnter={() => property.zpid && handlePropertyHover(property.zpid)}
                            onMouseLeave={() => handlePropertyHover(null)}
                            className={`transition-all duration-300 rounded-xl ${
                              highlightedPropertyId === property.zpid 
                                ? 'ring-2 ring-blue-500 shadow-lg scale-[1.01] bg-blue-50' 
                                : 'hover:shadow-md'
                            }`}
                          >
                            <PropertyCard
                              property={property as APIProperty}
                              isSelected={highlightedPropertyId === property.zpid}
                              onClick={() => handlePropertyClick(property)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg shadow p-6 text-center">
                        <Home className="mx-auto mb-3 text-gray-400" size={40} />
                        <p className="text-gray-500">No residential properties found in {location}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Commercial Properties */}
                {showCommercial && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      Commercial Properties ({commercialProps.length})
                    </h2>
                    {commercialProps.length > 0 ? (
                      <div className="space-y-3">
                        {commercialProps.map((property, index) => {
                          const propertyId = property.zpid || `comm-${index}`;
                          return (
                            <div 
                              key={propertyId}
                              ref={(el) => {
                                if (el && property.zpid) propertyRefs.current.set(property.zpid, el);
                              }}
                              onMouseEnter={() => property.zpid && handlePropertyHover(property.zpid)}
                              onMouseLeave={() => handlePropertyHover(null)}
                              className={`transition-all duration-300 rounded-xl ${
                                highlightedPropertyId === property.zpid 
                                  ? 'ring-2 ring-amber-500 shadow-lg scale-[1.01] bg-amber-50' 
                                  : 'hover:shadow-md'
                              }`}
                            >
                              <CommercialPropertyCard
                                property={property as CommercialProperty}
                                isSelected={highlightedPropertyId === property.zpid}
                                onClick={() => handlePropertyClick(property)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-amber-50 rounded-lg shadow p-6 text-center">
                        <Building2 className="mx-auto mb-3 text-amber-400" size={40} />
                        <p className="text-amber-700">No commercial properties found in {location}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* No properties at all */}
                {!showResidential && !showCommercial && (
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <Search className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600 font-medium">No filters selected</p>
                    <p className="text-gray-400 text-sm mt-1">Enable Residential or Commercial to see properties</p>
                  </div>
                )}

                {/* No results found */}
                {showResidential && showCommercial && allProperties.length === 0 && !loading && (
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <Search className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600 font-medium">No properties found for &quot;{location}&quot;</p>
                    <p className="text-gray-400 text-sm mt-1">Try searching for a different city like Miami, Los Angeles, Chicago, Houston, New York, Philadelphia, Phoenix, or San Antonio</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedSearchPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col">
        <Navigation />
        <div className="h-[50px] w-full"></div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
            <p className="text-gray-600 font-medium">Loading search results...</p>
          </div>
        </div>
      </div>
    }>
      <UnifiedSearchPageContent />
    </Suspense>
  );
}
