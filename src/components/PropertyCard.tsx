'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Bed, Bath, Square, Calendar, Home, Car } from 'lucide-react';
import { APIProperty, getAddressString, getCity, getState, getZipcode } from '@/lib/property-api';
import { getResidentialPropertyUrl } from '@/lib/property-routes';

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
    // Store listing type in localStorage so detail page can use it
    const listingState = (property as any).listingState;
    if (listingState === 'Lease' || listingState === 'Sale') {
      const listingType = listingState === 'Lease' ? 'lease' : 'sale';
      localStorage.setItem(`property_${property.zpid}_listingType`, listingType);
      console.log(`💾 Stored listingType="${listingType}" for property ${property.zpid}`);
    }
    
    // Extract bit from property if available
    const bit = (property as any).bit;
    
    // Navigate to residential property detail page using standardized URL with bit
    router.push(getResidentialPropertyUrl(property.zpid, bit));
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
        {/* Price and State Badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xl font-bold text-primary-black">
            {formatPrice(property.price)}
          </div>
          {/* State Badge - Shows "Lease" or "Sale" from JSON file */}
          {(property as any).listingState && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              (property as any).listingState === 'Lease' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {(property as any).listingState}
            </span>
          )}
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
        <div className="flex flex-wrap items-center gap-3 text-sm text-custom-gray mt-3 pt-3 border-t border-gray-200">
          {property.bedrooms != null && (
            <div className="flex items-center gap-1">
              <Bed size={16} className="text-blue-500" />
              <span className="font-medium">{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex items-center gap-1">
              <Bath size={16} className="text-blue-500" />
              <span className="font-medium">{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
          )}
          {property.livingArea != null && (
            <div className="flex items-center gap-1">
              <Square size={16} className="text-blue-500" />
              <span className="font-medium">{property.livingArea.toLocaleString()} sqft</span>
            </div>
          )}
          {property.yearBuilt && (
            <div className="flex items-center gap-1">
              <Calendar size={16} className="text-blue-500" />
              <span className="font-medium">Built {property.yearBuilt}</span>
            </div>
          )}
        </div>

        {/* Additional Property Info */}
        <div className="mt-3 space-y-1.5">
          {property.propertySubtype && (
            <div className="flex items-center gap-2 text-xs text-custom-gray">
              <Home size={14} className="text-gray-400" />
              <span className="font-medium">{property.propertySubtype}</span>
            </div>
          )}
          {property.lotSize && (
            <div className="flex items-center gap-2 text-xs text-custom-gray">
              <Square size={14} className="text-gray-400" />
              <span>Lot: {property.lotSize.toLocaleString()} sqft</span>
            </div>
          )}
          {property.parkingFeatures && (
            <div className="flex items-center gap-2 text-xs text-custom-gray">
              <Car size={14} className="text-gray-400" />
              <span className="truncate">{property.parkingFeatures}</span>
            </div>
          )}
          {property.hoaFees && (
            <div className="text-xs text-custom-gray">
              <span className="font-semibold">HOA:</span> ${property.hoaFees.toLocaleString()}
              {property.hoaFrequency && `/${property.hoaFrequency.toLowerCase()}`}
            </div>
          )}
        </div>

        {/* Property Type */}
        {property.propertyType && !property.propertySubtype && (
          <div className="mt-2 text-xs text-custom-gray font-medium">
            {property.propertyType}
          </div>
        )}
      </div>
    </div>
  );
}

