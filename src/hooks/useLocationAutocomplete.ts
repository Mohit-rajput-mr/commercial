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
        if (!res.ok) throw new Error(`API error (${res.status})`);
        const data = await res.json();
        setSuggestions(Array.isArray(data.autocomplete) ? data.autocomplete : (data.data?.results ?? []));
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


