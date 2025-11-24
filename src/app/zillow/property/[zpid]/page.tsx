'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, Bed, Bath, Home, Calendar, DollarSign, MapPin, 
  Building2, Loader2, ChevronLeft, ChevronRight, TrendingUp,
  Phone, Mail, User, Star, Navigation as NavIcon, Car, Zap,
  Thermometer, Wind, Heart, Share2, Download, Eye, Printer,
  X, Maximize2, Minimize2, AlertCircle
} from 'lucide-react';
import {
  PropertyDetail,
  PriceHistoryEntry,
  TaxHistoryEntry,
  ZestimateData,
  ZestimateHistoryEntry,
  WalkScore,
  School,
  SimilarProperty,
  RentEstimate,
  Agent
} from '../../types';

const API_CONFIG = {
  baseURL: 'https://zillow-com1.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': '5f4649a2c0mshe0eb5bc518388f8p18a661jsn0e235847992c',
    'x-rapidapi-host': 'zillow-com1.p.rapidapi.com'
  }
};

export default function ZillowPropertyDetailPage() {
  const params = useParams();
  const zpid = params.zpid as string;
  
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [taxHistory, setTaxHistory] = useState<TaxHistoryEntry[]>([]);
  const [zestimateData, setZestimateData] = useState<ZestimateData | null>(null);
  const [zestimateHistory, setZestimateHistory] = useState<ZestimateHistoryEntry[]>([]);
  const [walkScore, setWalkScore] = useState<WalkScore | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [similarProperties, setSimilarProperties] = useState<SimilarProperty[]>([]);
  const [rentEstimate, setRentEstimate] = useState<RentEstimate | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const checkFavorite = useCallback(() => {
    const favorites = JSON.parse(localStorage.getItem('zillowFavorites') || '[]');
    setIsFavorite(favorites.includes(zpid));
  }, [zpid]);

  const fetchPropertyDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        propertyResponse,
        imagesResponse,
        priceHistoryResponse,
        zestimateResponse,
        zestimateHistoryResponse,
        walkScoreResponse,
        schoolsResponse,
        similarResponse,
        rentEstimateResponse
      ] = await Promise.allSettled([
        fetch(`${API_CONFIG.baseURL}/property?zpid=${zpid}`, { headers: API_CONFIG.headers }),
        fetch(`${API_CONFIG.baseURL}/images?zpid=${zpid}`, { headers: API_CONFIG.headers }),
        fetch(`${API_CONFIG.baseURL}/priceAndTaxHistory?zpid=${zpid}`, { headers: API_CONFIG.headers }),
        fetch(`${API_CONFIG.baseURL}/zestimate?zpid=${zpid}`, { headers: API_CONFIG.headers }),
        fetch(`${API_CONFIG.baseURL}/zestimateHistory?zpid=${zpid}`, { headers: API_CONFIG.headers }),
        fetch(`${API_CONFIG.baseURL}/walkAndTransitScore?zpid=${zpid}`, { headers: API_CONFIG.headers }),
        fetch(`${API_CONFIG.baseURL}/schools?zpid=${zpid}`, { headers: API_CONFIG.headers }),
        fetch(`${API_CONFIG.baseURL}/similarProperty?zpid=${zpid}`, { headers: API_CONFIG.headers }),
        fetch(`${API_CONFIG.baseURL}/rentEstimate?zpid=${zpid}`, { headers: API_CONFIG.headers })
      ]);

      // Handle 403 and 429 errors
      const checkError = (response: Response) => {
        if (response.status === 403) {
          throw new Error('API access denied - Please check your RapidAPI subscription for Zillow API. The subscription may be inactive or expired.');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded - Please wait a moment and try again.');
        }
      };

      // Process property data
      if (propertyResponse.status === 'fulfilled' && propertyResponse.value.ok) {
        checkError(propertyResponse.value);
        const propertyData = await propertyResponse.value.json();
        setProperty(propertyData);
      } else if (propertyResponse.status === 'fulfilled' && !propertyResponse.value.ok) {
        checkError(propertyResponse.value);
      }

      // Process images
      if (imagesResponse.status === 'fulfilled' && imagesResponse.value.ok) {
        checkError(imagesResponse.value);
        const imagesData = await imagesResponse.value.json();
        const imageList: string[] = Array.isArray(imagesData) 
          ? imagesData.map((img: any) => typeof img === 'string' ? img : img.url || img.src)
          : imagesData.images || imagesData.photos || [];
        setImages(imageList);
      }

      // Process price and tax history
      if (priceHistoryResponse.status === 'fulfilled' && priceHistoryResponse.value.ok) {
        checkError(priceHistoryResponse.value);
        const historyData = await priceHistoryResponse.value.json();
        setPriceHistory(historyData.priceHistory || historyData.history || []);
        setTaxHistory(historyData.taxHistory || historyData.tax_history || []);
      }

      // Process zestimate
      if (zestimateResponse.status === 'fulfilled' && zestimateResponse.value.ok) {
        checkError(zestimateResponse.value);
        const zestimateData = await zestimateResponse.value.json();
        setZestimateData(zestimateData);
      }

      // Process zestimate history
      if (zestimateHistoryResponse.status === 'fulfilled' && zestimateHistoryResponse.value.ok) {
        checkError(zestimateHistoryResponse.value);
        const historyData = await zestimateHistoryResponse.value.json();
        setZestimateHistory(historyData.history || historyData.zestimateHistory || []);
      }

      // Process walk score
      if (walkScoreResponse.status === 'fulfilled' && walkScoreResponse.value.ok) {
        checkError(walkScoreResponse.value);
        const walkData = await walkScoreResponse.value.json();
        setWalkScore({
          walkScore: walkData.walkScore || walkData.walk_score,
          transitScore: walkData.transitScore || walkData.transit_score,
          bikeScore: walkData.bikeScore || walkData.bike_score
        });
      }

      // Process schools
      if (schoolsResponse.status === 'fulfilled' && schoolsResponse.value.ok) {
        checkError(schoolsResponse.value);
        const schoolsData = await schoolsResponse.value.json();
        const schoolList: School[] = Array.isArray(schoolsData) 
          ? schoolsData 
          : schoolsData.schools || schoolsData.results || [];
        setSchools(schoolList);
      }

      // Process similar properties
      if (similarResponse.status === 'fulfilled' && similarResponse.value.ok) {
        checkError(similarResponse.value);
        const similarData = await similarResponse.value.json();
        const similar: SimilarProperty[] = Array.isArray(similarData)
          ? similarData
          : similarData.properties || similarData.results || similarData.similar || [];
        setSimilarProperties(similar);
      }

      // Process rent estimate
      if (rentEstimateResponse.status === 'fulfilled' && rentEstimateResponse.value.ok) {
        checkError(rentEstimateResponse.value);
        const rentData = await rentEstimateResponse.value.json();
        setRentEstimate(rentData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  }, [zpid]);

  useEffect(() => {
    fetchPropertyDetails();
    checkFavorite();
  }, [zpid, fetchPropertyDetails, checkFavorite]);

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      );
      setImageLoading(true);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? images.length - 1 : prev - 1
      );
      setImageLoading(true);
    }
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('zillowFavorites') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== zpid)
      : [...favorites, zpid];
    localStorage.setItem('zillowFavorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const shareProperty = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Property link copied to clipboard!');
  };

  const printProperty = () => {
    window.print();
  };

  const emailProperty = () => {
    const subject = encodeURIComponent(`Property Details: ${property?.address}`);
    const body = encodeURIComponent(`Check out this property: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score?: number) => {
    if (!score) return 'N/A';
    if (score >= 90) return 'Walker\'s Paradise';
    if (score >= 70) return 'Very Walkable';
    if (score >= 50) return 'Somewhat Walkable';
    return 'Car-Dependent';
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
            href="/zillow"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const displayImages = images.length > 0 ? images : (property.images || []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/zillow"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Search
            </Link>
            <div className="flex gap-2">
              <button
                onClick={toggleFavorite}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isFavorite 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={shareProperty}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button
                onClick={printProperty}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
              <button
                onClick={emailProperty}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        {displayImages.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="relative h-96 md:h-[600px] bg-gray-200">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                </div>
              )}
              <Image
                src={displayImages[currentImageIndex]}
                alt={`${property.address} - Image ${currentImageIndex + 1}`}
                fill
                className={`object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
              
              {displayImages.length > 1 && (
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

              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                {currentImageIndex + 1} / {displayImages.length}
              </div>
            </div>

            {displayImages.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {displayImages.slice(0, 10).map((image, index) => (
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Overview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {formatPrice(property.price)}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-5 h-5" />
                  <p className="text-lg">
                    {property.address}, {property.city}, {property.state} {property.zipcode}
                  </p>
                </div>
                {property.daysOnZillow && property.daysOnZillow > 0 && (
                  <p className="text-sm text-gray-500">
                    {property.daysOnZillow} days on Zillow
                  </p>
                )}
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b">
                {property.bedrooms !== undefined && (
                  <div className="text-center">
                    <Bed className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                  </div>
                )}
                {property.bathrooms !== undefined && (
                  <div className="text-center">
                    <Bath className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                  </div>
                )}
                {property.livingArea && (
                  <div className="text-center">
                    <Home className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {property.livingArea > 0 ? property.livingArea.toLocaleString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Sq Ft</p>
                  </div>
                )}
                {property.propertyType && (
                  <div className="text-center">
                    <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{property.propertyType}</p>
                    <p className="text-sm text-gray-600">Type</p>
                  </div>
                )}
              </div>

              {/* Zestimate */}
              {(zestimateData?.zestimate || rentEstimate?.rentZestimate) && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Zillow Estimates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {zestimateData?.zestimate && (
                      <div>
                        <p className="text-sm text-gray-600">Zestimate®</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(zestimateData.zestimate)}
                        </p>
                      </div>
                    )}
                    {rentEstimate?.rentZestimate && (
                      <div>
                        <p className="text-sm text-gray-600">Rent Zestimate®</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(rentEstimate.rentZestimate)}/mo
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                {property.lotSize && (
                  <div>
                    <p className="text-sm text-gray-600">Lot Size</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {property.lotSize.toLocaleString()} sq ft
                    </p>
                  </div>
                )}
                {property.stories && (
                  <div>
                    <p className="text-sm text-gray-600">Stories</p>
                    <p className="text-lg font-semibold text-gray-900">{property.stories}</p>
                  </div>
                )}
                {property.hoaFee && (
                  <div>
                    <p className="text-sm text-gray-600">HOA Fee</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(property.hoaFee)}/mo
                    </p>
                  </div>
                )}
                {property.taxAnnualAmount && (
                  <div>
                    <p className="text-sm text-gray-600">Annual Tax</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(property.taxAnnualAmount)}
                    </p>
                  </div>
                )}
                {property.mlsNumber && (
                  <div>
                    <p className="text-sm text-gray-600">MLS Number</p>
                    <p className="text-lg font-semibold text-gray-900">{property.mlsNumber}</p>
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

            {/* Key Features */}
            {property.resoFacts && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.resoFacts.heating && (
                    <div className="flex items-center gap-3">
                      <Thermometer className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Heating</p>
                        <p className="font-semibold text-gray-900">{property.resoFacts.heating}</p>
                      </div>
                    </div>
                  )}
                  {property.resoFacts.cooling && (
                    <div className="flex items-center gap-3">
                      <Wind className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Cooling</p>
                        <p className="font-semibold text-gray-900">{property.resoFacts.cooling}</p>
                      </div>
                    </div>
                  )}
                  {property.resoFacts.parking && (
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Parking</p>
                        <p className="font-semibold text-gray-900">{property.resoFacts.parking}</p>
                      </div>
                    </div>
                  )}
                  {property.resoFacts.garageType && (
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Garage</p>
                        <p className="font-semibold text-gray-900">{property.resoFacts.garageType}</p>
                      </div>
                    </div>
                  )}
                  {property.resoFacts.flooring && property.resoFacts.flooring.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Flooring</p>
                      <p className="font-semibold text-gray-900">{property.resoFacts.flooring.join(', ')}</p>
                    </div>
                  )}
                  {property.resoFacts.appliances && property.resoFacts.appliances.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Appliances</p>
                      <p className="font-semibold text-gray-900">{property.resoFacts.appliances.join(', ')}</p>
                    </div>
                  )}
                  {property.resoFacts.amenities && property.resoFacts.amenities.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {property.resoFacts.amenities.map((amenity, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transportation Scores */}
            {walkScore && (walkScore.walkScore || walkScore.transitScore || walkScore.bikeScore) && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Transportation</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {walkScore.walkScore && (
                    <div className="text-center">
                      <div className={`text-5xl font-bold mb-2 ${getScoreColor(walkScore.walkScore)}`}>
                        {walkScore.walkScore}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Walk Score®</p>
                      <p className="text-xs text-gray-600">{getScoreLabel(walkScore.walkScore)}</p>
                    </div>
                  )}
                  {walkScore.transitScore && (
                    <div className="text-center">
                      <div className={`text-5xl font-bold mb-2 ${getScoreColor(walkScore.transitScore)}`}>
                        {walkScore.transitScore}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Transit Score®</p>
                      <p className="text-xs text-gray-600">{getScoreLabel(walkScore.transitScore)}</p>
                    </div>
                  )}
                  {walkScore.bikeScore && (
                    <div className="text-center">
                      <div className={`text-5xl font-bold mb-2 ${getScoreColor(walkScore.bikeScore)}`}>
                        {walkScore.bikeScore}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Bike Score®</p>
                      <p className="text-xs text-gray-600">{getScoreLabel(walkScore.bikeScore)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Price History */}
            {priceHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Price History</h2>
                <div className="space-y-3">
                  {priceHistory.map((history, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{history.event}</p>
                        <p className="text-sm text-gray-600">{history.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPrice(history.price)}</p>
                        {history.priceChangeRate && (
                          <p className={`text-sm ${history.priceChangeRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {history.priceChangeRate > 0 ? '+' : ''}{history.priceChangeRate}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tax History */}
            {taxHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tax History</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Year</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Tax Amount</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Assessment Value</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Tax Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxHistory.map((tax, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{tax.year}</td>
                          <td className="py-3 px-4 text-right">{formatPrice(tax.taxPaid)}</td>
                          <td className="py-3 px-4 text-right">
                            {tax.assessmentValue ? formatPrice(tax.assessmentValue) : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {tax.taxRate ? `${tax.taxRate}%` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Zestimate History */}
            {zestimateHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Zestimate History</h2>
                <div className="space-y-3">
                  {zestimateHistory.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{entry.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPrice(entry.value)}</p>
                        {entry.change && (
                          <p className={`text-sm ${entry.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.change > 0 ? '+' : ''}{formatPrice(entry.change)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Schools */}
            {schools.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Nearby Schools</h2>
                <div className="space-y-4">
                  {schools.map((school, index) => (
                    <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">{school.name}</h3>
                        <p className="text-sm text-gray-600">{school.grades} • {school.type}</p>
                        <p className="text-sm text-gray-600">{school.distance} miles away</p>
                        {school.studentCount && (
                          <p className="text-sm text-gray-600">{school.studentCount} students</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold">{school.rating}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Similar Properties</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {similarProperties.map((similar) => (
                    <Link
                      key={similar.zpid}
                      href={`/zillow/property/${similar.zpid}`}
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {similar.imgSrc && (
                        <div className="relative h-48 mb-3 rounded-lg overflow-hidden">
                          <Image
                            src={similar.imgSrc}
                            alt={similar.address}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <p className="font-semibold text-gray-900">{formatPrice(similar.price)}</p>
                      <p className="text-sm text-gray-600">{similar.address}</p>
                      <p className="text-sm text-gray-600">
                        {similar.city}, {similar.state} {similar.zipcode}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        {similar.bedrooms && <span>{similar.bedrooms} bed</span>}
                        {similar.bathrooms && <span>{similar.bathrooms} bath</span>}
                        {similar.livingArea && <span>{similar.livingArea.toLocaleString()} sqft</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
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
            {/* Quick Summary */}
            <div className="bg-blue-50 rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Property Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ZPID</span>
                  <span className="font-semibold text-gray-900">{property.zpid}</span>
                </div>
                {property.homeStatus && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="font-semibold text-blue-600">{property.homeStatus}</span>
                  </div>
                )}
                {property.propertyType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-semibold text-gray-900">{property.propertyType}</span>
                  </div>
                )}
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
