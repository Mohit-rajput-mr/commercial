"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { searchPropertiesByLocation, ZillowProperty } from "@/lib/us-real-estate-api";
import { Search, MapPin } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<ZillowProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  // Build search query from any city/state/zip/address params
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";
  const postal_code = searchParams.get("postal_code") || "";
  const address = searchParams.get("address") || "";
  const locationQuery = [address, city, state, postal_code].filter((v) => !!v).join(", ") || "";

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      setError(null);
      setFetched(false);
      try {
        const results = await searchPropertiesByLocation(locationQuery);
        setProperties(results);
        setFetched(true);
      } catch (err: any) {
        setError("Failed to load properties. Try again later.");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }
    if (locationQuery) fetchProperties();
  }, [locationQuery]);

  return (
    <div className="min-h-screen bg-white py-8 px-4 md:px-8 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-extrabold text-primary-black mb-8 text-center">
        Properties {locationQuery && `for ${locationQuery}`}
      </h1>
      {loading && (
        <div className="flex items-center justify-center py-12 text-custom-gray">
          <Search className="mr-2 animate-spin" /> Loading properties…
        </div>
      )}
      {error && (
        <div className="text-red-600 text-center py-4">{error}</div>
      )}
      {!loading && !error && fetched && properties.length === 0 && (
        <div className="text-custom-gray text-lg text-center py-12">No matching properties found.</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
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
  );
}
