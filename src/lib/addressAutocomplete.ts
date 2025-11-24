/**
 * Address Autocomplete Utility
 * Uses Google Places Autocomplete API for address suggestions
 * Falls back to local property data if API is not available
 */

export interface AddressSuggestion {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  coordinates?: { lat: number; lng: number };
}

/**
 * Get address suggestions from Google Places Autocomplete
 * Note: Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env
 */
export async function getAddressSuggestions(
  query: string,
  apiKey?: string
): Promise<AddressSuggestion[]> {
  if (!query || query.length < 2) return [];

  // Always fetch database suggestions first
  const databaseSuggestions = await getDatabaseAddressSuggestions(query);
  
  // If we have database suggestions, prioritize them
  if (databaseSuggestions.length > 0) {
    // Also try to get Google suggestions if API key is available
    if (apiKey) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            query
          )}&key=${apiKey}&types=address&components=country:us`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'OK' && data.predictions) {
            const googleSuggestions = data.predictions.map((prediction: any, index: number) => ({
              id: prediction.place_id || `place-${index}`,
              address: prediction.structured_formatting?.main_text || prediction.description,
              city: extractCity(prediction.description),
              state: extractState(prediction.description),
              zipCode: extractZipCode(prediction.description),
              fullAddress: prediction.description,
            }));
            // Combine: database first, then Google
            return [...databaseSuggestions, ...googleSuggestions];
          }
        }
      } catch (error) {
        console.error('Error fetching Google suggestions:', error);
      }
    }
    return databaseSuggestions;
  }

  // If no database suggestions, try Google
  if (apiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${apiKey}&types=address&components=country:us`
      );

      if (!response.ok) {
        return getLocalAddressSuggestions(query);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        return data.predictions.map((prediction: any, index: number) => ({
          id: prediction.place_id || `place-${index}`,
          address: prediction.structured_formatting?.main_text || prediction.description,
          city: extractCity(prediction.description),
          state: extractState(prediction.description),
          zipCode: extractZipCode(prediction.description),
          fullAddress: prediction.description,
        }));
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    }
  }

  return getLocalAddressSuggestions(query);
}

/**
 * Get address suggestions from database
 */
async function getDatabaseAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  try {
    const response = await fetch(`/api/properties/autocomplete?q=${encodeURIComponent(query)}&limit=10`);
    const data = await response.json();
    
    if (data.success && data.suggestions) {
      return data.suggestions.map((s: any) => ({
        id: s.id || s.zpid,
        address: s.address,
        city: s.city,
        state: s.state,
        zipCode: s.zipCode || s.zip,
        fullAddress: s.fullAddress || `${s.address}, ${s.city}, ${s.state} ${s.zipCode || ''}`,
        coordinates: s.coordinates,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching database suggestions:', error);
    return [];
  }
}

/**
 * Get address suggestions from local property data
 */
async function getLocalAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const { allProperties } = await import('@/data/sampleProperties');
  const queryLower = query.toLowerCase();

  const matches = allProperties
    .filter(
      (p) =>
        p.address.toLowerCase().includes(queryLower) ||
        p.city.toLowerCase().includes(queryLower) ||
        p.state.toLowerCase().includes(queryLower) ||
        p.zipCode.includes(query) ||
        `${p.address} ${p.city} ${p.state} ${p.zipCode}`.toLowerCase().includes(queryLower)
    )
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      address: p.address,
      city: p.city,
      state: p.state,
      zipCode: p.zipCode,
      fullAddress: `${p.address}, ${p.city}, ${p.state} ${p.zipCode}`,
      coordinates: p.coordinates,
    }));

  return matches;
}

/**
 * Get place details including coordinates
 */
export async function getPlaceDetails(
  placeId: string,
  apiKey?: string
): Promise<{ lat: number; lng: number; address: string } | null> {
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=geometry,formatted_address`
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const location = data.result.geometry?.location;
      return {
        lat: location?.lat || 0,
        lng: location?.lng || 0,
        address: data.result.formatted_address || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

function extractCity(description: string): string {
  const parts = description.split(',');
  return parts.length > 1 ? parts[parts.length - 2]?.trim() || '' : '';
}

function extractState(description: string): string {
  const parts = description.split(',');
  const lastPart = parts[parts.length - 1]?.trim() || '';
  const stateMatch = lastPart.match(/([A-Z]{2})\s*\d{5}/);
  return stateMatch ? stateMatch[1] : '';
}

function extractZipCode(description: string): string {
  const zipMatch = description.match(/\b\d{5}(-\d{4})?\b/);
  return zipMatch ? zipMatch[0] : '';
}

