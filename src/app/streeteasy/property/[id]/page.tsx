'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, Bed, Bath, Home, Calendar, DollarSign, MapPin, 
  Building2, Loader2, ChevronLeft, ChevronRight, Check, X,
  Phone, Mail, User, TrendingUp
} from 'lucide-react';

interface PropertyDetails {
  id: string;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: string;
  images: string[];
  status: string;
  description?: string;
  amenities?: string[];
  agent?: {
    name: string;
    phone: string;
    email: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  yearBuilt?: number;
  daysOnMarket?: number;
  monthlyHOA?: number;
  monthlyTax?: number;
  lotSize?: number;
  parking?: string;
  heating?: string;
  cooling?: string;
  floors?: number;
  unitCount?: number;
  petPolicy?: string;
  laundry?: string;
  neighborhood?: string;
  pricePerSqft?: number;
  lastSalePrice?: number;
  lastSaleDate?: string;
}

const API_CONFIG = {
  baseURL: 'https://streeteasy-api.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': '5037acc84cmshe961f4b77fc7a19p1f9f6djsn90114065adc7',
    'x-rapidapi-host': 'streeteasy-api.p.rapidapi.com'
  }
};

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;
  
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [isSale, setIsSale] = useState(true);

  const fetchPropertyDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try sales endpoint first
      let response = await fetch(`${API_CONFIG.baseURL}/sales/${propertyId}`, {
        headers: API_CONFIG.headers
      });

      if (!response.ok) {
        // If sales fails, try rentals
        response = await fetch(`${API_CONFIG.baseURL}/rentals/${propertyId}`, {
          headers: API_CONFIG.headers
        });
        setIsSale(false);
      }

      if (!response.ok) {
        throw new Error('Property not found');
      }

      const data = await response.json();
      
      const propertyDetails: PropertyDetails = {
        id: data.id || propertyId,
        price: data.price || 0,
        address: data.address || 'Address not available',
        bedrooms: data.bedrooms || data.beds || 0,
        bathrooms: data.bathrooms || data.baths || 0,
        sqft: data.sqft || data.squareFeet || 0,
        propertyType: data.propertyType || data.type || 'N/A',
        images: data.images || [],
        status: data.status || 'Available',
        description: data.description || data.desc,
        amenities: data.amenities || [],
        agent: data.agent || data.listingAgent,
        coordinates: data.coordinates || data.location,
        yearBuilt: data.yearBuilt || data.built,
        daysOnMarket: data.daysOnMarket || data.dom,
        monthlyHOA: data.monthlyHOA || data.hoa,
        monthlyTax: data.monthlyTax || data.taxes,
        lotSize: data.lotSize,
        parking: data.parking,
        heating: data.heating,
        cooling: data.cooling,
        floors: data.floors,
        unitCount: data.unitCount || data.units,
        petPolicy: data.petPolicy || data.pets,
        laundry: data.laundry,
        neighborhood: data.neighborhood || data.area,
        pricePerSqft: data.pricePerSqft || (data.price && data.sqft ? data.price / data.sqft : undefined),
        lastSalePrice: data.lastSalePrice,
        lastSaleDate: data.lastSaleDate
      };

      setProperty(propertyDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchPropertyDetails();
  }, [fetchPropertyDetails]);

  const nextImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
      setImageLoading(true);
    }
  };

  const prevImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
      setImageLoading(true);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <Link
            href="/streeteasy"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const hasImages = property.images && property.images.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/streeteasy"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative h-96 md:h-[600px] bg-gray-200">
            {hasImages ? (
              <>
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                  </div>
                )}
                <Image
                  src={property.images[currentImageIndex]}
                  alt={`${property.address} - Image ${currentImageIndex + 1}`}
                  fill
                  className={`object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
                
                {/* Navigation Arrows */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                <Building2 className="w-24 h-24 text-gray-500" />
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-green-500 text-white px-4 py-2 rounded-lg text-lg font-semibold shadow-lg">
                {property.status}
              </span>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {hasImages && property.images.length > 1 && (
            <div className="p-4 flex gap-2 overflow-x-auto">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setImageLoading(true);
                  }}
                  className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? 'border-blue-600' : 'border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Overview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(property.price)}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <p className="text-lg">{property.address}</p>
                  </div>
                  {property.neighborhood && (
                    <p className="text-gray-500 mt-1">{property.neighborhood}</p>
                  )}
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b">
                <div className="text-center">
                  <Bed className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                </div>
                <div className="text-center">
                  <Bath className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                </div>
                <div className="text-center">
                  <Home className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {property.sqft > 0 ? property.sqft.toLocaleString() : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">Sq Ft</p>
                </div>
                <div className="text-center">
                  <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{property.propertyType}</p>
                  <p className="text-sm text-gray-600">Type</p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {property.pricePerSqft && (
                  <div>
                    <p className="text-sm text-gray-600">Price per Sq Ft</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${property.pricePerSqft.toFixed(0)}
                    </p>
                  </div>
                )}
                {property.yearBuilt && (
                  <div>
                    <p className="text-sm text-gray-600">Year Built</p>
                    <p className="text-lg font-semibold text-gray-900">{property.yearBuilt}</p>
                  </div>
                )}
                {property.daysOnMarket !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">Days on Market</p>
                    <p className="text-lg font-semibold text-gray-900">{property.daysOnMarket}</p>
                  </div>
                )}
                {property.monthlyHOA && (
                  <div>
                    <p className="text-sm text-gray-600">Monthly HOA</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(property.monthlyHOA)}
                    </p>
                  </div>
                )}
                {property.monthlyTax && (
                  <div>
                    <p className="text-sm text-gray-600">Monthly Tax</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(property.monthlyTax)}
                    </p>
                  </div>
                )}
                {property.lotSize && (
                  <div>
                    <p className="text-sm text-gray-600">Lot Size</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {property.lotSize.toLocaleString()} sq ft
                    </p>
                  </div>
                )}
                {property.floors && (
                  <div>
                    <p className="text-sm text-gray-600">Floors</p>
                    <p className="text-lg font-semibold text-gray-900">{property.floors}</p>
                  </div>
                )}
                {property.parking && (
                  <div>
                    <p className="text-sm text-gray-600">Parking</p>
                    <p className="text-lg font-semibold text-gray-900">{property.parking}</p>
                  </div>
                )}
                {property.petPolicy && (
                  <div>
                    <p className="text-sm text-gray-600">Pet Policy</p>
                    <p className="text-lg font-semibold text-gray-900">{property.petPolicy}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Features */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.heating && (
                  <div>
                    <p className="text-sm text-gray-600">Heating</p>
                    <p className="text-lg font-semibold text-gray-900">{property.heating}</p>
                  </div>
                )}
                {property.cooling && (
                  <div>
                    <p className="text-sm text-gray-600">Cooling</p>
                    <p className="text-lg font-semibold text-gray-900">{property.cooling}</p>
                  </div>
                )}
                {property.laundry && (
                  <div>
                    <p className="text-sm text-gray-600">Laundry</p>
                    <p className="text-lg font-semibold text-gray-900">{property.laundry}</p>
                  </div>
                )}
                {property.unitCount && (
                  <div>
                    <p className="text-sm text-gray-600">Units in Building</p>
                    <p className="text-lg font-semibold text-gray-900">{property.unitCount}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sale History */}
            {property.lastSalePrice && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Sale History</h2>
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Last Sale Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(property.lastSalePrice)}
                    </p>
                    {property.lastSaleDate && (
                      <p className="text-sm text-gray-600 mt-1">{property.lastSaleDate}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            {property.coordinates && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-600">
                      Coordinates: {property.coordinates.lat.toFixed(6)}, {property.coordinates.lng.toFixed(6)}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Agent Contact */}
            {property.agent && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Agent</h3>
                
                <div className="space-y-4">
                  {property.agent.name && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Agent</p>
                        <p className="font-semibold text-gray-900">{property.agent.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {property.agent.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a
                          href={`tel:${property.agent.phone}`}
                          className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                          {property.agent.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {property.agent.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a
                          href={`mailto:${property.agent.email}`}
                          className="font-semibold text-blue-600 hover:text-blue-700 break-all"
                        >
                          {property.agent.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Request Information
                </button>
                <button className="w-full mt-3 bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Schedule Viewing
                </button>
              </div>
            )}

            {/* Quick Summary */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Property Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property ID</span>
                  <span className="font-semibold text-gray-900">{property.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-semibold text-green-600">{property.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold text-gray-900">{property.propertyType}</span>
                </div>
                {property.yearBuilt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Built</span>
                    <span className="font-semibold text-gray-900">{property.yearBuilt}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



