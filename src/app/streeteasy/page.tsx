'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, Search, X, MapPin, Bed, Bath, Home, ChevronLeft, ChevronRight, Loader2, Download, Map as MapIcon, Save } from 'lucide-react';

// TypeScript types
interface PropertySearchResult {
  id: string;
  price: number;
  status: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  url: string;
}

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
}

interface SearchFilters {
  propertyStatus: 'active-sales' | 'past-sales' | 'active-rentals' | 'past-rentals';
  areas: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  maxBeds: string;
  minBaths: string;
  propertyTypes: string[];
  amenities: string[];
  maxMonthlyHOA: string;
  maxMonthlyTax: string;
  noFee: boolean;
  limit: number;
  sortBy: 'price-asc' | 'price-desc' | 'newest';
}

interface AutocompleteSuggestion {
  text: string;
  value: string;
  type: string;
  description?: string;
}

const PROPERTY_TYPES = ['Condo', 'Coop', 'House'];
const AMENITIES = [
  'Washer/Dryer', 'Dishwasher', 'Private Outdoor Space', 'Laundry', 
  'Elevator', 'Doorman', 'Gym', 'Pets Allowed', 'Roof Deck'
];

const API_CONFIG = {
  baseURL: 'https://streeteasy-api.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': '5037acc84cmshe961f4b77fc7a19p1f9f6djsn90114065adc7',
    'x-rapidapi-host': 'streeteasy-api.p.rapidapi.com'
  }
};

export default function StreetEasySearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    propertyStatus: 'active-sales',
    areas: '',
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    maxBeds: '',
    minBaths: '',
    propertyTypes: [],
    amenities: [],
    maxMonthlyHOA: '',
    maxMonthlyTax: '',
    noFee: false,
    limit: 20,
    sortBy: 'newest'
  });

  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PropertyDetails[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Fetch autocomplete suggestions from StreetEasy API
  const fetchAutocompleteSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `${API_CONFIG.baseURL}/autocomplete?query=${encodeURIComponent(query)}`,
        { headers: API_CONFIG.headers }
      );

      if (response.ok) {
        const data = await response.json();
        // Handle different possible response structures
        const suggestionsList = data.suggestions || data.results || data.data || [];
        
        // Transform suggestions to consistent format
        const formattedSuggestions: AutocompleteSuggestion[] = suggestionsList.map((item: any) => ({
          text: item.text || item.name || item.address || item.label || String(item),
          value: item.value || item.slug || item.id || item.text || item.name || String(item),
          type: item.type || 'location',
          description: item.description || item.subtitle || ''
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(formattedSuggestions.length > 0);
      } else {
        // Fallback to basic neighborhoods if API fails
        const fallbackNeighborhoods = [
          'tribeca', 'soho', 'financial-district', 'battery-park-city', 'chelsea', 
          'flatiron', 'gramercy', 'murray-hill', 'east-village', 'west-village', 
          'upper-east-side', 'upper-west-side', 'harlem', 'williamsburg', 'brooklyn-heights'
        ];
        const filtered = fallbackNeighborhoods
          .filter(n => n.toLowerCase().includes(query.toLowerCase()))
          .map(n => ({
            text: n.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            value: n,
            type: 'neighborhood',
            description: 'NYC Neighborhood'
          }));
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    } catch (err) {
      console.error('Autocomplete error:', err);
      // Fallback to basic neighborhoods on error
      const fallbackNeighborhoods = [
        'tribeca', 'soho', 'financial-district', 'battery-park-city', 'chelsea', 
        'flatiron', 'gramercy', 'murray-hill', 'east-village', 'west-village', 
        'upper-east-side', 'upper-west-side', 'harlem', 'williamsburg', 'brooklyn-heights'
      ];
      const filtered = fallbackNeighborhoods
        .filter(n => n.toLowerCase().includes(query.toLowerCase()))
        .map(n => ({
          text: n.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          value: n,
          type: 'neighborhood',
          description: 'NYC Neighborhood'
        }));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounced autocomplete search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput) {
        fetchAutocompleteSuggestions(searchInput);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSuggestionSelect = (suggestion: AutocompleteSuggestion) => {
    setFilters(prev => ({
      ...prev,
      areas: prev.areas ? `${prev.areas},${suggestion.value}` : suggestion.value
    }));
    setSearchInput('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const removeArea = (areaToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      areas: prev.areas.split(',').filter(a => a !== areaToRemove).join(',')
    }));
  };

  const togglePropertyType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type]
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const fetchPropertyDetails = async (id: string, isSale: boolean): Promise<PropertyDetails | null> => {
    try {
      const endpoint = isSale ? `/sales/${id}` : `/rentals/${id}`;
      const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
        headers: API_CONFIG.headers
      });
      
      if (!response.ok) throw new Error('Failed to fetch property details');
      
      const data = await response.json();
      return {
        id: data.id || id,
        price: data.price || 0,
        address: data.address || 'Address not available',
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        sqft: data.sqft || 0,
        propertyType: data.propertyType || data.type || 'N/A',
        images: data.images || [],
        status: data.status || 'Available',
        description: data.description,
        amenities: data.amenities
      };
    } catch (err) {
      console.error(`Error fetching details for property ${id}:`, err);
      return null;
    }
  };

  const handleSearch = async () => {
    if (!filters.areas) {
      setError('Please select at least one neighborhood');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const offset = 0;
      const isSale = filters.propertyStatus.includes('sales');
      const isPast = filters.propertyStatus.includes('past');
      
      let endpoint = isSale 
        ? (isPast ? '/sales/past/search' : '/sales/search')
        : (isPast ? '/rentals/past/search' : '/rentals/search');

      const params = new URLSearchParams();
      params.append('areas', filters.areas);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minBeds) params.append('minBeds', filters.minBeds);
      if (filters.maxBeds) params.append('maxBeds', filters.maxBeds);
      if (filters.minBaths) params.append('minBaths', filters.minBaths);
      if (filters.propertyTypes.length) params.append('types', filters.propertyTypes.join(','));
      if (filters.amenities.length) params.append('amenities', filters.amenities.join(','));
      if (isSale && filters.maxMonthlyHOA) params.append('maxMonthlyHOA', filters.maxMonthlyHOA);
      if (isSale && filters.maxMonthlyTax) params.append('maxMonthlyTax', filters.maxMonthlyTax);
      if (!isSale && filters.noFee) params.append('noFee', 'true');
      params.append('limit', filters.limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`${API_CONFIG.baseURL}${endpoint}?${params}`, {
        headers: API_CONFIG.headers
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      const searchResults: PropertySearchResult[] = data.listings || data.results || [];
      setTotalCount(data.total || searchResults.length);

      // Fetch full details for all properties in parallel
      const detailsPromises = searchResults.map(result => 
        fetchPropertyDetails(result.id, isSale)
      );
      
      const detailsResults = await Promise.all(detailsPromises);
      const validDetails = detailsResults.filter((d): d is PropertyDetails => d !== null);
      
      // Apply client-side sorting
      let sortedResults = [...validDetails];
      if (filters.sortBy === 'price-asc') {
        sortedResults.sort((a, b) => a.price - b.price);
      } else if (filters.sortBy === 'price-desc') {
        sortedResults.sort((a, b) => b.price - a.price);
      }
      
      setResults(sortedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    setLoading(true);

    try {
      const offset = (newPage - 1) * filters.limit;
      const isSale = filters.propertyStatus.includes('sales');
      const isPast = filters.propertyStatus.includes('past');
      
      let endpoint = isSale 
        ? (isPast ? '/sales/past/search' : '/sales/search')
        : (isPast ? '/rentals/past/search' : '/rentals/search');

      const params = new URLSearchParams();
      params.append('areas', filters.areas);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minBeds) params.append('minBeds', filters.minBeds);
      if (filters.maxBeds) params.append('maxBeds', filters.maxBeds);
      if (filters.minBaths) params.append('minBaths', filters.minBaths);
      if (filters.propertyTypes.length) params.append('types', filters.propertyTypes.join(','));
      if (filters.amenities.length) params.append('amenities', filters.amenities.join(','));
      params.append('limit', filters.limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`${API_CONFIG.baseURL}${endpoint}?${params}`, {
        headers: API_CONFIG.headers
      });

      if (!response.ok) throw new Error('Failed to load page');

      const data = await response.json();
      const searchResults: PropertySearchResult[] = data.listings || data.results || [];

      const detailsPromises = searchResults.map(result => 
        fetchPropertyDetails(result.id, isSale)
      );
      
      const detailsResults = await Promise.all(detailsPromises);
      const validDetails = detailsResults.filter((d): d is PropertyDetails => d !== null);
      
      setResults(validDetails);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      propertyStatus: 'active-sales',
      areas: '',
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      maxBeds: '',
      minBaths: '',
      propertyTypes: [],
      amenities: [],
      maxMonthlyHOA: '',
      maxMonthlyTax: '',
      noFee: false,
      limit: 20,
      sortBy: 'newest'
    });
    setSearchInput('');
    setResults([]);
    setError(null);
  };

  const saveSearch = () => {
    const savedSearches = JSON.parse(localStorage.getItem('streetEasySearches') || '[]');
    savedSearches.push({
      ...filters,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('streetEasySearches', JSON.stringify(savedSearches));
    alert('Search saved successfully!');
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Price', 'Address', 'Bedrooms', 'Bathrooms', 'Sqft', 'Type', 'Status'];
    const rows = results.map(p => [
      p.id,
      p.price,
      p.address,
      p.bedrooms,
      p.bathrooms,
      p.sqft,
      p.propertyType,
      p.status
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streeteasy-results-${Date.now()}.csv`;
    a.click();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const totalPages = Math.ceil(totalCount / filters.limit);
  const startResult = (currentPage - 1) * filters.limit + 1;
  const endResult = Math.min(currentPage * filters.limit, totalCount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Search NYC & NJ Properties</h1>
          <p className="text-xl text-blue-100">Find your perfect home from thousands of active listings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {/* Property Status Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
            {[
              { value: 'active-sales', label: 'Active Sales' },
              { value: 'past-sales', label: 'Past Sales' },
              { value: 'active-rentals', label: 'Active Rentals' },
              { value: 'past-rentals', label: 'Past Rentals' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilters(prev => ({ ...prev, propertyStatus: tab.value as any }))}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  filters.propertyStatus === tab.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Address/Neighborhood Search with Autocomplete */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Addresses & Neighborhoods *
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => searchInput && suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Type address, neighborhood, or area (e.g., 'Tribeca', 'Upper East Side', '123 Main St')..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {loadingSuggestions && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 animate-spin" />
                )}
              </div>
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.value}-${index}`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {suggestion.text}
                          </p>
                          {suggestion.description && (
                            <p className="text-sm text-gray-500 truncate">
                              {suggestion.description}
                            </p>
                          )}
                          <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {suggestion.type}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* No results message */}
              {showSuggestions && !loadingSuggestions && suggestions.length === 0 && searchInput.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                  <p className="text-gray-500 text-sm text-center">
                    No suggestions found. Try a different search term.
                  </p>
                </div>
              )}
            </div>
            
            {/* Selected Areas */}
            {filters.areas && (
              <div className="flex flex-wrap gap-2 mt-3">
                {filters.areas.split(',').map(area => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <MapPin className="w-3 h-3" />
                    {area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    <button
                      onClick={() => removeArea(area)}
                      className="hover:text-blue-900 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              Start typing to see address and neighborhood suggestions from StreetEasy
            </p>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min Price
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
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
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                placeholder="No max"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Beds and Baths */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min Beds
              </label>
              <select
                value={filters.minBeds}
                onChange={(e) => setFilters(prev => ({ ...prev, minBeds: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Beds
              </label>
              <select
                value={filters.maxBeds}
                onChange={(e) => setFilters(prev => ({ ...prev, maxBeds: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min Baths
              </label>
              <select
                value={filters.minBaths}
                onChange={(e) => setFilters(prev => ({ ...prev, minBaths: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </div>
          </div>

          {/* Property Types */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Property Types
            </label>
            <div className="flex flex-wrap gap-3">
              {PROPERTY_TYPES.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.propertyTypes.includes(type)}
                    onChange={() => togglePropertyType(type)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES.map(amenity => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Filters for Sales */}
          {filters.propertyStatus.includes('sales') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Monthly HOA
                </label>
                <input
                  type="number"
                  value={filters.maxMonthlyHOA}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxMonthlyHOA: e.target.value }))}
                  placeholder="No max"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Monthly Tax
                </label>
                <input
                  type="number"
                  value={filters.maxMonthlyTax}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxMonthlyTax: e.target.value }))}
                  placeholder="No max"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* No Fee Filter for Rentals */}
          {filters.propertyStatus.includes('rentals') && (
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.noFee}
                  onChange={(e) => setFilters(prev => ({ ...prev, noFee: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-semibold">No Fee Only</span>
              </label>
            </div>
          )}

          {/* Results Per Page and Sort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Results Per Page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[20, 50, 100, 200, 500].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSearch}
              disabled={loading || !filters.areas}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Search className="w-5 h-5" />
              Search Properties
            </button>
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
              Clear Filters
            </button>
            <button
              onClick={saveSearch}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Search
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <>
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <div className="text-gray-700">
                Showing <span className="font-semibold">{startResult}-{endResult}</span> of{' '}
                <span className="font-semibold">{totalCount}</span> properties
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MapIcon className="w-5 h-5" />
                  {showMap ? 'List View' : 'Map View'}
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {results.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
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
        {!loading && results.length === 0 && filters.areas && !error && (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Property Card Component
function PropertyCard({ property }: { property: PropertyDetails }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasImage = property.images && property.images.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Property Image */}
      <div className="relative h-64 bg-gray-200 overflow-hidden group">
        {hasImage ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}
            <Image
              src={property.images[0]}
              alt={property.address}
              width={400}
              height={300}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${
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
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-2xl font-bold">
            {property.price ? formatPrice(property.price) : 'Price not available'}
          </p>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {property.status}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {property.address}
        </h3>
        
        <div className="flex items-center gap-4 text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span className="text-sm">{property.bathrooms} bath</span>
          </div>
          {property.sqft > 0 && (
            <div className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span className="text-sm">{property.sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{property.propertyType}</span>
          <Link
            href={`/streeteasy/property/${property.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(price);
}

