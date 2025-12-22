'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { APIProperty } from '@/lib/property-api';
import { loadResidentialProperties } from '@/lib/residential-dataset-loader';
import PropertyCard from '@/components/PropertyCard';
import Navigation from '@/components/Navigation';
import { Loader2, Home } from 'lucide-react';

export default function MiamiBeachRentalPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<APIProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMiamiBeachRentals() {
      setLoading(true);
      setError(null);

      try {
        console.log('🏖️ TEST PAGE: Loading Miami Beach rentals ONLY');
        console.log('   City: "miami beach"');
        console.log('   Listing Type: "lease"');
        console.log('   Expected File: /residential/lease/miami_beach_rental.json');
        
        // CRITICAL: Load ONLY from Miami Beach rental file
        const rentalProperties = await loadResidentialProperties('miami beach', 'lease');
        
        console.log(`✅ TEST PAGE: Loaded ${rentalProperties.length} properties from miami_beach_rental.json`);
        
        // Verify all properties have correct status
        const wrongStatus = rentalProperties.filter(p => {
          const status = (p.status || '').toLowerCase();
          return !status.includes('rent') && !status.includes('lease');
        });
        
        if (wrongStatus.length > 0) {
          console.error(`❌ TEST PAGE: Found ${wrongStatus.length} properties with wrong status!`);
          wrongStatus.forEach(p => {
            console.error(`   Property ${p.zpid}: status="${p.status}"`);
          });
        }
        
        // Log status breakdown
        const statusBreakdown = rentalProperties.reduce((acc, p) => {
          const s = p.status || 'Unknown';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log(`📊 TEST PAGE Status breakdown:`, statusBreakdown);
        
        // Log city breakdown
        const cityBreakdown = rentalProperties.reduce((acc, p) => {
          const city = (p.city || 'NO_CITY').toLowerCase();
          acc[city] = (acc[city] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log(`📊 TEST PAGE City breakdown:`, cityBreakdown);
        
        // Log sample properties
        if (rentalProperties.length > 0) {
          console.log(`📊 TEST PAGE First 5 properties:`, rentalProperties.slice(0, 5).map(p => ({
            zpid: p.zpid,
            city: p.city,
            status: p.status,
            address: p.address
          })));
        }
        
        setProperties(rentalProperties);
      } catch (err) {
        setError('Failed to load Miami Beach rental properties');
        console.error('❌ TEST PAGE Error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMiamiBeachRentals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary-black mb-2">
            Miami Beach Rental Properties
          </h1>
          <p className="text-gray-600">
            Test Page - Loading ONLY from <code className="bg-gray-100 px-2 py-1 rounded">miami_beach_rental.json</code>
          </p>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              {properties.length} Properties Loaded
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              Source: /residential/lease/miami_beach_rental.json
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Loading Miami Beach rental properties...</p>
            <p className="text-gray-400 text-sm mt-2">From: /residential/lease/miami_beach_rental.json</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {properties.length > 0 ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    All Properties from miami_beach_rental.json
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Showing all {properties.length} rental properties. Check console for detailed logs.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <div key={property.zpid} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <PropertyCard
                        property={property}
                        onClick={() => router.push(`/property/residential/${property.zpid}`)}
                        isSelected={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Home className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 font-medium text-lg mb-2">No properties found</p>
                <p className="text-gray-400 text-sm">
                  Check console logs to see what happened during loading
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}



