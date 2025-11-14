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

  // If no API key, use local property data
  if (!apiKey) {
    return getLocalAddressSuggestions(query);
  }

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

    return getLocalAddressSuggestions(query);
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return getLocalAddressSuggestions(query);
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

