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
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter city, state, or ZIP"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-8 sm:pl-9 md:pl-10 pr-8 sm:pr-9 md:pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow transition-colors text-xs sm:text-sm md:text-base"
            disabled={loading}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" />
            </button>
          )}
          <Search
            size={16}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none sm:w-[18px] sm:h-[18px] md:w-5 md:h-5"
          />
        </div>
        <select
          value={statusType}
          onChange={(e) => setStatusType(e.target.value as 'ForSale' | 'ForRent')}
          className="px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-accent-yellow transition-colors text-xs sm:text-sm md:text-base"
          disabled={loading}
        >
          <option value="ForSale">For Sale</option>
          <option value="ForRent">For Rent</option>
        </select>
        <button
          type="submit"
          disabled={loading || !searchQuery.trim()}
          className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-accent-yellow text-primary-black rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 border-b-2 border-primary-black"></div>
              <span className="hidden sm:inline">Searching...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <Search size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" />
              <span className="hidden sm:inline">Search</span>
              <span className="sm:hidden">Go</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

