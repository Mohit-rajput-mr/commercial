'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Layers } from 'lucide-react';

interface PropertyMapProps {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: { lat: number; lng: number };
  height?: string;
  showControls?: boolean;
}

export default function PropertyMap({
  address,
  city,
  state,
  zipCode,
  coordinates,
  height = '400px',
  showControls = true,
}: PropertyMapProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [mapUrl, setMapUrl] = useState('');
  const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;

  useEffect(() => {
    // Use Google Maps Embed API (free, no API key required for basic usage)
    // If coordinates are available, use them; otherwise use address
    if (coordinates) {
      const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${coordinates.lat},${coordinates.lng}&zoom=15&maptype=${mapType}`;
      setMapUrl(embedUrl);
    } else {
      // Fallback to address-based embed
      const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(fullAddress)}&zoom=15&maptype=${mapType}`;
      setMapUrl(embedUrl);
    }
  }, [coordinates, fullAddress, mapType, address, city, state, zipCode]);

  // If no API key, use the free embed URL without API key (less reliable but works)
  const fallbackUrl = coordinates
    ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&output=embed&z=15`
    : `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed&z=15`;

  const finalMapUrl = mapUrl || fallbackUrl;

  const openInGoogleMaps = () => {
    const googleMapsUrl = coordinates
      ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    window.open(googleMapsUrl, '_blank');
  };

  const getDirections = () => {
    const directionsUrl = coordinates
      ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
    window.open(directionsUrl, '_blank');
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <iframe
        src={finalMapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-lg"
      />
      
      {showControls && (
        <>
          {/* Map Type Toggle */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
              className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
              title="Toggle Map Type"
            >
              <Layers size={20} className="text-primary-black" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
            <button
              onClick={openInGoogleMaps}
              className="bg-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-semibold text-primary-black"
            >
              <MapPin size={18} />
              Open in Maps
            </button>
            <button
              onClick={getDirections}
              className="bg-accent-yellow px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-400 transition-colors flex items-center gap-2 text-sm font-semibold text-primary-black"
            >
              <Navigation size={18} />
              Get Directions
            </button>
          </div>
        </>
      )}
    </div>
  );
}

