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
    // Navigate to residential property detail page
    router.push(`/property/residential/${property.zpid}`);
  };

  return (
    <div
      onClick={onClick || handleClick}
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-[1.01] sm:hover:scale-[1.02] border-2 ${
        isSelected ? 'border-accent-yellow shadow-lg' : 'border-transparent'
      }`}
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-100">
        {property.imgSrc ? (
          <Image
            src={property.imgSrc}
            alt={getAddressString(property.address)}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="text-xl font-bold text-primary-black mb-2">
          {formatPrice(property.price)}
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 mb-2">
          <MapPin size={16} className="text-accent-yellow mt-0.5 flex-shrink-0" />
          <div className="text-sm text-custom-gray">
            <div className="font-semibold">{getAddressString(property.address)}</div>
            <div>
              {getCity(property)}, {getState(property)} {getZipcode(property)}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-custom-gray mt-3 pt-3 border-t border-gray-200">
          {property.bedrooms != null && (
            <div className="flex items-center gap-1">
              <Bed size={16} />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex items-center gap-1">
              <Bath size={16} />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.livingArea != null && (
            <div className="flex items-center gap-1">
              <Square size={16} />
              <span>{property.livingArea.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Property Type */}
        {property.propertyType && (
          <div className="mt-2 text-xs text-custom-gray">
            {property.propertyType}
          </div>
        )}
      </div>
    </div>
  );
}

