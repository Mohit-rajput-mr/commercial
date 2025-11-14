'use client';

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
} from 'lucide-react';
import { getPropertyDetails, getPropertyImages, PropertyDetailsResponse, getAddressString, getCity, getState, getZipcode } from '@/lib/zillow-test-api';
import Nav from '@/components/Navigation';
import Footer from '@/components/Footer';
import PropertyMap from '@/components/PropertyMap';

export default function ZillowPropertyDetailPage() {
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
      const favorites = JSON.parse(localStorage.getItem('zillow-favorites') || '[]');
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-yellow mb-4"></div>
            <p className="text-lg text-custom-gray">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-white">
        <Nav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <p className="text-custom-gray mb-4">{error || 'Property could not be loaded'}</p>
            <Link href="/api-test" className="text-accent-yellow hover:underline">
              Return to API Test
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
    const favorites = JSON.parse(localStorage.getItem('zillow-favorites') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== property.zpid)
      : [...favorites, property.zpid];
    localStorage.setItem('zillow-favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for Price';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const copyZpid = () => {
    navigator.clipboard.writeText(property.zpid);
    alert('ZPID copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      {/* Breadcrumb */}
      <div className="bg-light-gray py-4 px-5 pt-[40px] md:pt-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-custom-gray">
            <Link href="/" className="hover:text-accent-yellow">Home</Link>
            <span>/</span>
            <Link href="/api-test" className="hover:text-accent-yellow">API Test</Link>
            <span>/</span>
            <span className="text-primary-black">{addressString}</span>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 py-6 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-2">
                {addressString}
              </h1>
              <p className="text-lg text-custom-gray">
                {city}, {state} {zipcode}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFavorite}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                  isFavorite
                    ? 'bg-accent-yellow text-primary-black hover:bg-yellow-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: addressString,
                      text: `${formatPrice(property.price)} - ${city}, ${state}`,
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Section */}
      {images.length > 0 && (
        <div className="relative w-full h-[400px] md:h-[600px] bg-black">
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
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 overflow-x-auto">
              <div className="flex gap-2 max-w-7xl mx-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 rounded overflow-hidden flex-shrink-0 border-2 ${
                      index === currentImageIndex ? 'border-accent-yellow' : 'border-transparent'
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

      {/* Header Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-5 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary-black">
                  {formatPrice(property.price)}
                </p>
                {property.zestimate && (
                  <p className="text-sm text-custom-gray">
                    Zestimate: {formatPrice(property.zestimate)}
                  </p>
                )}
              </div>
              {property.bedrooms !== undefined && (
                <div>
                  <p className="text-lg font-semibold text-primary-black">{property.bedrooms}</p>
                  <p className="text-sm text-custom-gray">Beds</p>
                </div>
              )}
              {property.bathrooms !== undefined && (
                <div>
                  <p className="text-lg font-semibold text-primary-black">{property.bathrooms}</p>
                  <p className="text-sm text-custom-gray">Baths</p>
                </div>
              )}
              {property.livingArea && (
                <div>
                  <p className="text-lg font-semibold text-primary-black">
                    {property.livingArea.toLocaleString()} sqft
                  </p>
                  <p className="text-sm text-custom-gray">Size</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-colors ${
                isFavorite ? 'bg-accent-yellow text-primary-black' : 'bg-gray-100 text-primary-black hover:bg-gray-200'
              }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => {
                const comparisons = JSON.parse(localStorage.getItem('zillow-comparisons') || '[]');
                if (!comparisons.includes(property.zpid)) {
                  comparisons.push(property.zpid);
                  localStorage.setItem('zillow-comparisons', JSON.stringify(comparisons));
                  alert('Property added to comparison!');
                } else {
                  alert('Property already in comparison!');
                }
              }}
              className="p-2 rounded-full bg-gray-100 text-primary-black hover:bg-gray-200 transition-colors"
              title="Compare Properties"
            >
              <GitCompare size={20} />
            </button>
            <button
              onClick={() => {
                const propertyText = `Property Details\n================\n${addressString}\n${city}, ${state} ${zipcode}\n\nPrice: ${formatPrice(property.price)}\nBedrooms: ${property.bedrooms || 'N/A'}\nBathrooms: ${property.bathrooms || 'N/A'}\nLiving Area: ${property.livingArea ? property.livingArea.toLocaleString() + ' sqft' : 'N/A'}\nYear Built: ${property.yearBuilt || 'N/A'}\n\n${property.description || 'No description available'}`.trim();
                const blob = new Blob([propertyText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${addressString.replace(/\s+/g, '_')}_details.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="p-2 rounded-full bg-gray-100 text-primary-black hover:bg-gray-200 transition-colors"
              title="Download Details"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 rounded-full bg-gray-100 text-primary-black hover:bg-gray-200 transition-colors"
              title="Print"
            >
              <Printer size={20} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: addressString,
                    text: `${formatPrice(property.price)} - ${city}, ${state}`,
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
              className="p-2 rounded-full bg-gray-100 text-primary-black hover:bg-gray-200 transition-colors"
              title="Share"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Details */}
            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-4">PROPERTY DETAILS</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            </section>

            {/* Description */}
            {property.description && (
              <section>
                <h2 className="text-2xl font-bold text-primary-black mb-4">ABOUT THIS PROPERTY</h2>
                <p className="text-custom-gray leading-relaxed">{property.description}</p>
              </section>
            )}

            {/* Location & Map */}
            {(property.latitude && property.longitude) && (
              <section>
                <h2 className="text-2xl font-bold text-primary-black mb-4">LOCATION</h2>
                <div className="relative w-full h-96 bg-gray-200 rounded overflow-hidden mb-4">
                  <PropertyMap
                    address={addressString}
                    city={city}
                    state={state}
                    zipCode={zipcode}
                    coordinates={{ lat: property.latitude, lng: property.longitude }}
                    height="100%"
                    showControls={true}
                  />
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4 space-y-6">
              {/* Property Info Box */}
              <div className="bg-light-gray rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-primary-black mb-4">PROPERTY INFORMATION</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-custom-gray">ZPID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-primary-black">{property.zpid}</span>
                      <button
                        onClick={copyZpid}
                        className="text-accent-yellow hover:text-yellow-600"
                        title="Copy ZPID"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  {property.status && (
                    <div className="flex justify-between">
                      <span className="text-custom-gray">Status:</span>
                      <span className="font-semibold text-primary-black">{property.status}</span>
                    </div>
                  )}
                  {property.zestimate && (
                    <div className="flex justify-between">
                      <span className="text-custom-gray">Zestimate:</span>
                      <span className="font-semibold text-primary-black">{formatPrice(property.zestimate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent/Broker Info */}
              {(property.agentName || property.brokerName) && (
                <div className="bg-light-gray rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-primary-black mb-4">CONTACT INFORMATION</h3>
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

              {/* View on Zillow Button */}
              <a
                href={`https://www.zillow.com/homedetails/${property.zpid}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-accent-yellow text-primary-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink size={20} />
                View on Zillow
              </a>

              {/* Back to API Test */}
              <button
                onClick={() => router.push('/api-test')}
                className="w-full border-2 border-primary-black text-primary-black px-6 py-3 rounded-lg font-semibold hover:bg-primary-black hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} />
                Back to API Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

