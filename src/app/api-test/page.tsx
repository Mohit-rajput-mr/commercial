'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchPropertiesByLocation, ZillowProperty } from '@/lib/us-real-estate-api';
import { searchProperties } from '@/lib/property-api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Search, Loader2, MapPin, DollarSign, Home, Calendar } from 'lucide-react';
import Image from 'next/image';

export default function APITestPage() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [statusType, setStatusType] = useState<'ForSale' | 'ForRent'>('ForSale');
  const [properties, setProperties] = useState<ZillowProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError(null);
    setProperties([]);
    setApiResponse(null);

    try {
      console.log('🔍 Testing API with location:', location, 'Status:', statusType);
      
      // Test the primary API
      const results = await searchPropertiesByLocation(location.trim(), statusType);
      
      console.log('✅ API Response:', results);
      setApiResponse({
        endpoint: 'https://zillow-com1.p.rapidapi.com/propertyExtendedSearch',
        location: location.trim(),
        statusType,
        resultCount: results.length,
        timestamp: new Date().toISOString(),
      });
      
      setProperties(results);
      
      if (results.length === 0) {
        setError('No properties found. Try a different location or status.');
      }
    } catch (err: any) {
      console.error('❌ API Test Error:', err);
      setError(err.message || 'Failed to fetch properties. Please check the API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyClick = (property: ZillowProperty) => {
    router.push(`/property/zillow/${property.zpid}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="h-[50px] w-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-2">API Test Page</h1>
          <p className="text-gray-600 mb-6">
            Test the Zillow API integration. Enter a city, state, zip code, or address to search for properties.
          </p>

          {/* Search Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-primary-black mb-2">
                Location (City, State, Zip, or Address)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., New York, NY or 10001 or Los Angeles, CA"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-accent-yellow focus:outline-none text-primary-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-black mb-2">
                Property Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="ForSale"
                    checked={statusType === 'ForSale'}
                    onChange={(e) => setStatusType(e.target.value as 'ForSale')}
                    className="w-4 h-4 text-accent-yellow"
                  />
                  <span className="text-primary-black">For Sale</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="ForRent"
                    checked={statusType === 'ForRent'}
                    onChange={(e) => setStatusType(e.target.value as 'ForRent')}
                    className="w-4 h-4 text-accent-yellow"
                  />
                  <span className="text-primary-black">For Rent</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !location.trim()}
              className="w-full md:w-auto px-8 py-3 bg-accent-yellow text-primary-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Testing API...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Test API
                </>
              )}
            </button>
          </div>

          {/* API Response Info */}
          {apiResponse && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">API Response Details</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Endpoint:</strong> {apiResponse.endpoint}</p>
                <p><strong>Location:</strong> {apiResponse.location}</p>
                <p><strong>Status:</strong> {apiResponse.statusType}</p>
                <p><strong>Results:</strong> {apiResponse.resultCount} properties found</p>
                <p><strong>Timestamp:</strong> {new Date(apiResponse.timestamp).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {properties.length > 0 && (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary-black mb-6">
              Properties Found ({properties.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <button
                  key={property.zpid}
                  onClick={() => handlePropertyClick(property)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-gray-100 hover:border-accent-yellow cursor-pointer p-0 text-left flex flex-col h-full"
                >
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    {property.imgSrc ? (
                      <Image
                        src={property.imgSrc}
                        alt={property.address || 'Property'}
                        width={400}
                        height={192}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-custom-gray">
                        <Home size={48} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col p-4 gap-2">
                    <h3 className="font-bold text-lg text-primary-black truncate">
                      {property.address || 'Address not available'}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-custom-gray">
                      <MapPin size={14} />
                      <span className="truncate">
                        {[property.city, property.state, property.zipcode].filter(Boolean).join(', ')}
                      </span>
                    </div>
                    {property.price && (
                      <div className="font-semibold text-accent-yellow text-xl">
                        {typeof property.price === 'string' ? property.price : `$${property.price.toLocaleString()}`}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {property.bedrooms && (
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {property.bedrooms} bed
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {property.bathrooms} bath
                        </div>
                      )}
                      {property.livingArea && (
                        <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {property.livingArea.toLocaleString()} sq ft
                        </div>
                      )}
                    </div>
                    {property.propertyType && (
                      <div className="text-xs text-gray-500 mt-1">
                        {property.propertyType}
                      </div>
                    )}
                    {property.status && (
                      <div className="text-xs text-gray-500">
                        Status: {property.status}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!loading && properties.length === 0 && apiResponse && apiResponse.resultCount === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Search className="mx-auto mb-4 text-custom-gray" size={48} />
            <p className="text-lg text-custom-gray">No properties found for this search.</p>
            <p className="text-sm text-gray-500 mt-2">Try a different location or status type.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

