'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (location: string, statusType: 'ForSale' | 'ForRent') => void;
  loading?: boolean;
}

export default function SearchBar({ onSearch, loading = false }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusType, setStatusType] = useState<'ForSale' | 'ForRent'>('ForSale');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), statusType);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter city, state, or ZIP (e.g., Miami, FL)"
            className="w-full px-3 md:px-4 py-2.5 md:py-3 pl-9 md:pl-10 pr-9 md:pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow transition-colors text-sm md:text-base"
            disabled={loading}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} className="md:w-5 md:h-5" />
            </button>
          )}
          <Search
            size={18}
            className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none md:w-5 md:h-5"
          />
        </div>
        <select
          value={statusType}
          onChange={(e) => setStatusType(e.target.value as 'ForSale' | 'ForRent')}
          className="px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow transition-colors text-sm md:text-base"
          disabled={loading}
        >
          <option value="ForSale">For Sale</option>
          <option value="ForRent">For Rent</option>
        </select>
        <button
          type="submit"
          disabled={loading || !searchQuery.trim()}
          className="px-6 md:px-8 py-2.5 md:py-3 bg-accent-yellow text-primary-black rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-primary-black"></div>
              <span className="hidden sm:inline">Searching...</span>
            </>
          ) : (
            <>
              <Search size={18} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">Search</span>
              <span className="sm:hidden">Go</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

