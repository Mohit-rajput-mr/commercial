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
import PropertyMap from '@/components/PropertyMap';
import { getWeatherData, WeatherData } from '@/lib/weatherApi';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set());
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [activeTab, setActiveTab] = useState<'overview' | 'location' | 'property-info' | 'schools' | 'similar-homes'>('overview');
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(6.5);
  const [downPayment, setDownPayment] = useState(20);
  const [loanTerm, setLoanTerm] = useState(30);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: 'I am interested in this property. Please contact me.', financing: false });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mapView, setMapView] = useState<'aerial' | 'map' | 'commute'>('aerial');

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      // First try local data
      const propertyData = getPropertyDetailById(params.id);
      if (propertyData) {
        setProperty(propertyData);
        // Load favorite status from localStorage
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(params.id));
        // Initialize loan amount
        if (propertyData.priceValue) {
          setLoanAmount(propertyData.priceValue);
        }
        // Fetch weather data
        if (propertyData.location) {
          const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
          getWeatherData(propertyData.location.lat, propertyData.location.lng, apiKey)
            .then(setWeather)
            .catch(() => setWeather(null));
        }
      } else {
        // If not found in local data, try fetching from database
        // Try both UUID and zpid
        Promise.all([
          fetch(`/api/properties/${params.id}`).then(res => res.json()),
          fetch(`/api/properties?search=${encodeURIComponent(params.id)}&limit=1`).then(res => res.json())
        ])
          .then(([byIdData, bySearchData]) => {
            let dbProperty = null;
            
            // Try by ID first
            if (byIdData.success && byIdData.property) {
              dbProperty = byIdData.property;
            }
            // Try by search (zpid or address)
            else if (bySearchData.success && bySearchData.properties && bySearchData.properties.length > 0) {
              // Find exact match by zpid or id
              dbProperty = bySearchData.properties.find((p: any) => 
                p.id === params.id || p.zpid === params.id
              ) || bySearchData.properties[0];
            }
            
            if (dbProperty) {
              // Convert database property to PropertyDetail format
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
              // Load favorite status
              const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
              setIsFavorite(favorites.includes(params.id) || favorites.includes(dbProperty.zpid));
              // Initialize loan amount
              if (convertedProperty.priceValue) {
                setLoanAmount(convertedProperty.priceValue);
              }
              // Fetch weather data
              if (convertedProperty.location) {
                const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
                getWeatherData(convertedProperty.location.lat, convertedProperty.location.lng, apiKey)
                  .then(setWeather)
                  .catch(() => setWeather(null));
              }
            }
          })
          .catch(err => {
            console.error('Error fetching property from database:', err);
          });
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
      
      {/* Navbar Spacer - Prevents content overlap */}
      <div className="h-[50px] w-full"></div>
      
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

      {/* Header Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-[0.5px] md:px-5 py-[0.6px] md:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary-black">
                  ${property.priceValue ? property.priceValue.toLocaleString() : 'Contact for Price'}
                </p>
                {property.pricePerSF && (
                  <p className="text-sm text-custom-gray">${property.pricePerSF.toFixed(2)} / Sq. Ft.</p>
                )}
              </div>
              {property.beds !== undefined && property.beds > 0 && (
                <div>
                  <p className="text-lg font-semibold text-primary-black">{property.beds}</p>
                  <p className="text-sm text-custom-gray">Beds</p>
                </div>
              )}
              {property.baths !== undefined && property.baths > 0 && (
                <div>
                  <p className="text-lg font-semibold text-primary-black">{property.baths}</p>
                  <p className="text-sm text-custom-gray">Baths</p>
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-primary-black">{property.size}</p>
                <p className="text-sm text-custom-gray">Size</p>
              </div>
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
                      title: property.title,
                      text: property.subtitle,
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
            <button
              onClick={() => {
                const comparisons = JSON.parse(localStorage.getItem('comparisons') || '[]');
                if (!comparisons.includes(property.id)) {
                  comparisons.push(property.id);
                  localStorage.setItem('comparisons', JSON.stringify(comparisons));
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
                const propertyText = `Property Details\n================\n${property.title}\n${property.subtitle}\n\nAddress: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}\nPrice: ${property.priceValue ? `$${property.priceValue.toLocaleString()}` : 'Contact for Price'}\nSize: ${property.size}\nType: ${property.type}\n\n${property.description}`.trim();
                const blob = new Blob([propertyText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${property.address.replace(/\s+/g, '_')}_details.txt`;
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
                    title: property.title,
                    text: property.subtitle,
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

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-[50px] z-20">
        <div className="max-w-7xl mx-auto px-[0.5px] md:px-5">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'location', label: 'Location' },
              { id: 'property-info', label: 'Property Info' },
              { id: 'schools', label: 'Schools' },
              { id: 'similar-homes', label: 'Similar Homes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-accent-yellow text-primary-black'
                    : 'border-transparent text-custom-gray hover:text-primary-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-[0.5px] md:px-5 py-[0.8px] md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[0.8px] md:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-[0.8px] md:space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-[0.8px] md:space-y-8">
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
              <h2 className="text-2xl font-bold text-primary-black mb-[0.4px] md:mb-4">LOCATION & MAP</h2>
              
              {/* Weather Info */}
              {weather && (
                <div className="mb-4 p-4 bg-light-gray rounded-lg flex items-center gap-4">
                  <Image src={weather.icon} alt={weather.condition} width={64} height={64} className="w-16 h-16" unoptimized />
                  <div>
                    <div className="text-2xl font-bold text-primary-black">{weather.temperature}°F</div>
                    <div className="text-sm text-custom-gray capitalize">{weather.description}</div>
                    <div className="text-xs text-custom-gray mt-1">
                      Humidity: {weather.humidity}% • Wind: {weather.windSpeed} mph
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-[0.4px] md:space-y-4">
                <div className="flex gap-2 border-b border-gray-300">
                  <button
                    onClick={() => setMapView('aerial')}
                    className={`px-4 py-2 font-semibold transition-colors ${
                      mapView === 'aerial'
                        ? 'text-primary-black border-b-2 border-accent-yellow'
                        : 'text-custom-gray hover:text-primary-black'
                    }`}
                  >
                    AERIAL
                  </button>
                  <button
                    onClick={() => setMapView('map')}
                    className={`px-4 py-2 font-semibold transition-colors ${
                      mapView === 'map'
                        ? 'text-primary-black border-b-2 border-accent-yellow'
                        : 'text-custom-gray hover:text-primary-black'
                    }`}
                  >
                    MAP
                  </button>
                  <button
                    onClick={() => setMapView('commute')}
                    className={`px-4 py-2 font-semibold transition-colors ${
                      mapView === 'commute'
                        ? 'text-primary-black border-b-2 border-accent-yellow'
                        : 'text-custom-gray hover:text-primary-black'
                    }`}
                  >
                    COMMUTE
                  </button>
                </div>
                <div className="relative w-full h-96 bg-gray-200 rounded overflow-hidden">
                  <PropertyMap
                    address={property.address}
                    city={property.city}
                    state={property.state}
                    zipCode={property.zipCode}
                    coordinates={property.location}
                    height="100%"
                    showControls={true}
                  />
                </div>
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
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="space-y-[0.8px] md:space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-primary-black mb-[0.4px] md:mb-4">LOCATION</h2>
                  <div className="relative w-full h-96 bg-gray-200 rounded overflow-hidden mb-4">
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
                    className="inline-flex items-center gap-2 text-accent-yellow hover:underline mb-4"
                  >
                    <MapPin size={18} />
                    View on Google Maps
                  </a>
                  <a href="#" className="text-blue-600 hover:underline block mb-6">Add your commute</a>
                  
                  <h3 className="text-xl font-bold text-primary-black mb-4">Building Information</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="px-4 py-3 font-semibold text-primary-black">Year Built</td>
                          <td className="px-4 py-3 text-custom-gray">{property.yearBuilt || 'N/A'}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="px-4 py-3 font-semibold text-primary-black">Lot Size</td>
                          <td className="px-4 py-3 text-custom-gray">{property.lotSize || 'N/A'}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="px-4 py-3 font-semibold text-primary-black">Property Type</td>
                          <td className="px-4 py-3 text-custom-gray">{property.type}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {/* Property Info Tab */}
            {activeTab === 'property-info' && (
              <div className="space-y-[0.8px] md:space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-primary-black mb-[0.4px] md:mb-4">PROPERTY INFORMATION</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-black mb-2">Location Information</h3>
                      <p className="text-custom-gray">{property.address}, {property.city}, {property.state} {property.zipCode}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary-black mb-2">Municipal Code</h3>
                      <p className="text-custom-gray">Available upon request</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary-black mb-2">Section</h3>
                      <p className="text-custom-gray">Available upon request</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Schools Tab */}
            {activeTab === 'schools' && (
              <div className="space-y-[0.8px] md:space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-primary-black mb-[0.4px] md:mb-4">SCHOOLS</h2>
                  {property.schools && property.schools.length > 0 ? (
                    <>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-light-gray">
                              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">Rating</th>
                              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">School Name</th>
                              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">Type</th>
                              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">Grades</th>
                              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-primary-black">Distance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {property.schools.map((school, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-3 text-sm font-semibold">{school.rating}/10</td>
                                <td className="border border-gray-300 px-4 py-3 text-sm">
                                  <a href="#" className="text-blue-600 hover:underline">{school.name}</a>
                                </td>
                                <td className="border border-gray-300 px-4 py-3 text-sm">{school.type}</td>
                                <td className="border border-gray-300 px-4 py-3 text-sm">{school.grades}</td>
                                <td className="border border-gray-300 px-4 py-3 text-sm">{school.distance}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button className="text-blue-600 hover:underline mb-4">View more</button>
                      <p className="text-sm text-custom-gray">Data source: GreatSchools.org</p>
                    </>
                  ) : (
                    <p className="text-custom-gray">No school data available</p>
                  )}
                </section>
              </div>
            )}

            {/* Similar Homes Tab */}
            {activeTab === 'similar-homes' && (
              <div className="space-y-[0.8px] md:space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-primary-black mb-[0.4px] md:mb-4">SIMILAR HOMES</h2>
                  {property.relatedProperties && property.relatedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {property.relatedProperties.map((relatedId) => {
                        const relatedProperty = allProperties.find(p => p.id === relatedId);
                        if (!relatedProperty) return null;
                        return (
                          <Link
                            key={relatedId}
                            href={`/property/${relatedId}`}
                            className="group"
                          >
                            <div className="relative h-48 rounded overflow-hidden mb-2">
                              <Image
                                src={relatedProperty.imageUrl}
                                alt={relatedProperty.address}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform"
                              />
                            </div>
                            <h4 className="font-semibold text-primary-black">{relatedProperty.address}</h4>
                            <p className="text-sm text-custom-gray">{relatedProperty.city}, {relatedProperty.state}</p>
                            <p className="text-sm font-semibold text-primary-black mt-1">{relatedProperty.price}</p>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-custom-gray">Sorry, we can&apos;t find any similar homes at this time.</p>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-primary-black mb-4">Similar Sold Homes</h3>
                    <p className="text-custom-gray">No sold homes data available at this time.</p>
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Right Column - Contact Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4 space-y-6">
              {/* Listing Details Box */}
              <div className="bg-light-gray rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-primary-black mb-4">LISTING DETAILS</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-custom-gray">Status:</span>
                    <span className="font-semibold text-primary-black">{property.status || 'Active'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-custom-gray">Days on Market:</span>
                    <span className="font-semibold text-primary-black">{property.daysOnMarket !== undefined ? property.daysOnMarket : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-custom-gray">Taxes:</span>
                    <span className="font-semibold text-primary-black">{property.taxes ? `$${property.taxes.toFixed(2)}` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-custom-gray">HOA Fees:</span>
                    <span className="font-semibold text-primary-black">{property.hoaFees ? `$${property.hoaFees}/mo` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-custom-gray">Compass Type:</span>
                    <span className="font-semibold text-primary-black">{property.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-custom-gray">Year Built:</span>
                    <span className="font-semibold text-primary-black">{property.yearBuilt || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-custom-gray">Lot Size:</span>
                    <span className="font-semibold text-primary-black">{property.lotSize || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-custom-gray">County:</span>
                    <a href="#" className="font-semibold text-blue-600 hover:underline">{property.county || 'N/A'}</a>
                  </div>
                </div>
              </div>

              {/* Payment Calculator - Only show in Location tab */}
              {activeTab === 'location' && (
                <div className="bg-light-gray rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-primary-black mb-4">PAYMENT CALCULATOR</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">Loan Amount</label>
                      <input
                        type="range"
                        min="0"
                        max={property.priceValue || 1000000}
                        value={loanAmount || property.priceValue || 0}
                        onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-sm text-custom-gray mt-1">${(loanAmount || property.priceValue || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">Interest Rate (%)</label>
                      <input
                        type="number"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">Down Payment (%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={downPayment}
                        onChange={(e) => setDownPayment(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-sm text-custom-gray mt-1">{downPayment}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-black mb-2">Term</label>
                      <select
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value="15">15 Years Fixed</option>
                        <option value="30">30 Years Fixed</option>
                      </select>
                    </div>
                    <div className="pt-4 border-t border-gray-300 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-custom-gray">Principal & Interest:</span>
                        <span className="font-semibold text-primary-black">
                          ${((loanAmount || property.priceValue || 0) * (1 - downPayment / 100) * (interestRate / 100 / 12) / (1 - Math.pow(1 + interestRate / 100 / 12, -loanTerm * 12))).toFixed(2)}/mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-custom-gray">Property Taxes:</span>
                        <span className="font-semibold text-primary-black">
                          ${property.taxes ? (property.taxes / 12).toFixed(2) : '0.00'}/mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-custom-gray">HOA Dues:</span>
                        <span className="font-semibold text-primary-black">
                          ${property.hoaFees ? property.hoaFees.toFixed(2) : '0.00'}/mo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Listing Agent Card */}
              <div className="bg-light-gray rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-primary-black mb-4">LISTING AGENT</h3>
                <div className="flex items-center gap-3 mb-4">
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
                <div className="space-y-2 text-sm">
                  <p className="text-custom-gray">Email: <a href={`mailto:${property.agent.email}`} className="text-blue-600 hover:underline">{property.agent.email}</a></p>
                  <p className="text-custom-gray">Phone: <a href={`tel:${property.agent.phone.replace(/\s+/g, '')}`} className="text-blue-600 hover:underline">{property.agent.phone}</a></p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-light-gray rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-primary-black mb-4">CONTACT</h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); console.log('Form submitted:', contactForm); }}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                  />
                  <textarea
                    placeholder="Message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow"
                    required
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactForm.financing}
                      onChange={(e) => setContactForm({ ...contactForm, financing: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-custom-gray">I want financing information</span>
                  </label>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Send Message
                  </button>
                  <p className="text-xs text-custom-gray text-center">
                    By submitting this form, you agree to be contacted by Cap Rate and its agents.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
