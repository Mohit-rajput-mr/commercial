'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Download,
  Printer,
  GitCompare,
  MapPin,
  Check,
  ExternalLink,
  ArrowLeft,
  Bed,
  Bath,
  Square,
  Calendar,
  Copy,
  Mail,
  Phone,
} from 'lucide-react';
import { getPropertyDetails, getPropertyImages, PropertyDetailsResponse, getAddressString, getCity, getState, getZipcode } from '@/lib/property-api';
import Nav from '@/components/Navigation';
import Footer from '@/components/Footer';
import PropertyDetailSkeleton from '@/components/PropertyDetailSkeleton';


export default function ResidentialPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetailsResponse | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Leo Jo contact info
  const leoJoPhone = '+1 (917) 209-6200';
  const leoJoEmail = 'leojoemail@gmail.com';

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
      // Fetch property details
      const details = await getPropertyDetails(params.zpid);
      
      // Try to fetch images separately
      try {
        const images = await getPropertyImages(params.zpid);
        if (images && images.length > 0) {
          details.images = images;
        }
      } catch (imgErr) {
        console.warn('Could not fetch images:', imgErr);
      }

      setProperty(details);
      
      // Load favorite status
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

  const copyPropertyId = () => {
    navigator.clipboard.writeText(property.zpid);
    alert('Property ID copied to clipboard!');
  };

  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: `${addressString}, ${city}, ${state}`,
        text: `Check out this property: ${addressString}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      <div className="pt-16 md:pt-20">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-custom-gray hover:text-accent-yellow transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Results</span>
          </button>
        </div>

        {/* Image Gallery */}
        <div className="relative w-full h-[400px] md:h-[600px] bg-gray-100">
          {images.length > 0 ? (
            <>
              <Image
                src={images[currentImageIndex]}
                alt={`${addressString} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Square size={64} className="mx-auto mb-2" />
                <p>No images available</p>
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
              onClick={shareProperty}
              className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Property Details */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-2">
                  {addressString}
                </h1>
                <p className="text-xl text-custom-gray">
                  {city}, {state} {zipcode}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-3xl font-bold text-accent-yellow">
                    {formatPrice(property.price)}
                  </span>
                  {property.propertyType && (
                    <span className="px-3 py-1 bg-accent-yellow/10 text-accent-yellow rounded-full text-sm font-semibold">
                      {property.propertyType}
                    </span>
                  )}
                </div>
              </div>

              {/* Key Features */}
              <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b">
                {property.bedrooms !== undefined && (
                  <div className="flex items-center gap-2">
                    <Bed size={24} className="text-accent-yellow" />
                    <div>
                      <p className="text-2xl font-bold">{property.bedrooms}</p>
                      <p className="text-sm text-custom-gray">Bedrooms</p>
                    </div>
                  </div>
                )}
                {property.bathrooms !== undefined && (
                  <div className="flex items-center gap-2">
                    <Bath size={24} className="text-accent-yellow" />
                    <div>
                      <p className="text-2xl font-bold">{property.bathrooms}</p>
                      <p className="text-sm text-custom-gray">Bathrooms</p>
                    </div>
                  </div>
                )}
                {property.livingArea && (
                  <div className="flex items-center gap-2">
                    <Square size={24} className="text-accent-yellow" />
                    <div>
                      <p className="text-2xl font-bold">{property.livingArea.toLocaleString()}</p>
                      <p className="text-sm text-custom-gray">Sq Ft</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">About This Property</h2>
                  <p className="text-custom-gray leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <div className="p-4 bg-light-gray rounded-lg">
                  <p className="text-custom-gray flex items-center gap-2">
                    <MapPin size={16} />
                    {addressString}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Contact Card */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Contact Agent</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-lg">Leo Jo</p>
                      <p className="text-sm text-custom-gray">Real Estate Professional</p>
                    </div>
                    
                    <a
                      href={`tel:${leoJoPhone}`}
                      className="flex items-center gap-3 p-3 bg-accent-yellow hover:bg-yellow-400 rounded-lg transition-colors"
                    >
                      <Phone size={20} />
                      <span className="font-semibold">{leoJoPhone}</span>
                    </a>
                    
                    <a
                      href={`mailto:${leoJoEmail}`}
                      className="flex items-center gap-3 p-3 border-2 border-accent-yellow hover:bg-accent-yellow/10 rounded-lg transition-colors"
                    >
                      <Mail size={20} />
                      <span className="font-semibold">Email Agent</span>
                    </a>
                  </div>
                </div>

                {/* Property Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Property Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-custom-gray">Property ID</span>
                      <button
                        onClick={copyPropertyId}
                        className="font-semibold hover:text-accent-yellow flex items-center gap-1"
                      >
                        {property.zpid}
                        <Copy size={14} />
                      </button>
                    </div>
                    {property.yearBuilt && (
                      <div className="flex justify-between">
                        <span className="text-custom-gray">Year Built</span>
                        <span className="font-semibold">{property.yearBuilt}</span>
                      </div>
                    )}
                    {property.lotSize && (
                      <div className="flex justify-between">
                        <span className="text-custom-gray">Lot Size</span>
                        <span className="font-semibold">{property.lotSize.toLocaleString()} sq ft</span>
                      </div>
                    )}
                    {property.propertyType && (
                      <div className="flex justify-between">
                        <span className="text-custom-gray">Type</span>
                        <span className="font-semibold">{property.propertyType}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}




