'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchProperties, APIProperty } from '@/lib/property-api';
import { searchCommercial, CommercialProperty } from '@/lib/us-real-estate-api';
import PropertyCard from '@/components/PropertyCard';
import CommercialPropertyCard from '@/components/CommercialPropertyCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Search, Loader2 } from 'lucide-react';

export default function UnifiedSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const location = searchParams.get('location') || '';
  const propertyType = searchParams.get('type') || '';
  const status = searchParams.get('status') || 'ForSale'; // Get status from URL (ForSale or ForRent)

  const [residentialProps, setResidentialProps] = useState<APIProperty[]>([]);
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

        const [residentialRes, commercialRes] = await Promise.all([
          searchProperties(location, residentialStatus as 'ForSale' | 'ForRent').catch(() => ({ props: [] })),
          searchCommercial(location, commercialStatus as 'sale' | 'lease').catch(() => ({ props: [] })),
        ]);

        // Get ALL properties without limit
        let filteredResidential = residentialRes.props || [];
        let filteredCommercial = commercialRes.props || [];

        if (propertyType) {
          filteredResidential = filteredResidential.filter((p) => p.propertyType?.toLowerCase().includes(propertyType.toLowerCase()));
          filteredCommercial = filteredCommercial.filter((p) => p.propertyType?.toLowerCase().includes(propertyType.toLowerCase()));
        }

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
    router.push(`/property/cr/${property.zpid}`);
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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-accent-yellow mr-2" size={24} />
            <span className="text-custom-gray">Searching properties...</span>
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
                        property={property}
                        isSelected={false}
                        onClick={() => handleResidentialClick(property)}
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

