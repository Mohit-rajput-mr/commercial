'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, Search, ChevronLeft, ChevronRight, Loader2, 
  Heart, Share2, Bed, Bath, Home, Ruler, AlertCircle, Clock, X
} from 'lucide-react';
import { PropertySearchResult, LocationSuggestion } from './types';

const API_CONFIG = {
  baseURL: 'https://zillow-com1.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': '5f4649a2c0mshe0eb5bc518388f8p18a661jsn0e235847992c',
    'x-rapidapi-host': 'zillow-com1.p.rapidapi.com'
  }
};

const PROPERTY_STATUS = ['For Sale', 'For Rent', 'Sold'];
const HOME_TYPES = ['Houses', 'Condos', 'Apartments', 'Townhomes', 'Land', 'Multi-family'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'beds', label: 'Most Beds' },
  { value: 'baths', label: 'Most Baths' },
  { value: 'sqft', label: 'Largest Sqft' }
];

export default function ZillowSearchPage() {
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Filters
  const [status, setStatus] = useState('For Sale');
  const [homeTypes, setHomeTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBeds, setMinBeds] = useState('');
  const [maxBeds, setMaxBeds] = useState('');
  const [minBaths, setMinBaths] = useState('');
  const [maxBaths, setMaxBaths] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PropertySearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchCooldown, setSearchCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const resultsPerPage = 20;

  // Load favorites and recent searches from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('zillowFavorites');
    const savedSearches = localStorage.getItem('zillowRecentSearches');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (cooldownSeconds === 0 && searchCooldown) {
      setSearchCooldown(false);
    }
  }, [cooldownSeconds, searchCooldown]);

  // Debounced location autocomplete
  const fetchLocationSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.baseURL}/locationSuggestions?location=${encodeURIComponent(query)}`,
        { headers: API_CONFIG.headers }
      );

      if (response.ok) {
        const data = await response.json();
        const suggestions: LocationSuggestion[] = Array.isArray(data) 
          ? data 
          : data.suggestions || data.results || data.locations || [];
        setLocationSuggestions(suggestions);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Location autocomplete error:', err);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (locationQuery) {
      const timer = setTimeout(() => {
        fetchLocationSuggestions(locationQuery);
      }, 500); // 500ms debounce
      setDebounceTimer(timer);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationQuery]);

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setLocationQuery(suggestion.location);
    setShowSuggestions(false);
  };

  const toggleHomeType = (type: string) => {
    setHomeTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const performSearch = async () => {
    if (!locationQuery.trim()) {
      setError('Please enter a location');
      return;
    }

    if (searchCooldown) {
      setError(`Please wait ${cooldownSeconds} seconds before searching again`);
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setResults([]);
    setShowSuggestions(false);

    try {
      const params = new URLSearchParams();
      params.append('location', locationQuery);
      
      // Add filters
      if (status === 'For Rent') {
        params.append('status_type', 'ForRent');
      } else if (status === 'Sold') {
        params.append('status_type', 'Sold');
      } else {
        params.append('status_type', 'ForSale');
      }

      if (homeTypes.length > 0) {
        const homeTypeMap: Record<string, string> = {
          'Houses': 'HOUSE',
          'Condos': 'CONDO',
          'Apartments': 'APARTMENT',
          'Townhomes': 'TOWNHOUSE',
          'Land': 'LAND',
          'Multi-family': 'MULTI_FAMILY'
        };
        params.append('home_type', homeTypes.map(t => homeTypeMap[t] || t).join(','));
      }

      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minBeds) params.append('beds_min', minBeds);
      if (maxBeds) params.append('beds_max', maxBeds);
      if (minBaths) params.append('baths_min', minBaths);
      if (maxBaths) params.append('baths_max', maxBaths);
      if (sortBy) params.append('sort', sortBy);

      const searchUrl = `${API_CONFIG.baseURL}/propertyExtendedSearch?${params.toString()}`;
      const response = await fetch(searchUrl, { headers: API_CONFIG.headers });

      // Handle specific error codes
      if (response.status === 403) {
        throw new Error('API access denied - Please check your RapidAPI subscription for Zillow API. The subscription may be inactive or expired. Visit rapidapi.com dashboard to verify.');
      }

      if (response.status === 429) {
        setSearchCooldown(true);
        setCooldownSeconds(5);
        throw new Error('Rate limit exceeded - Please wait 5 seconds before searching again. Too many requests were made in a short time.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Search failed: ${response.status} ${response.statusText}. ${errorText || ''}`);
      }

      const data = await response.json();
      const properties: PropertySearchResult[] = Array.isArray(data)
        ? data
        : data.props || data.properties || data.results || data.data || [];

      setResults(properties);
      setTotalResults(properties.length);

      // Set cooldown after successful search
      setSearchCooldown(true);
      setCooldownSeconds(2);

      // Save to recent searches
      if (locationQuery) {
        const newSearches = [locationQuery, ...recentSearches.filter(s => s !== locationQuery)].slice(0, 10);
        setRecentSearches(newSearches);
        localStorage.setItem('zillowRecentSearches', JSON.stringify(newSearches));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && !searchCooldown) {
      handleSearch();
    }
  };

  const toggleFavorite = (zpid: string) => {
    const newFavorites = favorites.includes(zpid)
      ? favorites.filter(id => id !== zpid)
      : [...favorites, zpid];
    setFavorites(newFavorites);
    localStorage.setItem('zillowFavorites', JSON.stringify(newFavorites));
  };

  const shareProperty = (property: PropertySearchResult) => {
    const url = `${window.location.origin}/zillow/property/${property.zpid}`;
    navigator.clipboard.writeText(url);
    alert('Property link copied to clipboard!');
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price not available';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const isSearchDisabled = loading || searchCooldown;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-4">Zillow Property Search</h1>
              <p className="text-xl text-blue-100">Search properties by location, city, address, or ZIP code</p>
            </div>
            <Link
              href="/"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="space-y-6">
            {/* Location Input with Autocomplete */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter city, state, or ZIP code (e.g., Miami, FL or 90210)"
                  className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isSearchDisabled}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearchDisabled}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Autocomplete Suggestions */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="font-medium">{suggestion.location}</div>
                      {suggestion.city && (
                        <div className="text-sm text-gray-600">
                          {suggestion.city}, {suggestion.state} {suggestion.zipcode}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Cooldown Timer */}
              {searchCooldown && cooldownSeconds > 0 && (
                <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
                  <Clock className="w-4 h-4" />
                  <span>Please wait {cooldownSeconds} seconds before searching again</span>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Property Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PROPERTY_STATUS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Home Types */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Home Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {HOME_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={homeTypes.includes(type)}
                        onChange={() => toggleHomeType(type)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="$0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="No max"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Beds */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Beds
                  </label>
                  <select
                    value={minBeds}
                    onChange={(e) => setMinBeds(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n}+</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Beds
                  </label>
                  <select
                    value={maxBeds}
                    onChange={(e) => setMaxBeds(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Baths */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Baths
                  </label>
                  <select
                    value={minBaths}
                    onChange={(e) => setMinBaths(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}+</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Baths
                  </label>
                  <select
                    value={maxBaths}
                    onChange={(e) => setMaxBaths(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && locationQuery === '' && !loading && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Recent Searches:</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setLocationQuery(search);
                        performSearch();
                      }}
                      disabled={isSearchDisabled}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold mb-1">⚠️ Error</p>
                <p className="text-sm whitespace-pre-line">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <div className="text-gray-700">
                <span className="font-semibold">{totalResults.toLocaleString()}</span> properties found
              </div>
            </div>

            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedResults.map(property => (
                <PropertyCard
                  key={property.zpid}
                  property={property}
                  isFavorite={favorites.includes(property.zpid)}
                  onToggleFavorite={toggleFavorite}
                  onShare={shareProperty}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                <span className="text-gray-700 font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Searching properties...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && !error && locationQuery && (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No properties found</h3>
            <p className="text-gray-600">Try a different search term or adjust your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Property Card Component
interface PropertyCardProps {
  property: PropertySearchResult;
  isFavorite: boolean;
  onToggleFavorite: (zpid: string) => void;
  onShare: (property: PropertySearchResult) => void;
}

const PropertyCard = React.memo(function PropertyCard({ 
  property, 
  isFavorite, 
  onToggleFavorite, 
  onShare 
}: PropertyCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const hasImage = property.imgSrc || (property.images && property.images.length > 0);
  const imageUrl = property.imgSrc || (property.images && property.images[0]);

  const formatPrice = (price?: number) => {
    if (!price) return 'Price not available';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Link href={`/property/residential/${property.zpid}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
        {/* Property Image */}
        <div className="relative h-64 bg-gray-200 overflow-hidden">
          {hasImage ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              )}
              <Image
                src={imageUrl!}
                alt={property.address}
                fill
                className={`object-cover group-hover:scale-110 transition-transform duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
              <Building2 className="w-16 h-16 text-gray-500" />
            </div>
          )}
          
          {/* Price Overlay */}
          {property.price && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white text-2xl font-bold">
                {formatPrice(property.price)}
              </p>
            </div>
          )}

          {/* Status Badge */}
          {property.homeStatus && (
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {property.homeStatus}
              </span>
            </div>
          )}

          {/* Days on Market */}
          {property.daysOnZillow !== undefined && (
            <div className="absolute top-4 right-20">
              <span className="bg-white/90 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                {property.daysOnZillow} days
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(property.zpid);
              }}
              className={`p-2 rounded-full transition-colors ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShare(property);
              }}
              className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {property.address}
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            {property.city}, {property.state} {property.zipcode}
          </p>
          
          <div className="flex items-center gap-4 text-gray-600 mb-3">
            {property.bedrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span className="text-sm">{property.bedrooms} bed</span>
              </div>
            )}
            {property.bathrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span className="text-sm">{property.bathrooms} bath</span>
              </div>
            )}
            {property.livingArea && (
              <div className="flex items-center gap-1">
                <Ruler className="w-4 h-4" />
                <span className="text-sm">{property.livingArea.toLocaleString()} sqft</span>
              </div>
            )}
          </div>

          {/* Property Type Badge */}
          {property.propertyType && (
            <div className="mb-3">
              <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                {property.propertyType}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">ZPID: {property.zpid}</span>
          </div>
        </div>
      </div>
    </Link>
  );
});
