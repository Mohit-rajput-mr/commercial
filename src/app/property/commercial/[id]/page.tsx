'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  MapPin,
  Square,
  Building2,
  Tag,
  DollarSign,
  Layers,
  ArrowLeft,
  ExternalLink,
  Info,
} from 'lucide-react';
import { getCommercialDetails, getCommercialImages, CommercialProperty, getAddressString, getCity, getState, getZipcode } from '@/lib/us-real-estate-api';
import Nav from '@/components/Navigation';
import Footer from '@/components/Footer';
import PropertyDetailSkeleton from '@/components/PropertyDetailSkeleton';
import PropertyInquiryForm from '@/components/PropertyInquiryForm';
import ShareButton from '@/components/ShareButton';

export default function CommercialPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const [property, setProperty] = useState<CommercialProperty | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      loadProperty();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadProperty = async () => {
    if (!params.id || typeof params.id !== 'string') return;
    
    setLoading(true);
    setError(null);

    try {
      const details = await getCommercialDetails(params.id);
      
      if (!details) {
        throw new Error('Property not found');
      }
      
      try {
        const images = await getCommercialImages(params.id);
        if (images && images.length > 0) {
          details.images = images;
          details.imgSrc = images[0];
        }
      } catch (imgErr) {
        console.warn('Could not fetch images:', imgErr);
      }

      setProperty(details);
      
      const favorites = JSON.parse(localStorage.getItem('commercial-favorites') || '[]');
      setIsFavorite(favorites.includes(params.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property');
      console.error('Error loading property:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <PropertyDetailSkeleton />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
          <div className="text-center px-4">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <p className="text-gray-500 mb-4">{error || 'Property could not be loaded'}</p>
            <Link href="/" className="text-orange-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = property.images || (property.imgSrc ? [property.imgSrc] : []);
  const addressString = getAddressString(property.address);
  const city = getCity(property);
  const state = getState(property);
  const zipcode = getZipcode(property);
  const fullAddress = `${addressString}, ${city}, ${state} ${zipcode}`;

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('commercial-favorites') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter((fid: string) => fid !== property.zpid)
      : [...favorites, property.zpid];
    localStorage.setItem('commercial-favorites', JSON.stringify(newFavorites));
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

  const formatPrice = (price?: number, priceText?: string) => {
    if (priceText) return priceText;
    if (!price) return 'Contact for Price';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      
      {/* Navbar Spacer */}
      <div className="h-[60px] w-full"></div>

      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[60px] z-40">
        <div className="w-full px-3 md:px-6 lg:px-8 py-2 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-primary-black transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} className="md:w-5 md:h-5" />
              </motion.button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-xl font-bold text-primary-black truncate">Commercial Property</h1>
                <p className="text-gray-500 text-xs md:text-sm truncate">{addressString}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <span className="px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-orange-500 text-white">
                COMMERCIAL
              </span>
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full transition-all ${
                  isFavorite ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-3 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Image Gallery - Full Width at Top */}
        {images.length > 0 && (
          <div className="mb-4 md:mb-8">
            <div className="relative h-[250px] sm:h-[350px] md:h-[500px] rounded-xl overflow-hidden bg-gray-200 group">
              <Image
                src={images[currentImageIndex]}
                alt={addressString}
                fill
                className="object-cover cursor-pointer"
                priority
                unoptimized
                sizes="100vw"
                onClick={() => window.open(images[currentImageIndex], '_blank')}
              />
              
              {/* Share Button Overlay */}
              <div className="absolute top-4 right-4 z-10">
                <ShareButton
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                  title={fullAddress}
                  text={`Check out this commercial property: ${fullAddress}`}
                  variant="icon"
                  iconSize={20}
                />
              </div>
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full text-primary-black shadow-lg"
                  >
                    <ChevronLeft size={24} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full text-primary-black shadow-lg"
                  >
                    <ChevronRight size={24} />
                  </motion.button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 rounded-full text-primary-black text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg ${
                  property.status?.toLowerCase().includes('lease') 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {property.status || 'For Sale'}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.slice(0, 10).map((img, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-orange-500' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="80px"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Images Placeholder */}
        {images.length === 0 && (
          <div className="mb-4 md:mb-8 h-[200px] md:h-[300px] bg-gray-200 rounded-xl flex items-center justify-center">
            <Building2 size={60} className="text-gray-400" />
          </div>
        )}

        {/* Main Content with Sidebar Layout - Like jsondetailinfo */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SIDE - Main Content */}
          <div className="flex-1 min-w-0">
            {/* Price & Address Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-3xl font-bold text-primary-black">
                    {formatPrice(property.price, property.priceText)}
                  </div>
                  {property.status && (
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                      property.status.toLowerCase().includes('lease')
                        ? 'bg-blue-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      {property.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="text-orange-500 mt-1 flex-shrink-0" size={20} />
                <div>
                  <div className="text-lg text-primary-black font-medium">{addressString}</div>
                  <div className="text-gray-500">{city}, {state} {zipcode}</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                {property.livingArea && (
                  <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
                    <Square className="text-orange-500" size={18} />
                    <span className="text-primary-black font-medium">{property.livingArea.toLocaleString()} sqft</span>
                  </div>
                )}
                {property.bedrooms !== undefined && property.bedrooms > 0 && (
                  <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
                    <Layers className="text-orange-500" size={18} />
                    <span className="text-primary-black font-medium">{property.bedrooms} Rooms</span>
                  </div>
                )}
                {property.bathrooms !== undefined && property.bathrooms > 0 && (
                  <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
                    <DollarSign className="text-orange-500" size={18} />
                    <span className="text-primary-black font-medium">{property.bathrooms} Baths</span>
                  </div>
                )}
              </div>
            </div>

            {/* Property Type Tags */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-wrap gap-2">
                {property.propertyType && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 rounded-full text-sm font-medium text-orange-700">
                    <Building2 size={14} />
                    {property.propertyType}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                  <Tag size={14} />
                  Commercial
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 rounded-full text-sm font-medium text-orange-600">
                  <Building2 size={14} />
                  ID: {property.zpid}
                </span>
              </div>
            </div>

            {/* Key Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-primary-black mb-4 flex items-center gap-2">
                <Building2 className="text-orange-500" size={20} />
                Key Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium text-primary-black">{property.propertyType || 'Commercial'}</span>
                </div>
                {property.sizeText && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Building Size</span>
                    <span className="font-medium text-primary-black">{property.sizeText}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-primary-black">{property.status || 'Active'}</span>
                </div>
                {property.livingArea && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Total Area</span>
                    <span className="font-medium text-primary-black">{property.livingArea.toLocaleString()} sqft</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-lg font-semibold text-primary-black mb-4 flex items-center gap-2">
                  <Info className="text-orange-500" size={20} />
                  About This Property
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-lg font-semibold text-primary-black mb-4 flex items-center gap-2">
                <MapPin className="text-orange-500" size={20} />
                Location
              </h3>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <p className="text-gray-700 font-medium">{fullAddress}</p>
                {property.latitude && property.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                  >
                    <ExternalLink size={16} />
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Sticky Inquiry Form Sidebar */}
          <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0">
            <div className="lg:sticky lg:top-[140px]">
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
