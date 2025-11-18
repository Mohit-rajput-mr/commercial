'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { getPropertyDetailsByZpid, ZillowProperty } from '@/lib/us-real-estate-api';
import Nav from '@/components/Navigation';
import Footer from '@/components/Footer';
import { MapPin, Bed, Bath, Square } from 'lucide-react';

export default function ZillowPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<ZillowProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.zpid && typeof params.zpid === 'string') {
      loadProperty();
    }
    // eslint-disable-next-line
  }, [params.zpid]);

  const loadProperty = async () => {
    if (!params.zpid || typeof params.zpid !== 'string') return;
    setLoading(true);
    setError(null);
    try {
      const result = await getPropertyDetailsByZpid(params.zpid);
      setProperty(result || null);
    } catch (err) {
      setError('Failed to load property details.');
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Nav />
        {/* Navbar Spacer - Prevents content overlap */}
        <div className="h-[50px] w-full"></div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-yellow mb-4"></div>
            <p className="text-lg text-custom-gray">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-white">
        <Nav />
        {/* Navbar Spacer - Prevents content overlap */}
        <div className="h-[50px] w-full"></div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <p className="text-custom-gray mb-4">{error || 'Property could not be loaded'}</p>
            <Link href="/search" className="text-accent-yellow hover:underline">
              Return to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = property.images || (property.imgSrc ? [property.imgSrc] : []);

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      {/* Navbar Spacer - Prevents content overlap */}
      <div className="h-[50px] w-full"></div>

      <div className="max-w-6xl mx-auto py-10 px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            {/* Image Gallery */}
            <div className="relative w-full h-72 md:h-96 bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
              {images.length > 0 ? (
                <Image 
                  src={images[0]} 
                  width={800}
                  height={600}
                  className="object-cover w-full h-full" 
                  alt="Property"
                  unoptimized
                />
              ) : (
                <span className="text-custom-gray">No Image</span>
              )}
            </div>
          </div>
          <div className="md:w-1/2 flex flex-col gap-4">
            <div>
              <h2 className="font-bold text-2xl text-primary-black mb-2">{property.address}</h2>
              <div className="text-accent-yellow text-lg font-semibold mb-2">{property.price}</div>
              <div className="text-custom-gray mb-2">{property.city}, {property.state} {property.zipcode}</div>
            </div>
            <div className="flex flex-wrap gap-4 text-custom-gray text-sm mb-2">
              {property.bedrooms != null && <div className="flex items-center gap-1"><Bed size={18} /> {property.bedrooms} Beds</div>}
              {property.bathrooms != null && <div className="flex items-center gap-1"><Bath size={18} /> {property.bathrooms} Baths</div>}
              {property.livingArea != null && <div className="flex items-center gap-1"><Square size={18} /> {property.livingArea} sqft</div>}
              {property.yearBuilt != null && <div className="flex items-center gap-1"><span>Built in {property.yearBuilt}</span></div>}
            </div>
            {property.description && (
              <div className="border rounded p-4 bg-gray-50 mb-2 text-sm">
                {property.description}
              </div>
            )}
            <div className="mt-6">
              <a
                href={`https://www.zillow.com/homedetails/${property.zpid}_zpid/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-accent-yellow hover:underline font-semibold"
              >
                View on Zillow <MapPin size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

