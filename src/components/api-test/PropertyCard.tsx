'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Bed, Bath, Square } from 'lucide-react';
import { ZillowProperty, getAddressString, getCity, getState, getZipcode } from '@/lib/zillow-test-api';

interface PropertyCardProps {
  property: ZillowProperty;
  isSelected: boolean;
  onClick?: () => void;
}

export default function PropertyCard({ property, isSelected, onClick }: PropertyCardProps) {
  const router = useRouter();
  
  const formatPrice = (price?: number) => {
    if (!price) return 'Price on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleClick = () => {
    // Navigate to professional property detail page
    router.push(`/property/cr/${property.zpid}`);
  };

  const addressString = getAddressString(property.address);
  const city = getCity(property);
  const state = getState(property);
  const zipcode = getZipcode(property);

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-2 ${
        isSelected ? 'border-accent-yellow shadow-lg' : 'border-transparent'
      }`}
    >
      <div className="relative h-48 w-full bg-gray-200">
        {property.imgSrc ? (
          <Image
            src={property.imgSrc}
            alt={addressString}
            fill
            className="object-cover"
            unoptimized
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {property.status && (
          <div className="absolute top-2 right-2 bg-accent-yellow text-primary-black px-3 py-1 rounded-full text-xs font-bold">
            {property.status}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-2xl font-bold text-primary-black mb-2">
          {formatPrice(property.price)}
        </div>
        <div className="flex items-start gap-2 mb-2">
          <MapPin size={16} className="text-custom-gray mt-0.5 flex-shrink-0" />
          <div className="text-sm text-custom-gray">
            <div className="font-semibold text-primary-black">{addressString}</div>
            <div>
              {city}, {state} {zipcode}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-custom-gray mt-3 pt-3 border-t border-gray-200">
          {property.bedrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bed size={16} />
              <span>{property.bedrooms} bed</span>
            </div>
          )}
          {property.bathrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bath size={16} />
              <span>{property.bathrooms} bath</span>
            </div>
          )}
          {property.livingArea && (
            <div className="flex items-center gap-1">
              <Square size={16} />
              <span>{property.livingArea.toLocaleString()} sqft</span>
            </div>
          )}
        </div>
        {property.zpid && (
          <div className="mt-2 text-xs text-gray-400">
            ZPID: {property.zpid}
          </div>
        )}
      </div>
    </div>
  );
}

