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
  Phone,
  MessageCircle,
  MapPin,
  Check,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { getPropertyDetailById } from '@/lib/propertiesDetailData';
import { PropertyDetail } from '@/types/propertyDetail';
import { allProperties } from '@/data/sampleProperties';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set());
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      const propertyData = getPropertyDetailById(params.id);
      if (propertyData) {
        setProperty(propertyData);
        // Load favorite status from localStorage
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(params.id));
      }
    }
  }, [params.id]);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Link href="/" className="text-accent-yellow hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== property.id)
      : [...favorites, property.id];
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.imageGallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.imageGallery.length) % property.imageGallery.length);
  };

  const toggleSpaceExpansion = (spaceId: string) => {
    const newExpanded = new Set(expandedSpaces);
    if (newExpanded.has(spaceId)) {
      newExpanded.delete(spaceId);
    } else {
      newExpanded.add(spaceId);
    }
    setExpandedSpaces(newExpanded);
  };

  const formatPrice = (price: number) => {
    const rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79 };
    return (price * rates[currency]).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Breadcrumb */}
      <div className="bg-light-gray py-[0.4px] md:py-4 px-[0.5px] md:px-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-custom-gray">
            <Link href="/" className="hover:text-accent-yellow">Home</Link>
            <span>/</span>
            <span>{property.type}</span>
            <span>/</span>
            <span>{property.state}</span>
            <span>/</span>
            <span>{property.city}</span>
            <span>/</span>
            <span className="text-primary-black">{property.address}</span>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 py-[0.6px] md:py-6 px-[0.5px] md:px-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-primary-black mb-[0.2px] md:mb-2">
                {property.title}
              </h1>
              <p className="text-lg text-custom-gray">{property.subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-black/30 p-3 rounded">
                <Image
                  src={property.agent.companyLogo}
                  alt={property.agent.company}
                  width={120}
                  height={60}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Section */}
      <div className="relative w-full h-[400px] md:h-[600px] bg-black">
        {property.imageGallery.length > 0 && (
          <>
            <div className="relative w-full h-full">
              <Image
                src={property.imageGallery[currentImageIndex].url}
                alt={property.imageGallery[currentImageIndex].alt}
                fill
                className="object-cover"
                priority
              />
              
              {/* Navigation Arrows */}
              {property.imageGallery.length > 1 && (
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
                {currentImageIndex + 1} / {property.imageGallery.length}
              </div>

              {/* 3D Tour Button */}
              {property.has3DTour && (
                <div className="absolute top-4 right-4">
                  <a
                    href={property.tourUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-accent-yellow text-primary-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center gap-2"
                  >
                    <ExternalLink size={18} />
                    3D Tour
                  </a>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-[0.4px] md:p-4 overflow-x-auto">
              <div className="flex gap-2 max-w-7xl mx-auto">
                {property.imageGallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 rounded overflow-hidden flex-shrink-0 border-2 ${
                      index === currentImageIndex ? 'border-accent-yellow' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons Bar */}
      <div className="bg-white border-b border-gray-200 px-[0.5px] md:px-5 py-[0.4px] md:py-4">
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
            <button className="p-2 rounded-full bg-gray-100 text-primary-black hover:bg-gray-200 transition-colors">
              <GitCompare size={20} />
            </button>
            <button className="p-2 rounded-full bg-gray-100 text-primary-black hover:bg-gray-200 transition-colors">
              <Download size={20} />
            </button>
            <button className="p-2 rounded-full bg-gray-100 text-primary-black hover:bg-gray-200 transition-colors">
              <Printer size={20} />
            </button>
            <button className="p-2 rounded-full bg-gray-100 text-primary-black hover:bg-gray-200 transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-[0.5px] md:px-5 py-[0.8px] md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[0.8px] md:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-[0.8px] md:space-y-8">
            {/* Highlights Section */}
            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-[0.4px] md:mb-4">HIGHLIGHTS</h2>
              <ul className="space-y-3">
                {property.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red-600 mt-1">•</span>
                    <span className="text-custom-gray flex-1">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Available Spaces Table */}
            <section>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[0.4px] md:gap-4 mb-[0.4px] md:mb-4">
                <h2 className="text-2xl font-bold text-primary-black">
                  ALL AVAILABLE SPACES ({property.spaceAvailability.length})
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-custom-gray">Display Rental Rate as:</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'USD' | 'EUR' | 'GBP')}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="USD">$/Amt/MO (USD)</option>
                    <option value="EUR">€/Amt/MO (EUR)</option>
                    <option value="GBP">£/Amt/MO (GBP)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-light-gray">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">SPACE</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">NO. OF PEOPLE</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">SIZE</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">RENTAL RATE</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">SPACE USE</th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-primary-black"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.spaceAvailability.map((space, index) => {
                      const spaceId = `space-${index}`;
                      const isExpanded = expandedSpaces.has(spaceId);
                      const rateMatch = space.rentalRate.match(/\$?([\d.]+)/);
                      const baseRate = rateMatch ? parseFloat(rateMatch[1]) : 0;
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm">{space.space}</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">
                            {property.sizeRange ? `${Math.floor(property.sizeRange.min / 100)}-${Math.floor(property.sizeRange.max / 100)}` : 'N/A'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">{space.size}</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">
                            {currency === 'USD' ? space.rentalRate : `${formatPrice(baseRate)} ${currency}/SF/YR`}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">{property.type}</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <button
                              onClick={() => toggleSpaceExpansion(spaceId)}
                              className="text-accent-yellow hover:text-yellow-600"
                            >
                              {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* About the Property */}
            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-[0.4px] md:mb-4">ABOUT THE PROPERTY</h2>
              <div className="prose max-w-none">
                <p className="text-custom-gray leading-relaxed mb-[0.4px] md:mb-4">{property.description}</p>
                <p className="text-custom-gray leading-relaxed">
                  This exceptional property offers prime location benefits with excellent access to transportation, 
                  dining, and entertainment. The building features modern amenities and flexible lease terms to 
                  accommodate various business needs. Whether you&apos;re looking for office space, retail location, 
                  or industrial facilities, this property provides the perfect foundation for your business success.
                </p>
              </div>
            </section>

            {/* Features & Amenities */}
            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-[0.4px] md:mb-4">FEATURES AND AMENITIES</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-[0.4px] md:gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check size={18} className="text-accent-yellow flex-shrink-0" />
                    <span className="text-custom-gray text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Transportation Section */}
            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-[0.4px] md:mb-4">TRANSPORTATION</h2>
              
              <div className="space-y-[0.6px] md:space-y-6">
                {/* Transit/Subway */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-black mb-[0.3px] md:mb-3">TRANSIT/SUBWAY</h3>
                  <div className="space-y-[0.3px] md:space-y-3">
                    {property.transportation.transit.map((station, index) => (
                      <div key={index} className="flex items-center justify-between p-[0.3px] md:p-3 bg-light-gray rounded">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {station.lines.map((line, lineIndex) => (
                              <span
                                key={lineIndex}
                                className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded"
                              >
                                {line}
                              </span>
                            ))}
                          </div>
                          <span className="font-medium">{station.name}</span>
                        </div>
                        <div className="text-sm text-custom-gray">
                          {station.walkTime} • {station.distance}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commuter Rail */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-black mb-[0.3px] md:mb-3">COMMUTER RAIL</h3>
                  <div className="space-y-[0.3px] md:space-y-3">
                    {property.transportation.commuterRail.map((station, index) => (
                      <div key={index} className="flex items-center justify-between p-[0.3px] md:p-3 bg-light-gray rounded">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">Amtrak</span>
                          <span className="font-medium">{station.name}</span>
                        </div>
                        <div className="text-sm text-custom-gray">
                          {station.walkTime} • {station.distance}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Airport */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-black mb-[0.3px] md:mb-3">AIRPORT</h3>
                  <div className="flex items-center justify-between p-[0.3px] md:p-3 bg-light-gray rounded">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded">
                        {property.transportation.airport.name.split(' ')[0]}
                      </span>
                      <span className="font-medium">{property.transportation.airport.name}</span>
                    </div>
                    <div className="text-sm text-custom-gray">
                      {property.transportation.airport.driveTime} • {property.transportation.airport.distance}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Nearby Amenities */}
            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-[0.4px] md:mb-4">NEARBY AMENITIES</h2>
              <div>
                <h3 className="text-lg font-semibold text-primary-black mb-[0.3px] md:mb-3">RESTAURANTS</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-light-gray">
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">Name</th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">Cuisine</th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">Price</th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">Distance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {property.nearbyAmenities.restaurants.map((restaurant, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm">{restaurant.name}</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">{restaurant.cuisine}</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">{restaurant.priceRange}</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">{restaurant.distance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Location Section */}
            <section>
              <h2 className="text-2xl font-bold text-primary-black mb-[0.4px] md:mb-4">LINKS</h2>
              <div className="space-y-[0.4px] md:space-y-4">
                <div className="flex gap-2 border-b border-gray-300">
                  <button className="px-4 py-2 font-semibold text-primary-black border-b-2 border-accent-yellow">AERIAL</button>
                  <button className="px-4 py-2 font-semibold text-custom-gray hover:text-primary-black">MAP</button>
                  <button className="px-4 py-2 font-semibold text-custom-gray hover:text-primary-black">COMMUTE</button>
                </div>
                <div className="relative w-full h-96 bg-gray-200 rounded overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024!2d${property.location.lng}!3d${property.location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDQ0JzIxLjEiTiAxMDTCsDU5JzI1LjEiVw!5e0!3m2!1sen!2sus!4v1234567890`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <a
                  href={property.location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent-yellow hover:underline"
                >
                  <MapPin size={18} />
                  View on Google Maps
                </a>
              </div>
            </section>

            {/* About the Owner */}
            <section>
              <div className="flex items-center gap-[0.4px] md:gap-4 mb-[0.4px] md:mb-4">
                <div className="bg-black/30 p-[0.3px] md:p-3 rounded">
                  <Image
                    src={property.owner.logo}
                    alt={property.owner.name}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary-black">{property.owner.name}</h2>
                  <a
                    href={property.owner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-yellow hover:underline text-sm"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
              <p className="text-custom-gray mb-[0.6px] md:mb-6">{property.owner.description}</p>

              {property.relatedProperties.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-primary-black mb-[0.4px] md:mb-4">
                    OTHER PROPERTIES IN THE {property.owner.name.toUpperCase()} PORTFOLIO
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-[0.4px] md:gap-4">
                    {property.relatedProperties.map((relatedId) => {
                      const relatedProperty = allProperties.find(p => p.id === relatedId);
                      if (!relatedProperty) return null;
                      return (
                        <Link
                          key={relatedId}
                          href={`/property/${relatedId}`}
                          className="group"
                        >
                          <div className="relative h-48 rounded overflow-hidden mb-[0.2px] md:mb-2">
                            <Image
                              src={relatedProperty.imageUrl}
                              alt={relatedProperty.address}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <h4 className="font-semibold text-primary-black text-sm">{relatedProperty.address}</h4>
                          <p className="text-xs text-custom-gray">{relatedProperty.city}, {relatedProperty.state}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Metadata */}
            <section className="border-t border-gray-300 pt-[0.6px] md:pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[0.4px] md:gap-4 text-sm">
                <div>
                  <span className="text-custom-gray">Listing ID:</span>
                  <p className="font-semibold text-primary-black">{property.metadata.listingId}</p>
                </div>
                <div>
                  <span className="text-custom-gray">Date on Market:</span>
                  <p className="font-semibold text-primary-black">{property.metadata.dateOnMarket}</p>
                </div>
                <div>
                  <span className="text-custom-gray">Last Updated:</span>
                  <p className="font-semibold text-primary-black">{property.metadata.lastUpdated}</p>
                </div>
                <div>
                  <span className="text-custom-gray">Address:</span>
                  <p className="font-semibold text-primary-black">
                    {property.address}, {property.city}, {property.state} {property.zipCode}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Contact Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              <div className="bg-light-gray rounded-lg p-[0.6px] md:p-6 space-y-[0.6px] md:space-y-6">
                {/* Phone */}
                <div>
                  <a
                    href={`tel:${property.agent.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-[0.2px] md:gap-2 text-primary-black font-semibold text-lg hover:text-accent-yellow transition-colors"
                  >
                    <Phone size={20} />
                    {property.agent.phone}
                  </a>
                </div>

                {/* Message Button */}
                <button className="w-full bg-red-600 text-white py-[0.3px] md:py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  Message
                </button>

                {/* Contact Section */}
                <div className="border-t border-gray-300 pt-[0.6px] md:pt-6">
                  <h3 className="text-lg font-semibold text-primary-black mb-[0.4px] md:mb-4">CONTACT</h3>
                  <div className="flex items-center gap-[0.3px] md:gap-3 mb-[0.4px] md:mb-4">
                    <Image
                      src={property.agent.photo}
                      alt={property.agent.name}
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-primary-black">{property.agent.name}</p>
                      <p className="text-sm text-custom-gray">{property.agent.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-[0.4px] md:gap-4 mb-[0.4px] md:mb-4">
                    <div className="bg-black/30 p-[0.3px] md:p-3 rounded">
                      <Image
                        src={property.agent.companyLogo}
                        alt={property.agent.company}
                        width={100}
                        height={50}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-[0.4px] md:gap-4">
                    <button className="p-2 rounded-full bg-white hover:bg-gray-100 transition-colors">
                      <Share2 size={18} className="text-primary-black" />
                    </button>
                    <button
                      onClick={toggleFavorite}
                      className={`p-2 rounded-full transition-colors ${
                        isFavorite ? 'bg-accent-yellow text-primary-black' : 'bg-white hover:bg-gray-100 text-primary-black'
                      }`}
                    >
                      <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
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
