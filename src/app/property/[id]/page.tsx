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
  Check,
} from 'lucide-react';
import { getPropertyDetailById } from '@/lib/propertiesDetailData';
import { PropertyDetail } from '@/types/propertyDetail';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PropertyInquiryForm from '@/components/PropertyInquiryForm';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      loadProperty();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadProperty = async () => {
    if (!params.id || typeof params.id !== 'string') return;

    setLoading(true);
    
    // First try local data
    const propertyData = getPropertyDetailById(params.id);
    if (propertyData) {
      setProperty(propertyData);
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(params.id));
      setLoading(false);
      return;
    }

    // If not found in local data, try fetching from database
    try {
      const [byIdData, bySearchData] = await Promise.all([
        fetch(`/api/properties/${params.id}`).then(res => res.json()),
        fetch(`/api/properties?search=${encodeURIComponent(params.id)}&limit=1`).then(res => res.json())
      ]);

      let dbProperty = null;
      
      if (byIdData.success && byIdData.property) {
        dbProperty = byIdData.property;
      } else if (bySearchData.success && bySearchData.properties && bySearchData.properties.length > 0) {
        dbProperty = bySearchData.properties.find((p: any) => 
          p.id === params.id || p.zpid === params.id
        ) || bySearchData.properties[0];
      }
      
      if (dbProperty) {
        const convertedProperty: PropertyDetail = {
          id: dbProperty.id,
          address: dbProperty.address,
          city: dbProperty.city,
          state: dbProperty.state,
          zipCode: dbProperty.zip,
          price: dbProperty.price_text || `$${dbProperty.price?.toLocaleString() || 'N/A'}`,
          priceValue: dbProperty.price || 0,
          status: dbProperty.status,
          type: dbProperty.property_type,
          beds: dbProperty.beds || 0,
          baths: dbProperty.baths || 0,
          size: dbProperty.sqft ? `${dbProperty.sqft} SF` : (dbProperty.living_area ? `${dbProperty.living_area} SF` : 'N/A'),
          pricePerSF: dbProperty.price && dbProperty.sqft ? Math.round(dbProperty.price / dbProperty.sqft) : 0,
          lotSize: dbProperty.lot_size ? `${dbProperty.lot_size} SF` : undefined,
          yearBuilt: dbProperty.year_built,
          description: dbProperty.description || '',
          title: `${dbProperty.address} - ${dbProperty.city}`,
          subtitle: `${dbProperty.property_type} Available in ${dbProperty.city}, ${dbProperty.state}`,
          has3DTour: false,
          imageGallery: Array.isArray(dbProperty.images) 
            ? dbProperty.images.map((url: string, index: number) => ({
                url,
                alt: `${dbProperty.address} - Image ${index + 1}`,
                type: index === 0 ? 'exterior' as const : (index % 2 === 0 ? 'interior' as const : 'amenity' as const)
              }))
            : [],
          transportation: {
            transit: [],
            commuterRail: [],
            airport: { name: 'Local Airport', driveTime: 'N/A', distance: 'N/A' }
          },
          nearbyAmenities: { restaurants: [] },
          amenities: Array.isArray(dbProperty.features) ? dbProperty.features : [],
          owner: {
            name: dbProperty.contact_name || 'Property Owner',
            logo: '',
            description: 'Contact us for more information about this property.',
            website: '#'
          },
          relatedProperties: [],
          metadata: {
            listingId: dbProperty.zpid || dbProperty.id,
            dateOnMarket: new Date(dbProperty.created_at || Date.now()).toLocaleDateString(),
            lastUpdated: new Date(dbProperty.updated_at || Date.now()).toLocaleDateString()
          },
          location: dbProperty.latitude && dbProperty.longitude ? {
            lat: dbProperty.latitude,
            lng: dbProperty.longitude,
            mapUrl: `https://www.google.com/maps?q=${dbProperty.latitude},${dbProperty.longitude}`
          } : {
            lat: 39.7392,
            lng: -104.9903,
            mapUrl: 'https://www.google.com/maps?q=39.7392,-104.9903'
          },
          imageUrl: Array.isArray(dbProperty.images) && dbProperty.images.length > 0 ? dbProperty.images[0] : '',
          images: Array.isArray(dbProperty.images) ? dbProperty.images : [],
          highlights: Array.isArray(dbProperty.features) ? dbProperty.features : [],
          spaceAvailability: [],
          agent: {
            id: dbProperty.id || 'agent-1',
            name: dbProperty.contact_name || 'Agent',
            photo: '',
            email: dbProperty.contact_email || '',
            phone: dbProperty.contact_phone || '',
            company: 'Real Estate Company',
            companyLogo: ''
          },
          coordinates: dbProperty.latitude && dbProperty.longitude ? {
            lat: dbProperty.latitude,
            lng: dbProperty.longitude
          } : undefined
        };
        setProperty(convertedProperty);
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(params.id) || favorites.includes(dbProperty.zpid));
      }
    } catch (err) {
      console.error('Error fetching property from database:', err);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="h-[60px]"></div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-yellow"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <Link href="/" className="text-accent-yellow hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = property.imageGallery.map(img => img.url);
  const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`;

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== property.id)
      : [...favorites, property.id];
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
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

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
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
                alt={property.address}
                fill
                className="object-cover"
                priority
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

              {/* 3D Tour Button */}
              {property.has3DTour && (
                <div className="absolute top-4 left-4">
                  <a
                    href={property.tourUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-accent-yellow text-primary-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                  >
                    3D Tour
                  </a>
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
                {property.title}
              </h1>
              <p className="text-lg text-gray-600 flex items-center gap-2">
                <MapPin size={18} className="text-accent-yellow" />
                {property.city}, {property.state} {property.zipCode}
              </p>
            </div>

            {/* Price */}
            <div className="border-b border-gray-200 pb-6">
              <p className="text-3xl lg:text-4xl font-bold text-accent-yellow">
                {property.price}
              </p>
              {property.pricePerSF && (
                <p className="text-sm text-gray-500 mt-1">
                  ${property.pricePerSF.toFixed(2)} / Sq Ft
                </p>
              )}
              {property.status && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  {property.status}
                </span>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-gray-200 pb-6">
              {property.beds !== undefined && property.beds > 0 && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Bed size={24} className="mx-auto text-accent-yellow mb-1" />
                  <p className="text-xl font-bold text-gray-900">{property.beds}</p>
                  <p className="text-xs text-gray-500">Beds</p>
                </div>
              )}
              {property.baths !== undefined && property.baths > 0 && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Bath size={24} className="mx-auto text-accent-yellow mb-1" />
                  <p className="text-xl font-bold text-gray-900">{property.baths}</p>
                  <p className="text-xs text-gray-500">Baths</p>
                </div>
              )}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Square size={24} className="mx-auto text-accent-yellow mb-1" />
                <p className="text-xl font-bold text-gray-900">{property.size}</p>
                <p className="text-xs text-gray-500">Size</p>
              </div>
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
              {property.type && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                  <Building2 size={14} />
                  {property.type}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent-yellow/20 rounded-full text-sm font-medium text-accent-yellow">
                <Tag size={14} />
                ID: {property.id}
              </span>
            </div>

            {/* Highlights */}
            {property.highlights && property.highlights.length > 0 && (
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Highlights</h2>
                <ul className="space-y-2">
                  {property.highlights.slice(0, 6).map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <Check size={16} className="text-green-500 mt-1 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Details */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Key Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium text-gray-900">{property.type}</span>
                </div>
                {property.lotSize && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lot Size</span>
                    <span className="font-medium text-gray-900">{property.lotSize}</span>
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

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-2 gap-2">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={14} className="text-accent-yellow" />
                      {amenity}
                    </div>
                  ))}
                </div>
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
                {property.location && (
                  <a
                    href={property.location.mapUrl}
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
                propertyId={property.id}
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
