'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square, Calendar, ExternalLink, Copy } from 'lucide-react';
import { PropertyDetailsResponse, getAddressString, getCity, getState, getZipcode } from '@/lib/property-api';

interface PropertyDetailsProps {
  property: PropertyDetailsResponse | null;
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!property) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 h-full flex items-center justify-center">
        <div className="text-center text-custom-gray">
          <MapPin size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold">Select a property to view details</p>
          <p className="text-sm mt-2">Click on any property card from the list</p>
        </div>
      </div>
    );
  }

  const images = property.images || (property.imgSrc ? [property.imgSrc] : []);
  const addressString = getAddressString(property.address);
  const city = getCity(property);
  const state = getState(property);
  const zipcode = getZipcode(property);
  
  const formatPrice = (price?: number) => {
    if (!price) return 'Price on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const copyZpid = () => {
    navigator.clipboard.writeText(property.zpid);
    alert('ZPID copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="relative h-64 md:h-80 bg-gray-200">
            <Image
            src={images[currentImageIndex]}
            alt={addressString}
            fill
            className="object-cover"
            unoptimized
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 z-10"
              >
                <ChevronLeft size={24} className="text-primary-black" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 z-10"
              >
                <ChevronRight size={24} className="text-primary-black" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}

      <div className="p-6 overflow-y-auto flex-1">
        {/* Price and Address */}
        <div className="mb-6">
          <div className="text-3xl font-bold text-primary-black mb-2">
            {formatPrice(property.price)}
          </div>
          <div className="flex items-start gap-2 mb-2">
            <MapPin size={20} className="text-custom-gray mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-primary-black text-lg">{addressString}</div>
              <div className="text-custom-gray">
                {city}, {state} {zipcode}
              </div>
            </div>
          </div>
          {property.zpid && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">ZPID: {property.zpid}</span>
              <button
                onClick={copyZpid}
                className="text-xs text-accent-yellow hover:underline flex items-center gap-1"
                title="Copy ZPID"
              >
                <Copy size={12} />
                Copy
              </button>
            </div>
          )}
        </div>

        {/* Property Specs Table */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-primary-black mb-4">Property Details</h3>
          <div className="grid grid-cols-2 gap-4">
            {property.bedrooms !== undefined && (
              <div className="flex items-center gap-2 p-3 bg-light-gray rounded-lg">
                <Bed size={20} className="text-accent-yellow" />
                <div>
                  <div className="text-sm text-custom-gray">Bedrooms</div>
                  <div className="font-semibold text-primary-black">{property.bedrooms}</div>
                </div>
              </div>
            )}
            {property.bathrooms !== undefined && (
              <div className="flex items-center gap-2 p-3 bg-light-gray rounded-lg">
                <Bath size={20} className="text-accent-yellow" />
                <div>
                  <div className="text-sm text-custom-gray">Bathrooms</div>
                  <div className="font-semibold text-primary-black">{property.bathrooms}</div>
                </div>
              </div>
            )}
            {property.livingArea && (
              <div className="flex items-center gap-2 p-3 bg-light-gray rounded-lg">
                <Square size={20} className="text-accent-yellow" />
                <div>
                  <div className="text-sm text-custom-gray">Living Area</div>
                  <div className="font-semibold text-primary-black">
                    {property.livingArea.toLocaleString()} sqft
                  </div>
                </div>
              </div>
            )}
            {property.lotSize && (
              <div className="flex items-center gap-2 p-3 bg-light-gray rounded-lg">
                <Square size={20} className="text-accent-yellow" />
                <div>
                  <div className="text-sm text-custom-gray">Lot Size</div>
                  <div className="font-semibold text-primary-black">
                    {property.lotSize.toLocaleString()} sqft
                  </div>
                </div>
              </div>
            )}
            {property.yearBuilt && (
              <div className="flex items-center gap-2 p-3 bg-light-gray rounded-lg">
                <Calendar size={20} className="text-accent-yellow" />
                <div>
                  <div className="text-sm text-custom-gray">Year Built</div>
                  <div className="font-semibold text-primary-black">{property.yearBuilt}</div>
                </div>
              </div>
            )}
            {property.propertyType && (
              <div className="flex items-center gap-2 p-3 bg-light-gray rounded-lg">
                <div>
                  <div className="text-sm text-custom-gray">Property Type</div>
                  <div className="font-semibold text-primary-black">{property.propertyType}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zestimate */}
        {property.zestimate && (
          <div className="mb-6 p-4 bg-accent-yellow/20 rounded-lg border border-accent-yellow">
            <div className="text-sm text-custom-gray mb-1">Zestimate</div>
            <div className="text-2xl font-bold text-primary-black">
              {formatPrice(property.zestimate)}
            </div>
          </div>
        )}

        {/* Description */}
        {property.description && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-primary-black mb-3">Description</h3>
            <p className="text-custom-gray leading-relaxed">{property.description}</p>
          </div>
        )}

        {/* Agent/Broker Info */}
        {(property.agentName || property.brokerName) && (
          <div className="mb-6 p-4 bg-light-gray rounded-lg">
            <h3 className="text-lg font-bold text-primary-black mb-3">Contact Information</h3>
            {property.agentName && (
              <div className="mb-2">
                <div className="text-sm text-custom-gray">Agent</div>
                <div className="font-semibold text-primary-black">{property.agentName}</div>
              </div>
            )}
            {property.agentPhone && (
              <div className="mb-2">
                <div className="text-sm text-custom-gray">Phone</div>
                <a href={`tel:${property.agentPhone}`} className="text-accent-yellow hover:underline">
                  {property.agentPhone}
                </a>
              </div>
            )}
            {property.agentEmail && (
              <div className="mb-2">
                <div className="text-sm text-custom-gray">Email</div>
                <a href={`mailto:${property.agentEmail}`} className="text-accent-yellow hover:underline">
                  {property.agentEmail}
                </a>
              </div>
            )}
            {property.brokerName && (
              <div>
                <div className="text-sm text-custom-gray">Broker</div>
                <div className="font-semibold text-primary-black">{property.brokerName}</div>
              </div>
            )}
          </div>
        )}

        {/* View Property Details Button */}
        <a
          href={`/property/cr/${property.zpid}`}
          className="w-full bg-accent-yellow text-primary-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink size={20} />
          View Full Details
        </a>
      </div>
    </div>
  );
}

