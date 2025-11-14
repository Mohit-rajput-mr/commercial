'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Bed, Bath, Square } from 'lucide-react';
import { APIProperty, getAddressString, getCity, getState, getZipcode } from '@/lib/property-api';

interface PropertyCardProps {
  property: APIProperty;
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
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.01] sm:hover:scale-[1.02] border-2 ${
        isSelected ? 'border-accent-yellow shadow-lg' : 'border-transparent'
      }`}
    >
      <div className="relative h-40 sm:h-48 w-full bg-gray-200">
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
      <div className="p-3 sm:p-4">
        <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary-black mb-1.5 sm:mb-2">
          {formatPrice(property.price)}
        </div>
        <div className="flex items-start gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <MapPin size={14} className="sm:w-4 sm:h-4 text-custom-gray mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm text-custom-gray flex-1 min-w-0">
            <div className="font-semibold text-primary-black truncate">{addressString}</div>
            <div className="truncate">
              {city}, {state} {zipcode}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-custom-gray mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
          {property.bedrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bed size={14} className="sm:w-4 sm:h-4" />
              <span>{property.bedrooms} bed</span>
            </div>
          )}
          {property.bathrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bath size={14} className="sm:w-4 sm:h-4" />
              <span>{property.bathrooms} bath</span>
            </div>
          )}
          {property.livingArea && (
            <div className="flex items-center gap-1">
              <Square size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{property.livingArea.toLocaleString()} sqft</span>
              <span className="sm:hidden">{Math.round(property.livingArea / 1000)}k sqft</span>
            </div>
          )}
        </div>
        {property.zpid && (
          <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-400 truncate">
            ZPID: {property.zpid}
          </div>
        )}
      </div>
    </div>
  );
}

