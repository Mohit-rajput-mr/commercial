'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Square,
  Building2,
  Calendar,
  Home,
  Tag,
} from 'lucide-react';
import { getPropertyDetails, getPropertyImages, PropertyDetailsResponse, getAddressString, getCity, getState, getZipcode } from '@/lib/property-api';
import Nav from '@/components/Navigation';
import Footer from '@/components/Footer';
import PropertyDetailSkeleton from '@/components/PropertyDetailSkeleton';
import PropertyInquiryForm from '@/components/PropertyInquiryForm';

export default function ResidentialPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetailsResponse | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.zpid && typeof params.zpid === 'string') {
      loadProperty();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.zpid]);

  const loadProperty = async () => {
    if (!params.zpid || typeof params.zpid !== 'string') return;
    
    setLoading(true);
    setError(null);

    try {
      const details = await getPropertyDetails(params.zpid);
      
      try {
        const images = await getPropertyImages(params.zpid);
        if (images && images.length > 0) {
          details.images = images;
        }
      } catch (imgErr) {
        console.warn('Could not fetch images:', imgErr);
      }

      setProperty(details);
      
      const favorites = JSON.parse(localStorage.getItem('api-favorites') || '[]');
      setIsFavorite(favorites.includes(params.zpid));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property');
      console.error('Error loading property:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Nav />
        <PropertyDetailSkeleton />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-white">
        <Nav />
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
          <div className="text-center px-4">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <p className="text-custom-gray mb-4">{error || 'Property could not be loaded'}</p>
            <Link href="/" className="text-accent-yellow hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = property.images || [];
  const addressString = getAddressString(property.address);
  const city = getCity(property);
  const state = getState(property);
  const zipcode = getZipcode(property);
  const fullAddress = `${addressString}, ${city}, ${state} ${zipcode}`;

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('api-favorites') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== property.zpid)
      : [...favorites, property.zpid];
    localStorage.setItem('api-favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const formatPrice = (price?: number | string) => {
    if (!price) return 'Contact for Price';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'Contact for Price';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      {/* Navbar Spacer */}
      <div className="h-[60px] w-full"></div>

      {/* StreetEasy Style Split Layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-60px)]">
        {/* LEFT SIDE - Image Gallery */}
        <div className="w-full lg:w-1/2 2xl:w-3/5 bg-black relative lg:sticky lg:top-[60px] lg:h-[calc(100vh-60px)]">
          {images.length > 0 ? (
            <div className="relative w-full h-[350px] sm:h-[450px] lg:h-full">
              <Image
                src={images[currentImageIndex]}
                alt={addressString}
                fill
                className="object-cover"
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all z-10"
                  >
                    <ChevronLeft size={24} className="text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all z-10"
                  >
                    <ChevronRight size={24} className="text-gray-800" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="absolute bottom-16 left-0 right-0 px-4">
                  <div className="flex gap-2 justify-center overflow-x-auto py-2">
                    {images.slice(0, 6).map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                          index === currentImageIndex ? 'border-accent-yellow scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                    {images.length > 6 && (
                      <div className="w-16 h-16 rounded-lg bg-black/50 flex items-center justify-center text-white text-sm font-medium">
                        +{images.length - 6}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-full shadow-lg transition-all ${
                    isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 hover:bg-white text-gray-700'
                  }`}
                >
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: fullAddress, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied!');
                    }
                  }}
                  className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all text-gray-700"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-[350px] lg:h-full flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-400">
                <Home size={64} className="mx-auto mb-4" />
                <p>No images available</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - Property Information */}
        <div className="w-full lg:w-1/2 2xl:w-2/5 overflow-y-auto">
          <div className="p-6 lg:p-8 space-y-6">
            {/* Property Title/Address */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {addressString}
              </h1>
              <p className="text-lg text-gray-600 flex items-center gap-2">
                <MapPin size={18} className="text-accent-yellow" />
                {city}, {state} {zipcode}
              </p>
            </div>

            {/* Price */}
            <div className="border-b border-gray-200 pb-6">
              <p className="text-3xl lg:text-4xl font-bold text-accent-yellow">
                {formatPrice(property.price)}
              </p>
              {property.status && (
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  property.status === 'For Rent' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {property.status}
                </span>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-gray-200 pb-6">
              {property.bedrooms !== undefined && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Bed size={24} className="mx-auto text-accent-yellow mb-1" />
                  <p className="text-xl font-bold text-gray-900">{property.bedrooms}</p>
                  <p className="text-xs text-gray-500">Beds</p>
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Bath size={24} className="mx-auto text-accent-yellow mb-1" />
                  <p className="text-xl font-bold text-gray-900">{property.bathrooms}</p>
                  <p className="text-xs text-gray-500">Baths</p>
                </div>
              )}
              {property.livingArea && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Square size={24} className="mx-auto text-accent-yellow mb-1" />
                  <p className="text-xl font-bold text-gray-900">{property.livingArea.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Sq Ft</p>
                </div>
              )}
              {property.yearBuilt && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Calendar size={24} className="mx-auto text-accent-yellow mb-1" />
                  <p className="text-xl font-bold text-gray-900">{property.yearBuilt}</p>
                  <p className="text-xs text-gray-500">Built</p>
                </div>
              )}
            </div>

            {/* Property Type Tags */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-6">
              {property.propertyType && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                  <Building2 size={14} />
                  {property.propertyType}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                <Tag size={14} />
                Residential
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent-yellow/20 rounded-full text-sm font-medium text-accent-yellow">
                <Home size={14} />
                ID: {property.zpid}
              </span>
            </div>

            {/* Key Details */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Key Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium text-gray-900">{property.propertyType || 'Residential'}</span>
                </div>
                {property.lotSize && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lot Size</span>
                    <span className="font-medium text-gray-900">{property.lotSize.toLocaleString()} sqft</span>
                  </div>
                )}
                {property.yearBuilt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Year Built</span>
                    <span className="font-medium text-gray-900">{property.yearBuilt}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-gray-900">{property.status || 'Active'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">About This Property</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Location with Map Icon */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-accent-yellow" />
                Location
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 font-medium">{fullAddress}</p>
                {property.latitude && property.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-accent-yellow hover:underline text-sm"
                  >
                    View on Google Maps →
                  </a>
                )}
              </div>
            </div>

            {/* Ask Additional Questions Form */}
            <div className="pt-2">
              <PropertyInquiryForm
                propertyAddress={fullAddress}
                propertyId={property.zpid}
                formType="property_inquiry"
                theme="light"
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
