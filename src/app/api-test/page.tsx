'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { searchProperties, getPropertyDetails, getPropertyImages, ZillowProperty, PropertyDetailsResponse, getAddressString, getCity, getState, getZipcode } from '@/lib/zillow-test-api';
import SearchBar from '@/components/api-test/SearchBar';
import PropertyCard from '@/components/api-test/PropertyCard';

// Free OpenStreetMap component for showing property location
function PropertyLocationMap({ lat, lng, address }: { lat: number; lng: number; address: string }) {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`}
        className="absolute inset-0"
      />
      <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded shadow text-xs">
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-black hover:text-accent-yellow"
        >
          View Larger
        </a>
      </div>
    </div>
  );
}

export default function ApiTestPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<ZillowProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<ZillowProperty | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'ForSale' | 'ForRent'>('ForSale');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [apiCallCount, setApiCallCount] = useState(0);

  const handleSearch = async (location: string, type: 'ForSale' | 'ForRent') => {
    setSearchQuery(location);
    setStatusType(type);
    setLoading(true);
    setError(null);
    setSelectedProperty(null);
    setApiCallCount((prev) => prev + 1);

    try {
      const response = await searchProperties(location, type);
      setProperties(response.props || []);
      setDebugInfo({
        endpoint: response._endpoint,
        params: response._params,
        responseTime: `${response._responseTime}ms`,
        propertyCount: response.props?.length || 0,
        rawResponse: response,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search properties');
      setProperties([]);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelect = (property: ZillowProperty) => {
    // Set selected property to show on map
    setSelectedProperty(property);
    // Scroll to map section on mobile
    setTimeout(() => {
      const mapSection = document.getElementById('property-map-section');
      if (mapSection) {
        mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile First */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-black mb-1 md:mb-2">
                Zillow API Test Page
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-custom-gray">
                Test Zillow API integration with real property data
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="px-2 py-1 sm:px-3 sm:py-1 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-semibold">
                Testing Mode
              </span>
              <div className="text-xs sm:text-sm text-custom-gray">
                API Calls: <span className="font-bold text-primary-black">{apiCallCount}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 md:mt-4 p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="md:w-5 md:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-yellow-800">
                <strong>Warning:</strong> This page is for API testing only - not visible to users.
                Free tier allows 100 requests/day. Use wisely!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6">
        {/* Search Section */}
        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-red-800 mb-1">API Error</div>
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section - Mobile First */}
        {properties.length > 0 && (
          <div className="mb-3 md:mb-4 text-xs sm:text-sm text-custom-gray">
            Found <span className="font-bold text-primary-black">{properties.length}</span> properties
          </div>
        )}

        {/* Property Listings Grid - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {loading && properties.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 md:p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-accent-yellow mb-4"></div>
              <p className="text-base md:text-lg text-custom-gray">Searching properties...</p>
            </div>
          ) : properties.length === 0 && !loading ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 md:p-12 text-center">
              <p className="text-base md:text-lg text-custom-gray mb-2">No properties found</p>
              <p className="text-xs md:text-sm text-custom-gray">Try a different search location</p>
            </div>
          ) : (
            properties.map((property) => (
              <PropertyCard
                key={property.zpid}
                property={property}
                isSelected={selectedProperty?.zpid === property.zpid}
                onClick={() => handlePropertySelect(property)}
              />
            ))
          )}
        </div>

        {/* Property Location Map Section - Mobile First */}
        {selectedProperty && selectedProperty.latitude && selectedProperty.longitude && (
          <div id="property-map-section" className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-primary-black mb-3 md:mb-4">
              Selected Property Location
            </h2>
            <div className="mb-3 md:mb-4">
              <p className="text-sm md:text-base font-semibold text-primary-black">
                {getAddressString(selectedProperty.address)}
              </p>
              <p className="text-xs md:text-sm text-custom-gray">
                {getCity(selectedProperty)}, {getState(selectedProperty)} {getZipcode(selectedProperty)}
              </p>
            </div>
            <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] bg-gray-200 rounded-lg overflow-hidden">
              <PropertyLocationMap
                lat={selectedProperty.latitude}
                lng={selectedProperty.longitude}
                address={getAddressString(selectedProperty.address)}
              />
            </div>
            <div className="mt-3 md:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  const zpid = selectedProperty.zpid;
                  router.push(`/property/cr/${zpid}`);
                }}
                className="flex-1 bg-accent-yellow text-primary-black px-4 py-2.5 md:py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors text-sm md:text-base"
              >
                View Full Details
              </button>
              <button
                onClick={() => setSelectedProperty(null)}
                className="px-4 py-2.5 md:py-3 border-2 border-gray-300 text-primary-black rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Debug Section */}
        {debugInfo && (
          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="w-full px-6 py-4 flex items-center justify-between bg-light-gray hover:bg-gray-200 transition-colors"
            >
              <span className="font-semibold text-primary-black">Debug Information</span>
              {showDebug ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showDebug && (
              <div className="p-6 space-y-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-custom-gray mb-1">Endpoint</div>
                    <div className="font-mono text-primary-black break-all">{debugInfo.endpoint}</div>
                  </div>
                  <div>
                    <div className="text-custom-gray mb-1">Parameters</div>
                    <div className="font-mono text-primary-black break-all">{debugInfo.params}</div>
                  </div>
                  <div>
                    <div className="text-custom-gray mb-1">Response Time</div>
                    <div className="font-semibold text-primary-black">{debugInfo.responseTime}</div>
                  </div>
                  {debugInfo.propertyCount !== undefined && (
                    <div>
                      <div className="text-custom-gray mb-1">Properties Returned</div>
                      <div className="font-semibold text-primary-black">{debugInfo.propertyCount}</div>
                    </div>
                  )}
                  {debugInfo.zpid && (
                    <div>
                      <div className="text-custom-gray mb-1">ZPID</div>
                      <div className="font-mono text-primary-black">{debugInfo.zpid}</div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-custom-gray mb-2">Raw JSON Response</div>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(debugInfo.rawResponse, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

