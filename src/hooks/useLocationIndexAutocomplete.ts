'use client';

import { useState, useEffect, useMemo } from 'react';

export interface LocationIndexSuggestion {
  type: 'state' | 'city' | 'postal_code' | 'address';
  name: string;
  state?: string;
  stateCode?: string;
  city?: string;
  postalCode?: string;
  zip?: string;
  address?: string;
  propertyId?: string;
  displayText: string;
  fullAddress: string;
  highlightedText?: string;
}

interface LocationIndexData {
  states: string[];
  cities: Array<{
    name: string;
    state: string;
    stateCode: string;
  }>;
  neighborhoods: any[];
  counties: any[];
  postalCodes: Array<{
    postalCode: string;
    city: string;
    state: string;
    stateCode: string;
  }>;
  addresses: Array<{
    address: string;
    city: string;
    state: string;
    stateCode: string;
    zip: string;
    propertyId: string;
  }>;
}

// Cache for location index data
let locationIndexCache: LocationIndexData | null = null;
let locationIndexPromise: Promise<LocationIndexData> | null = null;

/**
 * Load location index data from JSON file
 */
async function loadLocationIndex(): Promise<LocationIndexData> {
  if (locationIndexCache) {
    return locationIndexCache;
  }

  if (locationIndexPromise) {
    return locationIndexPromise;
  }

  locationIndexPromise = fetch('/location-index.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load location index: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then((data: LocationIndexData) => {
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid location index data structure');
      }
      
      // Log data stats for debugging
      console.log('✅ Location index loaded:', {
        states: data.states?.length || 0,
        cities: data.cities?.length || 0,
        postalCodes: data.postalCodes?.length || 0,
        addresses: data.addresses?.length || 0,
      });
      
      locationIndexCache = data;
      return data;
    })
    .catch((error) => {
      console.warn('⚠️ Location index file not found or empty. Please ensure location-index.json exists in the public folder.');
      console.error('Error loading location index:', error);
      locationIndexPromise = null;
      // Return empty structure on error
      return {
        states: [],
        cities: [],
        neighborhoods: [],
        counties: [],
        postalCodes: [],
        addresses: [],
      };
    });

  return locationIndexPromise;
}

/**
 * Get state name from state code
 */
function getStateName(stateCode: string): string {
  const stateMap: Record<string, string> = {
    'AR': 'Arkansas',
    'AZ': 'Arizona',
    'CA': 'California',
    'CO': 'Colorado',
    'FL': 'Florida',
    'GA': 'Georgia',
    'HI': 'Hawaii',
    'IL': 'Illinois',
    'MA': 'Massachusetts',
    'MD': 'Maryland',
    'MI': 'Michigan',
    'MO': 'Missouri',
    'NC': 'North Carolina',
    'NJ': 'New Jersey',
    'NV': 'Nevada',
    'NY': 'New York',
    'OH': 'Ohio',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'TN': 'Tennessee',
    'TX': 'Texas',
  };
  return stateMap[stateCode] || stateCode;
}

/**
 * Highlight matching text in suggestion
 */
function highlightText(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Search location index and return suggestions
 */
function searchLocationIndex(
  data: LocationIndexData,
  query: string,
  limit: number = 20
): LocationIndexSuggestion[] {
  if (!query || query.length < 1) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
  const results: Array<{ suggestion: LocationIndexSuggestion; score: number }> = [];

  // Helper function to calculate match score
  const calculateScore = (text: string, query: string): number => {
    const textLower = text.toLowerCase();
    if (textLower === query) return 1000; // Exact match
    if (textLower.startsWith(query)) return 500; // Starts with
    if (textLower.includes(query)) return 100; // Contains
    // Multi-word matching
    const textWords = textLower.split(/\s+/);
    let wordMatches = 0;
    queryWords.forEach(qw => {
      if (textWords.some(tw => tw.startsWith(qw))) wordMatches += 50;
      else if (textWords.some(tw => tw.includes(qw))) wordMatches += 20;
    });
    return wordMatches;
  };

  // Search states - prioritize exact matches
  if (data.states && data.states.length > 0) {
    data.states.forEach((stateCode) => {
      const stateName = getStateName(stateCode);
      const stateNameLower = stateName.toLowerCase();
      const stateCodeLower = stateCode.toLowerCase();

      if (stateNameLower.includes(queryLower) || stateCodeLower.includes(queryLower)) {
        const score = calculateScore(stateName, queryLower) + (stateNameLower.startsWith(queryLower) ? 200 : 0);
        results.push({
          suggestion: {
            type: 'state',
            name: stateName,
            state: stateName,
            stateCode: stateCode,
            displayText: stateName,
            fullAddress: stateName,
            highlightedText: highlightText(stateName, query),
          },
          score,
        });
      }
    });
  }

  // Search cities - prioritize matches
  if (data.cities && data.cities.length > 0) {
    data.cities.forEach((city) => {
      const cityNameLower = city.name.toLowerCase();
      const cityStateLower = `${city.name}, ${city.stateCode}`.toLowerCase();
      const cityFullLower = `${city.name}, ${city.state}`.toLowerCase();

      if (
        cityNameLower.includes(queryLower) ||
        cityStateLower.includes(queryLower) ||
        cityFullLower.includes(queryLower)
      ) {
        const displayText = `${city.name}, ${city.stateCode}`;
        const score = calculateScore(city.name, queryLower) + 
                     (cityNameLower.startsWith(queryLower) ? 300 : 0) +
                     80; // City priority bonus
        results.push({
          suggestion: {
            type: 'city',
            name: city.name,
            city: city.name,
            state: city.state,
            stateCode: city.stateCode,
            displayText,
            fullAddress: `${city.name}, ${city.stateCode}`,
            highlightedText: highlightText(displayText, query),
          },
          score,
        });
      }
    });
  }

  // Search postal codes
  if (data.postalCodes && data.postalCodes.length > 0) {
    data.postalCodes.forEach((postal) => {
      const postalLower = postal.postalCode.toLowerCase();
      const cityLower = postal.city.toLowerCase();
      const combinedLower = `${postal.postalCode} ${postal.city}`.toLowerCase();

      if (
        postalLower.includes(queryLower) ||
        cityLower.includes(queryLower) ||
        combinedLower.includes(queryLower)
      ) {
        const displayText = `${postal.postalCode} - ${postal.city}, ${postal.stateCode}`;
        const score = calculateScore(postal.postalCode + ' ' + postal.city, queryLower) + 60;
        results.push({
          suggestion: {
            type: 'postal_code',
            name: postal.postalCode,
            postalCode: postal.postalCode,
            city: postal.city,
            state: postal.state,
            stateCode: postal.stateCode,
            displayText,
            fullAddress: `${postal.city}, ${postal.stateCode} ${postal.postalCode}`,
            highlightedText: highlightText(displayText, query),
          },
          score,
        });
      }
    });
  }

  // Search addresses (limit to prevent too many results)
  if (data.addresses && data.addresses.length > 0) {
    const addressMatches = data.addresses.filter((addr) => {
      const addressLower = addr.address.toLowerCase();
      const cityLower = addr.city.toLowerCase();
      const zipLower = addr.zip.toLowerCase();
      const combinedLower = `${addr.address} ${addr.city} ${addr.zip}`.toLowerCase();

      return (
        addressLower.includes(queryLower) ||
        cityLower.includes(queryLower) ||
        zipLower.includes(queryLower) ||
        combinedLower.includes(queryLower)
      );
    });

    // Limit address results and add with scoring
    addressMatches.slice(0, 10).forEach((addr) => {
      const displayText = `${addr.address}, ${addr.city}, ${addr.stateCode}`;
      const score = calculateScore(addr.address + ' ' + addr.city, queryLower) + 40;
      results.push({
        suggestion: {
          type: 'address',
          name: addr.address,
          address: addr.address,
          city: addr.city,
          state: addr.state,
          stateCode: addr.stateCode,
          zip: addr.zip,
          propertyId: addr.propertyId,
          displayText,
          fullAddress: `${addr.address}, ${addr.city}, ${addr.stateCode} ${addr.zip}`,
          highlightedText: highlightText(displayText, query),
        },
        score,
      });
    });
  }

  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score);

  // Remove duplicates based on displayText
  const seen = new Set<string>();
  const uniqueResults = results
    .map((item) => item.suggestion)
    .filter((result) => {
      const key = result.displayText.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return uniqueResults.slice(0, limit);
}

/**
 * Get recent searches from localStorage
 */
function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('recent_location_searches');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save recent search to localStorage
 */
function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSearches();
    const updated = [query, ...recent.filter((q) => q !== query)].slice(0, 10);
    localStorage.setItem('recent_location_searches', JSON.stringify(updated));
  } catch {
    // Ignore errors
  }
}

/**
 * Hook for location index autocomplete
 */
export function useLocationIndexAutocomplete(query: string) {
  const [suggestions, setSuggestions] = useState<LocationIndexSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [indexData, setIndexData] = useState<LocationIndexData | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load index data on mount
  useEffect(() => {
    let mounted = true;

    loadLocationIndex().then((data) => {
      if (mounted) {
        setIndexData(data);
        // Check if data is actually loaded (not empty)
        const hasData = (data.states && data.states.length > 0) || 
                       (data.cities && data.cities.length > 0) ||
                       (data.postalCodes && data.postalCodes.length > 0) ||
                       (data.addresses && data.addresses.length > 0);
        setIsDataLoaded(hasData);
        
        if (!hasData) {
          console.warn('⚠️ Location index data is empty. Please ensure location-index.json is saved in the public folder.');
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Search when query changes
  useEffect(() => {
    if (!indexData) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    if (!query || query.length < 1) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Debounce search
    const timer = setTimeout(() => {
      const results = searchLocationIndex(indexData, query, 20);
      setSuggestions(results);
      setLoading(false);
    }, 100); // Reduced debounce for faster response

    return () => clearTimeout(timer);
  }, [query, indexData]);

  const recentSearches = useMemo(() => getRecentSearches(), []);

  return {
    suggestions,
    loading,
    recentSearches,
    saveRecentSearch,
    isDataLoaded,
  };
}
