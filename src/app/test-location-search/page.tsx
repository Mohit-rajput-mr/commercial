'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, Clock, GraduationCap, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useLocationIndexAutocomplete, LocationIndexSuggestion } from '@/hooks/useLocationIndexAutocomplete';

export default function TestLocationSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const { suggestions, loading: suggestionsLoading, recentSearches, saveRecentSearch, isDataLoaded } = useLocationIndexAutocomplete(searchQuery);

  // Auto-open dropdown when suggestions are available or showing recent searches
  useEffect(() => {
    console.log('Dropdown state check:', {
      searchQuery,
      queryLength: searchQuery.length,
      suggestionsCount: suggestions.length,
      loading: suggestionsLoading,
      recentSearchesCount: recentSearches.length,
    });

    if (searchQuery.length >= 1) {
      if (suggestions.length > 0 && !suggestionsLoading) {
        setDropdownOpen(true);
        setShowRecentSearches(false);
      } else if (suggestionsLoading) {
        setDropdownOpen(true);
        setShowRecentSearches(false);
      } else if (suggestions.length === 0 && !suggestionsLoading) {
        setDropdownOpen(true); // Keep open to show "no results" message
        setShowRecentSearches(false);
      }
    } else if (searchQuery.length === 0 && recentSearches.length > 0) {
      setDropdownOpen(true);
      setShowRecentSearches(true);
    } else if (searchQuery.length === 0) {
      setDropdownOpen(false);
    }
  }, [suggestions.length, searchQuery.length, suggestionsLoading, recentSearches.length, searchQuery]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionItemRefs.current[selectedIndex]) {
      suggestionItemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleSelectSuggestion = (suggestion: LocationIndexSuggestion) => {
    const location = suggestion.fullAddress || suggestion.displayText;
    setSearchQuery(location);
    saveRecentSearch(location);
    setDropdownOpen(false);
    setSelectedIndex(-1);
    setShowRecentSearches(false);
  };

  const handleSelectRecentSearch = (recentQuery: string) => {
    setSearchQuery(recentQuery);
    saveRecentSearch(recentQuery);
    setDropdownOpen(false);
    setSelectedIndex(-1);
    setShowRecentSearches(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const maxIndex = showRecentSearches ? recentSearches.length - 1 : suggestions.length - 1;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (showRecentSearches && selectedIndex >= 0 && selectedIndex < recentSearches.length) {
        handleSelectRecentSearch(recentSearches[selectedIndex]);
      } else if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDropdownOpen(true);
      setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
      setSelectedIndex(-1);
      setShowRecentSearches(false);
      inputRef.current?.blur();
    } else if (e.key === 'Tab') {
      setDropdownOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      {/* Navbar Spacer */}
      <div className="h-[68px] w-full"></div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Location Search Test</h1>
          <p className="text-gray-600">
            Test the location autocomplete functionality using location-index.json
          </p>
          {!isDataLoaded && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Warning:</strong> Location index data not loaded. Please ensure <code className="bg-yellow-100 px-1 rounded">location-index.json</code> exists in the <code className="bg-yellow-100 px-1 rounded">public</code> folder and is not empty.
              </p>
            </div>
          )}
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search Location
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              className="w-full px-4 py-3 pl-10 pr-10 border-2 border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-accent-yellow focus:ring-2 focus:ring-accent-yellow/20 transition-all"
              placeholder="Enter a location (City, State, ZIP, or Address)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              onFocus={() => {
                if (searchQuery.length >= 1 && suggestions.length > 0) {
                  setDropdownOpen(true);
                } else if (searchQuery.length === 0 && recentSearches.length > 0) {
                  setDropdownOpen(true);
                  setShowRecentSearches(true);
                }
              }}
              onKeyDown={handleKeyPress}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDropdownOpen(false);
                  setSelectedIndex(-1);
                  inputRef.current?.focus();
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                <X size={18} />
              </button>
            )}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {suggestionsLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-yellow"></div>
              ) : (
                <Search size={20} />
              )}
            </span>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  ref={dropdownRef}
                  className="absolute z-[9999] w-full mt-2 bg-white rounded-lg shadow-2xl border-2 border-gray-200 max-h-96 overflow-y-auto"
                  style={{ top: '100%', left: 0 }}
                >
                  {/* Recent Searches */}
                  {showRecentSearches && recentSearches.length > 0 && searchQuery.length === 0 && (
                    <>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recent Searches</p>
                          <button
                            onClick={() => {
                              localStorage.removeItem('recent_location_searches');
                              setDropdownOpen(false);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      {recentSearches.map((recent, index) => (
                        <button
                          key={`recent-${index}`}
                          type="button"
                          ref={(el) => { suggestionItemRefs.current[index] = el; }}
                          onClick={() => handleSelectRecentSearch(recent)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                            selectedIndex === index ? 'bg-accent-yellow/20' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{recent}</p>
                              <p className="text-xs text-gray-500">Recent search</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {/* Suggestions */}
                  {!showRecentSearches && suggestionsLoading && (
                    <div className="px-4 py-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-accent-yellow"></div>
                      <p className="text-sm text-gray-500 mt-2">Searching locations...</p>
                    </div>
                  )}

                  {!showRecentSearches && !suggestionsLoading && suggestions.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          {suggestions.length} {suggestions.length === 1 ? 'Location' : 'Locations'} Found
                        </p>
                      </div>
                      {suggestions.map((suggestion, index) => {
                        const IconComp = suggestion.type === 'postal_code' ? GraduationCap : MapPin;
                        const iconColor = suggestion.type === 'postal_code' ? 'text-blue-500' : 'text-accent-yellow';
                        const typeLabels: Record<string, string> = {
                          'state': 'State',
                          'city': 'City',
                          'county': 'County',
                          'neighborhood': 'Neighborhood',
                          'postal_code': 'ZIP Code',
                          'address': 'Address',
                        };

                        return (
                          <button
                            key={`${suggestion.type}-${suggestion.displayText}-${index}`}
                            type="button"
                            ref={(el) => { suggestionItemRefs.current[index] = el; }}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                              selectedIndex === index ? 'bg-accent-yellow/20 ring-2 ring-accent-yellow/30' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${iconColor === 'text-blue-500' ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                                <IconComp size={16} className={iconColor} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm font-medium text-gray-900 truncate"
                                  dangerouslySetInnerHTML={{ __html: suggestion.highlightedText || suggestion.displayText }}
                                />
                                <p className="text-xs text-gray-500 mt-0.5">{typeLabels[suggestion.type] || suggestion.type}</p>
                              </div>
                              {selectedIndex === index && (
                                <div className="text-xs text-gray-400">Press Enter</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </>
                  )}

                  {/* Empty State */}
                  {!showRecentSearches && !suggestionsLoading && suggestions.length === 0 && searchQuery.length >= 1 && (
                    <div className="px-4 py-8 text-center">
                      <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">No locations found</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {searchQuery.length < 2 
                          ? 'Type at least 1 character to search' 
                          : 'Try a different search term or check if location-index.json is loaded'}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Selected Result Display - Only show when dropdown is closed and query exists */}
        {searchQuery && !dropdownOpen && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Search</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-base text-gray-900 font-medium">{searchQuery}</p>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Query Length:</span>
              <span className="font-mono text-gray-900">{searchQuery.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Suggestions Count:</span>
              <span className="font-mono text-gray-900">{suggestions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loading:</span>
              <span className="font-mono text-gray-900">{suggestionsLoading ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recent Searches:</span>
              <span className="font-mono text-gray-900">{recentSearches.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dropdown Open:</span>
              <span className="font-mono text-gray-900">{dropdownOpen ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Show Recent Searches:</span>
              <span className="font-mono text-gray-900">{showRecentSearches ? 'Yes' : 'No'}</span>
            </div>
            {suggestions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-600 mb-2 font-semibold">First 5 Suggestions:</p>
                {suggestions.slice(0, 5).map((s, i) => (
                  <div key={i} className="text-xs font-mono text-gray-700 mb-1 p-2 bg-gray-50 rounded">
                    {i + 1}. {s.displayText} <span className="text-gray-500">({s.type})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

