import { useEffect, useRef, useState } from 'react';

// --- Types for Location Suggestions per API Spec ---
export type LocationAreaType =
  | 'city'
  | 'neighborhood'
  | 'school'
  | 'postal_code'
  | 'address'
  | 'county';

export interface LocationSuggestion {
  area_type: LocationAreaType;
  city?: string;
  state_code?: string;
  postal_code?: string;
  name?: string;
  full_address?: string;
  slug_id: string;
  county?: string;
}

interface UseLocationAutocomplete {
  suggestions: LocationSuggestion[];
  loading: boolean;
  error: string | null;
  fetchCount: number;
}

const API_URL = 'https://realty-in-us.p.rapidapi.com/locations/v2/auto-complete';
const RAPID_KEY = 'faf657766emsha74fedf2f6947fdp14c2b1jsn61fd3e532c38';
const RAPID_HOST = 'realty-in-us.p.rapidapi.com';

export function useLocationAutocomplete(input: string) : UseLocationAutocomplete {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const abortRef = useRef<AbortController|null>(null);

  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    setFetchCount((c) => c + 1);
    if (abortRef.current) abortRef.current.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;
    const timer = setTimeout(async () => {
      try {
        // First, try to get database suggestions
        let databaseSuggestions: LocationSuggestion[] = [];
        try {
          const dbRes = await fetch(
            `/api/properties/autocomplete?q=${encodeURIComponent(input)}&limit=5`,
            { signal: abortController.signal }
          );
          if (dbRes.ok) {
            const dbData = await dbRes.json();
            if (dbData.success && dbData.suggestions) {
              databaseSuggestions = dbData.suggestions.map((s: any) => ({
                area_type: 'address' as LocationAreaType,
                city: s.city,
                state_code: s.state,
                postal_code: s.zipCode,
                name: s.address,
                full_address: s.fullAddress,
                slug_id: s.id || s.zpid,
              }));
            }
          }
        } catch (dbErr) {
          // Ignore database errors, continue with API
        }

        // Then try external API
        let apiSuggestions: LocationSuggestion[] = [];
        try {
          const res = await fetch(
            `${API_URL}?input=${encodeURIComponent(input)}`,
            {
              method: 'GET',
              headers: {
                'x-rapidapi-key': RAPID_KEY,
                'x-rapidapi-host': RAPID_HOST,
              },
              signal: abortController.signal,
            }
          );
          if (res.ok) {
            const data = await res.json();
            apiSuggestions = Array.isArray(data.autocomplete) ? data.autocomplete : (data.data?.results ?? []);
          }
        } catch (apiErr: any) {
          if (apiErr.name !== 'AbortError') {
            console.error('API error:', apiErr);
          }
        }

        // Combine: database first, then API
        setSuggestions([...databaseSuggestions, ...apiSuggestions]);
        setError(null);
      } catch (err:any) {
        if (err.name === 'AbortError') return;
        setError('Failed loading suggestions');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [input]);

  return { suggestions, loading, error, fetchCount };
}







