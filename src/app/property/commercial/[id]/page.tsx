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
  Download,
  Printer,
  GitCompare,
  MapPin,
  ArrowLeft,
  Square,
  Building2,
  Copy,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { getCommercialDetails, getCommercialImages, CommercialProperty, getAddressString, getCity, getState, getZipcode } from '@/lib/us-real-estate-api';
import Nav from '@/components/Navigation';
import Footer from '@/components/Footer';
import PropertyDetailSkeleton from '@/components/PropertyDetailSkeleton';


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
      // Fetch property details from JSON dataset
      const details = await getCommercialDetails(params.id);
      
      if (!details) {
        throw new Error('Property not found');
      }
      
      // Try to fetch images separately
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
      
      // Load favorite status
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

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('commercial-favorites') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== property.zpid)
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

  const copyPropertyId = () => {
    navigator.clipboard.writeText(property.zpid);
    alert('Property ID copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      {/* Navbar Spacer - Prevents content overlap */}
      <div className="h-[50px] w-full"></div>
      
      {/* Breadcrumb - Mobile First */}
      <div className="bg-orange-50 py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs md:text-sm text-custom-gray flex-wrap">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span>/</span>
            <span className="text-primary-black truncate">{addressString}</span>
          </div>
        </div>
      </div>

      {/* Header Section - Mobile First */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 md:py-6 md:px-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-primary-black mb-1 md:mb-2">
                {addressString}
              </h1>
              <p className="text-sm md:text-lg text-custom-gray">
                {city}, {state} {zipcode}
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={toggleFavorite}
                className={`px-3 md:px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm md:text-base ${
                  isFavorite
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Heart size={16} className="md:w-[18px] md:h-[18px]" fill={isFavorite ? 'currentColor' : 'none'} />
                <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: addressString,
                      text: `${formatPrice(property.price, property.priceText)} - ${city}, ${state}`,
                      url: window.location.href,
                    }).catch(() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 text-sm md:text-base"
              >
                <Share2 size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Section - Mobile First */}
      {images.length > 0 && (
        <div className="relative w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[600px] bg-black">
          <div className="relative w-full h-full">
            <Image
              src={images[currentImageIndex]}
              alt={addressString}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 md:p-2 z-10"
                >
                  <ChevronLeft size={20} className="md:w-6 md:h-6 text-primary-black" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 md:p-2 z-10"
                >
                  <ChevronRight size={20} className="md:w-6 md:h-6 text-primary-black" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnail Navigation - Mobile First */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 md:p-4 overflow-x-auto">
              <div className="flex gap-1 md:gap-2 max-w-7xl mx-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-12 h-12 md:w-20 md:h-20 rounded overflow-hidden flex-shrink-0 border-2 ${
                      index === currentImageIndex ? 'border-orange-600' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${addressString} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header Stats Bar - Mobile First */}
      <div className="bg-orange-50 border-b border-orange-200 px-4 md:px-5 py-4 md:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange-900">
                  {formatPrice(property.price, property.priceText)}
                </p>
                {property.status && (
                  <p className="text-xs md:text-sm text-orange-700 mt-1">
                    Status: {property.status}
                  </p>
                )}
              </div>
              {property.livingArea && (
                <div>
                  <p className="text-base md:text-lg font-semibold text-orange-900">
                    {property.livingArea.toLocaleString()} sqft
                  </p>
                  <p className="text-xs md:text-sm text-orange-700">Size</p>
                </div>
              )}
              {property.propertyType && (
                <div>
                  <p className="text-base md:text-lg font-semibold text-orange-900">
                    {property.propertyType}
                  </p>
                  <p className="text-xs md:text-sm text-orange-700">Type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar - Mobile First */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-5 py-3 md:py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                isFavorite ? 'bg-orange-600 text-white' : 'bg-gray-100 text-primary-black hover:bg-gray-200'
              }`}
            >
              <Heart size={18} className="md:w-5 md:h-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => {
                const comparisons = JSON.parse(localStorage.getItem('commercial-comparisons') || '[]');
                if (!comparisons.includes(property.zpid)) {
                  comparisons.push(property.zpid);
                  localStorage.setItem('commercial-comparisons', JSON.stringify(comparisons));
                  alert('Property added to comparison!');
                } else {
                  alert('Property already in comparison!');
                }
              }}
              className="p-2 rounded-full bg-gray-100 text-primary-black hover:bg-gray-200 transition-colors flex-shrink-0"
              title="Compare Properties"
            >
              <GitCompare size={18} className="md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => {
                const propertyText = `Commercial Property Details\n================\n${addressString}\n${city}, ${state} ${zipcode}\n\nPrice: ${formatPrice(property.price, property.priceText)}\nSize: ${property.livingArea ? property.livingArea.toLocaleString() + ' sqft' : 'N/A'}\nProperty Type: ${property.propertyType || 'N/A'}\nStatus: ${property.status || 'N/A'}\n\n${property.description || 'No description available'}`.trim();
                const blob = new Blob([propertyText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${addressString.replace(/\s+/g, '_')}_details.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="p-2 rounded-full bg-gray-100 text-primary-black hover:bg-gray-200 transition-colors flex-shrink-0"
              title="Download Details"
            >
              <Download size={18} className="md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 rounded-full bg-gray-100 text-primary-black hover:bg-gray-200 transition-colors flex-shrink-0"
              title="Print"
            >
              <Printer size={18} className="md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: addressString,
                    text: `${formatPrice(property.price, property.priceText)} - ${city}, ${state}`,
                    url: window.location.href,
                  }).catch(() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="p-2 rounded-full bg-gray-100 text-primary-black hover:bg-gray-200 transition-colors flex-shrink-0"
              title="Share"
            >
              <Share2 size={18} className="md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="max-w-7xl mx-auto px-4 md:px-5 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Property Details - Mobile First */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-3 md:mb-4">PROPERTY DETAILS</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {property.livingArea && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Square size={18} className="md:w-5 md:h-5 text-orange-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs md:text-sm text-orange-700">Size</div>
                      <div className="font-semibold text-sm md:text-base text-orange-900">
                        {property.livingArea.toLocaleString()} sqft
                      </div>
                    </div>
                  </div>
                )}
                {property.sizeText && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Square size={18} className="md:w-5 md:h-5 text-orange-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs md:text-sm text-orange-700">Building Size</div>
                      <div className="font-semibold text-sm md:text-base text-orange-900">{property.sizeText}</div>
                    </div>
                  </div>
                )}
                {property.propertyType && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Building2 size={18} className="md:w-5 md:h-5 text-orange-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs md:text-sm text-orange-700">Property Type</div>
                      <div className="font-semibold text-sm md:text-base text-orange-900">{property.propertyType}</div>
                    </div>
                  </div>
                )}
                {property.status && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <div className="text-xs md:text-sm text-orange-700">Status</div>
                      <div className="font-semibold text-sm md:text-base text-orange-900">{property.status}</div>
                    </div>
                  </div>
                )}
                {property.bedrooms !== undefined && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <div className="text-xs md:text-sm text-orange-700">Bedrooms</div>
                      <div className="font-semibold text-sm md:text-base text-orange-900">{property.bedrooms}</div>
                    </div>
                  </div>
                )}
                {property.bathrooms !== undefined && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <div className="text-xs md:text-sm text-orange-700">Bathrooms</div>
                      <div className="font-semibold text-sm md:text-base text-orange-900">{property.bathrooms}</div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Description */}
            {property.description && (
              <section>
                <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-3 md:mb-4">ABOUT THIS PROPERTY</h2>
                <p className="text-sm md:text-base text-custom-gray leading-relaxed">{property.description}</p>
              </section>
            )}

            {/* Location - Mobile First */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-primary-black mb-3 md:mb-4">LOCATION</h2>
              <div className="p-4 bg-light-gray rounded-lg mb-4">
                <p className="text-custom-gray flex items-center gap-2">
                  <MapPin size={16} />
                  {addressString}
                </p>
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar - Mobile First */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4 space-y-4 md:space-y-6">
              {/* Property Info Box */}
              <div className="bg-orange-50 rounded-lg p-4 md:p-6 space-y-3 md:space-y-4 border border-orange-200">
                <h3 className="text-base md:text-lg font-semibold text-orange-900 mb-3 md:mb-4">PROPERTY INFORMATION</h3>
                <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span className="text-orange-700">Property ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-orange-900 text-xs">{property.zpid}</span>
                      <button
                        onClick={copyPropertyId}
                        className="text-orange-600 hover:text-orange-700"
                        title="Copy Property ID"
                      >
                        <Copy size={12} className="md:w-3.5 md:h-3.5" />
                      </button>
                    </div>
                  </div>
                  {property.status && (
                    <div className="flex justify-between">
                      <span className="text-orange-700">Status:</span>
                      <span className="font-semibold text-orange-900">{property.status}</span>
                    </div>
                  )}
                  {property.propertyType && (
                    <div className="flex justify-between">
                      <span className="text-orange-700">Type:</span>
                      <span className="font-semibold text-orange-900">{property.propertyType}</span>
                    </div>
                  )}
                  {property.listingUrl && (
                    <div className="pt-2">
                      <a
                        href={property.listingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm"
                      >
                        <ExternalLink size={14} />
                        View Original Listing
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Leo Jo */}
              <div className="bg-orange-50 rounded-lg p-4 md:p-6 space-y-3 md:space-y-4 border border-orange-200">
                <h3 className="text-base md:text-lg font-semibold text-orange-900 mb-3 md:mb-4">CONTACT</h3>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <div className="text-sm md:text-base font-bold text-orange-900 mb-2">Leo Jo</div>
                    <a
                      href="mailto:leojoemail@gmail.com"
                      className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors text-sm md:text-base break-all"
                    >
                      <Mail size={18} className="md:w-5 md:h-5 flex-shrink-0" />
                      <span>leojoemail@gmail.com</span>
                    </a>
                  </div>
                  <a
                    href="mailto:leojoemail@gmail.com"
                    className="w-full bg-orange-600 text-white px-4 md:px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"

                  >
                    <Mail size={18} className="md:w-5 md:h-5" />
                    Contact Leo Jo
                  </a>
                </div>
              </div>

              {/* Back to Home */}
              <button
                onClick={() => router.push('/')}
                className="w-full border-2 border-orange-600 text-orange-600 px-4 md:px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <ArrowLeft size={18} className="md:w-5 md:h-5" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}



