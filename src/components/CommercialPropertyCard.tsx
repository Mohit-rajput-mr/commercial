'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Square, Building2, Phone } from 'lucide-react';
import { CommercialProperty, getAddressString, getCity as getCommercialCity, getState as getCommercialState, getZipcode as getCommercialZipcode } from '@/lib/us-real-estate-api';

interface CommercialPropertyCardProps {
  property: CommercialProperty;
  isSelected: boolean;
  onClick?: () => void;
}

export default function CommercialPropertyCard({ property, isSelected, onClick }: CommercialPropertyCardProps) {
  const leoJoPhone = '+1 (917) 209-6200';

  const formatPrice = (price?: number, priceText?: string) => {
    if (priceText) return priceText;
    if (!price) return 'Price on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };


  return (
    <div
      onClick={onClick}
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
            {formatPrice(property.price, property.priceText)}
          </div>
          {/* State Badge - Shows "Lease" or "Sale" from JSON file (if available) */}
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
          <MapPin size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-custom-gray">
            <div className="font-semibold">{getAddressString(property.address, property.city, property.state, property.zipcode)}</div>
            <div>
              {getCommercialCity(property)}, {getCommercialState(property)} {getCommercialZipcode(property)}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-custom-gray mt-3 pt-3 border-t border-gray-200">
          {property.livingArea != null && (
            <div className="flex items-center gap-1">
              <Square size={16} />
              <span>{property.livingArea.toLocaleString()} sqft</span>
            </div>
          )}
          {property.propertyType && (
            <div className="flex items-center gap-1">
              <Building2 size={16} />
              <span>{property.propertyType}</span>
            </div>
          )}
        </div>

        {/* Status */}
        {property.status && (
          <div className="mt-2 text-xs text-orange-700 font-semibold">
            {property.status}
          </div>
        )}

        {/* Contact Leo Jo Button */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <a
            href={`https://wa.me/${leoJoPhone.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm block"
          >
            <Phone size={16} />
            WhatsApp Leo Jo
          </a>
        </div>
      </div>
    </div>
  );
}

