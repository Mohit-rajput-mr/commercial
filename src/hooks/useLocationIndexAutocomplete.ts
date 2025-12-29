'use client';

import { useState, useEffect, useMemo } from 'react';

export interface LocationIndexSuggestion {
  type: 'state' | 'city' | 'neighborhood' | 'postal_code' | 'address';
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
  neighborhoods: Array<{
    name: string;
    city: string;
    state: string;
    stateCode: string;
  }>;
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
        neighborhoods: data.neighborhoods?.length || 0,
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
  const calculateScore = (text: string, query: string, isCity: boolean = false): number => {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact match - highest priority, especially for cities
    if (textLower === queryLower) {
      return isCity ? 10000 : 5000; // Cities get much higher priority
    }
    
    // Starts with - high priority
    if (textLower.startsWith(queryLower)) {
      return isCity ? 5000 : 2500; // Cities get higher priority
    }
    
    // Contains - medium priority
    if (textLower.includes(queryLower)) {
      return isCity ? 2000 : 500; // Cities get higher priority
    }
    
    // Multi-word matching
    const textWords = textLower.split(/\s+/);
    let wordMatches = 0;
    queryWords.forEach(qw => {
      if (textWords.some(tw => tw.startsWith(qw))) wordMatches += isCity ? 200 : 50;
      else if (textWords.some(tw => tw.includes(qw))) wordMatches += isCity ? 100 : 20;
    });
    return wordMatches;
  };

  // Search states - prioritize exact matches (but lower than cities)
  if (data.states && data.states.length > 0) {
    data.states.forEach((stateCode) => {
      const stateName = getStateName(stateCode);
      const stateNameLower = stateName.toLowerCase();
      const stateCodeLower = stateCode.toLowerCase();

      if (stateNameLower.includes(queryLower) || stateCodeLower.includes(queryLower)) {
        let score = calculateScore(stateName, queryLower, false);
        if (stateNameLower.startsWith(queryLower) || stateCodeLower.startsWith(queryLower)) {
          score += 1000;
        }
        // States should rank below cities but above addresses/postal codes
        score += 3000; // Base state priority
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

  // Search neighborhoods FIRST - prioritize exact matches to appear at top
  if (data.neighborhoods && data.neighborhoods.length > 0) {
    data.neighborhoods.forEach((neighborhood) => {
      const neighborhoodNameLower = neighborhood.name.toLowerCase();
      const cityLower = neighborhood.city.toLowerCase();
      const combinedLower = `${neighborhood.name} ${neighborhood.city}`.toLowerCase();
      const fullLower = `${neighborhood.name}, ${neighborhood.city}, ${neighborhood.stateCode}`.toLowerCase();

      // Match if neighborhood name contains the query (most flexible)
      const matchesNeighborhoodName = neighborhoodNameLower.includes(queryLower);
      const matchesCombined = combinedLower.includes(queryLower);
      const matchesFull = fullLower.includes(queryLower);
      
      // Include if neighborhood name matches (prioritize neighborhood name matches)
      if (matchesNeighborhoodName || matchesCombined || matchesFull) {
        // Display just the neighborhood name
        const displayText = neighborhood.name;
        
        // Calculate score with very high priority for neighborhoods
        let score = calculateScore(neighborhood.name, queryLower, true);
        
        // Massive bonuses for exact neighborhood matches - should beat everything
        if (neighborhoodNameLower === queryLower) {
          score += 25000; // Very high bonus for exact neighborhood name match
        } else if (neighborhoodNameLower.startsWith(queryLower)) {
          score += 15000; // High bonus for neighborhood name starting with query
        } else if (fullLower === queryLower) {
          score += 20000; // High bonus for exact "Neighborhood, City, State" match
        } else if (combinedLower.startsWith(queryLower)) {
          score += 12000; // Bonus for "Neighborhood City" starting with query
        } else if (matchesNeighborhoodName) {
          score += 10000; // Bonus for neighborhood name containing query
        }
        
        // Very high base priority for neighborhoods
        score += 20000; // High base neighborhood priority
        
        results.push({
          suggestion: {
            type: 'neighborhood',
            name: neighborhood.name,
            city: neighborhood.city,
            state: neighborhood.state,
            stateCode: neighborhood.stateCode,
            displayText: neighborhood.name, // Just show neighborhood name
            fullAddress: `${neighborhood.city}, ${neighborhood.stateCode}`, // City, State only
            highlightedText: highlightText(neighborhood.name, query),
          },
          score,
        });
      }
    });
  }

  // Search cities - prioritize exact matches and ensure they appear first
  if (data.cities && data.cities.length > 0) {
    data.cities.forEach((city) => {
      const cityNameLower = city.name.toLowerCase();
      const cityStateLower = `${city.name}, ${city.stateCode}`.toLowerCase();
      const cityFullLower = `${city.name}, ${city.state}`.toLowerCase();
      const cityWithStateLower = `${city.name} ${city.stateCode}`.toLowerCase();
      const cityWithStateNameLower = `${city.name} ${city.state}`.toLowerCase();

      // Check if query matches city name (exact or partial)
      const matchesCityName = cityNameLower === queryLower || 
                             cityNameLower.startsWith(queryLower) ||
                             cityNameLower.includes(queryLower) ||
                             cityStateLower.includes(queryLower) ||
                             cityFullLower.includes(queryLower) ||
                             cityWithStateLower.includes(queryLower) ||
                             cityWithStateNameLower.includes(queryLower);

      if (matchesCityName) {
        const displayText = `${city.name}, ${city.stateCode}`;
        
        // Calculate base score with city priority
        let score = calculateScore(city.name, queryLower, true);
        
        // Additional bonuses for exact matches
        if (cityNameLower === queryLower) {
          score += 5000; // Massive bonus for exact city name match
        } else if (cityNameLower.startsWith(queryLower)) {
          score += 2000; // High bonus for city name starting with query
        } else if (cityStateLower === queryLower || cityFullLower === queryLower) {
          score += 4000; // High bonus for exact "City, State" match
        } else if (cityStateLower.startsWith(queryLower) || cityFullLower.startsWith(queryLower)) {
          score += 1500; // Bonus for "City, State" starting with query
        }
        
        // Ensure cities always have higher base score than other types
        score += 10000; // Base city priority boost
        
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

  // Skip postal codes and addresses - only search states, neighborhoods, and cities

  // Sort by score (descending), with type-based secondary sort to prioritize cities
  results.sort((a, b) => {
    // First sort by score
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // If scores are equal, prioritize by type: neighborhood > city > state > postal_code > address
    const typePriority: Record<string, number> = {
      'neighborhood': 5,
      'city': 4,
      'state': 3,
      'postal_code': 2,
      'address': 1,
    };
    const aPriority = typePriority[a.suggestion.type] || 0;
    const bPriority = typePriority[b.suggestion.type] || 0;
    return bPriority - aPriority;
  });

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
                       (data.neighborhoods && data.neighborhoods.length > 0) ||
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
